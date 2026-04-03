# Arquivo do Continente

Portal dark fantasy de Areias de Zerrikania, reunindo universo, bestiario, cronicas, atlas, mesa e o Oraculo de Luna.

## Licenca

Este repositório agora segue **GPL v3** para acomodar a adaptacao direta de partes do sistema `TheWitcherTRPG-main`. Veja [docs/gpl-attribution.md](docs/gpl-attribution.md) para os detalhes de origem.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Framer Motion
- Supabase
- Gemini Live para o oraculo
- Socket.io dedicado para a mesa multiplayer

## Scripts

```bash
npm install
npm run dev
npm run dev:realtime
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
VITE_TABLETOP_SOCKET_URL=http://localhost:4010
```

## Build mobile

O projeto usa Capacitor com `dist` como `webDir`. Depois do build web:

```bash
npm run build
npx cap sync
```
