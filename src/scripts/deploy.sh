#!/bin/bash

# Script de deploy para producción

echo "🚀 Starting deployment..."

# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# 3. Run database migrations (si las tienes)
# echo "🗄️ Running migrations..."
# npm run db:migrate

# 4. Seed database if needed
# echo "🌱 Seeding database..."
# npm run db:seed

# 5. Run tests
echo "🧪 Running tests..."
npm test

# 6. Build project if needed (TypeScript, etc.)
# echo "🔨 Building project..."
# npm run build

# 7. Restart application
echo "🔄 Restarting application..."
pm2 restart fitness-tracker-api || pm2 start src/app.js --name fitness-tracker-api

echo "✅ Deployment completed!"