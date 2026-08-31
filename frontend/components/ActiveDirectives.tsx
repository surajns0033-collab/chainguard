import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const ActiveDirectives: React.FC = () => {
  const directives = [
    { icon: Shield, text: "Zero-Trust Auth Enforced", status: "ACTIVE" },
    { icon: Lock, text: "A2A Payload Encryption", status: "ACTIVE" },
    { icon: Eye, text: "Prompt Injection Screening", status: "ACTIVE" },
    { icon: FileText, text: "PII Redaction Protocol", status: "ACTIVE" }
  ];

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {directives.map((d, i) => (
        <div key={i} className="flex items-center justify-between border-b border-hud-border/30 pb-2 last:border-0">
          <div className="flex items-center gap-2">
            <d.icon className="w-4 h-4 text-hud-highlight" />
            <span className="text-[10px] text-hud-text tracking-wider">{d.text}</span>
          </div>
          <span className="text-[9px] text-hud-success border border-hud-success/50 bg-hud-success/10 px-1.5 py-0.5">
            {d.status}
          </span>
        </div>
      ))}
    </div>
  );
};
