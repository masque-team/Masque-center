import type { GameId, RankingEntry } from '../types';

export const MOCK_RANKINGS: Record<GameId, RankingEntry[]> = {
  bird: [
    { playerId: 'MG82714', displayName: 'Aomsin', score: 15320 },
    { playerId: 'MG39842', displayName: 'SkyLuna', score: 12480 },
    { playerId: 'MG28015', displayName: 'WinnyZ', score: 10950 },
    { playerId: 'MG43702', displayName: 'Momo', score: 9120 },
    { playerId: 'MG90331', displayName: 'Kiki', score: 8640 },
  ],
  mole: [
    { playerId: 'MG10047', displayName: 'MildMint', score: 2820 },
    { playerId: 'MG43152', displayName: 'TaoTao', score: 2575 },
    { playerId: 'MG72864', displayName: 'PimPlay', score: 2240 },
    { playerId: 'MG09315', displayName: 'Bento', score: 1940 },
    { playerId: 'MG55902', displayName: 'Kookkai', score: 1680 },
  ],
  run: [
    { playerId: 'MG28714', displayName: 'RunRun', score: 9870 },
    { playerId: 'MG61389', displayName: 'Namtan', score: 8240 },
    { playerId: 'MG45201', displayName: 'BlueBear', score: 7520 },
    { playerId: 'MG87140', displayName: 'PloyJoy', score: 6890 },
    { playerId: 'MG26403', displayName: 'TeeTee', score: 5340 },
  ],
  fruit: [
    { playerId: 'MG75318', displayName: 'NinjaBee', score: 18560 },
    { playerId: 'MG40192', displayName: 'MangoPop', score: 16220 },
    { playerId: 'MG02654', displayName: 'FahSai', score: 14100 },
    { playerId: 'MG58127', displayName: 'Chompoo', score: 11980 },
    { playerId: 'MG93860', displayName: 'JellyJoy', score: 9830 },
  ],
  timber: [
    { playerId: 'MG69431', displayName: 'DeerDash', score: 940 },
    { playerId: 'MG32780', displayName: 'Tonmai', score: 825 },
    { playerId: 'MG48513', displayName: 'Maprang', score: 760 },
    { playerId: 'MG10277', displayName: 'JomJom', score: 690 },
    { playerId: 'MG81632', displayName: 'MheeNoi', score: 540 },
  ],
  duck: [
    { playerId: 'MG53319', displayName: 'DuckHunter', score: 3670 },
    { playerId: 'MG14682', displayName: 'PloenPloen', score: 3250 },
    { playerId: 'MG70413', displayName: 'NongNid', score: 2980 },
    { playerId: 'MG36590', displayName: 'MaliMali', score: 2440 },
    { playerId: 'MG98211', displayName: 'Chaiyo', score: 2110 },
  ],
  memory: [
    { playerId: 'MG73820', displayName: 'MaliMatch', score: 18 },
    { playerId: 'MG46015', displayName: 'NongNok', score: 16 },
    { playerId: 'MG29176', displayName: 'PloyPloy', score: 14 },
    { playerId: 'MG85042', displayName: 'Khanom', score: 12 },
    { playerId: 'MG14793', displayName: 'MookMik', score: 10 },
  ],
};