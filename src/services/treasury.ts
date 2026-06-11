import { TreasuryAsset, TreasuryTransfer, TreasurySummary } from "../types";
import { mockTreasuryAssets, mockTreasuryTransfers, mockTreasurySummary } from "../lib/mock-data";
import { getLivePrices } from "./pricing";

const WALLET_ADDRESS = "0x5E91B40467FB8902C46A7B6CB90482363188D645";
const getArbiscanUrl = () => {
  if (typeof window === "undefined") {
    return "https://api.arbiscan.io/api";
  }
  return "/api/treasury";
};

interface TokenInfo {
  symbol: string;
  contract: string;
  decimals: number;
  name: string;
  coingeckoId: string;
}

const TOKENS: TokenInfo[] = [
  {
    symbol: "USDC",
    contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    name: "USD Coin",
    coingeckoId: "usd-coin",
  },
  {
    symbol: "ETH",
    contract: "native",
    decimals: 18,
    name: "Ethereum",
    coingeckoId: "ethereum",
  },
  {
    symbol: "WBTC",
    contract: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    decimals: 8,
    name: "Wrapped BTC",
    coingeckoId: "bitcoin",
  },
  {
    symbol: "ARB",
    contract: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimals: 18,
    name: "Arbitrum",
    coingeckoId: "arbitrum",
  },
  {
    symbol: "GMX",
    contract: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    decimals: 18,
    name: "GMX",
    coingeckoId: "gmx",
  },
];

export async function getTreasuryAssetsLive(): Promise<TreasuryAsset[]> {
  try {
    // 1. Fetch live prices from CoinGecko
    const prices = await getLivePrices();

    // 2. Map prices to coingecko ids
    const priceMap: Record<string, number> = {
      USDC: prices["usd-coin"],
      ETH: prices.ethereum,
      WBTC: prices.bitcoin,
      ARB: prices.arbitrum,
      GMX: prices.gmx,
    };

    // 3. Try to fetch balances from Arbiscan (without key, rate limits apply)
    const assetsPromises = TOKENS.map(async (t) => {
      try {
        const url = `${getArbiscanUrl()}?module=account&action=tokenbalance&contractaddress=${t.contract}&address=${WALLET_ADDRESS}&tag=latest`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Arbiscan status not ok");
        const data = await res.json();
        
        if (data.status === "1" && data.result) {
          const rawBalance = Number(data.result);
          const amount = rawBalance / Math.pow(10, t.decimals);
          const priceUSD = priceMap[t.symbol] ?? 0;
          const valueUSD = amount * priceUSD;
          return {
            token: t.name,
            symbol: t.symbol,
            amount,
            priceUSD,
            valueUSD,
            allocationPercentage: 0, // calculated later
            contractAddress: t.contract,
            explorerLink: t.contract === "native" 
              ? `https://arbiscan.io/address/${WALLET_ADDRESS}`
              : `https://arbiscan.io/token/${t.contract}?a=${WALLET_ADDRESS}`,
          };
        }
        throw new Error(data.message || "Invalid balance output");
      } catch {
        // Return standard mock asset as fallback for this specific token
        const mockAsset = mockTreasuryAssets.find((ma) => ma.symbol === t.symbol)!;
        const priceUSD = priceMap[t.symbol] ?? mockAsset.priceUSD;
        return {
          ...mockAsset,
          priceUSD,
          valueUSD: mockAsset.amount * priceUSD,
        };
      }
    });

    const assets = await Promise.all(assetsPromises);

    // 4. Calculate total value and allocation percentages
    const totalVal = assets.reduce((acc, curr) => acc + curr.valueUSD, 0);
    return assets.map((a) => ({
      ...a,
      allocationPercentage: totalVal > 0 ? (a.valueUSD / totalVal) * 100 : 0,
    }));
  } catch (error) {
    console.warn("Failed to get live treasury assets, falling back to mock:", error);
    return mockTreasuryAssets;
  }
}

export async function getTreasurySummaryLive(assets: TreasuryAsset[]): Promise<TreasurySummary> {
  try {
    const totalValueUSD = assets.reduce((acc, curr) => acc + curr.valueUSD, 0);
    const totalAssetCount = assets.filter((a) => a.amount > 0).length;

    // Find largest position
    let largest = assets[0];
    for (const asset of assets) {
      if (asset.valueUSD > largest.valueUSD) {
        largest = asset;
      }
    }

    return {
      totalValueUSD,
      totalAssetCount,
      largestPositionSymbol: largest ? largest.symbol : "N/A",
      largestPositionPercentage: largest && totalValueUSD > 0 ? (largest.valueUSD / totalValueUSD) * 100 : 0,
      walletAgeDays: mockTreasurySummary.walletAgeDays,
      walletCreatedTimestamp: mockTreasurySummary.walletCreatedTimestamp,
      transactionCount: mockTreasurySummary.transactionCount,
    };
  } catch {
    return mockTreasurySummary;
  }
}

export async function getTreasuryTransfersLive(): Promise<TreasuryTransfer[]> {
  try {
    const url = `${getArbiscanUrl()}?action=transfers&address=${WALLET_ADDRESS}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch transfers");
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Failed to fetch live transactions, returning mock data:", error);
    return mockTreasuryTransfers;
  }
}
