import {
  ensureAllTables,
  getUserByFirebaseUid,
  saveUserProfile,
  createTransportRequest,
  getTransportRequests,
  getTransportRequestById,
  acceptTransportRequest,
  updateTransportRequestStatus,
  getShipmentEvents,
} from './db.js';
import { CONNECTORS_CATALOG, normalizePayload } from './apiHubNormalizer.js';

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBXppd8sr30_QoSvUK-61HnaT4qVDXOpzs';
const tokenCache = new Map(); // token -> { uid, exp }

/**
 * Verify Firebase ID Token or extract user UID safely
 */
async function resolveAuthenticatedUid(req) {
  const authHeader = req.headers['authorization'] || '';
  const fallbackUid = req.headers['x-firebase-uid'] || null;

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      // Check cache first
      const cached = tokenCache.get(token);
      if (cached && cached.exp > Date.now()) {
        return cached.uid;
      }

      try {
        // Verify with Google Identity Toolkit
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          }
        );

        if (response.ok) {
          const payload = await response.json();
          const verifiedUid = payload.users?.[0]?.localId;
          if (verifiedUid) {
            tokenCache.set(token, { uid: verifiedUid, exp: Date.now() + 5 * 60 * 1000 });
            return verifiedUid;
          }
        }
      } catch (err) {
        console.warn('[NeonDB API] Token verification warning:', err.message);
      }
    }
  }

  // Fallback to direct UID header if provided
  return fallbackUid;
}

