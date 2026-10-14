import type {
  EncyclopediaEntry,
  EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";

export const CURRENT_PROTAGONISTS = [
  "Alaric Dorne",
  "Sorrow Noxmourn",
  "Hauz Darnen",
] as const;

const META_PATTERN = /\b(?:conte[uú]do presente neste arquivo|veio do pdf|pdf|site|repositorio|automatic[oa]s?|demo|mockup|placeholder|anexo)\b/gi;

function normalizeSpacing(text: string) {
  return text.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

export function sanitizeImmersiveText(text: string) {
  const sanitized = text.replace(META_PATTERN, "");

  return normalizeSpacing(sanitized);
}

export function sanitizeImmersiveTimeline(
  events: EncyclopediaTimelineEvent[],
): EncyclopediaTimelineEvent[] {
  return events.map((event) => ({
    ...event,
    title: sanitizeImmersiveText(event.title),
    description: sanitizeImmersiveText(event.description),
  }));
}

export function sanitizeImmersiveEntry(entry: EncyclopediaEntry): EncyclopediaEntry {
  return {
    ...entry,
    title: sanitizeImmersiveText(entry.title),
    subtitle: sanitizeImmersiveText(entry.subtitle),
    summary: sanitizeImmersiveText(entry.summary),
    narrative: entry.narrative.map((block) => ({
      ...block,
      heading: sanitizeImmersiveText(block.heading),
      body: sanitizeImmersiveText(block.body),
    })),
    timeline: sanitizeImmersiveTimeline(entry.timeline),
  };
}
