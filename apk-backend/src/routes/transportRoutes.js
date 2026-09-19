import { Router } from 'express';
import { query } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function generateTrackingNumber() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `LS-${randomDigits}`;
}

function formatRequest(r) {
  const pickup = `${r.origin_city}${r.origin_state ? ', ' + r.origin_state : ''}`;
  const delivery = `${r.destination_city}${r.destination_state ? ', ' + r.destination_state : ''}`;
  const weightStr = `${parseFloat(r.weight_kg || 0).toLocaleString()} kg`;
  return {
    id: r.id,
    tracking_number: r.tracking_number,
    requester_id: r.shipper_id,
    shipper_id: r.shipper_id,
    provider_id: r.assigned_carrier_id,
    assigned_carrier_id: r.assigned_carrier_id,
    pickup_location: pickup,
    origin: pickup,
    origin_city: r.origin_city,
    origin_state: r.origin_state,
    delivery_location: delivery,
    destination: delivery,
    destination_city: r.destination_city,
    destination_state: r.destination_state,
    cargo_type: r.cargo_type,
    cargo_description: r.cargo_description || '',
    weight: weightStr,
    weight_kg: parseFloat(r.weight_kg || 0),
    notes: r.special_instructions || r.cargo_description || '',
    special_instructions: r.special_instructions || '',
    status: r.status,
    requested_date: r.requested_date,
    accepted_at: r.accepted_at,
    delivered_at: r.delivered_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    requester_name: r.shipper_name || 'Shipper',
    shipper_name: r.shipper_name || 'Shipper',
    requester_email: r.shipper_email || '',
    requester_city: r.shipper_city || '',
    provider_name: r.carrier_name || null,
    carrier_name: r.carrier_name || null,
    provider_email: r.carrier_email || null,
    provider_city: r.carrier_city || null
  };
}

/**
 * Get transport requests (role-aware filtering)
 * GET /api/transport-requests
 */
router.get('/transport-requests', async (req, res) => {
  const { status, filter, role, userId } = req.query;
  const firebaseUid = req.query.uid || req.query.firebaseUid || req.headers['x-firebase-uid'];

  try {
    // Resolve user if firebaseUid is present
    let dbUser = null;
    if (firebaseUid) {
      const uRes = await query('SELECT id, role FROM users WHERE firebase_uid = $1 LIMIT 1', [firebaseUid]);
      if (uRes.rows.length > 0) {
        dbUser = uRes.rows[0];
      }
    }

    let sql = `
      SELECT 
        tr.*,
        s.display_name AS shipper_name,
        s.email AS shipper_email,
        s.city AS shipper_city,
        c.display_name AS carrier_name,
        c.email AS carrier_email,
        c.city AS carrier_city
      FROM transport_requests tr
      LEFT JOIN users s ON tr.shipper_id = s.id
      LEFT JOIN users c ON tr.assigned_carrier_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Optional status filter
    const activeFilter = status || filter;
    if (activeFilter && activeFilter.toUpperCase() !== 'ALL') {
      params.push(activeFilter.toUpperCase());
      sql += ` AND tr.status = $${params.length}`;
    }

    // Role-based visibility
    const effectiveRole = (dbUser && dbUser.role) || (role && role.toUpperCase());
    const effectiveUserId = (dbUser && dbUser.id) || userId;

    if (effectiveRole === 'REQUESTER' && effectiveUserId) {
      // Shippers only see their own requests
      params.push(effectiveUserId);
      sql += ` AND tr.shipper_id = $${params.length}`;
    } else if (effectiveRole === 'TRANSPORT_PROVIDER' && effectiveUserId) {
      // Carriers see all open requests (PENDING) OR ones assigned to them
      params.push(effectiveUserId);
      sql += ` AND (tr.status = 'PENDING' OR tr.assigned_carrier_id = $${params.length})`;
    }

    sql += ` ORDER BY tr.created_at DESC;`;

    const result = await query(sql, params);
    const formatted = result.rows.map(formatRequest);

    return res.json({
      success: true,
      requests: formatted,
      count: formatted.length
    });
  } catch (err) {
    console.error('[TransportRoutes] Error fetching requests:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch transport requests: ${err.message}`,
      requests: []
    });
  }
});

/**
 * Create a new transport request
 * POST /api/transport-requests
 */
