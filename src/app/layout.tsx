import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import MarqueeBanner from "../components/marquee-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Variational | Institutional Analytics Dashboard",
  description: "Real-time treasury metrics, market statistics, open interest, and risk analysis for Variational Protocol.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="h-screen bg-background font-sans text-text-primary antialiased flex flex-col relative overflow-hidden">
        {/* Animated Cybernetic/Neon Background Backdrop */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute inset-0 cyber-grid opacity-35" />
          <div className="absolute top-[-20%] left-[-10%] ambient-glow-1" />
          <div className="absolute bottom-[-20%] right-[-10%] ambient-glow-2" />
        </div>

        <Providers>
          <div className="flex flex-col h-full w-full z-10 relative overflow-hidden">
            {/* Top moving banner */}
            <MarqueeBanner />

            <div className="flex flex-1 w-full min-w-0 overflow-hidden">
              {/* Sidebar navigation */}
              <Sidebar />

              {/* Main content viewport */}
              <div className="flex-1 flex flex-col min-w-0 bg-background border-l border-border h-full overflow-hidden">
                {/* Top application header */}
                <Header />

                {/* Page viewport */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col justify-between">
                  <div className="space-y-6 flex-1 pb-6">
                    {children}
                  </div>
                  
                  {/* Global Footer */}
                  <footer className="py-4 border-t border-border/30 text-center text-xs text-text-secondary font-mono tracking-wider select-none">
                    Made by <a href="https://x.com/CryptoEyeCon" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-accent-blue transition-colors duration-200">EyeCon</a> with <span className="text-danger">❤️</span>
                  </footer>
                </main>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
