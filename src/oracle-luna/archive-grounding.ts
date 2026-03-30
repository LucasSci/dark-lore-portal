import { rawLoreChapters } from "@/data/lore-soz-chapters";
import { encyclopediaEntries } from "@/lib/encyclopedia";

export type OracleArchiveRecordType = "chapter" | "entry";

export interface OracleArchiveRecord {
  id: string;
  type: OracleArchiveRecordType;
  title: string;
  label: string;
  summary: string;
  body: string;
  keywords: string[];
}

export interface OracleArchiveSearchResult {
  id: string;
  type: OracleArchiveRecordType;
  title: string;
  label: string;
  summary: string;
  excerpt: string;
  relevance: number;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const literalReadStopwords = new Set([
  "leia",
  "ler",
  "leitura",
  "registro",
  "registros",
  "completo",
  "completa",
  "arquivo",
  "como",
  "aparece",
  "original",
  "texto",
  "voz",
  "alta",
  "exatamente",
  "minimo",
  "alteracoes",
  "alteracao",
  "possivel",
  "do",
  "da",
  "de",
  "dos",
  "das",
  "no",
  "na",
  "nos",
  "nas",
  "o",
  "a",
  "os",
  "as",
  "e",
]);

function toChapterId(heading: string, index: number) {
  if (index === 0) {
    return "chapter:prologo";
  }

  const match = heading.match(/\d+/);
  return match ? `chapter:cap${match[0]}` : `chapter:${index}`;
}

function toDisplayTitle(heading: string) {
  return heading.replace(/\s+--\s+/g, " - ");
}

function uniqueKeywords(...parts: string[]) {
  const keywords = new Set<string>();

  for (const part of parts) {
    for (const token of normalizeSearchText(part).split(" ")) {
      if (token.length >= 3) {
        keywords.add(token);
      }
    }
  }

  return Array.from(keywords);
}

const chapterRecords: OracleArchiveRecord[] = rawLoreChapters.map((chapter, index) => {
  const title = toDisplayTitle(chapter.heading);
  const summary = chapter.paragraphs.slice(0, 2).join(" ");
  const body = chapter.paragraphs.join("\n\n");

  return {
    id: toChapterId(chapter.heading, index),
    type: "chapter",
    title,
    label: "Capitulo do arquivo",
    summary,
    body,
    keywords: uniqueKeywords(title, summary, body),
  };
});

const entryRecords: OracleArchiveRecord[] = encyclopediaEntries.map((entry) => {
  const narrativeText = entry.narrative
    .map((block) => `${block.heading}: ${block.body}`)
    .join("\n\n");
  const timelineText = entry.timeline
    .map((event) => `${event.period}: ${event.title}. ${event.description}`)
    .join("\n\n");
  const statsText = entry.stats.map((stat) => `${stat.label}: ${stat.value}`).join("\n");
  const body = [entry.summary, narrativeText, timelineText, statsText].filter(Boolean).join("\n\n");

  return {
    id: `entry:${entry.slug}`,
    type: "entry",
    title: entry.title,
    label: `Dossie de ${entry.category}`,
    summary: entry.subtitle,
    body,
    keywords: uniqueKeywords(entry.title, entry.subtitle, entry.summary, body, ...entry.internalLinks),
  };
});

export const oracleArchiveRecords: OracleArchiveRecord[] = [...chapterRecords, ...entryRecords];

function scoreRecord(record: OracleArchiveRecord, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = normalizedQuery.split(" ").filter((token) => token.length >= 2);
  const title = normalizeSearchText(record.title);
  const summary = normalizeSearchText(record.summary);
  const body = normalizeSearchText(record.body);

  let score = 0;

  if (title.includes(normalizedQuery)) score += 140;
  if (summary.includes(normalizedQuery)) score += 90;
  if (body.includes(normalizedQuery)) score += 50;

  for (const token of tokens) {
    if (title.includes(token)) score += 26;
    if (summary.includes(token)) score += 14;
    if (body.includes(token)) score += 8;
    if (record.keywords.includes(token)) score += 10;
  }

  if (tokens.length > 1 && tokens.every((token) => body.includes(token) || title.includes(token))) {
    score += 24;
  }

  return score;
}

function bestExcerpt(record: OracleArchiveRecord, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = normalizedQuery.split(" ").filter((token) => token.length >= 3);
  const paragraphs = record.body.split(/\n{2,}/).filter(Boolean);

  if (paragraphs.length === 0) {
    return record.summary;
  }

  let winner = paragraphs[0];
  let winnerScore = -1;

  for (const paragraph of paragraphs) {
    const normalizedParagraph = normalizeSearchText(paragraph);
    let paragraphScore = 0;

    if (normalizedQuery && normalizedParagraph.includes(normalizedQuery)) {
      paragraphScore += 30;
    }

    for (const token of tokens) {
      if (normalizedParagraph.includes(token)) {
        paragraphScore += 8;
      }
    }

    if (paragraphScore > winnerScore) {
      winnerScore = paragraphScore;
      winner = paragraph;
    }
  }

  return winner.length > 380 ? `${winner.slice(0, 377).trim()}...` : winner;
}

export function searchOracleArchive(query: string, maxResults = 5): OracleArchiveSearchResult[] {
  const boundedMax = Number.isFinite(maxResults) ? Math.max(1, Math.min(8, Math.floor(maxResults))) : 5;

  return oracleArchiveRecords
    .map((record) => ({ record, relevance: scoreRecord(record, query) }))
    .filter((item) => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance)
    .slice(0, boundedMax)
    .map(({ record, relevance }) => ({
      id: record.id,
      type: record.type,
      title: record.title,
      label: record.label,
      summary: record.summary,
      excerpt: bestExcerpt(record, query),
      relevance,
    }));
}

export function searchOracleArchiveReadTargets(query: string, maxResults = 5): OracleArchiveSearchResult[] {
  const boundedMax = Number.isFinite(maxResults) ? Math.max(1, Math.min(8, Math.floor(maxResults))) : 5;
  const normalizedQuery = normalizeSearchText(query);
  const quotedTarget = query.match(/["“](.+?)["”]/)?.[1]?.trim();
  const normalizedQuotedTarget = quotedTarget ? normalizeSearchText(quotedTarget) : "";

  const explicitTitleHits = oracleArchiveRecords
    .map((record) => {
      const normalizedTitle = normalizeSearchText(record.title);
      let relevance = 0;

      if (normalizedQuotedTarget && normalizedTitle.includes(normalizedQuotedTarget)) {
        relevance += 400;
      }
      if (normalizedQuery.includes(normalizedTitle)) {
        relevance += 260;
      }

      return { record, relevance };
    })
    .filter((item) => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance);

  if (explicitTitleHits.length > 0) {
    return explicitTitleHits.slice(0, boundedMax).map(({ record, relevance }) => ({
      id: record.id,
      type: record.type,
      title: record.title,
      label: record.label,
      summary: record.summary,
      excerpt: bestExcerpt(record, query),
      relevance,
    }));
  }

  const cleanedQuery = normalizedQuery
    .split(" ")
    .filter((token) => token.length >= 2 && !literalReadStopwords.has(token))
    .join(" ");

  return searchOracleArchive(cleanedQuery || query, boundedMax);
}

export function getOracleArchiveRecord(recordId: string) {
  return oracleArchiveRecords.find((record) => record.id === recordId) ?? null;
}

export const oracleCanonicalDigest = [
  "Arquivo do Continente - referencias canonicas resumidas.",
  ...chapterRecords.map((record) => `${record.title}: ${record.summary}`),
  ...entryRecords
    .filter((record) =>
      ["merlin", "nashara", "alaric-dorne", "sorrow-noxmourn", "hauz-darnen", "vaz-hir"].some((slug) =>
        record.id.includes(slug),
      ),
    )
    .map((record) => `${record.title}: ${record.summary}`),
].join("\n");
