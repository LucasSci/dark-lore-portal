import heroBackground from "@/assets/hero-bg.jpg";
import heroZerrikania from "@/assets/hero-zerrikania.jpg";
import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
import { rawLoreChapters } from "@/data/lore-soz-chapters";

type MentionSeed = {
  label: string;
  slug: string;
};

export type UniversePublicationMention = MentionSeed;

export interface UniversePublication {
  slug: string;
  chapterNumber: number;
  chapterLabel: string;
  title: string;
  heading: string;
  excerpt: string;
  paragraphs: string[];
  image: string;
  location: string;
  mentions: UniversePublicationMention[];
}

const mentionSeeds: MentionSeed[] = [
  { label: "Alaric Dorne", slug: "alaric-dorne" },
  { label: "Alaric", slug: "alaric-dorne" },
  { label: "Sorrow Noxmourn", slug: "sorrow-noxmourn" },
  { label: "Sorrow", slug: "sorrow-noxmourn" },
  { label: "Hauz Darnen", slug: "hauz-darnen" },
  { label: "Hauz", slug: "hauz-darnen" },
  { label: "Merlin", slug: "merlin" },
  { label: "Nashara", slug: "nashara" },
  { label: "Agregor", slug: "agregor" },
  { label: "Irmas de Prata", slug: "irmas-de-prata" },
  { label: "Elarion", slug: "elarion" },
  { label: "Fragmentos de Luna", slug: "fragmentos-de-luna" },
  { label: "Vaz'hir", slug: "vazhir" },
  { label: "Vazhir", slug: "vazhir" },
];

const locationByChapter: Record<number, string> = {
  0: "Cronicas do Veu",
  1: "Costa prateada",
  2: "Falesias do norte",
  3: "Abrigo de Merlin",
  4: "Costa em vigilia",
  5: "Reinos em medo",
  6: "Rotas quebradas",
  7: "Templos e versos",
  8: "Zerrikania",
  9: "Dunas negras",
  10: "Deserto de Zerrikania",
  11: "Memoria partida",
  12: "Novigrad",
  13: "Estrada de Elarion",
  14: "Dunas sem nome",
  15: "Kaedwen",
  16: "Caverna de Elarion",
  17: "Estalagem limiar",
};

const imageByChapter = (chapterNumber: number) => {
  if (chapterNumber === 0) {
    return historyIllustration;
  }

  if (chapterNumber >= 7 && chapterNumber <= 11) {
    return heroZerrikania;
  }

  if (chapterNumber >= 12) {
    return chapterNumber >= 16 ? characterIllustration : locationIllustration;
  }

  return heroBackground;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanHeading(heading: string) {
  return heading.replace(/\.$/, "").trim();
}

function parseHeading(heading: string) {
  if (heading === "Prologo") {
    return {
      chapterNumber: 0,
      chapterLabel: "Prologo",
      title: "O Veu comeca a ceder",
    };
  }

  const match = heading.match(/^Capitulo\s+(\d+)\s+--\s+(.+)$/);

  if (!match) {
    return {
      chapterNumber: 0,
      chapterLabel: heading,
      title: cleanHeading(heading),
    };
  }

  const chapterNumber = Number(match[1]);

  return {
    chapterNumber,
    chapterLabel: `Capitulo ${String(chapterNumber).padStart(2, "0")}`,
    title: cleanHeading(match[2]),
  };
}

function buildExcerpt(paragraphs: string[]) {
  const excerpt = paragraphs.slice(0, 3).join(" ").replace(/\s+/g, " ").trim();

  if (excerpt.length <= 220) {
    return excerpt;
  }

  return `${excerpt.slice(0, 217).trimEnd()}...`;
}

function collectMentions(paragraphs: string[]) {
  const source = paragraphs.join(" ");
  const seen = new Set<string>();

  return mentionSeeds.filter((mention) => {
    const pattern = new RegExp(
      `(^|[^A-Za-zÀ-ÿ'])${mention.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[^A-Za-zÀ-ÿ']|$)`,
      "i",
    );
    const hasMention = pattern.test(source);

    if (!hasMention || seen.has(mention.slug)) {
      return false;
    }

    seen.add(mention.slug);
    return true;
  });
}

export const universePublications: UniversePublication[] = rawLoreChapters.map((chapter) => {
  const parsed = parseHeading(chapter.heading);

  return {
    slug:
      parsed.chapterNumber === 0
        ? "cronica-prologo-do-veu"
        : `cronica-${String(parsed.chapterNumber).padStart(2, "0")}-${slugify(parsed.title)}`,
    chapterNumber: parsed.chapterNumber,
    chapterLabel: parsed.chapterLabel,
    title: parsed.title,
    heading: chapter.heading,
    excerpt: buildExcerpt(chapter.paragraphs),
    paragraphs: chapter.paragraphs,
    image: imageByChapter(parsed.chapterNumber),
    location: locationByChapter[parsed.chapterNumber] ?? "Arquivo do continente",
    mentions: collectMentions(chapter.paragraphs),
  };
});

export function getUniversePublication(slug: string) {
  return universePublications.find((publication) => publication.slug === slug) ?? null;
}
