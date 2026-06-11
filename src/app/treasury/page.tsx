"use client";

import React, { useState } from "react";
import { useTreasury } from "../../hooks/use-treasury";
import KpiCard from "../../components/kpi-card";
import { 
  formatUSD, 
  formatCompactUSD, 
  formatNumber, 
  formatPercent, 
  shortenAddress,
  formatDate
} from "../../lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

const PIE_COLORS = ["#095BE5", "#3E8BFF", "#22C55E", "#F59E0B", "#8B5CF6"];

export default function TreasuryPage() {
  const { data: treasuryData, isLoading, isError } = useTreasury();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleCopy = async (text: string, type: "address" | "tx") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "address") {
        setCopiedAddress(text);
        setTimeout(() => setCopiedAddress(null), 2000);
      } else {
        setCopiedTx(text);
        setTimeout(() => setCopiedTx(null), 2000);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-4">
        <ShieldAlert className="text-danger" size={48} />
        <h2 className="text-xl font-bold text-white">Treasury Connection Failed</h2>
        <p className="text-text-secondary max-w-md">
          Failed to fetch holdings from Arbiscan or Alchemy APIs. Toggle back to MOCK mode in the header to view cached treasury statistics.
        </p>
      </div>
    );
  }

  // Extracted structures
  const assets = treasuryData?.assets || [];
  const transfers = treasuryData?.transfers || [];
  const summary = treasuryData?.summary;

  // Process data for Donut allocation chart
  const pieData = assets.map(a => ({
    name: a.symbol,
    value: a.valueUSD,
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Treasury Asset Transparency</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Real-time audits of asset distributions, contract addresses, and fund disbursements.
        </p>
      </div>

      {/* Summary KPI section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Treasury Value"
          value={isLoading ? "" : formatUSD(summary?.totalValueUSD || 0, 0)}
          subtitle="Total assets valuation"
          tooltipText="Total USD valuation of native and ERC-20 assets held in the protocol treasury contract."
          loading={isLoading}
        />
        <KpiCard
          title="Total Assets"
          value={isLoading ? "" : `${summary?.totalAssetCount} Tokens`}
          subtitle="Holdings count"
          tooltipText="Total number of unique cryptocurrency asset tokens held in the treasury portfolio."
          loading={isLoading}
        />
        <KpiCard
          title="Largest Position"
          value={isLoading ? "" : `${summary?.largestPositionSymbol}`}
          subtitle={isLoading ? "" : `${summary?.largestPositionPercentage.toFixed(1)}% of total`}
          tooltipText="The single cryptocurrency token holding that represents the largest percentage of total treasury value."
          loading={isLoading}
        />
        <KpiCard
          title="Wallet Age"
          value={isLoading ? "" : `${summary?.walletAgeDays} Days`}
          subtitle={isLoading ? "" : `Created ${formatDate(summary?.walletCreatedTimestamp || "")}`}
          tooltipText="The age of the treasury wallet contract, computed from the date of its deployment block."
          loading={isLoading}
        />
        <KpiCard
          title="Transaction Count"
          value={isLoading ? "" : formatNumber(summary?.transactionCount || 0)}
          subtitle="On-chain events"
          tooltipText="Total cumulative count of on-chain incoming and outgoing events for this treasury contract."
          loading={isLoading}
        />
      </div>

      {/* Middle allocations section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Pie Chart Panel (col-span-4) */}
        <div className="xl:col-span-4 bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Layers size={14} className="mr-1.5 text-accent-blue" />
              <span>Asset Allocation</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Asset diversification breakdown</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[260px] my-4">
            {isLoading ? (
              <div className="w-36 h-36 rounded-full border-8 border-border/40 border-t-accent-blue/40 animate-pulse flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-background" />
              </div>
            ) : pieData.length === 0 ? (
              <span className="text-xs text-text-secondary">No assets found</span>
            ) : (
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#09090B", borderColor: "#27272A", borderRadius: "4px" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}
                      itemStyle={{ fontSize: 12 }}
                      formatter={(v: any) => [formatUSD(v, 2), "Allocation"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-text-secondary font-mono font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Holdings Table (col-span-8) */}
        <div className="xl:col-span-8 bg-card border border-border rounded-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-border bg-card/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Treasury Assets Holdings</h3>
              <p className="text-xs text-text-secondary mt-0.5">Verified smart contract details and holdings valuation</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-border bg-background/30 text-xs uppercase font-bold text-muted font-mono tracking-wider select-none">
                    <th className="py-3 px-4">Token Name</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-right">Price (USD)</th>
                    <th className="py-3 px-4 text-right">USD Value</th>
                    <th className="py-3 px-4 text-right">Allocation</th>
                    <th className="py-3 px-4 text-center">Contract Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs font-mono">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3.5 px-4"><div className="h-4 w-24 bg-border rounded" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 w-16 ml-auto bg-border rounded" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 w-10 ml-auto bg-border rounded" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 w-28 mx-auto bg-border rounded" /></td>
                      </tr>
                    ))
                  ) : assets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-text-secondary select-none">
                        No holdings found in treasury.
                      </td>
                    </tr>
                  ) : (
                    assets.map((a, idx) => (
                      <tr key={a.symbol} className="hover:bg-card-hover/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                            />
                            <span className="font-bold text-white">{a.token}</span>
                            <span className="text-[11px] text-text-secondary bg-border/40 px-1 rounded font-normal">
                              {a.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-white font-semibold">
                          {formatNumber(a.amount, a.amount < 1 ? 4 : 2)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-text-secondary">
                          {formatUSD(a.priceUSD, a.priceUSD < 2 ? 4 : 2)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-white font-semibold">
                          {formatUSD(a.valueUSD, 2)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-text-secondary">
                          {a.allocationPercentage.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <span className="text-xs text-text-secondary select-all">
                              {shortenAddress(a.contractAddress, 4)}
                            </span>
                            <button
                              onClick={() => handleCopy(a.contractAddress, "address")}
                              className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                              title="Copy contract address"
                              aria-label="Copy contract address"
                            >
                              {copiedAddress === a.contractAddress ? (
                                <Check size={11} className="text-success" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                            <a
                              href={a.explorerLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                              title="View token page on Arbiscan"
                              aria-label="View token page on Arbiscan"
                            >
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 border-t border-border bg-card/10 text-xs text-muted text-right font-medium">
            * All tokens reside natively on Arbitrum One L2 network.
          </div>
        </div>
      </div>

      {/* Bottom recent activity transfers table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card/40">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Calendar size={14} className="mr-1.5 text-accent-blue" />
              <span>Recent Treasury Activity</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Asset transfer and liquidation payouts log</p>
          </div>
          <a
            href="https://arbiscan.io/address/0x5E91B40467FB8902C46A7B6CB90482363188D645"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-blue hover:text-accent-blue-hover font-semibold flex items-center space-x-0.5"
          >
            <span>Arbiscan Explorer</span>
            <ExternalLink size={12} className="ml-1" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-background/30 text-xs uppercase font-bold text-muted font-mono tracking-wider select-none">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Counterparty Address</th>
                <th className="py-3 px-4 text-center">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-mono">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 w-16 bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-12 ml-auto bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-8 bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-36 bg-border rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-20 mx-auto bg-border rounded" /></td>
                  </tr>
                ))
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-text-secondary select-none">
                    No recent transaction activity found.
                  </td>
                </tr>
              ) : (
                transfers.map((tx, idx) => {
                  const isIncoming = tx.direction === "incoming";
                  return (
                    <tr key={`${tx.hash}-${tx.token}-${idx}`} className="hover:bg-card-hover/40 transition-colors">
                      <td className="py-3.5 px-4 text-text-secondary">
                        {new Date(tx.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                            isIncoming 
                              ? "bg-success/5 border-success/30 text-success" 
                              : "bg-danger/5 border-danger/30 text-danger"
                          }`}
                        >
                          {isIncoming ? (
                            <ArrowDownLeft size={11} className="mr-1" />
                          ) : (
                            <ArrowUpRight size={11} className="mr-1" />
                          )}
                          {tx.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        {formatNumber(tx.amount, tx.amount < 1 ? 4 : 2)}
                      </td>
                      <td className="py-3.5 px-4 text-text-primary font-semibold">{tx.token}</td>
                      <td className="py-3.5 px-4 text-text-secondary select-all font-medium">
                        {tx.counterparty.startsWith("0x") ? shortenAddress(tx.counterparty, 6) : tx.counterparty}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="text-xs text-text-secondary">
                            {shortenAddress(tx.hash, 4)}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.hash, "tx")}
                            className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                            title="Copy transaction hash"
                            aria-label="Copy transaction hash"
                          >
                            {copiedTx === tx.hash ? (
                              <Check size={11} className="text-success" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                          <a
                            href={`https://arbiscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                            title="View transaction on explorer"
                            aria-label="View transaction on explorer"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
