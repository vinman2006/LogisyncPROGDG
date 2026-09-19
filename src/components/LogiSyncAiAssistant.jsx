import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Key,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const SYSTEM_INSTRUCTION = `You are the LogiSyncPRO Logistics Intelligence Agent, an autonomous enterprise AI engineered for high-throughput supply chain orchestration, multimodal route optimization, pharmaceutical cold-chain compliance, and API interoperability.

Your core domains and capabilities:
1. Multimodal Freight Routing: Dynamically compute and optimize transit across Maritime (TEU container ships), Air Freight, Continental Rail corridors, and Intermodal Highway Drayage.
2. Cold-Chain Pharma Compliance: Enforce rigorous 2°C to 8°C refrigerated thresholds and 15°C to 25°C Controlled Room Temperature (CRT) limits under GDP, WHO, and FDA 21 CFR Part 11 requirements. Provide action protocols when temperature excursions occur.
3. Predictive Disruption Intelligence: Anticipate port strikes, maritime chokepoint delays (Suez, Panama, Malacca), weather bottlenecks, customs demurrage risks, and auto-dispatch alternative routes.
4. Logistics Data Interoperability: Expert in GS1 EPCIS 2.0 (ObjectEvent, AggregationEvent, TransactionEvent with bizStep and disposition), EDI (EDIFACT 304/315, ANSI X12 204/214), FHIR health supply chain, and REST TMS/WMS/ERP payload normalization.
5. Telemetry & Sustainability: Track live GPS coordinates, ETA variance, carbon footprint offset (gCO2/ton-km), and fleet telemetry stored in NeonDB PostgreSQL.

Tone: Professional, direct, highly technical yet clear, structured with markdown headings, bullet points, and code/JSON snippets where applicable.`;

const DEFAULT_CHIPS = [
  { label: '❄️ Cold-Chain Compliance (2°C - 8°C)', query: 'Explain the critical SOP and excursion response protocol for a 2°C to 8°C pharmaceutical cold-chain shipment experiencing a 45-minute delay.' },
  { label: '🛣️ Optimize Nagpur → Mumbai Corridor', query: 'Analyze the freight corridor from Nagpur to Mumbai for a 12,000 kg cargo load. Compare road transit vs rail freight in terms of transit hours, cost, and reliability.' },
  { label: '📦 GS1 EPCIS 2.0 ObjectEvent JSON', query: 'Generate a valid GS1 EPCIS 2.0 JSON-LD ObjectEvent payload for a pharmaceutical pallet passing through an RFID checkpoint with bizStep "shipping" and disposition "in_transit".' },
  { label: '⚠️ Port Congestion & Demurrage Mitigation', query: 'What automated steps should LogiSyncPRO take when a container vessel approaches a port with a 72-hour discharge backlog to avoid demurrage fees?' },
  { label: '🚚 Multimodal Drayage Allocation', query: 'Recommend the optimal dispatch plan for a 4,500 kg temperature-sensitive consignment requiring final-mile distribution within 4 hours.' }
];

