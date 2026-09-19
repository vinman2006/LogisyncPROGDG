import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bus,
  Train,
  Search,
  Plus,
  Minus,
  RefreshCw,
  ArrowLeft,
  X,
  MapPin,
  Clock,
  Layers,
  Info
} from 'lucide-react';

const MetroIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="16" x="4" y="3" rx="2"/>
    <path d="M4 11h16"/>
    <path d="M12 3v8"/>
    <path d="m8 19-2 3"/>
    <path d="m18 22-2-3"/>
    <circle cx="8" cy="15" r="1"/>
    <circle cx="16" cy="15" r="1"/>
  </svg>
);

// Tile Layer Configuration - Esri World Dark Gray Canvas (Zero Watermarks, No API Key Required)
const DARK_MAP_TILES = {
  base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  reference: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
};

// SVG Icon templates for clean custom map markers
function createVehicleIcon(type) {
  let color = '#10b981'; // Bus: Emerald
  let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.2-.7-.8-1.2-1.5-1.2H4.1c-.7 0-1.3.5-1.5 1.2l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2C1.5 16.3 2 18 2 18h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`;

  if (type === 'METRO' || type === 'metro') {
    color = '#06b6d4'; // Metro: Cyan
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`;
  } else if (type === 'TRAIN' || type === 'train') {
    color = '#f59e0b'; // Train: Amber
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg>`;
  }

  const html = `
    <div style="
      background-color: #041410;
      border: 2px solid ${color};
      color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(0,0,0,0.7), 0 0 6px ${color}55;
      cursor: pointer;
    ">
      ${iconSvg}
    </div>
  `;

  return L.divIcon({
    className: 'public-transit-marker',
    html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function createStationIcon() {
  const html = `
    <div style="
      background-color: #ffffff;
      border: 2px solid #041410;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(255,255,255,0.8);
      cursor: pointer;
    "></div>
  `;
  return L.divIcon({
    className: 'public-station-marker',
    html,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export default function PublicTransitMap({ onBack, onExitToLanding }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);
  const stationsGroupRef = useRef(null);

  // Filter state: 'ALL' | 'BUS' | 'METRO' | 'TRAIN'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item cards
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  // Live telematics state
  const [isLoading, setIsLoading] = useState(true);
  const [feedStatus, setFeedStatus] = useState(null);
  const [publicVehicles, setPublicVehicles] = useState([]);
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [publicStations, setPublicStations] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Fetch real public transport feed from backend
  const fetchPublicTransitFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public-transit/feed');
      if (res.ok) {
        const data = await res.json();
        setFeedStatus(data.status || 'UNCONNECTED');
        
        // Strictly filter to ensure ONLY officially classified PUBLIC vehicles appear
        // Private company vehicles (trucks, vans, private fleets) are strictly excluded
        const validVehicles = (data.vehicles || []).filter(v => {
          const isPublic = v.classification === 'PUBLIC' || !v.is_private;
          const isValidType = ['BUS', 'METRO', 'TRAIN'].includes((v.type || '').toUpperCase());
          return isPublic && isValidType;
        });

        setPublicVehicles(validVehicles);
        setPublicRoutes(data.routes || []);
        setPublicStations(data.stations || []);
      } else {
        setFeedStatus('ERROR');
        setPublicVehicles([]);
        setPublicRoutes([]);
        setPublicStations([]);
      }
    } catch (err) {
      console.warn('[PublicMap] Error fetching public transit feed:', err.message);
      setFeedStatus('OFFLINE');
      setPublicVehicles([]);
      setPublicRoutes([]);
      setPublicStations([]);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: India Logistics Center (Nagpur: 21.1458, 79.0882)
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 6,
      zoomControl: false, // We provide clean custom zoom controls
      attributionControl: true,
    });

    // Esri World Dark Gray Base (land, oceans, borders - 100% Free, Zero Watermark)
    L.tileLayer(DARK_MAP_TILES.base, {
      attribution: DARK_MAP_TILES.attribution,
      maxZoom: DARK_MAP_TILES.maxZoom,
    }).addTo(map);

    // Esri World Dark Gray Reference (crisp labels, highways & borders overlay)
    L.tileLayer(DARK_MAP_TILES.reference, {
      maxZoom: DARK_MAP_TILES.maxZoom,
    }).addTo(map);

    // Layer groups for clean management
    routesGroupRef.current = L.layerGroup().addTo(map);
    stationsGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Initial fetch
    fetchPublicTransitFeed();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter items by type and search query
  const filteredVehicles = useMemo(() => {
    return publicVehicles.filter(v => {
      const typeMatch = activeFilter === 'ALL' || (v.type || '').toUpperCase() === activeFilter;
      if (!typeMatch) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (v.vehicle_number || '').toLowerCase().includes(q) ||
        (v.route_name || '').toLowerCase().includes(q) ||
        (v.destination || '').toLowerCase().includes(q) ||
        (v.current_stop || '').toLowerCase().includes(q)
      );
    });
  }, [publicVehicles, activeFilter, searchQuery]);

  const filteredRoutes = useMemo(() => {
    return publicRoutes.filter(r => {
      const typeMatch = activeFilter === 'ALL' || (r.type || '').toUpperCase() === activeFilter;
      if (!typeMatch) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.code || '').toLowerCase().includes(q) ||
        (r.origin || '').toLowerCase().includes(q) ||
        (r.destination || '').toLowerCase().includes(q)
      );
    });
  }, [publicRoutes, activeFilter, searchQuery]);

  // Update map overlays when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    markersGroupRef.current?.clearLayers();
    routesGroupRef.current?.clearLayers();
    stationsGroupRef.current?.clearLayers();

    // 1. Render Routes (clean colored lines)
    filteredRoutes.forEach(r => {
      if (!r.coordinates || r.coordinates.length < 2) return;
      let color = '#10b981';
      if ((r.type || '').toUpperCase() === 'METRO') color = '#06b6d4';
      if ((r.type || '').toUpperCase() === 'TRAIN') color = '#f59e0b';

      const polyline = L.polyline(r.coordinates, {
        color,
        weight: 3.5,
        opacity: 0.8,
        dashArray: (r.type || '').toUpperCase() === 'TRAIN' ? '6, 8' : undefined,
      });

      polyline.on('click', () => {
        setSelectedRoute(r);
        setSelectedVehicle(null);
        setSelectedStation(null);
      });

      routesGroupRef.current?.addLayer(polyline);
    });

    // 2. Render Stations / Stops (small clean points)
    publicStations.forEach(s => {
      if (!s.lat || !s.lng) return;
      const marker = L.marker([s.lat, s.lng], { icon: createStationIcon() });
      marker.on('click', () => {
        setSelectedStation(s);
        setSelectedVehicle(null);
        setSelectedRoute(null);
      });
      stationsGroupRef.current?.addLayer(marker);
    });

    // 3. Render Public Vehicles (Bus, Metro, Train markers)
    filteredVehicles.forEach(v => {
      if (!v.lat || !v.lng) return;
      const marker = L.marker([v.lat, v.lng], { icon: createVehicleIcon(v.type) });
      marker.on('click', () => {
        setSelectedVehicle(v);
        setSelectedRoute(null);
        setSelectedStation(null);
      });
      markersGroupRef.current?.addLayer(marker);
    });
  }, [filteredVehicles, filteredRoutes, publicStations]);

  // Zoom handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] min-h-[500px] flex flex-col bg-[#030e0b] overflow-hidden select-none font-sans text-white">
      {/* ─── MINIMAL FLOATING TOP HEADER ─────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Brand Identity & Back Control */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {(onBack || onExitToLanding) && (
            <button
              type="button"
              onClick={onBack || onExitToLanding}
              className="px-3 py-2 rounded-xl bg-[#041410]/90 hover:bg-[#08221b] border border-[#0f382e] text-xs font-semibold text-[#8eb6a7] hover:text-white flex items-center gap-1.5 backdrop-blur-md shadow-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          <div className="px-3.5 py-2 rounded-xl bg-[#041410]/90 border border-[#0f382e] backdrop-blur-md shadow-xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
              <span className="text-white">Public Transit</span>
              <span className="text-[#ff5500]">Network</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#08241d] text-[#10b981] border border-[#10b981]/30">
              OFFICIAL
            </span>
          </div>
        </div>

        {/* Center: Search & Filter Toolbar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d9487]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route, stop, or line..."
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-[#041410]/90 border border-[#0f382e] text-white placeholder-[#6d9487] focus:outline-none focus:border-[#10b981] backdrop-blur-md shadow-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6d9487] hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Simple Type Filters */}
          <div className="flex items-center p-1 rounded-xl bg-[#041410]/90 border border-[#0f382e] backdrop-blur-md shadow-xl gap-1 text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'BUS', label: 'Bus', icon: Bus },
              { id: 'METRO', label: 'Metro', icon: MetroIcon },
              { id: 'TRAIN', label: 'Train', icon: Train },
            ].map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#10b981] text-[#041410] shadow-sm'
                      : 'text-[#8eb6a7] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.icon && <f.icon size={12} />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Refresh Feed */}
          <button
            type="button"
            onClick={fetchPublicTransitFeed}
            disabled={isLoading}
            title="Refresh telematics feed"
            className="p-2.5 rounded-xl bg-[#041410]/90 hover:bg-[#08221b] border border-[#0f382e] text-[#8eb6a7] hover:text-white backdrop-blur-md shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#10b981]' : ''} />
          </button>
        </div>
      </div>

      {/* ─── FULL-SCREEN MAP ELEMENT ────────────────────────────────────────── */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0 bg-[#030e0b]" />

      {/* ─── HONEST EMPTY STATE BADGE (When no live public transit feed is connected, Dismissible) */}
      {publicVehicles.length === 0 && !isLoading && !isAlertDismissed && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-[90%] p-4 rounded-2xl bg-[#041410]/95 border border-[#0f382e] backdrop-blur-md shadow-2xl pointer-events-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#0f382e]/60 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>No public transport data available</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAlertDismissed(true)}
              className="text-[#6d9487] hover:text-white cursor-pointer p-0.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-[#7ea597] leading-relaxed text-center">
            Public transit telematics feed is currently offline or unconfigured for this region. 
            Only verified public vehicles (government buses, metro, passenger rail) appear on this map.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#0f382e] flex items-center justify-between text-[10px] text-[#6d9487]">
            <span>Classification: Public Transit Only</span>
            <span>Last checked: {lastRefreshed || 'Just now'}</span>
          </div>
        </div>
      )}

      {/* ─── MINIMAL ZOOM CONTROLS (Right Side) ─────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-9 h-9 rounded-xl bg-[#041410]/90 hover:bg-[#08221b] border border-[#0f382e] text-[#8eb6a7] hover:text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-all cursor-pointer"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-9 h-9 rounded-xl bg-[#041410]/90 hover:bg-[#08221b] border border-[#0f382e] text-[#8eb6a7] hover:text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-all cursor-pointer"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* ─── MINIMAL MAP LEGEND (Bottom Left) ─────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 z-[1000] p-3 rounded-2xl bg-[#041410]/90 border border-[#0f382e] backdrop-blur-md shadow-xl pointer-events-auto text-[11px] space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#6d9487] font-bold pb-1 border-b border-[#0f382e]">
          Public Transit Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-[#a0cdbe]">Public / Government Bus</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
          <span className="text-[#a0cdbe]">Metro Train</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[#a0cdbe]">Passenger Rail / Train</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white ring-2 ring-[#041410]" />
          <span className="text-[#a0cdbe]">Station / Transit Stop</span>
        </div>
        <div className="pt-1 text-[9px] text-[#557b6f] italic">
          Private company fleets excluded
        </div>
      </div>

      {/* ─── VEHICLE DETAIL CARD (When a vehicle marker is clicked) ─────────── */}
      {selectedVehicle && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-80 p-4 rounded-2xl bg-[#041410]/95 border border-[#0f382e] backdrop-blur-md shadow-2xl text-xs pointer-events-auto animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#0f382e]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                selectedVehicle.type === 'BUS' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' :
                selectedVehicle.type === 'METRO' ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40' :
                'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
              }`}>
                {selectedVehicle.type}
              </span>
              <span className="font-mono font-bold text-white">
                {selectedVehicle.vehicle_number || 'Vehicle'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVehicle(null)}
              className="text-[#6d9487] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[#a0cdbe]">
            <div>
              <span className="text-[#6d9487]">Route: </span>
              <strong className="text-white">{selectedVehicle.route_name || 'Active Public Route'}</strong>
            </div>
            <div>
              <span className="text-[#6d9487]">Current Location: </span>
              <span className="text-white">{selectedVehicle.current_stop || 'In Transit'}</span>
            </div>
            <div>
              <span className="text-[#6d9487]">Destination: </span>
              <span className="text-white">{selectedVehicle.destination || 'Terminal'}</span>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[#6d9487]">Operational Status:</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {selectedVehicle.status || 'On Time'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── ROUTE DETAIL CARD (When a route line is clicked) ───────────────── */}
      {selectedRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-80 p-4 rounded-2xl bg-[#041410]/95 border border-[#0f382e] backdrop-blur-md shadow-2xl text-xs pointer-events-auto animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#0f382e]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#08241d] text-[#10b981] font-bold">
                {selectedRoute.code || 'LINE'}
              </span>
              <strong className="text-white text-xs">{selectedRoute.name}</strong>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRoute(null)}
              className="text-[#6d9487] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[#a0cdbe]">
            <div>
              <span className="text-[#6d9487]">Origin: </span>
              <span className="text-white">{selectedRoute.origin || 'Station A'}</span>
            </div>
            <div>
              <span className="text-[#6d9487]">Destination: </span>
              <span className="text-white">{selectedRoute.destination || 'Station B'}</span>
            </div>
            <div>
              <span className="text-[#6d9487]">Type: </span>
              <span className="text-white uppercase font-bold text-[10px]">{selectedRoute.type || 'Transit'}</span>
            </div>
            {selectedRoute.frequency && (
              <div>
                <span className="text-[#6d9487]">Frequency: </span>
                <span className="text-white">{selectedRoute.frequency}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── STATION DETAIL CARD (When a station point is clicked) ──────────── */}
      {selectedStation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-72 p-4 rounded-2xl bg-[#041410]/95 border border-[#0f382e] backdrop-blur-md shadow-2xl text-xs pointer-events-auto animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#0f382e]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-white" />
              <strong className="text-white text-xs">{selectedStation.name}</strong>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStation(null)}
              className="text-[#6d9487] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-2 text-[#a0cdbe] space-y-1">
            <div className="text-[11px]">
              <span className="text-[#6d9487]">Connected Lines: </span>
              <span className="text-white">{selectedStation.lines || 'Public Transit Network'}</span>
            </div>
            <div className="text-[11px]">
              <span className="text-[#6d9487]">Transit Node: </span>
              <span className="text-white">{selectedStation.city || 'Municipal Hub'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
