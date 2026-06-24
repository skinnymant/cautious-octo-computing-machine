# ─── base ───────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY prisma ./prisma

# ─── development ────────────────────────────────────────
FROM base AS development
RUN npm install
RUN npx prisma generate
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

# ─── build ──────────────────────────────────────────────
FROM base AS build
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# ─── production ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
