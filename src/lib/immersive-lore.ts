import type {
  EncyclopediaEntry,
  EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";

export const CURRENT_PROTAGONISTS = [
  "Alaric Dorne",
  "Sorrow Noxmourn",
  "Hauz Darnen",
] as const;

// ⚡ Bolt Optimization: Use a single compiled RegExp to avoid allocating intermediate strings in .reduce()
const META_PATTERN = /\bpdf\b|\bsite\b|\brepositorio\b|\bautomatic[oa]s?\b|\bdemo\b|\bmockup\b|\bplaceholder\b|\bconte[uú]do presente neste arquivo\b|\bveio do pdf\b|\banexo\b/gi;

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
