import React from 'react';
import type { Asset } from '../types';
import { Button } from './Button';

interface AssetCardProps {
  asset: Asset;
  isConnected: boolean;
  onPurchase: () => void;
  isPurchasing: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, isConnected, onPurchase, isPurchasing }) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden group border border-slate-700 hover:border-sky-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="relative">
        <img src={asset.imageUrl} alt={asset.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
      </div>
      <div className="p-5">
        <p className="text-sm text-sky-400 font-medium">{asset.collection}</p>
        <h3 className="text-xl font-bold text-white mt-1 truncate">{asset.name}</h3>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Price</p>
            <p className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-1.5 text-slate-400" viewBox="0 0 320 512" fill="currentColor"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/></svg>
              {asset.price} ETH
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button 
            fullWidth 
            disabled={!isConnected || isPurchasing}
            onClick={onPurchase}
          >
            {isPurchasing ? 'Purchasing...' : 'Buy Now'}
          </Button>
          <Button variant="secondary" fullWidth disabled={!isConnected || isPurchasing}>Make Offer</Button>
        </div>
      </div>
    </div>
  );
};