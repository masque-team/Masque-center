<script lang="ts">
  import type { Character } from './model';
  import { characterBackground, characterImage } from './catalog';
  let { character, full = false, pale = false, backdrop = false }: { character: Character; full?: boolean; pale?: boolean; backdrop?: boolean } = $props();
</script>

<div class="stage" class:full class:pale class:backdrop aria-hidden="true">
  <img class="stage-art" src={characterBackground(character)} alt="" width="1080" height="1920" />
  <img class="actor" src={characterImage(character)} alt="" />
</div>

<style>
  .stage { position: relative; height: 274px; overflow: hidden; background: #070b25; }
  .stage-art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
  .stage:not(.pale) .stage-art { animation: stage-light 5s ease-in-out infinite; }
  .actor { position: absolute; top: 66px; left: 50%; width: 76%; height: 332px; transform: translateX(-50%); object-fit: contain; object-position: center top; filter: drop-shadow(0 8px 10px #00000040); }
  .backdrop { position: absolute; top: 0; left: 0; width: 100%; height: calc(100dvh - 72px); min-height: 450px; }
  .backdrop .actor { top: 76px; height: 520px; max-height: calc(100% - 100px); width: 80%; }
  .full { height: min(76dvh, 660px); min-height: 400px; }
  .full .actor { top: 82px; height: calc(80% - 82px); object-position: center bottom; }
  .pale .actor { top: 5%; height: 75%; width: 82%; object-position: center bottom; }
  @keyframes stage-light { 0%, 100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.12) saturate(1.08); } }
  @media (prefers-reduced-motion: reduce) { .stage:not(.pale) .stage-art { animation: none; } }
</style>