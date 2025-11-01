import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from './Board';
import { Button } from './Button';
import { contractService, GameState, mapBoard, mapGameStatus } from '../services/contractService';
import { useReownAppkit } from '../hooks/useReownAppkit';
import useSound from '../hooks/useSound';
import { SoundOnIcon } from './icons/SoundOnIcon';
import { SoundOffIcon } from './icons/SoundOffIcon';

type Player = 'X' | 'O';
type SquareValue = Player | null;
type Difficulty = 'easy' | 'medium' | 'hard';

// --- Components ---

const DifficultySelector: React.FC<{ onSelect: (level: Difficulty) => void, isCreating: boolean }> = ({ onSelect, isCreating }) => (
  <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-cyan-500/10">
    <h2 className="text-3xl font-bold text-white mb-2">Select Difficulty</h2>
    <p className="text-slate-400 mb-8">Choose your opponent. This will create a new game on-chain.</p>
    <div className="w-full space-y-4">
      <Button onClick={() => onSelect('easy')} size="lg" fullWidth variant="secondary" disabled={isCreating}>
        {isCreating ? 'Starting...' : 'Easy'}
      </Button>
      <Button onClick={() => onSelect('medium')} size="lg" fullWidth variant="secondary" disabled={isCreating}>
        {isCreating ? 'Starting...' : 'Medium'}
      </Button>
      <Button onClick={() => onSelect('hard')} size="lg" fullWidth variant="secondary" disabled={isCreating}>
        {isCreating ? 'Starting...' : 'Strategic (On-Chain AI)'}
      </Button>
    </div>
  </div>
);

export const TicTacToe: React.FC = () => {
  const { signer, walletAddress } = useReownAppkit();
  const { isMuted, toggleSound, playSound } = useSound();

  const [gameId, setGameId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevGameStatusRef = useRef<string | null>(null);
  const prevMoveCountRef = useRef<number | null>(null);


  const fetchGameState = useCallback(async (id: number) => {
    if (!signer) return;
    try {
      const state = await contractService.getGame(signer, id);
      setGameState(state);
    } catch (e: any) {
      console.error("Failed to fetch game state:", e);
      setError("Could not fetch game data from the blockchain.");
    }
  }, [signer]);

  useEffect(() => {
    // Attempt to find an active game for the user when the component mounts
    const findActiveGame = async () => {
      if (signer && walletAddress) {
        try {
          const activeId = await contractService.getActiveGameId(signer, walletAddress);
          if (activeId > 0 || (activeId === 0 && (await contractService.getNextGameId(signer)) > 0)) {
             const game = await contractService.getGame(signer, activeId);
             if (game && game.status === 0) {
                setGameId(activeId);
                setGameState(game);
             }
          }
        } catch (e) {
          console.error("Could not find active game:", e);
        }
      }
    };
    findActiveGame();
  }, [signer, walletAddress]);

  // Effect for game over sounds
  useEffect(() => {
    if (!gameState) return;
    const currentStatus = mapGameStatus(gameState.status);
    const prevStatus = prevGameStatusRef.current;
    const isGameOver = currentStatus !== 'inProgress';

    if (currentStatus !== prevStatus && isGameOver) {
        if (currentStatus === 'win') playSound('win');
        else if (currentStatus === 'loss') playSound('lose');
        else if (currentStatus === 'draw') playSound('draw');
    }
    prevGameStatusRef.current = currentStatus;
  }, [gameState, playSound]);

  // Effect for move sounds
  useEffect(() => {
    if (!gameState) return;

    if (prevMoveCountRef.current === null) {
      prevMoveCountRef.current = gameState.moveCount;
      return;
    }

    if (gameState.moveCount > prevMoveCountRef.current) {
        playSound('place');
    }
    prevMoveCountRef.current = gameState.moveCount;
  }, [gameState, playSound]);


  const handleCreateGame = async (difficulty: Difficulty) => {
    if (!signer) return;
    setIsCreating(true);
    setError(null);
    try {
      const newGameId = await contractService.createGame(signer, difficulty);
      setGameId(newGameId);
      await fetchGameState(newGameId);
    } catch (e: any) {
      console.error("Failed to create game:", e);
      setError(e.message || "Failed to start the game. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handlePlayerMove = async (index: number) => {
    if (isMoving || !signer || gameId === null || gameState?.board[index] !== 0) return;
    setIsMoving(true);
    setError(null);
    try {
      await contractService.playerMove(signer, gameId, index);
      await fetchGameState(gameId);
    } catch (e: any) {
      console.error("Failed to make move:", e);
      setError(e.message || "Your move could not be processed.");
    } finally {
      setIsMoving(false);
    }
  };

  const resetGame = useCallback(() => {
    setGameId(null);
    setGameState(null);
    setError(null);
    prevMoveCountRef.current = null;
    prevGameStatusRef.current = null;
  }, []);

  if (!gameId || !gameState) {
    return <DifficultySelector onSelect={handleCreateGame} isCreating={isCreating} />;
  }
  
  const board = mapBoard(gameState.board);
  const gameStatus = mapGameStatus(gameState.status);
  const isGameOver = gameStatus !== 'inProgress';
  const winningLine = calculateWinnerLine(board);

  let statusText;
  if (isGameOver) {
    if (gameStatus === 'draw') statusText = "It's a Draw!";
    else statusText = gameStatus === 'win' ? 'You Win! 🎉' : 'AI Wins! 🤖';
  } else {
    statusText = isMoving ? 'Submitting Move...' : 'Your Turn (X)';
  }

  return (
    <div className="flex flex-col items-center">
       <div className="relative w-full flex justify-center items-center mb-2">
            <div className={`text-2xl font-semibold transition-colors duration-300 ${gameStatus === 'win' ? 'text-green-400' : gameStatus === 'loss' ? 'text-red-400' : 'text-cyan-400'}`}>
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

      <div className="text-sm text-slate-500 mb-4 font-mono">Game ID: {gameId}</div>
      <Board 
        squares={board} 
        onSquareClick={handlePlayerMove}
        winningLine={winningLine}
        disabled={isMoving || isGameOver}
      />
      {error && (
        <p className="text-red-400 mt-4 text-sm bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-md">
          {error}
        </p>
      )}
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

// --- Helper Functions ---
const calculateWinnerLine = (squares: SquareValue[]): number[] | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
};
