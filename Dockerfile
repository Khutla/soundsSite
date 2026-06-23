# 1. Base Image
FROM node:20-alpine AS base

# 2. Install dependencies only when needed
FROM base AS deps
# Add required libraries for general systems and explicit openssl engines
RUN apk add --no-cache libc6-compat openssl libcrypto3

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies and explicitly generate Prisma Client
RUN npm ci
RUN npx prisma generate

# 3. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Pass dummy database credentials for the build phase
ARG DATABASE_URL="postgresql://mockuser:mockpassword@localhost:5432/mockdb?schema=public"
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

# 4. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL inside the final runner container stage so it is available at runtime
RUN apk add --no-cache openssl libcrypto3 libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD npx prisma db push && node server.js