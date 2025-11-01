import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './Board';
import { Button } from './Button';
import { useReownAppkit } from '../hooks/useReownAppkit';
import useSound from '../hooks/useSound';
import { SoundOnIcon } from './icons/SoundOnIcon';
import { SoundOffIcon } from './icons/SoundOffIcon';

type Player = 'X' | 'O';
type SquareValue = Player | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const HISTORY_KEY_PREFIX = 'tacotex_history_';

// --- Helper Functions ---

// Calculates the winner and the winning line
const calculateWinner = (squares: SquareValue[]): { winner: Player | 'Draw' | null, line: number[] | null } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(square => square !== null)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
};

// Determines the AI's move
const getAIMove = (board: SquareValue[], difficulty: Difficulty): number => {
  const emptySquares = board.map((sq, i) => sq === null ? i : -1).filter(i => i !== -1);
  
  const findWinningMove = (currentBoard: SquareValue[], player: Player): number => {
      for (const i of emptySquares) {
          const boardCopy = [...currentBoard];
          boardCopy[i] = player;
          const winnerInfo = calculateWinner(boardCopy);
          if (winnerInfo.winner === player) {
              return i;
          }
      }
      return -1;
  };
  
  // Hard AI (Strategic)
  if (difficulty === 'hard') {
      // 1. Win if possible
      let move = findWinningMove(board, 'O');
      if (move !== -1) return move;
      // 2. Block player's win
      move = findWinningMove(board, 'X');
      if (move !== -1) return move;
      // 3. Take center
      if (emptySquares.includes(4)) return 4;
      // 4. Take a corner
      const corners = [0, 2, 6, 8].filter(i => emptySquares.includes(i));
      if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  }
  
  // Medium AI
  if (difficulty === 'medium') {
      // 1. Win if possible
      let move = findWinningMove(board, 'O');
      if (move !== -1) return move;
      // 2. Block player's win
      move = findWinningMove(board, 'X');
      if (move !== -1) return move;
  }
  
  // Easy AI (or fallback for Medium/Hard)
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};


const saveGameResult = (walletAddress: string, result: 'win' | 'loss' | 'draw') => {
  try {
    const key = `${HISTORY_KEY_PREFIX}${walletAddress.toLowerCase()}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const newEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      result,
    };
    history.unshift(newEntry);
    // Keep the last 100 results
    localStorage.setItem(key, JSON.stringify(history.slice(0, 100)));
  } catch (error) {
    console.error("Failed to save game result:", error);
  }
};


// --- Components ---

const DifficultySelector: React.FC<{ onSelect: (level: Difficulty) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-cyan-500/10">
    <h2 className="text-3xl font-bold text-white mb-2">Select Difficulty</h2>
    <p className="text-slate-400 mb-8">Choose your opponent to start a new game.</p>
    <div className="w-full space-y-4">
      <Button onClick={() => onSelect('easy')} size="lg" fullWidth variant="secondary">Easy</Button>
      <Button onClick={() => onSelect('medium')} size="lg" fullWidth variant="secondary">Medium</Button>
      <Button onClick={() => onSelect('hard')} size="lg" fullWidth variant="secondary">Hard (Strategic AI)</Button>
    </div>
  </div>
);

export const TicTacToe: React.FC = () => {
  const { walletAddress } = useReownAppkit();
  const { isMuted, toggleSound, playSound } = useSound();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [isComputerTurn, setIsComputerTurn] = useState(false);

  const { winner, line: winningLine } = calculateWinner(board);
  const isGameOver = !!winner;

  const handleSquareClick = (index: number) => {
    if (winner || board[index] || isComputerTurn) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    playSound('place');
    setIsComputerTurn(true);
  };

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsComputerTurn(false);
    setDifficulty(null);
  }, []);

  // Effect for AI move
  useEffect(() => {
    if (isComputerTurn && !winner) {
      const timeoutId = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty!);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          playSound('place');
        }
        setIsComputerTurn(false);
      }, 600); // AI "thinks" for a moment

      return () => clearTimeout(timeoutId);
    }
  }, [isComputerTurn, board, winner, difficulty, playSound]);

  // Effect for handling game over state
  useEffect(() => {
    if (winner) {
      const result = winner === 'X' ? 'win' : winner === 'O' ? 'loss' : 'draw';
      if (result === 'win') playSound('win');
      else if (result === 'loss') playSound('lose');
      else if (result === 'draw') playSound('draw');

      if (walletAddress) {
        saveGameResult(walletAddress, result);
      }
    }
  }, [winner, walletAddress, playSound]);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  let statusText;
  if (winner) {
    if (winner === 'Draw') statusText = "It's a Draw!";
    else statusText = winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
  } else {
    statusText = isComputerTurn ? 'AI is Thinking...' : 'Your Turn (X)';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full flex justify-center items-center mb-6">
        <div className={`text-2xl font-semibold transition-colors duration-300 ${winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-400' : 'text-cyan-400'}`}>
          {statusText}
        </div>
        <button 
          onClick={toggleSound} 
          className="absolute right-0 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? <SoundOffIcon className="w-6 h-6"/> : <SoundOnIcon className="w-6 h-6"/>}
        </button>
      </div>
      
      <Board 
        squares={board} 
        onSquareClick={handleSquareClick}
        winningLine={winningLine}
        disabled={isComputerTurn || isGameOver}
      />
      
      {isGameOver && (
        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in">
          <Button onClick={resetGame} size="lg">
            New Game
          </Button>
        </div>
      )}
    </div>
  );
};