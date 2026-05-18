# Evaluador de Contenido — Regálame tu Historia

Herramienta de análisis estratégico de piezas de contenido antes de publicar.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Gemini 1.5 Flash API

## Deployment en Vercel

### Paso 1 — Subir a GitHub
1. Crea un repositorio nuevo en github.com (privado)
2. Sube estos archivos al repositorio

### Paso 2 — Conectar con Vercel
1. Ve a vercel.com y conecta tu cuenta de GitHub
2. Importa el repositorio
3. En "Environment Variables" agrega:
   - Name: `GEMINI_API_KEY`
   - Value: tu API key de Google AI Studio
4. Deploy

### Paso 3 — Usar la app
Abre la URL que te da Vercel y empieza a evaluar piezas.

## Variables de entorno requeridas
```
GEMINI_API_KEY=tu_api_key_de_gemini
```

## Desarrollo local
```bash
npm install
cp .env.example .env.local
# Agrega tu GEMINI_API_KEY en .env.local
npm run dev
```
