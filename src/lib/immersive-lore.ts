import type {
  EncyclopediaEntry,
  EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";

export const CURRENT_PROTAGONISTS = [
  "Alaric Dorne",
  "Sorrow Noxmourn",
  "Hauz Darnen",
] as const;

// ⚡ Bolt Optimization: Precompiled RegExp with alternation reduces GC pressure
// from iterating over an array of regexes and allocating multiple intermediate strings.
// Note: Multi-word patterns must be matched first to avoid partial matches.
const META_PATTERNS_REGEX = /\bconte[uú]do presente neste arquivo\b|\bveio do pdf\b|\bpdf\b|\bsite\b|\brepositorio\b|\bautomatic[oa]s?\b|\bdemo\b|\bmockup\b|\bplaceholder\b|\banexo\b/gi;

function normalizeSpacing(text: string) {
  return text.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

export function sanitizeImmersiveText(text: string) {
  const sanitized = text.replace(META_PATTERNS_REGEX, "");

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
