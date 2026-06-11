"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Gift,
  X
} from "lucide-react";
import { cn, shortenAddress } from "../lib/utils";
import { useSettings } from "./mock-provider";

const NAV_ITEMS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Treasury", href: "/treasury", icon: Wallet },
  { name: "Markets", href: "/markets", icon: TrendingUp },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Airdrop", href: "/airdrop", icon: Gift },
];

const TREASURY_WALLET = "0x5E91B40467FB8902C46A7B6CB90482363188D645";

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useSettings();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TREASURY_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address", err);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside 
        className={cn(
          // Base flex styles
          "bg-card border-r border-border flex flex-col transition-all duration-300 select-none h-full",
          collapsed ? "md:w-16" : "md:w-64",
          
          // Mobile viewport: fixed position drawer overlay sliding from left
          "fixed top-0 bottom-0 left-0 w-64 z-50 transform",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          
          // Desktop viewport (md and up): relative positioned normal flex child
          "md:relative md:translate-x-0 md:z-30 md:top-auto md:bottom-auto md:left-auto"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {/* Logo Brand / Icon */}
          <Link 
            href="/overview" 
            className={cn("flex items-center space-x-2 px-1", collapsed ? "md:hidden" : "block")}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/wordmark.svg" 
              alt="Variational Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          {collapsed && (
            <Link 
              href="/overview" 
              className="hidden md:flex mx-auto items-center justify-center w-full"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.svg" 
                alt="V" 
                className="h-12 w-12 object-contain"
              />
            </Link>
          )}

          {/* Toggle controls */}
          <div className="flex items-center space-x-1">
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-text-secondary hover:text-white p-1 rounded hover:bg-border transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
            
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-text-secondary hover:text-white p-1 rounded hover:bg-border transition-colors hidden md:block"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center py-2.5 px-3 rounded-md transition-all group font-medium text-sm",
                  isActive 
                    ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue pl-2.5" 
                    : "text-text-secondary hover:text-white hover:bg-card-hover"
                )}
              >
                <item.icon 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-accent-blue" : "text-text-secondary group-hover:text-white",
                    collapsed ? "md:mr-0 md:mx-auto" : "mr-3"
                  )} 
                  size={collapsed ? 21 : 18} 
                />
                <span className={cn(collapsed ? "md:hidden" : "inline")}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Address Info */}
        <div className="p-4 border-t border-border bg-background/30 text-xs">
          {/* Collapsed desktop state footer */}
          <div className={cn("hidden md:block", !collapsed && "md:hidden")}>
            <button 
              onClick={handleCopy}
              className="w-full text-text-secondary hover:text-white p-1 rounded hover:bg-border transition-colors flex justify-center"
              title="Copy Treasury Address"
            >
              {copied ? <Check size={14} className="text-success" /> : <Wallet size={14} />}
            </button>
          </div>
          
          {/* Full desktop and mobile state footer */}
          <div className={cn("space-y-2.5", collapsed && "md:hidden")}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted font-bold">
              <span>Treasury Address</span>
              <span className="text-[11px] text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">Arbitrum</span>
            </div>
            <div className="flex items-center justify-between bg-card p-2 rounded border border-border">
              <span className="font-mono text-text-secondary select-all font-medium">
                {shortenAddress(TREASURY_WALLET, 4)}
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                  title="Copy wallet address"
                  aria-label="Copy wallet address"
                >
                  {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
                <a
                  href={`https://arbiscan.io/address/${TREASURY_WALLET}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-white p-0.5 rounded transition-colors"
                  title="View on Arbiscan"
                  aria-label="View on Arbiscan"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