export function createNeonApiMiddleware() {
  // Ensure DB schema on startup
  ensureAllTables().catch((err) => {
    console.warn('[NeonDB API] Startup table check note:', err.message);
  });

  return async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Only handle /api/* endpoints
    if (!url.pathname.startsWith('/api/')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-firebase-uid');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    // Helper to parse JSON body
    const parseBody = () =>
      new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(body || '{}'));
          } catch (e) {
            reject(new Error('Invalid JSON payload'));
          }
        });
        req.on('error', reject);
      });

    try {
      // ───────────────────────────────────────────────────────────────────────
      // 1. USER PROFILE ENDPOINTS
      // ───────────────────────────────────────────────────────────────────────

      // GET /api/user/profile?uid=<firebase_uid>
      if (req.method === 'GET' && url.pathname === '/api/user/profile') {
        const uid = url.searchParams.get('uid') || (await resolveAuthenticatedUid(req));
        if (!uid) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing user identification' }));
        }

        const user = await getUserByFirebaseUid(uid);
        res.statusCode = 200;
        return res.end(JSON.stringify({ exists: Boolean(user), user }));
      }

      // POST /api/user/profile
      if (req.method === 'POST' && url.pathname === '/api/user/profile') {
        const data = await parseBody();
        const callerUid = (await resolveAuthenticatedUid(req)) || data.firebase_uid;

        if (!callerUid || !data.email) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({ error: 'firebase_uid and email are required to save profile' })
          );
        }

        const saved = await saveUserProfile({
          ...data,
          firebase_uid: callerUid,
        });

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, user: saved }));
      }

      // ───────────────────────────────────────────────────────────────────────
      // 2. TRANSPORT REQUESTS ENDPOINTS
      // ───────────────────────────────────────────────────────────────────────

      // Extract current user for authenticated transport operations
      const authUid =
        url.searchParams.get('uid') ||
        (await resolveAuthenticatedUid(req));
      const currentUser = authUid ? await getUserByFirebaseUid(authUid) : null;

      // GET /api/transport-requests
      // Query parameters: filter = 'all' | 'available' | 'my_requests' | 'my_shipments'
      if (req.method === 'GET' && url.pathname === '/api/transport-requests') {
        if (!currentUser) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'Authentication required' }));
        }

        const filter = url.searchParams.get('filter') || 'all';
        const requests = await getTransportRequests({
          user_id: currentUser.id,
          role: currentUser.role,
          filter,
        });

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, requests }));
      }

      // POST /api/transport-requests (Create new Transport Request)
      if (req.method === 'POST' && url.pathname === '/api/transport-requests') {
        if (!currentUser) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'Authentication required to create transport request' }));
        }

        const body = await parseBody();
        const {
          pickup_location,
          delivery_location,
          cargo_type,
          cargo_description,
          weight,
          requested_date,
          notes,
        } = body;

        if (!pickup_location || !delivery_location) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({ error: 'pickup_location and delivery_location are required' })
          );
        }

        const newRequest = await createTransportRequest({
          requester_id: currentUser.id,
          pickup_location,
          delivery_location,
          cargo_type: cargo_type || 'Standard Freight',
          cargo_description: cargo_description || null,
          weight: weight || '50 kg',
          requested_date: requested_date || null,
          notes: notes || null,
        });

        res.statusCode = 201;
        return res.end(JSON.stringify({ success: true, request: newRequest }));
      }

      // POST /api/transport-requests/:id/accept (Provider accepts request)
      const acceptMatch = url.pathname.match(/^\/api\/transport-requests\/(\d+)\/accept$/);
      if (req.method === 'POST' && acceptMatch) {
        if (!currentUser) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'Authentication required' }));
        }

        const requestId = parseInt(acceptMatch[1], 10);
        const result = await acceptTransportRequest(requestId, currentUser.id);

        if (!result.success) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: result.error }));
        }

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, request: result.request }));
      }

      // POST /api/transport-requests/:id/status (Update shipment lifecycle status)
      const statusMatch = url.pathname.match(/^\/api\/transport-requests\/(\d+)\/status$/);
      if (req.method === 'POST' && statusMatch) {
        if (!currentUser) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'Authentication required' }));
        }

        const requestId = parseInt(statusMatch[1], 10);
        const body = await parseBody();
        const { status, description } = body;

        if (!status) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Status is required' }));
        }

        const result = await updateTransportRequestStatus({
          requestId,
          actorId: currentUser.id,
          status,
          description,
        });

        if (!result.success) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: result.error }));
        }

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, request: result.request }));
      }

      // GET /api/transport-requests/:id/events (Shipment event audit history)
      const eventsMatch = url.pathname.match(/^\/api\/transport-requests\/(\d+)\/events$/);
      if (req.method === 'GET' && eventsMatch) {
        const requestId = parseInt(eventsMatch[1], 10);
        const events = await getShipmentEvents(requestId);

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, events }));
      }

      // GET /api/transport-requests/:id (Single transport request)
      const singleMatch = url.pathname.match(/^\/api\/transport-requests\/(\d+)$/);
      if (req.method === 'GET' && singleMatch) {
        const requestId = parseInt(singleMatch[1], 10);
        const request = await getTransportRequestById(requestId);

        if (!request) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Transport request not found' }));
        }

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, request }));
      }

      // GET /api/public-transit/feed (Official Public Transport Network & Vehicles Feed)
      if (req.method === 'GET' && (url.pathname === '/api/public-transit/feed' || url.pathname === '/api/public-transit')) {
        // Enforce strict PUBLIC classification: only official government buses, public buses, metro, and public trains.
        // Private company vehicles (trucks, vans, private fleets) are strictly prohibited from this endpoint.
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          feed_source: 'Official Municipal & Regional Public Transit Gateway',
          classification_filter: 'PUBLIC_ONLY',
          status: 'UNCONNECTED',
          vehicles: [],
          routes: [],
          stations: [],
          message: 'No public transport data available. Public transit telematics feed is currently offline or unconfigured.',
          timestamp: new Date().toISOString()
        }));
      }

      // =======================================================================
      // LOGISYNCPRO API HUB & INTEROPERABILITY ENDPOINTS
      // =======================================================================

      // GET /api/hub/connectors (List available connectors & integration schemas)
      if (req.method === 'GET' && url.pathname === '/api/hub/connectors') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          hub: 'LogiSyncPRO Universal Interoperability Engine',
          architecture: 'Vendor Source -> Connector -> Canonical Model -> NeonDB Ledger',
          supported_protocols: ['REST', 'JSON-LD', 'GS1 EPCIS 2.0', 'ANSI X12 EDI', 'HL7 FHIR', 'MQTT', 'Webhooks'],
          connectors: CONNECTORS_CATALOG
        }));
      }

      // POST /api/hub/normalize (Normalize heterogeneous vendor payload to Canonical Model)
      if (req.method === 'POST' && url.pathname === '/api/hub/normalize') {
        res.setHeader('Content-Type', 'application/json');
        const body = await parseBody();
        const { connector_id, payload } = body;

        if (!connector_id || !payload) {
          res.statusCode = 400;
          return res.end(JSON.stringify({
            success: false,
            error: 'connector_id and payload are required'
          }));
        }

        const result = normalizePayload(connector_id, payload);
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          hub_version: '2.0.0-canonical',
          result
        }));
      }

      // GET /api/hub/keys (Developer API Keys)
      if (req.method === 'GET' && url.pathname === '/api/hub/keys') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          keys: [
            {
              id: 'key_live_pharma_sap_01',
              name: 'Apollo Pharmacy SAP Ingestion Key',
              prefix: 'lsp_live_pharma_...88a1',
              connector: 'pharmacy-erp',
              permissions: ['ingest:shipments', 'read:tracking'],
              created_at: '2026-09-01T10:00:00Z',
              last_used: '2026-09-19T07:15:00Z',
              status: 'ACTIVE'
            },
            {
              id: 'key_live_fleetx_tms_02',
              name: 'FleetX Highway Telematics Feed',
              prefix: 'lsp_live_tms_...71c4',
              connector: 'transport-tms',
              permissions: ['ingest:telemetry', 'update:milestones'],
              created_at: '2026-09-05T14:30:00Z',
              last_used: '2026-09-19T07:22:00Z',
              status: 'ACTIVE'
            },
            {
              id: 'key_live_epcis_gateway_03',
              name: 'GS1 EPCIS 2.0 Repository Bridge',
              prefix: 'lsp_live_epcis_...99b2',
              connector: 'gs1-epcis',
              permissions: ['ingest:epcis_events', 'query:events'],
              created_at: '2026-09-10T08:15:00Z',
              last_used: '2026-09-19T07:18:35Z',
              status: 'ACTIVE'
            }
          ]
        }));
      }

      // POST /api/hub/keys (Generate new API Key)
      if (req.method === 'POST' && url.pathname === '/api/hub/keys') {
        res.setHeader('Content-Type', 'application/json');
        const body = await parseBody();
        const { name, connector } = body;
        const randomHex = Math.random().toString(16).substring(2, 10);
        const newKey = {
          id: `key_${randomHex}`,
          name: name || 'Custom ERP Integration Key',
          key: `lsp_live_${randomHex}_${Math.random().toString(36).substring(2, 15)}`,
          connector: connector || 'custom-rest-api',
          permissions: ['ingest:shipments', 'read:tracking', 'ingest:events'],
          created_at: new Date().toISOString(),
          status: 'ACTIVE'
        };

        res.statusCode = 201;
        return res.end(JSON.stringify({ success: true, key: newKey }));
      }

      // Endpoint not found
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'API endpoint not found' }));
    } catch (err) {
      console.error('[NeonDB API] Internal error:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    }
  };
}
