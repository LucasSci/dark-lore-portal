import type {
  EncyclopediaEntry,
  EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";

export const CURRENT_PROTAGONISTS = [
  "Alaric Dorne",
  "Sorrow Noxmourn",
  "Hauz Darnen",
] as const;

const META_PATTERNS = [
  /\bveio do pdf\b/gi,
  /\bconte[uú]do presente neste arquivo\b/gi,
  /\bpdf\b/gi,
  /\bsite\b/gi,
  /\brepositorio\b/gi,
  /\bautomatic[oa]s?\b/gi,
  /\bdemo\b/gi,
  /\bmockup\b/gi,
  /\bplaceholder\b/gi,
  /\banexo\b/gi,
];

const META_COMBINED_PATTERN = new RegExp(
  META_PATTERNS.map((p) => p.source).join("|"),
  "gi"
);

function normalizeSpacing(text: string) {
  return text.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

export function sanitizeImmersiveText(text: string) {
  return normalizeSpacing(text.replace(META_COMBINED_PATTERN, ""));
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
