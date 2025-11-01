import type { Asset } from '../types';

// Let ethers be available in the window scope
declare const ethers: any;

// Fix: Expanded the `window.ethereum` type to include event listener methods.
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
  }
}

// A real, verified NFT contract on the Sepolia testnet
const NFT_CONTRACT_ADDRESS = '0x1E361e273d2a781b9Ea45E2aF0f76964D421271B'; // Example: A simple ERC721 contract
const NFT_CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)", // For simulating purchase
];

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
    throw new Error('Failed to connect wallet. Make sure you are on the Sepolia testnet.');
  }
};

// Fetches digital assets from the blockchain
export const fetchAssets = async (): Promise<Asset[]> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('EVM wallet not found.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

  try {
    const collectionName = await contract.name();
    const totalSupply = await contract.totalSupply();
    const assets: Asset[] = [];

    // Fetch last 5 tokens for performance
    const limit = Math.min(5, totalSupply.toNumber());

    for (let i = 0; i < limit; i++) {
      const tokenId = totalSupply.toNumber() - i;
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        // Standard IPFS gateway
        const metadataUrl = tokenURI.startsWith('ipfs://') 
          ? `https://ipfs.io/ipfs/${tokenURI.split('ipfs://')[1]}`
          : tokenURI;

        const metadataResponse = await fetch(metadataUrl);
        if (!metadataResponse.ok) continue; // Skip if metadata is not available

        const metadata = await metadataResponse.json();
        const imageUrl = metadata.image.startsWith('ipfs://')
          ? `https://ipfs.io/ipfs/${metadata.image.split('ipfs://')[1]}`
          : metadata.image;

        assets.push({
          id: `${NFT_CONTRACT_ADDRESS}-${tokenId}`,
          tokenId: tokenId,
          name: metadata.name || `Token #${tokenId}`,
          collection: collectionName,
          imageUrl: imageUrl,
          price: Math.round((Math.random() * 5 + 0.5) * 100) / 100 // Mock price for now
        });
      } catch (e) {
        console.warn(`Could not fetch metadata for token ID ${tokenId}:`, e);
      }
    }
    return assets;
  } catch (error) {
    console.error("Error fetching assets from contract:", error);
    throw new Error("Could not fetch assets from the blockchain. Ensure you're on the Sepolia network.");
  }
};

// Simulates purchasing an asset by initiating a transaction
export const purchaseAsset = async (asset: Asset, userAddress: string): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('EVM wallet not found.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

  try {
    // This is a placeholder for a real marketplace 'buy' function.
    // We simulate by calling 'safeTransferFrom' to the user's own address.
    // In a real app, this would be from the current owner to the buyer.
    // The contract we are using does not have a public mint or buy function,
    // so we call a function that requires a signature to demonstrate the flow.
    // This will likely fail if the user is not the owner, which is fine for a demo.
    console.log(`Simulating purchase of token ${asset.tokenId} for ${userAddress}`);
    const tx = await contract.safeTransferFrom(userAddress, userAddress, asset.tokenId);
    
    // In a real scenario, you would wait for the transaction to be mined:
    // await tx.wait();
    
    return tx.hash; // Return transaction hash on success
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user.');
    }
    // This error is expected if the user doesn't own the NFT they are "buying"
    console.warn("Transaction simulation failed (this is expected in the demo):", error.reason);
    throw new Error(error.reason || 'Transaction failed. This is expected if you are not the owner.');
  }
};


const reownAppkit = {
  connectWallet,
  fetchAssets,
  purchaseAsset,
};

export default reownAppkit;