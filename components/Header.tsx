import React from 'react';

// A new sleek logo for TacoTex
const TacoTexLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 6L26 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M6 26L26 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="3"/>
  </svg>
);


interface HeaderProps {
  walletAddress: string | null;
}

export const Header: React.FC<HeaderProps> = ({ walletAddress }) => {
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <header className="bg-[#0b0a18]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-cyan-500/20">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <TacoTexLogo className="w-8 h-8 text-cyan-400"/>
          <span className="text-xl font-bold text-white tracking-wider">TacoTex</span>
        </div>
        <div>
          {walletAddress && (
            <div className="flex items-center space-x-3 bg-slate-800/70 border border-slate-700 px-4 py-2 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-mono text-slate-300">{shortAddress}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};