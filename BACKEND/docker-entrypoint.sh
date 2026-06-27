#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$INIT_CONTENT" = "true" ]; then
  echo "Importing default content assets..."
  node scripts/import-content.js
fi

echo "Starting API server..."
exec "$@"