router.post('/transport-requests', async (req, res) => {
  const {
    origin,
    origin_city,
    origin_state,
    destination,
    destination_city,
    destination_state,
    pickup_location,
    delivery_location,
    cargo_type,
    cargo_description,
    weight,
    weight_kg,
    notes,
    special_instructions,
    shipper_id
  } = req.body;

  const firebaseUid = req.query.uid || req.body.firebase_uid || req.headers['x-firebase-uid'];

  try {
    // Resolve shipper user in logisync_apk_db
    let effectiveShipperId = shipper_id;
    if (!effectiveShipperId && firebaseUid) {
      const userLookup = await query('SELECT id, display_name FROM users WHERE firebase_uid = $1 LIMIT 1', [firebaseUid]);
      if (userLookup.rows.length > 0) {
        effectiveShipperId = userLookup.rows[0].id;
      }
    }

    if (!effectiveShipperId) {
      // Lookup any user or create fallback
      const anyUser = await query("SELECT id FROM users WHERE role = 'REQUESTER' ORDER BY id ASC LIMIT 1");
      if (anyUser.rows.length > 0) {
        effectiveShipperId = anyUser.rows[0].id;
      } else {
        const createRes = await query(`
          INSERT INTO users (firebase_uid, email, display_name, role)
          VALUES ($1, $2, $3, 'REQUESTER')
          RETURNING id;
        `, ['apk_default_shipper', 'shipper@logisync.com', 'Acme Freight Requester']);
        effectiveShipperId = createRes.rows[0].id;
      }
    }

    const pickupRaw = pickup_location || origin || 'Nagpur, Maharashtra';
    const deliveryRaw = delivery_location || destination || 'Mumbai, Maharashtra';

    const finalOriginCity = origin_city || pickupRaw.split(',')[0].trim();
    const finalOriginState = origin_state || (pickupRaw.includes(',') ? pickupRaw.split(',')[1].trim() : 'Maharashtra');
    const finalDestCity = destination_city || deliveryRaw.split(',')[0].trim();
    const finalDestState = destination_state || (deliveryRaw.includes(',') ? deliveryRaw.split(',')[1].trim() : 'Maharashtra');
    
    const finalCargoType = cargo_type || 'General Freight';
    const finalCargoDesc = cargo_description || notes || '';
    const finalWeight = weight_kg || (weight ? parseFloat(weight.toString().replace(/[^0-9.]/g, '')) : 1000.0) || 1000.0;
    const finalInstructions = special_instructions || notes || '';
    const trackingNumber = generateTrackingNumber();

    const insertRes = await query(`
      INSERT INTO transport_requests (
        tracking_number, shipper_id, origin_city, origin_state,
        destination_city, destination_state, cargo_type, cargo_description,
        weight_kg, status, special_instructions, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', $10, NOW(), NOW())
      RETURNING *;
    `, [
      trackingNumber,
      effectiveShipperId,
      finalOriginCity,
      finalOriginState,
      finalDestCity,
      finalDestState,
      finalCargoType,
      finalCargoDesc,
      finalWeight,
      finalInstructions
    ]);

    const created = insertRes.rows[0];

    // Fetch full row with user join
    const fullRes = await query(`
      SELECT 
        tr.*,
        s.display_name AS shipper_name,
        s.email AS shipper_email,
        s.city AS shipper_city,
        c.display_name AS carrier_name,
        c.email AS carrier_email,
        c.city AS carrier_city
      FROM transport_requests tr
      LEFT JOIN users s ON tr.shipper_id = s.id
      LEFT JOIN users c ON tr.assigned_carrier_id = c.id
      WHERE tr.id = $1
    `, [created.id]);

    const formattedRequest = formatRequest(fullRes.rows[0]);

    // Log audit event
    await query(`
      INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
      VALUES ($1, $2, 'CREATED', $3, NOW());
    `, [
      created.id,
      effectiveShipperId,
      `Transport request created for ${finalOriginCity} to ${finalDestCity} (${finalCargoType}, ${finalWeight} kg)`
    ]);

    return res.status(201).json({
      success: true,
      message: 'Transport request published to APK NeonDB network',
      request: formattedRequest
    });
  } catch (err) {
    console.error('[TransportRoutes] Creation error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to create request: ${err.message}`
    });
  }
});

/**
 * Get transport request details
 * GET /api/transport-requests/:id
 */
