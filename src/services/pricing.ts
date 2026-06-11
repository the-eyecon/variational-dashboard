// CoinGecko pricing service with robust fallbacks

export interface TokenPrices {
  bitcoin: number;
  ethereum: number;
  arbitrum: number;
  gmx: number;
  "usd-coin": number;
}

const FALLBACK_PRICES: TokenPrices = {
  bitcoin: 67425.5,
  ethereum: 3512.2,
  arbitrum: 1.15,
  gmx: 28.5,
  "usd-coin": 1.0,
};

export async function getLivePrices(): Promise<TokenPrices> {
  try {
    const url = typeof window === "undefined"
      ? "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,arbitrum,gmx,usd-coin&vs_currencies=usd"
      : "/api/prices";
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`CoinGecko pricing request failed: ${res.status}`);
    }
    const data = await res.json();
    return {
      bitcoin: data.bitcoin?.usd ?? FALLBACK_PRICES.bitcoin,
      ethereum: data.ethereum?.usd ?? FALLBACK_PRICES.ethereum,
      arbitrum: data.arbitrum?.usd ?? FALLBACK_PRICES.arbitrum,
      gmx: data.gmx?.usd ?? FALLBACK_PRICES.gmx,
      "usd-coin": data["usd-coin"]?.usd ?? FALLBACK_PRICES["usd-coin"],
    };
  } catch (error) {
    console.warn("CoinGecko pricing error, using fallback prices:", error);
    return FALLBACK_PRICES;
  }
}
