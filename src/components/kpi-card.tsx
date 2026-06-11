"use client";

import React, { useState, useEffect, useRef } from "react";
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeRate?: number; // percentage change, e.g. 2.45 for +2.45%
  isRateRaw?: boolean;
  tooltipText?: string;
  loading?: boolean;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  changeRate,
  isRateRaw = false,
  tooltipText,
  loading = false,
  className,
}: KpiCardProps) {
  const [isChanged, setIsChanged] = useState(false);
  const prevValueRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (loading || value === "") return;
    
    const prevVal = prevValueRef.current;
    if (prevVal !== undefined && prevVal !== "" && value !== prevVal) {
      setIsChanged(true);
      const timer = setTimeout(() => {
        setIsChanged(false);
      }, 10000); // Highlight for 10 seconds
      
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    
    prevValueRef.current = value;
  }, [value, loading]);

  if (loading) {
    return (
      <div className={cn("bg-card border border-border p-4 rounded-lg space-y-3 animate-pulse", className)}>
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-border rounded" />
          <div className="h-4 w-4 bg-border rounded-full" />
        </div>
        <div className="h-7 w-32 bg-border rounded" />
        <div className="h-3.5 w-24 bg-border rounded" />
      </div>
    );
  }

  const isPositive = changeRate !== undefined && changeRate >= 0;

  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "#0088FF", boxShadow: "0 4px 20px rgba(0, 136, 255, 0.08)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-card p-4 rounded-lg flex flex-col justify-between relative group/card overflow-hidden transition-all duration-500",
        isChanged 
          ? "border-2 border-success shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
          : "border border-border",
        className
      )}
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/5 rounded-full blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider select-none">
          {title}
        </span>
        {tooltipText && (
          <div className="relative group/tooltip flex items-center justify-center">
            <Info 
              size={13} 
              className="text-muted group-hover/tooltip:text-text-secondary transition-colors cursor-help" 
              aria-label="Info description"
            />
            {/* Hover Tooltip Box */}
            <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 bg-background/95 backdrop-blur border border-border text-xs text-text-secondary p-2.5 rounded shadow-xl transition-all duration-200 origin-bottom-right">
              <div className="font-bold text-xs text-white uppercase mb-1">{title} Description</div>
              <div className="leading-relaxed font-normal">{tooltipText}</div>
            </div>
          </div>
        )}
      </div>

      {/* Body Value */}
      <div className="flex items-baseline space-x-2.5 my-1">
        <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white select-all">
          {value}
        </span>
      </div>

      {/* Footer Meta / Trend */}
      <div className="flex items-center justify-between mt-1 text-xs">
        {changeRate !== undefined ? (
          <div
            className={cn(
              "flex items-center font-mono font-semibold",
              isPositive ? "text-success" : "text-danger"
            )}
          >
            {isPositive ? <ArrowUpRight size={13} className="mr-0.5" /> : <ArrowDownRight size={13} className="mr-0.5" />}
            <span>
              {isPositive ? "+" : ""}
              {(isRateRaw ? changeRate * 100 : changeRate).toFixed(2)}%
            </span>
          </div>
        ) : (
          <div className="h-4" /> /* spacing */
        )}
        
        {subtitle && (
          <span className="text-muted font-medium select-none truncate max-w-[70%]">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}
