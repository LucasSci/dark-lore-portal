# Tabletop Realtime

Servidor dedicado de Socket.io para sustentar a mesa multiplayer do portal.

## Variáveis

```env
PORT=4010
FRONTEND_ORIGIN=https://dark-lore-portal.vercel.app,http://localhost:8080
```

## Uso local

```bash
cd services/tabletop-realtime
npm install
npm run dev
```

## Deploy sugerido

- Railway
- Render
- Fly.io

O frontend Vite continua na Vercel e usa `VITE_TABLETOP_SOCKET_URL` para apontar para este serviço.
