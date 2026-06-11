"use client";

import React, { useMemo } from "react";
import { useProtocolStats } from "../../hooks/use-protocol-stats";
import { useTreasury } from "../../hooks/use-treasury";
import { formatPercent, formatUSD, cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  HelpCircle, 
  TrendingUp, 
  Scale, 
  Activity,
  TrendingDown
} from "lucide-react";
import { Market } from "../../types";

export default function AnalyticsPage() {
  const { data: protocolData, isLoading: isProtocolLoading, isError: isProtocolError } = useProtocolStats();
  const { data: treasuryData, isLoading: isTreasuryLoading, isError: isTreasuryError } = useTreasury();

  const isLoading = isProtocolLoading || isTreasuryLoading;
  const isError = isProtocolError || isTreasuryError;

  // Derive all calculations inside useMemo
  const metrics = useMemo(() => {
    if (!protocolData || !treasuryData) return null;

    const stats = protocolData.stats;
    const markets = protocolData.markets;
    const treasurySummary = treasuryData.summary;

    const treasuryVal = treasurySummary.totalValueUSD;
    const tvl = stats.tvl;
    const totalOI = stats.totalOpenInterest;
    const refundPool = stats.lossRefundPool;

    // 1. Treasury / TVL
    const treasuryToTvlRatio = tvl > 0 ? treasuryVal / tvl : 0;
    let tvlStatus: "critical" | "stable" | "strong" = "stable";
    if (treasuryToTvlRatio < 0.15) tvlStatus = "critical";
    else if (treasuryToTvlRatio > 0.35) tvlStatus = "strong";

    // 2. Treasury / Open Interest
    const treasuryToOiRatio = totalOI > 0 ? treasuryVal / totalOI : 0;
    let oiStatus: "critical" | "stable" | "strong" = "stable";
    if (treasuryToOiRatio < 0.25) oiStatus = "critical";
    else if (treasuryToOiRatio > 0.50) oiStatus = "strong";

    // 3. Loss Pool Coverage
    const lossPoolCoverage = totalOI > 0 ? refundPool / totalOI : 0;
    let poolStatus: "weak" | "sufficient" | "robust" = "sufficient";
    if (lossPoolCoverage < 0.08) poolStatus = "weak";
    else if (lossPoolCoverage > 0.18) poolStatus = "robust";

    // 4. Market Concentration
    let largestMarketOI = 0;
    let largestMarketName = "N/A";
    let sumMarketsOI = 0;
    for (const m of markets) {
      sumMarketsOI += m.totalOI;
      if (m.totalOI > largestMarketOI) {
        largestMarketOI = m.totalOI;
        largestMarketName = m.name.split("-")[0];
      }
    }
    const concentration = sumMarketsOI > 0 ? largestMarketOI / sumMarketsOI : 0;
    let concentrationRisk: "low" | "moderate" | "high" = "moderate";
    if (concentration < 0.30) concentrationRisk = "low";
    else if (concentration > 0.55) concentrationRisk = "high";

    // 5. Long / Short Imbalance
    const totalLongOI = markets.reduce((acc: number, curr: Market) => acc + curr.longOI, 0);
    const totalShortOI = markets.reduce((acc: number, curr: Market) => acc + curr.shortOI, 0);
    const imbalanceRatio = totalShortOI > 0 ? totalLongOI / totalShortOI : 1.0;
    let sentiment: "bearish" | "neutral" | "bullish" = "neutral";
    if (imbalanceRatio > 1.05) sentiment = "bullish";
    else if (imbalanceRatio < 0.95) sentiment = "bearish";

    return {
      treasuryVal,
      tvl,
      totalOI,
      refundPool,
      treasuryToTvlRatio,
      tvlStatus,
      treasuryToOiRatio,
      oiStatus,
      lossPoolCoverage,
      poolStatus,
      concentration,
      largestMarketName,
      concentrationRisk,
      totalLongOI,
      totalShortOI,
      imbalanceRatio,
      sentiment,
      sumMarketsOI,
    };
  }, [protocolData, treasuryData]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-4">
        <ShieldAlert className="text-danger" size={48} />
        <h2 className="text-xl font-bold text-white">Risk Data Connection Failed</h2>
        <p className="text-text-secondary max-w-md">
          Unable to calculate derived protocol metrics. Check your internet connection or switch to MOCK mode.
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
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Risk Analytics Index</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Mathematical ratios representing backing strength, loss coverage levels, and concentration risks.
        </p>
      </div>

      {/* Main Analytics Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Treasury Coverage Ratio */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Treasury Coverage Ratio</span>
                <div className="relative group/tooltip flex items-center justify-center">
                  <HelpCircle 
                    size={13} 
                    className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
                    aria-label="Info description"
                  />
                  {/* Hover Tooltip Box */}
                  <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-left">
                    <div className="font-bold text-xs text-white uppercase mb-1">Treasury Coverage</div>
                    <div className="leading-relaxed font-normal">Measures the ratio of treasury assets backing active perpetual contracts.</div>
                  </div>
                </div>
              </div>
              {!isLoading && metrics && (
                <span 
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded border uppercase",
                    metrics.oiStatus === "strong" ? "bg-success/5 border-success/30 text-success" :
                    metrics.oiStatus === "stable" ? "bg-accent-blue/5 border-accent-blue/30 text-accent-blue" :
                    "bg-danger/5 border-danger/30 text-danger animate-pulse"
                  )}
                >
                  {metrics.oiStatus} Backing
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Measures the protocol&apos;s liquidity backing relative to active perpetual contracts. Higher ratios indicate a larger safety buffer to absorb volatility events.
            </p>
          </div>

          {/* Metric display value */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">
              {isLoading ? "---" : formatPercent(metrics?.treasuryToOiRatio || 0, true)}
            </span>
            <span className="text-text-secondary text-xs">coverage</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics?.oiStatus === "strong" ? "bg-success" :
                  metrics?.oiStatus === "stable" ? "bg-accent-blue" : "bg-danger"
                )}
                style={{ width: `${Math.min(100, (metrics?.treasuryToOiRatio || 0) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted font-mono font-medium">
              <span>0% Coverage</span>
              <span>25% Target Min</span>
              <span>50%+ Strong</span>
            </div>
          </div>

          {/* Math formula section */}
          <div className="bg-background/40 border border-border/60 rounded p-3 text-xs font-mono space-y-1">
            <div className="text-muted uppercase text-[10px] font-bold">Calculation Formula</div>
            <div className="text-white flex items-center space-x-1.5">
              <span>Treasury Value</span>
              <span className="text-accent-blue font-bold">÷</span>
              <span>Total Open Interest</span>
            </div>
            <div className="text-text-secondary text-xs mt-1 pt-1 border-t border-border/30 font-semibold">
              {isLoading ? "Loading..." : `${formatUSD(metrics?.treasuryVal || 0, 0)} ÷ ${formatUSD(metrics?.totalOI || 0, 0)}`}
            </div>
          </div>
        </div>

        {/* Card 2: Treasury to TVL Ratio */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Treasury to TVL Ratio</span>
                <div className="relative group/tooltip flex items-center justify-center">
                  <HelpCircle 
                    size={13} 
                    className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
                    aria-label="Info description"
                  />
                  {/* Hover Tooltip Box */}
                  <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-right">
                    <div className="font-bold text-xs text-white uppercase mb-1">Treasury to TVL</div>
                    <div className="leading-relaxed font-normal">Measures native treasury assets relative to depositor assets locked.</div>
                  </div>
                </div>
              </div>
              {!isLoading && metrics && (
                <span 
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded border uppercase",
                    metrics.tvlStatus === "strong" ? "bg-success/5 border-success/30 text-success" :
                    metrics.tvlStatus === "stable" ? "bg-accent-blue/5 border-accent-blue/30 text-accent-blue" :
                    "bg-danger/5 border-danger/30 text-danger animate-pulse"
                  )}
                >
                  {metrics.tvlStatus} Buffer
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Ratios of native treasury assets relative to depositor assets locked. Standard benchmarks hover around 20-35%, protecting LPs from extreme price spikes.
            </p>
          </div>

          {/* Metric display value */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">
              {isLoading ? "---" : formatPercent(metrics?.treasuryToTvlRatio || 0, true)}
            </span>
            <span className="text-text-secondary text-xs">treasury backing</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics?.tvlStatus === "strong" ? "bg-success" :
                  metrics?.tvlStatus === "stable" ? "bg-accent-blue" : "bg-danger"
                )}
                style={{ width: `${Math.min(100, (metrics?.treasuryToTvlRatio || 0) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted font-mono font-medium">
              <span>0% Backing</span>
              <span>15% Stable Min</span>
              <span>35%+ Heavy</span>
            </div>
          </div>

          {/* Math formula section */}
          <div className="bg-background/40 border border-border/60 rounded p-3 text-xs font-mono space-y-1">
            <div className="text-muted uppercase text-[10px] font-bold">Calculation Formula</div>
            <div className="text-white flex items-center space-x-1.5">
              <span>Treasury Value</span>
              <span className="text-accent-blue font-bold">÷</span>
              <span>Total Value Locked (TVL)</span>
            </div>
            <div className="text-text-secondary text-xs mt-1 pt-1 border-t border-border/30 font-semibold">
              {isLoading ? "Loading..." : `${formatUSD(metrics?.treasuryVal || 0, 0)} ÷ ${formatUSD(metrics?.tvl || 0, 0)}`}
            </div>
          </div>
        </div>

        {/* Card 3: Loss Pool Coverage */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Loss Pool Coverage</span>
                <div className="relative group/tooltip flex items-center justify-center">
                  <HelpCircle 
                    size={13} 
                    className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
                    aria-label="Info description"
                  />
                  {/* Hover Tooltip Box */}
                  <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-left">
                    <div className="font-bold text-xs text-white uppercase mb-1">Loss Pool Coverage</div>
                    <div className="leading-relaxed font-normal">Measures depth of loss refund pool against total open interest.</div>
                  </div>
                </div>
              </div>
              {!isLoading && metrics && (
                <span 
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded border uppercase",
                    metrics.poolStatus === "robust" ? "bg-success/5 border-success/30 text-success" :
                    metrics.poolStatus === "sufficient" ? "bg-accent-blue/5 border-accent-blue/30 text-accent-blue" :
                    "bg-warning/5 border-warning/30 text-warning"
                  )}
                >
                  {metrics.poolStatus} Protection
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Represents the depth of the protocol&apos;s loss refund pool against total open interest. Evaluates the pool&apos;s ability to cover liquidation deficits under cascading events.
            </p>
          </div>

          {/* Metric display value */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">
              {isLoading ? "---" : formatPercent(metrics?.lossPoolCoverage || 0, true)}
            </span>
            <span className="text-text-secondary text-xs">refund collateral</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics?.poolStatus === "robust" ? "bg-success" :
                  metrics?.poolStatus === "sufficient" ? "bg-accent-blue" : "bg-warning"
                )}
                style={{ width: `${Math.min(100, (metrics?.lossPoolCoverage || 0) * 100 * 4)}%` }} // scaled slightly for visual prominence
              />
            </div>
            <div className="flex justify-between text-xs text-muted font-mono font-medium">
              <span>0% Coverage</span>
              <span>8% Target Buffer</span>
              <span>18%+ Robust</span>
            </div>
          </div>

          {/* Math formula section */}
          <div className="bg-background/40 border border-border/60 rounded p-3 text-xs font-mono space-y-1">
            <div className="text-muted uppercase text-[10px] font-bold">Calculation Formula</div>
            <div className="text-white flex items-center space-x-1.5">
              <span>Loss Refund Pool</span>
              <span className="text-accent-blue font-bold">÷</span>
              <span>Total Open Interest</span>
            </div>
            <div className="text-text-secondary text-xs mt-1 pt-1 border-t border-border/30 font-semibold">
              {isLoading ? "Loading..." : `${formatUSD(metrics?.refundPool || 0, 0)} ÷ ${formatUSD(metrics?.totalOI || 0, 0)}`}
            </div>
          </div>
        </div>

        {/* Card 4: Market Concentration */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Market Concentration</span>
                <div className="relative group/tooltip flex items-center justify-center">
                  <HelpCircle 
                    size={13} 
                    className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
                    aria-label="Info description"
                  />
                  {/* Hover Tooltip Box */}
                  <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-right">
                    <div className="font-bold text-xs text-white uppercase mb-1">Concentration</div>
                    <div className="leading-relaxed font-normal">Measures risk exposure concentration in the dominant trading pair.</div>
                  </div>
                </div>
              </div>
              {!isLoading && metrics && (
                <span 
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded border uppercase",
                    metrics.concentrationRisk === "low" ? "bg-success/5 border-success/30 text-success" :
                    metrics.concentrationRisk === "moderate" ? "bg-warning/5 border-warning/30 text-warning" :
                    "bg-danger/5 border-danger/30 text-danger animate-pulse"
                  )}
                >
                  {metrics.concentrationRisk} Concentration
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Tracks exposure concentration to a single trading pair. High concentration ratios (e.g. &gt; 55%) indicate systemic protocol reliance on one market.
            </p>
          </div>

          {/* Metric display value */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">
              {isLoading ? "---" : formatPercent(metrics?.concentration || 0, true)}
            </span>
            <span className="text-text-secondary text-xs">
              dominant market: <span className="font-bold text-white uppercase">{metrics?.largestMarketName}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics?.concentrationRisk === "low" ? "bg-success" :
                  metrics?.concentrationRisk === "moderate" ? "bg-warning" : "bg-danger"
                )}
                style={{ width: `${Math.min(100, (metrics?.concentration || 0) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted font-mono font-medium">
              <span>0% Concentration</span>
              <span>30% Low Target</span>
              <span>55%+ High Risk</span>
            </div>
          </div>

          {/* Math formula section */}
          <div className="bg-background/40 border border-border/60 rounded p-3 text-xs font-mono space-y-1">
            <div className="text-muted uppercase text-[10px] font-bold">Calculation Formula</div>
            <div className="text-white flex items-center space-x-1.5">
              <span>Largest Market OI</span>
              <span className="text-accent-blue font-bold">÷</span>
              <span>Total Listings OI</span>
            </div>
            <div className="text-text-secondary text-xs mt-1 pt-1 border-t border-border/30 font-semibold">
              {isLoading ? "Loading..." : `Dominant Market OI ÷ ${formatUSD(metrics?.sumMarketsOI || 0, 0)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment slider block (Long/Short Imbalance) */}
      <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Scale size={14} className="text-accent-blue" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Long / Short Imbalance Sentiment</span>
              <div className="relative group/tooltip flex items-center justify-center">
                <HelpCircle 
                  size={13} 
                  className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
                  aria-label="Info description"
                />
                {/* Hover Tooltip Box */}
                <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-left">
                  <div className="font-bold text-xs text-white uppercase mb-1">Market Sentiment</div>
                  <div className="leading-relaxed font-normal">Measures overall trader sentiment bias based on long vs short positions.</div>
                </div>
              </div>
            </div>
            {!isLoading && metrics && (
              <span 
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded border uppercase flex items-center",
                  metrics.sentiment === "bullish" ? "bg-success/5 border-success/30 text-success" :
                  metrics.sentiment === "bearish" ? "bg-danger/5 border-danger/30 text-danger" :
                  "bg-muted/10 border-border text-text-secondary"
                )}
              >
                {metrics.sentiment === "bullish" ? (
                  <TrendingUp size={11} className="mr-1" />
                ) : metrics.sentiment === "bearish" ? (
                  <TrendingDown size={11} className="mr-1" />
                ) : (
                  <Activity size={11} className="mr-1" />
                )}
                {metrics.sentiment} Outlook
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            Aggregate balance ratio of overall long open interest vs. short open interest. Ratios close to 1.0 (0.95 - 1.05) show extreme capital equilibrium. Deviation from equilibrium indicates trader bias.
          </p>
        </div>

        {/* Metric and slider wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">
              {isLoading ? "---" : metrics?.imbalanceRatio.toFixed(3)}
            </span>
            <span className="text-text-secondary text-xs">Long/Short Ratio</span>
          </div>

          {/* Sentiment Slider Visual */}
          <div className="md:col-span-8 space-y-2">
            <div className="relative h-2 w-full bg-background rounded-full overflow-visible border border-border/40 select-none">
              {/* Center baseline indicator */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border z-10" />
              
              {/* Slider thumb representing the balance */}
              {!isLoading && metrics && (
                <div 
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full z-20 border border-white/80 shadow transition-all duration-500",
                    metrics.sentiment === "bullish" ? "bg-success" :
                    metrics.sentiment === "bearish" ? "bg-danger" : "bg-text-secondary"
                  )}
                  // scale the imbalance ratio into percentage bounds
                  // e.g. ratio 1.0 is 50%, ratio 1.2 is 70%, ratio 0.8 is 30%
                  style={{ left: `${Math.min(95, Math.max(5, 50 + (metrics.imbalanceRatio - 1.0) * 100))}%` }}
                />
              )}
            </div>
            
            <div className="flex justify-between text-[10px] uppercase tracking-wider font-mono font-bold">
              <span className="text-danger">0.80 Bearish bias</span>
              <span className="text-muted">1.00 Equilibrium</span>
              <span className="text-success">1.20 Bullish bias</span>
            </div>
          </div>
        </div>

        {/* Formula summary */}
        <div className="bg-background/40 border border-border/60 rounded p-3 text-xs font-mono grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-muted uppercase text-[10px] font-bold">Aggregate Totals</div>
            <div className="flex justify-between text-text-secondary">
              <span>Total Longs OI:</span>
              <span className="text-white font-bold">{isLoading ? "---" : formatUSD(metrics?.totalLongOI || 0, 0)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Total Shorts OI:</span>
              <span className="text-white font-bold">{isLoading ? "---" : formatUSD(metrics?.totalShortOI || 0, 0)}</span>
            </div>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-border/40 pt-2.5 md:pt-0 md:pl-4">
            <div className="text-muted uppercase text-[10px] font-bold">Math Formula</div>
            <div className="text-white flex items-center space-x-1.5">
              <span>Total Longs OI</span>
              <span className="text-accent-blue font-bold">÷</span>
              <span>Total Shorts OI</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
