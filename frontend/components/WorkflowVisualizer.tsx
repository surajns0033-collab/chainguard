import React, { useState } from 'react';
import { WORKFLOW_STATES } from '../data/chainguard';
import { AlertTriangle, Check } from 'lucide-react';

interface WorkflowVisualizerProps {
  currentStateIndex: number;
  onStateClick: (index: number) => void;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ currentStateIndex, onStateClick }) => {
  const [authorizing, setAuthorizing] = useState(false);

  const handleStateClick = (index: number) => {
    if (WORKFLOW_STATES[index] === 'APPROVAL_REQUIRED' && index === currentStateIndex) {
      setAuthorizing(true);
      setTimeout(() => {
        setAuthorizing(false);
        onStateClick(index + 1);
      }, 1500);
    } else {
      onStateClick(index);
    }
  };

  return (
    <div className="flex flex-col gap-1 h-full pr-1">
      {WORKFLOW_STATES.map((state, index) => {
        const isPast = index < currentStateIndex;
        const isActive = index === currentStateIndex;
        const isFuture = index > currentStateIndex;
        const isApproval = state === 'APPROVAL_REQUIRED';

        return (
          <div 
            key={state} 
            onClick={() => handleStateClick(index)}
            className={`
              flex items-center gap-2 md:gap-3 p-1 md:p-1.5 cursor-pointer border-l-2 transition-colors interactive-click
              ${isActive ? 'border-hud-highlight bg-hud-highlight/10' : ''}
              ${isPast ? 'border-hud-success/50 text-hud-success/70 hover:bg-hud-success/10' : ''}
              ${isFuture ? 'border-hud-border/30 text-hud-text/40 hover:bg-hud-text/10' : ''}
              ${isApproval && isActive ? 'border-hud-alert bg-hud-alert/10 text-hud-alert' : ''}
            `}
          >
            <div className="font-mono text-[10px] md:text-xs w-4 text-right opacity-50 shrink-0">
              {(index + 1).toString().padStart(2, '0')}
            </div>
            
            <div className="relative flex-1 min-w-0">
              <div className={`text-xs md:text-sm tracking-wider truncate ${isActive ? 'font-bold animate-pulse' : ''} ${isApproval && isActive ? 'text-hud-alert' : isActive ? 'text-hud-highlight' : ''}`}>
                {state.replace(/_/g, ' ')}
              </div>
              {isActive && !isApproval && (
                <div className="absolute left-0 top-full mt-0.5 w-full h-[1px] bg-hud-highlight/50 overflow-hidden">
                  <div className="w-1/3 h-full bg-hud-highlight animate-[scanline_2s_linear_infinite_horizontal]"></div>
                </div>
              )}
            </div>
            
            {isPast && <div className="text-[10px] md:text-xs text-hud-success shrink-0 flex items-center gap-1"><Check className="w-3 h-3"/> OK</div>}
            {isActive && !isApproval && <div className="text-[10px] md:text-xs text-hud-highlight animate-pulse shrink-0">EXEC</div>}
            
            {isApproval && isActive && (
              <button 
                className={`
                  text-[10px] md:text-xs px-2 py-0.5 border shrink-0 flex items-center gap-1
                  ${authorizing ? 'bg-hud-alert text-black border-hud-alert' : 'border-hud-alert text-hud-alert hover:bg-hud-alert/20'}
                `}
              >
                {authorizing ? 'AUTHORIZING...' : <><AlertTriangle className="w-3 h-3"/> AUTHORIZE</>}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
