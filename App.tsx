import React from 'react';
import { Header } from './components/Header';
import { AssetCard } from './components/AssetCard';
import { useReownAppkit } from './hooks/useReownAppkit';
import { WalletIcon } from './components/icons/WalletIcon';
import { Button } from './components/Button';

const App: React.FC = () => {
  const { 
    assets, 
    walletAddress, 
    isConnected, 
    connect, 
    loading, 
    error,
    isWalletAvailable,
    handlePurchase,
    isPurchasing,
    purchaseError,
    purchaseSuccess,
  } = useReownAppkit();

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans">
      <Header walletAddress={walletAddress} onConnect={connect} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 pb-2">
            Digital Asset Marketplace
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mt-2 max-w-2xl mx-auto">
            Explore digital collectibles from a real smart contract on the Sepolia testnet.
          </p>
        </div>

        {/* Transaction Status Notifications */}
        {purchaseSuccess && (
          <div className="mb-8 p-4 text-sm text-green-300 bg-green-900/30 border border-green-500/50 rounded-lg text-center">
            {purchaseSuccess}
          </div>
        )}
        {purchaseError && (
          <div className="mb-8 p-4 text-sm text-red-300 bg-red-900/30 border border-red-500/50 rounded-lg text-center">
            {purchaseError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : !isConnected ? (
          <div className="flex flex-col items-center justify-center bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <WalletIcon className="w-16 h-16 text-sky-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {isWalletAvailable ? 'Connect Your Wallet' : 'Wallet Not Detected'}
            </h2>
            <p className="text-slate-400 mb-6 max-w-sm">
              {isWalletAvailable
                ? 'Connect your wallet to view on-chain assets from the Sepolia testnet.'
                : 'Please install an EVM-compatible wallet like MetaMask to continue.'
              }
            </p>
            {isWalletAvailable ? (
              <Button onClick={connect} size="lg">Connect Wallet</Button>
            ) : (
              <Button as="a" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" size="lg">
                Install MetaMask
              </Button>
            )}
            {error && (
              <p className="text-red-400 mt-4 text-sm bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-md">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                isConnected={isConnected}
                onPurchase={() => handlePurchase(asset)}
                isPurchasing={isPurchasing === asset.id}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-6 border-t border-slate-800 mt-16">
        <p className="text-slate-500">© 2024 Reown. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;