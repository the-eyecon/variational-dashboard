"use client";

import React from "react";

export default function MarqueeBanner() {
  return (
    <div className="overflow-hidden bg-accent-blue/10 border-t border-accent-blue/20 py-2 relative flex select-none z-30">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-global {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-16.666%, 0, 0); }
        }
        .marquee-track-global {
          display: flex;
          width: max-content;
          animation: marquee-global 25s linear infinite;
        }
        .marquee-track-global:hover {
          animation-play-state: paused;
        }
      `}} />
      <div className="marquee-track-global flex whitespace-nowrap text-[11px] font-mono font-bold text-accent-blue neon-text-blue uppercase tracking-wider">
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
        <span className="pr-12">⚡ USE REFERRAL CODE &quot;<a href="https://omni.variational.io/?ref=OMNITECCNV2A" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors duration-200">OMNITECCNV2A</a>&quot; TO CLAIM A 12.5% MULTIPLIER BOOST ON YOUR VARIATIONAL POINTS! ⚡</span>
      </div>
    </div>
  );
}
