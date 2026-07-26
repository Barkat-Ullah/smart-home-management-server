
# # ─── STAGE 1: Dependencies ───
# FROM node:20-slim AS deps
# WORKDIR /app
# RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# COPY package*.json ./
# COPY prisma ./prisma 
# RUN npm ci 

# # ─── STAGE 2: Build ───
# FROM node:20-slim AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/prisma ./prisma
# COPY package*.json ./
# COPY tsconfig.json ./
# COPY src ./src
# RUN npm run build
# RUN npm prune --production

# # ─── STAGE 3: Production (Modern ESM Best Practice) ───
# FROM node:20-slim AS production
# WORKDIR /app
# RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./

# EXPOSE 5000
# ENV NODE_ENV=production

# CMD ["node", "dist/server.js"]

# ─── STAGE 1: Dependencies ───
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma 
RUN npm ci 
RUN npx prisma generate

# ─── STAGE 2: Build ───
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --production

# ─── STAGE 3: Production ───
FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]