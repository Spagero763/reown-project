import { useState, useEffect, useCallback } from 'react';
import type { Asset } from '../types';
import reownAppkit from '../services/reownAppkit';

// Fix: Removed conflicting global declaration for `window.ethereum`.
export const useReownAppkit = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  // State for purchase flow
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null); // Stores ID of asset being purchased
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null); // Stores tx hash

  const isConnected = !!walletAddress;

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setAssets([]);
    setError(null);
  }, []);

  const loadAssets = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedAssets = await reownAppkit.fetchAssets();
      setAssets(fetchedAssets);
    } catch (err: any) {
      console.error("Failed to fetch assets:", err);
      setError(err.message || 'Failed to load assets.');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);
  
  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await reownAppkit.connectWallet();
      setWalletAddress(address);
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      setError(err.message || 'An unknown error occurred.');
      disconnect();
    } finally {
      setLoading(false);
    }
  }, [disconnect]);

  const handlePurchase = async (asset: Asset) => {
    if (!walletAddress) {
      setPurchaseError("Please connect your wallet first.");
      return;
    }
    setIsPurchasing(asset.id);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
      const txHash = await reownAppkit.purchaseAsset(asset, walletAddress);
      setPurchaseSuccess(`Transaction submitted! Hash: ${txHash}`);
    } catch (err: any) {
      setPurchaseError(err.message || 'Purchase failed.');
    } finally {
      setIsPurchasing(null);
    }
  };

  // Check for wallet availability on initial load
  useEffect(() => {
    setIsWalletAvailable(typeof window.ethereum !== 'undefined');
    setLoading(false);
  }, []);

  // Load assets when wallet is connected
  useEffect(() => {
    if (isConnected) {
      loadAssets();
    }
  }, [isConnected, loadAssets]);

  // Set up wallet event listeners
  useEffect(() => {
    // Fix: Added a direct check for `window.ethereum` to ensure it exists before use.
    if (!isWalletAvailable || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      // A simple way to handle chain changes is to reload the app.
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isWalletAvailable, disconnect]);

  return {
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
  };
};