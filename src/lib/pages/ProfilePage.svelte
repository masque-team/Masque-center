<script lang="ts">
  import { ArrowRight, ChartNoAxesColumnIncreasing, Coins, Crown, Gift, Plus, Shirt, Ticket, UserRound, UsersRound, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import Panel from '../components/Panel.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, ENERGY_CONFIG, PETS } from '../data/config';
  import type { PlayerState } from '../types';

  let { player, vipActive, passLevel, onNavigate, onRefill }: {
    player: PlayerState;
    vipActive: boolean;
    passLevel: number;
    onNavigate: (route: string) => void;
    onRefill: () => void;
  } = $props();

  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId) ?? null);
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
  let stats = $derived([
    { label: 'ตัวละคร', value: `${player.ownedAvatarIds.length}/${AVATARS.length}`, icon: Shirt },
    { label: 'สัตว์เลี้ยง', value: `${player.ownedPetIds.length}/${PETS.length}`, icon: Gift },
    { label: 'ตั๋วกาชา', value: String(player.gachaTickets), icon: Ticket },
    { label: 'เช็กอิน', value: `${player.checkinDates.length} วัน`, icon: Crown },
  ]);
  let menu = $derived([
    { route: 'avatar', title: 'Avatar & Pets', hint: `${avatar.name}${pet ? ` · ${pet.name}` : ''}`, icon: Shirt },
    { route: 'rewards', title: 'Battle Pass', hint: `เลเวล ${passLevel}`, icon: Crown },
    { route: 'ranking', title: 'Ranking', hint: 'อันดับแยกตามเกม', icon: ChartNoAxesColumnIncreasing },
    { route: 'room', title: 'Friends Room', hint: vipActive ? 'สร้างห้องได้' : 'สิทธิพิเศษ VIP', icon: UsersRound },
  ]);
</script>

<div class="page-stack">
  <PageTitle eyebrow="PLAYER CARD" title="Profile" subtitle="ข้อมูลและคอลเลกชันของคุณ">
    {#snippet icon()}<UserRound size={26} />{/snippet}
  </PageTitle>

  <Panel tone={isVipLook ? 'gold' : 'lilac'}>
    <div class="id">
      <span class="portrait" class:vip={isVipLook} style={`--avatar-color:${avatar.color}`}><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" loading="eager" className="id-art" /></span>
      <div class="who">
        <strong>{player.displayName}</strong>
        <small>UID {player.id}</small>
        <div class="chips"><span class="lv">LV.{player.level}</span><RarityChip rarity={avatar.rarity} />{#if vipActive}<span class="vip"><Crown size={11} fill="currentColor" />VIP</span>{/if}</div>
      </div>
    </div>
  </Panel>

  <div class="wallet">
    <div><span class="wi gold"><Coins size={20} /></span><span class="wc"><small>Masque Points</small><b>{player.masquePoints.toLocaleString('en-US')}</b></span><button aria-label="เปิด Shop" onclick={() => onNavigate('shop')}><Plus size={17} strokeWidth={3.5} /></button></div>
    <div><span class="wi blue"><Zap size={20} fill="currentColor" /></span><span class="wc"><small>Energy</small><b>{vipActive ? '∞' : `${player.energy}/${ENERGY_CONFIG.max}`}</b></span><button aria-label="เติม Energy" onclick={onRefill}><Plus size={17} strokeWidth={3.5} /></button></div>
  </div>

  <div class="stats">
    {#each stats as stat (stat.label)}
      {@const Icon = stat.icon}
      <div><Icon size={17} /><b>{stat.value}</b><small>{stat.label}</small></div>
    {/each}
  </div>

  <div class="menu">
    {#each menu as item (item.route)}
      {@const Icon = item.icon}
      <button onclick={() => onNavigate(item.route)}><span class="mi"><Icon size={20} /></span><span class="mc"><strong>{item.title}</strong><small>{item.hint}</small></span><ArrowRight size={17} /></button>
    {/each}
  </div>
</div>

<style>
  .id { display: flex; align-items: center; gap: 14px; }
  .portrait { display: block; width: 92px; height: 112px; flex: 0 0 auto; overflow: hidden; border: 3px solid #fff; border-radius: 26px 26px 18px 18px; background: radial-gradient(circle at 50% 70%, rgb(255 255 255 / 60%), transparent 70%), var(--avatar-color); box-shadow: 0 5px 0 rgb(60 40 140 / 25%); }
  .portrait.vip { border-color: #fff6b8; background: radial-gradient(circle at 50% 55%, rgb(255 245 170 / 90%), transparent 70%), var(--avatar-color); box-shadow: 0 0 0 2.5px #ffbe30, 0 0 22px rgb(255 195 40 / 75%), 0 5px 0 rgb(160 100 10 / 35%); }
  .portrait.vip :global(.id-art) { filter: drop-shadow(0 0 10px rgb(255 240 140 / 95%)); }
  .portrait :global(.id-art) { background: transparent; }
  .who { min-width: 0; display: grid; gap: 4px; }
  .who strong { overflow: hidden; color: var(--g-ink); font-size: 22px; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
  .who small { color: var(--g-muted); font-size: 12px; font-weight: 700; word-break: break-all; }
  .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .lv, .vip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 9px; border: 1.5px solid #fff; border-radius: 99px; font-size: 11px; font-weight: 900; }
  .lv { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); }
  .vip { color: #7a4a00; background: linear-gradient(180deg, #fff09a, #ffb42b); }

  .wallet { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .wallet > div { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 9px 8px 9px 9px; border: 2.5px solid #fff; border-radius: 18px; background: linear-gradient(160deg, #fff, #f1ecff); box-shadow: 0 5px 0 -2px #d3c8f5; }
  .wi { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 auto; border-radius: 13px; color: #fff; }
  .wi.gold { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .wi.blue { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); }
  .wc { min-width: 0; flex: 1; display: grid; }
  .wc small { color: var(--g-muted); font-size: 11px; font-weight: 800; }
  .wc b { overflow: hidden; color: var(--g-ink); font-size: 17px; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
  .wallet button { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border: 2px solid #fff; border-radius: 50%; color: #fff; background: linear-gradient(180deg, #4fd6a0, #22b57d); box-shadow: 0 3px 0 #168a5f; }

  .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
  .stats > div { display: grid; justify-items: center; gap: 2px; padding: 10px 2px; border: 2.5px solid #fff; border-radius: 16px; color: #6a4fd6; background: linear-gradient(160deg, #fff, #f1ecff); box-shadow: 0 4px 0 -2px #d3c8f5; text-align: center; }
  .stats b { color: var(--g-ink); font-size: 15px; font-weight: 900; }
  .stats small { color: var(--g-muted); font-size: 10.5px; font-weight: 800; }

  .menu { display: grid; gap: 9px; }
  .menu button { display: flex; align-items: center; gap: 11px; min-height: 64px; padding: 8px 14px 8px 10px; border: 2.5px solid #fff; border-radius: 20px; color: #8a7fc4; background: linear-gradient(160deg, #fff, #f6f2ff); box-shadow: 0 5px 0 -2px #d3c8f5; text-align: left; }
  .mi { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 auto; border-radius: 15px; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .mc { min-width: 0; flex: 1; display: grid; }
  .mc strong { color: var(--g-ink); font-size: 15px; font-weight: 900; }
  .mc small { overflow: hidden; color: var(--g-muted); font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
</style>
