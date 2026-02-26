# Contribuyendo a Lumina Engine

¡Gracias por tu interés en contribuir a Lumina! Como capa de orquestación para comunicaciones críticas de IA, mantenemos estándares altos de calidad de código, seguridad y rendimiento.

## 🛠️ Configuración de Desarrollo
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/your-org/lumina.git
   cd lumina
   ```
2. **Configuración del Backend**:
   - Python 3.13+
   - `cd backend`
   - `python -m venv venv`
   - `source venv/bin/activate` (o `venv\Scripts\activate` en Windows)
   - `pip install -r requirements.txt`

3. **Configuración del Frontend**:
   - Node 20+
   - `cd frontend`
   - `npm install`

## 📏 Estándares de Código
- **Python**: Seguir PEP 8. Usar `flake8` para linting. Asegurar que todas las funciones tengan docstrings.
- **TypeScript**: Usar componentes funcionales con Hooks. Asegurar un tipado estricto.
- **Seguridad**: Nunca subir llaves de API o información sensible al repositorio.

## 🧪 Protocolo de Pruebas
Todas las contribuciones deben pasar la suite de pruebas existente:
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

## 🚀 Proceso de Pull Request
1. Crear una rama descriptiva: `feature/nombre-de-tu-caracteristica` o `fix/descripcion-del-problema`.
2. Asegurar que el CI/CD (GitHub Actions) pase en tu rama.
3. Actualizar `CHANGELOG-ES.md` con tus cambios.
4. Asegurar que la documentación (EN/ES) esté actualizada si tu característica cambia el comportamiento central del motor.

## ⚖️ Seguridad Primero
Lumina es un motor orientado al cumplimiento. Cualquier característica que evada los guardrails o debilite el aislamiento de dominios será rechazada.
