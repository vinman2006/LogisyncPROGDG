import React, { useState, useEffect } from 'react';
import {
  Network,
  Cpu,
  Code2,
  Share2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Key,
  Webhook,
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowLeft,
  Terminal,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ApiHubDashboard({ onBack, onExitToLanding }) {
  // Navigation tabs: 'architecture' | 'sandbox' | 'connectors' | 'keys' | 'schemas'
  const [activeTab, setActiveTab] = useState('architecture');

  // Connectors data
  const [connectors, setConnectors] = useState([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState('pharmacy-erp');
  const [isLoadingConnectors, setIsLoadingConnectors] = useState(true);

  // Sandbox state
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyConnector, setNewKeyConnector] = useState('pharmacy-erp');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState(null);

  // Load connectors catalog
  useEffect(() => {
    async function loadConnectors() {
      setIsLoadingConnectors(true);
      try {
        const res = await fetch('/api/hub/connectors');
        if (res.ok) {
          const data = await res.json();
          setConnectors(data.connectors || []);
          if (data.connectors?.length > 0) {
            const first = data.connectors[0];
            setSelectedConnectorId(first.id);
            setSandboxInput(JSON.stringify(first.samplePayload, null, 2));
          }
        }
      } catch (err) {
        console.warn('[ApiHub] Error fetching connectors:', err.message);
      } finally {
        setIsLoadingConnectors(false);
      }
    }

    async function loadKeys() {
      try {
        const res = await fetch('/api/hub/keys');
        if (res.ok) {
          const data = await res.json();
          setApiKeys(data.keys || []);
        }
      } catch (err) {
        console.warn('[ApiHub] Error fetching API keys:', err.message);
      }
    }

    loadConnectors();
    loadKeys();
  }, []);

  // Update sandbox input when selected connector changes
  const handleSelectConnectorForSandbox = (connId) => {
    setSelectedConnectorId(connId);
    const conn = connectors.find(c => c.id === connId);
    if (conn) {
      setSandboxInput(JSON.stringify(conn.samplePayload, null, 2));
      setSandboxOutput(null);
    }
  };

  // Run normalization
  const handleRunNormalization = async () => {
    setIsNormalizing(true);
    setSandboxOutput(null);
    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(sandboxInput);
      } catch (e) {
        setSandboxOutput({ error: `Invalid JSON syntax: ${e.message}` });
        setIsNormalizing(false);
        return;
      }

      const res = await fetch('/api/hub/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connector_id: selectedConnectorId,
          payload: parsedPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxOutput(data.result);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setSandboxOutput({ error: errJson.error || `HTTP error ${res.status}` });
      }
    } catch (err) {
      setSandboxOutput({ error: `Network failure: ${err.message}` });
    } finally {
      setIsNormalizing(false);
    }
  };

  // Generate new API Key
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/hub/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          connector: newKeyConnector
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.key) {
          setApiKeys(prev => [data.key, ...prev]);
          setGeneratedKeyResult(data.key);
          setNewKeyName('');
        }
      }
    } catch (err) {
      console.error('Failed generating key:', err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#030e0b] text-[#c7d5fd] select-none font-sans flex flex-col">
      {/* ─── TOP CONTROL BAR ─────────────────────────────────────────────────── */}
      <header className="h-16 px-6 sm:px-8 border-b border-[#0f382e] bg-[#041410] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {(onBack || onExitToLanding) && (
            <button
              type="button"
              onClick={onBack || onExitToLanding}
              className="p-2 rounded-xl bg-[#08221b] hover:bg-[#0c2f25] border border-[#13493b] text-[#7ea597] hover:text-white transition-all cursor-pointer"
              title="Return"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-[#08241d] border border-[#124b3b] flex items-center justify-center text-[#10b981] shadow-md">
            <Network size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">LogiSyncPRO</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/40 font-bold uppercase">
                API HUB
              </span>
            </div>
            <div className="text-[11px] text-[#6d9487]">Universal Interoperability & Supply Chain Normalization Layer</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#061b15] border border-[#0f382e] gap-1 text-xs">
          {[
            { id: 'architecture', label: 'Architecture & Flow', icon: Share2 },
            { id: 'sandbox', label: 'Live Normalizer Sandbox', icon: Play },
            { id: 'connectors', label: 'Connectors Directory', icon: Layers },
            { id: 'keys', label: 'API Keys & Webhooks', icon: Key },
            { id: 'schemas', label: 'Canonical Schemas', icon: FileCode2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#10b981] text-[#041410] shadow-sm'
                    : 'text-[#7ea597] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* ===================================================================== */}
        {/* TAB 1: ARCHITECTURE & INTEROPERABILITY FLOW                           */}
        {/* ===================================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Core Value Proposition Banner */}
            <div className="p-6 rounded-3xl bg-[#061e17] border border-[#13493b] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-mono text-[#34d399] font-bold uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>No Software Replacement Required</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    Don&apos;t compete with existing enterprise software. Connect it.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8eb6a7] leading-relaxed">
                    Pharmacies use Pharmacy ERPs. Manufacturers run SAP. Carriers operate fleet TMS. Warehouses rely on WMS. 
                    Building 50 point-to-point direct integrations creates an unmanageable web. 
                    <strong> LogiSyncPRO standardizes vendor data into a single canonical model</strong>, powered by GS1 EPCIS 2.0 and ANSI X12 EDI standards.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sandbox')}
                    className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041410] text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Play size={14} className="fill-[#041410]" />
                    <span>Try Normalizer Sandbox</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('connectors')}
                    className="px-5 py-2.5 rounded-xl bg-[#08251e] hover:bg-[#0c3329] border border-[#13493b] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Layers size={14} className="text-[#10b981]" />
                    <span>Browse 8 Connectors</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#051813] border border-[#0f382e] shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#0f382e] pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Canonical Interoperability Pipeline
                  </h2>
                  <p className="text-xs text-[#6d9487]">
                    External Vendor Systems &rarr; Specialized Connectors &rarr; LogiSyncPRO Canonical Model &rarr; Downstream Consumers
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#0a271f] text-[#34d399] border border-[#10b981]/30 font-bold">
                  GS1 EPCIS 2.0 &bull; EDI X12
                </span>
              </div>

              {/* Visual 3-Stage Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Column 1: Disparate Enterprise Systems (8 Sources) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#7ea597] font-bold px-1 flex items-center justify-between">
                    <span>Source Enterprise Systems</span>
                    <span className="text-[#10b981]">Native Vendor Software</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Pharmacy ERP', sub: 'Prescription & Batch Dispense', icon: 'Rx', color: 'border-emerald-500/50 bg-emerald-950/20' },
                      { name: 'Medicine Manufacturing ERP', sub: 'SAP / Dynamics 365 / Odoo', icon: 'Mfg', color: 'border-cyan-500/50 bg-cyan-950/20' },
                      { name: 'Transport TMS', sub: 'Fleet Telematics & GPS Corridors', icon: 'TMS', color: 'border-amber-500/50 bg-amber-950/20' },
                      { name: 'Warehouse WMS', sub: 'Manhattan / Blue Yonder Dock', icon: 'WMS', color: 'border-indigo-500/50 bg-indigo-950/20' },
                      { name: 'Retail ERP & E-Commerce', sub: 'Shopify / Magento / Retail POS', icon: 'OMS', color: 'border-rose-500/50 bg-rose-950/20' },
                      { name: 'GS1 EPCIS 2.0 & EDI', sub: 'JSON-LD / ANSI X12 (204, 214, 856)', icon: 'GS1', color: 'border-teal-500/50 bg-teal-950/20' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border ${item.color} flex items-center justify-between transition-all hover:scale-[1.01]`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#041410] border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                            {item.icon}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-[#7ea597]">{item.sub}</div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#456d61]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: LogiSyncPRO Hub & Normalizer */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#041410] border-2 border-[#10b981] shadow-2xl relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#0a2e23] border border-[#10b981] flex items-center justify-center text-[#10b981] shadow-lg mb-4">
                    <Cpu size={28} className="animate-pulse" />
                  </div>

                  <h3 className="text-base font-black text-white text-center tracking-tight">
                    LogiSyncPRO Interoperability Hub
                  </h3>
                  <div className="text-[11px] text-[#10b981] font-mono mt-0.5 font-bold uppercase">
                    Canonical Normalization Engine
                  </div>

                  <p className="text-xs text-[#7ea597] text-center mt-3 leading-relaxed">
                    Translates 8 diverse protocols into a single, standardized, auditable supply chain record.
                  </p>

                  <div className="w-full mt-5 pt-4 border-t border-[#0f382e] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-[#a0cdbe]">
                      <span>Schema Validation:</span>
                      <strong className="text-emerald-400 font-mono">OpenAPI 3.1 &bull; JSON-LD</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#a0cdbe]">
                      <span>Traceability Standard:</span>
                      <strong className="text-emerald-400 font-mono">GS1 EPCIS 2.0 CBV</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#a0cdbe]">
                      <span>Database Storage:</span>
                      <strong className="text-emerald-400 font-mono">NeonDB PostgreSQL Ledger</strong>
                    </div>
                  </div>
                </div>

                {/* Column 3: Canonical Models & Downstream Targets */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#7ea597] font-bold px-1 flex items-center justify-between">
                    <span>Canonical Data Model</span>
                    <span className="text-[#10b981]">NeonDB Ledger</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#08221b] border border-[#12493a] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#10b981]" />
                          <span>1. Shipments Pipeline</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#031410] text-[#10b981]">
                          Shipment.v1
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7ea597]">
                        Unified origin, destination, cold-chain compliance specs, consignee identity, and pallet weight.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#08221b] border border-[#12493a] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#06b6d4]" />
                          <span>2. Real-Time Tracking</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#031410] text-[#06b6d4]">
                          Telemetry.v1
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7ea597]">
                        Live GPS corridor coordinates, vehicle IoT telematics, temperature sensor alerts (2&deg;C - 8&deg;C).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#08221b] border border-[#12493a] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#f59e0b]" />
                          <span>3. Immutable Audit Events</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#031410] text-[#f59e0b]">
                          EventChain.v2
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7ea597]">
                        Chronological lifecycle ledger: COMMISSIONED &rarr; FACTORY RELEASE &rarr; LOADED &rarr; IN TRANSIT &rarr; DELIVERED.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Philosophy comparison table */}
              <div className="pt-6 border-t border-[#0f382e] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#140a0a] border border-rose-950/70 space-y-1">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>Without LogiSyncPRO Hub: Fragile Web of Direct Integrations</span>
                  </div>
                  <p className="text-[11px] text-rose-200/70 leading-relaxed">
                    Pharmacy A connects directly to Carrier B via custom SOAP. Warehouse C uses FTP EDI to Shipper D. 
                    Every new partner requires writing custom point-to-point glue code, leading to O(N&sup2;) integration complexity.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#041d16] border border-emerald-800/70 space-y-1">
                  <div className="font-bold text-[#34d399] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>With LogiSyncPRO Hub: Canonical Normalization</span>
                  </div>
                  <p className="text-[11px] text-[#a0cdbe] leading-relaxed">
                    Every software speaks its own language once to a specialized Connector. 
                    LogiSyncPRO converts it into the Canonical Model. Adding a new partner requires 1 connection, not 50.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: LIVE NORMALIZER SANDBOX                                        */}
        {/* ===================================================================== */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Live Normalization Playground</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">
                    Interactive
                  </span>
                </h1>
                <p className="text-xs text-[#7ea597] mt-0.5">
                  Select a vendor protocol below, edit the incoming payload, and run real-time canonical transformation.
                </p>
              </div>

              {/* Source Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7ea597] font-semibold">Vendor Source:</span>
                <select
                  value={selectedConnectorId}
                  onChange={(e) => handleSelectConnectorForSandbox(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#061b15] border border-[#13493b] text-white text-xs font-semibold focus:outline-none focus:border-[#10b981] cursor-pointer"
                >
                  {connectors.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.protocol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Screen Editor & Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Raw Vendor Payload */}
              <div className="rounded-3xl bg-[#041410] border border-[#0f382e] shadow-xl flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#0f382e] bg-[#061e18] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-white">Incoming Vendor Payload</span>
                    <span className="text-[10px] font-mono text-[#7ea597] bg-[#03110d] px-2 py-0.5 rounded border border-white/5">
                      {connectors.find(c => c.id === selectedConnectorId)?.protocol || 'JSON'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const conn = connectors.find(c => c.id === selectedConnectorId);
                      if (conn) setSandboxInput(JSON.stringify(conn.samplePayload, null, 2));
                    }}
                    className="text-[11px] text-[#7ea597] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Reset Sample</span>
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col min-h-[380px]">
                  <textarea
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    className="w-full flex-1 p-4 rounded-2xl bg-[#020b08] border border-[#0e3328] font-mono text-xs text-[#99e6cf] focus:outline-none focus:border-[#10b981] leading-relaxed resize-none"
                    placeholder="Paste JSON vendor payload here..."
                    spellCheck={false}
                  />

                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#6d9487]">
                      Target: {connectors.find(c => c.id === selectedConnectorId)?.canonicalTarget || 'Canonical Model'}
                    </span>

                    <button
                      type="button"
                      onClick={handleRunNormalization}
                      disabled={isNormalizing}
                      className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041410] text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Play size={13} className={isNormalizing ? 'animate-spin fill-[#041410]' : 'fill-[#041410]'} />
                      <span>{isNormalizing ? 'Transforming...' : 'Normalize to LogiSyncPRO'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Normalized Canonical Output */}
              <div className="rounded-3xl bg-[#041410] border border-[#0f382e] shadow-xl flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#0f382e] bg-[#061e18] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs font-bold text-white">LogiSyncPRO Canonical Data Model</span>
                    <span className="text-[10px] font-mono text-[#10b981] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      CANONICAL OUTPUT
                    </span>
                  </div>

                  {sandboxOutput && !sandboxOutput.error && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(sandboxOutput, null, 2));
                        setCopiedPayload(true);
                        setTimeout(() => setCopiedPayload(false), 2000);
                      }}
                      className="text-[11px] text-[#7ea597] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPayload ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col min-h-[380px] bg-[#020b08] overflow-y-auto">
                  {!sandboxOutput ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#6d9487]">
                      <Cpu size={36} className="text-[#154637] mb-3" />
                      <div className="text-xs font-bold text-white">Ready for Normalization</div>
                      <p className="text-[11px] text-[#6d9487] mt-1 max-w-xs">
                        Click &quot;Normalize to LogiSyncPRO&quot; on the left to execute the canonical transformation engine.
                      </p>
                    </div>
                  ) : sandboxOutput.error ? (
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Normalization Error</span>
                      </div>
                      <p className="text-[11px]">{sandboxOutput.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Transformation summary tags */}
                      {sandboxOutput.transformations_applied && (
                        <div className="p-3 rounded-2xl bg-[#062118] border border-[#13493b] space-y-1">
                          <div className="text-[10px] font-mono text-[#34d399] font-bold uppercase tracking-wider">
                            Transformations Executed
                          </div>
                          <ul className="text-[11px] text-[#a0cdbe] list-disc list-inside space-y-0.5">
                            {sandboxOutput.transformations_applied.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Raw JSON viewer */}
                      <pre className="p-4 rounded-2xl bg-[#03110d] border border-[#0d2a21] font-mono text-xs text-[#5eead4] overflow-x-auto leading-relaxed">
                        {JSON.stringify(sandboxOutput.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: CONNECTORS DIRECTORY                                           */}
        {/* ===================================================================== */}
        {activeTab === 'connectors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Enterprise Connectors Catalog
              </h1>
              <p className="text-xs text-[#7ea597] mt-0.5">
                Pre-built protocol adapters for existing ERP, TMS, WMS, and GS1 supply chain standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectors.map(conn => (
                <div
                  key={conn.id}
                  className="p-6 rounded-3xl bg-[#061c16] border border-[#0f382e] shadow-xl flex flex-col justify-between space-y-4 hover:border-[#10b981]/50 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">
                        {conn.protocol}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#34d399] transition-colors">
                        {conn.name}
                      </h3>
                      <p className="text-xs text-[#7ea597] mt-1 leading-relaxed">
                        {conn.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#0e3328] space-y-1.5 text-xs">
                      <div className="text-[10px] font-mono text-[#6d9487] uppercase">Supported Systems:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {conn.supportedSystems?.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#031410] border border-[#103a2e] text-[#a0cdbe]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#0e3328] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectConnectorForSandbox(conn.id);
                        setActiveTab('sandbox');
                      }}
                      className="text-xs text-[#10b981] hover:text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Test in Sandbox</span>
                      <ArrowRight size={13} />
                    </button>
                    <span className="text-[10px] font-mono text-[#527a6e]">v2.0 Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: API KEYS & WEBHOOKS                                            */}
        {/* ===================================================================== */}
        {activeTab === 'keys' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Developer API Keys & Webhooks
              </h1>
              <p className="text-xs text-[#7ea597] mt-0.5">
                Issue cryptographic API keys to authenticate external ERP/TMS/WMS connectors into the LogiSyncPRO Hub.
              </p>
            </div>

            {/* Key Generation Form */}
            <div className="p-6 rounded-3xl bg-[#061e17] border border-[#124b3b] shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key size={16} className="text-[#10b981]" />
                <span>Generate Ingestion Key for External Software</span>
              </h3>

              <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#8eb6a7] mb-1">
                    Application / Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Apollo Pharmacy ERP Connector"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8eb6a7] mb-1">
                    Connector Target *
                  </label>
                  <select
                    value={newKeyConnector}
                    onChange={(e) => setNewKeyConnector(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white focus:outline-none focus:border-[#10b981] cursor-pointer"
                  >
                    {connectors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isGeneratingKey}
                    className="w-full py-2 px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041410] text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingKey ? 'Generating...' : 'Create API Key'}
                  </button>
                </div>
              </form>

              {generatedKeyResult && (
                <div className="p-4 rounded-2xl bg-[#031410] border border-emerald-500/50 space-y-1 text-xs">
                  <div className="text-[#34d399] font-bold">New Secret Key Generated:</div>
                  <div className="font-mono text-[11px] text-white bg-black/40 p-2 rounded-xl border border-white/10 select-all">
                    {generatedKeyResult.key}
                  </div>
                  <div className="text-[10px] text-[#7ea597]">
                    Store this key safely in your ERP environment configuration. It will not be shown in full again.
                  </div>
                </div>
              )}
            </div>

            {/* Active Keys Table */}
            <div className="rounded-3xl bg-[#051a14] border border-[#0f382e] shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#0f382e] text-xs font-bold text-white flex items-center justify-between">
                <span>Configured Enterprise Keys</span>
                <span className="text-[10px] font-mono text-[#6d9487]">Bearer Token Auth</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#a0cdbe]">
                  <thead className="bg-[#03110d] border-b border-[#0f382e] text-[#6d9487] font-semibold">
                    <tr>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Connector Protocol</th>
                      <th className="py-3 px-6">Token Prefix</th>
                      <th className="py-3 px-6">Permissions</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0c2a22]">
                    {apiKeys.map(k => (
                      <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-bold text-white">{k.name}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-[#7ea597]">{k.connector}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-emerald-400">{k.prefix || k.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {k.permissions?.map((p, i) => (
                              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#031410] border border-white/10">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {k.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: CANONICAL SCHEMA SPECIFICATIONS                                */}
        {/* ===================================================================== */}
        {activeTab === 'schemas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                LogiSyncPRO Canonical Data Model Specification
              </h1>
              <p className="text-xs text-[#7ea597] mt-0.5">
                Formal OpenAPI 3.1 &amp; GS1 EPCIS 2.0 object definitions that unify all external vendor payloads.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[#041410] border border-[#0f382e] shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#0f382e]">
                  <strong className="text-sm text-white">1. Canonical Shipment Entity</strong>
                  <span className="text-[10px] font-mono text-[#10b981]">LogiSyncPRO.Shipment.v1</span>
                </div>
                <p className="text-xs text-[#7ea597]">
                  Unified freight booking object shared across Requester ERP and Transport Carrier TMS.
                </p>
                <pre className="p-4 rounded-2xl bg-[#020b08] border border-[#0d2a21] font-mono text-[11px] text-[#5eead4] overflow-x-auto leading-relaxed">
{`{
  "tracking_number": "LS-959923",
  "source_protocol": "SAP_S4HANA | EPCIS_2_0 | TMS",
  "shipper_id": 1,
  "assigned_carrier_id": 2,
  "origin": {
    "city": "Nagpur",
    "state": "Maharashtra",
    "country": "India",
    "coordinates": [21.1458, 79.0882]
  },
  "destination": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "coordinates": [18.9496, 72.9515]
  },
  "cargo_specification": {
    "category": "PHARMACEUTICALS | COMMERCIAL_FREIGHT",
    "description": "Insulin Glargine Vials",
    "weight_kg": 12500.00,
    "temperature_range": "2°C to 8°C"
  },
  "status": "PENDING | ACCEPTED | IN_TRANSIT | DELIVERED"
}`}
                </pre>
              </div>

              <div className="p-6 rounded-3xl bg-[#041410] border border-[#0f382e] shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#0f382e]">
                  <strong className="text-sm text-white">2. GS1 EPCIS 2.0 Mapping Matrix</strong>
                  <span className="text-[10px] font-mono text-[#06b6d4]">EPCIS.EventChain.v2</span>
                </div>
                <p className="text-xs text-[#7ea597]">
                  Standardized supply-chain business steps mapped to LogiSyncPRO immutable events.
                </p>
                <pre className="p-4 rounded-2xl bg-[#020b08] border border-[#0d2a21] font-mono text-[11px] text-[#67e8f9] overflow-x-auto leading-relaxed">
{`{
  "gs1_biz_step_mapping": {
    "urn:epcglobal:cbv:bizstep:commissioning": "CREATED",
    "urn:epcglobal:cbv:bizstep:accepting": "ACCEPTED",
    "urn:epcglobal:cbv:bizstep:loading": "PICKUP_CONFIRMED",
    "urn:epcglobal:cbv:bizstep:shipping": "IN_TRANSIT",
    "urn:epcglobal:cbv:bizstep:arriving": "OUT_FOR_DELIVERY",
    "urn:epcglobal:cbv:bizstep:receiving": "DELIVERED"
  },
  "gs1_disposition_mapping": {
    "urn:epcglobal:cbv:disp:in_transit": "TRANSIT_VERIFIED",
    "urn:epcglobal:cbv:disp:active": "ACTIVE_FREIGHT"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
