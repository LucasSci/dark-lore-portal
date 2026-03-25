import { useEffect, useRef, useState } from "react";

import { generateSecureShortId } from "./utils";

import { supabase } from "@/integrations/supabase/client";
import { resolveBattlemapPublicUrl } from "@/lib/vtt-assets";
import {
  applySceneEvent,
  createBoard,
  createInitialFog,
  type ChatMessage,
  type InitiativeState,
  type PresenceMember,
  type SceneEvent,
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
  return `presence-${generateSecureShortId()}`;
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

  if (objectType === "map-decal") {
    return {
      ...baseObject,
      objectType: "map-decal",
      layer: row.layer === "foreground" ? "foreground" : "map",
      payload: {
        assetId: typeof row.payload?.assetId === "string" ? row.payload.assetId : null,
        imageUrl: typeof row.payload?.imageUrl === "string" ? row.payload.imageUrl : null,
        opacity: Number(row.payload?.opacity ?? 1),
        blendMode:
          row.payload?.blendMode === "multiply" || row.payload?.blendMode === "screen"
            ? row.payload.blendMode
            : "normal",
      },
    };
  }

  if (objectType === "measurement") {
    return {
      ...baseObject,
      objectType: "measurement",
      layer: row.layer === "gm" ? "gm" : "foreground",
      payload: {
        from: {
          x: Number(row.payload?.from?.x ?? 0),
          y: Number(row.payload?.from?.y ?? 0),
        },
        to: {
          x: Number(row.payload?.to?.x ?? 0),
          y: Number(row.payload?.to?.y ?? 0),
        },
        distance: Number(row.payload?.distance ?? 0),
        unit: String(row.payload?.unit ?? "ft"),
        label: String(row.payload?.label ?? ""),
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
      { data: assetRows },
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
      db.from("vtt_page_assets")
        .select("*")
        .eq("session_id", sessionId),
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
    const assetsById = new Map(
      (Array.isArray(assetRows) ? assetRows : []).map((row) => [String(row.id), row as Record<string, any>]),
    );

    const pages: VttPage[] = pageRows.map((row) => {
      const width = Number(row.width ?? 12);
      const height = Number(row.height ?? 8);
      const fogRow = fogByPage.get(String(row.id));
      const backgroundAssetId = row.background_asset_id ? String(row.background_asset_id) : null;
      const backgroundAsset = backgroundAssetId ? assetsById.get(backgroundAssetId) : null;
      const backgroundFrame =
        row.background_frame &&
        typeof row.background_frame === "object" &&
        !Array.isArray(row.background_frame)
          ? {
              x: Number(row.background_frame.x ?? 0),
              y: Number(row.background_frame.y ?? 0),
              width: Number(row.background_frame.width ?? width),
              height: Number(row.background_frame.height ?? height),
            }
          : backgroundAssetId
            ? {
                x: 0,
                y: 0,
                width,
                height,
              }
            : null;

      return {
        id: String(row.id),
        sessionId,
        name: String(row.name ?? "Mapa"),
        region: String(row.region ?? row.name ?? "Mapa"),
        gridType: "square",
        gridSize: Number(row.grid_size ?? 72),
        width,
        height,
        backgroundAssetId,
        backgroundAssetUrl:
          resolveBattlemapPublicUrl(
            (backgroundAsset?.board_variant_path as string | undefined)
              ?? (backgroundAsset?.original_path as string | undefined),
          ) ?? null,
        backgroundFrame,
        layerOrder: Array.isArray(row.layer_order)
          ? (row.layer_order as VttLayer[])
          : defaultLayerOrder(),
        connections: Array.isArray(row.connections)
          ? row.connections.map((connection: Record<string, any>) => ({
              id: String(connection.id ?? generateSecureShortId()),
              edge:
                connection.edge === "north" ||
                connection.edge === "east" ||
                connection.edge === "south" ||
                connection.edge === "west"
                  ? connection.edge
                  : "east",
              label: String(connection.label ?? "Passagem"),
              targetPageId: String(connection.targetPageId ?? ""),
              spawn: {
                x: Number(connection.spawn?.x ?? 0),
                y: Number(connection.spawn?.y ?? 0),
              },
            }))
          : [],
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
  if (!scene.pages.length) {
    return;
  }

  try {
    await Promise.all([
      ...scene.pages.map((page) => persistScenePage(scene.sessionId, page, scene.revision)),
      ...scene.pages.map((page) => persistFogState(scene.sessionId, page.id, page.fog, scene.revision)),
      persistSceneObjects(scene.sessionId, scene.objects),
    ]);
  } catch {
    // The migration may not be applied in all environments yet. Keep the VTT usable locally.
  }
}

export async function persistScenePage(sessionId: string, page: VttPage, revision: number) {
  await db.from("vtt_pages").upsert({
    id: page.id,
    session_id: sessionId,
    name: page.name,
    region: page.region,
    grid_type: page.gridType,
    grid_size: page.gridSize,
    width: page.width,
    height: page.height,
    background_asset_id: page.backgroundAssetId,
    background_frame: page.backgroundFrame,
    layer_order: page.layerOrder,
    connections: page.connections,
    revision,
  });
}

export async function persistFogState(
  sessionId: string,
  pageId: string,
  fog: Record<string, boolean>,
  revision: number,
) {
  await db.from("vtt_fog_states").upsert({
    page_id: pageId,
    session_id: sessionId,
    fog_state: fog,
    revision,
  });
}

export async function persistSceneObjects(sessionId: string, objects: VttSceneObject[]) {
  if (!objects.length) {
    return;
  }

  await db.from("vtt_scene_objects").upsert(
    objects.map((object) => ({
      id: object.id,
      session_id: sessionId,
      page_id: object.pageId,
      object_type: object.objectType,
      layer: object.layer,
      position: object.position,
      size: object.size,
      rotation: object.rotation,
      payload: object.payload,
      revision: object.revision,
    })),
  );
}

export async function removeSceneObject(sessionId: string, objectId: string) {
  await db
    .from("vtt_scene_objects")
    .delete()
    .eq("session_id", sessionId)
    .eq("id", objectId);
}

export async function persistSceneEventLog(event: SceneEvent) {
  await db.from("vtt_event_log").insert({
    session_id: event.sessionId,
    page_id: event.pageId,
    actor_id: event.actorId,
    event_type: event.type.toLowerCase(),
    revision: event.revision,
    payload: event.payload,
  });
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
  onRemoteEvent?: (event: SceneEvent) => void;
}

export function useVttRealtime({
  sessionId,
  displayName,
  role,
  onRemoteScene,
  onRemoteEvent,
}: UseVttRealtimeOptions) {
  const [presence, setPresence] = useState<PresenceMember[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceKeyRef = useRef(makePresenceKey());
  const onRemoteSceneRef = useRef(onRemoteScene);
  const onRemoteEventRef = useRef(onRemoteEvent);
  const reloadTimerRef = useRef<number | null>(null);

  onRemoteSceneRef.current = onRemoteScene;
  onRemoteEventRef.current = onRemoteEvent;

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
      .on("broadcast", { event: "scene_event" }, ({ payload }) => {
        const event = payload?.event as SceneEvent | undefined;

        if (!event) {
          return;
        }

        if (onRemoteEventRef.current) {
          onRemoteEventRef.current(event);
          return;
        }

        void loadSceneSnapshot(sessionId).then((nextScene) => {
          if (nextScene) {
            onRemoteSceneRef.current(nextScene);
          }
        });
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

  const broadcastSceneEvent = async (scene: SceneModel, event: SceneEvent) => {
    if (!channelRef.current) {
      return;
    }

    await channelRef.current.send({
      type: "broadcast",
      event: "scene_event",
      payload: {
        scene: applySceneEvent(scene, event),
        event,
      },
    });
  };

  return {
    presence,
    broadcastScene,
    broadcastSceneEvent,
  };
}
