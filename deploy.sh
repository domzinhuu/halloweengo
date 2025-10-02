#!/bin/bash

# Deploy script for Halloween Bingo
echo "🎃 Starting Halloween Bingo deployment..."

# Navigate to project directory
cd /home/$USER/halloweengo

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and restart backend
echo "🔧 Building backend..."
cd backend
docker build -t halloweengo-backend .
docker stop halloweengo-backend 2>/dev/null || true
docker rm halloweengo-backend 2>/dev/null || true
docker run -d --name halloweengo-backend -p 5002:5002 --restart unless-stopped halloweengo-backend

# Build and restart frontend
echo "🎨 Building frontend..."
cd ../frontend
docker build -t halloweengo-frontend .
docker stop halloweengo-frontend 2>/dev/null || true
docker rm halloweengo-frontend 2>/dev/null || true
docker run -d --name halloweengo-frontend -p 3000:3000 --restart unless-stopped halloweengo-frontend

# Skip image cleanup to avoid affecting other applications

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://your-server:3000"
echo "🔧 Backend: http://your-server:5002"
