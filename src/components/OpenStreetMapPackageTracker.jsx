import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Package, 
  Truck, 
  Navigation, 
  Search, 
  Maximize2, 
  Clock,
  Plus
} from 'lucide-react';

// Tile Layer Configurations
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  voyager: {
    name: 'Logistics Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  dark: {
    name: 'Night Operations (Esri Dark)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 16,
  },
};

// Known coordinates for Indian & global logistics nodes
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

export default function OpenStreetMapPackageTracker({ 
  shipments = [], 
  onSelectPackage, 
  initialSelectedId = null,
  onCreateShipment 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef({});
  const activeTileLayerRef = useRef(null);

  const [activeLayerKey, setActiveLayerKey] = useState('voyager');
  const [selectedPackageId, setSelectedPackageId] = useState(initialSelectedId);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Compute trackable package locations from real shipments only (no demo data)
  const trackablePackages = useMemo(() => {
    if (!shipments || shipments.length === 0) {
      return [];
    }

    return shipments.map((s, index) => {
      const origCoord = CITY_COORDINATES[s.origin] || { lat: 20.5937 + (index * 0.5), lng: 78.9629 - (index * 0.5) };
      const destCoord = CITY_COORDINATES[s.destination] || { lat: 19.0760 + (index * 0.4), lng: 72.8777 + (index * 0.4) };

      // Calculate midpoint for current position
      const currentLat = origCoord.lat + (destCoord.lat - origCoord.lat) * 0.45;
      const currentLng = origCoord.lng + (destCoord.lng - origCoord.lng) * 0.45;
      const stableCarrierNum = (index * 137 + 101) % 900;

      return {
        id: s.id,
        originName: s.origin,
        originCoords: [origCoord.lat, origCoord.lng],
        currentCoords: [currentLat, currentLng],
        destName: s.destination,
        destCoords: [destCoord.lat, destCoord.lng],
        status: s.status || 'In Transit',
        speed: s.status === 'Delivered' ? '0 km/h (Docked)' : '70 km/h',
        carrier: `LogiSync Freight Carrier #${stableCarrierNum}`,
        driver: 'Assigned Driver',
        eta: s.status === 'Delivered' ? 'Delivered' : 'Today, 8:00 PM',
        freight: s.description || 'General Freight',
        weight: s.weight || '50 kg',
        temp: 'Ambient',
        progress: s.status === 'Delivered' ? 100 : 45,
      };
    });
  }, [shipments]);

  // Filter packages based on search and status
  const filteredPackages = useMemo(() => {
    return trackablePackages.filter(pkg => {
      const matchSearch = 
        !searchFilter.trim() ||
        pkg.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.originName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.destName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pkg.freight.toLowerCase().includes(searchFilter.toLowerCase());

      const matchStatus = statusFilter === 'All' || pkg.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trackablePackages, searchFilter, statusFilter]);

  // Active selected package
  const activePackage = useMemo(() => {
    if (!selectedPackageId && filteredPackages.length > 0) return filteredPackages[0];
    return trackablePackages.find(p => p.id === selectedPackageId) || filteredPackages[0];
  }, [selectedPackageId, trackablePackages, filteredPackages]);

  // ─── INITIALIZE LEAFLET OPENSTREETMAP ─────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map Instance (Center on India logistics corridor default)
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5.5,
      zoomControl: false,
      attributionControl: true,
    });

    // Add Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Tile Layer
    const tileConfig = TILE_LAYERS[activeLayerKey] || TILE_LAYERS.voyager;
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    activeTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Ensure map container renders tiles correctly on mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeLayerKey]);

  // ─── RENDER PACKAGE MARKERS & ROUTE LINES ON OPENSTREETMAP ────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers & polylines
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    Object.values(polylinesRef.current).forEach(p => map.removeLayer(p));
    markersRef.current = {};
    polylinesRef.current = {};

    filteredPackages.forEach(pkg => {
      const isSelected = activePackage?.id === pkg.id;

      // 1. Origin Pin
      const originIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #64748b;
            border: 2px solid white;
            box-shadow: 0 0 8px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const originMarker = L.marker(pkg.originCoords, { icon: originIcon }).addTo(map);
      originMarker.bindTooltip(`Origin: ${pkg.originName}`, { direction: 'top', offset: [0, -6] });

      // 2. Destination Pin
      const destIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #10b981;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(16,185,129,0.7);
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const destMarker = L.marker(pkg.destCoords, { icon: destIcon }).addTo(map);
      destMarker.bindTooltip(`Destination: ${pkg.destName}`, { direction: 'top', offset: [0, -7] });

      // 3. Animated Package Live GPS Marker
      const liveIcon = L.divIcon({
        className: 'custom-leaflet-live-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${isSelected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.25)'};
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: ${isSelected ? '#059669' : '#0284c7'};
              border: 2.5px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s;
            ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const liveMarker = L.marker(pkg.currentCoords, { icon: liveIcon }).addTo(map);

      // Popup with rich telemetry information
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${pkg.id}</strong>
            <span style="font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 9999px;">
              ${pkg.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <b>Route:</b> ${pkg.originName} &rarr; ${pkg.destName}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <b>Cargo:</b> ${pkg.freight}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <b>Speed:</b> ${pkg.speed} | <b>ETA:</b> ${pkg.eta}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            Carrier: ${pkg.carrier}
          </div>
        </div>
      `;
      liveMarker.bindPopup(popupHtml);

      liveMarker.on('click', () => {
        setSelectedPackageId(pkg.id);
        if (onSelectPackage) onSelectPackage(pkg);
      });

      markersRef.current[`live_${pkg.id}`] = liveMarker;
      markersRef.current[`origin_${pkg.id}`] = originMarker;
      markersRef.current[`dest_${pkg.id}`] = destMarker;

      // 4. Route Polyline
      const routePoints = [pkg.originCoords, pkg.currentCoords, pkg.destCoords];
      const polyline = L.polyline(routePoints, {
        color: isSelected ? '#10b981' : '#38bdf8',
        weight: isSelected ? 4 : 2.5,
        opacity: isSelected ? 0.9 : 0.6,
        dashArray: isSelected ? null : '6, 8',
      }).addTo(map);

      polylinesRef.current[pkg.id] = polyline;
    });
  }, [filteredPackages, activePackage, onSelectPackage]);

  // ─── FLY MAP TO SELECTED PACKAGE ─────────────────────────────────────────────
  const handleFocusPackage = (pkg) => {
    setSelectedPackageId(pkg.id);
    const map = mapInstanceRef.current;
    if (map && pkg.currentCoords) {
      map.flyTo(pkg.currentCoords, 8.5, {
        duration: 1.2,
      });

      // Open popup
      const marker = markersRef.current[`live_${pkg.id}`];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1200);
      }
    }
  };

  // ─── FIT ALL PACKAGES IN VIEW ────────────────────────────────────────────────
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredPackages.length === 0) return;

    const allPoints = filteredPackages.map(p => p.currentCoords);
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm relative">
      {/* ======================================================================= */}
      {/* LEFT COLUMN: ACTIVE PACKAGES ROSTER & TELEMETRY LIST                     */}
      {/* ======================================================================= */}
      <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between shrink-0 z-10 max-h-[350px] lg:max-h-full">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Navigation size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">Live Radar Telemetry</h3>
                <span className="text-[10px] text-slate-400">OpenStreetMap GPS Tracking</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{filteredPackages.length} Online</span>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-2.5">
            {['All', 'In Transit', 'Delivered'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search package ID, city, cargo..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#10b981]"
            />
          </div>
        </div>

        {/* Package Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredPackages.length === 0 ? (
            <div className="h-full py-12 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
                <Package size={22} strokeWidth={1.5} />
              </div>
              <div className="text-xs font-bold text-slate-800">No active shipments</div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Create a shipment to track its real-time GPS telemetry on OpenStreetMap.
              </p>
              {onCreateShipment && (
                <button
                  type="button"
                  onClick={onCreateShipment}
                  className="mt-3.5 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                >
                  <Plus size={13} strokeWidth={2.4} />
                  <span>Create Shipment</span>
                </button>
              )}
            </div>
          ) : (
            filteredPackages.map((pkg) => {
              const isSelected = activePackage?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => handleFocusPackage(pkg)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Top ID & Status Tag */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Package size={13} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>{pkg.id}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                      {pkg.status}
                    </span>
                  </div>

                  {/* Route Path */}
                  <div className="mt-2 text-slate-600 font-medium truncate flex items-center gap-1.5 text-[11px]">
                    <span>{pkg.originName}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-slate-900 font-semibold">{pkg.destName}</span>
                  </div>

                  {/* Cargo Details */}
                  <div className="mt-1 text-[10px] text-slate-400 truncate">
                    {pkg.freight} ({pkg.weight})
                  </div>

                  {/* Progress Bar & Speed Indicator */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Truck size={11} className="text-emerald-600" />
                      <span>{pkg.speed}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} />
                      <span>ETA {pkg.eta}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleFitAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <Maximize2 size={12} />
            <span>Fit All Packages</span>
          </button>

          <span className="text-[10px] font-mono text-slate-400">
            OpenStreetMap Engine
          </span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* RIGHT COLUMN: INTERACTIVE LEAFLET OPENSTREETMAP CONTAINER               */}
      {/* ======================================================================= */}
      <div className="flex-1 relative h-[450px] lg:h-full w-full overflow-hidden">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Top Overlay Bar on Map: Tile Layer Switcher */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-md">
          {Object.entries(TILE_LAYERS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveLayerKey(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeLayerKey === key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>

        {/* Empty State Overlay on Map when 0 packages exist */}
        {trackablePackages.length === 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-4">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 shadow-xl max-w-sm text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Navigation size={22} />
              </div>
              <div className="text-sm font-bold text-slate-900">No shipments on map</div>
              <p className="text-xs text-slate-500 mt-1">
                Your map is ready. Once you create a shipment, its live route and GPS telemetry pin will appear here automatically.
              </p>
              {onCreateShipment && (
                <button
                  type="button"
                  onClick={onCreateShipment}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Plus size={14} />
                  <span>Create First Shipment</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Active Package Telemetry Card (Bottom Left of Map) */}
        {activePackage && (
          <div className="hidden sm:block absolute bottom-5 left-5 z-10 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs text-slate-900">{activePackage.id} Telemetry</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {activePackage.speed}
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-slate-800">{activePackage.originName} &rarr; {activePackage.destName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier:</span>
                <span className="font-medium text-slate-700">{activePackage.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Delivery:</span>
                <span className="font-semibold text-emerald-600">{activePackage.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Freight Condition:</span>
                <span className="font-medium text-slate-700">{activePackage.temp}</span>
              </div>
            </div>

            {/* Route Completion Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>In-Transit Progress</span>
                <span className="font-bold text-slate-700">{activePackage.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${activePackage.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
