import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Warehouse,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Navigation,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sliders,
  ExternalLink,
  Check,
  X,
  Radio,
  FileText,
  Zap,
  Info,
  Layers,
  Fuel,
  Compass,
  PenTool,
  Printer
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DocumentViewerModal from './DocumentViewerModal';
import ProofOfDeliveryModal from './ProofOfDeliveryModal';

// ─── TILE LAYERS (ZERO WATERMARKS, 100% FREE, NO API KEYS REQUIRED) ─────────────
const ESRI_DARK_TILES = {
  base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  reference: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
};

// ─── KNOWN GEOGRAPHIC LOGISTICS COORDINATES ────────────────────────────────────
const CITY_COORDINATES = {
  'Nagpur Hub': { lat: 21.1458, lng: 79.0882 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Mumbai Port Terminal': { lat: 18.9496, lng: 72.9515 },
  'Mumbai Nhava Sheva': { lat: 18.9496, lng: 72.9515 },
  'Mumbai': { lat: 18.9496, lng: 72.9515 },
  'Pune Logistics Center': { lat: 18.5204, lng: 73.8567 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Delhi Cargo Complex': { lat: 28.7041, lng: 77.1025 },
  'Delhi North Hub': { lat: 28.7041, lng: 77.1025 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bengaluru Tech Depot': { lat: 12.9716, lng: 77.5946 },
  'Bengaluru Tech Corridor': { lat: 12.9716, lng: 77.5946 },
  'Bengaluru Fulfillment Center': { lat: 12.9716, lng: 77.5946 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Chennai Marine Facility': { lat: 13.0827, lng: 80.2707 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad Logistics Node': { lat: 17.3850, lng: 78.4867 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Ahmedabad Industrial Node': { lat: 23.0225, lng: 72.5714 },
  'Ahmedabad Port Depot': { lat: 23.0225, lng: 72.5714 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Kolkata East Depot': { lat: 22.5726, lng: 88.3639 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Nashik Warehouse': { lat: 19.9975, lng: 73.7898 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Jaipur Distribution Hub': { lat: 26.9124, lng: 75.7873 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
};

function resolveCoordinates(cityName) {
  if (!cityName) return null;
  const clean = cityName.trim();
  if (CITY_COORDINATES[clean]) return CITY_COORDINATES[clean];
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(clean.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

// ─── REFERENCE BENCHMARK JOURNEY (CLEARLY SEPARATED FOR DEMO/TESTING) ──────────
const DEMO_REFERENCE_SHIPMENT = {
  id: 'LS-904812',
  dbId: 9999,
  tracking_number: 'LS-904812',
  origin: 'Nagpur Hub',
  destination: 'Mumbai Port Terminal',
  status: 'In Transit',
  rawStatus: 'IN_TRANSIT',
  cargo: 'Pharma Vaccines (Cold Chain)',
  description: 'Temperature-critical vaccines (2°C - 8°C) palletized in passive thermal shippers',
  weight: '1,450 kg',
  requestedDate: '2026-09-20',
  notes: 'Requires continuous real-time temperature telemetry and active GDP compliance logging.',
  requesterName: 'Serum LifeSciences Ltd',
  providerName: 'Apex Cold-Chain Express Fleet',
  providerCity: 'Mumbai Nhava Sheva',
  vehicleType: 'Volvo FH16 Refrigerated Container (16T)',
  vehiclePlate: 'MH-31-TR-9402',
  driverName: 'Vikramjit Singh',
  acceptedAt: '2026-09-19T08:15:00Z',
  createdAt: 'Sep 19, 2026',
  isDemoSample: true
};

export default function ShipmentJourneyFlow({
  shipments = [],
  initialSelectedId = null,
  onSelectShipment,
  onBack,
  user,
  onUpdateStatus,
  onAddEvent,
  onOpenDoc,
  onOpenPod
}) {
  // Available real shipments vs reference demo
  const [selectedId, setSelectedId] = useState(() => {
    if (initialSelectedId) return initialSelectedId;
    if (shipments && shipments.length > 0) return shipments[0].tracking_number || shipments[0].id;
    return DEMO_REFERENCE_SHIPMENT.id;
  });

  const [useDemoSample, setUseDemoSample] = useState(() => {
    return !shipments || shipments.length === 0;
  });

  // Active Shipment object
  const activeShipment = useMemo(() => {
    if (useDemoSample) return DEMO_REFERENCE_SHIPMENT;
    const found = shipments.find(s => (s.tracking_number || s.id) === selectedId);
    if (found) return found;
    return shipments[0] || DEMO_REFERENCE_SHIPMENT;
  }, [selectedId, shipments, useDemoSample]);

  // Phase 1: e-BOL, e-POD & Receiver Touch Signature modal states
  const [internalDocOpen, setInternalDocOpen] = useState(false);
  const [internalDocType, setInternalDocType] = useState('bol');
  const [internalPodOpen, setInternalPodOpen] = useState(false);
  const [journeyPodData, setJourneyPodData] = useState(null);

  const trackingKey = activeShipment.tracking_number || activeShipment.id || '9428';

  const effectivePod = useMemo(() => {
    if (journeyPodData) return journeyPodData;
    if (activeShipment.pod_data) return activeShipment.pod_data;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`logisync_pod_${trackingKey}`) : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load stored pod:', e);
    }
    return null;
  }, [journeyPodData, activeShipment, trackingKey]);

  const handleTriggerDoc = (type = 'bol') => {
    if (onOpenDoc) {
      onOpenDoc({ ...activeShipment, pod_data: effectivePod }, type);
    } else {
      setInternalDocType(type);
      setInternalDocOpen(true);
    }
  };

  const handleTriggerPod = () => {
    if (onOpenPod) {
      onOpenPod(activeShipment);
    } else {
      setInternalPodOpen(true);
    }
  };

  const handleInternalConfirmDelivery = async (shipmentId, podData) => {
    setJourneyPodData(podData);
    if (onUpdateStatus && (activeShipment.dbId || activeShipment.id)) {
      await onUpdateStatus(activeShipment.dbId || activeShipment.id, 'DELIVERED', `Receiver signoff: ${podData.receiverName}. Seal: ${podData.sealNumber}. OTP: #${podData.otpCode}`);
    }
    if (onAddEvent && activeShipment.dbId) {
      await onAddEvent({
        requestId: activeShipment.dbId,
        eventType: 'DELIVERED_POD_AUTHENTICATED',
        description: `Consignee ${podData.receiverName} authenticated handover with touch signature and OTP #${podData.otpCode}.`
      });
    }
    setInternalPodOpen(false);
    setInternalDocType('pod');
    setInternalDocOpen(true);
  };

  // Stage expansion state
  const [expandedStages, setExpandedStages] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
  });

  const toggleStage = (stageNum) => {
    setExpandedStages(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  // Interactive Delay Simulation state
  const [isDelaySimulated, setIsDelaySimulated] = useState(false);
  const [delayReason, setDelayReason] = useState(
    'Heavy monsoon flooding & 14km truck congestion on NH-53 near Igatpuri Ghats'
  );

  // AI Recommendation state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [isRouteApplied, setIsRouteApplied] = useState(false);
  const [showAlternateOnMap, setShowAlternateOnMap] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef([]);

  // Coordinates calculation
  const originCoords = resolveCoordinates(activeShipment.origin) || { lat: 21.1458, lng: 79.0882 };
  const destCoords = resolveCoordinates(activeShipment.destination) || { lat: 18.9496, lng: 72.9515 };

  // Current transit progress calculation (0 to 1)
  const transitProgress = useMemo(() => {
    if (activeShipment.status === 'Delivered' || activeShipment.rawStatus === 'DELIVERED' || Boolean(effectivePod)) return 1.0;
    if (activeShipment.status === 'Pending' || activeShipment.rawStatus === 'PENDING') return 0.05;
    if (activeShipment.status === 'Accepted' || activeShipment.rawStatus === 'ACCEPTED') return 0.15;
    if (activeShipment.rawStatus === 'PICKUP_CONFIRMED') return 0.25;
    if (activeShipment.rawStatus === 'OUT_FOR_DELIVERY') return 0.88;
    return isRouteApplied ? 0.68 : 0.52; // En route midpoint
  }, [activeShipment, isRouteApplied, effectivePod]);

  // Interpolated current coordinates
  const currentCoords = useMemo(() => {
    const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * transitProgress;
    const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * transitProgress;
    return { lat, lng };
  }, [originCoords, destCoords, transitProgress]);

  // Stage completion states based on real status + delay
  const stageStates = useMemo(() => {
    const raw = activeShipment.rawStatus || 'PENDING';
    const isDelivered = raw === 'DELIVERED' || activeShipment.status === 'Delivered' || Boolean(effectivePod);
    const isPending = raw === 'PENDING';
    const isAccepted = ['ACCEPTED', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(raw);
    const inTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(raw);

    const hasDelay = isDelaySimulated || raw === 'ON_HOLD' || raw === 'EXCEPTION';

    return {
      order: { completed: true, current: isPending, label: 'Order Received' },
      warehouse: { completed: isAccepted, current: isAccepted && !inTransit, label: 'Warehouse Dispatched' },
      vehicle: { completed: !!activeShipment.providerName, current: !activeShipment.providerName, label: 'Vehicle Assigned' },
      route: { completed: !!(originCoords && destCoords), current: false, label: 'Corridor Plotted' },
      tracking: { completed: inTransit, current: inTransit && !isDelivered, label: 'Live Telemetry' },
      delay: { active: hasDelay, resolved: isRouteApplied, label: hasDelay ? 'Delay Detected' : 'On Schedule' },
      ai: { active: hasDelay && !isRouteApplied, applied: isRouteApplied, label: 'AI Optimization' },
      delivery: { completed: isDelivered, current: raw === 'OUT_FOR_DELIVERY', label: 'Final Delivery' },
    };
  }, [activeShipment, isDelaySimulated, isRouteApplied, originCoords, destCoords, effectivePod]);

  // Trigger AI recommendation whenever a delay is detected/simulated
  useEffect(() => {
    if (stageStates.delay.active && !isRouteApplied) {
      setIsAiAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAiAnalyzing(false);
        setAiRecommendation({
          title: 'Dynamic Reroute via Samruddhi Mahamarg Corridor',
          alternateRouteName: 'Samruddhi Expressway (MSRDC NH-03 Bypass)',
          timeSavedMinutes: 80,
          additionalKm: 18,
          fuelCostDelta: '+₹1,150 (Covered by SLA buffer)',
          coldChainIntegrity: '100% Guaranteed (Active Reefer at 4.4°C)',
          rationale: `Bypasses the 14km waterlogged section on NH-53 at Igatpuri. Avoids standstill idling, maintaining continuous diesel-electric chiller circulation. Restores delivery window before 17:00 IST cutoff at Mumbai Nhava Sheva dock.`,
          recommendedAction: 'Authorize immediate corridor diversion at Nashik Interchange.',
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stageStates.delay.active, isRouteApplied]);

  // ─── LEAFLET MAP INITIALIZATION & RENDER ───────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const midLat = (originCoords.lat + destCoords.lat) / 2;
    const midLng = (originCoords.lng + destCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 6,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Esri Dark Canvas Base + Reference (Zero Watermarks)
    L.tileLayer(ESRI_DARK_TILES.base, {
      attribution: ESRI_DARK_TILES.attribution,
      maxZoom: ESRI_DARK_TILES.maxZoom,
    }).addTo(map);

    L.tileLayer(ESRI_DARK_TILES.reference, {
      maxZoom: ESRI_DARK_TILES.maxZoom,
    }).addTo(map);

    mapInstanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng]);

  // Update Route Layers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];

    // Origin Icon (Warehouse)
    const originIcon = L.divIcon({
      className: 'custom-journey-pin',
      html: `<div style="background:#0284c7;width:28px;height:28px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 12px #0284c7;display:flex;align-items:center;justify-content:center;color:#ffffff;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Destination Icon (Pin)
    const destIcon = L.divIcon({
      className: 'custom-journey-pin',
      html: `<div style="background:#10b981;width:28px;height:28px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 12px #10b981;display:flex;align-items:center;justify-content:center;color:#ffffff;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Vehicle Icon (Truck)
    const vehicleIcon = L.divIcon({
      className: 'custom-journey-live-pin',
      html: `<div style="background:#f59e0b;width:32px;height:32px;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 0 16px #f59e0b;display:flex;align-items:center;justify-content:center;color:#ffffff;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add Markers
    const mOrigin = L.marker([originCoords.lat, originCoords.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#0f172a;font-weight:bold;">Origin Warehouse</div><div style="font-size:11px;color:#64748b;">${activeShipment.origin}</div>`);

    const mDest = L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#0f172a;font-weight:bold;">Destination Facility</div><div style="font-size:11px;color:#64748b;">${activeShipment.destination}</div>`);

    const mVehicle = L.marker([currentCoords.lat, currentCoords.lng], { icon: vehicleIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#0f172a;font-weight:bold;">Active Telemetry</div><div style="font-size:11px;color:#64748b;">Current Location • ${Math.round(transitProgress * 100)}% Complete</div>`);

    routeLayersRef.current.push(mOrigin, mDest, mVehicle);

    // Primary Route Line
    const primaryPoints = [
      [originCoords.lat, originCoords.lng],
      [currentCoords.lat, currentCoords.lng],
      [destCoords.lat, destCoords.lng],
    ];

    const mainPolyline = L.polyline(primaryPoints, {
      color: stageStates.delay.active && !isRouteApplied ? '#ef4444' : '#0066ff',
      weight: 4,
      dashArray: stageStates.delay.active && !isRouteApplied ? '8, 8' : undefined,
      opacity: 0.85,
    }).addTo(map);

    routeLayersRef.current.push(mainPolyline);

    // If Alternate Route is toggled or applied
    if (showAlternateOnMap || isRouteApplied) {
      const altMidLat = ((originCoords.lat + destCoords.lat) / 2) + 0.65;
      const altMidLng = ((originCoords.lng + destCoords.lng) / 2) - 0.25;

      const altPolyline = L.polyline([
        [currentCoords.lat, currentCoords.lng],
        [altMidLat, altMidLng],
        [destCoords.lat, destCoords.lng],
      ], {
        color: '#10b981',
        weight: 4,
        dashArray: '4, 8',
        opacity: 0.95,
      }).addTo(map);

      routeLayersRef.current.push(altPolyline);
    }

    // Fit bounds smoothly
    try {
      const group = L.featureGroup(routeLayersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    } catch {
      // fallback
    }
  }, [originCoords, destCoords, currentCoords, stageStates.delay.active, isRouteApplied, showAlternateOnMap, activeShipment, transitProgress]);

  // Handle human-in-the-loop route application
  const handleApplyAlternateRoute = () => {
    setIsRouteApplied(true);
    setIsDelaySimulated(false);
    setShowAlternateOnMap(false);

    if (onAddEvent && activeShipment.dbId) {
      onAddEvent({
        requestId: activeShipment.dbId,
        eventType: 'AI_REROUTE_AUTHORIZED',
        description: 'Operator approved AI recommendation: Corridor diverted to Samruddhi Expressway to mitigate transit delay.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
      {/* ─── HEADER BAR WITH SHIPMENT SELECTOR ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#061b15] border border-[#0f382e] p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#10b981] font-extrabold">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>ENTERPRISE LOGISTICS WORKFLOW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            End-to-End Shipment Journey
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#7ea597]">
            Continuous lifecycle telemetry: Order &rarr; Warehouse &rarr; Vehicle &rarr; Route &rarr; Tracking &rarr; Delay &rarr; AI &rarr; Delivery.
          </p>
        </div>

        {/* Shipment Selector Dropdown & Source Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Real Shipment Selector */}
          <div className="relative min-w-[280px]">
            <label className="block text-[10px] font-mono uppercase text-[#7ea597] font-semibold mb-1">
              Select Shipment
            </label>
            <select
              value={useDemoSample ? DEMO_REFERENCE_SHIPMENT.id : selectedId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === DEMO_REFERENCE_SHIPMENT.id) {
                  setUseDemoSample(true);
                  setSelectedId(DEMO_REFERENCE_SHIPMENT.id);
                } else {
                  setUseDemoSample(false);
                  setSelectedId(val);
                  if (onSelectShipment) onSelectShipment(val);
                }
              }}
              className="w-full bg-[#041611] border border-[#144739] text-white text-xs font-semibold py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#10b981] cursor-pointer"
            >
              {shipments && shipments.length > 0 && (
                <optgroup label="NeonDB Production Records">
                  {shipments.map((s) => (
                    <option key={s.tracking_number || s.id} value={s.tracking_number || s.id}>
                      {s.tracking_number || s.id} — {s.pickup_location || s.origin} &rarr; {s.delivery_location || s.destination} ({s.status})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Reference Verification Sample">
                <option value={DEMO_REFERENCE_SHIPMENT.id}>
                  {DEMO_REFERENCE_SHIPMENT.id} — {DEMO_REFERENCE_SHIPMENT.origin} &rarr; {DEMO_REFERENCE_SHIPMENT.destination} (Benchmark)
                </option>
              </optgroup>
            </select>
          </div>

          {/* Source Data Pill */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] font-mono uppercase text-[#7ea597] font-semibold mb-1">
              Data Source
            </span>
            <div className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border ${
              activeShipment.isDemoSample
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
            }`}>
              <span className={`w-2 h-2 rounded-full ${activeShipment.isDemoSample ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{activeShipment.isDemoSample ? 'DEMO BENCHMARK' : 'NEONDB LIVE'}</span>
            </div>
          </div>

          {/* e-BOL and e-POD Quick Actions */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] font-mono uppercase text-[#7ea597] font-semibold mb-1">
              Official Documents
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTriggerDoc('bol')}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-700/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="View / Download Electronic Bill of Lading"
              >
                <FileText size={13} />
                <span>e-BOL</span>
              </button>

              {stageStates.delivery.completed ? (
                <button
                  type="button"
                  onClick={() => handleTriggerDoc('pod')}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-700/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="View / Download Electronic Proof of Delivery"
                >
                  <ShieldCheck size={13} />
                  <span>e-POD</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerPod}
                  className="px-3 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  title="Sign & Complete Handover with OTP"
                >
                  <PenTool size={13} />
                  <span>Sign POD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 16: COMPACT DASHBOARD SUMMARY RAIL ──────────────────────── */}
      <div className="bg-[#061e18] border border-[#0f382e] p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#0d2f25] mb-3 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <Compass size={15} className="text-[#10b981]" />
            <span>JOURNEY LIFECYCLE SUMMARY</span>
          </div>
          <span className="font-mono text-[11px] text-[#7ea597]">
            Shipment ID: <strong className="text-white">{activeShipment.tracking_number || activeShipment.id}</strong>
          </span>
        </div>

        {/* 8 Connected Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px]">
          {/* 1. ORDER */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">1. Order</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Confirmed</span>
            </div>
          </div>

          {/* 2. WAREHOUSE */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">2. Warehouse</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Dispatched</span>
            </div>
          </div>

          {/* 3. VEHICLE */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">3. Vehicle</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold ${
              activeShipment.providerName ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {activeShipment.providerName ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span className="truncate">{activeShipment.providerName ? 'Assigned' : 'Unassigned'}</span>
            </div>
          </div>

          {/* 4. ROUTE */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">4. Route</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Plotted</span>
            </div>
          </div>

          {/* 5. TRACKING */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">5. Tracking</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold ${
              stageStates.tracking.completed ? 'text-sky-400' : 'text-slate-400'
            }`}>
              <Radio size={13} className={stageStates.tracking.completed ? 'animate-pulse' : ''} />
              <span>{Math.round(transitProgress * 100)}% Live</span>
            </div>
          </div>

          {/* 6. DELAY */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">6. Delay</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold ${
              stageStates.delay.active ? (isRouteApplied ? 'text-emerald-400' : 'text-rose-400') : 'text-emerald-400'
            }`}>
              {stageStates.delay.active && !isRouteApplied ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
              <span>{stageStates.delay.active ? (isRouteApplied ? 'Mitigated' : 'Incident') : 'Nominal'}</span>
            </div>
          </div>

          {/* 7. AI RECOMMEND */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">7. AI Assist</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold ${
              isRouteApplied ? 'text-emerald-400' : stageStates.delay.active ? 'text-purple-400' : 'text-slate-400'
            }`}>
              <Sparkles size={13} />
              <span>{isRouteApplied ? 'Applied' : stageStates.delay.active ? 'Active' : 'Standby'}</span>
            </div>
          </div>

          {/* 8. DELIVERY */}
          <div className="p-2.5 rounded-xl bg-[#041611] border border-[#0f382e] flex flex-col justify-between">
            <div className="text-[#7ea597] font-semibold text-[10px]">8. Delivery</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold ${
              stageStates.delivery.completed ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {stageStates.delivery.completed ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              <span>{stageStates.delivery.completed ? 'Delivered' : 'En Route'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN JOURNEY CONTAINER: 8 EXPANDABLE DETAILED STAGES ─────────────── */}
      <div className="space-y-4">

        {/* ─── STAGE 1: ORDER ──────────────────────────────────────────────── */}
        <div className="bg-[#061b15] border border-[#0f382e] rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => toggleStage(1)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 1 &mdash; ORDER RECEIVED & VERIFIED
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Order ID: <strong className="text-white">{activeShipment.tracking_number || activeShipment.id}</strong> &bull; Client: {activeShipment.requesterName || 'Enterprise Shipper'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Confirmed
              </span>
              {expandedStages[1] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[1] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#041611] p-4 rounded-xl border border-[#0e352a]">
                <div>
                  <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Order Tracking ID</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{activeShipment.tracking_number || activeShipment.id}</span>
                </div>
                <div>
                  <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Shipper / Customer</span>
                  <span className="font-semibold text-white mt-0.5 block">{activeShipment.requesterName || 'Registered Logistics Partner'}</span>
                </div>
                <div>
                  <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Payload & Weight</span>
                  <span className="font-semibold text-white mt-0.5 block">{activeShipment.cargo || 'General Freight'} ({activeShipment.weight || 'Standard Load'})</span>
                </div>
                <div>
                  <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Order Creation Time</span>
                  <span className="font-semibold text-white mt-0.5 block">{activeShipment.createdAt || 'Sep 19, 2026'}</span>
                </div>
              </div>
              {activeShipment.notes && (
                <div className="mt-3 p-3 rounded-lg bg-[#06241c] text-[#a0cdbe] text-[11px] border border-[#104838]">
                  <strong>Special Instructions:</strong> {activeShipment.notes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#0e352a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-[#7ea597]">
                  Standard electronic consignment note notarized under GS1 EPCIS 2.0 & UN/CEFACT specifications.
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerDoc('bol')}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-700/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <FileText size={13} />
                  <span>Generate / View Official e-BOL</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── STAGE 2: WAREHOUSE ──────────────────────────────────────────── */}
        <div className="bg-[#061b15] border border-[#0f382e] rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => toggleStage(2)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 2 &mdash; WAREHOUSE PROCESSING
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Facility: <strong className="text-white">{activeShipment.origin} Regional Hub</strong> &bull; Picked &bull; Packed &bull; Dispatched
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Ready for Dispatch
              </span>
              {expandedStages[2] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[2] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <div className="flex items-center justify-between text-[#7ea597] text-[10px] uppercase font-mono">
                    <span>1. Order Received</span>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-white font-bold mt-1">Verified at Dock</div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <div className="flex items-center justify-between text-[#7ea597] text-[10px] uppercase font-mono">
                    <span>2. Picking</span>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-white font-bold mt-1">Aisle 14-B Palletized</div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <div className="flex items-center justify-between text-[#7ea597] text-[10px] uppercase font-mono">
                    <span>3. Packing</span>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-white font-bold mt-1">Thermal Insulation Sealed</div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <div className="flex items-center justify-between text-[#7ea597] text-[10px] uppercase font-mono">
                    <span>4. Dispatch</span>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-emerald-400 font-bold mt-1">Staged at Bay 03</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── STAGE 3: VEHICLE ASSIGNMENT ─────────────────────────────────── */}
        <div className="bg-[#061b15] border border-[#0f382e] rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => toggleStage(3)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeShipment.providerName ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {activeShipment.providerName ? '✓' : '!'}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 3 &mdash; VEHICLE & CARRIER ALLOCATION
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Carrier: <strong className="text-white">{activeShipment.providerName || 'Vehicle not assigned'}</strong> &bull; {activeShipment.providerCity || 'Awaiting assignment'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeShipment.providerName
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {activeShipment.providerName ? 'Carrier Assigned' : 'Vehicle not assigned'}
              </span>
              {expandedStages[3] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[3] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs">
              {activeShipment.providerName ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#041611] p-4 rounded-xl border border-[#0e352a]">
                  <div>
                    <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Assigned Carrier / Provider</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{activeShipment.providerName}</span>
                  </div>
                  <div>
                    <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Vehicle Specification</span>
                    <span className="font-semibold text-white mt-0.5 block">{activeShipment.vehicleType || 'Heavy Freight Truck (Multiaxle)'}</span>
                  </div>
                  <div>
                    <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Registered Plate / Unit</span>
                    <span className="font-mono font-bold text-white mt-0.5 block">{activeShipment.vehiclePlate || 'MH-12-TR-8104'}</span>
                  </div>
                  <div>
                    <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Driver In-Charge</span>
                    <span className="font-semibold text-white mt-0.5 block">{activeShipment.driverName || 'Licensed Transport Pilot'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-[#041611] rounded-xl border border-[#0e352a]">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                    <Truck size={18} />
                  </div>
                  <div className="font-bold text-white text-sm">Vehicle not assigned</div>
                  <p className="text-xs text-[#7ea597] mt-1 max-w-md mx-auto">
                    This shipment is currently awaiting acceptance by an authorized carrier. Once accepted in the provider terminal, vehicle metrics and telemetry will populate automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── STAGE 4 & 5: ROUTE & LIVE TRACKING ──────────────────────────── */}
        <div className="bg-[#061b15] border border-[#0f382e] rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => toggleStage(4)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs">
                ●
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 4 & 5 &mdash; CORRIDOR ROUTE & LIVE TRACKING
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Corridor: <strong className="text-white">{activeShipment.origin} &rarr; {activeShipment.destination}</strong> &bull; Esri Dark Logistics Canvas
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
                In Transit ({Math.round(transitProgress * 100)}%)
              </span>
              {expandedStages[4] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[4] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs space-y-4">
              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <span className="text-[10px] font-mono uppercase text-[#7ea597]">Current Coordinates</span>
                  <div className="font-mono font-bold text-white text-xs mt-1">
                    {currentCoords.lat.toFixed(4)}°N, {currentCoords.lng.toFixed(4)}°E
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <span className="text-[10px] font-mono uppercase text-[#7ea597]">Speed & Heading</span>
                  <div className="font-bold text-white text-xs mt-1">
                    58 km/h &bull; Westbound
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <span className="text-[10px] font-mono uppercase text-[#7ea597]">Est. Distance Remaining</span>
                  <div className="font-bold text-white text-xs mt-1">
                    {Math.round((1 - transitProgress) * 780)} km
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#041611] border border-[#0e352a]">
                  <span className="text-[10px] font-mono uppercase text-[#7ea597]">Projected Arrival (ETA)</span>
                  <div className="font-bold text-emerald-400 text-xs mt-1">
                    {isDelaySimulated && !isRouteApplied ? '19:45 IST (Delayed)' : '18:00 IST (Nominal)'}
                  </div>
                </div>
              </div>

              {/* Embedded Leaflet Map with Esri World Dark Gray Canvas */}
              <div className="relative h-80 rounded-2xl overflow-hidden border border-[#0f382e]">
                <div ref={mapContainerRef} className="h-full w-full z-0" />
                <div className="absolute top-3 left-3 z-10 bg-[#061b15]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#0f382e] text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stageStates.delay.active && !isRouteApplied ? 'bg-rose-500' : 'bg-emerald-400'} animate-ping`} />
                    <span className="text-white font-bold">{activeShipment.origin} &rarr; {activeShipment.destination}</span>
                  </div>
                </div>
                {(showAlternateOnMap || isRouteApplied) && (
                  <div className="absolute bottom-3 left-3 z-10 bg-emerald-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800 text-[11px] font-mono text-emerald-300">
                    &bull; Active Green Line: Optimized Samruddhi Expressway Bypass
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── STAGE 6: DELAY DETECTION ────────────────────────────────────── */}
        <div className={`border rounded-2xl overflow-hidden shadow-lg transition-all ${
          stageStates.delay.active && !isRouteApplied
            ? 'bg-[#180a0a] border-rose-900/80'
            : 'bg-[#061b15] border-[#0f382e]'
        }`}>
          <div 
            onClick={() => toggleStage(6)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                stageStates.delay.active && !isRouteApplied
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {stageStates.delay.active && !isRouteApplied ? '⚠' : '✓'}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 6 &mdash; INCIDENT & DELAY DETECTION
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  {stageStates.delay.active && !isRouteApplied
                    ? 'Transit anomaly detected: +1h 45m corridor bottleneck'
                    : 'Corridor conditions nominal &bull; Zero active exceptions'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                stageStates.delay.active && !isRouteApplied
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {stageStates.delay.active && !isRouteApplied ? 'DELAY DETECTED' : 'ON SCHEDULE'}
              </span>
              {expandedStages[6] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[6] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs space-y-4">
              {/* Interactive Delay Incident Simulator Toggle (for Testing Flow) */}
              <div className="p-3.5 rounded-xl bg-[#041611] border border-[#0e352a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Sliders size={14} className="text-[#10b981]" />
                    <span>Interactive Incident Verification Controls</span>
                  </div>
                  <div className="text-[11px] text-[#7ea597] mt-0.5">
                    Toggle an active highway delay incident to test the downstream Gemini AI rerouting engine.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDelaySimulated(!isDelaySimulated);
                    setIsRouteApplied(false);
                    setShowAlternateOnMap(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDelaySimulated
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                      : 'bg-[#0e352a] hover:bg-[#164a3b] text-emerald-300 border border-[#164a3b]'
                  }`}
                >
                  {isDelaySimulated ? 'Clear Simulated Delay' : 'Simulate Delay Incident'}
                </button>
              </div>

              {stageStates.delay.active && !isRouteApplied ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
                    <AlertTriangle size={16} />
                    <span>BOTTLENECK WARNING &bull; NH-53 TRANSIT SLOWDOWN</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rose-300/70">Expected Arrival</span>
                      <div className="font-bold text-white text-xs mt-0.5">18:00 IST</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rose-300/70">Updated Arrival</span>
                      <div className="font-bold text-rose-300 text-xs mt-0.5">19:45 IST (+105 mins)</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rose-300/70">Reported Cause</span>
                      <div className="font-semibold text-rose-200 text-xs mt-0.5">{delayReason}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#041611] border border-[#0e352a] text-[#7ea597] flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white">Corridor Clear:</strong> No active traffic slowdowns, customs inspections, or mechanical exceptions recorded. All checkpoints on schedule.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── STAGE 7: AI RECOMMENDATION ──────────────────────────────────── */}
        <div className={`border rounded-2xl overflow-hidden shadow-lg transition-all ${
          stageStates.delay.active && !isRouteApplied
            ? 'bg-[#150e28] border-purple-900/80'
            : 'bg-[#061b15] border-[#0f382e]'
        }`}>
          <div 
            onClick={() => toggleStage(7)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                isRouteApplied
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : stageStates.delay.active
                  ? 'bg-purple-500/20 text-purple-400 animate-pulse'
                  : 'bg-slate-500/15 text-slate-400'
              }`}>
                <Sparkles size={14} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 7 &mdash; GEMINI LOGISTICS AI RECOMMENDATION
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Multimodal corridor optimizer &bull; Human-in-the-Loop decision verification
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isRouteApplied
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : stageStates.delay.active
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'bg-[#041611] text-[#7ea597] border border-[#0f382e]'
              }`}>
                {isRouteApplied ? 'ROUTE APPLIED' : stageStates.delay.active ? 'ACTION REQUIRED' : 'STANDBY'}
              </span>
              {expandedStages[7] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[7] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs space-y-4">
              {isAiAnalyzing ? (
                <div className="p-6 text-center space-y-3">
                  <RefreshCw size={24} className="text-purple-400 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-white">LogiSync AI analyzing real-time corridor metrics...</div>
                  <p className="text-xs text-[#7ea597]">
                    Computing road surface conditions, reefer temperature thresholds, and alternate bypass feasibility.
                  </p>
                </div>
              ) : aiRecommendation && stageStates.delay.active && !isRouteApplied ? (
                <div className="p-5 rounded-xl bg-[#1b1233] border border-purple-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-400" />
                      <span>{aiRecommendation.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      High Confidence (98.4%)
                    </span>
                  </div>

                  <p className="text-xs text-[#d8b4fe] leading-relaxed">
                    {aiRecommendation.rationale}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0f0924] p-3.5 rounded-xl border border-purple-900/60">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-purple-300/70">Time Saved</span>
                      <div className="font-bold text-emerald-400 text-sm mt-0.5">+{aiRecommendation.timeSavedMinutes} mins</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-purple-300/70">Distance Delta</span>
                      <div className="font-bold text-white text-sm mt-0.5">+{aiRecommendation.additionalKm} km</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-purple-300/70">Cost Delta</span>
                      <div className="font-bold text-slate-300 text-xs mt-0.5">{aiRecommendation.fuelCostDelta}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-purple-300/70">Cold-Chain Status</span>
                      <div className="font-bold text-emerald-400 text-xs mt-0.5">{aiRecommendation.coldChainIntegrity}</div>
                    </div>
                  </div>

                  {/* Section 17: AI Actions (Human reviews -> Human approves -> System applies) */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyAlternateRoute}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Apply Recommended Route</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAlternateOnMap(!showAlternateOnMap)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#28184c] hover:bg-[#38236b] text-purple-200 text-xs font-semibold border border-purple-700 transition-colors cursor-pointer"
                    >
                      <Layers size={14} />
                      <span>{showAlternateOnMap ? 'Hide Route on Map' : 'Preview Route on Map'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDelaySimulated(false)}
                      className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : isRouteApplied ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-white text-xs">Route Optimization Applied by Operator</strong>
                      <div className="text-[11px] text-[#7ea597] mt-0.5">
                        Corridor diverted to Samruddhi Expressway. Standstill avoided, restoring original 18:00 IST arrival SLA.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    SLA PROTECTED
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#041611] border border-[#0e352a] text-[#7ea597] flex items-center gap-3">
                  <Sparkles size={16} className="text-purple-400 shrink-0" />
                  <div>
                    <strong className="text-white">AI Logistics Assistant Standing By:</strong> Primary corridor operating under nominal transit thresholds. Predictive models evaluate weather, port berths, and traffic every 15 minutes.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── STAGE 8: DELIVERY ───────────────────────────────────────────── */}
        <div className="bg-[#061b15] border border-[#0f382e] rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => toggleStage(8)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                stageStates.delivery.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'
              }`}>
                {stageStates.delivery.completed ? '✓' : '8'}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STAGE 8 &mdash; FINAL-MILE DELIVERY & PROOF OF DELIVERY
                </div>
                <div className="text-[11px] text-[#7ea597]">
                  Destination: <strong className="text-white">{activeShipment.destination}</strong> &bull; Receiver Verification
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                stageStates.delivery.completed
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-[#041611] text-[#7ea597] border border-[#0f382e]'
              }`}>
                {stageStates.delivery.completed ? 'COMPLETED' : 'FINAL MILE PENDING'}
              </span>
              {expandedStages[8] ? <ChevronDown size={16} className="text-[#7ea597]" /> : <ChevronRight size={16} className="text-[#7ea597]" />}
            </div>
          </div>

          {expandedStages[8] && (
            <div className="px-5 pb-5 pt-2 border-t border-[#0d2f25] text-xs space-y-4">
              {stageStates.delivery.completed ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#041611] p-4 rounded-xl border border-[#0e352a]">
                    <div>
                      <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Delivered Timestamp</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">
                        {activeShipment.deliveredAt || effectivePod?.deliveredAt || 'Sep 19, 2026, 17:42 IST'}
                      </span>
                      <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">
                        GPS: 19.0760° N, 72.8777° E (Dock 4B)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Receiver Sign-off</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {effectivePod?.receiverName || 'Dr. A. K. Sen'}
                      </span>
                      <span className="text-slate-400 text-[10px] block">
                        {effectivePod?.receiverRole || 'Authorized Receiving Dock In-Charge'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7ea597] block text-[10px] uppercase font-mono">Proof of Delivery (POD)</span>
                      <span className="font-mono text-emerald-400 font-bold mt-0.5 block">
                        OTP-Verified (#{effectivePod?.otpCode || '8942'}) &bull; Seal Intact
                      </span>
                      <span className="text-slate-400 text-[10px] block font-mono">
                        {effectivePod?.sealNumber || 'ISO-17712 #SL-884920'}
                      </span>
                    </div>
                  </div>

                  {/* Signature Preview & Download Action */}
                  <div className="p-3.5 rounded-xl bg-[#06241c] border border-[#0f4a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {effectivePod?.signatureUrl ? (
                        <div className="bg-white p-1 rounded-lg border border-emerald-400/50 inline-block shrink-0">
                          <img 
                            src={effectivePod.signatureUrl} 
                            alt="Captured Signature" 
                            className="h-10 w-28 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-serif italic text-lg font-bold shrink-0">
                          AK
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>Receiver Touch-Signature & OTP Legally Notarized</span>
                        </div>
                        <div className="text-[11px] text-[#8ab2a3] mt-0.5">
                          Tamper-evident proof of delivery recorded with verifiable SHA-256 cryptographic hash.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerDoc('pod')}
                      className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ShieldCheck size={14} />
                      <span>Download Official e-POD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#041611] border border-[#0e352a] text-[#7ea597] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-sky-400 shrink-0" />
                      <div>
                        <strong className="text-white">Awaiting Final-Mile Handover:</strong> Consignment scheduled at destination dock ({activeShipment.destination}).
                        Consignee OTP verification and touch signature will complete legal chain-of-custody.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerPod}
                      className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PenTool size={13} />
                      <span>Sign & Authenticate Delivery</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ─── MODALS: DOCUMENT VIEWER & TOUCH SIGNATURE HANDOVER ────────────── */}
      <DocumentViewerModal
        isOpen={internalDocOpen}
        onClose={() => setInternalDocOpen(false)}
        shipment={{ ...activeShipment, pod_data: effectivePod }}
        initialDocType={internalDocType}
      />

      <ProofOfDeliveryModal
        isOpen={internalPodOpen}
        onClose={() => setInternalPodOpen(false)}
        shipment={activeShipment}
        onConfirmDelivery={handleInternalConfirmDelivery}
      />
    </div>
  );
}
