export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return { destroy() { node.remove(); } };
}

export function focusDialog(node: HTMLElement, onClose: () => void) {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const elements = () => Array.from(node.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
  )).filter((element) => element.getClientRects().length > 0);
  queueMicrotask(() => { if (node.isConnected) (elements()[0] ?? node).focus(); });
  function trap(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== 'Tab') return;
    const focusable = elements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); node.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  node.addEventListener('keydown', trap);
  return {
    destroy() {
      node.removeEventListener('keydown', trap);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    },
  };
}
