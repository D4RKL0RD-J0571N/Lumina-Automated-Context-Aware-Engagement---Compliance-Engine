# 🚀 Lumina Engine Deployment Guide

## Production Architecture

```
┌──────────────────────────────────────┐
│         Vercel Frontend              │
│    (React + Vite + Tailwind)         │
│                                      │
│    Static build served globally      │
└──────────────┬───────────────────────┘
               │  HTTPS
┌──────────────▼───────────────────────┐
│     Supabase Edge Functions          │
│    (TypeScript / Deno Runtime)       │
│                                      │
│    API routing, compliance, domains  │
└──────────────┬───────────────────────┘
               │  ngrok tunnel
┌──────────────▼───────────────────────┐
│       Local LM Studio                │
│    (LLM inference on hardware)       │
└──────────────────────────────────────┘
```

## Prerequisites
- Node.js 18+
- Supabase CLI (for Edge Function deployment)
- Vercel CLI (`npm install -g vercel`)
- GitHub repository with project code

## Quick Deploy

### 1. Frontend → Vercel
```bash
cd frontend
npm install
npm run build
vercel --prod
```

### 2. Backend → Supabase Edge Functions
```bash
supabase login
supabase functions deploy lumina-api --project-ref iilzvkqggnibzqbqshsc --no-verify-jwt
supabase secrets set --project-ref iilzvkqggnibzqbqshsc LM_STUDIO_URL="<your-ngrok-url>"
supabase secrets set --project-ref iilzvkqggnibzqbqshsc LM_STUDIO_API_KEY="lm-studio"
```

## Environment Configuration

### Frontend (`.env.production`)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api` |
| `VITE_AI_MODEL_URL` | Your ngrok URL |
| `VITE_APP_NAME` | `Lumina Engine` |
| `VITE_APP_VERSION` | `1.0.0` |

### Supabase Edge Function Secrets
| Secret | Description |
|--------|-------------|
| `LM_STUDIO_URL` | ngrok tunnel URL to local LM Studio |
| `LM_STUDIO_API_KEY` | API key for LM Studio (default: `lm-studio`) |

## Configuration Files

- `vercel.json` — Vercel deployment: routes all traffic to frontend static build
- `vite.config.ts` — Frontend build optimization with chunk splitting
- `.env.production` — Production environment variables
- `supabase/functions/lumina-api/index.ts` — Edge Function API logic

## Build Optimization

- **Bundle Splitting**: Vendor, UI, and main chunks separated
- **Tree Shaking**: Dead code elimination
- **Minification**: Optimized production builds
- **Font Loading**: Fontsource packages bundled with Vite (Inter, Playfair Display, JetBrains Mono)

## Deployment URLs

- **Frontend**: `https://lumina-engine-two.vercel.app/`
- **Backend API**: `https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api`

## Troubleshooting

### API 404 Errors
The Edge Function accepts paths **with or without** the `/api/v1` prefix. If you see 404s, verify the Edge Function is deployed:
```bash
curl https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api/
```

### Font 404s
Ensure `assetsInclude` in `vite.config.ts` includes `['**/*.woff', '**/*.woff2', '**/*.ttf']` and rebuild.

### Build Issues
```bash
rm -rf frontend/dist
cd frontend && npm run build
```

## Features Deployed

✅ **Sophisticated UI**: Glassmorphism with advanced animations  
✅ **Typography**: Playfair Display + Inter Variable + JetBrains Mono  
✅ **Dashboard**: Real-time compliance metrics visualization  
✅ **Chat Widget**: Streaming with compliance indicators  
✅ **Edge API**: Supabase Edge Functions with path normalization  
✅ **Responsive**: Mobile-first design approach  
