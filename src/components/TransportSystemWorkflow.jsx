import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Plus, X, Trash2, Play, Square, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Truck, Package, MapPin, Building2, Filter, ArrowRight, Settings,
  CheckCircle2, AlertCircle, Loader2, Circle, Anchor, Plane, Ship,
  Train, Warehouse, Thermometer, FileText, Shield, Radio, Zap,
  GitBranch, ChevronDown, ChevronRight, GripVertical, Link2, Unlink,
  Clock, Eye, EyeOff, Copy, Save, MoreHorizontal, Search
} from 'lucide-react';

// ─── NODE TYPE CATALOG ──────────────────────────────────────────────────────────
const NODE_TYPES = {
  source: {
    label: 'Source',
    description: 'Origin point for goods — warehouse, factory, or supplier.',
    icon: Warehouse,
    color: '#3b82f6',
    bgColor: '#0c1a30',
    borderColor: '#1e40af',
    category: 'Input',
    defaultProps: { location: '', capacity: 100, type: 'Warehouse' },
  },
  destination: {
    label: 'Destination',
    description: 'Final delivery point — customer, store, or distribution hub.',
    icon: MapPin,
    color: '#f59e0b',
    bgColor: '#1c1508',
    borderColor: '#92400e',
    category: 'Output',
    defaultProps: { location: '', expectedDate: '', priority: 'Normal' },
  },
  transport: {
    label: 'Transport',
    description: 'Movement leg — truck, ship, air, or rail carrier.',
    icon: Truck,
    color: '#10b981',
    bgColor: '#051a14',
    borderColor: '#065f46',
    category: 'Movement',
    defaultProps: { mode: 'Road', carrier: '', speed: 60, costPerKm: 1.2 },
  },
  checkpoint: {
    label: 'Checkpoint',
    description: 'Inspection, customs clearance, or quality control point.',
    icon: Shield,
    color: '#8b5cf6',
    bgColor: '#1a0f30',
    borderColor: '#5b21b6',
    category: 'Control',
    defaultProps: { checkType: 'Customs', duration: 2, passRate: 95 },
  },
  filter: {
    label: 'Filter / Sort',
    description: 'Route based on cargo type, weight, destination zone, or priority.',
    icon: Filter,
    color: '#06b6d4',
    bgColor: '#0a1a20',
    borderColor: '#0e7490',
    category: 'Logic',
    defaultProps: { condition: 'weight > 500', trueLabel: 'Heavy', falseLabel: 'Light' },
  },
  transform: {
    label: 'Transform',
    description: 'Repackage, consolidate, deconsolidate, or relabel cargo.',
    icon: Settings,
    color: '#ec4899',
    bgColor: '#200a18',
    borderColor: '#9d174d',
    category: 'Processing',
    defaultProps: { operation: 'Consolidate', outputCount: 1 },
  },
  storage: {
    label: 'Storage',
    description: 'Temporary hold — cold storage, bonded warehouse, cross-dock.',
    icon: Building2,
    color: '#64748b',
    bgColor: '#111620',
    borderColor: '#334155',
    category: 'Buffer',
    defaultProps: { storageType: 'Standard', maxDuration: 72, temperature: 'Ambient' },
  },
  alert: {
    label: 'Alert / Notify',
    description: 'Send notification, trigger webhook, or escalate to operator.',
    icon: Radio,
    color: '#ef4444',
    bgColor: '#200a0a',
    borderColor: '#991b1b',
    category: 'Action',
    defaultProps: { channel: 'Email', recipients: '', message: '' },
  },
};

// ─── UNIQUE ID GENERATOR ────────────────────────────────────────────────────────
let idCounter = 0;
const uid = (prefix = 'n') => `${prefix}_${Date.now()}_${++idCounter}`;

// ─── INITIAL EMPTY STATE ────────────────────────────────────────────────────────
const INITIAL_NODES = [];
const INITIAL_EDGES = [];

