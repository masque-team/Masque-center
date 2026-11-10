<script lang="ts">
  import type { Character } from './model';
  import { characterBackground, characterImage } from './catalog';
  let { character, full = false, pale = false, backdrop = false }: { character: Character; full?: boolean; pale?: boolean; backdrop?: boolean } = $props();
</script>

<div class="stage" class:full class:pale class:backdrop aria-hidden="true">
  <img class="stage-art" src={characterBackground(character)} alt="" width="1080" height="1920" />
  {#if !pale}<div class="ring-sweep"></div>{/if}
  <img class="actor" src={characterImage(character)} alt="" />
</div>

<style>
  .stage { position: relative; height: 274px; overflow: hidden; background: #070b25; }
  .stage-art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
  .ring-sweep { position: absolute; inset: 13% 8% 43%; border-radius: 50%; pointer-events: none; opacity: .95; mix-blend-mode: screen; mask-image: radial-gradient(closest-side, transparent calc(100% - 7px), #000 calc(100% - 5px), #000 calc(100% - 1px), transparent 100%); }
  .ring-sweep::before { position: absolute; inset: -55%; content: ''; background: conic-gradient(transparent 0deg 260deg, #a866ff 295deg, #29eaff 325deg, #ffffff 342deg, transparent 355deg); animation: ring-trace 3s linear infinite; }
  .actor { position: absolute; top: 66px; left: 50%; width: 76%; height: 332px; transform: translateX(-50%); object-fit: contain; object-position: center top; filter: drop-shadow(0 8px 10px #00000040); }
  .backdrop { position: absolute; top: 0; left: 0; width: 100%; height: calc(100dvh - 72px); min-height: 450px; }
  .backdrop .actor { top: 76px; height: 520px; max-height: calc(100% - 100px); width: 80%; }
  .full { height: min(76dvh, 660px); min-height: 400px; }
  .full .actor { top: 82px; height: calc(80% - 82px); object-position: center bottom; }
  .full:not(.pale) .ring-sweep { left: 3%; right: 3%; }
  .pale .actor { top: 5%; height: 75%; width: 82%; object-position: center bottom; }
  @keyframes ring-trace { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .ring-sweep { display: none; } .ring-sweep::before { animation: none; } }
</style>