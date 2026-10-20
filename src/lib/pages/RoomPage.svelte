<script lang="ts">
  import { ArrowRight, Copy, Crown, Link2, Lock, Play, UsersRound } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import Panel from '../components/Panel.svelte';
  import { AVATARS } from '../data/config';
  import type { PlayerState } from '../types';

  let { player, vipActive, roomCode, roomCreated, joinCode = $bindable(), onCreate, onStart, onVip, onToast }: {
    player: PlayerState;
    vipActive: boolean;
    roomCode: string;
    roomCreated: boolean;
    joinCode: string;
    onCreate: () => void;
    onStart: () => void;
    onVip: () => void;
    onToast: (message: string) => void;
  } = $props();

  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);

  function copy(text: string, message: string) {
    void navigator.clipboard?.writeText(text);
    onToast(message);
  }
</script>

<div class="page-stack">
  <PageTitle eyebrow="PLAY TOGETHER" title="Friends Room" subtitle="ห้องเล่นกับเพื่อน · ตัวอย่าง">
    {#snippet icon()}<UsersRound size={26} />{/snippet}
  </PageTitle>

  <Panel tone={vipActive ? 'mint' : 'lilac'}>
    <div class="create">
      <span class="ri"><UsersRound size={28} /></span>
      <h2>เล่นด้วยกันสนุกกว่า</h2>
      <p>{vipActive ? 'VIP พร้อมสร้างห้องเล่นกับเพื่อน' : 'การสร้างห้องเป็นสิทธิพิเศษของ VIP'}</p>
      {#if vipActive}
        <GameButton variant="purple" size="lg" block onclick={onCreate}><UsersRound size={18} />{roomCreated ? 'สร้างห้องใหม่' : 'สร้างห้อง'}</GameButton>
      {:else}
        <GameButton variant="gold" size="lg" block onclick={onVip}><Lock size={17} />ปลดล็อกด้วย VIP<Crown size={17} fill="currentColor" /></GameButton>
      {/if}
    </div>
  </Panel>

  {#if roomCreated}
    <Panel tone="white">
      <div class="code"><span>ROOM CODE</span><strong>{roomCode}</strong><button aria-label="คัดลอกรหัสห้อง" onclick={() => copy(roomCode, 'คัดลอกรหัสห้องแล้ว')}><Copy size={17} /></button></div>
      <div class="members">
        <strong>สมาชิกในห้อง <em>1/4</em></strong>
        <div class="member">
          <span class="av" style={`--avatar-color:${avatar.color}`}><AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" className="m-art" /></span>
          <span class="mn">{player.displayName}<small>Host</small></span>
        </div>
        {#each [2, 3, 4] as slot}<div class="member empty"><span class="av">+</span><span class="mn">รอเพื่อน…<small>ว่าง</small></span></div>{/each}
      </div>
      <div class="acts">
        <GameButton variant="ghost" size="md" onclick={() => copy(`${window.location.origin}${window.location.pathname}#room?code=${roomCode}`, 'คัดลอกลิงก์เชิญแล้ว')}><Link2 size={16} />เชิญเพื่อน</GameButton>
        <GameButton variant="mint" size="md" onclick={onStart}><Play size={16} fill="currentColor" />เริ่มเกม</GameButton>
      </div>
    </Panel>
  {/if}

  <Panel tone="white">
    <h2 class="jh">มีรหัสห้องแล้ว?</h2>
    <div class="join">
      <input aria-label="รหัสห้อง" maxlength="6" placeholder="ใส่รหัส 6 ตัว" bind:value={joinCode} />
      <GameButton variant="purple" size="md" disabled={joinCode.trim().length < 4} onclick={() => onToast(`จำลองการเข้าห้อง ${joinCode.toUpperCase()}`)}>เข้าร่วม<ArrowRight size={16} /></GameButton>
    </div>
    <p class="note">การเข้าร่วมและสมาชิกเป็นข้อมูลจำลอง ยังไม่มี Multiplayer</p>
  </Panel>
</div>

<style>
  .create { display: grid; justify-items: center; gap: 7px; text-align: center; }
  .ri { display: grid; place-items: center; width: 62px; height: 62px; border: 3px solid #fff; border-radius: 22px; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 5px 0 #4b32a8; }
  .create h2 { margin: 4px 0 0; color: var(--g-ink); font-size: 20px; font-weight: 900; }
  .create p { margin: 0 0 6px; color: var(--g-muted); font-size: 13px; font-weight: 700; }
  .create :global(.gbtn) { width: 100%; }

  .code { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 14px; border: 2.5px dashed #b7a6ee; border-radius: 18px; background: #f6f2ff; }
  .code span { color: var(--g-muted); font-size: 11px; font-weight: 900; letter-spacing: 0.8px; }
  .code strong { flex: 1; color: #4b32a8; font-size: 26px; font-weight: 900; letter-spacing: 5px; text-align: center; }
  .code button { display: grid; place-items: center; width: 40px; height: 40px; border: 2px solid #fff; border-radius: 13px; color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .members { display: grid; gap: 7px; margin: 12px 0; }
  .members > strong { color: var(--g-ink); font-size: 14px; font-weight: 900; }
  .members em { color: #6a4fd6; font-style: normal; }
  .member { display: flex; align-items: center; gap: 10px; padding: 6px 10px 6px 6px; border-radius: 16px; background: #f6f2ff; }
  .member.empty { opacity: 0.55; }
  .av { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; overflow: hidden; border: 2px solid #fff; border-radius: 50%; color: #8a7fc4; background: var(--avatar-color, #e4dcf8); font-weight: 900; }
  .av :global(.m-art) { background: transparent; }
  .av :global(.m-art img) { object-fit: cover; object-position: 50% 8%; }
  .mn { display: grid; color: var(--g-ink); font-size: 14px; font-weight: 800; }
  .mn small { color: var(--g-muted); font-size: 11px; font-weight: 700; }
  .acts { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .acts :global(.gbtn) { width: 100%; }

  .jh { margin: 0 0 9px; color: var(--g-ink); font-size: 16px; font-weight: 900; }
  .join { display: flex; align-items: center; gap: 9px; }
  .join input { min-width: 0; flex: 1; height: 50px; padding: 0 14px; border: 2.5px solid #d3c8f5; border-radius: 16px; color: var(--g-ink); background: #fff; font-size: 17px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; }
  .join input:focus { border-color: #7a5ce0; outline: 0; }
  .note { margin: 9px 0 0; color: #9a90c8; font-size: 12px; font-weight: 700; }
</style>
