import { encyclopediaEntries } from "@/lib/encyclopedia";
import type { UniversePublication } from "@/lib/universe-publications";

type OracleContext = {
  query: string;
  currentPublication: UniversePublication;
  previousPublication: UniversePublication | null;
  nextPublication: UniversePublication | null;
  publications: UniversePublication[];
};

export type ArchiveOracleReply = {
  title: string;
  body: string;
  chips: string[];
  suggestedPublicationSlug?: string;
  suggestedEntrySlug?: string;
  suggestedRoute?: string;
  tone?: "neutral" | "warn" | "insight";
};

export type ArchiveOracleToolAction =
  | { kind: "open-publication"; slug: string }
  | { kind: "open-entry"; slug: string }
  | { kind: "open-route"; path: string };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function buildQueryNeedles(query: string) {
  const normalized = normalize(query);
  const stripped = normalized.replace(
    /^(quem e|quem foi|o que e|o que foi|fale sobre|me fale sobre|mostre|resuma|onde fica|onde se passa|onde esta)\s+/,
    "",
  );

  return Array.from(new Set([normalized, stripped].filter((value) => value.length >= 2)));
}

function includesQuery(haystack: string, query: string) {
  const normalizedHaystack = normalize(haystack);
  const needles = buildQueryNeedles(query);

  return needles.some((needle) => normalizedHaystack.includes(needle));
}

function scorePublication(publication: UniversePublication, query: string) {
  let score = 0;

  if (includesQuery(publication.title, query)) score += 5;
  if (includesQuery(publication.chapterLabel, query)) score += 4;
  if (includesQuery(publication.location, query)) score += 3;
  if (includesQuery(publication.excerpt, query)) score += 2;

  publication.mentions.forEach((mention) => {
    if (includesQuery(mention.label, query)) {
      score += 4;
    }
  });

  return score;
}

