"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, Globe, Database, ArrowUpRight, Menu } from "lucide-react";
import { useSettings } from "./mock-provider";
import { formatDateTime } from "../lib/utils";

export default function Header() {
  const pathname = usePathname();
  const { isMockMode, setIsMockMode, lastUpdated, refresh, isRefreshing, isMobileSidebarOpen, setIsMobileSidebarOpen } = useSettings();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showStatus, setShowStatus] = useState<"idle" | "refreshing" | "complete">("idle");

  // Keep track of relative elapsed time since last sync
  useEffect(() => {
    setSecondsElapsed(0);
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Track refreshing status changes for UI status messages
  useEffect(() => {
    if (isRefreshing) {
      setShowStatus("refreshing");
    } else if (showStatus === "refreshing") {
      setShowStatus("complete");
      const timer = setTimeout(() => {
        setShowStatus("idle");
      }, 5000); // Remove after 5 seconds of completion
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, showStatus]);

  // Get human-readable page name based on route
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    const raw = segments[segments.length - 1];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  // Format elapsed time duration relatively
  const formatElapsed = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s ago`;
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 select-none">
      {/* Title */}
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu Toggle for Mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-text-secondary hover:text-white p-1.5 rounded hover:bg-border transition-colors md:hidden focus:outline-none -ml-1.5"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-bold text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Control Actions */}
      <div className="flex items-center space-x-4">
        {/* Mock/Live Data Toggle Selector (Only in Dev) */}
        {process.env.NODE_ENV === "development" && (
          <div className="flex items-center bg-background border border-border p-0.5 rounded-lg select-none">
            <button
              onClick={() => setIsMockMode(true)}
              className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all ${
                isMockMode
                  ? "bg-card text-accent-blue border border-border/80 shadow-md"
                  : "text-text-secondary hover:text-white"
              }`}
              title="Switch to mock data for instant previews without rate limits"
            >
              <Database size={13} className="mr-1.5" />
              <span>MOCK</span>
            </button>
            <button
              onClick={() => setIsMockMode(false)}
              className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all ${
                !isMockMode
                  ? "bg-card text-success border border-border/80 shadow-md"
                  : "text-text-secondary hover:text-white"
              }`}
              title="Attempt live connection to public endpoints"
            >
              <Globe size={13} className="mr-1.5" />
              <span>LIVE API</span>
            </button>
          </div>
        )}

        {/* Sync Info */}
        <div className="flex items-center space-x-3 text-xs border-l border-border pl-4">
          {/* Refresh Status Text */}
          {showStatus !== "idle" && (
            <div className="flex items-center space-x-1.5 mr-2 transition-all duration-300">
              {showStatus === "refreshing" ? (
                <div className="flex items-center space-x-1.5 text-accent-blue font-bold tracking-wider uppercase text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
                  <span>REFRESHING...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-success font-bold tracking-wider uppercase text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span>REFRESH COMPLETE</span>
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">
              Last Sync
            </span>
            <span className="font-mono text-text-primary font-medium">
              {formatElapsed(secondsElapsed)}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className={`p-2 rounded border border-border bg-card/80 text-text-secondary hover:text-white hover:border-text-secondary hover:bg-card transition-all flex items-center justify-center disabled:opacity-50`}
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard metrics"
          >
            <RefreshCw
              size={14}
              className={`${isRefreshing ? "animate-spin text-accent-blue" : "transition-transform duration-300 hover:rotate-180"}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
