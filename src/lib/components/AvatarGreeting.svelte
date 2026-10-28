<script lang="ts">
  import { onMount } from 'svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import { AVATARS } from '../data/config';

  let { avatarId, displayName }: { avatarId: string; displayName: string } = $props();
  let line = $state(0);
  let avatar = $derived(AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0]);
  const greetings = ['เป็นไงบ้างคะวันนี้?', 'วันนี้อยากเล่นเกมจับคู่กันไหมคะ?', 'พักเติมพลังสักครู่ก็ได้นะคะ', 'อยากลองตู้สุ่ม Avatar หรือ Pet ไหมคะ?', 'วันนี้มาเล่นเกมโปรดกันค่ะ!'];

  onMount(() => {
    const timer = window.setInterval(() => { line = (line + 1) % greetings.length; }, 11_000);
    return () => window.clearInterval(timer);
  });
</script>

<section class="flex min-h-11 items-center gap-2 rounded-lg border border-white bg-white/75 px-2.5 py-1.5 shadow-[0_3px_0_#c7dce5]" aria-label="ข้อความจาก Avatar" aria-live="polite">
  <span class="h-8 w-7 shrink-0"><AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" /></span>
  <span class="min-w-0"><small class="block text-[8px] font-bold text-sky-700">{avatar.name} · ถึง {displayName}</small><span class="block text-[10px] font-semibold text-[#456d80]">{greetings[line]}</span></span>
</section>

<style>
  section { animation: greeting-in 300ms ease-out both; }
  @keyframes greeting-in { from { opacity: 0.6; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { section { animation: none; } }
</style>