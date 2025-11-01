export interface Asset {
  id: string;
  tokenId: number;
  name: string;
  imageUrl: string;
  price?: number; // Price can be optional as it might come from a separate marketplace contract
  collection: string;
}