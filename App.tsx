import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { useReownAppkit } from './hooks/useReownAppkit';
import { Button } from './components/Button';
import { TicTacToe } from './components/TicTacToe';

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
      return <TicTacToe />;
    }

    if (authStatus === 'needsSignUp') {
      return (
        <div className="flex flex-col items-center justify-center bg-[#110f2d]/50 border border-cyan-500/20 rounded-xl p-12 text-center max-w-lg animate-fade-in shadow-lg shadow-cyan-500/10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Welcome to TacoTex
          </h1>
          <p className="text-slate-400 mb-8">
            This is your first time here. Complete the sign up to challenge the AI.
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
          The sleek, futuristic Tic-Tac-Toe game. Sign up or log in with your wallet to play.
        </p>
        {isWalletAvailable ? (
          <Button onClick={connect} size="lg" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Sign Up / Login with Wallet'}
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
        <p className="text-slate-500">Powered by TacoTex</p>
      </footer>
    </div>
  );
};

export default App;