import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import reownAppkit from '../services/reownAppkit';

// Let ethers be available in the window scope
declare const ethers: any;

// 1. Define the shape of the context data
interface ReownAppkitContextValue {
  walletAddress: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
  isWalletAvailable: boolean;
  signer: any | null; // Expose the signer for contract interactions
}

// 2. Create the context
const ReownAppkitContext = createContext<ReownAppkitContextValue | undefined>(undefined);

// 3. Create the Provider component
export const ReownAppkitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [signer, setSigner] = useState<any | null>(null);

  const isConnected = !!walletAddress;

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setSigner(null);
    setError(null);
  }, []);
  
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await reownAppkit.connectWallet();
      setWalletAddress(address);
      
      // Create a new provider and signer once connected
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = provider.getSigner();
      setSigner(signerInstance);

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
        // Update signer when account changes
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
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
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
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
    signer,
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
