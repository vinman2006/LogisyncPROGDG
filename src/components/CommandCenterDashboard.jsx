import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  Share2,
  BarChart3,
  Mail,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowLeft,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  LogOut,
  Home,
  Map,
  ExternalLink,
  ShieldCheck,
  GitBranch,
  AlertCircle,
  Check,
  RefreshCw,
  Eye,
  Network,
  Sparkles,
  User,
  Pencil,
  ChevronRight,
  Database,
  Shield,
  Link2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  checkUserExistsInNeon,
  saveUserProfileToNeon,
  fetchTransportRequests,
  createTransportRequest,
  acceptTransportRequest,
  updateTransportStatus,
  fetchShipmentEvents
} from '../services/neonService';
import OpenStreetMapPackageTracker from './OpenStreetMapPackageTracker';
import TransportSystemWorkflow from './TransportSystemWorkflow';
import PublicTransitMap from './PublicTransitMap';
import ApiHubDashboard from './ApiHubDashboard';

// ─── LOGISYNCPRO LOGO ICON ──────────────────────────────────────────────────
const LogiSyncMark = () => (
  <div className="w-8 h-8 rounded-lg bg-[#0e3328] border border-[#1b5c47] flex items-center justify-center shadow-md shrink-0">
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-[#ff5500]" fill="currentColor">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.311L19.41 8.5 12 12.689 4.59 8.5 12 4.311zM4 9.934l7 3.955v7.234l-7-3.955V9.934zm9 11.189v-7.234l7-3.955v7.234l-7 3.955z" />
    </svg>
  </div>
);

export default function CommandCenterDashboard({ 
  onExitToLanding, 
  onOpenOnboarding,
  onOpenAiAssistant,
  initialTab = 'command-center' 
}) {
  const { user, logout, onboardingProfile, updateUserProfile } = useAuth();

  // Active view: 'command-center' | 'transport-system' | 'package-locations' | 'shipments' | 'routes' | 'analytics' | 'messages' | 'settings' | 'create-shipment'
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // NeonDB User Profile state
  const [neonUser, setNeonUser] = useState(() => onboardingProfile || null);

  // Inline & Modal Profile Editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedNameInput, setEditedNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileCityInput, setProfileCityInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDbDetailsModalOpen, setIsDbDetailsModalOpen] = useState(false);
  const [activeSettingModal, setActiveSettingModal] = useState(null);

  useEffect(() => {
    if (onboardingProfile) {
      setNeonUser(onboardingProfile);
    }
  }, [onboardingProfile]);

  // Role: 'REQUESTER' | 'TRANSPORT_PROVIDER'
  const currentRole = useMemo(() => {
    if (neonUser?.role) {
      const lower = neonUser.role.toLowerCase();
      if (lower.includes('carrier') || lower.includes('provider') || lower.includes('fleet') || lower.includes('driver')) {
        return 'TRANSPORT_PROVIDER';
      }
      return 'REQUESTER';
    }
    return 'REQUESTER';
  }, [neonUser]);

  // Real Transport Requests from NeonDB
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Provider Sub-Tab: 'available' | 'my-shipments'
  const [providerSubTab, setProviderSubTab] = useState('available');

  // Shipment Details / Audit Events Modal
  const [selectedRequestForEvents, setSelectedRequestForEvents] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Create Transport Request Form State (Requester)
  const [pickupLoc, setPickupLoc] = useState('');
  const [deliveryLoc, setDeliveryLoc] = useState('');
  const [cargoType, setCargoType] = useState('Electronics & Devices');
  const [cargoDesc, setCargoDesc] = useState('');
  const [weightKg, setWeightKg] = useState('150');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');

  // Shipments Table Filter
  const [shipmentFilterTab, setShipmentFilterTab] = useState('All');

  // Load / Refresh user profile from NeonDB
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await checkUserExistsInNeon(user.uid);
        if (isMounted && res.exists && res.user) {
          setNeonUser(res.user);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch NeonDB user profile:', err);
      }
    }

    loadProfile();
    return () => { isMounted = false; };
  }, [user]);

  // Load Transport Requests from NeonDB with real-time polling
  const loadRequests = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setIsLoadingRequests(true);

    try {
      const data = await fetchTransportRequests(user, 'all');
      setRequests(data || []);
      setActionError(null);
    } catch (err) {
      if (!isSilent) {
        console.error('[Dashboard] Error fetching transport requests:', err);
        setActionError('Unable to sync live transport records from NeonDB');
      }
    } finally {
      if (!isSilent) setIsLoadingRequests(false);
    }
  }, [user]);

  // Initial load + 3.5s silent background polling for multi-user sync
  useEffect(() => {
    loadRequests(false);

    const intervalId = setInterval(() => {
      loadRequests(true);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [loadRequests]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Names & Avatar
  const displayName = neonUser?.name || user?.displayName || 'User';
  const firstName = displayName.trim().split(' ')[0] || 'User';
  const avatarUrl = neonUser?.photo_url || user?.photoURL || '/assets/avatar_profile.jpg';
  const userRoleLabel = currentRole === 'TRANSPORT_PROVIDER' ? 'Transport Provider / Carrier' : 'Requester / Shipper';

  // Normalized shipments for TransportSystemWorkflow & OpenStreetMap Tracker
  const normalizedShipments = useMemo(() => {
    return requests.map((r) => {
      let displayStatus = 'In Transit';
      if (r.status === 'PENDING') displayStatus = 'Pending';
      if (r.status === 'ACCEPTED') displayStatus = 'Accepted';
      if (r.status === 'PICKUP_CONFIRMED' || r.status === 'IN_TRANSIT') displayStatus = 'In Transit';
      if (r.status === 'OUT_FOR_DELIVERY') displayStatus = 'Out for Delivery';
      if (r.status === 'DELIVERED') displayStatus = 'Delivered';
      if (r.status === 'CANCELLED') displayStatus = 'Cancelled';
      if (r.status === 'ON_HOLD') displayStatus = 'On Hold';
      if (r.status === 'EXCEPTION') displayStatus = 'Exception';

      return {
        id: r.tracking_number || `LS-${r.id}`,
        dbId: r.id,
        origin: r.pickup_location,
        destination: r.delivery_location,
        status: displayStatus,
        rawStatus: r.status,
        cargo: r.cargo_type,
        description: r.cargo_description || r.cargo_type,
        weight: r.weight,
        requestedDate: r.requested_date,
        notes: r.notes,
        requesterName: r.requester_name,
        providerName: r.provider_name,
        providerCity: r.provider_city,
        acceptedAt: r.accepted_at,
        deliveredAt: r.delivered_at,
        createdAt: new Date(r.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      };
    });
  }, [requests]);

  // Filtered requests for the Shipments tab
  const filteredShipments = useMemo(() => {
    return requests.filter((r) => {
      const matchTab =
        shipmentFilterTab === 'All' ||
        (shipmentFilterTab === 'Pending' && r.status === 'PENDING') ||
        (shipmentFilterTab === 'In Transit' && ['ACCEPTED', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(r.status)) ||
        (shipmentFilterTab === 'Delivered' && r.status === 'DELIVERED') ||
        (shipmentFilterTab === 'Cancelled' && r.status === 'CANCELLED');

      const matchQuery =
        !searchQuery.trim() ||
        r.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pickup_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.delivery_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cargo_type?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTab && matchQuery;
    });
  }, [requests, shipmentFilterTab, searchQuery]);

  // Derived sets for Provider
  const availableRequests = useMemo(() => {
    return requests.filter(r => r.status === 'PENDING' && r.requester_id !== neonUser?.id);
  }, [requests, neonUser]);

  const myProviderShipments = useMemo(() => {
    return requests.filter(r => r.provider_id === neonUser?.id);
  }, [requests, neonUser]);

  // Derived sets for Requester
  const myRequesterRequests = useMemo(() => {
    return requests.filter(r => r.requester_id === neonUser?.id);
  }, [requests, neonUser]);

  // ─── HANDLER: CREATE TRANSPORT REQUEST (REQUESTER) ────────────────────────
  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLoc.trim() || !deliveryLoc.trim()) return;

    setIsProcessingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const created = await createTransportRequest(user, {
        pickup_location: pickupLoc.trim(),
        delivery_location: deliveryLoc.trim(),
        cargo_type: cargoType,
        cargo_description: cargoDesc.trim() || null,
        weight: weightKg ? `${weightKg} kg` : '50 kg',
        requested_date: preferredDate || null,
        notes: notes.trim() || null,
      });

      // Clear form
      setPickupLoc('');
      setDeliveryLoc('');
      setCargoDesc('');
      setNotes('');
      setPreferredDate('');

      setActionSuccess(`Transport request ${created.tracking_number} created successfully! Waiting for carrier assignment.`);
      await loadRequests(false);
      setActiveTab('command-center');
    } catch (err) {
      console.error('[Dashboard] Error creating transport request:', err);
      setActionError(err.message || 'Failed to create transport request in NeonDB');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ─── HANDLER: ACCEPT REQUEST (TRANSPORT PROVIDER) ─────────────────────────
  const handleAcceptRequest = async (requestId, trackingNumber) => {
    setIsProcessingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await acceptTransportRequest(user, requestId);
      setActionSuccess(`You have successfully accepted shipment ${trackingNumber || ''}! The load is now in your active fleet.`);
      setProviderSubTab('my-shipments');
      await loadRequests(false);
    } catch (err) {
      console.error('[Dashboard] Error accepting request:', err);
      setActionError(err.message || 'Could not accept transport request');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ─── HANDLER: ADVANCE STATUS (TRANSPORT PROVIDER) ─────────────────────────
  const handleUpdateStatus = async (requestId, newStatus, description) => {
    setIsProcessingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateTransportStatus(user, requestId, newStatus, description);
      setActionSuccess(`Shipment status updated to ${newStatus.replace('_', ' ')}.`);
      await loadRequests(false);
    } catch (err) {
      console.error('[Dashboard] Error updating shipment status:', err);
      setActionError(err.message || 'Could not update shipment status');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ─── HANDLER: VIEW AUDIT EVENT HISTORY ────────────────────────────────────
  const handleViewEvents = async (request) => {
    setSelectedRequestForEvents(request);
    setIsLoadingEvents(true);
    try {
      const evts = await fetchShipmentEvents(user, request.id);
      setAuditEvents(evts);
    } catch (err) {
      console.error('[Dashboard] Error loading events:', err);
      setAuditEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // ─── HANDLER: ROLE TOGGLE FOR TESTING PERSPECTIVES ────────────────────────
  const handleRoleSwitch = async (targetRole) => {
    if (!user?.uid || !neonUser?.email) return;
    setIsProcessingAction(true);
    try {
      const updated = await saveUserProfileToNeon({
        firebase_uid: user.uid,
        email: neonUser.email,
        name: neonUser.name,
        country: neonUser.country,
        state: neonUser.state,
        city: neonUser.city,
        role: targetRole,
        photo_url: neonUser.photo_url,
      });
      setNeonUser(updated);
      setActionSuccess(`Operating role changed to ${targetRole === 'TRANSPORT_PROVIDER' ? 'Transport Provider' : 'Requester'}.`);
      await loadRequests(false);
    } catch (err) {
      console.error('[Dashboard] Error switching role:', err);
      setActionError('Could not switch operating role in NeonDB');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: Sleek Dark Navy Brand Nav                                    */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#080f24] text-[#8da2c0] border-r border-[#151f38] flex flex-col justify-between shrink-0 z-30">
        <div>
          {/* Top Brand Logo */}
          <div className="h-18 px-6 flex items-center gap-3 border-b border-[#151f38]">
            <LogiSyncMark />
            <div className="flex items-baseline text-lg font-black tracking-tight text-white">
              <span>LogiSync</span>
              <span className="text-[#ff5500]">PRO</span>
            </div>
          </div>

          {/* User Role Badge Callout */}
          <div className="mx-4 my-3 p-3.5 rounded-2xl bg-[#111a36] border border-[#1a264a] flex items-center justify-between shadow-sm">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
                Operating Role
              </div>
              <div className="text-xs font-bold text-white truncate mt-0.5">
                {currentRole === 'TRANSPORT_PROVIDER' ? 'Transport Provider / Carrier' : 'Requester / Shipper'}
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d68f] shadow-[0_0_8px_#00d68f] shrink-0" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 pt-1 space-y-1.5">
            {[
              { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
              { id: 'ai-assistant', label: 'Gemini Logistics AI', icon: Sparkles, isAi: true, badge: 'BETA' },
              { id: 'api-hub', label: 'API & Interop Hub', icon: Network },
              { id: 'public-transit-map', label: 'Public Map', icon: MapPin },
              { id: 'shipments', label: currentRole === 'TRANSPORT_PROVIDER' ? 'All Loads & Shipments' : 'My Shipments', icon: Package },
              { id: 'transport-system', label: 'Transport System', icon: GitBranch },
              { id: 'package-locations', label: 'Private Fleet Map', icon: Map },
              { id: 'routes', label: 'Routes', icon: Share2 },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'messages', label: 'Messages', icon: Mail },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.isAi && onOpenAiAssistant) {
                      onOpenAiAssistant();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0066ff] text-white shadow-[0_4px_14px_rgba(0,102,255,0.4)]'
                      : 'text-[#8da2c0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isActive ? 'text-white' : item.isAi ? 'text-[#f97316]' : 'text-[#8da2c0]'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff5500] text-white tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Tools & Support */}
        <div className="p-4 border-t border-[#151f38] space-y-2">
          {/* Quick Return to Landing Page */}
          {onExitToLanding && (
            <button
              type="button"
              onClick={onExitToLanding}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#8da2c0] hover:text-white bg-[#0f1733] hover:bg-[#162145] border border-[#1a274e] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Home size={14} />
                <span>Landing Page</span>
              </div>
              <ExternalLink size={12} className="text-[#64748b]" />
            </button>
          )}

          {/* Database Live Connectivity Indicator */}
          <div className="px-3.5 py-2 rounded-xl bg-[#0b132b] border border-[#162248] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#00d68f] animate-pulse shrink-0" />
              <span className="text-[#a5b4fc] truncate font-medium">NeonDB Postgres</span>
            </div>
            <span className="text-[9px] font-mono uppercase text-[#00d68f] font-bold">Synced</span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#080f24]">
        {/* ─── TOP NAVBAR ──────────────────────────────────────────────────────── */}
        <header className="h-18 bg-[#080f24] border-b border-[#151f38] px-8 flex items-center justify-between shrink-0 z-20">
          {/* Search Input Bar with Ctrl K badge */}
          <div className="relative w-80 sm:w-96">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking ID, city, cargo, nodes..."
              className="w-full pl-10 pr-16 py-2.5 text-xs rounded-xl bg-[#101935] border border-[#1d284a] text-white placeholder-[#607290] focus:outline-none focus:border-[#0066ff] transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#64748b] bg-[#0c1329] px-1.5 py-0.5 rounded border border-[#1d284a]">
              Ctrl K
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Direct Gemini AI trigger */}
            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff7a00] hover:bg-[#ff8800] text-slate-950 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                title="Launch LogiSyncPRO Gemini AI Assistant"
              >
                <Sparkles size={14} className="text-slate-950 fill-slate-950" />
                <span className="font-extrabold">Ask Gemini AI</span>
              </button>
            )}

            {/* Live Sync / Refresh button */}
            <button
              type="button"
              onClick={() => loadRequests(false)}
              disabled={isLoadingRequests}
              className="p-2 rounded-xl text-[#8da2c0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Refresh live data from NeonDB"
            >
              <RefreshCw size={16} className={isLoadingRequests ? 'animate-spin text-[#0066ff]' : ''} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2.5 rounded-xl text-[#8da2c0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Bell size={18} />
                {requests.some(r => r.status === 'PENDING') && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080f24]" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0d1633] rounded-2xl border border-[#1e2d58] shadow-2xl p-3 z-50 text-white animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-white pb-2 border-b border-[#18264d]">
                    Live Logistics Telemetry
                  </div>
                  <div className="py-2 text-xs text-[#94a3b8] space-y-2">
                    <div>Connected to NeonDB primary branch.</div>
                    <div className="text-[11px] text-[#64748b]">
                      Total requests: {requests.length} | Pending: {requests.filter(r => r.status === 'PENDING').length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/avatar_profile.jpg';
                    }}
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{displayName}</div>
                  <div className="text-[10px] text-[#8da2c0]">{userRoleLabel}</div>
                </div>
                <ChevronDown size={14} className="text-[#8da2c0]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0d1633] rounded-2xl border border-[#1e2d58] shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#18264d] mb-1">
                    <div className="text-xs font-bold text-white truncate">{displayName}</div>
                    <div className="text-[11px] text-[#94a3b8] truncate">{user?.email || neonUser?.email || 'Authenticated'}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00d68f]" />
                      <span className="text-[10px] text-[#00d68f] font-semibold">{userRoleLabel}</span>
                    </div>
                  </div>

                  {/* Switch Role Option (for testing multi-user flow on single device) */}
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#64748b]">
                    Switch Perspective (Testing)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleRoleSwitch(currentRole === 'TRANSPORT_PROVIDER' ? 'REQUESTER' : 'TRANSPORT_PROVIDER');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#94a3b8] hover:bg-white/5 text-left transition-colors cursor-pointer"
                  >
                    <span>Switch to {currentRole === 'TRANSPORT_PROVIDER' ? 'Requester / Shipper' : 'Transport Provider'}</span>
                    <RefreshCw size={12} className="text-[#0066ff]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#94a3b8] hover:bg-white/5 text-left transition-colors cursor-pointer"
                  >
                    <Settings size={14} />
                    <span>Workspace Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      if (logout) await logout();
                      if (onExitToLanding) onExitToLanding();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 text-left transition-colors cursor-pointer mt-1"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── BANNER ALERTS (ACTION SUCCESS / ERROR) ────────────────────────── */}
        {actionSuccess && (
          <div className="bg-[#05291f] border-b border-[#0d4f3b] px-8 py-2.5 flex items-center justify-between text-xs text-[#34d399] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="hover:text-white text-xs font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {actionError && (
          <div className="bg-[#2a0c12] border-b border-[#5c1622] px-8 py-2.5 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="font-semibold">{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="hover:text-white text-xs font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* ─── TAB CONTENT ROUTER ─────────────────────────────────────────────── */}
        <main className={`flex-1 overflow-hidden ${
          activeTab === 'settings'
            ? 'overflow-y-auto p-6 sm:p-8 bg-[#f0f4f9] text-slate-800'
            : activeTab === 'public-transit-map'
              ? 'p-0 bg-[#030e0b]'
              : activeTab === 'api-hub'
                ? 'p-0 bg-[#030e0b] overflow-y-auto'
                : activeTab === 'transport-system'
                  ? 'overflow-y-auto p-6 sm:p-8 bg-[#030e0b]'
                  : 'overflow-y-auto p-6 sm:p-8 bg-[#04120e]'
        }`}>
          {activeTab === 'command-center' && renderRoleAwareCommandCenter()}
          {activeTab === 'api-hub' && (
            <ApiHubDashboard onBack={() => setActiveTab('command-center')} />
          )}
          {activeTab === 'public-transit-map' && (
            <PublicTransitMap onBack={() => setActiveTab('command-center')} />
          )}
          {activeTab === 'transport-system' && (
            <TransportSystemWorkflow
              shipments={normalizedShipments}
              onNavigateToShipments={() => setActiveTab('shipments')}
              onNavigateToCreateShipment={() => setActiveTab('create-shipment')}
            />
          )}
          {activeTab === 'package-locations' && renderPackageLocationsView()}
          {activeTab === 'shipments' && renderShipmentsView()}
          {activeTab === 'routes' && renderRoutesView()}
          {activeTab === 'analytics' && renderAnalyticsView()}
          {activeTab === 'create-shipment' && renderCreateShipmentView()}
          {activeTab === 'messages' && renderMessagesView()}
          {activeTab === 'settings' && renderSettingsView()}
        </main>
      </div>

      {/* ─── MODAL: SHIPMENT AUDIT EVENT HISTORY ────────────────────────────── */}
      {selectedRequestForEvents && renderAuditEventsModal()}
    </div>
  );

  // ===========================================================================
  // SCREEN 1: ROLE-AWARE COMMAND CENTER
  // ===========================================================================
  function renderRoleAwareCommandCenter() {
    if (currentRole === 'TRANSPORT_PROVIDER') {
      return renderProviderCommandCenter();
    }
    return renderRequesterCommandCenter();
  }

  // ─── 1A. REQUESTER / SHIPPER COMMAND CENTER ────────────────────────────────
  function renderRequesterCommandCenter() {
    const totalCount = myRequesterRequests.length;
    const pendingCount = myRequesterRequests.filter(r => r.status === 'PENDING').length;
    const activeCount = myRequesterRequests.filter(r => ['ACCEPTED', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(r.status)).length;
    const deliveredCount = myRequesterRequests.filter(r => r.status === 'DELIVERED').length;

    return (
      <div className="max-w-7xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#10b981] font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>SHIPPER COORDINATION PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#7ea597]">
              Submit transportation requests and track assigned carriers in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('create-shipment')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Create Transport Request</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">My Total Requests</div>
              <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">Pending Carrier</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">In Transit / Active</div>
              <div className="text-2xl font-black text-[#38bdf8] mt-1">{activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-[#38bdf8] flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">Delivered Transports</div>
              <div className="text-2xl font-black text-[#10b981] mt-1">{deliveredCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#10b981] flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* My Submitted Requests Section */}
        <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0d2f25]">
            <div>
              <h2 className="text-base font-bold text-white">My Transport Requests</h2>
              <p className="text-xs text-[#7ea597]">Live NeonDB state: track carrier assignments & milestones.</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('create-shipment')}
              className="text-xs text-[#10b981] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>+ New Request</span>
            </button>
          </div>

          {myRequesterRequests.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#092b22] text-[#7ea597] flex items-center justify-center mb-3">
                <Package size={26} />
              </div>
              <div className="text-sm font-bold text-white">No transport requests submitted yet</div>
              <p className="text-xs text-[#6e9386] mt-1 max-w-sm">
                Create a transport request with pickup and delivery locations to connect with available carriers in the network.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create-shipment')}
                className="mt-4 px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer"
              >
                Create First Transport Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequesterRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#041611] border border-[#0e352a] hover:border-[#14533e] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#10b981] bg-[#07241d] px-2.5 py-1 rounded-lg border border-[#0e3a2e]">
                        {req.tracking_number}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {req.cargo_type} ({req.weight})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8ab2a3]">
                      <MapPin size={13} className="text-[#10b981] shrink-0" />
                      <span className="text-white font-semibold">{req.pickup_location}</span>
                      <span>&rarr;</span>
                      <span className="text-white font-semibold">{req.delivery_location}</span>
                    </div>

                    {req.cargo_description && (
                      <p className="text-[11px] text-[#6d9487] line-clamp-1">
                        {req.cargo_description}
                      </p>
                    )}
                  </div>

                  {/* Assigned Provider Info or Pending Indicator */}
                  <div className="flex items-center gap-4 shrink-0">
                    {req.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Awaiting Transport Provider</span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-2 rounded-xl bg-[#082920] border border-[#114b3b] text-left">
                        <div className="text-[10px] font-mono uppercase text-[#34d399] font-bold flex items-center gap-1">
                          <Check size={11} strokeWidth={3} />
                          <span>Provider Assigned</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {req.provider_name || 'Assigned Carrier'}
                        </div>
                        <div className="text-[10px] text-[#7ea597]">
                          {req.provider_city ? `${req.provider_city}` : 'Certified Fleet Carrier'}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                        req.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : req.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-blue-950 text-sky-400 border border-blue-700'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleViewEvents(req)}
                        className="block text-[10px] text-[#7ea597] hover:text-[#10b981] mt-1 font-semibold cursor-pointer underline"
                      >
                        Audit Trail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── 1B. TRANSPORT PROVIDER / CARRIER COMMAND CENTER ──────────────────────
  function renderProviderCommandCenter() {
    const availableCount = availableRequests.length;
    const activeCount = myProviderShipments.filter(r => r.status !== 'DELIVERED').length;
    const deliveredCount = myProviderShipments.filter(r => r.status === 'DELIVERED').length;

    return (
      <div className="max-w-7xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#10b981] font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>CARRIER FLEET DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#7ea597]">
              Browse available transport loads, accept assignments, and update transit milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProviderSubTab('available')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                providerSubTab === 'available'
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'bg-[#061e18] text-[#8ab2a3] border border-[#0f382e] hover:text-white'
              }`}
            >
              Available Requests ({availableCount})
            </button>

            <button
              type="button"
              onClick={() => setProviderSubTab('my-shipments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                providerSubTab === 'my-shipments'
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'bg-[#061e18] text-[#8ab2a3] border border-[#0f382e] hover:text-white'
              }`}
            >
              My Active Shipments ({activeCount})
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">Available Marketplace Loads</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{availableCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">My Assigned Shipments</div>
              <div className="text-2xl font-black text-[#38bdf8] mt-1">{activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-[#38bdf8] flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">Delivered Completed</div>
              <div className="text-2xl font-black text-[#10b981] mt-1">{deliveredCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#10b981] flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#061e18] border border-[#0f382e] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7ea597] font-semibold">Fleet Network</div>
              <div className="text-2xl font-black text-white mt-1">Operational</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#10b981] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        {/* ─── TAB 1: AVAILABLE TRANSPORT REQUESTS (MARKETPLACE) ──────────────── */}
        {providerSubTab === 'available' && (
          <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#0d2f25]">
              <div>
                <h2 className="text-base font-bold text-white">Available Transport Requests</h2>
                <p className="text-xs text-[#7ea597]">
                  Real requests submitted by verified shippers in NeonDB. Click Accept to assign the load to your fleet.
                </p>
              </div>
            </div>

            {availableRequests.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#092b22] text-[#7ea597] flex items-center justify-center mb-3">
                  <Truck size={26} />
                </div>
                <div className="text-sm font-bold text-white">No pending transport requests available</div>
                <p className="text-xs text-[#6e9386] mt-1 max-w-sm">
                  When shippers submit transport requests in the network, they will appear here instantly for acceptance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#041611] border border-[#0e352a] hover:border-[#10b981] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-[#10b981] bg-[#07241d] px-2.5 py-1 rounded-lg border border-[#0e3a2e]">
                          {req.tracking_number}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {req.status}
                        </span>
                      </div>

                      <div className="space-y-1 mt-3">
                        <div className="text-xs text-[#7ea597] flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#10b981]" />
                          <span className="text-white font-bold">{req.pickup_location}</span>
                        </div>
                        <div className="text-xs text-[#7ea597] flex items-center gap-1.5 pl-4">
                          <span>&darr;</span>
                          <span className="text-white font-bold">{req.delivery_location}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#0d2a21] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#6b9183] block">Cargo</span>
                          <span className="font-semibold text-white">{req.cargo_type}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6b9183] block">Weight</span>
                          <span className="font-semibold text-white">{req.weight}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6b9183] block">Shipper</span>
                          <span className="font-semibold text-[#a8d3c5]">{req.requester_name || 'Verified Shipper'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6b9183] block">Requested Date</span>
                          <span className="font-semibold text-white">{req.requested_date || 'Immediate'}</span>
                        </div>
                      </div>

                      {req.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#03110d] text-[11px] text-[#8ab2a3] border border-[#09261e]">
                          <span className="font-bold text-[#10b981]">Notes: </span>
                          <span>{req.notes}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleAcceptRequest(req.id, req.tracking_number)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Accept Request</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: MY ACTIVE SHIPMENTS (PROGRESSION WORKFLOW) ─────────────── */}
        {providerSubTab === 'my-shipments' && (
          <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#0d2f25]">
              <div>
                <h2 className="text-base font-bold text-white">My Assigned Shipments</h2>
                <p className="text-xs text-[#7ea597]">
                  Advance shipment status through each lifecycle milestone. Updates sync in real-time to the shipper.
                </p>
              </div>
            </div>

            {myProviderShipments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#092b22] text-[#7ea597] flex items-center justify-center mb-3">
                  <Package size={26} />
                </div>
                <div className="text-sm font-bold text-white">No assigned shipments currently</div>
                <p className="text-xs text-[#6e9386] mt-1 max-w-sm">
                  Go to Available Requests to accept open transport loads from shippers.
                </p>
                <button
                  type="button"
                  onClick={() => setProviderSubTab('available')}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer"
                >
                  Browse Available Loads
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myProviderShipments.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#041611] border border-[#0e352a] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0a2820]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#10b981] bg-[#07241d] px-2.5 py-1 rounded-lg border border-[#0e3a2e]">
                          {req.tracking_number}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {req.cargo_type} ({req.weight})
                        </span>
                        <span className="text-xs text-[#7ea597]">
                          Shipper: <strong className="text-white">{req.requester_name}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#082920] text-[#34d399] border border-[#0f4a3a]">
                          {req.status.replace('_', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleViewEvents(req)}
                          className="text-xs text-[#7ea597] hover:text-white underline cursor-pointer"
                        >
                          View Events
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8ab2a3]">
                      <MapPin size={14} className="text-[#10b981] shrink-0" />
                      <span className="text-white font-semibold">{req.pickup_location}</span>
                      <span>&rarr;</span>
                      <span className="text-white font-semibold">{req.delivery_location}</span>
                    </div>

                    {/* Milestone Progression Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {req.status === 'ACCEPTED' && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(req.id, 'PICKUP_CONFIRMED', 'Carrier driver arrived at origin and confirmed cargo pickup.')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          1. Confirm Cargo Pickup
                        </button>
                      )}

                      {(req.status === 'ACCEPTED' || req.status === 'PICKUP_CONFIRMED') && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(req.id, 'IN_TRANSIT', 'Vehicle in transit along designated corridor route.')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          2. Start In Transit
                        </button>
                      )}

                      {req.status === 'IN_TRANSIT' && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(req.id, 'OUT_FOR_DELIVERY', 'Shipment is with local delivery partner on final mile.')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          3. Out for Delivery
                        </button>
                      )}

                      {(req.status === 'IN_TRANSIT' || req.status === 'OUT_FOR_DELIVERY') && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleUpdateStatus(req.id, 'DELIVERED', 'Cargo delivered successfully. Recipient digital signature confirmed.')}
                          className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          4. Mark Delivered & Complete
                        </button>
                      )}

                      {req.status === 'DELIVERED' && (
                        <span className="text-xs text-[#10b981] font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          <span>Delivered & Verified</span>
                        </span>
                      )}

                      {/* Alternate statuses */}
                      {req.status !== 'DELIVERED' && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={() => handleUpdateStatus(req.id, 'ON_HOLD', 'Shipment temporarily paused per dispatch instructions.')}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Hold
                          </button>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={() => handleUpdateStatus(req.id, 'EXCEPTION', 'Transit exception or weather delay reported.')}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-semibold cursor-pointer"
                          >
                            Report Issue
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: CREATE TRANSPORT REQUEST (FULL SCREEN VIEW)
  // ===========================================================================
  function renderCreateShipmentView() {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create Transport Request
            </h1>
            <p className="text-xs text-[#7ea597] mt-0.5">
              Submit your cargo specifications to the NeonDB logistics network.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('command-center')}
            className="text-xs text-[#7ea597] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Cancel</span>
          </button>
        </div>

        <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleCreateRequestSubmit} className="space-y-4">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                  Pickup Location (Origin) *
                </label>
                <input
                  type="text"
                  required
                  value={pickupLoc}
                  onChange={(e) => setPickupLoc(e.target.value)}
                  placeholder="e.g. Nagpur Logistics Hub, Wardha Rd"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                  Delivery Location (Destination) *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLoc}
                  onChange={(e) => setDeliveryLoc(e.target.value)}
                  placeholder="e.g. Mumbai Port Logistics Terminal, JNPT"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                />
              </div>
            </div>

            {/* Cargo Type & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                  Cargo / Package Type
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white focus:outline-none focus:border-[#10b981] cursor-pointer"
                >
                  <option value="Electronics & Devices">Electronics & Precision Devices</option>
                  <option value="Medical Supplies">Medical Supplies & Pharmaceuticals</option>
                  <option value="Industrial Machinery">Industrial Machinery & Parts</option>
                  <option value="Automotive Components">Automotive Components</option>
                  <option value="Agricultural Freight">Agricultural & Perishable Freight</option>
                  <option value="General Freight">Standard Commercial Freight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="text"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                />
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                Preferred Transport Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white focus:outline-none focus:border-[#10b981]"
              />
            </div>

            {/* Cargo Description */}
            <div>
              <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                Cargo Specifications & Details
              </label>
              <textarea
                rows={2}
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
                placeholder="Specific dimensions, handling instructions, or temperature requirements..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#8eb6a7] mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call recipient 1 hour before arrival at gate 4"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#031410] border border-[#114033] text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0e2c24]">
              <button
                type="button"
                onClick={() => setActiveTab('command-center')}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingAction}
                className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isProcessingAction ? 'Submitting to NeonDB...' : 'Submit Transport Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2: SHIPMENTS TABLE VIEW (PURE REAL NEONDB DATA)
  // ===========================================================================
  function renderShipmentsView() {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Shipments</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#7ea597]">
              Real database records synchronized with NeonDB.
            </p>
          </div>

          {currentRole === 'REQUESTER' && (
            <button
              type="button"
              onClick={() => setActiveTab('create-shipment')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.4} />
              <span>New Request</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setShipmentFilterTab(tab)}
              className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                shipmentFilterTab === tab
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'bg-[#061e18] text-[#8ab2a3] border border-[#0f382e] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shipments Table */}
        <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] overflow-hidden shadow-xl">
          {filteredShipments.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#092b22] text-[#7ea597] flex items-center justify-center mb-3">
                <Package size={26} />
              </div>
              <div className="text-sm font-bold text-white">No transport requests found</div>
              <p className="text-xs text-[#6e9386] mt-1 max-w-sm">
                No real requests match your filter in NeonDB. Create a request or accept a load to see records here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#a0cdbe]">
                <thead className="bg-[#041510] border-b border-[#0f382e] text-[#6d9487] font-semibold">
                  <tr>
                    <th className="py-3.5 px-5">Tracking ID</th>
                    <th className="py-3.5 px-5">Origin &rarr; Destination</th>
                    <th className="py-3.5 px-5">Cargo & Weight</th>
                    <th className="py-3.5 px-5">Shipper</th>
                    <th className="py-3.5 px-5">Carrier</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c2a22]">
                  {filteredShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-white">
                        {s.tracking_number}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{s.pickup_location}</div>
                        <div className="text-[11px] text-[#6d9487] mt-0.5">&rarr; {s.delivery_location}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-white">{s.cargo_type}</div>
                        <div className="text-[11px] text-[#6d9487]">{s.weight}</div>
                      </td>
                      <td className="py-4 px-5 font-medium text-[#c2e4d9]">
                        {s.requester_name || 'Shipper'}
                      </td>
                      <td className="py-4 px-5 font-medium">
                        {s.provider_name ? (
                          <span className="text-[#34d399] font-bold">{s.provider_name}</span>
                        ) : (
                          <span className="text-[#6d9487] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : s.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-sky-400 border border-blue-800'
                        }`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewEvents(s)}
                          className="p-1.5 rounded-lg text-[#7ea597] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="View Events"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: PACKAGE LOCATIONS (OPENSTREETMAP LIVE TRACKER)
  // ===========================================================================
  function renderPackageLocationsView() {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Package Locations</span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase tracking-wider">
                OpenStreetMap Telemetry
              </span>
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#7ea597]">
              Geographic coordinates and transit lines dynamically plotted for your real NeonDB shipments.
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <OpenStreetMapPackageTracker 
            shipments={normalizedShipments} 
            onCreateShipment={() => setActiveTab('create-shipment')} 
          />
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: AUDIT EVENT HISTORY MODAL
  // ===========================================================================
  function renderAuditEventsModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-lg bg-[#07221b] rounded-3xl border border-[#13493b] shadow-2xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0f382e]">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#10b981] font-bold">
                AUDIT TIMELINE & RECORD
              </div>
              <h3 className="text-base font-bold text-white">
                Shipment {selectedRequestForEvents.tracking_number}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRequestForEvents(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="space-y-1 text-xs text-[#8ab2a3]">
            <div>
              <strong className="text-white">Route:</strong> {selectedRequestForEvents.pickup_location} &rarr; {selectedRequestForEvents.delivery_location}
            </div>
            <div>
              <strong className="text-white">Cargo:</strong> {selectedRequestForEvents.cargo_type} ({selectedRequestForEvents.weight})
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#0f382e]">
            <div className="text-xs font-bold text-white mb-3">Chronological Event History</div>

            {isLoadingEvents ? (
              <div className="py-6 text-center text-xs text-[#7ea597]">Loading audit events...</div>
            ) : auditEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7ea597]">No audit events logged yet.</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {auditEvents.map((evt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#041611] border border-[#0d2a21] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#10b981]">
                        {evt.event_type}
                      </span>
                      <span className="text-[10px] text-[#6b9183]">
                        {new Date(evt.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white mt-1">{evt.description}</p>
                    <div className="text-[10px] text-[#7ea597] mt-1">
                      Actor: {evt.actor_name || 'System'} ({evt.actor_role || 'User'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#0f382e] flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedRequestForEvents(null)}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: ROUTES VIEW
  // ===========================================================================
  function renderRoutesView() {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Transit Routes</h1>
          <p className="mt-0.5 text-xs text-[#7ea597]">
            Corridors established by your transport requests in NeonDB.
          </p>
        </div>

        <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-6 shadow-xl">
          {requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7ea597]">
              No active corridors yet. Submit or accept a transport request to establish real freight corridors.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-[#041611] border border-[#0e352a] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{r.pickup_location} &rarr; {r.delivery_location}</div>
                    <div className="text-[11px] text-[#7ea597]">Payload: {r.cargo_type} ({r.weight})</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#07241d] text-[#34d399] border border-[#0f4a3a]">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: ANALYTICS VIEW
  // ===========================================================================
  function renderAnalyticsView() {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Real Network Analytics</h1>
          <p className="mt-0.5 text-xs text-[#7ea597]">
            Live operational metrics computed directly from your NeonDB Postgres database.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#061b15] border border-[#0f382e]">
            <div className="text-xs text-[#7ea597]">Total Database Records</div>
            <div className="text-3xl font-black text-white mt-1">{requests.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#061b15] border border-[#0f382e]">
            <div className="text-xs text-[#7ea597]">Completed Deliveries</div>
            <div className="text-3xl font-black text-[#10b981] mt-1">
              {requests.filter(r => r.status === 'DELIVERED').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-[#061b15] border border-[#0f382e]">
            <div className="text-xs text-[#7ea597]">Active Carriers</div>
            <div className="text-3xl font-black text-[#38bdf8] mt-1">
              {new Set(requests.map(r => r.provider_id).filter(Boolean)).size}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: MESSAGES VIEW
  // ===========================================================================
  function renderMessagesView() {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Telemetry Messages</h1>
          <p className="mt-0.5 text-xs text-[#7ea597]">Direct carrier and shipper event notifications.</p>
        </div>

        <div className="bg-[#061b15] rounded-3xl border border-[#0f382e] p-12 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#092b22] flex items-center justify-center text-[#7ea597] mx-auto mb-3">
            <Mail size={26} />
          </div>
          <div className="text-sm font-bold text-white">Event Log is Up to Date</div>
          <p className="text-xs text-[#6e9386] mt-1 max-w-sm mx-auto">
            Audit events for all shipments are logged in real-time in the NeonDB shipment_events table.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: SETTINGS VIEW (EXACT MATCH TO DESIGN SPECIFICATION)
  // ===========================================================================
  function renderSettingsView() {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb & Header */}
        <div>
          <div className="text-xs font-semibold text-[#2563eb] mb-1">Settings</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workspace & Account Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage your profile, database links, and operational roles.
          </p>
        </div>

        {/* ─── CARD 1: USER PROFILE ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar in soft cyan rounded container */}
          <div className="w-24 h-24 rounded-2xl bg-[#e0f2fe] border border-[#bae6fd] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/avatar_profile.jpg';
              }}
            />
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h2>
              <button
                type="button"
                onClick={() => {
                  setProfileNameInput(displayName);
                  setProfileCityInput(neonUser?.city || 'Nagpur');
                  setIsProfileModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs font-semibold border border-[#bfdbfe] hover:bg-[#dbeafe] transition-colors cursor-pointer shadow-xs"
              >
                <Pencil size={12} className="text-[#2563eb]" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium truncate">
              {neonUser?.email || user?.email || 'vineet.mandhalkar@gmail.com'}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] text-xs font-semibold border border-[#bbf7d0]">
                <User size={13} className="text-[#15803d]" />
                <span>{currentRole === 'TRANSPORT_PROVIDER' ? 'Transport Provider / Carrier' : 'Requester / Shipper'}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin size={14} className="text-slate-400" />
                <span>{neonUser?.city || 'Nagpur'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MIDDLE ROW: OPERATIONAL ROLE & NEON DATABASE ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Operational Role in NeonDB */}
          <div className="bg-[#f0f6ff] border border-blue-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 bg-[#0066ff] text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Database size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Operational Role in NeonDB
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You can test the application from either perspective using your account:
                  </p>
                </div>
              </div>

              {/* 2 Big Choice Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {/* Tile 1: Requester / Shipper */}
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleRoleSwitch('REQUESTER')}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    currentRole === 'REQUESTER'
                      ? 'bg-[#0066ff] text-white shadow-md border border-transparent'
                      : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentRole === 'REQUESTER' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        currentRole === 'REQUESTER' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Requester / Shipper
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        currentRole === 'REQUESTER' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Create & manage shipments
                    </div>
                  </div>
                </button>

                {/* Tile 2: Transport Provider / Carrier */}
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleRoleSwitch('TRANSPORT_PROVIDER')}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    currentRole === 'TRANSPORT_PROVIDER'
                      ? 'bg-[#0066ff] text-white shadow-md border border-transparent'
                      : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentRole === 'TRANSPORT_PROVIDER' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Truck size={18} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        currentRole === 'TRANSPORT_PROVIDER' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Transport Provider / Carrier
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        currentRole === 'TRANSPORT_PROVIDER' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Manage fleet & operations
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Neon PostgreSQL Primary Database */}
          <div className="bg-[#eefcf5] border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-[#00c569] text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Database size={22} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Neon PostgreSQL Primary Database
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-xs font-semibold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse" />
                  <span>Connected</span>
                </span>
              </div>

              {/* Hostname Code Pill */}
              <div className="font-mono text-xs text-slate-700 bg-white/70 py-2.5 px-3.5 rounded-xl border border-emerald-100/80 my-4 select-all break-all">
                ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsDbDetailsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-emerald-200/80 shadow-sm transition-all cursor-pointer w-fit"
              >
                <span>View Database Details</span>
                <ExternalLink size={13} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SECTION: ACCOUNT SETTINGS ─────────────────────────────── */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-4">
            Account Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Tile 1: Profile */}
            <div
              onClick={() => {
                setProfileNameInput(displayName);
                setProfileCityInput(neonUser?.city || 'Nagpur');
                setIsProfileModalOpen(true);
              }}
              className="bg-[#eff6ff] border border-blue-100/80 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#dbeafe] text-[#2563eb] flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Profile</div>
                  <div className="text-[11px] text-slate-500">Name, email, and personal info</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#2563eb] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>

            {/* Tile 2: Security */}
            <div
              onClick={() => setActiveSettingModal('security')}
              className="bg-[#fff7ed] border border-orange-100/80 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Security</div>
                  <div className="text-[11px] text-slate-500">Password and access</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#ea580c] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>

            {/* Tile 3: Integrations */}
            <div
              onClick={() => setActiveSettingModal('integrations')}
              className="bg-[#ecfdf5] border border-emerald-100/80 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#d1fae5] text-[#059669] flex items-center justify-center shrink-0">
                  <Link2 size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Integrations</div>
                  <div className="text-[11px] text-slate-500">Connected services</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#059669] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>

            {/* Tile 4: Notifications */}
            <div
              onClick={() => setActiveSettingModal('notifications')}
              className="bg-[#faf5ff] border border-purple-100/80 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Notifications</div>
                  <div className="text-[11px] text-slate-500">Email and in-app alerts</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#9333ea] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>
          </div>
        </div>

        {/* ─── MODAL: EDIT PROFILE ─────────────────────────────────────────── */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Edit Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!profileNameInput.trim()) return;
                  setIsSavingProfile(true);
                  try {
                    const updated = await updateUserProfile({
                      name: profileNameInput.trim(),
                      city: profileCityInput.trim() || 'Nagpur',
                    });
                    if (updated) {
                      setNeonUser(updated);
                      setActionSuccess('Profile updated successfully in NeonDB.');
                    }
                    setIsProfileModalOpen(false);
                  } catch (err) {
                    console.error('Error updating profile:', err);
                    setActionError('Could not save profile to NeonDB.');
                  } finally {
                    setIsSavingProfile(false);
                  }
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Operational Hub
                  </label>
                  <input
                    type="text"
                    value={profileCityInput}
                    onChange={(e) => setProfileCityInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={neonUser?.email || user?.email || ''}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL: VIEW DATABASE DETAILS ────────────────────────────────── */}
        {isDbDetailsModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 text-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Neon PostgreSQL Primary</h3>
                    <div className="text-[11px] text-slate-500">Live Branch: main | Region: us-east-2</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDbDetailsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Connection Pooler Endpoint
                  </div>
                  <div className="font-mono text-slate-800 mt-1 break-all select-all font-semibold">
                    ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Status</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      Connected & Ready
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">SSL Security</div>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">TLSv1.3 (Required)</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Active Tables Monitored
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['users', 'transport_requests', 'shipment_events', 'fleet_vehicles'].map((table) => (
                      <span key={table} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-700 font-medium">
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDbDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: ACCOUNT SETTING DETAILS (SECURITY / INTEGRATIONS / NOTIFICATIONS) */}
        {activeSettingModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 capitalize">
                  {activeSettingModal} Settings
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSettingModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-4 text-xs text-slate-600 space-y-3">
                {activeSettingModal === 'security' && (
                  <>
                    <p>Security protocol: Multi-factor authentication & session encryption are active.</p>
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-900">
                      <strong>Current Authentication:</strong> Firebase OAuth with NeonDB Postgres identity syncing.
                    </div>
                  </>
                )}
                {activeSettingModal === 'integrations' && (
                  <>
                    <p>Connected third-party logistics API endpoints & gateways:</p>
                    <ul className="space-y-2">
                      <li className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-center justify-between">
                        <span>OpenStreetMap & Nominatim Geocoding</span>
                        <span className="font-bold text-[10px] text-emerald-700 uppercase">Active</span>
                      </li>
                      <li className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-between">
                        <span>Gemini 1.5 Flash AI Optimizer</span>
                        <span className="font-bold text-[10px] text-blue-700 uppercase">Active</span>
                      </li>
                      <li className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 flex items-center justify-between">
                        <span>Neon Serverless Driver (@neondatabase/serverless)</span>
                        <span className="font-bold text-[10px] text-purple-700 uppercase">Active</span>
                      </li>
                    </ul>
                  </>
                )}
                {activeSettingModal === 'notifications' && (
                  <>
                    <p>Configure alerts for shipment state changes and dispatch updates:</p>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span>SMS & In-App Driver Dispatch Alerts</span>
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span>Delivery Milestone Confirmations</span>
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span>Gemini AI Route Congestion Warnings</span>
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSettingModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
