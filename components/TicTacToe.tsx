import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './Board';
import { Button } from './Button';

type Player = 'X' | 'O';
type SquareValue = Player | null;
type Difficulty = 'easy' | 'medium' | 'hard';

// --- Pure Helper Functions ---

const calculateWinner = (squares: SquareValue[]): { winner: Player; line: number[] } | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, line: lines[i] };
    }
  }
  return null;
};

// --- AI Logic ---

// Hard Difficulty: Unbeatable Minimax Algorithm
const minimax = (newBoard: SquareValue[], player: Player): { score: number } | { index: number } => {
  const availableSpots = newBoard.map((s, i) => s === null ? i : null).filter(s => s !== null);

  const winningInfo = calculateWinner(newBoard);
  if (winningInfo?.winner === 'X') {
    return { score: -10 };
  } else if (winningInfo?.winner === 'O') {
    return { score: 10 };
  } else if (availableSpots.length === 0) {
    return { score: 0 };
  }

  const moves: { index: number, score: number }[] = [];
  for (let i = 0; i < availableSpots.length; i++) {
    const index = availableSpots[i] as number;
    const move: { index: number, score: number } = { index, score: 0 };
    newBoard[index] = player;

    if (player === 'O') {
      const result = minimax(newBoard, 'X');
      move.score = (result as { score: number }).score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = (result as { score: number }).score;
    }
    newBoard[index] = null;
    moves.push(move);
  }

  let bestMove = 0;
  if (player === 'O') {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
};


const getAIMove = (board: SquareValue[], difficulty: Difficulty): number => {
  const emptySquares = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];

  switch (difficulty) {
    case 'hard': {
      const bestMove = minimax(board.slice(), 'O') as { index: number };
      return bestMove.index;
    }
    case 'medium': {
      // 1. Check if AI can win
      for (const move of emptySquares) {
        const boardCopy = board.slice();
        boardCopy[move] = 'O';
        if (calculateWinner(boardCopy)?.winner === 'O') return move;
      }
      // 2. Check if player is about to win and block them
      for (const move of emptySquares) {
        const boardCopy = board.slice();
        boardCopy[move] = 'X';
        if (calculateWinner(boardCopy)?.winner === 'X') return move;
      }
      // 3. Fallback to easy
      const randomIndex = Math.floor(Math.random() * emptySquares.length);
      return emptySquares[randomIndex];
    }
    case 'easy':
    default: {
      const randomIndex = Math.floor(Math.random() * emptySquares.length);
      return emptySquares[randomIndex];
    }
  }
};


// --- Components ---

const DifficultySelector: React.FC<{ onSelect: (level: Difficulty) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-cyan-500/10">
    <h2 className="text-3xl font-bold text-white mb-2">Select Difficulty</h2>
    <p className="text-slate-400 mb-8">Choose your opponent.</p>
    <div className="w-full space-y-4">
      <Button onClick={() => onSelect('easy')} size="lg" fullWidth variant="secondary">
        <div className="flex justify-between items-center w-full">
          <span>Easy</span>
          <span className="font-normal text-sm text-slate-300">Random Moves</span>
        </div>
      </Button>
      <Button onClick={() => onSelect('medium')} size="lg" fullWidth variant="secondary">
        <div className="flex justify-between items-center w-full">
          <span>Medium</span>
          <span className="font-normal text-sm text-slate-300">Strategic</span>
        </div>
      </Button>
      <Button onClick={() => onSelect('hard')} size="lg" fullWidth variant="secondary">
        <div className="flex justify-between items-center w-full">
          <span>Hard</span>
          <span className="font-normal text-sm text-slate-300">Unbeatable</span>
        </div>
      </Button>
    </div>
  </div>
);

export const TicTacToe: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [gameResult, setGameResult] = useState<{ winner: Player | 'draw'; line: number[] | null } | null>(null);

  const handlePlayerMove = (index: number) => {
    if (board[index] || gameResult || !isPlayerTurn) return;

    const newBoard = board.slice();
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameResult(null);
  }, []);

  const changeDifficulty = useCallback(() => {
    resetGame();
    setDifficulty(null);
  }, [resetGame]);
  
  // Game logic effect
  useEffect(() => {
    const winnerInfo = calculateWinner(board);
    if (winnerInfo) {
      setGameResult({ winner: winnerInfo.winner, line: winnerInfo.line });
      return;
    }
    if (board.every(square => square !== null)) {
      setGameResult({ winner: 'draw', line: null });
      return;
    }

    if (!isPlayerTurn && difficulty) {
      const timeoutId = setTimeout(() => {
        const aiMove = getAIMove(board.slice(), difficulty);
        if (aiMove !== undefined) {
          const newBoard = board.slice();
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [board, isPlayerTurn, difficulty]);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  let status;
  if (gameResult) {
    if (gameResult.winner === 'draw') status = "It's a Draw!";
    else status = gameResult.winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
  } else {
    status = isPlayerTurn ? 'Your Turn (X)' : "AI's Turn (O)...";
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`text-2xl font-semibold mb-6 transition-colors duration-300 ${gameResult?.winner === 'X' ? 'text-green-400' : gameResult?.winner === 'O' ? 'text-red-400' : 'text-cyan-400'}`}>
        {status}
      </div>
      <Board 
        squares={board} 
        onSquareClick={handlePlayerMove}
        winningLine={gameResult?.line || null}
      />
      {gameResult && (
        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in">
          <Button onClick={resetGame} size="lg">
            Play Again
          </Button>
          <Button onClick={changeDifficulty} size="lg" variant="secondary">
            Change Difficulty
          </Button>
        </div>
      )}
    </div>
  );
};