#!/bin/sh
set -eu

mkdir -p "${UPLOAD_DIR:-/app/public/uploads}"

./node_modules/.bin/prisma db push

npm run db:seed

exec npm run start