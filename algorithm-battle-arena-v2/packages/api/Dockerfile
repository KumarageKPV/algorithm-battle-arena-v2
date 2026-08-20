# Multi-stage build for NestJS API
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Run prisma db push (syncs schema with init.sql-created tables) then start
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]

