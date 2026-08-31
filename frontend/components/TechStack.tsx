import React from 'react';
import { TECH_STACK } from '../data/chainguard';
import { Cpu, Server, Database, Shield, Box, Globe, Activity, Layers } from 'lucide-react';

const icons = [Cpu, Globe, Server, Layers, Database, Activity, Shield, Box];

export const TechStack: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full pr-1">
      {TECH_STACK.map((item, idx) => {
        const Icon = icons[idx % icons.length];
        return (
          <div key={idx} className="border border-hud-border/50 bg-black/40 p-2 flex flex-col gap-2 hover:border-hud-text transition-colors interactive-click">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-hud-highlight" />
                <span className="text-[9px] md:text-[10px] opacity-70 uppercase">{item.component}</span>
              </div>
              <span className="text-[8px] px-1 border border-hud-success text-hud-success bg-hud-success/10">
                {item.status}
              </span>
            </div>
            <div className="text-[10px] md:text-xs font-bold text-hud-text glitch-hover truncate">
              {item.tech}
            </div>
            {/* Fake progress/status bar */}
            <div className="w-full h-1 bg-hud-border/30 mt-1 overflow-hidden">
              <div 
                className="h-full bg-hud-highlight" 
                style={{ width: `${70 + Math.random() * 30}%`, opacity: 0.7 }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
