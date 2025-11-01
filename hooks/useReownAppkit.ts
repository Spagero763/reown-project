import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import reownAppkit from '../services/reownAppkit';

// 1. Define the shape of the context data
interface ReownAppkitContextValue {
  walletAddress: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
  isWalletAvailable: boolean;
}

// 2. Create the context
const ReownAppkitContext = createContext<ReownAppkitContextValue | undefined>(undefined);

// 3. Create the Provider component
export const ReownAppkitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  const isConnected = !!walletAddress;

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setError(null);
  }, []);
  
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await reownAppkit.connectWallet();
      setWalletAddress(address);
    } catch (err: any)      {
      console.error("Failed to connect wallet:", err);
      setError(err.message || 'An unknown error occurred.');
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect]);

  // Check for wallet availability on initial load
  useEffect(() => {
    setIsWalletAvailable(typeof window.ethereum !== 'undefined');
  }, []);


  // Set up wallet event listeners
  useEffect(() => {
    if (!isWalletAvailable || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isWalletAvailable, disconnect]);

  // 4. The value provided to consumers
  const value = {
    walletAddress,
    isConnected,
    connect,
    isConnecting,
    error,
    isWalletAvailable,
  };

  return React.createElement(ReownAppkitContext.Provider, { value }, children);
};

// 5. The consumer hook
export const useReownAppkit = () => {
  const context = useContext(ReownAppkitContext);
  if (context === undefined) {
    throw new Error('useReownAppkit must be used within a ReownAppkitProvider');
  }
  return context;
};