export const CHAINGUARD_INFO = `
What is ChainGuard?
ChainGuard is an autonomous multi-agent system that manages enterprise supply chain workflows end-to-end. Instead of requiring human operators to manually coordinate vendors, compliance checks, procurement, and logistics, ChainGuard deploys 8 specialized AI agents that collaborate through a secure gateway with deny-by-default authorization.

Key Capabilities
🎯 Autonomous Workflows — Multi-step supply chain operations run without human intervention
🛡️ Security-First — Every external input is screened for prompt injection, PII, and data exfiltration before any agent touches it
◈ 8 Specialized Agents — Each with distinct capabilities, scopes, and authorization
🔄 Durable Execution — Checkpointed state machine with failure recovery
✋ Human-in-the-Loop — High-value operations pause for approval
🎤 Voice Interface — Natural language commands via Web Speech API
📡 Real-time Streaming — SSE event streams for live workflow monitoring
🔐 Signed Webhooks — Idempotent, HMAC-verified external event processing

Agent Fleet
1. Supply Chain Manager: Orchestrates end-to-end workflows (workflow:*, agent:dispatch)
2. Compliance Auditor: Validates regulatory compliance (compliance:read, policy:query)
3. Risk Analyst: Assesses vendor and operational risk (risk:read, vendor:read)
4. Logistics Specialist: Plans and monitors shipments (logistics:*)
5. Procurement Specialist: Manages purchase orders (procurement:*, erp:write)
6. Inventory Specialist: Tracks stock and availability (erp:inventory)
7. Quality Inspector: Final quality verification (quality:*)
8. Security Sentinel: Screens all external inputs (security:*)

Workflow State Machine
CREATED → SCREENING → VENDOR_EVALUATION → COMPLIANCE_CHECK → RISK_ASSESSMENT → PROCUREMENT → [APPROVAL_REQUIRED] → LOGISTICS_PLANNING → DELIVERY_MONITORING → QUALITY_INSPECTION → COMPLETED
Failed states: BLOCKED (security threat), FAILED (rejection/error)

Security Architecture
ChainGuard implements a Zero Trust Architecture aligned with the Fortified Fleet Blueprint:
Input Screening — Every external message is screened for Prompt injection, PII, Data exfiltration, Profanity.
SPIFFE-style Agent Identity — Every agent has a unique workload identity URI with RBAC scope enforcement.
A2A Protocol Gateway — Structured inter-agent messaging with trace IDs, scope verification, and Model Armor screening.
Signed Webhooks — External delivery events are verified with HMAC-SHA256 signatures.
Durable Execution — Long-running workflows checkpoint state at every transition.
`;

export interface Agent {
  id: string;
  name: string;
  role: string;
  scopes: string;
  icon: string;
  status: 'IDLE' | 'ACTIVE' | 'STANDBY' | 'ERROR';
}

export const AGENTS: Agent[] = [
  { id: 'agt-01', name: 'Supply Chain Manager', role: 'Orchestrator', scopes: 'workflow:*, agent:dispatch', icon: 'Target', status: 'ACTIVE' },
  { id: 'agt-02', name: 'Compliance Auditor', role: 'Validator', scopes: 'compliance:read, policy:query', icon: 'ClipboardCheck', status: 'IDLE' },
  { id: 'agt-03', name: 'Risk Analyst', role: 'Assessor', scopes: 'risk:read, vendor:read', icon: 'ShieldAlert', status: 'STANDBY' },
  { id: 'agt-04', name: 'Logistics Specialist', role: 'Planner', scopes: 'logistics:*', icon: 'Truck', status: 'ACTIVE' },
  { id: 'agt-05', name: 'Procurement Specialist', role: 'Buyer', scopes: 'procurement:*, erp:write', icon: 'ShoppingCart', status: 'IDLE' },
  { id: 'agt-06', name: 'Inventory Specialist', role: 'Tracker', scopes: 'erp:inventory', icon: 'Package', status: 'ACTIVE' },
  { id: 'agt-07', name: 'Quality Inspector', role: 'Verifier', scopes: 'quality:*', icon: 'CheckCircle', status: 'IDLE' },
  { id: 'agt-08', name: 'Security Sentinel', role: 'Screener', scopes: 'security:*', icon: 'Shield', status: 'ACTIVE' },
];

export const WORKFLOW_STATES = [
  'CREATED', 'SCREENING', 'VENDOR_EVALUATION', 'COMPLIANCE_CHECK',
  'RISK_ASSESSMENT', 'PROCUREMENT', 'APPROVAL_REQUIRED',
  'LOGISTICS_PLANNING', 'DELIVERY_MONITORING', 'QUALITY_INSPECTION', 'COMPLETED'
];

export const TECH_STACK = [
  { component: 'AI Framework', tech: 'Google ADK', status: 'ONLINE' },
  { component: 'LLM', tech: 'Gemini 2.5 Flash', status: 'ONLINE' },
  { component: 'Backend', tech: 'FastAPI + Python', status: 'ONLINE' },
  { component: 'Frontend', tech: 'Next.js 15 + React 19', status: 'ONLINE' },
  { component: 'Persistence', tech: 'JSON Store / Firestore', status: 'SYNCED' },
  { component: 'Events', tech: 'SSE / PubSub', status: 'STREAMING' },
  { component: 'Security', tech: 'Model Armor', status: 'ACTIVE' },
  { component: 'Container', tech: 'Docker Compose', status: 'RUNNING' }
];

export const ARCHITECTURE_LAYERS = [
  { name: 'Next.js Control Center', nodes: ['Dashboard', 'Agents', 'Security', 'Demo'] },
  { name: 'FastAPI Control Plane', nodes: ['Workflow Runtime', 'Gateway (AuthZ)', 'Security Screening', 'Webhook Processor'] },
  { name: 'Data & Policy', nodes: ['Store (JSON→FS)', 'Identity Service', 'Memory Bank', 'Policy RAG'] }
];
