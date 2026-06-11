import { ProtocolStats, Market, TreasuryAsset, TreasuryTransfer, TreasurySummary } from "../types";

// Helper to get formatted timestamps
const getPastDateISO = (hoursAgo: number) => {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
};

export const mockProtocolStats: ProtocolStats = {
  tvl: 107160840, // $107.16M
  totalOpenInterest: 821490320, // $821.49M
  volume24h: 884904030, // $884.90M
  cumulativeVolume: 242922583440, // $242.92B
  marketsListed: 476,
  lossRefundPool: 12500000, // $12.50M
  lossRefundsPaid24h: 350000, // $350k
  lastUpdated: new Date().toISOString(),
};

export const mockMarkets: Market[] = [
  {
    name: "BTC-USDC-PERP",
    price: 67425.5,
    fundingRate: 0.000125, // 0.0125% per 8h (positive, longs pay shorts)
    longOI: 6240000,
    shortOI: 5880000,
    totalOI: 12120000,
    spread: 0.15, // 0.15 USD
    volume24h: 68420000,
    bidPrice: 67425.4,
    askPrice: 67425.6,
  },
  {
    name: "ETH-USDC-PERP",
    price: 3512.2,
    fundingRate: 0.000085, // 0.0085%
    longOI: 4850000,
    shortOI: 4520000,
    totalOI: 9370000,
    spread: 0.02,
    volume24h: 42150000,
    bidPrice: 3512.19,
    askPrice: 3512.21,
  },
  {
    name: "SOL-USDC-PERP",
    price: 154.85,
    fundingRate: -0.000045, // -0.0045% (negative, shorts pay longs)
    longOI: 1850000,
    shortOI: 1950000,
    totalOI: 3800000,
    spread: 0.01,
    volume24h: 18450000,
    bidPrice: 154.84,
    askPrice: 154.86,
  },
  {
    name: "ARB-USDC-PERP",
    price: 1.15,
    fundingRate: 0.00022, // 0.022%
    longOI: 820000,
    shortOI: 680000,
    totalOI: 1500000,
    spread: 0.0002,
    volume24h: 12300000,
    bidPrice: 1.1499,
    askPrice: 1.1501,
  },
  {
    name: "AVAX-USDC-PERP",
    price: 32.4,
    fundingRate: 0.00005, // 0.0050%
    longOI: 520000,
    shortOI: 480000,
    totalOI: 1000000,
    spread: 0.005,
    volume24h: 5800000,
    bidPrice: 32.397,
    askPrice: 32.403,
  },
  {
    name: "OP-USDC-PERP",
    price: 2.35,
    fundingRate: -0.00012, // -0.0120%
    longOI: 220000,
    shortOI: 280000,
    totalOI: 500000,
    spread: 0.0005,
    volume24h: 3400000,
    bidPrice: 2.349,
    askPrice: 2.351,
  },
  {
    name: "LINK-USDC-PERP",
    price: 16.25,
    fundingRate: 0.000015, // 0.0015%
    longOI: 120000,
    shortOI: 110000,
    totalOI: 230000,
    spread: 0.002,
    volume24h: 2100000,
    bidPrice: 16.249,
    askPrice: 16.251,
  },
  {
    name: "GMX-USDC-PERP",
    price: 28.5,
    fundingRate: -0.00008, // -0.0080%
    longOI: 65000,
    shortOI: 67300,
    totalOI: 132300,
    spread: 0.01,
    volume24h: 1600000,
    bidPrice: 28.49,
    askPrice: 28.51,
  },
  {
    name: "US500-USDC-PERP",
    price: 5240.25,
    fundingRate: -0.000015, // -0.0015%
    longOI: 12500000,
    shortOI: 11800000,
    totalOI: 24300000,
    spread: 0.25,
    volume24h: 48500000,
    bidPrice: 5240.10,
    askPrice: 5240.40,
  },
  {
    name: "TSLA-USDC-PERP",
    price: 178.45,
    fundingRate: 0.000065, // 0.0065%
    longOI: 3800000,
    shortOI: 3400000,
    totalOI: 7200000,
    spread: 0.05,
    volume24h: 14200000,
    bidPrice: 178.40,
    askPrice: 178.50,
  },
  {
    name: "XAU-USDC-PERP",
    price: 2345.80,
    fundingRate: 0.00003, // 0.0030%
    longOI: 8400000,
    shortOI: 7800000,
    totalOI: 16200000,
    spread: 0.15,
    volume24h: 24500000,
    bidPrice: 2345.70,
    askPrice: 2345.90,
  },
  {
    name: "BZ-USDC-PERP",
    price: 82.45,
    fundingRate: -0.000045, // -0.0045%
    longOI: 4800000,
    shortOI: 5100000,
    totalOI: 9900000,
    spread: 0.02,
    volume24h: 15400000,
    bidPrice: 82.44,
    askPrice: 82.46,
  },
  {
    name: "NATGAS-USDC-PERP",
    price: 2.85,
    fundingRate: 0.00012, // 0.0120%
    longOI: 1400000,
    shortOI: 1200000,
    totalOI: 2600000,
    spread: 0.001,
    volume24h: 4200000,
    bidPrice: 2.849,
    askPrice: 2.851,
  },
];

