# ==============================================================================
# Production Dockerfile for LogiSyncPRO Android APK Backend
# ==============================================================================

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5050
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5050

CMD ["node", "src/server.js"]
