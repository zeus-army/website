#!/bin/bash

echo "🐕⚡ Starting Zeus Army Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start Redis in Docker
echo "🔴 Starting Redis..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 3

# Check if Redis is running
if docker ps | grep -q zeus-army-redis; then
  echo "✅ Redis is running on port 6379"
else
  echo "❌ Failed to start Redis"
  exit 1
fi

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "Run these commands in separate terminals:"
echo ""
echo "  Terminal 1 - API Server:"
echo "  cd /Users/gotoalberto/zeus-army-website && vercel dev --listen 3001"
echo ""
echo "  Terminal 2 - React App:"
echo "  cd /Users/gotoalberto/zeus-army-website && npm start"
echo ""
echo "The app will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:3001"
echo ""
echo "To stop Redis:"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
