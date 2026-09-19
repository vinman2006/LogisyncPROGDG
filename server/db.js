import pg from 'pg';
const { Pool } = pg;

const HOSTNAME = 'ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech';
let poolInstance = null;

export async function getPool() {
  if (poolInstance) return poolInstance;

  // Try DNS resolution to get IP directly (helps in some environments)
  // Falls back to hostname if unavailable (e.g. Vercel serverless)
  let hostToUse = HOSTNAME;
  try {
    const dns = await import('node:dns/promises');
    const addresses = await dns.resolve4(HOSTNAME);
    if (addresses && addresses.length > 0) {
      hostToUse = addresses[0];
    }
  } catch (dnsErr) {
    // DNS resolution not available or hostname resolves fine — use hostname directly
    hostToUse = HOSTNAME;
  }

  poolInstance = new Pool({
    host: hostToUse,
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_qoNFpJ2zm3Hj',
    database: 'neondb',
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
      servername: HOSTNAME,
    },
  });

  poolInstance.on('error', (err) => {
    console.warn('[NeonDB] Pool error:', err.message);
    poolInstance = null; // Reset so next request gets a fresh pool
  });

  return poolInstance;
}

export async function query(text, params) {
  const pool = await getPool();
  return pool.query(text, params);
}

/**
 * Ensure all multi-user application tables exist in NeonDB
 */
export async function ensureAllTables() {
  const pool = await getPool();

  // 1. Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firebase_uid VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      photo_url TEXT,
      country VARCHAR(100),
      state VARCHAR(100),
      city VARCHAR(100),
      role VARCHAR(100) DEFAULT 'REQUESTER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Transport Requests table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transport_requests (
      id SERIAL PRIMARY KEY,
      tracking_number VARCHAR(50) UNIQUE NOT NULL,
      requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      pickup_location VARCHAR(255) NOT NULL,
      delivery_location VARCHAR(255) NOT NULL,
      cargo_type VARCHAR(100) NOT NULL,
      cargo_description TEXT,
      weight VARCHAR(50) NOT NULL,
      requested_date DATE,
      notes TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMP WITH TIME ZONE,
      delivered_at TIMESTAMP WITH TIME ZONE
    );
    CREATE INDEX IF NOT EXISTS idx_tr_status ON transport_requests(status);
    CREATE INDEX IF NOT EXISTS idx_tr_requester ON transport_requests(requester_id);
    CREATE INDEX IF NOT EXISTS idx_tr_provider ON transport_requests(provider_id);
  `);

  // 3. Shipment Audit Events table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipment_events (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES transport_requests(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id),
      event_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_se_request ON shipment_events(request_id);
  `);

  console.log('[NeonDB] Database tables verified: users, transport_requests, shipment_events');
}

export const ensureUsersTable = ensureAllTables;

/**
 * Lookup user in NeonDB by Firebase UID
 */
export async function getUserByFirebaseUid(firebaseUid) {
  if (!firebaseUid) return null;
  const pool = await getPool();
  const res = await pool.query(
    `SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1`,
    [firebaseUid]
  );
  return res.rows[0] || null;
}

/**
 * Lookup user in NeonDB by internal ID
 */
