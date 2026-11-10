<script lang="ts">
  import { Crown, Rocket, Sparkles, Ticket } from '@lucide/svelte';
  import { PASS_ARTWORK } from '../data/config';
  let { kind = 'standard', label = '' }: { kind?: 'standard' | 'boost' | 'crest'; label?: string } = $props();
  let failed = $state(false);
  let source = $derived(PASS_ARTWORK[kind]);
  let boosted = $derived(kind === 'boost');
</script>

<span class="relative isolate block h-full w-full" aria-hidden={!label}>
  {#if source && !failed}
    <img class="h-full w-full object-contain" src={source} alt={label} onerror={() => { failed = true; }} />
  {:else}
    <span class="absolute inset-0 overflow-hidden">
      <img class={['absolute inset-0 h-full w-full object-contain', kind === 'crest' ? 'scale-150 opacity-80' : 'scale-110']} src={`assets/wings/${boosted || kind === 'crest' ? 'sunrise-seraph' : 'sky-feather'}.png`} alt="" />
      {#if kind === 'crest'}
        <span class="absolute top-1/2 left-1/2 grid aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rotate-12 place-items-center rounded-lg border-2 border-[#fff5bf] bg-[#ffc84d] text-[#9b5b13] shadow-[0_3px_0_#cf8c2b,0_6px_12px_#97723b30]"><Crown class="size-[62%] -rotate-12" strokeWidth={2.2} /></span>
      {:else}
        <span class={['absolute top-1/2 left-1/2 grid h-[56%] w-[47%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border-2 border-white shadow-[0_4px_0_#426ba855,0_8px_14px_#426ba833]', boosted ? '-rotate-12 bg-[#ffce69] text-[#b36519]' : 'rotate-12 bg-[#91def5] text-[#2b80ad]']}><Ticket class="absolute size-[83%] opacity-20" strokeWidth={1} />{#if boosted}<Rocket class="relative size-[51%]" strokeWidth={2} />{:else}<Crown class="relative size-[51%]" strokeWidth={2} />{/if}</span>
      {/if}
      <Sparkles class="absolute top-[14%] right-[12%] size-[13%] text-amber-400" strokeWidth={1.5} />
    </span>
  {/if}
</span>