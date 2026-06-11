import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class names safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers as USD currency
export function formatUSD(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Format numbers to compact representation (e.g. $1.2M, $450K)
export function formatCompactUSD(value: number): string {
  if (value >= 1.0e9) {
    return `$${(value / 1.0e9).toFixed(2)}B`;
  }
  if (value >= 1.0e6) {
    return `$${(value / 1.0e6).toFixed(2)}M`;
  }
  if (value >= 1.0e3) {
    return `$${(value / 1.0e3).toFixed(1)}K`;
  }
  return formatUSD(value, 2);
}

// Format raw numbers with commas
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Format percentages
export function formatPercent(value: number, isRawRate: boolean = false): string {
  // If isRawRate is true, 0.0125 represents 1.25% (i.e. we multiply by 100)
  // If isRawRate is false, 43.53 represents 43.53%
  const pct = isRawRate ? value * 100 : value;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

// Truncate crypto address
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// Format ISO date strings to human-readable dates
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format timestamps (time only or date + time)
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
