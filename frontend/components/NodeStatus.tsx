import React from 'react';
import { Server, Database, Globe, Cpu } from 'lucide-react';

export const NodeStatus: React.FC = () => {
  const nodes = [
    { icon: Server, name: "Gateway API", latency: "12ms", status: "ONLINE" },
    { icon: Database, name: "Memory Bank", latency: "4ms", status: "ONLINE" },
    { icon: Globe, name: "Webhook Processor", latency: "18ms", status: "ONLINE" },
    { icon: Cpu, name: "Model Armor", latency: "8ms", status: "ONLINE" }
  ];

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center justify-between border border-hud-border/30 p-2 bg-black/30 hover:border-hud-highlight/50 transition-colors">
          <div className="flex items-center gap-2">
            <n.icon className="w-4 h-4 text-hud-text/70" />
            <span className="text-[10px] text-hud-text tracking-wider">{n.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-hud-text/50 font-mono">{n.latency}</span>
            <span className="text-[9px] text-hud-success flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-hud-success animate-pulse"></div>
              {n.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