export default function LogiSyncAiAssistant({ 
  isOpen, 
  onClose, 
  initialQuery = '',
  onOpenDashboard,
  onOpenApiHub,
  onOpenPublicMap,
  inline = false,
}) {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('logisync_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState(null); // { success: boolean, msg: string }

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('logisync_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**LogiSyncPRO Logistics Intelligence Agent Online.**\n\nI am connected to your enterprise supply chain mesh. How can I assist your logistics operations today?\n\n- ❄️ **Cold-Chain Pharma Verification** (2°C - 8°C validation)\n- 🗺️ **Corridor Optimization & Rerouting** (Bypass bottlenecks)\n- 🔗 **API & GS1 EPCIS 2.0 Transformation** (WMS/TMS normalization)\n- 📊 **Telemetry Audits & Predictive Risk**`,
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Sync chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('logisync_chat_history', JSON.stringify(messages));
    } catch {
      // ignore storage quota error
    }
  }, [messages]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message to Gemini
  const handleSendMessage = async (customText = null) => {
    const promptText = (customText !== null ? customText : inputMessage).trim();
    if (!promptText || isLoading) return;

    // Check if API key is present
    const activeKey = apiKey || localStorage.getItem('logisync_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (!activeKey) {
      // Friendly prompt requesting user to provide their key
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `🔑 **Google Gemini API Key Required**\n\nTo activate real-time Gemini logistics intelligence, please click the **"Configure Gemini Key"** button above or enter your API key.\n\n*You can obtain a free Gemini API key in 30 seconds at [Google AI Studio](https://aistudio.google.com/app/apikey).*`,
            isKeyPrompt: true
          }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      // Build conversation history for multi-turn chat
      // Gemini expects format: contents: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
      const conversationContents = [];

      // Add recent turns (up to last 10 messages for context)
      const recentMessages = [...messages.slice(-10), userMsg];
      for (const m of recentMessages) {
        if (m.isKeyPrompt) continue;
        conversationContents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        });
      }

      // Try gemini-1.5-flash first, fallback to gemini-2.0-flash or gemini-1.5-pro if needed
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: conversationContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            topP: 0.95
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If model not found or quota issue, check error message
        const errMsg = data?.error?.message || `HTTP ${response.status}: Failed to reach Gemini API`;
        throw new Error(errMsg);
      }

      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('No response text generated by Gemini model.');
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: generatedText
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('[Gemini AI] Query Error:', err);
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ **Gemini API Exception**\n\n${err.message}\n\n*Check your API key in the settings (top-right key icon) or verify network connectivity.*`,
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial query if provided when opening
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && isOpen) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery, isOpen]);

  // Save API key
  const handleSaveKey = (keyToSave) => {
    const cleaned = (keyToSave || '').trim();
    setApiKey(cleaned);
    if (cleaned) {
      localStorage.setItem('logisync_gemini_api_key', cleaned);
    } else {
      localStorage.removeItem('logisync_gemini_api_key');
    }
    setIsKeyModalOpen(false);
    setKeyTestStatus({ success: true, msg: 'Gemini API Key saved successfully!' });
    setTimeout(() => setKeyTestStatus(null), 4000);
  };

  // Test API key against Gemini endpoint
  const handleTestKey = async (testKey) => {
    const key = (testKey || apiKey || keyInput).trim();
    if (!key) {
      setKeyTestStatus({ success: false, msg: 'Please enter a valid Gemini API key first.' });
      return;
    }

    setIsTestingKey(true);
    setKeyTestStatus(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with the word "CONNECTED" only.' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `API Error (${response.status})`);
      }

      setKeyTestStatus({
        success: true,
        msg: '✓ Gemini API key is valid and connected to LogiSyncPRO!'
      });
      // Save it since it works
      handleSaveKey(key);
    } catch (err) {
      console.error('[Gemini AI] Test Key Error:', err);
      setKeyTestStatus({
        success: false,
        msg: `Connection failed: ${err.message}`
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    const initialWelcome = {
      id: 'welcome-1',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `**Conversation cleared.** LogiSyncPRO Logistics Intelligence Agent ready for queries.`,
    };
    setMessages([initialWelcome]);
    localStorage.removeItem('logisync_chat_history');
  };

  if (!isOpen) return null;

  // Inline mode: fills parent. Modal mode: fixed overlay drawer.
  const outerClass = inline
    ? 'flex flex-col h-full bg-[#030e0b] text-white'
    : 'fixed inset-0 z-50 flex items-center justify-end';

  const innerClass = inline
    ? 'flex flex-col flex-1 bg-[#030e0b] text-white overflow-hidden'
    : `relative z-50 flex flex-col bg-[#030e0b] border-l border-[#13493b] shadow-2xl text-white transition-all duration-300 ${
        isFullScreen
          ? 'w-full h-full max-w-none'
          : 'w-full max-w-2xl h-full sm:h-[94vh] sm:my-auto sm:mr-4 sm:rounded-3xl border sm:border-[#1b5c49]'
      }`;

  return (
    <div className={outerClass}>
      {/* Backdrop (modal mode only) */}
      {!inline && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        />
      )}
      {/* Main Panel */}
      <div className={innerClass}>
        {/* ─── 1. TOP HEADER BAR ────────────────────────────────────────── */}
        <div className="h-16 px-6 border-b border-[#0f382e] bg-[#051713] flex items-center justify-between shrink-0 sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#092b22] border border-[#1b5c47] flex items-center justify-center text-[#ff5500] shadow-md">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-white tracking-wide uppercase">
                  LogiSync<span className="text-[#ff5500]">PRO</span> AI
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-[#10b981] border border-emerald-800 font-bold">
                  GEMINI POWERED
                </span>
              </div>
              <div className="text-[10px] text-[#7ea597] font-mono flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-[#10b981] animate-ping-slow' : 'bg-amber-400'}`} />
                <span>{apiKey ? 'API Connected & Ready' : 'Key Setup Needed'}</span>
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Key Manager Button */}
            <button
              type="button"
              onClick={() => {
                setKeyInput(apiKey);
                setIsKeyModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                apiKey 
                  ? 'bg-[#07241d] border-[#134d3d] text-[#86b5a3] hover:text-white hover:border-[#10b981]' 
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse'
              }`}
              title="Configure Gemini API Key"
            >
              <Key size={13} className={apiKey ? 'text-[#10b981]' : 'text-amber-400'} />
              <span className="hidden sm:inline">{apiKey ? 'Gemini Key' : 'Add Gemini Key'}</span>
            </button>

            {/* Clear History */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-[#7ea597] hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <Trash2 size={15} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="hidden sm:flex p-2 rounded-xl text-[#7ea597] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isFullScreen ? 'Exit fullscreen' : 'Expand full screen'}
            >
              {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#7ea597] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Close AI Assistant"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── KEY SETUP CALLOUT (If not yet configured) ───────────────── */}
        {!apiKey && (
          <div className="bg-[#1a1103] border-b border-amber-500/30 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-amber-400 shrink-0" />
              <span>Provide your Google Gemini API key to activate live generative responses.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setKeyInput(apiKey);
                setIsKeyModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] uppercase tracking-wider shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              Configure Key Now
            </button>
          </div>
        )}

        {/* Status Toast Banner */}
        {keyTestStatus && (
          <div className={`px-6 py-2 border-b text-xs flex items-center justify-between animate-in fade-in ${
            keyTestStatus.success 
              ? 'bg-[#05291f] border-[#0d4f3b] text-[#34d399]' 
              : 'bg-[#2a0c12] border-[#5c1622] text-rose-300'
          }`}>
            <span>{keyTestStatus.msg}</span>
            <button 
              type="button" 
              onClick={() => setKeyTestStatus(null)}
              className="font-bold opacity-70 hover:opacity-100 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* ─── 2. QUICK PROMPT CHIPS ────────────────────────────────────── */}
        <div className="px-6 py-2.5 bg-[#041410] border-b border-[#0d3429] overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
          <span className="text-[10px] font-mono text-[#689182] uppercase tracking-wider shrink-0">
            QUICK PROMPTS:
          </span>
          {DEFAULT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.query)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-[#07241d] hover:bg-[#0c392e] text-[#a0ccbd] hover:text-white border border-[#114033] hover:border-[#1b5c47] text-[11px] whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ─── 3. MESSAGES STREAM ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#030e0b]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#092b22] border border-[#1b5c47] flex items-center justify-center text-[#ff5500] shrink-0 mt-0.5 shadow-md">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-[#0f3d30] border border-[#1b6b54] text-white rounded-tr-none'
                      : 'bg-[#061e18] border border-[#103b2f] text-[#d6ede4] rounded-tl-none'
                  }`}
                >
                  {/* Message Top Meta */}
                  <div className="flex items-center justify-between gap-4 pb-1.5 mb-2 border-b border-white/10 text-[10px] font-mono text-[#7ea597]">
                    <span className="font-bold uppercase tracking-wider">
                      {isUser ? 'Operator' : 'LogiSyncPRO AI Agent'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:text-white transition-colors cursor-pointer"
                          title="Copy response text"
                        >
                          {copiedId === msg.id ? (
                            <Check size={12} className="text-[#10b981]" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body with Clean Formatting */}
                  <div className="whitespace-pre-wrap font-sans space-y-2 leading-relaxed">
                    {msg.text.split('\n\n').map((para, pIdx) => {
                      // Check for JSON or code blocks
                      if (para.startsWith('```') || para.includes('```')) {
                        const cleanCode = para.replace(/```[a-z]*\n?/gi, '');
                        return (
                          <div key={pIdx} className="my-2 p-3 rounded-xl bg-[#020b08] border border-[#0e3a2d] font-mono text-[11px] text-emerald-300 overflow-x-auto relative group">
                            <pre>{cleanCode}</pre>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(`code-${pIdx}`, cleanCode)}
                              className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        );
                      }

                      // Check for bullet points
                      if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
                        const items = para.split('\n').filter(Boolean);
                        return (
                          <ul key={pIdx} className="list-disc list-inside space-y-1 my-1 pl-1">
                            {items.map((item, iIdx) => (
                              <li key={iIdx} className="leading-normal">
                                {renderFormattedText(item.replace(/^[-*]\s+/, ''))}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      return <p key={pIdx}>{renderFormattedText(para)}</p>;
                    })}
                  </div>

                  {/* If message is a key prompt, render quick action button */}
                  {msg.isKeyPrompt && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setKeyInput(apiKey);
                          setIsKeyModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#030e0b] font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
                      >
                        <Key size={13} />
                        <span>Enter Gemini API Key</span>
                      </button>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#86b5a3] hover:text-white flex items-center gap-1 border border-white/10"
                      >
                        <span>Get Free Key</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#104b3b] border border-[#1b6b54] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-[#092b22] border border-[#1b5c47] flex items-center justify-center text-[#ff5500] shrink-0 shadow-md">
                <Bot size={16} />
              </div>
              <div className="bg-[#061e18] border border-[#103b2f] rounded-2xl rounded-tl-none p-4 text-xs text-[#8daea3] flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <span className="font-mono">Synthesizing logistics intelligence via Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── 4. BOTTOM INPUT BAR ─────────────────────────────────────── */}
        <div className="p-4 sm:p-5 bg-[#051713] border-t border-[#0f382e] shrink-0 sm:rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={apiKey ? "Ask about cold-chain, corridors, GS1 EPCIS, multimodal routing..." : "Enter a query or configure your Gemini API key..."}
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#030e0b] border border-[#114033] text-white text-xs sm:text-sm placeholder-[#5c8576] focus:outline-none focus:border-[#10b981] transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#5c8576] hidden sm:inline">
                Enter ↵
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-[#ff5500] hover:bg-[#ff6924] disabled:bg-[#1a382e] disabled:text-[#426b5e] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#ff5500]/20 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Dispatch</span>
            </button>
          </form>

          {/* Bottom Quick Links to Website Modules */}
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#689182]">
            <div className="flex items-center gap-3">
              {onOpenDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDashboard();
                  }}
                  className="hover:text-[#10b981] transition-colors cursor-pointer"
                >
                  → Open Command Center
                </button>
              )}
              {onOpenApiHub && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApiHub();
                  }}
                  className="hover:text-[#ff5500] transition-colors cursor-pointer"
                >
                  → API Hub Normalizer
                </button>
              )}
              {onOpenPublicMap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPublicMap();
                  }}
                  className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                >
                  → Public Map
                </button>
              )}
            </div>
            <div className="hidden sm:block">
              Model: <span className="text-[#a0ccbd]">gemini-1.5-flash</span>
            </div>
          </div>
        </div>

        {/* ─── 5. API KEY CONFIGURATION MODAL ──────────────────────────── */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#07241d] rounded-3xl border border-[#13493b] shadow-2xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#0f382e]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0d3429] flex items-center justify-center text-[#ff5500]">
                    <Key size={16} />
                  </div>
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    Configure Google Gemini Key
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#7ea597] hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-xs text-[#8ab2a3] leading-relaxed">
                Enter your Google Gemini API key below. Your key is stored securely in your local browser storage (<code className="text-[#10b981]">localStorage</code>) and sent directly to Google's official Gemini endpoint.
              </p>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-[#7ea597] font-bold">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-[#03110d] border border-[#103b2f] text-white text-xs font-mono placeholder-[#5c8576] focus:outline-none focus:border-[#10b981]"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="p-1 rounded text-[#7ea597] hover:text-white"
                      title={showKeyText ? 'Hide key' : 'Show key'}
                    >
                      {showKeyText ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const clip = await navigator.clipboard.readText();
                          if (clip) setKeyInput(clip);
                        } catch {
                          // clipboard permission denied
                        }
                      }}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#a0ccbd] cursor-pointer"
                    >
                      Paste
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#03110d] border border-[#0e352a] text-[11px] text-[#7ea597] space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Need a free Gemini API key?</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff5500] hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <p>1. Sign in with your Google account</p>
                <p>2. Click <strong>"Create API key"</strong></p>
                <p>3. Paste the key above and click <strong>"Test &amp; Save"</strong></p>
              </div>

              {keyTestStatus && (
                <div className={`p-2.5 rounded-xl text-xs ${
                  keyTestStatus.success 
                    ? 'bg-[#05291f] text-[#34d399] border border-[#0d4f3b]' 
                    : 'bg-[#2a0c12] text-rose-300 border border-[#5c1622]'
                }`}>
                  {keyTestStatus.msg}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveKey('');
                      setKeyInput('');
                    }}
                    className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 cursor-pointer"
                  >
                    Remove Key
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    disabled={isTestingKey || !keyInput.trim()}
                    onClick={() => handleTestKey(keyInput)}
                    className="px-4 py-2 rounded-xl bg-[#0b3327] hover:bg-[#0f4032] border border-[#14533e] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingKey && <RefreshCw size={13} className="animate-spin text-[#10b981]" />}
                    <span>{isTestingKey ? 'Verifying...' : 'Test Key'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveKey(keyInput)}
                    className="px-5 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#030e0b] text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Save &amp; Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to format inline bold / code
function renderFormattedText(text) {
  if (!text) return null;

  // Split on **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Split on `code`
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((cp, cIdx) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return (
          <code key={`${index}-${cIdx}`} className="px-1.5 py-0.5 rounded bg-[#03110d] border border-[#0d3429] font-mono text-[11px] text-[#34d399]">
            {cp.slice(1, -1)}
          </code>
        );
      }
      return cp;
    });
  });
}
