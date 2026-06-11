"use client";

import React, { useState } from "react";
import { useProtocolStats } from "../../hooks/use-protocol-stats";
import { useTreasury } from "../../hooks/use-treasury";
import KpiCard from "../../components/kpi-card";
import { formatCompactUSD, formatUSD, formatPercent, cn } from "../../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const { data: protocolData, isLoading: isProtocolLoading, isError: isProtocolError } = useProtocolStats();
  const { data: treasuryData, isLoading: isTreasuryLoading } = useTreasury();
  const [chartMetric, setChartMetric] = useState<"volume" | "oi">("volume");

  const isLoading = isProtocolLoading || isTreasuryLoading;

  if (isProtocolError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-4">
        <AlertTriangle className="text-danger" size={48} />
        <h2 className="text-xl font-bold text-white">Data Connection Error</h2>
        <p className="text-text-secondary max-w-md">
          Failed to load overview data from the Variational API. Please verify your connection or toggle back to MOCK mode.
        </p>
      </div>
    );
  }

  // Derived variables
  const stats = protocolData?.stats;
  const markets = protocolData?.markets || [];
  const treasurySummary = treasuryData?.summary;

  // Process data for Recharts horizontal bar chart based on selected metric (Volume vs. Open Interest)
  const chartData = [...markets]
    .sort((a, b) => {
      if (chartMetric === "volume") {
        return b.volume24h - a.volume24h;
      } else {
        return b.totalOI - a.totalOI;
      }
    })
    .slice(0, 5)
    .map(m => ({
      name: m.name.replace("-USDC-PERP", ""),
      value: chartMetric === "volume" ? m.volume24h : m.totalOI,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Protocol Health Overview</h2>
          <p className="text-sm text-text-secondary">
            Executive summary of liquidity, open interest, and loss refund pool stats.
          </p>
        </div>
        <Link 
          href="/analytics" 
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-all text-xs font-semibold"
        >
          <span>View Risk Analytics</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Treasury Value"
          value={isLoading ? "" : formatCompactUSD(treasurySummary?.totalValueUSD || 0)}
          subtitle="USDC backing & assets"
          tooltipText="Total USD valuation of native and ERC-20 assets held in the protocol treasury contract."
          loading={isLoading}
        />
        <KpiCard
          title="Total Value Locked (TVL)"
          value={isLoading ? "" : formatCompactUSD(stats?.tvl || 0)}
          subtitle="Deposit pool liquidity"
          tooltipText="Total value representing all collateral deposited in active margin accounts and liquidity pools."
          loading={isLoading}
        />
        <KpiCard
          title="Open Interest"
          value={isLoading ? "" : formatCompactUSD(stats?.totalOpenInterest || 0)}
          subtitle="Active contracts"
          tooltipText="Total USD value of all active perpetual swap contracts currently open on the platform."
          loading={isLoading}
        />
        <KpiCard
          title="24h Volume"
          value={isLoading ? "" : formatCompactUSD(stats?.volume24h || 0)}
          subtitle="Trading turnover"
          tooltipText="Cumulative trading volume processed across all perpetual markets in the last 24 hours."
          loading={isLoading}
        />
        <KpiCard
          title="Volume / TVL Ratio"
          value={isLoading ? "" : `${(stats?.tvl ? (stats.volume24h / stats.tvl) : 0).toFixed(3)}x`}
          subtitle="Capital efficiency"
          tooltipText="The 24h trading volume divided by the Total Value Locked (TVL). A higher ratio indicates more efficient capital utilization by the protocol."
          loading={isLoading}
        />
        <KpiCard
          title="Cumulative Volume"
          value={isLoading ? "" : formatCompactUSD(stats?.cumulativeVolume || 0)}
          subtitle="All-time volume"
          tooltipText="All-time aggregate trading volume processed since the protocol inception."
          loading={isLoading}
        />
        <KpiCard
          title="Markets Listed"
          value={isLoading ? "" : stats?.marketsListed || 0}
          subtitle="Active trading pairs"
          tooltipText="Total number of active perpetual trading market pairs listed and traded on the protocol."
          loading={isLoading}
        />
        <KpiCard
          title="Loss Refund Pool"
          value={isLoading ? "" : formatCompactUSD(stats?.lossRefundPool || 0)}
          subtitle="Insurance collateral"
          tooltipText="Funds reserved in the insurance collateral pool to refund user liquidation losses."
          loading={isLoading}
        />
        <KpiCard
          title="Loss Refunds Paid (24h)"
          value={isLoading ? "" : formatCompactUSD(stats?.lossRefundsPaid24h || 0)}
          subtitle="Disbursed claims"
          tooltipText="Total amount of claims disbursed from the refund pool to cover user losses in the last 24 hours."
          loading={isLoading}
        />
      </div>

      {/* Main Content Layout splits */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Market Snapshot Table - 8/12 widths */}
        <div className="xl:col-span-8 bg-card border border-border rounded-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-border flex justify-between items-center bg-card/40">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Market Snapshot</h3>
                <p className="text-xs text-text-secondary mt-0.5">Active contracts and current funding profiles</p>
              </div>
              <Link href="/markets" className="text-xs text-accent-blue hover:text-accent-blue-hover font-semibold flex items-center space-x-0.5">
                <span>All Markets</span>
                <ArrowRight size={12} />
              </Link>
            </div>
            
            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-background/30 text-xs uppercase font-bold text-muted font-mono tracking-wider select-none">
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4 text-right">Mark Price</th>
                    <th className="py-3 px-4 text-right">Funding Rate (8h)</th>
                    <th className="py-3 px-4 text-right">Long OI</th>
                    <th className="py-3 px-4 text-right">Short OI</th>
                    <th className="py-3 px-4 text-right">Total OI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs font-mono">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3 px-4"><div className="h-4 w-20 bg-border rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                        <td className="py-3 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                      </tr>
                    ))
                  ) : markets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-text-secondary select-none">
                        No active markets found.
                      </td>
                    </tr>
                  ) : (
                    markets.slice(0, 5).map((m) => (
                      <tr 
                        key={m.name} 
                        className="hover:bg-card-hover/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                        <td className="py-3.5 px-4 text-right text-white">
                          {formatUSD(m.price, m.price < 5 ? 4 : 2)}
                        </td>
                        <td 
                          className={`py-3.5 px-4 text-right font-semibold ${
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 border-t border-border bg-card/10 text-xs text-muted text-right font-medium">
            * Funding rates positive: Longs pay Shorts. Funding rates negative: Shorts pay Longs.
          </div>
        </div>

        {/* Top Markets Chart - 4/12 widths */}
        <div className="xl:col-span-4 bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <TrendingUp size={14} className="mr-1.5 text-accent-blue" />
                <span>Top Markets</span>
              </h3>
              <div className="flex bg-background border border-border p-0.5 rounded text-[11px] font-mono font-bold select-none">
                <button
                  onClick={() => setChartMetric("volume")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all cursor-pointer",
                    chartMetric === "volume" ? "bg-accent-blue text-black font-extrabold" : "text-text-secondary hover:text-white"
                  )}
                >
                  VOLUME
                </button>
                <button
                  onClick={() => setChartMetric("oi")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all cursor-pointer",
                    chartMetric === "oi" ? "bg-accent-blue text-black font-extrabold" : "text-text-secondary hover:text-white"
                  )}
                >
                  OI
                </button>
              </div>
            </div>
            <p className="text-xs text-text-secondary -mt-2.5 mb-4 leading-normal">
              Top perpetuals ranked by {chartMetric === "volume" ? "daily turnover volume" : "outstanding open interest"}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            {isLoading ? (
              <div className="w-full space-y-4 animate-pulse">
                <div className="h-5 bg-border rounded w-full" />
                <div className="h-5 bg-border rounded w-[85%]" />
                <div className="h-5 bg-border rounded w-[70%]" />
                <div className="h-5 bg-border rounded w-[60%]" />
                <div className="h-5 bg-border rounded w-[45%]" />
              </div>
            ) : chartData.length === 0 ? (
              <span className="text-text-secondary text-xs">No chart data available</span>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ left: 10, right: 20, top: 10, bottom: 5 }}
                  >
                    <XAxis 
                      type="number" 
                      stroke="#52525B" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatCompactUSD(v)} 
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#A1A1AA" 
                      fontSize={11} 
                      fontWeight="bold"
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: "rgba(39, 39, 42, 0.2)" }} 
                      contentStyle={{ backgroundColor: "#000000", borderColor: "#121216", borderRadius: "4px" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}
                      itemStyle={{ color: "#00E5FF", fontSize: 12 }}
                      formatter={(v: unknown) => [formatUSD(Number(v), 2), chartMetric === "volume" ? "24h Volume" : "Open Interest"]}
                    />
                    <Bar dataKey="value" fill="#00E5FF" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? "#00E5FF" : index === 1 ? "#33F0FF" : index === 2 ? "#66F5FF" : "#99FAFF"}
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
    </motion.div>
  );
}
