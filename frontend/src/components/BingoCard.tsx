import React from 'react';
import { HalloweenItem } from '../types/game';

interface BingoCardProps {
  card: HalloweenItem[][];
  markedItems: boolean[][];
  onMarkItem: (row: number, col: number) => void;
  isMaster?: boolean;
}

export const BingoCard: React.FC<BingoCardProps> = ({ 
  card, 
  markedItems, 
  onMarkItem, 
  isMaster = false 
}) => {

  return (
    <div className="bingo-card">
      <h3 className="text-center text-xl font-bold mb-4 text-orange-600">
        {isMaster ? 'Cartela do Mestre' : 'Sua Cartela'}
      </h3>
      <div className="grid grid-cols-5 gap-1 bg-gray-800 p-4 rounded-lg">
        {card.map((row, rowIndex) =>
          row.map((item, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex flex-col items-center justify-center p-2 rounded
                border-2 transition-all duration-200 cursor-pointer
                ${markedItems[rowIndex][colIndex] 
                  ? 'bg-green-500 border-green-300' 
                  : 'bg-gray-700 border-gray-500 hover:border-orange-400'
                }
                ${isMaster ? 'cursor-default' : 'hover:bg-gray-600'}
              `}
              onClick={() => !isMaster && onMarkItem(rowIndex, colIndex)}
            >
              <span className="text-sm text-center text-white font-medium">
                {item}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