export async function getUserById(id) {
  if (!id) return null;
  const pool = await getPool();
  const res = await pool.query(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
}

/**
 * Insert or update user profile in NeonDB
 */
export async function saveUserProfile({
  firebase_uid,
  email,
  name,
  photo_url,
  country,
  state,
  city,
  role,
}) {
  if (!firebase_uid || !email) {
    throw new Error('firebase_uid and email are required to save profile');
  }

  // Normalize role to canonical constants
  let canonicalRole = 'REQUESTER';
  if (role) {
    const lower = role.toLowerCase();
    if (
      lower.includes('carrier') ||
      lower.includes('provider') ||
      lower.includes('fleet') ||
      lower.includes('driver') ||
      role === 'TRANSPORT_PROVIDER'
    ) {
      canonicalRole = 'TRANSPORT_PROVIDER';
    } else {
      canonicalRole = 'REQUESTER';
    }
  }

  const pool = await getPool();
  const queryText = `
    INSERT INTO users (
      firebase_uid,
      email,
      name,
      photo_url,
      country,
      state,
      city,
      role,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
      country = COALESCE(EXCLUDED.country, users.country),
      state = COALESCE(EXCLUDED.state, users.state),
      city = COALESCE(EXCLUDED.city, users.city),
      role = COALESCE(EXCLUDED.role, users.role),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    firebase_uid,
    email,
    name || null,
    photo_url || null,
    country || null,
    state || null,
    city || null,
    canonicalRole,
  ];

  const res = await pool.query(queryText, values);
  return res.rows[0];
}

/**
 * Create a new Transport Request in NeonDB
 */
export async function createTransportRequest({
  requester_id,
  pickup_location,
  delivery_location,
  cargo_type,
  cargo_description,
  weight,
  requested_date,
  notes,
}) {
  if (!requester_id || !pickup_location || !delivery_location) {
    throw new Error('requester_id, pickup_location, and delivery_location are required');
  }

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generate readable tracking number: LS-XXXXXX
    const trackingNumber = `LS-${Math.floor(100000 + Math.random() * 900000)}`;

    const insertReqQuery = `
      INSERT INTO transport_requests (
        tracking_number,
        requester_id,
        pickup_location,
        delivery_location,
        cargo_type,
        cargo_description,
        weight,
        requested_date,
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
      RETURNING *;
    `;

    const reqValues = [
      trackingNumber,
      requester_id,
      pickup_location.trim(),
      delivery_location.trim(),
      cargo_type || 'Standard Freight',
      cargo_description || null,
      weight || '50 kg',
      requested_date || null,
      notes || null,
    ];

    const reqRes = await client.query(insertReqQuery, reqValues);
    const newRequest = reqRes.rows[0];

    // Log initial creation event in shipment_events
    await client.query(
      `
      INSERT INTO shipment_events (request_id, actor_id, event_type, description)
      VALUES ($1, $2, 'REQUEST_CREATED', $3);
    `,
      [
        newRequest.id,
        requester_id,
        `Transport request created for ${pickup_location} to ${delivery_location}`,
      ]
    );

    await client.query('COMMIT');
    return newRequest;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Query transport requests with joined requester and provider profile information
 */
export async function getTransportRequests({
  user_id,
  role,
  filter = 'all',
}) {
  const pool = await getPool();

  let whereClause = '';
  const params = [];

  if (filter === 'available') {
    // Only pending requests from other users
    params.push(user_id);
    whereClause = `WHERE tr.status = 'PENDING' AND tr.requester_id != $1`;
  } else if (filter === 'my_requests') {
    // Requests created by the caller
    params.push(user_id);
    whereClause = `WHERE tr.requester_id = $1`;
  } else if (filter === 'my_shipments') {
    // Shipments accepted/carried by the caller
    params.push(user_id);
    whereClause = `WHERE tr.provider_id = $1`;
  } else {
    // Role-dependent default
    if (role === 'TRANSPORT_PROVIDER') {
      params.push(user_id);
      whereClause = `WHERE tr.provider_id = $1 OR tr.status = 'PENDING'`;
    } else {
      params.push(user_id);
      whereClause = `WHERE tr.requester_id = $1`;
    }
  }

  const queryText = `
    SELECT 
      tr.*,
      req.name AS requester_name,
      req.email AS requester_email,
      req.city AS requester_city,
      req.state AS requester_state,
      req.country AS requester_country,
      req.photo_url AS requester_photo,
      prov.name AS provider_name,
      prov.email AS provider_email,
      prov.city AS provider_city,
      prov.state AS provider_state,
      prov.country AS provider_country,
      prov.photo_url AS provider_photo
    FROM transport_requests tr
    LEFT JOIN users req ON tr.requester_id = req.id
    LEFT JOIN users prov ON tr.provider_id = prov.id
    ${whereClause}
    ORDER BY tr.updated_at DESC;
  `;

  const res = await pool.query(queryText, params);
  return res.rows;
}

/**
 * Get single transport request by ID
 */
export async function getTransportRequestById(requestId) {
  const pool = await getPool();
  const queryText = `
    SELECT 
      tr.*,
      req.name AS requester_name,
      req.email AS requester_email,
      req.city AS requester_city,
      req.state AS requester_state,
      req.country AS requester_country,
      req.photo_url AS requester_photo,
      prov.name AS provider_name,
      prov.email AS provider_email,
      prov.city AS provider_city,
      prov.state AS provider_state,
      prov.country AS provider_country,
      prov.photo_url AS provider_photo
    FROM transport_requests tr
    LEFT JOIN users req ON tr.requester_id = req.id
    LEFT JOIN users prov ON tr.provider_id = prov.id
    WHERE tr.id = $1
    LIMIT 1;
  `;

  const res = await pool.query(queryText, [requestId]);
  return res.rows[0] || null;
}

/**
 * Atomically accept a transport request as a Transport Provider
 */
export async function acceptTransportRequest(requestId, providerId) {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Select with lock to avoid race conditions
    const checkRes = await client.query(
      `SELECT * FROM transport_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Transport request not found' };
    }

    const request = checkRes.rows[0];

    if (request.requester_id === providerId) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'You cannot accept your own transport request',
      };
    }

    if (request.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'This request has already been accepted by another provider or is no longer available',
      };
    }

    const updateRes = await client.query(
      `
      UPDATE transport_requests
      SET status = 'ACCEPTED',
          provider_id = $1,
          accepted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'PENDING'
      RETURNING *;
    `,
      [providerId, requestId]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Another provider just accepted this request.',
      };
    }

    const updated = updateRes.rows[0];

    // Log acceptance event
    await client.query(
      `
      INSERT INTO shipment_events (request_id, actor_id, event_type, description)
      VALUES ($1, $2, 'REQUEST_ACCEPTED', 'Transport provider accepted the request. Carrier assigned.');
    `,
      [requestId, providerId]
    );

    await client.query('COMMIT');
    return { success: true, request: updated };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update shipment status through its lifecycle
 */
