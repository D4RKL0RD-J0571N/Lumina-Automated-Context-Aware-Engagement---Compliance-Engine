# 🌕 Lumina: Automated Context-Aware Engagement & Compliance Engine

[**English Version**](#english-documentation) | [**Versión en Español**](#documentación-en-español)

---

## English Documentation

### 📚 Quick Links
- **Technical Guide**: [DOCS-EN.md](./DOCS-EN.md)
- **Contribution Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Project Roadmap**: [ROADMAP.md](./ROADMAP.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

**Lumina** is a production-grade prompt orchestration framework designed to scale AI engagement across thousands of diverse domains while maintaining strict deterministic safety guardrails and preventing domain bleed-through.

### 🏗️ Technical Architecture
1.  **Three-Tier Prompt Layering (L1/L2/L3)**: Orchestrates identity, domain rules, and real-time context.
2.  **Deterministic Guardrail Engine**: Intercepts and validates LLM outputs for Security, Legal, Medical, and Ad-Policy compliance.
3.  **Bleed-Through Detection**: Prevents cross-domain contamination using dynamic lexicons.
4.  **Audit Trail & Self-Correction**: Persistent logging and automatic retry logic on compliance failure.

### 🚀 Getting Started
```bash
# Clone and run with Docker
docker-compose up --build
```
Or run locally in `backend/` (`uvicorn app.main:app`) and `frontend/` (`npm run dev`).

---

## Documentación en Español

### 📚 Enlaces Rápidos
- **Guía Técnica**: [DOCS-ES.md](./DOCS-ES.md)
- **Guía de Contribución**: [CONTRIBUTING-ES.md](./CONTRIBUTING-ES.md)
- **Hoja de Ruta**: [ROADMAP.md](./ROADMAP.md)
- **Registro de Cambios**: [CHANGELOG-ES.md](./CHANGELOG-ES.md)

**Lumina** es un framework de orquestación de prompts de grado de producción, diseñado para escalar la interacción de IA a través de miles de dominios diversos, manteniendo guardrails de seguridad deterministas y evitando la filtración de dominios (bleed-through).

### 🏗️ Arquitectura Técnica
1.  **Orquestación por Capas (L1/L2/L3)**: Gestiona la identidad, las reglas de dominio y el contexto en tiempo real.
2.  **Motor de Guardrails Determinista**: Intercepta y valida las salidas del LLM para cumplir con normativas de Seguridad, Legales, Médicas y de Políticas de Anuncios.
3.  **Detección de Filtración (Bleed-Through)**: Evita la contaminación cruzada entre dominios mediante léxicos dinámicos.
4.  **Pista de Auditoría y Autocorrección**: Registro persistente y lógica de reintento automático ante fallas de cumplimiento.

### 🚀 Primeros Pasos
```bash
# Clonar y ejecutar con Docker
docker-compose up --build
```
O ejecute localmente en `backend/` (`uvicorn app.main:app`) y `frontend/` (`npm run dev`).

---

## 🛠️ Tech Stack | Stack Tecnológico
- **Backend**: FastAPI (Python 3.13), OpenAI SDK, Pytest, Prometheus.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Framer Motion.
- **DevOps**: Docker, GitHub Actions, Audit Logging.

## 🧠 Strategic Motivation | Motivación Estratégica
Lumina solves the "Scale vs. Quality" problem for digital publishing networks. It treats prompts as data-driven infrastructure, enabling a single engine to power a diverse portfolio of sites with site-specific expertise and unified compliance control.

*Lumina resuelve el problema de "Escala vs. Calidad" para redes de publicación digital. Trata los prompts como infraestructura basada en datos, permitiendo que un solo motor impulse un portafolio diverso de sitios con experiencia específica y un control de cumplimiento unificado.*
