# Arquivo do Continente

Portal dark fantasy de Areias de Zerrikania, reunindo universo, bestiario, cronicas, atlas, mesa e o Oraculo de Luna.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Framer Motion
- Supabase
- Gemini Live para o oraculo

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

## Estrutura principal

- `src/pages`: rotas do portal
- `src/components`: shell, UI e modulos de produto
- `src/oracle-luna`: experiencia standalone do oraculo
- `src/lib`: conteudo, estado e integracoes
- `public/reference`: assets visuais e referencias importadas

## Variaveis de ambiente

Crie um `.env` com as chaves necessarias para os recursos ao vivo:

```env
VITE_GEMINI_API_KEY=
VITE_GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
VITE_GEMINI_LIVE_VOICE=Zephyr
```

## Build mobile

O projeto usa Capacitor com `dist` como `webDir`. Depois do build web:

```bash
npm run build
npx cap sync
```
