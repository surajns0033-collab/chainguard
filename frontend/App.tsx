import React, { useState, useEffect } from 'react';
import { HudPanel } from './components/HudPanel';
import { AgentGrid } from './components/AgentGrid';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { Terminal, TerminalCommand } from './components/Terminal';
import { SystemStats } from './components/SystemStats';
import { Agent, WORKFLOW_STATES } from './data/chainguard';
import { Shield, Activity, Database, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [workflowState, setWorkflowState] = useState(1); // Start at SCREENING
  const [terminalCommand, setTerminalCommand] = useState<TerminalCommand | null>(null);
  
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "[SYS] INITIALIZING ZERO TRUST ARCHITECTURE...",
    "[SYS] SPIFFE IDENTITY SERVICE ONLINE.",
    "[SYS] MODEL ARMOR SCREENING ACTIVE."
  ]);

  // Simulate incoming security logs
  useEffect(() => {
    const logs = [
      "[SEC] Webhook payload verified (HMAC-SHA256).",
      "[SEC] Input screening: No PII detected.",
      "[SEC] A2A Gateway: Trace ID generated.",
      "[WARN] Minor anomaly in vendor data. Risk Analyst notified.",
      "[SEC] Prompt injection check passed.",
      "[SYS] Durable execution checkpoint saved.",
      "[NET] SSE stream latency nominal."
    ];
    
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
      setSecurityLogs(prev => {
        const newLogs = [...prev, `[${timestamp}] ${randomLog}`];
        if (newLogs.length > 20) return newLogs.slice(newLogs.length - 20);
        return newLogs;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Interactive Handlers
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setTerminalCommand({
      text: `Query status and capabilities of agent: ${agent.name} (${agent.id})`,
      timestamp: Date.now()
    });
  };

  const handleStateClick = (index: number) => {
    setWorkflowState(index);
    setTerminalCommand({
      text: `Explain workflow state: ${WORKFLOW_STATES[index]} and its requirements.`,
      timestamp: Date.now()
    });
  };

  const handleCentralScan = () => {
    setTerminalCommand({
      text: `Run full system diagnostic and verify A2A Gateway security.`,
      timestamp: Date.now()
    });
  };

  const handleArchitectureQuery = () => {
    setTerminalCommand({
      text: `Detail the system architecture and technology stack.`,
      timestamp: Date.now()
    });
  };

  return (
    <div className="h-screen w-screen bg-hud-base text-hud-text font-mono p-4 flex flex-col overflow-hidden selection:bg-hud-highlight selection:text-black">
      
      {/* Header - Fixed height */}
      <header className="flex justify-between items-end mb-4 border-b-2 border-hud-border pb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.3em] text-hud-highlight uppercase flex items-center gap-2">
            <Shield className="w-6 h-6" />
            ChainGuard
          </h1>
          <div className="text-sm tracking-widest opacity-70">AUTONOMOUS MULTI-AGENT SUPPLY CHAIN ORCHESTRATOR</div>
        </div>
        <div className="text-right text-sm flex gap-4">
          <div className="flex flex-col items-end">
            <span className="opacity-50 text-xs">AUTH</span>
            <span className="text-hud-success flex items-center gap-1"><Lock className="w-3 h-3"/> DENY-BY-DEFAULT</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50 text-xs">SYS.STATE</span>
            <span className="text-hud-highlight animate-pulse">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Grid - strictly flex-1 and min-h-0 to prevent overflowing the screen */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: Agents & Details */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          <HudPanel title="Agent Fleet (8)" className="flex-[3]">
            <AgentGrid 
              onSelectAgent={handleAgentSelect} 
              selectedAgentId={selectedAgent?.id || null} 
            />
          </HudPanel>
          
          <HudPanel title="Agent Diagnostics" className="flex-[2]">
            {selectedAgent ? (
              <div className="flex flex-col gap-2 text-sm h-full">
                <div className="flex justify-between border-b border-hud-border/50 pb-1">
                  <span className="opacity-50">ID</span>
                  <span className="text-hud-highlight">{selectedAgent.id}</span>
                </div>
                <div className="flex justify-between border-b border-hud-border/50 pb-1">
                  <span className="opacity-50">ROLE</span>
                  <span>{selectedAgent.role}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-hud-border/50 pb-1">
                  <span className="opacity-50">RBAC SCOPES</span>
                  <span className="text-xs text-hud-highlight break-words">{selectedAgent.scopes}</span>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <Activity className="w-4 h-4 text-hud-success" />
                  <span className="text-xs">IDENTITY URI VERIFIED</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-hud-text/30 text-sm text-center">
                SELECT AGENT FOR<br/>DIAGNOSTIC DATA
              </div>
            )}
          </HudPanel>
        </div>

        {/* Center Column: Tactical Interface */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          <HudPanel title="Tactical Interface" className="flex-1">
            <Terminal externalCommand={terminalCommand} />
          </HudPanel>
          
          {/* Quick Action Bar */}
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleArchitectureQuery}
              className="flex-1 border border-hud-border bg-hud-panel py-2 text-xs tracking-widest hover:bg-hud-highlight/20 hover:border-hud-highlight transition-colors interactive-click"
            >
              QUERY ARCHITECTURE
            </button>
            <button 
              onClick={() => setTerminalCommand({ text: "List all security protocols and screening measures.", timestamp: Date.now() })}
              className="flex-1 border border-hud-border bg-hud-panel py-2 text-xs tracking-widest hover:bg-hud-highlight/20 hover:border-hud-highlight transition-colors interactive-click"
            >
              VERIFY SECURITY
            </button>
          </div>
        </div>

        {/* Right Column: Workflow, Durable Execution & Security */}
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <HudPanel title="Workflow State Machine" className="flex-[2]">
            <WorkflowVisualizer 
              currentStateIndex={workflowState} 
              onStateClick={handleStateClick} 
            />
          </HudPanel>

          {/* Durable Execution Visual Element (Moved and Resized) */}
          <div 
            onClick={handleCentralScan}
            className="h-24 relative flex items-center justify-center border border-hud-border bg-hud-panel shrink-0 cursor-pointer interactive-click group overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute w-16 h-16 rounded-full border border-hud-text/20 animate-[spin_10s_linear_infinite] group-hover:border-hud-highlight transition-colors"></div>
            <div className="absolute w-20 h-20 rounded-full border border-dashed border-hud-highlight/30 animate-[spin_15s_linear_infinite_reverse] group-hover:border-hud-success transition-colors"></div>
            <div className="absolute w-12 h-12 rounded-full border-2 border-hud-text/50 flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover:border-hud-highlight transition-colors">
              <Database className="w-5 h-5 text-hud-highlight animate-pulse" />
            </div>
            <div className="absolute bottom-1 left-2 text-[10px] opacity-50">A2A GATEWAY</div>
            <div className="absolute top-1 right-2 text-[10px] opacity-50">DURABLE EXECUTION</div>
            <div className="absolute bottom-1 right-2 text-[10px] text-hud-highlight opacity-0 group-hover:opacity-100 transition-opacity">DIAGNOSE</div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            <HudPanel title="Security Feed">
              <div className="flex flex-col gap-1 text-[10px] overflow-y-auto pr-1 flex-col-reverse h-full">
                {securityLogs.map((log, i) => (
                  <div key={i} className={`
                    border-l-2 pl-1 py-0.5
                    ${log.includes('[WARN]') ? 'border-hud-alert text-hud-alert' : 'border-hud-text/30 text-hud-text/70'}
                  `}>
                    {log}
                  </div>
                ))}
              </div>
            </HudPanel>
            
            <HudPanel title="System Load">
              <SystemStats />
            </HudPanel>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
