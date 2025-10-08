import { Server, Socket } from 'socket.io';
import { roomManager } from '../utils/roomManager';
import { checkBingo } from '../utils/cardGenerator';
import { GameEvents } from '../types/game';

export function setupSocketEvents(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Usuário conectado:', socket.id);
    
    // Armazena informações do jogador para reconexão
    let playerInfo: { roomId?: string; playerName?: string } = {};

    socket.on('join-room', (data: GameEvents['join-room']) => {
      const { roomId, playerName } = data;
      
      // Armazena info do jogador
      playerInfo = { roomId, playerName };
      
      // Se sala não existe, cria uma nova
      let room = roomManager.getRoom(roomId);
      if (!room) {
        room = roomManager.createRoom(roomId, `Sala ${roomId}`, socket.id, playerName);
        socket.join(roomId);
        socket.emit('room-updated', room);
        console.log(`Sala ${roomId} criada por ${playerName}`);
        return;
      }

      // Verifica se já existe um jogador com o mesmo nome na sala (incluindo desconectados)
      const existingPlayer = room.players.find(p => p.name === playerName);
      if (existingPlayer) {
        // Reconecta o jogador existente usando o roomManager
        roomManager.reconnectPlayer(roomId, socket.id, playerName);
        socket.join(roomId);
        io.to(roomId).emit('room-updated', room);
        console.log(`${playerName} reconectou na sala ${roomId} - cartela preservada`);
        return;
      }

      // Tenta entrar na sala existente como novo jogador
      room = roomManager.joinRoom(roomId, socket.id, playerName);
      if (room) {
        socket.join(roomId);
        io.to(roomId).emit('room-updated', room);
        console.log(`${playerName} entrou na sala ${roomId}`);
      } else {
        socket.emit('error', 'Sala cheia ou não encontrada');
      }
    });

    socket.on('leave-room', (data: GameEvents['leave-room']) => {
      const { roomId } = data;
      const room = roomManager.leaveRoom(roomId, socket.id);
      
      socket.leave(roomId);
      
      if (room) {
        io.to(roomId).emit('room-updated', room);
        console.log(`Usuário saiu da sala ${roomId}`);
      } else {
        // Sala foi removida por estar vazia
        roomManager.cleanEmptyRoom(roomId);
        console.log(`Sala ${roomId} removida (vazia)`);
      }
    });

    socket.on('draw-item', (data: GameEvents['draw-item']) => {
      const { roomId } = data;
      const room = roomManager.getRoom(roomId);
      
      console.log('Draw item request:', { roomId, socketId: socket.id, masterId: room?.master?.id });
      
      if (!room || room.master?.id !== socket.id) {
        console.log('Draw item failed:', { hasRoom: !!room, isMaster: room?.master?.id === socket.id });
        socket.emit('error', 'Apenas o mestre pode sortear items');
        return;
      }

      const drawnItem = roomManager.drawItem(roomId);
      if (drawnItem) {
        io.to(roomId).emit('item-drawn', drawnItem);
        io.to(roomId).emit('room-updated', room); // ADICIONADO: Atualiza a sala
        console.log(`Item sorteado: ${drawnItem}`);
      } else {
        socket.emit('error', 'Não há mais items para sortear');
      }
    });

    socket.on('mark-item', (data: GameEvents['mark-item']) => {
      const { roomId, row, col } = data;
      const room = roomManager.getRoom(roomId);
      
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      // Verifica se o item foi sorteado
      const itemToMark = player.card[row][col];
      if (!room.drawnItems.includes(itemToMark)) {
        socket.emit('error', 'Este item ainda não foi sorteado!');
        return;
      }

      player.markedItems[row][col] = true;
      
      // NÃO verifica bingo automaticamente - jogador deve declarar manualmente

      io.to(roomId).emit('room-updated', room);
    });

    socket.on('claim-bingo', (data: GameEvents['claim-bingo']) => {
      const { roomId } = data;
      const room = roomManager.getRoom(roomId);
      
      if (!room) return;

      // IMPORTANTE: Verifica se já existe um vencedor (primeira validação - só aceita o primeiro)
      if (room.gameStatus === 'finished') {
        socket.emit('error', 'O bingo já foi decretado por outro jogador!');
        return;
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      // Verifica se a cartela está completamente preenchida (25 itens)
      if (!checkBingo(player.markedItems)) {
        socket.emit('error', 'Você precisa preencher TODA a cartela para decretar bingo!');
        return;
      }

      // Valida se todos os 25 items marcados foram realmente sorteados
      let validBingo = true;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (player.markedItems[i][j]) {
            const item = player.card[i][j];
            if (!room.drawnItems.includes(item)) {
              validBingo = false;
              break;
            }
          }
        }
        if (!validBingo) break;
      }

      if (validBingo) {
        // MARCA O JOGO COMO FINALIZADO IMEDIATAMENTE (garante que só o primeiro vence)
        room.gameStatus = 'finished';
        io.to(roomId).emit('bingo-winner', player);
        io.to(roomId).emit('room-updated', room);
        console.log(`🎉 BINGO! ${player.name} venceu! (Cartela completa)`);
      } else {
        socket.emit('error', 'Bingo inválido! Você marcou items não sorteados.');
      }
    });

    socket.on('disconnect', () => {
      console.log('Usuário desconectado:', socket.id);
      
      // Marca jogador como desconectado e inicia timer de 30s
      if (playerInfo.roomId && playerInfo.playerName) {
        roomManager.markPlayerDisconnected(
          playerInfo.roomId,
          socket.id,
          playerInfo.playerName,
          () => {
            // Callback executado quando o timer expira
            const room = roomManager.getRoom(playerInfo.roomId!);
            if (room) {
              io.to(playerInfo.roomId!).emit('room-updated', room);
            }
          }
        );
      }
    });
  });
}
