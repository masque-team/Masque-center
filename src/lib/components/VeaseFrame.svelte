<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ExternalLink, LoaderCircle, RotateCcw } from '@lucide/svelte';
  import { isSceneMessage, packet, trustedSender, type HostMessage, type Outfit, type SceneMode, type SceneState } from '@masque/vease-protocol';

  let { sceneState, mode, onNavigate, onOutfit, onSize }: {
    sceneState: SceneState;
    mode: SceneMode;
    onNavigate: (route: string) => void;
    onOutfit: (outfit: Outfit) => SceneState | null;
    onSize?: (height: number) => void;
  } = $props();
  const source = new URL(import.meta.env.VITE_VEASE_URL || (import.meta.env.DEV ? `${location.protocol}//${location.hostname}:5174/` : `${location.origin}/masque-vease/`), location.href);
  source.searchParams.set('embed', '1');
  source.searchParams.set('parentOrigin', location.origin);
  let frame = $state<HTMLIFrameElement>();
  let ready = $state(false);
  let error = $state('');
  let visible = $state(true);
  let documentVisible = $state(!document.hidden);
  let version = $state(0);
  let pendingWalk: { id: string; destination: string; route?: string } | undefined;
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  let walkTimer: ReturnType<typeof setTimeout> | undefined;
  const handled = new Set<string>();
  const stops: Record<string, string> = { home: 'arcade', detail: 'arcade', shop: 'market', wallet: 'market', avatar: 'atelier', profile: 'atelier', room: 'club', rewards: 'pass', battle: 'studio' };

  function send(message: HostMessage) { frame?.contentWindow?.postMessage(message, source.origin); }
  function initialize() { send(packet('INIT', { state: $state.snapshot(sceneState), mode })); }
  function cancelPending() { clearTimeout(walkTimer); pendingWalk = undefined; }
  export function walkTo(destination: string, route?: string): boolean {
    if (!ready || mode !== 'town' || !sceneState.enabled) return false;
    cancelPending();
    const command = packet('WALK_TO', { destination });
    pendingWalk = { id: command.id, destination, route };
    send(command);
    walkTimer = setTimeout(() => { if (pendingWalk?.id === command.id) { cancelPending(); error = 'เดินทางไม่สำเร็จ กรุณาลองอีกครั้ง'; } }, 8000);
    return true;
  }
  function armTimeout() {
    clearTimeout(readyTimer);
    readyTimer = setTimeout(() => { if (!ready) error = 'ยังเชื่อมต่อ Masque Vease ไม่ได้'; }, 12000);
  }
  function reload() { ready = false; error = ''; cancelPending(); handled.clear(); version += 1; armTimeout(); }
  onMount(() => {
    armTimeout();
    function receive(event: MessageEvent) {
      if (!trustedSender(event, source.origin, frame?.contentWindow ?? null) || !isSceneMessage(event.data)) return;
      const message = event.data;
      if (message.type === 'READY') { initialize(); return; }
      if (message.type === 'ACK') { ready = true; error = ''; clearTimeout(readyTimer); return; }
      if (!ready || handled.has(message.id)) return;
      handled.add(message.id);
      if (handled.size > 256) handled.delete(handled.values().next().value!);
      switch (message.type) {
        case 'NAVIGATE': {
          const route = message.payload.route;
          const destination = stops[route.split('/')[0]];
          if (!destination || mode !== 'town' || !walkTo(destination, route)) onNavigate(route);
          break;
        }
        case 'EQUIP_REQUEST': {
          const next = onOutfit(message.payload);
          send(packet('EQUIP_RESULT', { ok: !!next, state: $state.snapshot(next ?? sceneState), message: next ? 'บันทึกชุดแล้ว' : 'ใช้ได้เฉพาะของที่เป็นเจ้าของ' }, message.id));
          break;
        }
        case 'ARRIVED':
          if (pendingWalk?.id === message.id && pendingWalk.destination === message.payload.destination) {
            const route = pendingWalk.route;
            cancelPending();
            if (!message.payload.cancelled && route) onNavigate(route);
          }
          break;
        case 'SIZE': if (mode === 'wardrobe') onSize?.(message.payload.height); break;
        case 'ERROR': cancelPending(); error = message.payload.message; break;
      }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    if (frame) observer.observe(frame);
    const visibilityChanged = () => { documentVisible = !document.hidden; };
    window.addEventListener('message', receive);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => { observer.disconnect(); clearTimeout(readyTimer); cancelPending(); window.removeEventListener('message', receive); document.removeEventListener('visibilitychange', visibilityChanged); };
  });
  $effect(() => { if (ready) send(packet('STATE', { state: $state.snapshot(sceneState) })); });
  $effect(() => { const next = mode; if (ready) { untrack(cancelPending); send(packet('MODE', { mode: next })); } });
  $effect(() => { if (ready) send(packet('ACTIVE', { active: visible && documentVisible })); });
</script>

<section class="relative h-full w-full overflow-hidden bg-[#eaf3f7]" aria-label="Masque Vease" data-testid="vease-embed" data-ready={ready} data-mode={mode}>
  {#key version}<iframe bind:this={frame} class="block h-full w-full border-0" src={source.href} title="Masque Vease" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="strict-origin-when-cross-origin" onload={initialize} onerror={() => { error = 'เปิด Masque Vease ไม่สำเร็จ'; }}></iframe>{/key}
  {#if !ready && !error}<div class="absolute inset-0 grid place-content-center bg-[#eaf3f7] text-sky-700" role="status"><LoaderCircle class="animate-spin" size={24} /></div>{/if}
  {#if error}<div class="absolute inset-0 grid place-content-center justify-items-center gap-3 bg-[#eaf3f7]/95 px-5 text-center text-sm text-[#254b61]" role="alert"><p>{error}</p><button class="flex min-h-11 items-center gap-2 rounded-md border border-white bg-white/80 px-4" onclick={reload}><RotateCcw size={16} />เชื่อมต่อใหม่</button><a class="flex min-h-10 items-center gap-2 text-xs underline" href={source.origin + source.pathname} target="_blank" rel="noopener noreferrer">เปิด MV แยก<ExternalLink size={14} /></a></div>{/if}
</section>