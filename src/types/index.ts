export interface ProtocolStats {
  tvl: number;
  totalOpenInterest: number;
  volume24h: number;
  cumulativeVolume: number;
  marketsListed: number;
  lossRefundPool: number;
  lossRefundsPaid24h: number;
  lastUpdated: string;
}

export interface Market {
  name: string; // e.g. BTC-USDC-PERP, ETH-USDC-PERP, SOL-USDC-PERP
  price: number;
  fundingRate: number; // e.g. 0.0001 (0.01%)
  longOI: number;
  shortOI: number;
  totalOI: number;
  spread: number; // e.g. 0.0005 (0.05%)
  volume24h: number;
  bidPrice: number;
  askPrice: number;
}

export interface TreasuryAsset {
  token: string; // Full name, e.g. USD Coin
  symbol: string; // e.g. USDC
  amount: number;
  priceUSD: number;
  valueUSD: number;
  allocationPercentage: number;
  contractAddress: string;
  explorerLink: string;
}

export interface TreasuryTransfer {
  hash: string;
  timestamp: string; // ISO format
  direction: "incoming" | "outgoing";
  token: string; // Symbol, e.g. USDC
  amount: number;
  counterparty: string;
}

export interface TreasurySummary {
  totalValueUSD: number;
  totalAssetCount: number;
  largestPositionSymbol: string;
  largestPositionPercentage: number;
  walletAgeDays: number;
  walletCreatedTimestamp: string;
  transactionCount: number;
}
