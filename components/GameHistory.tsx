import React, { useState } from 'react';

type GameResultOutcome = 'win' | 'loss' | 'draw';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameRecord {
  id: string;
  result: GameResultOutcome;
  difficulty: Difficulty;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = 'tacotex_game_history';

export const GameHistory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<GameRecord[]>([]);

  const toggleHistory = () => {
    if (!isOpen) {
      // Refresh history from storage when opening
      try {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      } catch (e) {
        console.error("Failed to parse game history:", e);
        setHistory([]);
      }
    }
    setIsOpen(!isOpen);
  };
  
  const clearHistory = () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  };

  const getResultStyles = (result: GameResultOutcome) => {
    switch (result) {
      case 'win': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'loss': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'draw': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="w-full max-w-md mt-12 animate-fade-in">
      <div className="border border-cyan-500/20 rounded-lg bg-[#110f2d]/50 overflow-hidden">
        <button
          className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:bg-slate-700/50"
          onClick={toggleHistory}
          aria-expanded={isOpen}
          aria-controls="history-panel"
        >
          <span className="text-lg font-semibold text-white">Game History</span>
          <svg
            className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div id="history-panel" className="p-4 border-t border-cyan-500/20">
            {history.length > 0 ? (
              <>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history.map((record) => (
                    <li key={record.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md animate-fade-in">
                      <div>
                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${getResultStyles(record.result)}`}>
                          {record.result}
                        </span>
                        <span className="ml-3 text-sm text-slate-300 capitalize">
                          vs {record.difficulty} AI
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                    <button onClick={clearHistory} className="text-sm text-slate-500 hover:text-red-400 transition-colors duration-200">
                        Clear History
                    </button>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-4">No past games found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};