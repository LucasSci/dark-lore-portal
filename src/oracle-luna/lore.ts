import { rawLoreChapters } from "@/data/lore-soz-chapters";
import { archiveReferenceArt } from "@/lib/archive-reference";

export interface LoreChapter {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
}

const LORE_THUMBNAILS = [
  archiveReferenceArt.portal,
  archiveReferenceArt.hero,
  archiveReferenceArt.creature,
  archiveReferenceArt.wanderer,
  archiveReferenceArt.desk,
  archiveReferenceArt.forgotten,
];

function chapterIdFromHeading(heading: string, index: number) {
  if (index === 0) {
    return "prologo";
  }

  const match = heading.match(/\d+/);
  return match ? `cap${match[0]}` : `capitulo-${index}`;
}

function toDisplayTitle(heading: string) {
  return heading.replace(/\s+--\s+/g, " - ");
}

export const LORE_CHAPTERS: LoreChapter[] = rawLoreChapters.map((chapter, index) => ({
  id: chapterIdFromHeading(chapter.heading, index),
  title: toDisplayTitle(chapter.heading),
  content: chapter.paragraphs.join("\n\n"),
  thumbnail: LORE_THUMBNAILS[index % LORE_THUMBNAILS.length],
}));
