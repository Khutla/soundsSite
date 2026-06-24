# 1. Base Image
FROM node:20-alpine AS base

# 2. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl libcrypto3
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# 3. Rebuild the source code
FROM base AS builder
# FIXED: Added OpenSSL to the builder stage so Prisma engines can run cleanly!
RUN apk add --no-cache libc6-compat openssl libcrypto3
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl libcrypto3 libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Wire up the runtime execution script
COPY entrypoint.sh ./
USER root
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]