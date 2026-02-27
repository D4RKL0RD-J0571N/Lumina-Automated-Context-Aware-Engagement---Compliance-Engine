#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys the Lumina API to Supabase Edge Functions

echo "🚀 Deploying Lumina API to Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Set environment variables
export SUPABASE_URL="https://iilzvkqggnibzqbqshsc.supabase.co"
export SUPABASE_ANON_KEY="sb_publishable_FJZ_SscHyLcXkxcTZX5y8g_Jg2Gfzhc"

# Deploy the function
echo "📦 Deploying lumina-api function..."
supabase functions deploy lumina-api --no-verify-jwt

# Set environment variables for the function
echo "⚙️ Setting environment variables..."
supabase secrets set LM_STUDIO_URL="https://lashanda-nontelegraphical-ozella.ngrok-free.dev"
supabase secrets set LM_STUDIO_API_KEY="lm-studio"

echo "✅ Deployment complete!"
echo "🌐 API URL: https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api"
echo "🧪 Testing API..."

# Test the API
curl -X GET "https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api/api/v1/ping" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

echo ""
echo "🎉 Supabase Edge Functions deployment completed successfully!"
