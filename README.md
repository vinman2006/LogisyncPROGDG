# LogiSyncPRO — Autonomous Enterprise Logistics Platform

> Next-generation multimodal logistics coordination, pharmaceutical cold-chain compliance, real-time OpenStreetMap telemetry, API & GS1 EPCIS 2.0 interoperability hub, and Gemini AI assistant.

---

## 🌐 Live Web App & Mobile Access

Scan the QR code below or visit **[https://logisyncgdg.vercel.app/](https://logisyncgdg.vercel.app/)** to experience LogiSyncPRO live:

<p align="center">
  <a href="https://logisyncgdg.vercel.app/">
    <img src="public/assets/qr_code.png" alt="LogiSyncPRO Live Demo QR Code" width="220" />
  </a>
  <br />
  <sub><b>Scan to launch live platform:</b> <a href="https://logisyncgdg.vercel.app/">logisyncgdg.vercel.app</a></sub>
</p>

---

## 🏛️ System Architecture

LogiSyncPRO uses an isolated, dual-database architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              WEBSITE                                   │
│  React 19 + Tailwind v4 + Vite + Gemini AI Assistant                   │
│  └── API Middleware: /api/* (server/apiMiddleware.js)                  │
│       └── Primary NeonDB Database: neondb                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                            ANDROID APK                                 │
│  Jetpack Compose Android Native App                                    │
│  └── Dedicated Node.js Express REST API (port 5050)                    │
│       └── Separate NeonDB Database: logisync_apk_db                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (`./start.sh`)

Use the unified bash startup script to run any part of the stack:

```bash
# Make script executable (first time only)
chmod +x start.sh

# 1. Start Web Dev Server + integrated Neon API middleware (default)
./start.sh
# or: ./start.sh dev

# 2. Start Both Web Frontend AND Android APK Backend simultaneously
./start.sh --all

# 3. Build and launch standalone production server
./start.sh --prod

# 4. Start only the Android APK backend (port 5050)
./start.sh --apk

# 5. Build and launch with Docker Compose
./start.sh --docker
```

---

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended for Web)

1. Push your code to GitHub/GitLab.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. Vercel will automatically detect `vercel.json` and configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - API Functions: `api/index.js` handling `/api/*`
4. In Vercel Project Settings > **Environment Variables**, add:
   ```env
   DATABASE_URL=postgresql://...
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   VITE_GEMINI_API_KEY=...
   ```
5. Deploy!

---

### Option 2: Standalone Node.js Server (Render / Railway / VPS)

The project includes an optimized production server (`server/prodServer.js`) that serves static assets from `dist/` with immutable caching, SPA routing, and mounts the NeonDB API under `/api/*`.

```bash
# 1. Install production dependencies
npm ci

# 2. Build the production bundle
npm run build

# 3. Start the production server
npm start
```

Default port is `3000` (or `process.env.PORT`). Health check is available at `GET /health` or `GET /healthz`.

---

### Option 3: Docker Container

Deploy using the provided multi-stage `Dockerfile`:

```bash
# Build the Docker image
docker build -t logisyncpro-web:latest .

# Run container with environment variables
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name logisync_web \
  logisyncpro-web:latest
```

Or deploy both web and the APK backend together using Docker Compose:

```bash
docker compose up -d --build
```

---

### Option 4: Netlify

Netlify configuration is pre-configured via `netlify.toml`:
- Publish directory: `dist`
- Build command: `npm run build`
- SPA redirects: handled automatically

---

## 📱 Android APK Backend Deployment (`apk-backend/`)

The APK backend is an independent Node.js Express service located in `/apk-backend`.

To deploy the APK backend on **Render**, **Railway**, or **Fly.io**:
1. Set the root directory to `apk-backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Provide environment variables from `apk-backend/.env.example`:
   ```env
   DATABASE_URL=postgresql://.../logisync_apk_db?sslmode=require
   PORT=5050
   FIREBASE_PROJECT_ID=logisyncgdg
   ```

---

## 🔒 Git Initialization Guide

When you are ready to initialize Git, the configured `.gitignore` ensures secrets (`.env`), build artifacts (`dist/`, `.gradle/`), local keys, and screenshots are never committed:

```bash
# 1. Initialize git repository
git init

# 2. Stage all project files (safe with configured .gitignore)
git add .

# 3. Commit
git commit -m "feat: initial commit - LogiSyncPRO enterprise deployment ready"

# 4. Link to your remote repository
git remote add origin https://github.com/your-username/logisyncpro.git
git branch -M main
git push -u origin main
```

---

## 🔑 Environment Variables Reference

See `.env.example` for web environment variables and `apk-backend/.env.example` for the Android backend.
