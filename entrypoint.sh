#!/bin/sh
npx prisma@5.22.0 db push --accept-data-loss

# Run the seeding script to insert the admin user securely
npx prisma@5.22.0 db seed

node server.js