import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Room, HalloweenItem, Player } from "../types/game";

export const useSocket = () => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [drawnItem, setDrawnItem] = useState<HalloweenItem | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detecta ambiente: desenvolvimento usa localhost:5002, produção usa window.location.origin
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isDevelopment ? 'http://localhost:5002' : window.location.origin;
    
    const newSocket = io(backendUrl, {
      path: '/socket.io/'
    });
    setSocket(newSocket);

    newSocket.on("room-updated", (roomData: Room) => {
      console.log('Room updated:', roomData);
      setRoom(roomData);
      const player = roomData.players.find((p) => p.id === newSocket.id);
      console.log('Current player found:', player);
      setCurrentPlayer(player || null);
    });

    newSocket.on("item-drawn", (item: HalloweenItem) => {
      setDrawnItem(item);
    });

    newSocket.on("bingo-winner", (winnerData: Player) => {
      setWinner(winnerData);
    });

    newSocket.on("error", (errorMessage: string) => {
      setError(errorMessage);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, playerName: string) => {
    if (socket) {
      socket.emit("join-room", { roomId, playerName });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit("leave-room", { roomId });
    }
  };

  const drawItem = (roomId: string) => {
    if (socket) {
      socket.emit("draw-item", { roomId });
    }
  };

  const markItem = (roomId: string, row: number, col: number) => {
    if (socket) {
      socket.emit("mark-item", { roomId, row, col });
    }
  };

  const claimBingo = (roomId: string) => {
    if (socket) {
      socket.emit("claim-bingo", { roomId });
    }
  };

  return {
    socket,
    room,
    currentPlayer,
    drawnItem,
    winner,
    error,
    joinRoom,
    leaveRoom,
    drawItem,
    markItem,
    claimBingo,
    clearError: () => setError(null),
  };
};
