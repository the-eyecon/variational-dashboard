"use client";

import React, { useState } from "react";
import { 
  Gift, 
  Calculator,
  Download,
  Info
} from "lucide-react";
import { formatNumber, formatUSD, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AIRDROP_PERCENT = 32;
const TOTAL_DISTRIBUTED_POINTS = 9; // locked to 9M

export default function AirdropPage() {
  // Main states matching the inputs
  const [userPoints, setUserPoints] = useState<number>(100);
  const [fdv, setFdv] = useState<number | "">(2);
  const [fdvUnit, setFdvUnit] = useState<"M" | "B">("B");
  // Default pricePerPoint at 2B FDV and 32% allocation: (2e9 * 0.32) / (9e6) = 71.11
  const [pricePerPoint, setPricePerPoint] = useState<number | "">(71.11);
  const [, setLastEdited] = useState<"fdv" | "price">("fdv");
  
  // Interactive UI feedback states
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [triggerFlash, setTriggerFlash] = useState<boolean>(false);

  // Calculated values - updated ONLY when the user clicks the "Calculate" button
  const [calculatedData, setCalculatedData] = useState<{
    userPoints: number;
    pricePerPoint: number;
    fdv: number | "";
    fdvUnit: "M" | "B";
    finalAirdropValue: number;
  }>({
    userPoints: 100,
    pricePerPoint: 71.11,
    fdv: 2,
    fdvUnit: "B",
    finalAirdropValue: 7111,
  });

  // Sync Handlers between FDV and Price Per Point using confirmed 32% allocation
  const handleFdvChange = (val: string) => {
    setLastEdited("fdv");
    if (val === "") {
      setFdv("");
      setPricePerPoint("");
      return;
    }
    
    // Restrict typed value to 1 decimal place to prevent entering more than that
    let cleanVal = val;
    const dotIdx = val.indexOf(".");
    if (dotIdx !== -1 && val.length - dotIdx - 1 > 1) {
      cleanVal = val.slice(0, dotIdx + 2);
    }
    const num = Number(cleanVal);
    if (isNaN(num)) return;
    const clampedNum = Math.max(0, num);
    setFdv(clampedNum);
    
    // Calculate PPP based on FDV (round to 2 decimal places) with confirmed 32%
    const absoluteFDV = clampedNum * (fdvUnit === "B" ? 1e9 : 1e6);
    const ppp = (absoluteFDV * (AIRDROP_PERCENT / 100)) / (TOTAL_DISTRIBUTED_POINTS * 1e6);
    setPricePerPoint(Math.round(ppp * 100) / 100);
  };

  const handleFdvUnitChange = (newUnit: "M" | "B") => {
    setLastEdited("fdv");
    setFdvUnit(newUnit);
    if (fdv === "") return;
    // Calculate PPP based on FDV (round to 2 decimal places) with confirmed 32%
    const absoluteFDV = Number(fdv) * (newUnit === "B" ? 1e9 : 1e6);
    const ppp = (absoluteFDV * (AIRDROP_PERCENT / 100)) / (TOTAL_DISTRIBUTED_POINTS * 1e6);
    setPricePerPoint(Math.round(ppp * 100) / 100);
  };

  const handlePricePerPointChange = (val: string) => {
    setLastEdited("price");
    if (val === "") {
      setPricePerPoint("");
      setFdv("");
      return;
    }
    
    // Restrict typed value to 2 decimal places to prevent entering more than that
    let cleanVal = val;
    const dotIdx = val.indexOf(".");
    if (dotIdx !== -1 && val.length - dotIdx - 1 > 2) {
      cleanVal = val.slice(0, dotIdx + 3);
    }
    const num = Number(cleanVal);
    if (isNaN(num)) return;
    const clampedNum = Math.max(0, num);
    setPricePerPoint(clampedNum);
    
    // Calculate FDV based on PPP (round to 1 decimal place) with confirmed 32%
    const percentFraction = AIRDROP_PERCENT / 100;
    const absoluteFDV = percentFraction > 0 ? (clampedNum * TOTAL_DISTRIBUTED_POINTS * 1e6) / percentFraction : 0;
    if (absoluteFDV >= 1e9) {
      const calculatedFdv = absoluteFDV / 1e9;
      setFdv(Math.round(calculatedFdv * 10) / 10);
      setFdvUnit("B");
    } else {
      const calculatedFdv = absoluteFDV / 1e6;
      setFdv(Math.round(calculatedFdv * 10) / 10);
      setFdvUnit("M");
    }
  };

  // Perform calculation ONLY when user clicks on Calculate
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTriggerFlash(true);

    const pts = Number(userPoints) || 0;
    const ppp = pricePerPoint === "" ? 0 : Number(pricePerPoint);
    const finalVal = pts * ppp;

    setCalculatedData({
      userPoints: pts,
      pricePerPoint: ppp,
      fdv,
      fdvUnit,
      finalAirdropValue: finalVal,
    });

    setTimeout(() => {
      setIsCalculating(false);
      setTriggerFlash(false);
    }, 400);
  };

  // Share calculation on Twitter/X
  const handleShareTwitter = () => {
    const formattedVal = formatUSD(calculatedData.finalAirdropValue, 0);
    const text = `Just estimated my @variational airdrop value using the Points Calculator! 💎\n\n• Points: ${formatNumber(calculatedData.userPoints)}\n• FDV: ${calculatedData.fdv === "" ? "$0" : `$${calculatedData.fdv}${calculatedData.fdvUnit}`}\n• Allocation: 32% (Confirmed)\n• Airdrop Value: ${formattedVal} USD\n\nTry it yourself with referral code OMNITECCNV2A for a 1.125x boost! 🚀`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/airdrop" : "")}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  // HTML5 Canvas card downloader
  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1200, 630);

    // Draw Cyber Grid
    ctx.strokeStyle = "rgba(20, 21, 26, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 630);
      ctx.stroke();
    }
    for (let y = 0; y < 630; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Radial blue glow in center
    const radialGlow = ctx.createRadialGradient(600, 315, 50, 600, 315, 600);
    radialGlow.addColorStop(0, "rgba(0, 136, 255, 0.15)");
    radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 1200, 630);

    // Rounded rectangle helper
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill?: string,
      stroke?: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // Card frame
    drawRoundedRect(60, 40, 1080, 550, 16, "rgba(5, 5, 7, 0.9)", "#121216");
    
    // Ambient cyan/blue corner highlights
    ctx.strokeStyle = "#0088FF";
    ctx.lineWidth = 3;
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(85, 40);
    ctx.lineTo(60, 40);
    ctx.lineTo(60, 65);
    ctx.stroke();
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(1115, 40);
    ctx.lineTo(1140, 40);
    ctx.lineTo(1140, 65);
    ctx.stroke();

    // Draw Brand Header
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(112, 105);
    ctx.lineTo(124, 80);
    ctx.strokeStyle = "#0088FF";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("VARIATIONAL", 140, 95);
    
    ctx.fillStyle = "#8E919A";
    ctx.font = "12px monospace";
    ctx.fillText("AIRDROP POINT SIMULATOR", 140, 115);

    // Season badge
    drawRoundedRect(950, 75, 150, 30, 6, "rgba(0, 136, 255, 0.1)", "#0088FF");
    ctx.fillStyle = "#0088FF";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Season 1 Calculator", 970, 94);

    // Large Estimated Box
    drawRoundedRect(100, 160, 1000, 180, 12, "#050507", "rgba(0, 136, 255, 0.35)");
    
    // Result Text
    ctx.fillStyle = "#8E919A";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ESTIMATED AIRDROP VALUE", 140, 205);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 60px sans-serif";
    ctx.fillText(formatUSD(calculatedData.finalAirdropValue, 2), 140, 275);
    
    ctx.fillStyle = "#8E919A";
    ctx.font = "12px monospace";
    ctx.fillText("USD", 140, 305);

    // Details Grid Layout
    const details = [
      { label: "Your points =", val: formatNumber(calculatedData.userPoints) },
      { label: "Price per point =", val: `$${calculatedData.pricePerPoint.toFixed(2)} USD` },
      { label: "Assumed FDV =", val: calculatedData.fdv === "" ? "$0" : `$${calculatedData.fdv}${calculatedData.fdvUnit}` },
      { label: "Airdrop Allocation =", val: `${AIRDROP_PERCENT}% (Confirmed)` },
      { label: "Distributed Points =", val: `${TOTAL_DISTRIBUTED_POINTS}M` }
    ];

    const startX = 120;
    const startY = 390;
    ctx.font = "14px sans-serif";

    details.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      
      const x = startX + col * 500;
      const y = startY + row * 45;

      // Label
      ctx.fillStyle = "#8E919A";
      ctx.fillText(item.label, x, y);

      // Value
      ctx.fillStyle = item.label.includes("Multiplier") ? "#10B981" : "#FFFFFF";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(item.val, x + 200, y);
      ctx.font = "14px sans-serif"; // reset
    });

    // Footnote
    ctx.fillStyle = "#4A4D56";
    ctx.font = "11px monospace";
    ctx.fillText("This is an estimation based on simulated criteria. Not official financial allocation.", 100, 565);

    // Download image
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `variational-airdrop-estimate-${calculatedData.userPoints}-pts.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">

      {/* Page Title & Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-secondary font-mono">VARIATIONAL</span>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center">
            <Gift size={24} className="mr-2 text-accent-blue" />
            <span>Points Airdrop Estimate</span>
          </h2>
        </div>
        <div className="px-3 py-1 rounded bg-card border border-border text-xs font-semibold text-accent-blue neon-text-blue tracking-wider font-mono">
          Season 1 calculator
        </div>
      </div>

      {/* Main Unified Calculator Block */}
      <div className="bg-card/60 border border-border rounded-xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle grid pattern background on the card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.03),transparent_70%)] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left Panel (Inputs) - col-span-5 */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <Calculator size={14} className="mr-1.5 text-accent-blue" />
                <span>Input</span>
              </h3>

              <form onSubmit={handleCalculate} className="space-y-4">
                {/* Your Points */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-text-secondary font-bold flex items-center justify-between">
                    <span>Your Points</span>
                  </label>
                  <div className="bg-[#030305] border border-[#14151A] rounded px-3 py-2 flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={userPoints || ""}
                      onChange={(e) => setUserPoints(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent w-full text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Price per Point (USD) */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-text-secondary font-bold flex items-center justify-between">
                    <span>Price per Point (USD)</span>
                    <span className="text-[10px] text-muted font-normal lowercase">(updates fdv)</span>
                  </label>
                  <div className="bg-[#030305] border border-[#14151A] rounded px-3 py-2 flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricePerPoint || ""}
                      onChange={(e) => handlePricePerPointChange(e.target.value)}
                      className="bg-transparent w-full text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* FDV (Fully Diluted Valuation) */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-text-secondary font-bold flex items-center justify-between">
                    <span>FDV</span>
                    <span className="text-[10px] text-muted font-normal lowercase">(updates price)</span>
                  </label>
                  <div className="flex rounded border border-[#14151A] overflow-hidden bg-[#030305]">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={fdv || ""}
                      onChange={(e) => handleFdvChange(e.target.value)}
                      className="bg-transparent flex-1 px-3 py-2 text-white text-sm focus:outline-none font-mono"
                    />
                    <div className="flex border-l border-[#14151A]">
                      <button
                        type="button"
                        onClick={() => handleFdvUnitChange("M")}
                        className={cn(
                          "px-4 py-2 text-xs font-mono font-bold transition-all duration-150 cursor-pointer",
                          fdvUnit === "M" ? "bg-white text-black" : "text-[#8E919A] hover:text-white"
                        )}
                      >
                        M
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFdvUnitChange("B")}
                        className={cn(
                          "px-4 py-2 text-xs font-mono font-bold transition-all duration-150 border-l border-[#14151A] cursor-pointer",
                          fdvUnit === "B" ? "bg-white text-black" : "text-[#8E919A] hover:text-white"
                        )}
                      >
                        B
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmed Airdrop % Display (Slider removed) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                      <span>Airdrop %</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                        Confirmed
                      </span>
                    </span>
                    <span className="text-xs font-mono text-[#8E919A]">Official Allocation</span>
                  </div>
                  <div className="bg-[#030305] border border-[#14151A] rounded px-3 py-2.5 flex items-center justify-between">
                    <span className="text-white text-sm font-mono font-bold">32%</span>
                    <span className="text-xs font-mono text-[#8E919A]">Fixed allocation</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full mt-4 py-3 bg-accent-blue hover:bg-accent-blue-hover active:scale-[0.98] text-white text-xs font-bold font-mono tracking-widest uppercase rounded transition-all flex items-center justify-center space-x-2 shadow-lg shadow-accent-blue/10 cursor-pointer disabled:opacity-50"
                >
                  <Calculator size={13} />
                  <span>{isCalculating ? "Calculating..." : "Calculate"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel (Results) - col-span-7 */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-[#14151A] pt-6 lg:pt-0 lg:pl-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest text-center">
                Estimated Airdrop
              </h3>

              {/* Giant Result Box */}
              <div className="bg-gradient-to-br from-[#06070a] to-[#030305] border border-border/85 rounded-lg p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] shadow-inner select-all">
                {/* Glow ring in backdrop */}
                <div className="absolute w-64 h-64 bg-accent-blue/5 rounded-full filter blur-3xl pointer-events-none -bottom-32 -right-32" />
                
                {/* Visual pulse indicator when calculating */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calculatedData.finalAirdropValue}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex flex-col items-center justify-center transition-all duration-300",
                      triggerFlash && "scale-105 opacity-50 duration-75"
                    )}
                  >
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center">
                      {formatUSD(calculatedData.finalAirdropValue, 2)}
                    </span>
                    <span className="text-xs font-mono uppercase font-bold tracking-widest text-text-secondary mt-2.5">
                      USD
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Details Breakdown Table */}
              <div className="border border-[#14151A] bg-[#030305]/40 rounded-lg divide-y divide-[#14151A] font-mono text-xs overflow-hidden">
                <div className="flex justify-between items-center p-3">
                  <span className="text-text-secondary">Your points =</span>
                  <span className="text-white font-bold">{formatNumber(calculatedData.userPoints)}</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-text-secondary">Price per point =</span>
                  <span className="text-white font-bold">${calculatedData.pricePerPoint.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-text-secondary">Airdrop allocation =</span>
                  <span className="text-emerald-400 font-bold">32% (Confirmed)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card font-bold">
                  <span className="text-accent-blue">Est. Airdrop Value =</span>
                  <span className="text-white neon-text-blue">{formatUSD(calculatedData.finalAirdropValue, 2)} USD</span>
                </div>
              </div>
            </div>

            {/* Actions Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#14151A]">
              <button
                onClick={handleDownloadCard}
                className="flex-1 py-3 border border-[#14151A] bg-[#08080A] hover:bg-[#14151A] active:scale-[0.98] text-white text-xs font-bold font-mono uppercase rounded transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
              
              <button
                onClick={handleShareTwitter}
                className="flex-1 py-3 bg-[#030305] border border-[#14151A] hover:bg-[#08080A] active:scale-[0.98] text-white text-xs font-bold font-mono uppercase rounded transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#1DA1F2]" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share in Twitter</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Formula Info Box */}
      <div className="bg-card/40 border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-[#030305] border border-border rounded-lg text-accent-blue flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Formula</h4>
            <p className="text-xs font-mono text-text-secondary mt-1">
              Estimated Airdrop = (Your Points / Total Distributed Points) x FDV x 32% (Confirmed Allocation)
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#030305] border border-border rounded-lg text-xs text-text-secondary font-mono tracking-wide shrink-0">
          Total Distributed Points is locked to 9M for Variational.
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="bg-card border border-border p-4 rounded-lg flex items-start space-x-3 text-xs text-text-secondary">
        <Info size={16} className="text-accent-blue shrink-0 mt-0.5" />
        <div className="space-y-1 leading-normal">
          <p className="font-bold text-white uppercase tracking-wider text-xs font-mono">Simulation Parameters Notice</p>
          <p>
            The values calculated here are estimates for user convenience based on the confirmed 32% airdrop allocation. Final valuations and token claims are subject to official confirmation by the Variational Protocol foundation.
          </p>
        </div>
      </div>
    </div>
  );
}
