import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useReownAppkit } from '../hooks/useReownAppkit';
import { contractService, GameEvent } from '../services/contractService';
import { Button } from './Button';


const CACHE_KEY_PREFIX = 'tacotex_history_cache_';

export const GameHistory: React.FC = () => {
  const { signer, walletAddress, isConnected } = useReownAppkit();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalGames = history.length;
    if (totalGames === 0) {
      return { wins: 0, losses: 0, draws: 0, total: 0, winRate: 0, lossRate: 0, drawRate: 0 };
    }
    const wins = history.filter((r) => r.result === 'win').length;
    const losses = history.filter((r) => r.result === 'loss').length;
    const draws = history.filter((r) => r.result === 'draw').length;

    return {
      wins, losses, draws,
      total: totalGames,
      winRate: (wins / totalGames) * 100,
      lossRate: (losses / totalGames) * 100,
      drawRate: (draws / totalGames) * 100,
    };
  }, [history]);
  
  const fetchHistory = useCallback(async (forceRefresh = false) => {
    if (!signer || !walletAddress) return;
    
    const cacheKey = `${CACHE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
    
    if (!forceRefresh) {
        try {
            const cachedHistory = localStorage.getItem(cacheKey);
            if (cachedHistory) {
                setHistory(JSON.parse(cachedHistory));
                return;
            }
        } catch (e) {
            console.error("Failed to read history from cache:", e);
        }
    }

    setIsLoading(true);
    setError(null);
    try {
      const events = await contractService.getGameHistory(signer, walletAddress);
      setHistory(events);
      localStorage.setItem(cacheKey, JSON.stringify(events));
    } catch (e: any) {
      console.error("Failed to fetch game history:", e);
      setError("Could not fetch on-chain history.");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [signer, walletAddress]);

  const toggleHistory = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && history.length === 0) {
      fetchHistory();
    }
  };
  
  const clearCache = () => {
    if (walletAddress) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${walletAddress.toLowerCase()}`);
        setHistory([]);
        if (isOpen) { // Refetch if the panel is open
            fetchHistory();
        }
    }
  };

  useEffect(() => {
    // If wallet disconnects, clear the history
    if (!isConnected) {
      setHistory([]);
      setIsOpen(false);
    }
  }, [isConnected]);

  const getResultStyles = (result: 'win' | 'loss' | 'draw') => {
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
          <span className="text-lg font-semibold text-white">On-Chain Game History</span>
          <svg
            className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div id="history-panel" className="p-4 border-t border-cyan-500/20">
            {isLoading ? (
                <p className="text-slate-400 text-center py-4">Loading history from blockchain...</p>
            ) : error ? (
                <p className="text-red-400 text-center py-4">{error}</p>
            ) : history.length > 0 ? (
              <>
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-300 mb-3 text-center">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center bg-slate-800/50 p-4 rounded-lg">
                     <div>
                      <div className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">{stats.lossRate.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400">Loss Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-400">{stats.drawRate.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400">Draw Rate</div>
                    </div>
                  </div>
                   <div className="text-center mt-3 text-sm text-slate-500">
                    Total Games: {stats.total}
                  </div>
                </div>

                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history.map((record) => (
                    <li key={record.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md animate-fade-in">
                       <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${getResultStyles(record.result)}`}>
                          {record.result}
                        </span>
                      <a href={`https://sepolia.etherscan.io/tx/${record.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 font-mono hover:text-cyan-400 transition-colors">
                        Tx: {record.transactionHash.substring(0, 10)}...
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-cyan-500/10 flex justify-center items-center space-x-4">
                    <Button onClick={() => fetchHistory(true)} variant="secondary" size="md" disabled={isLoading}>
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <button onClick={clearCache} className="text-sm text-slate-500 hover:text-red-400 transition-colors duration-200">
                        Clear Cache
                    </button>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-4">No past games found on-chain for this wallet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
