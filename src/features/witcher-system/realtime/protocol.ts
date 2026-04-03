import type { SceneEvent, SceneModel } from "@/lib/virtual-tabletop";

export interface TabletopPresenceMember {
  key: string;
  displayName: string;
  role: "gm" | "player";
  joinedAt: string;
}

export interface CampaignJoinPayload {
  campaignId: string;
  sceneId: string | null;
  displayName: string;
  role: "gm" | "player";
}

export interface ScenePatchPayload {
  campaignId: string;
  sceneId: string | null;
  scene: SceneModel;
}

export interface SceneEventPayload {
  campaignId: string;
  sceneId: string | null;
  scene: SceneModel;
  event: SceneEvent;
}
