import React from 'react';
import { ARCHITECTURE_LAYERS } from '../data/chainguard';
import { ArrowDown } from 'lucide-react';

export const Architecture: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-2 pr-1">
      {ARCHITECTURE_LAYERS.map((layer, idx) => (
        <React.Fragment key={idx}>
          <div className="border border-hud-border bg-hud-panel p-2 hover:border-hud-highlight transition-colors interactive-click">
            <div className="text-[10px] md:text-xs font-bold text-hud-highlight mb-2 border-b border-hud-border/50 pb-1 uppercase tracking-widest">
              {layer.name}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {layer.nodes.map((node, nIdx) => (
                <div key={nIdx} className="border border-hud-text/30 bg-black/60 p-1 text-center text-[8px] md:text-[9px] truncate hover:bg-hud-text/10 hover:text-white transition-colors">
                  {node}
                </div>
              ))}
            </div>
          </div>
          {idx < ARCHITECTURE_LAYERS.length - 1 && (
            <div className="flex justify-center text-hud-border">
              <ArrowDown className="w-4 h-4 animate-pulse" />
            </div>
          )}
        </React.Fragment>
      ))}
      
      <div className="mt-auto pt-2 border-t border-hud-border/50">
        <div className="text-[9px] text-hud-text/70 flex justify-between">
          <span>PROTOCOL: REST + SSE</span>
          <span className="text-hud-success">A2A GATEWAY: SECURE</span>
        </div>
      </div>
    </div>
  );
};
