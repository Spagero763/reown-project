// Let ethers be available in the window scope
declare const ethers: any;

// Expanded the `window.ethereum` type to include event listener methods.
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
  }
}

// Connects to an EVM wallet like MetaMask
export const connectWallet = async (): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('EVM wallet not found. Please install a wallet like MetaMask.');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      // Also request to switch to Sepolia testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Chain ID for Sepolia
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          throw new Error('Please add the Sepolia testnet to your wallet.');
        }
        throw switchError;
      }
      return accounts[0];
    } else {
      throw new Error('No accounts found. Please unlock your wallet.');
    }
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Connection request rejected by user.');
    }
    console.error("Wallet connection error:", error);
    throw new Error('Failed to connect wallet.');
  }
};


const reownAppkit = {
  connectWallet,
};

export default reownAppkit;