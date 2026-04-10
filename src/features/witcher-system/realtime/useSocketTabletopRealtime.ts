import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { LOCAL_SESSION_ID } from "@/lib/local-identities";
import type { PresenceMember, SceneEvent, SceneModel } from "@/lib/virtual-tabletop";

import type {
  CampaignJoinPayload,
  SceneEventPayload,
  ScenePatchPayload,
  TabletopPresenceMember,
} from "./protocol";

interface UseSocketTabletopRealtimeOptions {
  sessionId: string;
  sceneId?: string | null;
  displayName: string;
  role: "gm" | "player";
  onRemoteScene: (scene: SceneModel) => void;
  onRemoteEvent?: (event: SceneEvent) => void;
}

function shouldUseSocket(sessionId: string, socketUrl?: string) {
  return Boolean(socketUrl && sessionId !== LOCAL_SESSION_ID);
}

function normalizePresence(entries: TabletopPresenceMember[] | undefined) {
  return (entries ?? []).map((entry) => ({
    key: entry.key,
    displayName: entry.displayName,
    role: entry.role,
    joinedAt: entry.joinedAt,
  })) satisfies PresenceMember[];
}

export function useSocketTabletopRealtime({
  sessionId,
  sceneId = null,
  displayName,
  role,
  onRemoteScene,
  onRemoteEvent,
}: UseSocketTabletopRealtimeOptions) {
  const socketUrl = useMemo(() => import.meta.env.VITE_TABLETOP_SOCKET_URL as string | undefined, []);
  const socketRef = useRef<Socket | null>(null);
  const [presence, setPresence] = useState<PresenceMember[]>([]);
  const onRemoteSceneRef = useRef(onRemoteScene);
  const onRemoteEventRef = useRef(onRemoteEvent);

  onRemoteSceneRef.current = onRemoteScene;
  onRemoteEventRef.current = onRemoteEvent;

  useEffect(() => {
    if (!shouldUseSocket(sessionId, socketUrl)) {
      setPresence([]);
      return;
    }

    const socket = io(socketUrl!, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("presence:update", (members: TabletopPresenceMember[]) => {
      setPresence(normalizePresence(members));
    });

    socket.on("scene:snapshot", (payload: ScenePatchPayload) => {
      if (payload.campaignId !== sessionId) return;
      onRemoteSceneRef.current(payload.scene);
    });

    socket.on("scene:event", (payload: SceneEventPayload) => {
      if (payload.campaignId !== sessionId) return;

      if (onRemoteEventRef.current) {
        onRemoteEventRef.current(payload.event);
        return;
      }

      onRemoteSceneRef.current(payload.scene);
    });

    const joinPayload: CampaignJoinPayload = {
      campaignId: sessionId,
      sceneId,
      displayName,
      role,
    };

    socket.emit("session:join", joinPayload);

    return () => {
      socket.emit("session:leave", { campaignId: sessionId, sceneId, displayName, role });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [displayName, role, sceneId, sessionId, socketUrl]);

  const broadcastScene = async (scene: SceneModel) => {
    if (!socketRef.current || !shouldUseSocket(sessionId, socketUrl)) {
      return;
    }

    const payload: ScenePatchPayload = {
      campaignId: sessionId,
      sceneId,
      scene,
    };

    socketRef.current.emit("scene:patch", payload);
  };

  const broadcastSceneEvent = async (scene: SceneModel, event: SceneEvent) => {
    if (!socketRef.current || !shouldUseSocket(sessionId, socketUrl)) {
      return;
    }

    const payload: SceneEventPayload = {
      campaignId: sessionId,
      sceneId,
      scene,
      event,
    };

    socketRef.current.emit("scene:event", payload);
  };

  return {
    presence,
    broadcastScene,
    broadcastSceneEvent,
    socketEnabled: shouldUseSocket(sessionId, socketUrl),
  };
}
