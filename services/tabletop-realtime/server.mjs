import "dotenv/config";

import { createServer } from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.PORT || 4010);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "*";

const httpServer = createServer((_, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "dark-lore-tabletop-realtime" }));
});

const io = new Server(httpServer, {
  cors: {
    origin: frontendOrigin === "*" ? true : frontendOrigin.split(","),
    credentials: true,
  },
});

const scenes = new Map();
const presence = new Map();

function roomFor(campaignId) {
  return `campaign:${campaignId}`;
}

function getPresence(campaignId) {
  return presence.get(campaignId) ?? [];
}

function pushPresence(campaignId, member) {
  const members = getPresence(campaignId).filter((entry) => entry.key !== member.key);
  members.push(member);
  presence.set(campaignId, members);
  return members;
}

function removePresence(campaignId, socketId) {
  const members = getPresence(campaignId).filter((entry) => entry.key !== socketId);
  presence.set(campaignId, members);
  return members;
}

io.on("connection", (socket) => {
  socket.on("session:join", (payload) => {
    socket.data.campaignId = payload.campaignId;
    socket.join(roomFor(payload.campaignId));

    const members = pushPresence(payload.campaignId, {
      key: socket.id,
      displayName: payload.displayName,
      role: payload.role,
      joinedAt: new Date().toISOString(),
    });

    io.to(roomFor(payload.campaignId)).emit("presence:update", members);

    const currentScene = scenes.get(payload.campaignId);
    if (currentScene) {
      socket.emit("scene:snapshot", {
        campaignId: payload.campaignId,
        sceneId: payload.sceneId ?? null,
        scene: currentScene,
      });
    }
  });

  socket.on("session:leave", (payload) => {
    const members = removePresence(payload.campaignId, socket.id);
    io.to(roomFor(payload.campaignId)).emit("presence:update", members);
    socket.leave(roomFor(payload.campaignId));
  });

  socket.on("scene:patch", (payload) => {
    scenes.set(payload.campaignId, payload.scene);
    socket.to(roomFor(payload.campaignId)).emit("scene:snapshot", payload);
  });

  socket.on("scene:event", (payload) => {
    scenes.set(payload.campaignId, payload.scene);
    socket.to(roomFor(payload.campaignId)).emit("scene:event", payload);
  });

  socket.on("disconnect", () => {
    const campaignId = socket.data.campaignId;
    if (!campaignId) return;

    const members = removePresence(campaignId, socket.id);
    io.to(roomFor(campaignId)).emit("presence:update", members);
  });
});

httpServer.listen(port, () => {
  console.log(`dark-lore-tabletop-realtime listening on ${port}`);
});
