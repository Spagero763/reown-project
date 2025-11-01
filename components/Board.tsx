import React from 'react';
import { Square } from './Square';

type SquareValue = 'X' | 'O' | null;

interface BoardProps {
  squares: SquareValue[];
  onSquareClick: (index: number) => void;
  winningLine: number[] | null;
}

export const Board: React.FC<BoardProps> = ({ squares, onSquareClick, winningLine }) => {
  return (
    <div className="grid grid-cols-3 gap-3 bg-[#0b0a18] p-3 rounded-lg border-2 border-slate-700/50 shadow-lg shadow-cyan-500/10">
      {squares.map((value, index) => (
        <Square 
          key={index} 
          value={value} 
          onClick={() => onSquareClick(index)} 
          isWinner={winningLine?.includes(index) || false}
        />
      ))}
    </div>
  );
};