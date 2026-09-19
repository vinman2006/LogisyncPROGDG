import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createNeonApiMiddleware } from './apiMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Standard MIME types for frontend assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm'
};

const apiMiddleware = createNeonApiMiddleware();

function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback to index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('LogiSyncPRO: Build output (dist/index.html) not found. Run npm run build first.');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isImmutable = filePath.includes(path.sep + 'assets' + path.sep);

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    };

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Route API requests through Neon API Middleware
  if (pathname.startsWith('/api/')) {
    apiMiddleware(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint Not Found', path: pathname }));
    });
    return;
  }

  // 2. Health check endpoint for container orchestrators / load balancers
  if (pathname === '/healthz' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }

  // 3. Serve static file from dist/ or SPA fallback
  const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If path points to directory root, serve index.html
  if (pathname === '/' || safePath === '.' || safePath === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  serveStaticFile(req, res, filePath);
});

server.listen(PORT, HOST, () => {
  console.log(`[LogiSyncPRO] Production Server listening on http://${HOST}:${PORT}`);
  console.log(`[LogiSyncPRO] Serving static distribution from: ${DIST_DIR}`);
  console.log(`[LogiSyncPRO] NeonDB API endpoints mounted under /api/*`);
});

export default server;