export const mockTreasuryAssets: TreasuryAsset[] = [
  {
    token: "USD Coin",
    symbol: "USDC",
    amount: 5420000,
    priceUSD: 1.0,
    valueUSD: 5420000,
    allocationPercentage: 43.53,
    contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    explorerLink: "https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831?a=0x5E91B40467FB8902C46A7B6CB90482363188D645",
  },
  {
    token: "Ethereum",
    symbol: "ETH",
    amount: 1.3252,
    priceUSD: 3512.2,
    valueUSD: 4654.37,
    allocationPercentage: 0.05,
    contractAddress: "native",
    explorerLink: "https://arbiscan.io/address/0x5E91B40467FB8902C46A7B6CB90482363188D645",
  },
  {
    token: "Wrapped BTC",
    symbol: "WBTC",
    amount: 28.45,
    priceUSD: 67425.5,
    valueUSD: 1918255.48,
    allocationPercentage: 15.41,
    contractAddress: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    explorerLink: "https://arbiscan.io/token/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f?a=0x5E91B40467FB8902C46A7B6CB90482363188D645",
  },
  {
    token: "Arbitrum",
    symbol: "ARB",
    amount: 720000,
    priceUSD: 1.15,
    valueUSD: 828000,
    allocationPercentage: 6.65,
    contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    explorerLink: "https://arbiscan.io/token/0x912CE59144191C1204E64559FE8253a0e49E6548?a=0x5E91B40467FB8902C46A7B6CB90482363188D645",
  },
  {
    token: "GMX",
    symbol: "GMX",
    amount: 12240,
    priceUSD: 28.5,
    valueUSD: 348840,
    allocationPercentage: 2.8,
    contractAddress: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    explorerLink: "https://arbiscan.io/token/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a?a=0x5E91B40467FB8902C46A7B6CB90482363188D645",
  },
];

export const mockTreasurySummary: TreasurySummary = {
  totalValueUSD: 8519749.85,
  totalAssetCount: 5,
  largestPositionSymbol: "USDC",
  largestPositionPercentage: 43.53,
  walletAgeDays: 245,
  walletCreatedTimestamp: getPastDateISO(245 * 24),
  transactionCount: 1482,
};

export const mockTreasuryTransfers: TreasuryTransfer[] = [
  {
    hash: "0x12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
    timestamp: getPastDateISO(0.2),
    direction: "outgoing",
    token: "USDC",
    amount: 125000,
    counterparty: "Refund Pool Claimant (0x3a4b...5c6d)",
  },
  {
    hash: "0xb7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    timestamp: getPastDateISO(1.5),
    direction: "incoming",
    token: "ETH",
    amount: 45.2,
    counterparty: "Variational Fee Collector (0x9f8e...7d6c)",
  },
  {
    hash: "0xc8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
    timestamp: getPastDateISO(4.8),
    direction: "incoming",
    token: "USDC",
    amount: 345000,
    counterparty: "Arbitrum Bridge BridgePool",
  },
  {
    hash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    timestamp: getPastDateISO(12),
    direction: "outgoing",
    token: "USDC",
    amount: 500000,
    counterparty: "Variational Insurance Fund Deposit",
  },
  {
    hash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    timestamp: getPastDateISO(18.5),
    direction: "incoming",
    token: "USDC",
    amount: 145000,
    counterparty: "Variational Liquidity Pool Fees",
  },
  {
    hash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    timestamp: getPastDateISO(28),
    direction: "outgoing",
    token: "ARB",
    amount: 25000,
    counterparty: "Arbitrum Foundation DAO Grant return",
  },
  {
    hash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    timestamp: getPastDateISO(36.1),
    direction: "incoming",
    token: "WBTC",
    amount: 2.15,
    counterparty: "Variational Market Maker Settlement",
  },
  {
    hash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    timestamp: getPastDateISO(45.5),
    direction: "incoming",
    token: "USDC",
    amount: 88500,
    counterparty: "Coingecko Pricing Cache Oracle",
  },
  {
    hash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    timestamp: getPastDateISO(72),
    direction: "outgoing",
    token: "ETH",
    amount: 15.0,
    counterparty: "Gas Relayer Subsidy Funding (0x1122...3344)",
  },
  {
    hash: "0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    timestamp: getPastDateISO(96),
    direction: "incoming",
    token: "USDC",
    amount: 1205000,
    counterparty: "Protocol Seed VC Round Deposit",
  },
];

