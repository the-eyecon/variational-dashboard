import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSettings } from "../components/mock-provider";
import { getProtocolStatsLive, getMarketsLive } from "../services/variational";
import { mockProtocolStats, mockMarkets } from "../lib/mock-data";
import { ProtocolStats, Market } from "../types";

export function useProtocolStats() {
  const { isMockMode, setLastUpdated } = useSettings();

  const query = useQuery<{ stats: ProtocolStats; markets: Market[] }>({
    queryKey: ["protocolStats", isMockMode],
    queryFn: async () => {
      if (isMockMode) {
        // Mock delay for UI responsiveness verification
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          stats: mockProtocolStats,
          markets: mockMarkets,
        };
      }
      
      const [stats, markets] = await Promise.all([
        getProtocolStatsLive(),
        getMarketsLive(),
      ]);

      return { stats, markets };
    },
    refetchInterval: 60 * 1000, // 60 seconds auto-refresh
    staleTime: 60 * 1000,
    initialData: () => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("cached_protocol_stats_" + isMockMode);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
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
      localStorage.setItem("cached_protocol_stats_" + isMockMode, JSON.stringify(data));
    }
  }, [data, isMockMode]);

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt, setLastUpdated]);

  return query;
}
export type ProtocolStatsQuery = ReturnType<typeof useProtocolStats>;
export default useProtocolStats;