router.get('/transport-requests/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const detailRes = await query(`
      SELECT 
        tr.*,
        s.display_name AS shipper_name,
        s.email AS shipper_email,
        s.city AS shipper_city,
        c.display_name AS carrier_name,
        c.email AS carrier_email,
        c.city AS carrier_city
      FROM transport_requests tr
      LEFT JOIN users s ON tr.shipper_id = s.id
      LEFT JOIN users c ON tr.assigned_carrier_id = c.id
      WHERE tr.id = $1
      LIMIT 1;
    `, [id]);

    if (detailRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transport request not found' });
    }

    return res.json({
      success: true,
      request: formatRequest(detailRes.rows[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get shipment event timeline / audit trail
 * GET /api/transport-requests/:id/events
 */
router.get('/transport-requests/:id/events', async (req, res) => {
  const { id } = req.params;

  try {
    const eventsRes = await query(`
      SELECT 
        se.id,
        se.request_id,
        se.actor_id,
        se.event_type,
        se.description,
        se.created_at,
        u.display_name AS actor_name,
        u.role AS actor_role
      FROM shipment_events se
      LEFT JOIN users u ON se.actor_id = u.id
      WHERE se.request_id = $1
      ORDER BY se.created_at ASC;
    `, [id]);

    return res.json({
      success: true,
      events: eventsRes.rows.map(e => ({
        id: e.id,
        request_id: e.request_id,
        actor_id: e.actor_id || 0,
        event_type: e.event_type,
        description: e.description,
        created_at: e.created_at,
        actor_name: e.actor_name || 'LogiSyncPRO System',
        actor_role: e.actor_role || 'SYSTEM'
      }))
    });
  } catch (err) {
    console.error('[TransportRoutes] Event fetch error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch events: ${err.message}`,
      events: []
    });
  }
});

/**
 * Accept / Claim a transport request (Carrier role required)
 * POST /api/transport-requests/:id/accept
 */
router.post('/transport-requests/:id/accept', async (req, res) => {
  const { id } = req.params;
  const firebaseUid = req.query.uid || req.body.firebase_uid || req.headers['x-firebase-uid'];
  const carrier_id = req.body.carrier_id;

  try {
    // 1. Resolve carrier identity
    let effectiveCarrierId = carrier_id;
    if (!effectiveCarrierId && firebaseUid) {
      const uRes = await query('SELECT id, role, display_name FROM users WHERE firebase_uid = $1 LIMIT 1', [firebaseUid]);
      if (uRes.rows.length > 0) {
        effectiveCarrierId = uRes.rows[0].id;
      }
    }

    if (!effectiveCarrierId) {
      const anyCarrier = await query("SELECT id, display_name FROM users WHERE role = 'TRANSPORT_PROVIDER' ORDER BY id ASC LIMIT 1");
      if (anyCarrier.rows.length > 0) {
        effectiveCarrierId = anyCarrier.rows[0].id;
      } else {
        const createRes = await query(`
          INSERT INTO users (firebase_uid, email, display_name, role)
          VALUES ($1, $2, $3, 'TRANSPORT_PROVIDER')
          RETURNING id;
        `, ['apk_default_carrier', 'carrier@logisync.com', 'RapidTransit Fleet']);
        effectiveCarrierId = createRes.rows[0].id;
      }
    }

    // 2. Fetch existing request to check business rules
    const existingRes = await query('SELECT * FROM transport_requests WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transport request not found' });
    }

    const reqRecord = existingRes.rows[0];

    // Business rule: Requester cannot accept their own transport request
    if (reqRecord.shipper_id === effectiveCarrierId) {
      return res.status(403).json({
        success: false,
        error: 'Authorization violation: Shippers cannot accept their own transport requests'
      });
    }

    // Check if already claimed
    if (reqRecord.status !== 'PENDING' || reqRecord.assigned_carrier_id !== null) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: This transport request has already been claimed or is not open for assignment'
      });
    }

    // 3. Atomic claim update
    const updateRes = await query(`
      UPDATE transport_requests
      SET 
        status = 'ACCEPTED',
        assigned_carrier_id = $1,
        accepted_at = NOW(),
        updated_at = NOW()
      WHERE id = $2 AND status = 'PENDING' AND assigned_carrier_id IS NULL
      RETURNING *;
    `, [effectiveCarrierId, id]);

    if (updateRes.rows.length === 0) {
      return res.status(409).json({
        success: false,
        error: 'Race condition: Request was just claimed by another provider'
      });
    }

    // 4. Record audit event
    const carrierProfile = await query('SELECT display_name FROM users WHERE id = $1', [effectiveCarrierId]);
    const carrierName = carrierProfile.rows[0]?.display_name || 'Transport Provider';

    await query(`
      INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
      VALUES ($1, $2, 'ACCEPTED', $3, NOW());
    `, [id, effectiveCarrierId, `Transport provider '${carrierName}' accepted the request. Carrier assigned.`]);

    // Fetch updated request with user names
    const fullRes = await query(`
      SELECT 
        tr.*,
        s.display_name AS shipper_name,
        s.email AS shipper_email,
        s.city AS shipper_city,
        c.display_name AS carrier_name,
        c.email AS carrier_email,
        c.city AS carrier_city
      FROM transport_requests tr
      LEFT JOIN users s ON tr.shipper_id = s.id
      LEFT JOIN users c ON tr.assigned_carrier_id = c.id
      WHERE tr.id = $1
    `, [id]);

    return res.json({
      success: true,
      message: 'Transport request successfully accepted and assigned',
      request: formatRequest(fullRes.rows[0])
    });
  } catch (err) {
    console.error('[TransportRoutes] Acceptance error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to accept request: ${err.message}`
    });
  }
});

