# 🌕 Lumina: Automated Context-Aware Engagement & Compliance Engine

[**English Version**](#english-documentation) | [**Versión en Español**](#documentación-en-español)

---

## English Documentation

### 📚 Quick Links
- **Technical Guide**: [DOCS-EN.md](./DOCS-EN.md)
- **Contribution Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Project Roadmap**: [ROADMAP.md](./ROADMAP.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **Vercel Setup**: [SETUP-VERCEL.md](./SETUP-VERCEL.md)

**Lumina** is a production-grade prompt orchestration framework designed to scale AI engagement across diverse domains while maintaining strict deterministic safety guardrails and preventing domain bleed-through.

### 🏗️ Technical Architecture
1.  **Three-Tier Prompt Layering (L1/L2/L3)**: Orchestrates identity, domain rules, and real-time context.
2.  **Hybrid Cloud-Local Bridge**: Vercel Serverless (Flask) backend bridging to local LLMs (LM Studio) via ngrok.
3.  **Deterministic Guardrail Engine**: Intercepts and validates LLM outputs for Compliance.
4.  **Bleed-Through Detection**: Prevents cross-domain contamination using dynamic lexicons.
5.  **Optimized Streaming**: Pseudo-streaming SSE support for smooth UI updates even in serverless envs.

### 🚀 Getting Started
```bash
# Option 1: Run with Docker (Local)
docker-compose up --build

# Option 2: Deploy to Vercel (Cloud)
# See SETUP-VERCEL.md for environment config
```

---

## Documentación en Español

### 📚 Enlaces Rápidos
- **Guía Técnica**: [DOCS-ES.md](./DOCS-ES.md)
- **Guía de Contribución**: [CONTRIBUTING-ES.md](./CONTRIBUTING-ES.md)
- **Hoja de Ruta**: [ROADMAP.md](./ROADMAP.md)
- **Registro de Cambios**: [CHANGELOG-ES.md](./CHANGELOG-ES.md)
- **Configuración de Vercel**: [SETUP-VERCEL.md](./SETUP-VERCEL.md)

**Lumina** es un framework de orquestación de prompts de grado de producción, diseñado para escalar la interacción de IA a través de dominios diversos, manteniendo guardrails de seguridad deterministas y evitando la filtración de dominios (bleed-through).

### 🏗️ Arquitectura Técnica
1.  **Orquestación por Capas (L1/L2/L3)**: Gestiona la identidad, las reglas de dominio y el contexto.
2.  **Puente Híbrido Nube-Local**: Backend de Vercel (Flask) conectando con LLMs locales (LM Studio) vía ngrok.
3.  **Motor de Guardrails Determinista**: Intercepta y valida las salidas del LLM para cumplimiento.
4.  **Detección de Filtración (Bleed-Through)**: Evita la contaminación cruzada entre dominios.
5.  **Streaming Optimizado**: Soporte para SSE pseudo-streaming para actualizaciones de UI fluidas.

### 🚀 Primeros Pasos
```bash
# Opción 1: Ejecutar con Docker (Local)
docker-compose up --build

# Opción 2: Desplegar en Vercel (Nube)
# Ver SETUP-VERCEL.md para configuración
```

---

## 🛠️ Tech Stack | Stack Tecnológico
- **Backend**: FastAPI (Local) / Flask (Vercel Serverless).
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Framer Motion.
- **AI Bridge**: LM Studio (Local LLM) + ngrok Tunneling.
- **DevOps**: Docker, GitHub Actions, Vercel CI/CD.

## 🧠 Strategic Motivation | Motivación Estratégica
Lumina solves the "Scale vs. Quality" problem. It treats prompts as data-driven infrastructure, enabling a single engine to power a portfolio of sites with site-specific expertise and unified weight-optimized compliance.

*Lumina resuelve el problema de "Escala vs. Calidad". Trata los prompts como infraestructura basada en datos, permitiendo que un solo motor impulse un portafolio de sitios con experiencia específica y un control de cumplimiento optimizado.*
