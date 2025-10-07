import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { BingoCard } from './BingoCard';

export const Game: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const {
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
    clearError
  } = useSocket();

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
    }
  };

  React.useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = (selectedRoomId?: string) => {
    const finalRoomId = selectedRoomId || roomId;
    
    if (!playerName.trim()) {
      alert('Por favor, informe seu nome primeiro!');
      return;
    }
    
    if (finalRoomId.trim()) {
      joinRoom(finalRoomId, playerName);
      setIsJoined(true);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    setIsJoined(false);
    setPlayerName('');
    setRoomId('');
  };

  const handleMarkItem = (row: number, col: number) => {
    if (room && currentPlayer) {
      markItem(room.id, row, col);
    }
  };

  const handleDrawItem = () => {
    if (room && currentPlayer?.isMaster) {
      drawItem(room.id);
    }
  };

  const handleClaimBingo = () => {
    if (room) {
      claimBingo(room.id);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-orange-500 mb-6">
            🎃 Halloween Bingo 🎃
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Seu Nome:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500"
                placeholder="Digite seu nome"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">ID da Sala:</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500"
                placeholder="Digite o ID da sala"
              />
            </div>
            
            <button
              onClick={() => handleJoinRoom()}
              disabled={!playerName.trim() || !roomId.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Entrar na Sala
            </button>
          </div>

          {/* Lista de Salas */}
          {rooms.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-bold mb-3">Salas Disponíveis:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rooms.map((r) => (
                  <div 
                    key={r.id}
                    onClick={() => handleJoinRoom(r.id)}
                    className="bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">{r.name}</p>
                        <p className="text-gray-400 text-sm">
                          {r.players.length}/{r.maxPlayers} jogadores
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        r.gameStatus === 'waiting' ? 'bg-green-600' : 
                        r.gameStatus === 'playing' ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {r.gameStatus === 'waiting' ? 'Aguardando' : 
                         r.gameStatus === 'playing' ? 'Em jogo' : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Lista de Jogadores */}
      <div className="w-64 bg-gray-800 p-4">
        <h3 className="text-white font-bold mb-4">Jogadores na Sala</h3>
        {room && (
          <div className="space-y-2">
            {room.players.map((player) => (
              <div 
                key={player.id}
                className={`p-3 rounded text-sm ${
                  player.isMaster 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                {player.name} {player.isMaster ? '(Mestre)' : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-500">
              🎃 Halloween Bingo - Sala: {roomId}
            </h1>
            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Sair da Sala
            </button>
          </div>
          
          {room && (
            <div className="mt-2 text-white">
              <p>Jogadores: {room.players.length}/{room.maxPlayers}</p>
              <p>Status: {room.gameStatus}</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded mb-4">
            {error}
            <button onClick={clearError} className="ml-4 underline">Fechar</button>
          </div>
        )}

        {/* Winner Message */}
        {winner && (
          <div className="bg-green-600 text-white p-4 rounded mb-4 text-center">
            <h2 className="text-xl font-bold">🎉 BINGO! 🎉</h2>
            <p>{winner.name} venceu!</p>
          </div>
        )}

        {/* Drawn Item */}
        {drawnItem && (
          <div className="bg-orange-600 text-white p-4 rounded mb-4 text-center">
            <h2 className="text-xl font-bold">Item Sorteado:</h2>
            <p className="text-lg">{drawnItem}</p>
          </div>
        )}

        {/* Items History */}
        {room && (
          <div className="bg-gray-800 p-4 rounded mb-6">
            <h3 className="text-white font-bold mb-2">
              Itens Sorteados ({room.drawnItems.length}):
            </h3>
            {room.drawnItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.drawnItems.map((item, index) => (
                  <span 
                    key={index}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Nenhum item sorteado ainda</p>
            )}
          </div>
        )}

        {/* Master Controls */}
        {currentPlayer?.isMaster && (
          <div className="bg-gray-800 p-4 rounded mb-6">
            <h3 className="text-white font-bold mb-2">Controles do Mestre</h3>
            <div className="space-x-4">
              <button
                onClick={handleDrawItem}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
              >
                Sortear Item
              </button>
            </div>
          </div>
        )}

        {/* Player Controls */}
        {currentPlayer && !currentPlayer.isMaster && (
          <div className="bg-gray-800 p-4 rounded mb-6">
            <button
              onClick={handleClaimBingo}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Declarar Bingo
            </button>
          </div>
        )}

        {/* Game Card */}
        {currentPlayer && !currentPlayer.isMaster && (
          <div className="max-w-2xl mx-auto">
            <BingoCard
              card={currentPlayer.card}
              markedItems={currentPlayer.markedItems}
              onMarkItem={handleMarkItem}
              isMaster={false}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
