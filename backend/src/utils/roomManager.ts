import { Room, Player, HalloweenItem } from '../types/game';
import { HALLOWEEN_ITEMS } from '../types/halloweenItems';
import { generateCard, generateCardNumber } from '../utils/cardGenerator';

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, roomName: string, masterId: string, masterName: string): Room {
    const masterCard = generateCard();
    const master: Player = {
      id: masterId,
      name: masterName,
      cardNumber: generateCardNumber(),
      card: masterCard,
      markedItems: Array(5).fill(null).map(() => Array(5).fill(false)),
      isMaster: true
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      players: [master],
      master,
      drawnItems: [],
      gameStatus: 'waiting',
      maxPlayers: 30
    };

    this.rooms.set(roomId, room);
    return room;
  }

  reconnectPlayer(roomId: string, playerId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      // Atualiza apenas o socket.id, mantém cartela e marcações
      existingPlayer.id = playerId;
      return room;
    }

    return null;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return null;
    }

    const playerCard = generateCard();
    const player: Player = {
      id: playerId,
      name: playerName,
      cardNumber: generateCardNumber(),
      card: playerCard,
      markedItems: Array(5).fill(null).map(() => Array(5).fill(false)),
      isMaster: false
    };

    room.players.push(player);
    
    // Muda status para playing quando tem pelo menos 2 jogadores
    if (room.players.length >= 2 && room.gameStatus === 'waiting') {
      room.gameStatus = 'playing';
    }
    
    return room;
  }

  leaveRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    
    // Se o mestre saiu, escolhe novo mestre
    if (room.master?.id === playerId) {
      room.master = room.players[0] || null;
      if (room.master) {
        room.master.isMaster = true;
      }
    }

    // Remove sala se ficar vazia
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    return room;
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  drawItem(roomId: string): HalloweenItem | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Sorteia item que ainda não foi sorteado
    const availableItems = HALLOWEEN_ITEMS.filter(item => 
      !room.drawnItems.includes(item)
    );

    if (availableItems.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const drawnItem = availableItems[randomIndex];
    
    room.drawnItems.push(drawnItem);
    return drawnItem;
  }
}

export const roomManager = new RoomManager();