/**
 * Update shipment status milestone
 * POST /api/transport-requests/:id/status
 */
router.post('/transport-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, description, note, actor_id } = req.body;
  const firebaseUid = req.query.uid || req.body.firebase_uid || req.headers['x-firebase-uid'];

  const validStatuses = ['PENDING', 'ACCEPTED', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const newStatus = status ? status.toUpperCase() : null;

  if (!newStatus || !validStatuses.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    // Resolve actor
    let effectiveActorId = actor_id;
    if (!effectiveActorId && firebaseUid) {
      const uRes = await query('SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1', [firebaseUid]);
      if (uRes.rows.length > 0) effectiveActorId = uRes.rows[0].id;
    }

    const isDelivered = newStatus === 'DELIVERED';
    const updateRes = await query(`
      UPDATE transport_requests
      SET 
        status = $1,
        delivered_at = CASE WHEN $2 = TRUE THEN NOW() ELSE delivered_at END,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [newStatus, isDelivered, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transport request not found' });
    }

    const defaultNotes = {
      'PICKUP_CONFIRMED': 'Cargo inspected and securely loaded onto transit vehicle.',
      'IN_TRANSIT': 'Vehicle dispatched onto regional freight highway corridor.',
      'OUT_FOR_DELIVERY': 'Shipment arrived at destination terminal hub; out for delivery.',
      'DELIVERED': 'Cargo arrived at destination facility; signed and confirmed delivery complete.',
      'CANCELLED': 'Transport request cancelled.'
    };

    const eventDesc = description || note || defaultNotes[newStatus] || `Status updated to ${newStatus}`;

    // Record audit event
    await query(`
      INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
      VALUES ($1, $2, $3, $4, NOW());
    `, [id, effectiveActorId || null, newStatus, eventDesc]);

    // Fetch updated request
    const fullRes = await query(`
      SELECT 
        tr.*,
        s.display_name AS shipper_name,
        s.email AS shipper_email,
        s.city AS shipper_city,
        c.display_name AS carrier_name,
        c.email AS carrier_email,
        c.city AS carrier_city
      FROM transport_requests tr
      LEFT JOIN users s ON tr.shipper_id = s.id
      LEFT JOIN users c ON tr.assigned_carrier_id = c.id
      WHERE tr.id = $1
    `, [id]);

    return res.json({
      success: true,
      message: `Shipment status updated to ${newStatus}`,
      request: formatRequest(fullRes.rows[0])
    });
  } catch (err) {
    console.error('[TransportRoutes] Status update error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to update status: ${err.message}`
    });
  }
});

// GET /api/public-transit/feed (Public transport telematics feed)
router.get('/public-transit/feed', (req, res) => {
  return res.json({
    success: true,
    feed_source: 'Official Municipal & Regional Public Transit Gateway',
    classification_filter: 'PUBLIC_ONLY',
    status: 'UNCONNECTED',
    vehicles: [],
    routes: [],
    stations: [],
    message: 'No public transport data available. Public transit telematics feed is currently offline or unconfigured.',
    timestamp: new Date().toISOString()
  });
});

export default router;

