import React from 'react';

interface HudPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const HudPanel: React.FC<HudPanelProps> = ({ title, children, className = '', onClick, active = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative border bg-hud-panel backdrop-blur-sm p-3 flex flex-col min-h-0
        transition-all duration-300
        ${active ? 'border-hud-highlight shadow-[0_0_15px_rgba(103,232,249,0.3)]' : 'border-hud-border hover:border-hud-text'}
        ${onClick ? 'cursor-pointer interactive-click' : ''}
        ${className}
      `}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-hud-text pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-hud-text pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-hud-text pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-hud-text pointer-events-none"></div>
      
      {/* Optional Title Bar */}
      {title && (
        <div className="flex items-center justify-between mb-2 border-b border-hud-border pb-1 shrink-0">
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-hud-highlight">
            {title}
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-hud-text animate-pulse"></div>
            <div className="w-1 h-1 bg-hud-text animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-hud-text animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
      
      {/* Content Area - strictly flex-1 and overflow-y-auto to prevent clipping */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 relative">
        {children}
      </div>
    </div>
  );
};
