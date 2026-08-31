import React, { useState, useEffect } from 'react';
import { HudPanel } from './components/HudPanel';
import { AgentGrid } from './components/AgentGrid';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { Terminal, TerminalCommand } from './components/Terminal';
import { SystemStats } from './components/SystemStats';
import { Agent, WORKFLOW_STATES } from './data/chainguard';
import { Shield, Activity, Database, Lock, User, Settings, LogOut, LogIn, ChevronDown, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type IntegrationStatus = 'IDLE' | 'CONFIGURING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface Integration {
  id: string;
  name: string;
  status: IntegrationStatus;
  endpoint: string;
  apiKey: string;
}

const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [workflowState, setWorkflowState] = useState(1); // Start at SCREENING
  const [terminalCommand, setTerminalCommand] = useState<TerminalCommand | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // General Preferences State
  const [preferences, setPreferences] = useState({
    scanlines: true,
    audio: true,
    autoApprove: false,
    verbose: true
  });

  // Real-world connection states
  const [mcpUrl, setMcpUrl] = useState('wss://mcp.internal.net/v1');
  const [mcpToken, setMcpToken] = useState('');
  const [mcpStatus, setMcpStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'sap', name: 'SAP S/4HANA (ERP)', status: 'IDLE', endpoint: '', apiKey: '' },
    { id: 'sf', name: 'Salesforce API', status: 'IDLE', endpoint: '', apiKey: '' },
    { id: 'snow', name: 'Snowflake Data Cloud', status: 'IDLE', endpoint: '', apiKey: '' },
    { id: 'slack', name: 'Slack Webhooks', status: 'IDLE', endpoint: '', apiKey: '' }
  ]);

  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "[SYS] INITIALIZING ZERO TRUST ARCHITECTURE...",
    "[SYS] SPIFFE IDENTITY SERVICE ONLINE.",
    "[SYS] MODEL ARMOR SCREENING ACTIVE."
  ]);

  // Apply Scanlines effect based on preference
  useEffect(() => {
    const scanlinesEl = document.querySelector('.scanlines') as HTMLElement;
    if (scanlinesEl) {
      scanlinesEl.style.display = preferences.scanlines ? 'block' : 'none';
    }
  }, [preferences.scanlines]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

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

  const handleMenuAction = (modalType: string) => {
    setActiveModal(modalType);
    setIsDropdownOpen(false);
  };

  const handleModalSubmit = (query: string) => {
    setTerminalCommand({
      text: query,
      timestamp: Date.now()
    });
    setActiveModal(null);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Real-world Connection Logic
  const testMcpConnection = async () => {
    if (!mcpUrl) return;
    setMcpStatus('CONNECTING');
    
    try {
      if (mcpUrl.startsWith('ws://') || mcpUrl.startsWith('wss://')) {
        const ws = new WebSocket(mcpUrl);
        
        ws.onopen = () => {
          setMcpStatus('CONNECTED');
          setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [NET] MCP WebSocket connected successfully.`]);
          ws.close();
        };
        
        ws.onerror = (err) => {
          console.error("WebSocket Error:", err);
          setMcpStatus('ERROR');
          setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [ERROR] MCP WebSocket connection failed.`]);
        };
      } else {
        // Fallback to HTTP fetch
        const response = await fetch(mcpUrl, {
          method: 'GET',
          headers: mcpToken ? { 'Authorization': `Bearer ${mcpToken}` } : {}
        });
        
        if (response.ok) {
          setMcpStatus('CONNECTED');
          setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [NET] MCP HTTP endpoint verified.`]);
        } else {
          setMcpStatus('ERROR');
          setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [ERROR] MCP HTTP returned status ${response.status}.`]);
        }
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setMcpStatus('ERROR');
      setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [ERROR] MCP connection failed: Network error or CORS.`]);
    }
  };

  const updateIntegration = (id: string, updates: Partial<Integration>) => {
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, ...updates } : int));
  };

  const testIntegrationConnection = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration || !integration.endpoint) return;

    updateIntegration(id, { status: 'CONNECTING' });

    try {
      const response = await fetch(integration.endpoint, {
        method: 'GET', // Using GET as a simple ping. For webhooks, this might return 405, but proves the server exists.
        headers: integration.apiKey ? {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });

      // Even if it's a 401/403/405, the server is reachable. We consider 2xx as fully connected.
      if (response.ok) {
        updateIntegration(id, { status: 'CONNECTED' });
        setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [NET] ${integration.name} connected successfully.`]);
      } else {
        updateIntegration(id, { status: 'ERROR' });
        setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [ERROR] ${integration.name} returned ${response.status}.`]);
      }
    } catch (error) {
      console.error("Integration Error:", error);
      updateIntegration(id, { status: 'ERROR' });
      setSecurityLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0, 8)}] [ERROR] ${integration.name} connection failed (CORS or Network).`]);
    }
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
        <div className="text-right text-sm flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="opacity-50 text-xs">AUTH</span>
            <span className="text-hud-success flex items-center gap-1"><Lock className="w-3 h-3"/> DENY-BY-DEFAULT</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50 text-xs">SYS.STATE</span>
            <span className="text-hud-highlight animate-pulse">ONLINE</span>
          </div>
          
          {/* User Dropdown Menu */}
          <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 border border-hud-border px-3 py-2 transition-colors interactive-click ${isDropdownOpen ? 'bg-hud-highlight/20 border-hud-highlight' : 'hover:bg-hud-highlight/10 hover:border-hud-highlight/50'}`}
            >
              <User className="w-4 h-4 text-hud-highlight" />
              <span className="text-xs tracking-widest">USER</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 border border-hud-border bg-black/95 backdrop-blur-md z-40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="flex flex-col">
                  <button 
                    onClick={() => handleMenuAction('PROFILE')}
                    className="flex items-center gap-3 p-3 text-xs tracking-widest hover:bg-hud-highlight/20 hover:text-hud-highlight transition-colors text-left border-b border-hud-border/30"
                  >
                    <User className="w-3.5 h-3.5" /> PROFILE
                  </button>
                  <button 
                    onClick={() => handleMenuAction('SETTINGS')}
                    className="flex items-center gap-3 p-3 text-xs tracking-widest hover:bg-hud-highlight/20 hover:text-hud-highlight transition-colors text-left border-b border-hud-border/30"
                  >
                    <Settings className="w-3.5 h-3.5" /> SETTINGS
                  </button>
                  <button 
                    onClick={() => handleMenuAction('SIGN_IN')}
                    className="flex items-center gap-3 p-3 text-xs tracking-widest hover:bg-hud-highlight/20 hover:text-hud-highlight transition-colors text-left border-b border-hud-border/30"
                  >
                    <LogIn className="w-3.5 h-3.5" /> SIGN IN
                  </button>
                  <button 
                    onClick={() => handleMenuAction('SIGN_OUT')}
                    className="flex items-center gap-3 p-3 text-xs tracking-widest hover:bg-hud-alert/20 hover:text-hud-alert transition-colors text-left text-hud-alert/80"
                  >
                    <LogOut className="w-3.5 h-3.5" /> SIGN OUT
                  </button>
                </div>
              </div>
            )}
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

        {/* Center Column: AI Assistant */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          <HudPanel title="AI Assistant" className="flex-1">
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

          {/* Durable Execution Visual Element */}
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

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md max-h-[90vh] flex flex-col border border-hud-highlight bg-hud-base p-6 shadow-[0_0_30px_rgba(103,232,249,0.15)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hud-highlight pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hud-highlight pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hud-highlight pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hud-highlight pointer-events-none"></div>

            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-hud-text hover:text-hud-alert transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            {activeModal === 'PROFILE' && (
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-hud-highlight mb-6 tracking-widest shrink-0">[ USER PROFILE ]</h2>
                <div className="space-y-4 text-sm overflow-y-auto pr-2">
                  <div className="flex justify-between border-b border-hud-border/50 pb-2">
                    <span className="opacity-50">USER ID</span><span className="text-hud-text font-bold">USR-7734</span>
                  </div>
                  <div className="flex justify-between border-b border-hud-border/50 pb-2">
                    <span className="opacity-50">CLEARANCE</span><span className="text-hud-alert font-bold">LEVEL 5 (OMEGA)</span>
                  </div>
                  <div className="flex justify-between border-b border-hud-border/50 pb-2">
                    <span className="opacity-50">STATUS</span><span className="text-hud-success font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between border-b border-hud-border/50 pb-2">
                    <span className="opacity-50">LAST LOGIN</span><span className="text-hud-text">04:22:11 UTC</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full mt-6 border border-hud-border hover:bg-hud-text/10 py-3 tracking-widest transition-colors font-bold shrink-0"
                >
                  CLOSE
                </button>
              </div>
            )}

            {activeModal === 'SETTINGS' && (
              <div className="flex flex-col h-full min-h-0">
                <h2 className="text-lg font-bold text-hud-highlight mb-4 tracking-widest shrink-0">[ SYSTEM SETTINGS ]</h2>
                
                <div className="space-y-6 text-sm overflow-y-auto pr-2 flex-1 min-h-0">
                  {/* GENERAL */}
                  <div>
                    <h3 className="text-xs font-bold text-hud-text/70 border-b border-hud-border/50 pb-1 mb-3 tracking-widest">GENERAL PREFERENCES</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer hover:text-hud-highlight transition-colors">
                        <span>ENABLE SCANLINES</span>
                        <input 
                          type="checkbox" 
                          checked={preferences.scanlines} 
                          onChange={() => togglePreference('scanlines')} 
                          className="accent-hud-highlight w-4 h-4" 
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer hover:text-hud-highlight transition-colors">
                        <span>AUDIO FEEDBACK</span>
                        <input 
                          type="checkbox" 
                          checked={preferences.audio} 
                          onChange={() => togglePreference('audio')} 
                          className="accent-hud-highlight w-4 h-4" 
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer hover:text-hud-highlight transition-colors">
                        <span>AUTO-APPROVE LOW RISK</span>
                        <input 
                          type="checkbox" 
                          checked={preferences.autoApprove} 
                          onChange={() => togglePreference('autoApprove')} 
                          className="accent-hud-highlight w-4 h-4" 
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer hover:text-hud-highlight transition-colors">
                        <span>VERBOSE TELEMETRY</span>
                        <input 
                          type="checkbox" 
                          checked={preferences.verbose} 
                          onChange={() => togglePreference('verbose')} 
                          className="accent-hud-highlight w-4 h-4" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* MCP CONNECTOR */}
                  <div>
                    <h3 className="text-xs font-bold text-hud-text/70 border-b border-hud-border/50 pb-1 mb-3 tracking-widest">MCP CONNECTOR</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] opacity-50 mb-1">ENDPOINT URL (ws:// or http://)</label>
                        <input 
                          type="text" 
                          value={mcpUrl}
                          onChange={(e) => setMcpUrl(e.target.value)}
                          placeholder="wss://mcp.internal.net/v1" 
                          className="w-full bg-black/50 border border-hud-border p-2 text-hud-text outline-none focus:border-hud-highlight transition-colors text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] opacity-50 mb-1">AUTH TOKEN (Optional)</label>
                        <input 
                          type="password" 
                          value={mcpToken}
                          onChange={(e) => setMcpToken(e.target.value)}
                          placeholder="••••••••••••••••" 
                          className="w-full bg-black/50 border border-hud-border p-2 text-hud-text outline-none focus:border-hud-highlight transition-colors text-xs" 
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] flex items-center gap-1">
                          {mcpStatus === 'DISCONNECTED' && <><div className="w-2 h-2 rounded-full bg-hud-text/50"></div> <span className="text-hud-text/50">DISCONNECTED</span></>}
                          {mcpStatus === 'CONNECTING' && <><Loader2 className="w-3 h-3 animate-spin text-hud-highlight" /> <span className="text-hud-highlight">CONNECTING...</span></>}
                          {mcpStatus === 'CONNECTED' && <><CheckCircle2 className="w-3 h-3 text-hud-success" /> <span className="text-hud-success">CONNECTED</span></>}
                          {mcpStatus === 'ERROR' && <><AlertCircle className="w-3 h-3 text-hud-alert" /> <span className="text-hud-alert">CONNECTION FAILED</span></>}
                        </span>
                        <button 
                          onClick={testMcpConnection}
                          disabled={mcpStatus === 'CONNECTING'}
                          className="border border-hud-highlight text-hud-highlight px-3 py-1 text-[10px] hover:bg-hud-highlight/20 transition-colors disabled:opacity-50"
                        >
                          TEST CONNECTION
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* INTEGRATIONS */}
                  <div>
                    <h3 className="text-xs font-bold text-hud-text/70 border-b border-hud-border/50 pb-1 mb-3 tracking-widest">REAL-TIME INTEGRATIONS</h3>
                    <div className="space-y-3">
                      {integrations.map((int) => (
                        <div key={int.id} className="border border-hud-border/30 bg-black/30 transition-colors">
                          <div className="flex justify-between items-center p-2">
                            <span className="text-xs">{int.name}</span>
                            <button 
                              onClick={() => updateIntegration(int.id, { status: int.status === 'CONFIGURING' ? 'IDLE' : 'CONFIGURING' })}
                              className={`text-[9px] border px-2 py-0.5 transition-colors ${
                                int.status === 'CONNECTED' ? 'border-hud-success text-hud-success hover:bg-hud-success/10' : 
                                int.status === 'ERROR' ? 'border-hud-alert text-hud-alert hover:bg-hud-alert/10' :
                                'border-hud-border text-hud-text hover:bg-white/10'
                              }`}
                            >
                              {int.status === 'CONNECTED' ? 'CONNECTED' : int.status === 'ERROR' ? 'FAILED' : 'CONFIGURE'}
                            </button>
                          </div>
                          
                          {/* Configuration Sub-form */}
                          {int.status === 'CONFIGURING' && (
                            <div className="p-2 border-t border-hud-border/30 bg-black/50 space-y-2">
                              <div>
                                <label className="block text-[9px] opacity-50 mb-1">API ENDPOINT</label>
                                <input 
                                  type="text" 
                                  value={int.endpoint}
                                  onChange={(e) => updateIntegration(int.id, { endpoint: e.target.value })}
                                  placeholder="https://api.example.com/v1" 
                                  className="w-full bg-black border border-hud-border/50 p-1.5 text-hud-text outline-none focus:border-hud-highlight text-[10px]" 
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] opacity-50 mb-1">API KEY / BEARER TOKEN</label>
                                <input 
                                  type="password" 
                                  value={int.apiKey}
                                  onChange={(e) => updateIntegration(int.id, { apiKey: e.target.value })}
                                  placeholder="••••••••" 
                                  className="w-full bg-black border border-hud-border/50 p-1.5 text-hud-text outline-none focus:border-hud-highlight text-[10px]" 
                                />
                              </div>
                              <div className="flex justify-end pt-1">
                                <button 
                                  onClick={() => testIntegrationConnection(int.id)}
                                  className="bg-hud-highlight/20 border border-hud-highlight text-hud-highlight px-3 py-1 text-[9px] hover:bg-hud-highlight/40 transition-colors"
                                >
                                  SAVE & TEST
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Connecting State */}
                          {int.status === 'CONNECTING' && (
                            <div className="p-2 border-t border-hud-border/30 bg-black/50 flex items-center justify-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-hud-highlight" />
                              <span className="text-[10px] text-hud-highlight">VERIFYING ENDPOINT...</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleModalSubmit("Apply new system settings, update MCP configuration, and refresh integrations.")} 
                  className="w-full mt-4 border border-hud-highlight bg-hud-highlight/10 hover:bg-hud-highlight/30 text-hud-highlight py-3 tracking-widest transition-colors font-bold shrink-0"
                >
                  APPLY CHANGES
                </button>
              </div>
            )}

            {activeModal === 'SIGN_IN' && (
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-hud-highlight mb-6 tracking-widest shrink-0">[ AUTHENTICATION ]</h2>
                <div className="space-y-4 text-sm overflow-y-auto pr-2">
                  <div>
                    <label className="block text-xs opacity-50 mb-1">USER ID</label>
                    <input type="text" placeholder="ENTER ID..." className="w-full bg-black/50 border border-hud-border p-2.5 text-hud-text outline-none focus:border-hud-highlight transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs opacity-50 mb-1">PASSCODE</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-hud-border p-2.5 text-hud-text outline-none focus:border-hud-highlight transition-colors" />
                  </div>
                </div>
                <button 
                  onClick={() => handleModalSubmit("Authenticate user credentials and establish secure session.")} 
                  className="w-full mt-6 border border-hud-highlight bg-hud-highlight/10 hover:bg-hud-highlight/30 text-hud-highlight py-3 tracking-widest transition-colors font-bold shrink-0"
                >
                  INITIALIZE HANDSHAKE
                </button>
              </div>
            )}

            {activeModal === 'SIGN_OUT' && (
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-hud-alert mb-4 tracking-widest shrink-0">[ TERMINATE SESSION ]</h2>
                <div className="overflow-y-auto pr-2">
                  <p className="text-sm mb-8 text-hud-text/80 leading-relaxed">
                    Are you sure you want to sever the uplink? Unsaved local configurations and active terminal sessions will be purged.
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="flex-1 border border-hud-border hover:bg-hud-text/10 py-2.5 tracking-widest transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={() => handleModalSubmit("Execute session termination sequence and purge local cache.")} 
                    className="flex-1 border border-hud-alert text-hud-alert hover:bg-hud-alert/20 py-2.5 tracking-widest transition-colors font-bold"
                  >
                    CONFIRM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
