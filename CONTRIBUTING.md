# Contributing to Lumina Engine

Thank you for your interest in contributing to Lumina! As an orchestration layer for critical AI communications, we maintain high standards for code quality, safety, and performance.

## 🛠️ Development Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/lumina.git
   cd lumina
   ```
2. **Setup Backend**:
   - Python 3.13+
   - `cd backend`
   - `python -m venv venv`
   - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
   - `pip install -r requirements.txt`

3. **Setup Frontend**:
   - Node 20+
   - `cd frontend`
   - `npm install`

## 📏 Coding Standards
- **Python**: Follow PEP 8. Use `flake8` for linting. Ensure all new functions have docstrings.
- **TypeScript**: Use functional components with Hooks. Ensure strict type safety.
- **Security**: Never commit API keys or hardcode sensitive information.

## 🧪 Testing Protocol
All contributions must pass the existing test suite:
```bash
cd backend
pytest --cov=app tests/
```
Frontend:
```bash
cd frontend
npm run lint
npx tsc
```

## 🚀 Pull Request Process
1. Create a descriptive branch: `feature/your-feature-name` or `fix/issue-description`.
2. Ensure CI/CD (GitHub Actions) passes on your branch.
3. Update `CHANGELOG.md` with your changes.
4. Ensure documentation (EN/ES) is updated if your feature changes core engine behavior.

## ⚖️ Safety First
Lumina is a compliance-first engine. Any feature that bypasses guardrails or weakens domain isolation will be rejected.