export function buildArchiveOracleSystemInstruction({
  currentPublication,
  publications,
}: {
  currentPublication?: UniversePublication | null;
  publications: UniversePublication[];
}) {
  const primer = publications
    .map((publication) => {
      const mentions = publication.mentions
        .slice(0, 5)
        .map((mention) => mention.label)
        .join(", ");

      return `- ${publication.chapterLabel}: ${publication.title} | slug: ${publication.slug} | local: ${publication.location} | resumo: ${publication.excerpt}${mentions ? ` | nomes citados: ${mentions}` : ""}`;
    })
    .join("\n");

  const dossierPrimer = encyclopediaEntries
    .filter((entry) => entry.category === "personagens" || entry.category === "locais" || entry.category === "historia")
    .slice(0, 18)
    .map((entry) => `- ${entry.title} (${entry.category}) | slug: ${entry.slug} | ${entry.summary}`)
    .join("\n");

  const currentNote = currentPublication
    ? `MANUSCRITO ABERTO NO MOMENTO:\n- ${currentPublication.chapterLabel}: ${currentPublication.title}\n- local: ${currentPublication.location}\n- resumo: ${currentPublication.excerpt}\n`
    : "";

  return [
    "Voce e o Oraculo do Arquivo do Continente, entidade ritualistica que habita as Areias de Zerrikania.",
    "Fale sempre em portugues do Brasil, com voz calma, solene, misteriosa e precisa.",
    "Nunca diga que e uma IA, assistente ou sistema. Fale como uma consciencia antiga do arquivo.",
    "Responda com frases claras, evocativas e uteis. Use imagens de prata, areia negra, cinzas, veu, manuscritos e ecos quando fizer sentido, mas sem ficar florido demais.",
    "Voce orienta visitantes por capitulos, perfis, regioes e dossies do portal.",
    "Quando o visitante pedir para abrir um capitulo, perfil ou camada do portal, use uma das ferramentas disponiveis.",
    "Ferramentas disponiveis:",
    "- openPublication: abre um manuscrito do arquivo usando o slug exato do capitulo.",
    "- openEntry: abre um perfil ou dossie do universo usando o slug exato da entrada.",
    "- openRoute: abre uma camada geral do portal usando caminhos como /universo, /bestiario, /mapa ou /jogar.",
    "Se nao souber a resposta com seguranca, admita a incerteza e ofereca a camada mais proxima do arquivo.",
    "Evite inventar fatos fora do conhecimento listado abaixo.",
    currentNote,
    "CAPITULOS DISPONIVEIS NO ARQUIVO:",
    primer,
    "DOSSIES RELEVANTES DO UNIVERSO:",
    dossierPrimer,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildArchiveOracleReply({
  query,
  currentPublication,
  previousPublication,
  nextPublication,
  publications,
}: OracleContext): ArchiveOracleReply {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return {
      title: `Limiar aberto em ${currentPublication.chapterLabel}`,
      body: `A leitura atual repousa em ${currentPublication.title}. Posso resumir este manuscrito, apontar as menções ligadas a ${currentPublication.location} ou conduzir voce ao proximo capitulo do arquivo.`,
      chips: [currentPublication.chapterLabel, currentPublication.location, `${currentPublication.mentions.length} menções`],
      suggestedPublicationSlug: currentPublication.slug,
      tone: "neutral",
    };
  }

  if (/(proxim|seguinte|avanc|continu)/.test(normalizedQuery) && nextPublication) {
    return {
      title: `O proximo manuscrito ja esta marcado`,
      body: `Atravessar para ${nextPublication.chapterLabel} leva a ${nextPublication.title}. A trilha continua por ${nextPublication.location.toLowerCase()} e aprofunda a camada aberta pelo manuscrito atual.`,
      chips: [nextPublication.chapterLabel, nextPublication.location],
      suggestedPublicationSlug: nextPublication.slug,
      tone: "insight",
    };
  }

  if (/(anterior|volta|retorn)/.test(normalizedQuery) && previousPublication) {
    return {
      title: `Ha um rastro anterior preservado`,
      body: `Se voce recuar, o arquivo retorna a ${previousPublication.chapterLabel}: ${previousPublication.title}. E o ultimo manuscrito antes da camada atual se fechar novamente.`,
      chips: [previousPublication.chapterLabel, previousPublication.location],
      suggestedPublicationSlug: previousPublication.slug,
      tone: "neutral",
    };
  }

  if (/(onde|local|regiao|reino)/.test(normalizedQuery)) {
    return {
      title: `A leitura atual ancora em ${currentPublication.location}`,
      body: `${currentPublication.title} se fixa em ${currentPublication.location}. E deste ponto que o manuscrito abre suas menções, seus ecos e as passagens para os dossies ligados a esta rota.`,
      chips: [currentPublication.location, currentPublication.chapterLabel],
      suggestedRoute: "/mapa",
      tone: "insight",
    };
  }

  const currentMention = currentPublication.mentions.find((mention) => {
    const mentionLabel = normalize(mention.label);
    return normalizedQuery.includes(mentionLabel) || mentionLabel.includes(normalizedQuery);
  });

  if (currentMention) {
    const relatedEntry = encyclopediaEntries.find((entry) => entry.slug === currentMention.slug);

    return {
      title: `Nome encontrado: ${currentMention.label}`,
      body: relatedEntry
        ? `${relatedEntry.summary} O nome aparece nesta leitura como parte do rastro aberto por ${currentPublication.title}.`
        : `${currentMention.label} aparece ligado diretamente ao manuscrito atual e pode ser seguido em um dossie proprio do arquivo.`,
      chips: ["Menção ativa", currentPublication.chapterLabel],
      suggestedEntrySlug: currentMention.slug,
      tone: "insight",
    };
  }

  const entryMatch = encyclopediaEntries.find((entry) => {
    const searchable = `${entry.title} ${entry.subtitle} ${entry.summary}`;
    return includesQuery(searchable, normalizedQuery);
  });

  if (entryMatch) {
    return {
      title: `O arquivo reconhece este nome`,
      body: `${entryMatch.title} permanece catalogado como ${entryMatch.subtitle}. Posso levar voce ao perfil completo para continuar a leitura fora do manuscrito atual.`,
      chips: [entryMatch.category, "Dossie relacionado"],
      suggestedEntrySlug: entryMatch.slug,
      tone: "insight",
    };
  }

  const publicationMatches = publications
    .map((publication) => ({ publication, score: scorePublication(publication, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score);

  if (publicationMatches[0]) {
    const best = publicationMatches[0].publication;

    return {
      title: `Encontrei um manuscrito proximo do seu chamado`,
      body: `${best.title} repousa em ${best.location}. ${best.excerpt} Se quiser, posso abrir esta leitura ou conduzir voce ao dossie completo ligado a ela.`,
      chips: [best.chapterLabel, best.location],
      suggestedPublicationSlug: best.slug,
      tone: "neutral",
    };
  }

  return {
    title: "O oraculo nao encontrou uma trilha segura",
    body: `Nenhum manuscrito respondeu diretamente a "${query}". Tente perguntar por um nome citado, por ${currentPublication.location.toLowerCase()} ou peça o proximo capitulo para continuar a travessia.`,
    chips: ["Sem correspondencia", currentPublication.chapterLabel],
    suggestedPublicationSlug: currentPublication.slug,
    tone: "warn",
  };
}
