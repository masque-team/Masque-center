<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Snippet } from 'svelte';
  let { title, children, onclose, dismissible = true }: { title: string; children: Snippet; onclose: () => void; dismissible?: boolean } = $props();
  let element: HTMLDialogElement;
  $effect(() => {
    element.showModal();
    return () => { if (element.open) element.close(); };
  });
</script>

<dialog bind:this={element} aria-label={title} class="modal-surface fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-[390px] overflow-y-auto p-6 text-ink" oncancel={(event) => { event.preventDefault(); if (dismissible) onclose(); }} onclose={onclose}>
  {#if dismissible}<button class="icon-button absolute right-3 top-3 z-10" title="ปิด" aria-label="ปิด" onclick={onclose}><X size={20} /></button>{/if}
  {@render children()}
</dialog>

<style>
  dialog::backdrop { background: #1006249c; backdrop-filter: blur(5px); }
  dialog[open] { animation: appear .22s ease-out; }
  @keyframes appear { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>