import { ProtocolStats, Market } from "../types";
import { mockProtocolStats, mockMarkets } from "../lib/mock-data";

interface RawListing {
  ticker?: string;
  symbol?: string;
  market_id?: string;
  price?: number;
  mark_price?: number;
  markPrice?: number;
  fundingRate?: number;
  funding_rate?: number;
  funding?: number;
  open_interest?: {
    long_open_interest?: number;
    short_open_interest?: number;
  };
  longOI?: number;
  longOpenInterest?: number;
  shortOI?: number;
  shortOpenInterest?: number;
  base_spread_bps?: number;
  spread?: number;
  volume_24h?: number;
  volume24h?: number;
  quotes?: {
    base?: {
      bid?: number;
      ask?: number;
    };
  };
  bidPrice?: number;
  bid?: number;
  askPrice?: number;
  ask?: number;
}

interface RawMarketStat {
  mark_price?: number;
  price?: number;
  long_oi?: number;
  long_open_interest?: number;
  short_oi?: number;
  short_open_interest?: number;
  funding_rate?: number;
  funding?: number;
  spread?: number;
  volume_24h?: number;
  volume24h?: number;
  volume?: number;
  bid?: number;
  ask?: number;
}

const getFetchUrl = () => {
  if (typeof window === "undefined") {
    return "https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats";
  }
  return "/api/variational";
};

export async function getProtocolStatsLive(): Promise<ProtocolStats> {
  try {
    const res = await fetch(getFetchUrl());
    if (!res.ok) {
      throw new Error(`Variational API returned status: ${res.status}`);
    }
    const data = await res.json();
    
    // Normalize properties matching the live JSON fields exactly
    return {
      tvl: Number(data.tvl ?? mockProtocolStats.tvl),
      totalOpenInterest: Number(data.open_interest ?? data.open_interest_usd ?? mockProtocolStats.totalOpenInterest),
      volume24h: Number(data.total_volume_24h ?? data.volume_24h_usd ?? mockProtocolStats.volume24h),
      cumulativeVolume: Number(data.cumulative_volume ?? data.cumulative_volume_usd ?? mockProtocolStats.cumulativeVolume),
      marketsListed: Number(data.num_markets ?? data.markets_listed ?? mockProtocolStats.marketsListed),
      lossRefundPool: Number(data.loss_refund?.pool_size && data.loss_refund?.pool_size !== "0" && data.loss_refund?.pool_size !== 0 ? data.loss_refund.pool_size : mockProtocolStats.lossRefundPool),
      lossRefundsPaid24h: Number(data.loss_refund?.refunded_24h && data.loss_refund?.refunded_24h !== "0" && data.loss_refund?.refunded_24h !== 0 ? data.loss_refund.refunded_24h : mockProtocolStats.lossRefundsPaid24h),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Error fetching live protocol stats, falling back to mock:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...mockProtocolStats,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getMarketsLive(): Promise<Market[]> {
  try {
    const res = await fetch(getFetchUrl());
    if (!res.ok) {
      throw new Error(`Variational API returned status: ${res.status}`);
    }
    const data = await res.json();

    // Map markets from live data.listings array
    if (data.listings && Array.isArray(data.listings)) {
      return data.listings.map((m: RawListing) => {
        const ticker = String(m.ticker ?? m.symbol ?? m.market_id ?? "UNKNOWN");
        // Convert ticker SNT to SNT-USDC-PERP for uniform display
        const name = ticker.endsWith("-USDC-PERP") ? ticker : `${ticker}-USDC-PERP`;
        
        const price = Number(m.price ?? m.mark_price ?? m.markPrice ?? 0);
        const fundingRate = Number(m.fundingRate ?? m.funding_rate ?? m.funding ?? 0);
        
        // Parse open interest (already in USD)
        const longOI = Number(m.open_interest?.long_open_interest ?? m.longOI ?? m.longOpenInterest ?? 0);
        const shortOI = Number(m.open_interest?.short_open_interest ?? m.shortOI ?? m.shortOpenInterest ?? 0);
        const totalOI = longOI + shortOI;
        
        // base spread bps
        const spread = Number(m.base_spread_bps ?? m.spread ?? 0);
        
        // Parse volume (already in USD)
        const volume24h = Number(m.volume_24h ?? m.volume24h ?? 0);
        
        const bidPrice = Number(m.quotes?.base?.bid ?? m.bidPrice ?? m.bid ?? 0);
        const askPrice = Number(m.quotes?.base?.ask ?? m.askPrice ?? m.ask ?? 0);

        return {
          name,
          price,
          fundingRate,
          longOI,
          shortOI,
          totalOI,
          spread,
          volume24h,
          bidPrice,
          askPrice,
        };
      });
    }
    
    // Check if there is a flat market object mapping (fallback)
    if (data.market_stats && typeof data.market_stats === "object") {
      return Object.entries(data.market_stats as Record<string, RawMarketStat>).map(([key, val]) => {
        const price = Number(val.mark_price ?? val.price ?? 0);
        const longOI = Number(val.long_oi ?? val.long_open_interest ?? 0);
        const shortOI = Number(val.short_oi ?? val.short_open_interest ?? 0);
        return {
          name: key,
          price,
          fundingRate: Number(val.funding_rate ?? val.funding ?? 0),
          longOI,
          shortOI,
          totalOI: longOI + shortOI,
          spread: Number(val.spread ?? 0),
          volume24h: Number(val.volume_24h ?? val.volume ?? 0),
          bidPrice: Number(val.bid ?? 0),
          askPrice: Number(val.ask ?? 0),
        };
      });
    }

    throw new Error("No listings or market stats found in live API response");
  } catch (error) {
    console.warn("Error fetching live markets list, falling back to mock:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockMarkets;
  }
}
