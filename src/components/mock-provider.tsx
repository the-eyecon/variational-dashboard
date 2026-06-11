"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsContextType {
  isMockMode: boolean;
  setIsMockMode: (mode: boolean) => void;
  lastUpdated: Date;
  setLastUpdated: (date: Date) => void;
  refresh: () => void;
  isRefreshing: boolean;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function MockProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // Default to mock mode since it provides high fidelity without API keys or CORS issues
  const [isMockMode, setIsMockModeState] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync state with localStorage if available (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem("variational_mock_mode");
    if (saved !== null) {
      setIsMockModeState(saved === "true");
    }
  }, []);

  const setIsMockMode = (mode: boolean) => {
    setIsMockModeState(mode);
    localStorage.setItem("variational_mock_mode", String(mode));
    setLastUpdated(new Date());
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to refresh queries", err);
    } finally {
      // Keep loading spinner rotating for at least 500ms for clean UI transition
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        isMockMode,
        setIsMockMode,
        lastUpdated,
        setLastUpdated,
        refresh,
        isRefreshing,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a MockProvider");
  }
  return context;
}
