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
  /\bpdf\b/gi,
  /\bsite\b/gi,
  /\brepositorio\b/gi,
  /\bautomatic[oa]s?\b/gi,
  /\bdemo\b/gi,
  /\bmockup\b/gi,
  /\bplaceholder\b/gi,
  /\bconte[uú]do presente neste arquivo\b/gi,
  /\bveio do pdf\b/gi,
  /\banexo\b/gi,
];

function normalizeSpacing(text: string) {
  return text.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

export function sanitizeImmersiveText(text: string) {
  const sanitized = META_PATTERNS.reduce((current, pattern) => {
    return current.replace(pattern, "");
  }, text);

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
