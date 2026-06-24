#!/bin/sh
# Force the runtime container to use the local Prisma 5 binary instead of downloading Prisma 7
npx prisma@5.22.0 db push --accept-data-loss
node server.js