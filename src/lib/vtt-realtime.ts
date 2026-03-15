import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  createBoard,
  createInitialFog,
  type ChatMessage,
  type InitiativeState,
  type PresenceMember,
  type SceneModel,
  type VttLayer,
  type VttPage,
  type VttSceneObject,
} from "@/lib/virtual-tabletop";

type UntypedSupabaseClient = typeof supabase & {
  from: (table: string) => any;
};

const db = supabase as UntypedSupabaseClient;

function makePresenceKey() {
  return `presence-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePresence(presenceState: Record<string, Array<Record<string, unknown>>>) {
  return Object.entries(presenceState).flatMap(([key, entries]) =>
    entries.map((entry) => ({
      key,
      displayName: String(entry.displayName ?? "Jogador"),
      role: entry.role === "gm" ? "gm" : "player",
      joinedAt: String(entry.joinedAt ?? new Date().toISOString()),
    })),
  ) as PresenceMember[];
}

const chatTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function defaultLayerOrder(): VttLayer[] {
  return ["map", "objects", "gm", "walls", "foreground"];
}

function normalizeInitiativeState(value: unknown): InitiativeState {
  const candidate = value as Partial<InitiativeState> | null | undefined;

  if (
    !candidate ||
    !Array.isArray(candidate.entries) ||
    typeof candidate.round !== "number"
  ) {
    return {
      entries: [],
      activeTurnId: null,
      round: 0,
    };
  }

  return {
    entries: (candidate.entries as unknown[])
      .map((entry) => {
        const current = entry as Record<string, unknown>;

        return {
          tokenId: String(current.tokenId ?? ""),
          name: String(current.name ?? "Combatente"),
          team: (current.team === "npc" ? "npc" : "party") as import("@/lib/virtual-tabletop").TokenTeam,
          total: Number(current.total ?? 0),
          bonus: Number(current.bonus ?? 0),
        };
      })
      .filter((entry) => entry.tokenId),
    activeTurnId:
      typeof candidate.activeTurnId === "string" ? candidate.activeTurnId : null,
    round: candidate.round,
  };
}

function normalizeSceneObject(row: Record<string, any>): VttSceneObject {
  const objectType = String(row.object_type ?? "token");
  const position = {
    x: Number(row.position?.x ?? 0),
    y: Number(row.position?.y ?? 0),
  };
  const size = {
    width: Number(row.size?.width ?? 1),
    height: Number(row.size?.height ?? 1),
  };
  const baseObject = {
    id: String(row.id),
    pageId: String(row.page_id),
    position,
    size,
    rotation: Number(row.rotation ?? 0),
    revision: Number(row.revision ?? 1),
  };

  if (objectType === "wall") {
    return {
      ...baseObject,
      objectType: "wall",
      layer: "walls",
      payload: {
        points: Array.isArray(row.payload?.points) ? row.payload.points : [],
        blocksSight: row.payload?.blocksSight !== false,
      },
    };
  }

  if (objectType === "drawing") {
    return {
      ...baseObject,
      objectType: "drawing",
      layer: row.layer === "gm" ? "gm" : "foreground",
      payload: {
        kind:
          row.payload?.kind === "ellipse" || row.payload?.kind === "polygon"
            ? row.payload.kind
            : "rect",
        stroke: String(row.payload?.stroke ?? "#E5E7EB"),
        fill: String(row.payload?.fill ?? "#111827"),
      },
    };
  }

  if (objectType === "light") {
    return {
      ...baseObject,
      objectType: "light",
      layer: "walls",
      payload: {
        radius: Number(row.payload?.radius ?? 0),
        intensity: Number(row.payload?.intensity ?? 0),
        color: String(row.payload?.color ?? "#F8FAFC"),
      },
    };
  }

  return {
    ...baseObject,
    objectType: "token",
    layer: row.layer === "gm" ? "gm" : "objects",
    payload: {
      ...(row.payload ?? {}),
      id: String(row.payload?.id ?? row.id),
      name: String(row.payload?.name ?? "Token"),
      shortName: String(row.payload?.shortName ?? "TK"),
      team: row.payload?.team === "npc" ? "npc" : "party",
      role: String(row.payload?.role ?? "Adventurer"),
      x: position.x,
      y: position.y,
      hp: Number(row.payload?.hp ?? 1),
      hpMax: Number(row.payload?.hpMax ?? row.payload?.hp ?? 1),
      ac: Number(row.payload?.ac ?? 10),
      initiativeBonus: Number(row.payload?.initiativeBonus ?? 0),
      color: String(row.payload?.color ?? "#2563EB"),
      note: String(row.payload?.note ?? ""),
      controlledBy: row.payload?.controlledBy === "gm" ? "gm" : "party",
    },
  };
}

export async function loadSceneSnapshot(sessionId: string) {
  try {
    const [
      { data: pageRows },
      { data: fogRows },
      { data: objectRows },
      { data: chatRows },
      { data: initiativeRows },
    ] = await Promise.all([
      db.from("vtt_pages")
        .select("*")
        .eq("session_id", sessionId)
        .order("updated_at", { ascending: true }),
      db.from("vtt_fog_states")
        .select("*")
        .eq("session_id", sessionId),
      db.from("vtt_scene_objects")
        .select("*")
        .eq("session_id", sessionId),
      db.from("vtt_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(40),
      db.from("vtt_event_log")
        .select("*")
        .eq("session_id", sessionId)
        .eq("event_type", "initiative_snapshot")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (!Array.isArray(pageRows) || pageRows.length === 0) {
      return null;
    }

    const fogByPage = new Map(
      (Array.isArray(fogRows) ? fogRows : []).map((row) => [String(row.page_id), row]),
    );

    const pages: VttPage[] = pageRows.map((row) => {
      const width = Number(row.width ?? 12);
      const height = Number(row.height ?? 8);
      const fogRow = fogByPage.get(String(row.id));

      return {
        id: String(row.id),
        sessionId,
        name: String(row.name ?? "Mapa"),
        gridType: "square",
        gridSize: Number(row.grid_size ?? 72),
        width,
        height,
        backgroundAssetId: row.background_asset_id ? String(row.background_asset_id) : null,
        layerOrder: Array.isArray(row.layer_order)
          ? (row.layer_order as VttLayer[])
          : defaultLayerOrder(),
        cells: createBoard(width, height),
        fog: (fogRow?.fog_state as Record<string, boolean> | undefined) ?? createInitialFog(width, height),
        camera: {
          x: 0,
          y: 0,
          scale: 1,
        },
        wallSegments: [],
        lightSources: [],
        dynamicLighting: false,
        tokenVisionRadius: 6,
      };
    });

    const objects = Array.isArray(objectRows)
      ? objectRows.map((row) => normalizeSceneObject(row as Record<string, any>))
      : [];
    const chatMessages: ChatMessage[] = Array.isArray(chatRows)
      ? chatRows.map((row) => ({
          id: String(row.id),
          author: String(row.author_name ?? "Sistema"),
          tone:
            row.tone === "npc" || row.tone === "roll" || row.tone === "system"
              ? row.tone
              : "party",
          text: String(row.message ?? ""),
          time:
            typeof row.metadata?.time === "string"
              ? row.metadata.time
              : chatTimeFormatter.format(new Date(row.created_at ?? Date.now())),
        }))
      : [];
    const latestInitiative = Array.isArray(initiativeRows) ? initiativeRows[0] : null;
    const initiative = normalizeInitiativeState(latestInitiative?.payload?.initiative);
    const sceneRevision = Math.max(
      ...pages.map((page, index) => Number(pageRows[index]?.revision ?? 1)),
      ...objects.map((object) => object.revision),
      Number(latestInitiative?.revision ?? 1),
      1,
    );

    return {
      sessionId,
      activePageId: pages[0]?.id ?? "",
      pages,
      objects,
      initiative,
      permissions: {
        role: "gm",
        canEditFog: true,
        canEditTokens: true,
        canBroadcast: true,
      },
      revision: sceneRevision,
      boardMode: "move" as const,
      selectedObjectId:
        objects.find((object) => object.objectType === "token")?.id ?? null,
      chatMessages,
      diceHistory: [],
      presence: [],
    } satisfies SceneModel;
  } catch {
    return null;
  }
}

export async function persistSceneSnapshot(scene: SceneModel) {
  const activePage = scene.pages.find((page) => page.id === scene.activePageId);

  if (!activePage) {
    return;
  }

  try {
    await db.from("vtt_pages").upsert({
      id: activePage.id,
      session_id: scene.sessionId,
      name: activePage.name,
      grid_type: activePage.gridType,
      grid_size: activePage.gridSize,
      width: activePage.width,
      height: activePage.height,
      background_asset_id: activePage.backgroundAssetId,
      layer_order: activePage.layerOrder,
      revision: scene.revision,
    });

    await db.from("vtt_fog_states").upsert({
      page_id: activePage.id,
      session_id: scene.sessionId,
      fog_state: activePage.fog,
      revision: scene.revision,
    });

    const sceneObjects = scene.objects
      .filter((object) => object.pageId === activePage.id)
      .map((object) => ({
        id: object.id,
        session_id: scene.sessionId,
        page_id: object.pageId,
        object_type: object.objectType,
        layer: object.layer,
        position: object.position,
        size: object.size,
        rotation: object.rotation,
        payload: object.payload,
        revision: object.revision,
      }));

    if (sceneObjects.length > 0) {
      await db.from("vtt_scene_objects").upsert(sceneObjects);
    }
  } catch {
    // The migration may not be applied in all environments yet. Keep the VTT usable locally.
  }
}

export async function persistChatMessage(sessionId: string, pageId: string, message: ChatMessage) {
  try {
    await db.from("vtt_chat_messages").insert({
      session_id: sessionId,
      page_id: pageId,
      author_name: message.author,
      tone: message.tone,
      message: message.text,
      metadata: {
        local_id: message.id,
        time: message.time,
      },
    });
  } catch {
    // The VTT remains functional even when the chat table is not available yet.
  }
}

export async function persistInitiativeSnapshot(
  sessionId: string,
  pageId: string,
  initiative: InitiativeState,
  revision: number,
) {
  try {
    await db.from("vtt_event_log").insert({
      session_id: sessionId,
      page_id: pageId,
      event_type: "initiative_snapshot",
      revision,
      payload: {
        initiative,
      },
    });
  } catch {
    // Append-only persistence is optional while the migration propagates.
  }
}

interface UseVttRealtimeOptions {
  sessionId: string;
  displayName: string;
  role: "gm" | "player";
  onRemoteScene: (scene: SceneModel) => void;
}

export function useVttRealtime({
  sessionId,
  displayName,
  role,
  onRemoteScene,
}: UseVttRealtimeOptions) {
  const [presence, setPresence] = useState<PresenceMember[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceKeyRef = useRef(makePresenceKey());
  const onRemoteSceneRef = useRef(onRemoteScene);
  const reloadTimerRef = useRef<number | null>(null);

  onRemoteSceneRef.current = onRemoteScene;

  useEffect(() => {
    let active = true;

    const queueReload = () => {
      if (typeof window === "undefined") {
        return;
      }

      if (reloadTimerRef.current !== null) {
        window.clearTimeout(reloadTimerRef.current);
      }

      reloadTimerRef.current = window.setTimeout(() => {
        void loadSceneSnapshot(sessionId).then((nextScene) => {
          if (!active || !nextScene) {
            return;
          }

          onRemoteSceneRef.current(nextScene);
        });
      }, 120);
    };

    const channel = supabase.channel(`vtt:${sessionId}`, {
      config: {
        broadcast: { self: false },
        presence: {
          key: presenceKeyRef.current,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setPresence(normalizePresence(channel.presenceState()));
      })
      .on("broadcast", { event: "scene_snapshot" }, ({ payload }) => {
        if (!payload?.scene) {
          return;
        }

        onRemoteSceneRef.current(payload.scene as SceneModel);
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vtt_pages",
        filter: `session_id=eq.${sessionId}`,
      }, queueReload)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vtt_scene_objects",
        filter: `session_id=eq.${sessionId}`,
      }, queueReload)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vtt_fog_states",
        filter: `session_id=eq.${sessionId}`,
      }, queueReload)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vtt_chat_messages",
        filter: `session_id=eq.${sessionId}`,
      }, queueReload)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vtt_event_log",
        filter: `session_id=eq.${sessionId}`,
      }, queueReload)
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await channel.track({
          displayName,
          role,
          joinedAt: new Date().toISOString(),
        });
        queueReload();
      });

    channelRef.current = channel;

    return () => {
      active = false;

      if (reloadTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }

      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [displayName, role, sessionId]);

  const broadcastScene = async (scene: SceneModel) => {
    if (!channelRef.current) {
      return;
    }

    await channelRef.current.send({
      type: "broadcast",
      event: "scene_snapshot",
      payload: {
        scene,
      },
    });
  };

  return {
    presence,
    broadcastScene,
  };
}
