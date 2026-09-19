import { query } from './connection.js';

export async function runMigrations() {
  console.log('[APK-NeonDB] Initializing database schema for logisync_apk_db...');


  // 1. Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firebase_uid VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      photo_url TEXT,
      country VARCHAR(100) DEFAULT 'India',
      state VARCHAR(100),
      city VARCHAR(100),
      role VARCHAR(50) DEFAULT 'REQUESTER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 2. Transport Requests table
  await query(`
    CREATE TABLE IF NOT EXISTS transport_requests (
      id SERIAL PRIMARY KEY,
      tracking_number VARCHAR(64) UNIQUE NOT NULL,
      shipper_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_carrier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      origin_city VARCHAR(255) NOT NULL,
      origin_state VARCHAR(255),
      origin_country VARCHAR(255) DEFAULT 'India',
      destination_city VARCHAR(255) NOT NULL,
      destination_state VARCHAR(255),
      destination_country VARCHAR(255) DEFAULT 'India',
      cargo_type VARCHAR(100) NOT NULL,
      cargo_description TEXT,
      weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
      status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
      special_instructions TEXT,
      requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      accepted_at TIMESTAMP WITH TIME ZONE,
      delivered_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 3. Shipment Events (Immutable Ledger / Audit Trail) table
  await query(`
    CREATE TABLE IF NOT EXISTS shipment_events (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES transport_requests(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 4. Indexes for high performance
  await query(`
    CREATE INDEX IF NOT EXISTS idx_apk_users_firebase_uid ON users(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_apk_requests_shipper ON transport_requests(shipper_id);
    CREATE INDEX IF NOT EXISTS idx_apk_requests_carrier ON transport_requests(assigned_carrier_id);
    CREATE INDEX IF NOT EXISTS idx_apk_requests_status ON transport_requests(status);
    CREATE INDEX IF NOT EXISTS idx_apk_events_request ON shipment_events(request_id);
  `);

  console.log('[APK-NeonDB] Schema verified and all tables ready in logisync_apk_db.');
}
