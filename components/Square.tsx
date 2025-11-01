import React from 'react';

type SquareValue = 'X' | 'O' | null;

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinner: boolean;
  disabled?: boolean;
}

export const Square: React.FC<SquareProps> = ({ value, onClick, isWinner, disabled }) => {
  const textStyle = value === 'X' ? 'text-cyan-400' : 'text-pink-400';
  const winnerStyle = isWinner ? 'bg-cyan-500/20 scale-105' : '';
  const disabledStyle = disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-700/80';

  return (
    <button
      className={`w-24 h-24 md:w-32 md:h-32 bg-slate-800/60 rounded-lg flex items-center justify-center text-5xl md:text-6xl font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0a18] focus:ring-cyan-500 ${winnerStyle} ${disabledStyle}`}
      onClick={onClick}
      aria-label={`Square ${value || 'empty'}`}
      disabled={disabled}
    >
      <span className={`${textStyle} transition-transform duration-300`}>
        {value}
      </span>
    </button>
  );
};
