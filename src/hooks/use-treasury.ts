import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSettings } from "../components/mock-provider";
import { getTreasuryAssetsLive, getTreasurySummaryLive, getTreasuryTransfersLive } from "../services/treasury";
import { mockTreasuryAssets, mockTreasuryTransfers, mockTreasurySummary } from "../lib/mock-data";
import { TreasuryAsset, TreasuryTransfer, TreasurySummary } from "../types";

export function useTreasury() {
  const { isMockMode, setLastUpdated } = useSettings();

  const query = useQuery<{ assets: TreasuryAsset[]; transfers: TreasuryTransfer[]; summary: TreasurySummary }>({
    queryKey: ["treasury", isMockMode],
    queryFn: async () => {
      if (isMockMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return {
          assets: mockTreasuryAssets,
          transfers: mockTreasuryTransfers,
          summary: mockTreasurySummary,
        };
      }

      // Fetch assets and transfers in parallel
      const [assets, transfers] = await Promise.all([
        getTreasuryAssetsLive(),
        getTreasuryTransfersLive(),
      ]);

      // Calculate summary based on current asset prices/balances
      const summary = await getTreasurySummaryLive(assets);

      return { assets, transfers, summary };
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for treasury transfers
    staleTime: 30 * 1000,
    initialData: () => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("cached_treasury_" + isMockMode);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            return undefined;
          }
        }
      }
      return undefined;
    }
  });

  const { data, dataUpdatedAt } = query;

  useEffect(() => {
    if (data && typeof window !== "undefined") {
      localStorage.setItem("cached_treasury_" + isMockMode, JSON.stringify(data));
    }
  }, [data, isMockMode]);

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt, setLastUpdated]);

  return query;
}

export default useTreasury;
