import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { useReownAppkit } from './hooks/useReownAppkit';
import { Button } from './components/Button';
import { TicTacToe } from './components/TicTacToe';
import { GameHistory } from './components/GameHistory';

const STORAGE_KEY = 'tacotex_users';

// Helper to get users from localStorage
const getRegisteredUsers = (): string[] => {
  const users = localStorage.getItem(STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Helper to add a user to localStorage
const registerUser = (address: string) => {
  const users = getRegisteredUsers();
  const lowerCaseAddress = address.toLowerCase();
  if (!users.includes(lowerCaseAddress)) {
    users.push(lowerCaseAddress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
};

const App: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    connect, 
    isConnecting,
    error,
    isWalletAvailable,
  } = useReownAppkit();

  const [authStatus, setAuthStatus] = useState<'pending' | 'needsSignUp' | 'authenticated'>('pending');
  const [isOnSepolia, setIsOnSepolia] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsOnSepolia(chainId === '0xaa36a7'); // Sepolia's chain ID
      }
    };

    if (isConnected) {
        checkNetwork();
        window.ethereum?.on('chainChanged', checkNetwork);
    }
    
    return () => {
        window.ethereum?.removeListener('chainChanged', checkNetwork);
    }

  }, [isConnected]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      const users = getRegisteredUsers();
      if (users.includes(walletAddress.toLowerCase())) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('needsSignUp');
      }
    } else {
      setAuthStatus('pending');
    }
  }, [isConnected, walletAddress]);

  const handleSignUp = () => {
    if (walletAddress) {
      registerUser(walletAddress);
      setAuthStatus('authenticated');
    }
  };
  
  const renderContent = () => {
    if (authStatus === 'authenticated') {
      if (!isOnSepolia) {
        return (
             <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-red-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-red-500/10">
                <h2 className="text-3xl font-bold text-white mb-4">Incorrect Network</h2>
                <p className="text-slate-400">
                    This dApp runs on the Sepolia test network. Please switch the network in your wallet to continue.
                </p>
            </div>
        )
      }
      return (
        <div className="w-full flex flex-col items-center">
          <TicTacToe />
          <GameHistory />
        </div>
      );
    }

    if (authStatus === 'needsSignUp') {
      return (
        <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-cyan-500/10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Welcome to TacoTex
          </h1>
          <p className="text-slate-400 mb-8">
            This is your first time here. Complete the sign up to challenge the on-chain AI.
          </p>
          <Button onClick={handleSignUp} size="lg">
            Complete Sign Up
          </Button>
        </div>
      );
    }
    
    // Default: 'pending' state (not connected)
    return (
      <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg shadow-lg shadow-cyan-500/10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white pb-2 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
            TacoTex
          </span>
        </h1>
        <p className="text-slate-400 mb-8">
          The fully on-chain Tic-Tac-Toe game. Connect your wallet to play on the Sepolia testnet.
        </p>
        {isWalletAvailable ? (
          <Button onClick={connect} size="lg" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="text-center text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
            Please install an EVM-compatible wallet to play.
          </div>
        )}
        {error && (
          <p className="text-red-400 mt-4 text-sm bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-md">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0a18] text-gray-100 font-sans flex flex-col">
      <Header walletAddress={walletAddress} />
      
      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        {renderContent()}
      </main>

      <footer className="text-center py-6 border-t border-cyan-500/10 mt-16">
        <p className="text-slate-500">Powered by TacoTex On-Chain</p>
      </footer>
    </div>
  );
};

export default App;
