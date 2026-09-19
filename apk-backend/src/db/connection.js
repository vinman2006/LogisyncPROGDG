import pg from 'pg';

const { Pool } = pg;

// ─── Use DATABASE_URL from environment (set by Render/Railway/etc) ───────────
// NEVER hardcode credentials here. Set DATABASE_URL in your hosting env vars.
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set.');
  console.error('   On Render: Settings → Environment → Add DATABASE_URL');
  console.error('   Locally:   Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

let poolInstance = null;

export function getPool() {
  if (poolInstance) return poolInstance;

  poolInstance = new Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  });

  poolInstance.on('error', (err) => {
    console.error('[APK-NeonDB] Pool error:', err.message);
  });

  console.log('[APK-NeonDB] PostgreSQL pool initialized (Neon).');
  return poolInstance;
}

export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}
