import { useEffect, useSyncExternalStore } from "react";

export type PortalNavigationMode = "editorial" | "atlas";
export type PortalMotionIntensity = "ambient" | "interactive" | "atlas";

export interface PortalAtlasFocusState {
  regionSlug?: string;
  subRegionSlug?: string;
  locationSlug?: string;
  stage?: "world" | "region" | "subregion" | "location" | "battlemap";
  title?: string;
  description?: string;
  href?: string;
  updatedAt: string;
}

export interface PortalState {
  navigationMode: PortalNavigationMode;
  motionIntensity: PortalMotionIntensity;
  atlasFocus: PortalAtlasFocusState | null;
}

const STORAGE_KEY = "dark-lore.portal-shell.v1";
const listeners = new Set<() => void>();

const defaultPortalState: PortalState = {
  navigationMode: "editorial",
  motionIntensity: "ambient",
  atlasFocus: null,
};

let portalSnapshot: PortalState | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notify() {
  listeners.forEach((listener) => listener());
}

function readPortalState(): PortalState {
  if (!canUseStorage()) {
    return defaultPortalState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultPortalState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PortalState>;

    return {
      navigationMode:
        parsed.navigationMode === "atlas" ? "atlas" : defaultPortalState.navigationMode,
      motionIntensity:
        parsed.motionIntensity === "interactive" || parsed.motionIntensity === "atlas"
          ? parsed.motionIntensity
          : defaultPortalState.motionIntensity,
      atlasFocus: parsed.atlasFocus
        ? {
            ...parsed.atlasFocus,
            updatedAt: parsed.atlasFocus.updatedAt ?? new Date().toISOString(),
          }
        : null,
    };
  } catch {
    return defaultPortalState;
  }
}

function writePortalState(next: PortalState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!portalSnapshot) {
    portalSnapshot = readPortalState();
  }

  return portalSnapshot;
}

function updatePortalState(partial: Partial<PortalState>) {
  const next: PortalState = {
    ...getSnapshot(),
    ...partial,
  };

  portalSnapshot = next;
  writePortalState(next);
  notify();
}

export function usePortalState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setPortalNavigationMode(
  navigationMode: PortalNavigationMode,
  motionIntensity?: PortalMotionIntensity,
) {
  updatePortalState({
    navigationMode,
    motionIntensity: motionIntensity ?? getSnapshot().motionIntensity,
  });
}

export function setPortalAtlasFocus(atlasFocus: Omit<PortalAtlasFocusState, "updatedAt"> | null) {
  updatePortalState({
    atlasFocus: atlasFocus
      ? {
          ...atlasFocus,
          updatedAt: new Date().toISOString(),
        }
      : null,
  });
}

export function usePortalShellMode(
  navigationMode: PortalNavigationMode,
  motionIntensity: PortalMotionIntensity,
) {
  useEffect(() => {
    setPortalNavigationMode(navigationMode, motionIntensity);
  }, [motionIntensity, navigationMode]);
}
