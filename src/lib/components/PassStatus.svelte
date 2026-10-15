<script lang="ts">
  import { Check, Clock3, Crown, LockKeyhole, Ticket } from '@lucide/svelte';
  import type { PlayerState } from '../types';

  let {
    player,
    active,
    remaining,
    freeMinutes,
    onUpgrade,
  }: {
    player: PlayerState;
    active: boolean;
    remaining: string;
    freeMinutes: number;
    onUpgrade: () => void;
  } = $props();
</script>

<section class:premium={active} class="pass-status" aria-label="สถานะ Masque Pass">
  <div class="pass-status-main">
    <div class="pass-emblem">{#if active}<Crown size={25} fill="currentColor" />{:else}<Ticket size={24} />{/if}</div>
    <div class="pass-copy">
      <div class="pass-heading"><strong>{active ? 'Masque Pass' : 'Free Player'}</strong><span class:active-badge={active} class="status-badge">{active ? 'PASS ACTIVE' : 'FREE PLAY'}</span></div>
      <p>{active ? `สิทธิ์พรีเมียม เหลือ ${remaining}` : `เล่นฟรีวันนี้อีก ${freeMinutes} นาที`}</p>
    </div>
    <button class:gold-button={active} class="button upgrade-button" onclick={onUpgrade}>
      {active ? 'ต่ออายุ' : 'อัปเกรด'}
    </button>
  </div>
  <div class="pass-perks">
    <span><Clock3 size={14} />{active ? 'เล่นทุกเกมไม่จำกัดเวลา' : 'ฟรีรวมทุกเกมวันละ 60 นาที'}</span>
    <span>{#if active}<Check size={14} />{:else}<LockKeyhole size={14} />{/if}{active ? 'มีสิทธิ์ Ranked' : 'Free Play ไม่นับ Rank'}</span>
    <span class="player-identity"><b>{player.id}</b><small>PLAYER ID</small></span>
  </div>
</section>