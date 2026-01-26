#!/bin/bash
set -e

echo "🚀 Starting Fitness Tracker API..."

# Esperar a que PostgreSQL esté listo
if [ "$WAIT_FOR_DB" = "true" ]; then
  echo "⏳ Waiting for PostgreSQL to be ready..."
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 2
    echo "Still waiting for PostgreSQL..."
  done
  echo "✅ PostgreSQL is ready!"
fi

# Ejecutar migraciones si es necesario
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🗄️ Running database migrations..."
  npm run db:migrate
fi

# Ejecutar seed si es necesario
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

# Ejecutar tests si es modo test
if [ "$NODE_ENV" = "test" ]; then
  echo "🧪 Running tests..."
  npm test
fi

# Ejecutar la aplicación
echo "🎯 Starting Node.js application..."
exec "$@"