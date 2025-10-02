export interface Player {
  id: string;
  name: string;
  cardNumber: number;
  card: HalloweenItem[][];
  markedItems: boolean[][];
  isMaster: boolean;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  master: Player | null;
  drawnItems: HalloweenItem[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
}

export type HalloweenItem = 
  | 'abobora' | 'morcego' | 'fantasma' | 'bruxa' | 'olho'
  | 'sangue' | 'caveira' | 'aranha' | 'gato-preto' | 'vampiro'
  | 'lobisomem' | 'zumbi' | 'mumia' | 'demonio' | 'caldeirao'
  | 'vassoura' | 'lanterna' | 'casa-assombrada' | 'teia-de-aranha' | 'ossos'
  | 'tumba' | 'lua-cheia' | 'nevoa' | 'coruja' | 'candeeiro'
  | 'mascara' | 'doces' | 'trick-or-treat' | 'balde' | 'linha'
  | 'corda' | 'faca' | 'machado' | 'martelo' | 'prego'
  | 'porão' | 'cerca' | 'arvore' | 'folha' | 'vento'
  | 'chuva' | 'trovão' | 'relampago' | 'fogo' | 'fumaca'
  | 'espirito' | 'alma' | 'sombra' | 'reflexo' | 'espelho'
  | 'cristal' | 'pedra' | 'esqueleto' | 'areia' | 'poeira'
  | 'tecido' | 'fantasia' | 'chapéu' | 'luva' | 'bota'
  | 'anel' | 'monstros' | 'pulseira' | 'lençol' | 'cerebro'
  | 'cetro' | 'livro' | 'pergaminho' | 'tinta' | 'espantalho'
  | 'vela' | 'tocha' | 'fosforo' | 'fagulha';

export interface GameEvents {
  'join-room': { roomId: string; playerName: string };
  'leave-room': { roomId: string };
  'draw-item': { roomId: string };
  'mark-item': { roomId: string; row: number; col: number };
  'claim-bingo': { roomId: string };
  'room-updated': Room;
  'item-drawn': HalloweenItem;
  'bingo-winner': Player;
  'error': string;
}
