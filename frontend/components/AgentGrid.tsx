import React, { useState } from 'react';
import { AGENTS, Agent } from '../data/chainguard';
import { Target, ClipboardCheck, ShieldAlert, Truck, ShoppingCart, Package, CheckCircle, Shield, Activity } from 'lucide-react';

const IconMap: Record<string, React.ElementType> = {
  Target, ClipboardCheck, ShieldAlert, Truck, ShoppingCart, Package, CheckCircle, Shield
};

interface AgentGridProps {
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ onSelectAgent, selectedAgentId }) => {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = (agent: Agent) => {
    setClickedId(agent.id);
    onSelectAgent(agent);
    setTimeout(() => setClickedId(null), 300);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-full pr-1">
      {AGENTS.map((agent) => {
        const Icon = IconMap[agent.icon] || Activity;
        const isSelected = agent.id === selectedAgentId;
        const isClicked = agent.id === clickedId;
        
        let statusColor = 'text-hud-text';
        if (agent.status === 'ACTIVE') statusColor = 'text-hud-success';
        if (agent.status === 'STANDBY') statusColor = 'text-hud-warning';
        if (agent.status === 'ERROR') statusColor = 'text-hud-alert';

        return (
          <div 
            key={agent.id}
            onClick={() => handleClick(agent)}
            className={`
              relative border p-2 cursor-pointer transition-all duration-200 flex flex-col gap-1 interactive-click
              ${isSelected ? 'border-hud-highlight bg-hud-text/10 shadow-[inset_0_0_10px_rgba(103,232,249,0.2)]' : 'border-hud-border/50 hover:border-hud-text/80 bg-black/40'}
              ${isClicked ? 'bg-hud-highlight/30' : ''}
            `}
          >
            {isClicked && <div className="absolute inset-0 border-2 border-hud-highlight animate-ping-once pointer-events-none"></div>}
            
            <div className="flex justify-between items-start">
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${statusColor}`} />
              <span className={`text-[10px] md:text-xs px-1 border ${statusColor} border-current`}>
                {agent.status}
              </span>
            </div>
            <div className="mt-1">
              <div className="text-xs md:text-sm font-bold truncate glitch-hover">{agent.name}</div>
              <div className="text-[10px] text-hud-text/60 uppercase tracking-wider truncate">{agent.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
