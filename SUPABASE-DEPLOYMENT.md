# 🚀 Supabase Edge Functions Deployment Guide

## Overview
This guide explains how to deploy the Lumina API to Supabase Edge Functions, replacing the Flask backend that was causing 404 errors on Vercel.

## Architecture Changes
- **Before**: Flask backend on Vercel serverless (❌ Not working)
- **After**: TypeScript Edge Functions on Supabase (✅ Production ready)

## Files Created/Modified

### 1. Supabase Edge Function
- `supabase/functions/lumina-api/index.ts` - Main API logic migrated from Flask
- `supabase/functions/lumina-api/deno.json` - Deno configuration

### 2. Frontend Updates
- `frontend/src/services/api.ts` - Updated to use Supabase URL
- `frontend/.env.production` - New Supabase API URL

### 3. Deployment Configuration
- `vercel.json` - Removed Flask serverless configuration
- `deploy-supabase.sh` - Deployment script

## Manual Deployment Steps

### Step 1: Install Supabase CLI
```bash
# Windows (PowerShell)
iwr -useb https://get.supabase.com/install.ps1 | iex

# macOS
brew install supabase/tap/supabase

# Linux
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
sudo mv supabase /usr/local/bin/
```

### Step 2: Link to Your Supabase Project
```bash
cd "d:\Development\Dialogue Labs Development\Lumina Automated Context-Aware Engagement & Compliance Engine"
supabase link --project-ref iilzvkqggnibzqbqshsc
```

### Step 3: Deploy the Function
```bash
supabase functions deploy lumina-api --no-verify-jwt
```

### Step 4: Set Environment Variables
```bash
supabase secrets set LM_STUDIO_URL="https://lashanda-nontelegraphical-ozella.ngrok-free.dev"
supabase secrets set LM_STUDIO_API_KEY="lm-studio"
```

### Step 5: Test the API
```bash
curl -X GET "https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api/api/v1/ping" \
  -H "Authorization: Bearer sb_publishable_FJZ_SscHyLcXkxcTZX5y8g_Jg2Gfzhc"
```

## API Endpoints

All Flask endpoints have been migrated to Supabase Edge Functions:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ping` | GET | Test API connectivity |
| `/api/v1/domains` | GET | Get domain configurations |
| `/api/v1/compliance/metrics` | GET | Get compliance metrics |
| `/api/v1/compliance/violations` | GET | Get violation logs |
| `/api/v1/orchestrate` | POST | Main AI orchestration endpoint |

## Frontend Configuration

The frontend automatically uses the Supabase Edge Functions URL:
```
https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api
```

## Benefits of This Migration

1. **✅ Fixes 404 Errors**: Native Supabase support
2. **✅ Better Performance**: Edge Functions are optimized for API calls
3. **✅ TypeScript Consistency**: Full TypeScript stack
4. **✅ Better Monitoring**: Supabase built-in monitoring
5. **✅ Scalability**: Edge Functions scale automatically

## Testing After Deployment

1. **Check Dashboard**: Visit https://lumina-engine-two.vercel.app/
2. **Test Chat Widget**: Try sending messages in different domains
3. **Verify Metrics**: Check if compliance metrics load correctly
4. **Test Domain Switching**: Ensure domain switching works

## Troubleshooting

### Function Not Found Error
If you get `{"code":"NOT_FOUND","message":"Requested function was not found"}`, the function hasn't been deployed yet.

### CORS Issues
The Edge Function includes CORS headers. If you still get CORS errors, check the browser console for specific errors.

### Environment Variables
Make sure the LM Studio URL is accessible and the ngrok tunnel is active.

## Next Steps

1. Deploy the Supabase Edge Function using the steps above
2. Test all API endpoints
3. Verify the frontend works with the new backend
4. Remove the old `api/` directory (Flask code)
5. Update documentation

## Support

For issues with Supabase deployment:
- Check Supabase documentation: https://supabase.com/docs/guides/functions
- Verify project URL and keys are correct
- Ensure ngrok tunnel is active for LM Studio
