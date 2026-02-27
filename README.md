# 🌕 Lumina: Automated Context-Aware Engagement & Compliance Engine

[**English**](#what-is-lumina) | [**Español**](DOCS-ES.md)

---

## What is Lumina?

Lumina is an **AI orchestration engine** that brokers communications between Large Language Models and specialized business domains. It ensures AI responses remain **safe**, **domain-isolated**, and **contextually grounded** through a tripartite prompt architecture and real-time compliance guardrails.

### Key Capabilities
- **Multi-Domain Personas**: Each domain (e.g., fishing.com, householdmanuals.com) gets a tailored AI persona with strict context isolation
- **Guardrail Engine**: Deterministic keyword-based scanner for security, legal, medical, and ad-policy violations
- **Bleed-Through Detection**: Prevents cross-domain context contamination
- **PII Redaction**: Automatic scrubbing of emails, phone numbers, and credit card data
- **Streaming AI**: Real-time token streaming with compliance checks on every response

## Architecture

```
┌─────────────────────────────────────────┐
│       React + Vite Frontend (Vercel)    │
├─────────────────────────────────────────┤
│    Supabase Edge Functions (Deno/TS)    │
│    Routing, compliance, domain logic    │
├─────────────────────────────────────────┤
│    Local LM Studio via ngrok tunnel     │
│    LLM inference on local hardware      │
└─────────────────────────────────────────┘
```

## Live Demo

- **Frontend**: https://lumina-engine-two.vercel.app/
- **API**: https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api

## Quick Start

### Prerequisites
- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Frontend
```bash
cd frontend
npm install
npm run dev        # Development at localhost:3000
```

### Backend (local development)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Tests
```bash
# Backend tests
cd backend && pytest tests/ -v

# Frontend tests
cd frontend && npm test
```

## Project Structure

```
├── frontend/           # React + Vite + Tailwind dashboard
│   ├── src/services/   # API client layer
│   ├── src/components/ # Reusable UI components
│   └── src/config/     # App constants and fallback data
├── backend/            # FastAPI backend (local dev)
│   ├── app/api/v1/     # REST endpoints
│   ├── app/core/       # Guardrail, audit, config
│   └── tests/          # pytest test suite
├── supabase/functions/ # Edge Functions (production API)
│   └── lumina-api/     # Main API function
└── docs/               # DEPLOYMENT, DOCS-EN, DOCS-ES, etc.
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/domains` | GET | List all domain persona configurations |
| `/compliance/metrics` | GET | Compliance pass rate and violation counters |
| `/compliance/violations` | GET | Recent violation log entries |
| `/orchestrate` | POST | Primary AI engagement (supports streaming) |
| `/guardrail/scan` | POST | Direct compliance scan without LLM |
| `/ping` | GET | Health check and LM Studio connectivity |

## Documentation

- [Technical Docs (English)](DOCS-EN.md)
- [Technical Docs (Español)](DOCS-ES.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Supabase Deployment](SUPABASE-DEPLOYMENT.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)

## License

See [LICENSE](LICENSE) for details.