// Historical time-series data for analytics charts
export const mockHistoricalOI = [
  { time: "05/30", "BTC-USDC-PERP": 11.2, "ETH-USDC-PERP": 8.5, others: 4.1, total: 23.8 },
  { time: "06/01", "BTC-USDC-PERP": 11.4, "ETH-USDC-PERP": 8.8, others: 4.2, total: 24.4 },
  { time: "06/02", "BTC-USDC-PERP": 11.8, "ETH-USDC-PERP": 8.9, others: 4.5, total: 25.2 },
  { time: "06/03", "BTC-USDC-PERP": 11.7, "ETH-USDC-PERP": 9.1, others: 4.6, total: 25.4 },
  { time: "06/04", "BTC-USDC-PERP": 12.0, "ETH-USDC-PERP": 9.0, others: 4.8, total: 25.8 },
  { time: "06/05", "BTC-USDC-PERP": 12.2, "ETH-USDC-PERP": 9.2, others: 5.1, total: 26.5 },
  { time: "06/06", "BTC-USDC-PERP": 11.9, "ETH-USDC-PERP": 9.4, others: 5.3, total: 26.6 },
  { time: "06/07", "BTC-USDC-PERP": 12.1, "ETH-USDC-PERP": 9.3, others: 5.5, total: 26.9 },
  { time: "06/08", "BTC-USDC-PERP": 12.3, "ETH-USDC-PERP": 9.5, others: 5.8, total: 27.6 },
  { time: "06/09", "BTC-USDC-PERP": 12.1, "ETH-USDC-PERP": 9.3, others: 7.0, total: 28.4 },
];

export const mockHistoricalFunding = [
  { time: "06/01", "BTC-USDC-PERP": 0.012, "ETH-USDC-PERP": 0.008, "SOL-USDC-PERP": -0.004 },
  { time: "06/02", "BTC-USDC-PERP": 0.015, "ETH-USDC-PERP": 0.010, "SOL-USDC-PERP": -0.002 },
  { time: "06/03", "BTC-USDC-PERP": 0.009, "ETH-USDC-PERP": 0.006, "SOL-USDC-PERP": -0.005 },
  { time: "06/04", "BTC-USDC-PERP": 0.004, "ETH-USDC-PERP": 0.002, "SOL-USDC-PERP": -0.008 },
  { time: "06/05", "BTC-USDC-PERP": 0.012, "ETH-USDC-PERP": 0.009, "SOL-USDC-PERP": -0.003 },
  { time: "06/06", "BTC-USDC-PERP": 0.018, "ETH-USDC-PERP": 0.014, "SOL-USDC-PERP": 0.001 },
  { time: "06/07", "BTC-USDC-PERP": 0.013, "ETH-USDC-PERP": 0.008, "SOL-USDC-PERP": -0.004 },
];

export const mockHistoricalVolume = [
  { date: "06/03", volume: 112.4 },
  { date: "06/04", volume: 134.8 },
  { date: "06/05", volume: 145.2 },
  { date: "06/06", volume: 151.0 },
  { date: "06/07", volume: 122.5 },
  { date: "06/08", volume: 139.1 },
  { date: "06/09", volume: 154.2 },
];
