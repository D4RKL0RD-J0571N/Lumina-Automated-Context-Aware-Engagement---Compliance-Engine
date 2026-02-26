#!/bin/bash

# Lumina Engine Deployment Script
echo "🚀 Deploying Lumina Engine to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📍 Your app will be available at: https://your-lumina-app.vercel.app"
