import { HalloweenItem } from "./halloweenItems";

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
  gameStatus: "waiting" | "playing" | "finished";
  maxPlayers: number;
}

export { HalloweenItem } from "./halloweenItems";

export interface GameEvents {
  "join-room": { roomId: string; playerName: string };
  "leave-room": { roomId: string };
  "draw-item": { roomId: string };
  "mark-item": { roomId: string; row: number; col: number };
  "claim-bingo": { roomId: string };
  "room-updated": Room;
  "item-drawn": HalloweenItem;
  "bingo-winner": Player;
}
