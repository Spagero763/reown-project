
import React from 'react';
import { Button } from './Button';
import { WalletIcon } from './icons/WalletIcon';

interface HeaderProps {
  walletAddress: string | null;
  onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ walletAddress, onConnect }) => {
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <svg className="w-8 h-8 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-white">Reown</span>
        </div>
        <div>
          {walletAddress ? (
            <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              <span className="text-sm font-mono text-slate-300">{shortAddress}</span>
            </div>
          ) : (
            <Button onClick={onConnect}>
              <WalletIcon className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
