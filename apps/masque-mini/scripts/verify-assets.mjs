import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { parse } from 'svelte/compiler';

const root = resolve(import.meta.dirname, '..');
const publicDirectory = resolve(root, 'public');
const imagePattern = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const references = new Set();
const failures = [];

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

function addReference(value) {
  if (typeof value !== 'string' || !/^\/?(?:assets|images)\//.test(value)) return;
  const path = decodeURIComponent(new URL(value, 'https://assets.local/').pathname).slice(1);
  if (imagePattern.test(path)) references.add(path);
}

const model = ts.createSourceFile('model.ts', await readFile(resolve(root, 'src/model.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
let characters = [];
function findCharacters(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(model) === 'CHARACTERS' && node.initializer) {
    const initializer = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
    if (ts.isArrayLiteralExpression(initializer)) characters = initializer.elements.filter(ts.isStringLiteral).map((element) => element.text);
  }
  ts.forEachChild(node, findCharacters);
}
findCharacters(model);
if (!characters.length) throw new Error('Cannot verify dynamic character paths: CHARACTERS is missing');

function visitTypescript(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) addReference(node.text);
  if (ts.isTemplateExpression(node) && node.templateSpans.length === 1) {
    for (const character of characters) addReference(node.head.text + character + node.templateSpans[0].literal.text);
  }
  ts.forEachChild(node, visitTypescript);
}

function visitSvelte(node, seen = new WeakSet()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);
  if (node.type === 'Literal') addReference(node.value);
  if (node.type === 'Attribute' && node.name === 'src' && Array.isArray(node.value) && node.value.every((part) => part.type === 'Text')) {
    addReference(node.value.map((part) => part.data).join(''));
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 1) {
    for (const character of characters) addReference(node.quasis[0].value.cooked + character + node.quasis[1].value.cooked);
  }
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) child.forEach((value) => visitSvelte(value, seen));
    else visitSvelte(child, seen);
  }
}

for (const path of await files(resolve(root, 'src'))) {
  if (!/\.(ts|svelte)$/.test(path) || path.endsWith('.test.ts')) continue;
  const source = await readFile(path, 'utf8');
  if (path.endsWith('.svelte')) visitSvelte(parse(source, { modern: true }));
  else visitTypescript(ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true));
}
for (const path of references) {
  try {
    if (!(await stat(resolve(publicDirectory, path))).isFile()) throw new Error('Not a file');
  } catch { failures.push(`Missing referenced image: ${path}`); }
}

const images = (await files(publicDirectory)).filter((path) => imagePattern.test(path));
if (process.argv.includes('--built')) {
  await stat(resolve(root, 'dist/index.html'));
  for (const path of images) {
    const asset = relative(publicDirectory, path);
    try {
      const original = createHash('sha256').update(await readFile(path)).digest('hex');
      const built = createHash('sha256').update(await readFile(resolve(root, 'dist', asset))).digest('hex');
      if (original !== built) failures.push(`Changed image in build: ${asset}`);
    } catch { failures.push(`Missing image in build: ${asset}`); }
  }
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Verified ${references.size} referenced image paths and ${characters.length} active characters. ${images.length} public images${process.argv.includes('--built') ? ' match dist byte-for-byte' : ' ready for build'}.`);