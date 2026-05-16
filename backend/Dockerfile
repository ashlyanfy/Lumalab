# syntax=docker/dockerfile:1
# ---- Builder ----
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Sanity check: fail fast if the entry file landed in the wrong place.
# (If nest build emits dist/src/main.js, tsconfig.build.json is misconfigured.)
RUN test -f dist/main.js || (echo "❌ dist/main.js missing — TS rootDir leaked, see tsconfig.build.json"; ls -R dist; exit 1)

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
