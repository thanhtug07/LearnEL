# Multi-stage production Dockerfile for LingoPeak

# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/services ./src/services
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/server.ts ./server.ts

# Run as non-root user for container security
USER node

EXPOSE 3000

# Health check against production endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["npx", "tsx", "server.ts"]