export default function TransportSystemWorkflow({
  shipments = [],
  onNavigateToShipments,
  onNavigateToCreateShipment,
}) {
  // ── Core State ──────────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // ── Canvas State ────────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // ── Drag State ──────────────────────────────────────────────────────────────
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Connection Drawing State ────────────────────────────────────────────────
  const [connectingFrom, setConnectingFrom] = useState(null); // { nodeId, portType: 'output' }
  const [connectingMouse, setConnectingMouse] = useState(null);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('idle'); // idle | running | completed | error
  const [nodeStatuses, setNodeStatuses] = useState({}); // nodeId -> 'idle' | 'running' | 'completed' | 'error'
  const [executionLog, setExecutionLog] = useState([]);
  const [showMinimap, setShowMinimap] = useState(true);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // ── Canvas Mouse Handlers (Pan) ─────────────────────────────────────────────
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      if (connectingFrom) {
        setConnectingFrom(null);
        setConnectingMouse(null);
      }
    }
  };

  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        });
        return;
      }

      if (draggingNodeId) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffset.x) / zoom - dragOffset.current.x;
        const y = (e.clientY - rect.top - panOffset.y) / zoom - dragOffset.current.y;
        setNodes((prev) =>
          prev.map((n) => (n.id === draggingNodeId ? { ...n, x, y } : n))
        );
        return;
      }

      if (connectingFrom) {
        const rect = canvasRef.current.getBoundingClientRect();
        setConnectingMouse({
          x: (e.clientX - rect.left - panOffset.x) / zoom,
          y: (e.clientY - rect.top - panOffset.y) / zoom,
        });
      }
    },
    [isPanning, draggingNodeId, connectingFrom, panOffset, zoom]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  // ── Node Drag Start ─────────────────────────────────────────────────────────
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - panOffset.x) / zoom;
    const my = (e.clientY - rect.top - panOffset.y) / zoom;
    dragOffset.current = { x: mx - node.x, y: my - node.y };
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  };

  // ── Port Click → Start/Finish Connection ────────────────────────────────────
  const handlePortClick = (e, nodeId, portType) => {
    e.stopPropagation();

    if (!connectingFrom) {
      // Start connection from an output port
      if (portType === 'output') {
        setConnectingFrom({ nodeId, portType: 'output' });
      }
      return;
    }

    // Finish connection to an input port
    if (portType === 'input' && connectingFrom.nodeId !== nodeId) {
      // Check no duplicate edge
      const exists = edges.some(
        (edge) => edge.from === connectingFrom.nodeId && edge.to === nodeId
      );
      if (!exists) {
        const newEdge = {
          id: uid('e'),
          from: connectingFrom.nodeId,
          to: nodeId,
          label: '',
        };
        setEdges((prev) => [...prev, newEdge]);
        setExecutionLog((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            msg: `Connected ${nodes.find((n) => n.id === connectingFrom.nodeId)?.data?.label || 'node'} → ${nodes.find((n) => n.id === nodeId)?.data?.label || 'node'}`,
            type: 'info',
          },
          ...prev,
        ]);
      }
    }

    setConnectingFrom(null);
    setConnectingMouse(null);
  };

  // ── Add Node ────────────────────────────────────────────────────────────────
  const addNode = (typeKey) => {
    const type = NODE_TYPES[typeKey];
    // Place new node in center of current view
    const centerX = (-panOffset.x + 400) / zoom + nodes.length * 20;
    const centerY = (-panOffset.y + 250) / zoom + nodes.length * 15;
    const newNode = {
      id: uid('n'),
      type: typeKey,
      x: centerX,
      y: centerY,
      data: {
        label: `${type.label} ${nodes.filter((n) => n.type === typeKey).length + 1}`,
        ...type.defaultProps,
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setIsAddNodeOpen(false);
    setExecutionLog((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        msg: `Added "${newNode.data.label}" node`,
        type: 'success',
      },
      ...prev,
    ]);
  };

  // ── Delete Node ─────────────────────────────────────────────────────────────
  const deleteNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setNodeStatuses((prev) => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
    setExecutionLog((prev) => [
      { time: new Date().toLocaleTimeString(), msg: `Removed "${node?.data?.label || 'node'}"`, type: 'warn' },
      ...prev,
    ]);
  };

  // ── Delete Edge ─────────────────────────────────────────────────────────────
  const deleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  };

  // ── Duplicate Node ──────────────────────────────────────────────────────────
  const duplicateNode = (nodeId) => {
    const original = nodes.find((n) => n.id === nodeId);
    if (!original) return;
    const newNode = {
      ...original,
      id: uid('n'),
      x: original.x + 40,
      y: original.y + 40,
      data: { ...original.data, label: `${original.data.label} (copy)` },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // ── Update Node Property ────────────────────────────────────────────────────
  const updateNodeData = (nodeId, key, value) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      )
    );
  };

  // ── Zoom Controls ───────────────────────────────────────────────────────────
  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, z - 0.15));
  const handleZoomReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Scroll wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Run Workflow Simulation ─────────────────────────────────────────────────
  const runWorkflow = useCallback(() => {
    if (nodes.length === 0) return;

    setWorkflowStatus('running');
    const allNodeIds = nodes.map((n) => n.id);
    const initialStatuses = {};
    allNodeIds.forEach((id) => (initialStatuses[id] = 'pending'));
    setNodeStatuses(initialStatuses);
    setExecutionLog((prev) => [
      { time: new Date().toLocaleTimeString(), msg: '▶ Workflow execution started', type: 'info' },
      ...prev,
    ]);

    // Find root nodes (no incoming edges)
    const hasIncoming = new Set(edges.map((e) => e.to));
    const roots = allNodeIds.filter((id) => !hasIncoming.has(id));
    if (roots.length === 0) roots.push(allNodeIds[0]);

    // BFS execution order
    const executionOrder = [];
    const visited = new Set();
    const queue = [...roots];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      executionOrder.push(current);
      edges.filter((e) => e.from === current).forEach((e) => queue.push(e.to));
    }
    // Add any disconnected nodes
    allNodeIds.forEach((id) => {
      if (!visited.has(id)) executionOrder.push(id);
    });

    // Simulate execution with delays
    executionOrder.forEach((nodeId, idx) => {
      const delay = (idx + 1) * 800;
      setTimeout(() => {
        setNodeStatuses((prev) => ({ ...prev, [nodeId]: 'running' }));
        const node = nodes.find((n) => n.id === nodeId);
        setExecutionLog((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            msg: `⚡ Processing "${node?.data?.label || nodeId}"...`,
            type: 'info',
          },
          ...prev,
        ]);
      }, delay);

      setTimeout(() => {
        const isError = Math.random() < 0.08; // 8% random error chance
        setNodeStatuses((prev) => ({
          ...prev,
          [nodeId]: isError ? 'error' : 'completed',
        }));
        const node = nodes.find((n) => n.id === nodeId);
        setExecutionLog((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            msg: isError
              ? `✗ Error in "${node?.data?.label || nodeId}"`
              : `✓ Completed "${node?.data?.label || nodeId}"`,
            type: isError ? 'error' : 'success',
          },
          ...prev,
        ]);

        // If last node, finish workflow
        if (idx === executionOrder.length - 1) {
          setTimeout(() => {
            setWorkflowStatus('completed');
            setExecutionLog((prev) => [
              { time: new Date().toLocaleTimeString(), msg: '■ Workflow execution finished', type: 'success' },
              ...prev,
            ]);
          }, 400);
        }
      }, delay + 600);
    });
  }, [nodes, edges]);

  const resetWorkflow = () => {
    setWorkflowStatus('idle');
    setNodeStatuses({});
  };

  const stopWorkflow = () => {
    setWorkflowStatus('idle');
    setNodeStatuses({});
    setExecutionLog((prev) => [
      { time: new Date().toLocaleTimeString(), msg: '■ Workflow stopped by user', type: 'warn' },
      ...prev,
    ]);
  };

  // ── Get Port Position ───────────────────────────────────────────────────────
  const NODE_W = 220;
  const NODE_H = 90;
  const getPortPos = (node, type) => {
    if (type === 'input') return { x: node.x, y: node.y + NODE_H / 2 };
    return { x: node.x + NODE_W, y: node.y + NODE_H / 2 };
  };

  // ── Bezier Path for Edge ────────────────────────────────────────────────────
  const getEdgePath = (from, to) => {
    const dx = Math.abs(to.x - from.x) * 0.5;
    return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
  };

  // ── Filtered node types for catalog ─────────────────────────────────────────
  const filteredTypes = Object.entries(NODE_TYPES).filter(([key, val]) =>
    searchTerm
      ? val.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        val.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Group by category
  const categories = useMemo(() => {
    const map = {};
    filteredTypes.forEach(([key, val]) => {
      if (!map[val.category]) map[val.category] = [];
      map[val.category].push([key, val]);
    });
    return map;
  }, [filteredTypes]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    nodes: nodes.length,
    edges: edges.length,
    sources: nodes.filter((n) => n.type === 'source').length,
    destinations: nodes.filter((n) => n.type === 'destination').length,
    transports: nodes.filter((n) => n.type === 'transport').length,
  }), [nodes]);

  return (
    <div className="flex flex-col h-full text-white animate-in fade-in duration-300 select-none">
      {/* ─── TOP TOOLBAR ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#04130f] border-b border-[#0e352a] flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2">
              <GitBranch size={12} />
              <span>TRANSPORT WORKFLOW ENGINE</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">
              Build. Connect. Execute.
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-6 text-[11px] font-mono text-[#5d8378]">
            <span className="px-2 py-1 rounded bg-[#071d17] border border-[#0e352a]">
              {stats.nodes} nodes
            </span>
            <span className="px-2 py-1 rounded bg-[#071d17] border border-[#0e352a]">
              {stats.edges} connections
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run / Stop / Reset */}
          {workflowStatus === 'idle' || workflowStatus === 'completed' || workflowStatus === 'error' ? (
            <button
              onClick={runWorkflow}
              disabled={nodes.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play size={13} />
              <span>Run</span>
            </button>
          ) : (
            <button
              onClick={stopWorkflow}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Square size={13} />
              <span>Stop</span>
            </button>
          )}

          {workflowStatus !== 'idle' && (
            <button
              onClick={resetWorkflow}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-white/80 text-xs font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <div className="w-px h-6 bg-[#1b3e34] mx-1" />

          {/* Add Node */}
          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-[0_2px_12px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN AREA: CANVAS + SIDEBAR ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── CANVAS ──────────────────────────────────────────────────────── */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-[#030e0b] cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Dot-grid background */}
          <div
            className="canvas-bg absolute pointer-events-none"
            style={{
              width: '200%',
              height: '200%',
              left: '-50%',
              top: '-50%',
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
              opacity: 0.12,
            }}
          />

          {/* Transform container */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1px',
              height: '1px',
              overflow: 'visible',
            }}
          >
            {/* ── SVG EDGES ──────────────────────────────────────────── */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                overflow: 'visible',
                pointerEvents: 'none',
              }}
            >
              <defs>
                <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="#10b981" strokeWidth="1.5" />
                </marker>
                <marker id="arrowHeadActive" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const from = getPortPos(fromNode, 'output');
                const to = getPortPos(toNode, 'input');
                const path = getEdgePath(from, to);
                const isSelected = selectedEdgeId === edge.id;
                const isRunning =
                  nodeStatuses[edge.from] === 'completed' &&
                  nodeStatuses[edge.to] === 'running';

                return (
                  <g key={edge.id}>
                    {/* Glow behind active edges */}
                    {isRunning && (
                      <path
                        d={path}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        opacity="0.2"
                      />
                    )}
                    {/* Clickable hitzone */}
                    <path
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setSelectedNodeId(null);
                      }}
                    />
                    {/* Visible edge */}
                    <path
                      d={path}
                      fill="none"
                      stroke={isSelected ? '#fbbf24' : isRunning ? '#10b981' : '#1b4337'}
                      strokeWidth={isSelected ? 2.5 : 2}
                      strokeDasharray={isRunning ? '6 4' : 'none'}
                      markerEnd={isSelected ? 'url(#arrowHeadActive)' : 'url(#arrowHead)'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {isRunning && (
                        <animate
                          attributeName="stroke-dashoffset"
                          from="40"
                          to="0"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      )}
                    </path>
                    {/* Edge label */}
                    {edge.label && (
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 8}
                        textAnchor="middle"
                        fill="#7ca69a"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Connection being drawn */}
              {connectingFrom && connectingMouse && (() => {
                const fromNode = nodes.find((n) => n.id === connectingFrom.nodeId);
                if (!fromNode) return null;
                const from = getPortPos(fromNode, 'output');
                const path = getEdgePath(from, connectingMouse);
                return (
                  <path
                    d={path}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.7"
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })()}
            </svg>

            {/* ── NODES ──────────────────────────────────────────────── */}
            {nodes.map((node) => {
              const type = NODE_TYPES[node.type];
              if (!type) return null;
              const Icon = type.icon;
              const isSelected = selectedNodeId === node.id;
              const status = nodeStatuses[node.id];
              const isConnecting = connectingFrom?.nodeId === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: NODE_W,
                    zIndex: isSelected ? 50 : 10,
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                    setSelectedEdgeId(null);
                  }}
                  className="group"
                >
                  <div
                    className={`relative rounded-2xl border-2 p-3 transition-all duration-150 shadow-lg cursor-move ${
                      isSelected
                        ? 'ring-2 shadow-xl'
                        : 'hover:shadow-xl'
                    } ${status === 'running' ? 'animate-pulse' : ''}`}
                    style={{
                      background: type.bgColor,
                      borderColor: isSelected
                        ? type.color
                        : isConnecting
                        ? '#fbbf24'
                        : `${type.color}40`,
                      boxShadow: isSelected
                        ? `0 0 24px ${type.color}30`
                        : status === 'running'
                        ? `0 0 20px ${type.color}25`
                        : undefined,
                      ringColor: isSelected ? `${type.color}50` : undefined,
                    }}
                  >
                    {/* Status indicator */}
                    {status && status !== 'idle' && (
                      <div className="absolute -top-1.5 -right-1.5 z-20">
                        {status === 'running' && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                            <Loader2 size={10} className="animate-spin text-white" />
                          </div>
                        )}
                        {status === 'completed' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                            <CheckCircle2 size={10} className="text-white" />
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                            <AlertCircle size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${type.color}20`, color: type.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {node.data.label}
                        </div>
                        <div
                          className="text-[9px] font-mono uppercase tracking-wider mt-0.5"
                          style={{ color: `${type.color}90` }}
                        >
                          {type.category}
                        </div>
                      </div>
                      {/* Delete on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </div>

                    {/* Description snippet */}
                    <p className="text-[9.5px] text-[#6e9488] mt-2 leading-snug line-clamp-2">
                      {type.description}
                    </p>

                    {/* Input Port (left) */}
                    <div
                      className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#030e0b] flex items-center justify-center cursor-crosshair transition-all hover:scale-125 z-30"
                      style={{
                        borderColor: connectingFrom ? '#fbbf24' : `${type.color}60`,
                      }}
                      onClick={(e) => handlePortClick(e, node.id, 'input')}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: connectingFrom ? '#fbbf24' : type.color }}
                      />
                    </div>

                    {/* Output Port (right) */}
                    <div
                      className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#030e0b] flex items-center justify-center cursor-crosshair transition-all hover:scale-125 z-30"
                      style={{
                        borderColor: isConnecting ? '#fbbf24' : `${type.color}60`,
                        background: isConnecting ? '#fbbf2420' : '#030e0b',
                      }}
                      onClick={(e) => handlePortClick(e, node.id, 'output')}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isConnecting ? '#fbbf24' : type.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Connection Mode Indicator ─────────────────────────────────── */}
          {connectingFrom && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-[#fbbf24]/15 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm">
              <Link2 size={13} />
              <span>Click an input port (left side) to complete connection</span>
              <button
                onClick={() => {
                  setConnectingFrom(null);
                  setConnectingMouse(null);
                }}
                className="ml-2 text-[#fbbf24]/70 hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* ── Empty State ───────────────────────────────────────────────── */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mb-4">
                <GitBranch size={28} className="text-[#10b981]/60" />
              </div>
              <h3 className="text-lg font-bold text-white/60 mb-1">No workflow yet</h3>
              <p className="text-xs text-[#5d8378] mb-4 text-center max-w-xs">
                Click <span className="text-[#10b981] font-bold">"Add Node"</span> to place your first transport node, then connect nodes by clicking output → input ports.
              </p>
            </div>
          )}

          {/* ── Bottom Canvas Controls ────────────────────────────────────── */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#04130f]/95 border border-[#0e352a] rounded-xl px-2 py-1 shadow-lg backdrop-blur-sm">
              <button onClick={handleZoomOut} className="p-1 text-[#7ca69a] hover:text-white cursor-pointer transition-colors">
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] font-mono text-[#7ca69a] w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-1 text-[#7ca69a] hover:text-white cursor-pointer transition-colors">
                <ZoomIn size={14} />
              </button>
              <div className="w-px h-4 bg-[#0e352a] mx-0.5" />
              <button onClick={handleZoomReset} className="p-1 text-[#7ca69a] hover:text-white cursor-pointer transition-colors">
                <Maximize2 size={12} />
              </button>
            </div>
          </div>

          {/* ── Workflow Status Badge ─────────────────────────────────────── */}
          {workflowStatus !== 'idle' && (
            <div className={`absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm ${
              workflowStatus === 'running'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : workflowStatus === 'completed'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/15 border border-red-500/40 text-red-400'
            }`}>
              {workflowStatus === 'running' && <Loader2 size={12} className="animate-spin" />}
              {workflowStatus === 'completed' && <CheckCircle2 size={12} />}
              {workflowStatus === 'error' && <AlertCircle size={12} />}
              <span>{workflowStatus.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: INSPECTOR + LOG ──────────────────────────────── */}
        <div className="w-[320px] flex-shrink-0 bg-[#04130f] border-l border-[#0e352a] flex flex-col overflow-hidden">
          {/* Inspector */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedNode ? (
              <div className="space-y-4">
                {/* Node Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const type = NODE_TYPES[selectedNode.type];
                      const Icon = type?.icon || Circle;
                      return (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${type?.color || '#555'}20`, color: type?.color || '#555' }}
                        >
                          <Icon size={16} />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedNode.data.label}</h3>
                      <div className="text-[9px] font-mono text-[#5d8378] uppercase tracking-wider">
                        {NODE_TYPES[selectedNode.type]?.category || 'Node'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateNode(selectedNode.id)}
                      className="p-1.5 rounded-lg text-[#5d8378] hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      className="p-1.5 rounded-lg text-[#5d8378] hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Editable Properties */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#5d8378] uppercase tracking-wider mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData(selectedNode.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#071d17] border border-[#0e352a] text-white focus:outline-none focus:border-[#10b981] transition-colors"
                    />
                  </div>

                  {Object.entries(selectedNode.data)
                    .filter(([key]) => key !== 'label')
                    .map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-[10px] font-semibold text-[#5d8378] uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </label>
                        {typeof value === 'number' ? (
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => updateNodeData(selectedNode.id, key, Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#071d17] border border-[#0e352a] text-white focus:outline-none focus:border-[#10b981] transition-colors"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateNodeData(selectedNode.id, key, e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#071d17] border border-[#0e352a] text-white focus:outline-none focus:border-[#10b981] transition-colors"
                          />
                        )}
                      </div>
                    ))}
                </div>

                {/* Connections */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#5d8378] uppercase tracking-wider mb-2">
                    Connections
                  </h4>
                  {(() => {
                    const incoming = edges.filter((e) => e.to === selectedNode.id);
                    const outgoing = edges.filter((e) => e.from === selectedNode.id);
                    if (incoming.length === 0 && outgoing.length === 0) {
                      return (
                        <p className="text-[10px] text-[#3d6657] italic">
                          No connections. Click an output port → input port to connect.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-1.5">
                        {incoming.map((e) => {
                          const from = nodes.find((n) => n.id === e.from);
                          return (
                            <div
                              key={e.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#071d17] border border-[#0e352a] text-[10px]"
                            >
                              <span className="text-[#7ca69a]">
                                ← from <span className="text-white font-semibold">{from?.data?.label || '?'}</span>
                              </span>
                              <button
                                onClick={() => deleteEdge(e.id)}
                                className="text-[#5d8378] hover:text-red-400 cursor-pointer"
                              >
                                <Unlink size={10} />
                              </button>
                            </div>
                          );
                        })}
                        {outgoing.map((e) => {
                          const to = nodes.find((n) => n.id === e.to);
                          return (
                            <div
                              key={e.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#071d17] border border-[#0e352a] text-[10px]"
                            >
                              <span className="text-[#7ca69a]">
                                → to <span className="text-white font-semibold">{to?.data?.label || '?'}</span>
                              </span>
                              <button
                                onClick={() => deleteEdge(e.id)}
                                className="text-[#5d8378] hover:text-red-400 cursor-pointer"
                              >
                                <Unlink size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : selectedEdge ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Link2 size={14} className="text-[#10b981]" />
                    Connection
                  </h3>
                  <button
                    onClick={() => deleteEdge(selectedEdge.id)}
                    className="p-1.5 rounded-lg text-[#5d8378] hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-[#7ca69a]">
                  <div className="px-3 py-2 rounded-xl bg-[#071d17] border border-[#0e352a]">
                    <span className="text-[#5d8378]">From:</span>{' '}
                    <span className="text-white font-semibold">
                      {nodes.find((n) => n.id === selectedEdge.from)?.data?.label || '?'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-[#10b981]">
                    <ArrowRight size={14} />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[#071d17] border border-[#0e352a]">
                    <span className="text-[#5d8378]">To:</span>{' '}
                    <span className="text-white font-semibold">
                      {nodes.find((n) => n.id === selectedEdge.to)?.data?.label || '?'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5d8378] uppercase tracking-wider mb-1">
                    Edge Label
                  </label>
                  <input
                    type="text"
                    value={selectedEdge.label}
                    onChange={(e) =>
                      setEdges((prev) =>
                        prev.map((edge) =>
                          edge.id === selectedEdge.id ? { ...edge, label: e.target.value } : edge
                        )
                      )
                    }
                    placeholder="e.g. Priority, Fallback..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#071d17] border border-[#0e352a] text-white placeholder-[#3d6657] focus:outline-none focus:border-[#10b981] transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mb-3">
                  <Eye size={20} className="text-[#10b981]/50" />
                </div>
                <h3 className="text-sm font-bold text-white/50 mb-1">Inspector</h3>
                <p className="text-[10px] text-[#3d6657] leading-relaxed">
                  Select a node or connection to view and edit its properties.
                </p>
              </div>
            )}
          </div>

          {/* Execution Log */}
          <div className="h-[180px] flex-shrink-0 border-t border-[#0e352a] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-[#030e0b]">
              <h4 className="text-[10px] font-bold text-[#5d8378] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={11} />
                Execution Log
              </h4>
              {executionLog.length > 0 && (
                <button
                  onClick={() => setExecutionLog([])}
                  className="text-[9px] text-[#3d6657] hover:text-white cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-1">
              {executionLog.length === 0 ? (
                <p className="text-[10px] text-[#2d5647] italic py-4 text-center">
                  No activity yet
                </p>
              ) : (
                executionLog.slice(0, 50).map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px] py-0.5">
                    <span className="text-[#3d6657] font-mono shrink-0">{entry.time}</span>
                    <span
                      className={
                        entry.type === 'error'
                          ? 'text-red-400'
                          : entry.type === 'success'
                          ? 'text-emerald-400'
                          : entry.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-[#7ca69a]'
                      }
                    >
                      {entry.msg}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD NODE MODAL ──────────────────────────────────────────────────── */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#061b15] rounded-2xl border border-[#13493b] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#0f3a2f]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-[#10b981]" />
                Add Transport Node
              </h3>
              <button
                onClick={() => {
                  setIsAddNodeOpen(false);
                  setSearchTerm('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-[#0f3a2f]/60">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d6657]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search node types..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-[#3d6657] focus:outline-none focus:border-[#10b981] transition-colors"
                />
              </div>
            </div>

            {/* Node Type Grid */}
            <div className="px-5 py-4 max-h-[400px] overflow-y-auto space-y-4">
              {Object.entries(categories).map(([category, types]) => (
                <div key={category}>
                  <h4 className="text-[9px] font-mono font-bold text-[#5d8378] uppercase tracking-widest mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {types.map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            addNode(key);
                            setSearchTerm('');
                          }}
                          className="flex items-start gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: type.bgColor,
                            borderColor: `${type.color}30`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = type.color;
                            e.currentTarget.style.boxShadow = `0 0 16px ${type.color}20`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${type.color}30`;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: `${type.color}20`, color: type.color }}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white">{type.label}</div>
                            <p className="text-[9px] text-[#5d8378] mt-0.5 leading-snug line-clamp-2">
                              {type.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTypes.length === 0 && (
                <p className="text-xs text-[#3d6657] text-center py-6">
                  No node types match "{searchTerm}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