export async function updateTransportRequestStatus({
  requestId,
  actorId,
  status,
  description,
}) {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkRes = await client.query(
      `SELECT * FROM transport_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Transport request not found' };
    }

    const request = checkRes.rows[0];

    // Authorization check
    const isProvider = request.provider_id === actorId;
    const isRequester = request.requester_id === actorId;

    if (!isProvider && !isRequester) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Unauthorized: You are not a party to this transport request',
      };
    }

    // Requester can only cancel before acceptance
    if (status === 'CANCELLED' && isRequester) {
      if (request.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Cannot cancel request once it has been accepted by a carrier',
        };
      }
    }

    // Only provider can advance transport lifecycle
    const providerStatuses = [
      'PICKUP_CONFIRMED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'ON_HOLD',
      'EXCEPTION',
    ];

    if (providerStatuses.includes(status) && !isProvider) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Only the assigned transport provider can update transit milestones',
      };
    }

    let extraUpdate = '';
    const updateParams = [status, requestId];

    if (status === 'DELIVERED') {
      extraUpdate = ', delivered_at = CURRENT_TIMESTAMP';
    }

    const updateRes = await client.query(
      `
      UPDATE transport_requests
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
          ${extraUpdate}
      WHERE id = $2
      RETURNING *;
    `,
      updateParams
    );

    const updated = updateRes.rows[0];

    // Log status change event
    const eventDesc =
      description || `Shipment status updated to ${status.replace('_', ' ')}`;

    await client.query(
      `
      INSERT INTO shipment_events (request_id, actor_id, event_type, description)
      VALUES ($1, $2, 'STATUS_UPDATED', $3);
    `,
      [requestId, actorId, eventDesc]
    );

    await client.query('COMMIT');
    return { success: true, request: updated };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get audit timeline events for a transport request
 */
export async function getShipmentEvents(requestId) {
  const pool = await getPool();
  const queryText = `
    SELECT 
      se.*,
      u.name AS actor_name,
      u.role AS actor_role
    FROM shipment_events se
    LEFT JOIN users u ON se.actor_id = u.id
    WHERE se.request_id = $1
    ORDER BY se.created_at ASC;
  `;

  const res = await pool.query(queryText, [requestId]);
  return res.rows;
}
