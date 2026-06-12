"use client";

import React, { useState, useMemo } from "react";
import { useProtocolStats } from "../../hooks/use-protocol-stats";
import KpiCard from "../../components/kpi-card";
import { 
  formatUSD, 
  formatCompactUSD, 
  formatPercent, 
  cn 
} from "../../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  BarChart2, 
  Flame,
  Globe,
  SearchX,
  X,
  ExternalLink,
  Activity,
  Scale,
  Percent,
  Landmark
} from "lucide-react";
import { Market } from "../../types";

const RWA_TICKERS = new Set([
  "US500", "SPY", "QQQ", "SOXL", "EWJ",
  "TSLA", "TSM", "INTC", "QCOM", "RKLB",
  "NATGAS", "BZ", "COPPER", "XAU", "XAUT", "XAG", "XPD", "XPT",
  "C", "M", "US"
]);

function isRWAMarket(marketName: string): boolean {
  const ticker = marketName.split("-")[0];
  return RWA_TICKERS.has(ticker);
}

interface FundingTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      fundingRate: number;
    };
  }>;
  label?: string;
}

const FundingTooltip = ({ active, payload, label }: FundingTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const data = payload[0].payload;
    const ticker = data?.name || label;
    const isPositive = value >= 0;
    return (
      <div className="bg-[#09090B] border border-[#27272A] p-2.5 rounded shadow-xl text-xs font-mono">
        <div className="font-bold text-white uppercase mb-1">{ticker}</div>
        <div className="flex items-center space-x-1.5">
          <span className="text-text-secondary">Funding (8h):</span>
          <span className={`font-bold ${isPositive ? "text-success" : "text-danger"}`}>
            {isPositive ? "+" : ""}{Number(value).toFixed(4)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function MarketsPage() {
  const { data: protocolData, isLoading, isError } = useProtocolStats();
  
  // Interactive Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Market>("totalOI");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [activeTab, setActiveTab] = useState<"perpetual_future" | "perpetual_rwa_future">("perpetual_future");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  // Helper to resolve display name
  const getMarketFriendlyName = (name: string) => {
    const ticker = name.split("-")[0];
    const mapping: Record<string, string> = {
      BTC: "Bitcoin Spot Index Perpetual",
      ETH: "Ethereum Spot Index Perpetual",
      SOL: "Solana Spot Index Perpetual",
      ARB: "Arbitrum Spot Index Perpetual",
      AVAX: "Avalanche Spot Index Perpetual",
      OP: "Optimism Spot Index Perpetual",
      LINK: "Chainlink Spot Index Perpetual",
      GMX: "GMX Spot Index Perpetual",
      US500: "S&P 500 Index Equity Perpetual",
      TSLA: "Tesla Inc. Equity Perpetual",
      XAU: "Gold Spot Price Commodity Perpetual",
      XAUT: "Tether Gold Commodity Perpetual",
      BZ: "Brent Crude Oil Commodity Perpetual",
      NATGAS: "Natural Gas Commodity Perpetual",
      RKLB: "Rocket Lab USA Equity Perpetual",
      QQQ: "Invesco QQQ Trust ETF Perpetual",
      SPY: "SPDR S&P 500 ETF Trust Perpetual",
      TSM: "Taiwan Semiconductor Mfg Equity Perpetual",
      INTC: "Intel Corp. Equity Perpetual",
      QCOM: "Qualcomm Inc. Equity Perpetual",
      SOXL: "Direxion Daily Semiconductor 3X ETF Perpetual",
      EWJ: "iShares MSCI Japan ETF Perpetual",
      COPPER: "Copper Spot Price Commodity Perpetual",
      XAG: "Silver Spot Price Commodity Perpetual",
      XPD: "Palladium Spot Price Commodity Perpetual",
      XPT: "Platinum Spot Price Commodity Perpetual"
    };
    return mapping[ticker] || `${ticker} perpetual swap contracts`;
  };

  // Helper to compute shares
  const getVolumeShare = (vol: number) => {
    const totalVol = protocolData?.stats?.volume24h || 1;
    return ((vol / totalVol) * 100).toFixed(2);
  };

  const getOIShare = (oi: number) => {
    const totalOI = protocolData?.stats?.totalOpenInterest || 1;
    return ((oi / totalOI) * 100).toFixed(2);
  };

  const getLongPercent = (long: number, total: number) => {
    if (total === 0) return 50;
    return Math.round((long / total) * 100);
  };

  const getShortPercent = (short: number, total: number) => {
    if (total === 0) return 50;
    return Math.round((short / total) * 100);
  };

  const markets = useMemo(() => protocolData?.markets || [], [protocolData]);

  // Split markets based on instrument type (RWA vs Crypto)
  const cryptoMarkets = useMemo(() => {
    return markets.filter(m => !isRWAMarket(m.name));
  }, [markets]);

  const rwaMarkets = useMemo(() => {
    return markets.filter(m => isRWAMarket(m.name));
  }, [markets]);

  const activeMarkets = useMemo(() => {
    return activeTab === "perpetual_future" ? cryptoMarkets : rwaMarkets;
  }, [activeTab, cryptoMarkets, rwaMarkets]);

  // Calculations for summary cards
  const summaryCards = useMemo(() => {
    if (activeMarkets.length === 0) return null;

    let highestOI = activeMarkets[0];
    let highestVolume = activeMarkets[0];
    let highestFunding = activeMarkets[0];
    let lowestFunding = activeMarkets[0];

    for (const m of activeMarkets) {
      if (m.totalOI > highestOI.totalOI) highestOI = m;
      if (m.volume24h > highestVolume.volume24h) highestVolume = m;
      if (m.fundingRate > highestFunding.fundingRate) highestFunding = m;
      if (m.fundingRate < lowestFunding.fundingRate) lowestFunding = m;
    }

    return {
      highestOI,
      highestVolume,
      highestFunding,
      lowestFunding,
    };
  }, [activeMarkets]);

  // Filter & Sort & Paginate markets list
  const processedMarkets = useMemo(() => {
    // 1. Filter by search term
    const result = activeMarkets.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [activeMarkets, searchTerm, sortField, sortDirection]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(processedMarkets.length / itemsPerPage));
  const paginatedMarkets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedMarkets.slice(startIndex, startIndex + itemsPerPage);
  }, [processedMarkets, currentPage]);

  const handleSort = (field: keyof Market) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Recharts OI data
  const oiChartData = useMemo(() => {
    return activeMarkets.map((m) => ({
      name: m.name.split("-")[0],
      totalOI: m.totalOI,
    })).sort((a, b) => b.totalOI - a.totalOI).slice(0, 10);
  }, [activeMarkets]);

  // Recharts Funding data (multiplied by 100 to show % raw, showing top 5 positive and top 5 negative rates)
  const fundingChartData = useMemo(() => {
    const positive = [...activeMarkets]
      .filter((m) => m.fundingRate > 0)
      .sort((a, b) => b.fundingRate - a.fundingRate)
      .slice(0, 5)
      .map((m) => ({
        name: m.name.split("-")[0],
        fundingRate: m.fundingRate * 100, // display as % rate
      }));

    const negative = [...activeMarkets]
      .filter((m) => m.fundingRate < 0)
      .sort((a, b) => a.fundingRate - b.fundingRate) // most negative first
      .slice(0, 5)
      .map((m) => ({
        name: m.name.split("-")[0],
        fundingRate: m.fundingRate * 100, // display as % rate
      }));

    return [...positive, ...negative].sort((a, b) => b.fundingRate - a.fundingRate);
  }, [activeMarkets]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-4">
        <Flame className="text-danger animate-bounce" size={48} />
        <h2 className="text-xl font-bold text-white">Markets Connection Failed</h2>
        <p className="text-text-secondary max-w-md">
          Unable to retrieve active markets. Please verify the API status or swap back to MOCK mode.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Index Perpetual Markets</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Real-time indices for perpetual spreads, funding distributions, and active Open Interest.
        </p>
      </div>

      {/* Instrument Type Tabs */}
      <div className="flex border border-border bg-card/40 p-1 rounded-lg w-fit select-none font-mono">
        <button
          onClick={() => {
            setActiveTab("perpetual_future");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={cn(
            "px-4 py-2 rounded transition-all cursor-pointer flex items-center space-x-2 text-xs font-bold",
            activeTab === "perpetual_future" 
              ? "bg-accent-blue text-black font-extrabold shadow-md shadow-accent-blue/15" 
              : "text-text-secondary hover:text-white hover:bg-card-hover/40"
          )}
        >
          <span>PERPETUAL FUTURE</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
            activeTab === "perpetual_future" ? "bg-black/15 text-black" : "bg-border text-text-secondary"
          )}>
            {cryptoMarkets.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("perpetual_rwa_future");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={cn(
            "px-4 py-2 rounded transition-all cursor-pointer flex items-center space-x-2 text-xs font-bold",
            activeTab === "perpetual_rwa_future" 
              ? "bg-accent-blue text-black font-extrabold shadow-md shadow-accent-blue/15" 
              : "text-text-secondary hover:text-white hover:bg-card-hover/40"
          )}
        >
          <span>PERPETUAL RWA FUTURE</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
            activeTab === "perpetual_rwa_future" ? "bg-black/15 text-black" : "bg-border text-text-secondary"
          )}>
            {rwaMarkets.length}
          </span>
        </button>
      </div>

      {/* Summary Outlier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Highest Open Interest"
          value={isLoading ? "" : summaryCards?.highestOI ? summaryCards.highestOI.name.split("-")[0] : "N/A"}
          subtitle={isLoading ? "" : summaryCards?.highestOI ? `OI: ${formatCompactUSD(summaryCards.highestOI.totalOI || 0)}` : "No active contracts"}
          tooltipText="The trading market asset pair that currently represents the largest value of open contracts."
          loading={isLoading}
        />
        <KpiCard
          title="Highest Volume"
          value={isLoading ? "" : summaryCards?.highestVolume ? summaryCards.highestVolume.name.split("-")[0] : "N/A"}
          subtitle={isLoading ? "" : summaryCards?.highestVolume ? `24h Vol: ${formatCompactUSD(summaryCards.highestVolume.volume24h || 0)}` : "No recent volume"}
          tooltipText="The trading market asset pair that generated the highest cumulative volume over the last 24 hours."
          loading={isLoading}
        />
        <KpiCard
          title="Highest Funding"
          value={isLoading ? "" : summaryCards?.highestFunding ? summaryCards.highestFunding.name.split("-")[0] : "N/A"}
          subtitle={isLoading ? "" : summaryCards?.highestFunding ? `Rate: ${formatPercent(summaryCards.highestFunding.fundingRate || 0, true)}` : "No active funding"}
          tooltipText="The perpetual market token pair currently exhibiting the highest positive funding rate (longs paying shorts)."
          loading={isLoading}
        />
        <KpiCard
          title="Lowest Funding"
          value={isLoading ? "" : summaryCards?.lowestFunding ? summaryCards.lowestFunding.name.split("-")[0] : "N/A"}
          subtitle={isLoading ? "" : summaryCards?.lowestFunding ? `Rate: ${formatPercent(summaryCards.lowestFunding.fundingRate || 0, true)}` : "No active funding"}
          tooltipText="The perpetual market token pair currently exhibiting the lowest (or most negative) funding rate (shorts paying longs)."
          loading={isLoading}
        />
      </div>

      {/* Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Interest distribution bar chart */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <BarChart2 size={14} className="mr-1.5 text-accent-blue" />
              <span>Open Interest Distribution (Top 10)</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Top 10 assets by outstanding contract value</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[200px] mt-4">
            {isLoading ? (
              <div className="w-full h-[200px] flex items-end justify-between px-6 pb-2 pt-6 space-x-4 animate-pulse">
                <div className="h-[40%] bg-border/30 w-full rounded-t" />
                <div className="h-[75%] bg-border/30 w-full rounded-t" />
                <div className="h-[50%] bg-border/30 w-full rounded-t" />
                <div className="h-[90%] bg-border/30 w-full rounded-t" />
                <div className="h-[30%] bg-border/30 w-full rounded-t" />
                <div className="h-[65%] bg-border/30 w-full rounded-t" />
              </div>
            ) : (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oiChartData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#52525B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => formatCompactUSD(v)} 
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(39, 39, 42, 0.2)" }}
                      contentStyle={{ backgroundColor: "#09090B", borderColor: "#27272A", borderRadius: "4px" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}
                      itemStyle={{ color: "#095BE5", fontSize: 12 }}
                      formatter={(v: unknown) => [formatUSD(Number(v), 2), "Total OI"]}
                    />
                    <Bar dataKey="totalOI" fill="#095BE5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Funding Rates Baseline bar chart */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Globe size={14} className="mr-1.5 text-accent-blue" />
              <span>Funding Rates Profile</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Top 5 positive (top axis) & top 5 negative (bottom axis) funding rates</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[200px] mt-4">
            {isLoading ? (
              <div className="w-full h-[200px] flex items-center justify-between px-6 space-x-4 animate-pulse relative">
                {/* Horizontal baseline center line */}
                <div className="absolute left-0 right-0 h-0.5 bg-border/40 top-1/2 -translate-y-1/2" />
                <div className="h-[30%] bg-success/20 w-full rounded-t self-end mb-[100px]" />
                <div className="h-[50%] bg-success/20 w-full rounded-t self-end mb-[100px]" />
                <div className="h-[20%] bg-danger/20 w-full rounded-b self-start mt-[100px]" />
                <div className="h-[40%] bg-success/20 w-full rounded-t self-end mb-[100px]" />
                <div className="h-[60%] bg-danger/20 w-full rounded-b self-start mt-[100px]" />
              </div>
            ) : (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundingChartData} margin={{ left: 10, right: 10, top: 25, bottom: 25 }}>
                    <XAxis 
                      xAxisId="top"
                      orientation="top"
                      dataKey="name" 
                      stroke="#52525B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const item = fundingChartData.find(d => d.name === payload.value);
                        if (!item || item.fundingRate <= 0) return null;
                        return (
                          <text x={x} y={y} dy={-6} textAnchor="middle" fill="#A1A1AA" fontSize={10} fontWeight="bold" className="font-mono">
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <XAxis 
                      xAxisId="bottom"
                      orientation="bottom"
                      dataKey="name" 
                      stroke="#52525B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const item = fundingChartData.find(d => d.name === payload.value);
                        if (!item || item.fundingRate >= 0) return null;
                        return (
                          <text x={x} y={y} dy={14} textAnchor="middle" fill="#A1A1AA" fontSize={10} fontWeight="bold" className="font-mono">
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <YAxis 
                      stroke="#52525B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(3)}%`} 
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(39, 39, 42, 0.2)" }}
                      content={<FundingTooltip />}
                    />
                    <ReferenceLine y={0} stroke="#27272A" strokeWidth={1} />
                    <Bar xAxisId="top" dataKey="fundingRate">
                      {fundingChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fundingRate >= 0 ? "#22C55E" : "#EF4444"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Markets Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col justify-between">
        {/* Table Header with Search */}
        <div className="p-4 border-b border-border bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Markets Directory</h3>
            <p className="text-xs text-text-secondary mt-0.5">Sort, filter, and paginate perpetual market listings</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search assets (e.g. BTC, ETH)..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-background border border-border rounded pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-text-secondary focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-background/30 text-xs uppercase font-bold text-muted font-mono tracking-wider select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    <span>Market</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("price")}>
                  <div className="flex items-center justify-end">
                    <span>Mark Price</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("fundingRate")}>
                  <div className="flex items-center justify-end">
                    <span>Funding Rate</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("longOI")}>
                  <div className="flex items-center justify-end">
                    <span>Long OI</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("shortOI")}>
                  <div className="flex items-center justify-end">
                    <span>Short OI</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("totalOI")}>
                  <div className="flex items-center justify-end">
                    <span>Total OI</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("spread")}>
                  <div className="flex items-center justify-end">
                    <span>Spread</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("volume24h")}>
                  <div className="flex items-center justify-end">
                    <span>24h Volume</span>
                    <ArrowUpDown size={12} className="ml-1 text-muted" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-mono">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-10 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                  </tr>
                ))
              ) : paginatedMarkets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary select-none">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <SearchX size={28} className="text-muted" />
                      <span className="text-xs font-bold">No markets found</span>
                      <span className="text-xs">No results match &quot;{searchTerm}&quot;</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMarkets.map((m) => (
                  <tr 
                    key={m.name} 
                    className="hover:bg-card-hover/40 transition-colors cursor-pointer select-none"
                    onClick={() => setSelectedMarket(m)}
                  >
                    <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-3.5 px-4 text-right text-white font-semibold">
                      {formatUSD(m.price, m.price < 5 ? 4 : 2)}
                    </td>
                    <td 
                      className={`py-3.5 px-4 text-right font-bold ${
                        m.fundingRate >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatPercent(m.fundingRate, true)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-secondary">
                      {formatCompactUSD(m.longOI)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-secondary">
                      {formatCompactUSD(m.shortOI)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white">
                      {formatCompactUSD(m.totalOI)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-secondary">
                      {m.spread < 0.01 ? m.spread.toFixed(4) : formatUSD(m.spread, 2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white">
                      {formatCompactUSD(m.volume24h)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="p-4 border-t border-border bg-card/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono select-none">
          <div className="text-text-secondary text-xs">
            Showing <span className="font-semibold text-white">{processedMarkets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{" "}
            <span className="font-semibold text-white">
              {Math.min(currentPage * itemsPerPage, processedMarkets.length)}
            </span>{" "}
            of <span className="font-semibold text-white">{processedMarkets.length}</span> markets
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 rounded border border-border bg-card text-text-secondary hover:text-white disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-secondary font-medium">
              Page <span className="text-white font-bold">{currentPage}</span> of{" "}
              <span className="text-white font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-1.5 rounded border border-border bg-card text-text-secondary hover:text-white disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal Popup */}
      <AnimatePresence>
        {selectedMarket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMarket(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative z-10 flex flex-col font-mono"
            >
              {/* Top Accent Line */}
              <div className="h-1 bg-accent-blue w-full" />

              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-card/60">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">{selectedMarket.name}</h3>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                      isRWAMarket(selectedMarket.name) ? "bg-warning/10 text-warning border border-warning/20" : "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                    )}>
                      {isRWAMarket(selectedMarket.name) ? "RWA PERP" : "CRYPTO PERP"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {getMarketFriendlyName(selectedMarket.name)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMarket(null)}
                  className="text-text-secondary hover:text-white p-1 rounded hover:bg-border transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content body */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
                {/* Mark Price Big Value */}
                <div className="bg-background/50 border border-border p-4 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Mark Price</span>
                    <div className="text-2xl font-bold text-white select-all">
                      {formatUSD(selectedMarket.price, selectedMarket.price < 5 ? 4 : 2)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Spread</span>
                    <div className="text-sm font-semibold text-text-primary">
                      {selectedMarket.spread < 0.01 ? `${(selectedMarket.spread * 10000).toFixed(0)} bps` : formatUSD(selectedMarket.spread, 2)}
                    </div>
                  </div>
                </div>

                {/* Grid for volume & open interest shares */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Volume Share */}
                  <div className="bg-background/30 border border-border/80 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center space-x-1.5 text-text-secondary">
                      <Activity size={13} className="text-accent-blue" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">24h Volume</span>
                    </div>
                    <div className="text-base font-bold text-white">
                      {formatCompactUSD(selectedMarket.volume24h)}
                    </div>
                    <div className="text-[10px] text-text-secondary">
                      Share: <span className="text-white font-bold">{getVolumeShare(selectedMarket.volume24h)}%</span> of total
                    </div>
                  </div>

                  {/* OI Share */}
                  <div className="bg-background/30 border border-border/80 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center space-x-1.5 text-text-secondary">
                      <Landmark size={13} className="text-accent-blue" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Open Interest</span>
                    </div>
                    <div className="text-base font-bold text-white">
                      {formatCompactUSD(selectedMarket.totalOI)}
                    </div>
                    <div className="text-[10px] text-text-secondary">
                      Share: <span className="text-white font-bold">{getOIShare(selectedMarket.totalOI)}%</span> of total
                    </div>
                  </div>
                </div>

                {/* Long vs Short open interest breakdown bar */}
                <div className="space-y-2 bg-background/20 border border-border/60 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-xs uppercase font-bold text-text-secondary tracking-wider">
                    <span className="flex items-center"><Scale size={12} className="mr-1 text-success" /> Long OI</span>
                    <span className="flex items-center">Short OI <Scale size={12} className="ml-1 text-danger" /></span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-white font-mono">
                    <span>{formatCompactUSD(selectedMarket.longOI)} ({getLongPercent(selectedMarket.longOI, selectedMarket.totalOI)}%)</span>
                    <span>({getShortPercent(selectedMarket.shortOI, selectedMarket.totalOI)}%) {formatCompactUSD(selectedMarket.shortOI)}</span>
                  </div>
                  <div className="h-2 w-full bg-danger rounded-full overflow-hidden flex">
                    <div 
                      className="bg-success h-full transition-all duration-500"
                      style={{ width: `${getLongPercent(selectedMarket.longOI, selectedMarket.totalOI)}%` }}
                    />
                  </div>
                </div>

                {/* Bid & Ask Quotes */}
                <div className="bg-background/20 border border-border/60 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Bid Price</span>
                    <div className="text-sm font-bold text-success font-mono mt-0.5">
                      {formatUSD(selectedMarket.bidPrice || selectedMarket.price * 0.999, selectedMarket.price < 5 ? 4 : 2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Ask Price</span>
                    <div className="text-sm font-bold text-danger font-mono mt-0.5">
                      {formatUSD(selectedMarket.askPrice || selectedMarket.price * 1.001, selectedMarket.price < 5 ? 4 : 2)}
                    </div>
                  </div>
                </div>

                {/* Funding Rate Profile */}
                <div className="bg-background/20 border border-border/60 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider flex items-center">
                      <Percent size={12} className="mr-1 text-accent-blue" />
                      <span>Funding Rate (8h)</span>
                    </span>
                    <span className={cn(
                      "text-xs font-bold font-mono",
                      selectedMarket.fundingRate >= 0 ? "text-success" : "text-danger"
                    )}>
                      {formatPercent(selectedMarket.fundingRate, true)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {selectedMarket.fundingRate >= 0 
                      ? "Funding rate is positive. Long position holders pay funding fees to short position holders every interval."
                      : "Funding rate is negative. Short position holders pay funding fees to long position holders every interval."
                    }
                  </p>
                </div>
              </div>

              {/* Footer info banner */}
              <div className="p-3 bg-card-hover/40 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono select-none">
                <span>Network: Arbitrum One</span>
                <a 
                  href={`https://omni.variational.io/?ref=OMNITECCNV2A`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline flex items-center space-x-0.5"
                >
                  <span>Trade Asset</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
