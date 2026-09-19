import React, { useState, useMemo } from 'react';
import {
  FileText,
  Settings as Gear,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  X,
  Plus,
  ArrowRight,
  Maximize2,
  Calendar,
  ChevronDown,
  GitBranch
} from 'lucide-react';

export default function TransportSystemWorkflow({ 
  shipments = [], 
  onNavigateToShipments,
  onNavigateToCreateShipment: _onNavigateToCreateShipment 
}) {
  const [selectedNodeId, setSelectedNodeId] = useState('in-transit');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [shipmentFilter, setShipmentFilter] = useState('All Shipments');
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [customNodes, setCustomNodes] = useState([]);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');

  // Calculate dynamic node counts based on shipments in system
  // Pure real data: when user creates shipments, reflect them
  const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const cancelledCount = shipments.filter(s => s.status === 'Cancelled').length;

  const nodeCounts = useMemo(() => {
    if (shipments.length > 0) {
      return {
        upload: 0,
        processing: 0,
        dispatch: 0,
        'in-transit': inTransitCount,
        'out-for-delivery': 0,
        delivered: deliveredCount,
        exception: cancelledCount,
        'on-hold': 0,
      };
    }
    // Baseline distribution exactly matching the user's reference mockup
    return {
      upload: 12,
      processing: 10,
      dispatch: 8,
      'in-transit': 15,
      'out-for-delivery': 6,
      delivered: 28,
      exception: 3,
      'on-hold': 2,
    };
  }, [shipments, inTransitCount, deliveredCount, cancelledCount]);

  const NODES = [
    {
      id: 'upload',
      title: 'Upload',
      badge: nodeCounts.upload,
      description: 'Add shipment details, documents and references.',
      detailDesc: 'Initial submission of shipment documentation, manifest data, and customs references.',
      icon: FileText,
      theme: 'blue',
      status: 'Active',
      colorClasses: {
        border: 'border-sky-500/30 hover:border-sky-400',
        activeBorder: 'border-sky-400 ring-2 ring-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.25)]',
        bg: 'bg-[#061822]/95',
        badgeColor: 'text-sky-400',
        iconBg: 'bg-sky-500/20 text-sky-400',
        bar: 'bg-sky-500',
      }
    },
    {
      id: 'processing',
      title: 'Processing',
      badge: nodeCounts.processing,
      description: 'Verify details and prepare for dispatch.',
      detailDesc: 'Automated document verification, barcode assignment, and staging for outbound courier handover.',
      icon: Gear,
      theme: 'teal',
      status: 'Active',
      colorClasses: {
        border: 'border-teal-500/30 hover:border-teal-400',
        activeBorder: 'border-teal-400 ring-2 ring-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.25)]',
        bg: 'bg-[#04201c]/95',
        badgeColor: 'text-teal-400',
        iconBg: 'bg-teal-500/20 text-teal-400',
        bar: 'bg-teal-500',
      }
    },
    {
      id: 'dispatch',
      title: 'Dispatch',
      badge: nodeCounts.dispatch,
      description: 'Shipment leaves the origin facility.',
      detailDesc: 'Physical vehicle loading, driver manifest sign-off, and corridor route initialization.',
      icon: Truck,
      theme: 'emerald',
      status: 'Active',
      colorClasses: {
        border: 'border-emerald-500/30 hover:border-emerald-400',
        activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        bg: 'bg-[#052219]/95',
        badgeColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        bar: 'bg-emerald-500',
      }
    },
    {
      id: 'in-transit',
      title: 'In Transit',
      badge: nodeCounts['in-transit'],
      description: 'Live tracking and movement across locations.',
      detailDesc: 'Shipments that are currently moving between locations.',
      icon: Package,
      theme: 'indigo',
      status: 'Active',
      colorClasses: {
        border: 'border-indigo-500/50 hover:border-indigo-400',
        activeBorder: 'border-indigo-400 ring-2 ring-indigo-500/50 shadow-[0_0_24px_rgba(99,102,241,0.35)]',
        bg: 'bg-[#0e1633]/95',
        badgeColor: 'text-indigo-300',
        iconBg: 'bg-indigo-500/25 text-indigo-300',
        bar: 'bg-indigo-500',
      }
    },
    {
      id: 'out-for-delivery',
      title: 'Out for Delivery',
      badge: nodeCounts['out-for-delivery'],
      description: 'Shipment is with local delivery partner.',
      detailDesc: 'Last-mile logistics handover to localized courier vehicle with final recipient ETA dispatch.',
      icon: Truck,
      theme: 'amber',
      status: 'Active',
      colorClasses: {
        border: 'border-amber-500/30 hover:border-amber-400',
        activeBorder: 'border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        bg: 'bg-[#221706]/95',
        badgeColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20 text-amber-400',
        bar: 'bg-amber-500',
      }
    },
    {
      id: 'delivered',
      title: 'Delivered',
      badge: nodeCounts.delivered,
      description: 'Shipment successfully delivered.',
      detailDesc: 'Proof of delivery verified via digital recipient signature and GPS geofence clearance.',
      icon: CheckCircle2,
      theme: 'green',
      status: 'Completed',
      colorClasses: {
        border: 'border-emerald-500/30 hover:border-emerald-400',
        activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        bg: 'bg-[#052219]/95',
        badgeColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        bar: 'bg-emerald-500',
      }
    },
    {
      id: 'exception',
      title: 'Exception',
      badge: nodeCounts.exception,
      description: 'Delays, issues or requires attention.',
      detailDesc: 'Flagged transit irregularities, weather holds, or address clarification requirements.',
      icon: AlertCircle,
      theme: 'rose',
      status: 'Attention',
      colorClasses: {
        border: 'border-rose-500/30 hover:border-rose-400',
        activeBorder: 'border-rose-400 ring-2 ring-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.25)]',
        bg: 'bg-[#240a0e]/95',
        badgeColor: 'text-rose-400',
        iconBg: 'bg-rose-500/20 text-rose-400',
        bar: 'bg-rose-500',
      }
    },
    {
      id: 'on-hold',
      title: 'On Hold',
      badge: nodeCounts['on-hold'],
      description: 'Temporarily paused.',
      detailDesc: 'Consignee request holds, scheduled future delivery dates, or bonded warehouse warehousing.',
      icon: PauseCircle,
      theme: 'slate',
      status: 'Paused',
      colorClasses: {
        border: 'border-slate-500/30 hover:border-slate-400',
        activeBorder: 'border-slate-400 ring-2 ring-slate-500/40 shadow-[0_0_20px_rgba(100,116,139,0.25)]',
        bg: 'bg-[#111620]/95',
        badgeColor: 'text-slate-400',
        iconBg: 'bg-slate-500/20 text-slate-300',
        bar: 'bg-slate-500',
      }
    }
  ];

  const allNodes = [...NODES, ...customNodes];
  const selectedNode = allNodes.find(n => n.id === selectedNodeId) || allNodes[3];

  // Dynamic shipments for the selected node inspector list
  const activeNodeShipments = useMemo(() => {
    if (shipments.length > 0) {
      if (selectedNodeId === 'in-transit') {
        return shipments.filter(s => s.status === 'In Transit');
      }
      if (selectedNodeId === 'delivered') {
        return shipments.filter(s => s.status === 'Delivered');
      }
      if (selectedNodeId === 'exception') {
        return shipments.filter(s => s.status === 'Cancelled');
      }
      return shipments.slice(0, 3);
    }

    // Default preview records matching screenshot mockup
    return [
      { id: 'LS-984210', origin: 'Mumbai', destination: 'Nagpur', status: 'In Transit' },
      { id: 'LS-984208', origin: 'Delhi', destination: 'Ahmedabad', status: 'In Transit' },
      { id: 'LS-984205', origin: 'Pune', destination: 'Bengaluru', status: 'In Transit' },
    ];
  }, [shipments, selectedNodeId]);

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(130, Math.max(70, prev + delta)));
  };

  const handleAddNodeSubmit = (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    const node = {
      id: `custom-${Date.now()}`,
      title: newNodeName.trim(),
      badge: 0,
      description: newNodeDesc.trim() || 'Custom logistics stage node.',
      detailDesc: newNodeDesc.trim() || 'Custom stage configured for logistics network.',
      icon: GitBranch,
      theme: 'emerald',
      status: 'Active',
      colorClasses: {
        border: 'border-emerald-500/30 hover:border-emerald-400',
        activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/40',
        bg: 'bg-[#052219]/95',
        badgeColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        bar: 'bg-emerald-500',
      }
    };
    setCustomNodes(prev => [...prev, node]);
    setNewNodeName('');
    setNewNodeDesc('');
    setIsAddNodeOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-[1720px] mx-auto animate-in fade-in duration-300">
      {/* ─── TOP TITLE & ACTION CONTROLS ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#10b981] flex items-center gap-2">
            <span>TRANSPORT SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
            Visualize. Connect. Move.
          </h1>
          <p className="text-xs sm:text-sm text-[#84a99d] mt-0.5">
            A unified view of your logistics workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={shipmentFilter}
              onChange={(e) => setShipmentFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-9 rounded-xl bg-[#06211a] hover:bg-[#092d24] text-xs font-semibold text-[#a8d3c5] border border-[#144b3c] focus:outline-none focus:border-[#10b981] cursor-pointer shadow-sm transition-all"
            >
              <option value="All Shipments">All Shipments</option>
              <option value="In Transit">In Transit Corridors</option>
              <option value="Delivered">Delivered Records</option>
              <option value="Priority">Priority Express</option>
            </select>
            <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7aa597] pointer-events-none" />
          </div>

          {/* + Add Node Button */}
          <button
            type="button"
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-[0_2px_12px_rgba(5,150,105,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* ─── WORKFLOW DIAGRAM CANVAS & DETAIL INSPECTOR ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Central Diagram Canvas (Span 9 on wide screens) */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-[#04130f] rounded-3xl border border-[#0e352a] p-6 lg:p-8 relative overflow-hidden min-h-[580px] shadow-2xl flex flex-col justify-between select-none">
          {/* Interactive Dotted Background Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Diagram Canvas zoom container */}
          <div className="overflow-x-auto overflow-y-hidden py-4">
            <div 
              className="relative transition-transform duration-200 origin-top-left mx-auto"
              style={{ 
                width: '920px', 
                height: '420px',
                transform: `scale(${zoomLevel / 100})` 
              }}
            >
              {/* SVG Connecting Flow Lines & Directed Arrows */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                viewBox="0 0 920 420"
              >
                <defs>
                  <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 1 1 L 6 4 L 1 7 Z" fill="#10b981" />
                  </marker>
                  <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 1 1 L 6 4 L 1 7 Z" fill="#ef4444" />
                  </marker>
                  <marker id="arrowSlate" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 1 1 L 6 4 L 1 7 Z" fill="#64748b" />
                  </marker>
                  <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 1 1 L 6 4 L 1 7 Z" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* 1. Upload to Processing (Straight Green Arrow) */}
                <path 
                  d="M 160 178 L 195 178" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowGreen)" 
                />

                {/* 2. Processing to Dispatch (Straight Green Arrow) */}
                <path 
                  d="M 335 178 L 370 178" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowGreen)" 
                />

                {/* 3. Processing to Exception (Issue Flow: Vertical Red Arrow downward) */}
                <path 
                  d="M 265 225 L 265 275" 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowRed)" 
                />

                {/* 4. Dispatch to In Transit (Curved up to elevated node) */}
                <path 
                  d="M 505 160 C 525 160, 515 90, 545 90" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowGreen)" 
                />

                {/* 5. Dispatch to On Hold (Alternate Flow: Dashed curved line downward) */}
                <path 
                  d="M 505 195 C 530 195, 530 250, 530 275" 
                  stroke="#64748b" 
                  strokeWidth="1.8" 
                  strokeDasharray="4,4" 
                  fill="none" 
                  markerEnd="url(#arrowSlate)" 
                />

                {/* 6. In Transit to Out for Delivery (Curved downward into Out for Delivery) */}
                <path 
                  d="M 685 90 C 715 90, 715 155, 740 155" 
                  stroke="#f59e0b" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowAmber)" 
                />

                {/* 7. Out for Delivery to Delivered (Vertical Green Arrow downward) */}
                <path 
                  d="M 770 225 L 770 275" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowGreen)" 
                />
              </svg>

              {/* ─── NODE 1: UPLOAD (Row 1, Left) ─── */}
              <div className="absolute left-[20px] top-[135px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[0]} 
                  isSelected={selectedNodeId === NODES[0].id}
                  onClick={() => setSelectedNodeId(NODES[0].id)}
                />
              </div>

              {/* ─── NODE 2: PROCESSING (Row 1) ─── */}
              <div className="absolute left-[195px] top-[135px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[1]} 
                  isSelected={selectedNodeId === NODES[1].id}
                  onClick={() => setSelectedNodeId(NODES[1].id)}
                />
              </div>

              {/* ─── NODE 7: EXCEPTION (Row 2, directly under Processing) ─── */}
              <div className="absolute left-[195px] top-[275px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[6]} 
                  isSelected={selectedNodeId === NODES[6].id}
                  onClick={() => setSelectedNodeId(NODES[6].id)}
                />
              </div>

              {/* ─── NODE 3: DISPATCH (Row 1) ─── */}
              <div className="absolute left-[365px] top-[135px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[2]} 
                  isSelected={selectedNodeId === NODES[2].id}
                  onClick={() => setSelectedNodeId(NODES[2].id)}
                />
              </div>

              {/* ─── NODE 8: ON HOLD (Row 2, under Dispatch/In-Transit gap) ─── */}
              <div className="absolute left-[485px] top-[275px] w-[135px] z-10">
                <NodeCard 
                  node={NODES[7]} 
                  isSelected={selectedNodeId === NODES[7].id}
                  onClick={() => setSelectedNodeId(NODES[7].id)}
                />
              </div>

              {/* ─── NODE 4: IN TRANSIT (Row 1, Elevated Hero Active Node) ─── */}
              <div className="absolute left-[545px] top-[45px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[3]} 
                  isSelected={selectedNodeId === NODES[3].id}
                  onClick={() => setSelectedNodeId(NODES[3].id)}
                  isHeroActive
                />
              </div>

              {/* ─── NODE 5: OUT FOR DELIVERY (Row 1) ─── */}
              <div className="absolute left-[700px] top-[135px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[4]} 
                  isSelected={selectedNodeId === NODES[4].id}
                  onClick={() => setSelectedNodeId(NODES[4].id)}
                />
              </div>

              {/* ─── NODE 6: DELIVERED (Row 2, directly under Out for Delivery) ─── */}
              <div className="absolute left-[700px] top-[275px] w-[140px] z-10">
                <NodeCard 
                  node={NODES[5]} 
                  isSelected={selectedNodeId === NODES[5].id}
                  onClick={() => setSelectedNodeId(NODES[5].id)}
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar on Canvas: Legend (Left) & Zoom Controller (Right/Center) */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0b2920]/80 mt-4 text-xs">
            {/* Flow Legend */}
            <div className="flex items-center gap-5 text-[11px] text-[#78a092]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-[#10b981]" />
                <span>Normal Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-0 border-b border-dashed border-slate-400" />
                <span>Alternate Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-[#ef4444]" />
                <span>Issue Flow</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-[#06211a] border border-[#13493b] rounded-xl px-2.5 py-1 text-xs text-[#a0cdbe] shadow-inner">
              <button 
                type="button" 
                onClick={() => handleZoom(-10)} 
                className="hover:text-white px-1.5 py-0.5 cursor-pointer font-bold"
                title="Zoom Out"
              >
                &minus;
              </button>
              <span className="font-mono text-[11px] font-bold px-1.5">{zoomLevel}%</span>
              <button 
                type="button" 
                onClick={() => handleZoom(10)} 
                className="hover:text-white px-1.5 py-0.5 cursor-pointer font-bold"
                title="Zoom In"
              >
                &#43;
              </button>
              <div className="w-[1px] h-3.5 bg-[#175242] mx-1" />
              <button 
                type="button" 
                onClick={() => setZoomLevel(100)} 
                className="hover:text-white p-1 cursor-pointer"
                title="Reset View"
              >
                <Maximize2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDE NODE INSPECTOR PANEL ──────────────────────────────── */}
        <div className="xl:col-span-4 2xl:col-span-3 bg-[#061b15] rounded-3xl border border-[#0e3a2e] p-6 shadow-2xl relative flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Top Node Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#0d3429]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${selectedNode.colorClasses.iconBg} flex items-center justify-center`}>
                  <selectedNode.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedNode.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-[11px] font-semibold text-[#10b981]">{selectedNode.status}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNodeId('in-transit')}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-[#8ab2a3] mt-4 leading-relaxed">
              {selectedNode.detailDesc}
            </p>

            {/* Total Metric Count */}
            <div className="mt-6 p-4 rounded-2xl bg-[#03110d] border border-[#0d3026]">
              <div className="text-3xl font-black text-white tracking-tight">
                {selectedNode.badge}
              </div>
              <div className="text-xs text-[#719889] font-medium mt-0.5">
                Active Shipments
              </div>
            </div>

            {/* Recent Shipments in this Stage */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white">Recent Shipments</span>
                {onNavigateToShipments && (
                  <button
                    type="button"
                    onClick={onNavigateToShipments}
                    className="text-[11px] font-semibold text-[#10b981] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {activeNodeShipments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-[#03120e] rounded-xl border border-[#0b2820]">
                    No shipments currently in this stage.
                  </div>
                ) : (
                  activeNodeShipments.map((s, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-[#08241d] border border-[#114033] hover:border-[#10b981] transition-all flex items-center justify-between text-xs cursor-pointer group"
                      onClick={onNavigateToShipments}
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-[#10b981] transition-colors">
                          {s.id}
                        </div>
                        <div className="text-[11px] text-[#7ea798] mt-0.5">
                          {s.origin} &rarr; {s.destination}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#033628] text-[#34d399] border border-[#095742]">
                        {s.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Primary View Action Button */}
          <div className="pt-6 border-t border-[#0d3429] mt-6">
            <button
              type="button"
              onClick={onNavigateToShipments}
              className="w-full py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>View Shipments</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── NODES OVERVIEW BOTTOM METRIC CARDS (8 NODES) ──────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Nodes Overview</h2>
          
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 rounded-xl bg-[#06211a] border border-[#13493b] text-xs font-semibold text-[#a0cdbe] cursor-pointer focus:outline-none focus:border-[#10b981]"
            >
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#649182] pointer-events-none" />
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#649182] pointer-events-none" />
          </div>
        </div>

        {/* 8 Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {NODES.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'bg-[#092b22] border-[#10b981] shadow-lg ring-1 ring-[#10b981]/50'
                    : 'bg-[#051a14] border-[#0e352a] hover:border-[#165040] hover:bg-[#07241c]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${node.colorClasses.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-[#c7e5dc] truncate">
                      {node.title}
                    </span>
                  </div>

                  <div className="text-xl font-black text-white mt-2.5">
                    {node.badge}
                  </div>
                  <div className="text-[10px] text-[#719889]">
                    Shipments
                  </div>
                </div>

                {/* Bottom Color Accent Bar */}
                <div className="w-full h-1 bg-[#092920] rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className={`h-full ${node.colorClasses.bar} rounded-full`}
                    style={{ width: node.badge > 0 ? '75%' : '15%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ADD NODE MODAL ─────────────────────────────────────────────────── */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#07221b] rounded-2xl border border-[#13493b] shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#0f3a2f]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch size={16} className="text-[#10b981]" />
                <span>Add Logistics Workflow Node</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddNodeOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNodeSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">Stage Node Name</label>
                <input
                  type="text"
                  required
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g. Customs Clearance"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">Stage Description</label>
                <textarea
                  rows={3}
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  placeholder="Describe the workflow requirements for this node..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNodeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REUSABLE NODE CARD MATCHING USER SCREENSHOT ─────────────────────────────
function NodeCard({ node, isSelected, onClick, isHeroActive = false }) {
  const Icon = node.icon;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative shadow-lg min-h-[90px] flex flex-col justify-between ${
        isSelected ? node.colorClasses.activeBorder : node.colorClasses.border
      } ${node.colorClasses.bg}`}
    >
      {/* Top Row: Icon on left, Title next to it, Badge on top right */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-xl ${node.colorClasses.iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={14} />
          </div>
          <div className="text-xs font-bold text-white tracking-tight truncate">
            {node.title}
          </div>
        </div>

        <span className={`text-[11px] font-bold ${node.colorClasses.badgeColor} shrink-0 px-1`}>
          {node.badge}
        </span>
      </div>

      {/* Description */}
      <p className="text-[10px] text-[#7da797] mt-1.5 leading-snug line-clamp-2">
        {node.description}
      </p>

      {/* Pulsing indicator if active */}
      {isHeroActive && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping opacity-75" />
      )}
    </div>
  );
}
