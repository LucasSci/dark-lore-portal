import { useSyncExternalStore } from "react";
import { generateSecureId } from "./utils";

export type PublicationKind = "cronica" | "contrato" | "rumor" | "relatorio";
export type PublicationStatus = "rascunho" | "publicado" | "arquivado";

export interface CampaignPublicationDraft {
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  location: string;
  kind: PublicationKind;
  status: PublicationStatus;
  protagonists: string[];
  chapterNumber: number;
  replies: number;
}

export interface CampaignPublication extends CampaignPublicationDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "dark-lore-campaign-publications";
const listeners = new Set<() => void>();
let publicationSnapshot: CampaignPublication[] | null = null;

const seedPublications: CampaignPublication[] = [
  {
    id: "pub-rotas-elarion",
    title: "Rotas sob vigia em Elarion",
    excerpt:
      "As caravanas que cruzam os acessos de Elarion relatam movimentos armados, lanternas apagadas e negociações feitas fora de vista.",
    body:
      "As patrulhas têm encontrado rastros de passagem ao longo das dunas frias. Mercadores juram ter visto figuras observando das ruínas e recuando antes do amanhecer. O fluxo de informação ficou mais caro, e as rotas seguras agora são vendidas em sussurros.",
    author: "Arquivo do Mestre",
    location: "Elarion",
    kind: "cronica",
    status: "publicado",
    protagonists: ["Alaric Dorne", "Sorrow Noxmourn", "Hauz Darnen"],
    chapterNumber: 3,
    replies: 4,
    createdAt: "2026-03-10T18:00:00.000Z",
    updatedAt: "2026-03-14T21:00:00.000Z",
  },
  {
    id: "pub-contrato-korath",
    title: "Contrato: trilha perdida no Korath",
    excerpt:
      "Uma trilha de suprimentos desapareceu perto da borda de Korath. O contratante paga em moeda e acesso a mapas velhos.",
    body:
      "O comboio sumiu antes de alcançar a linha das pedras negras. O contratante quer a rota confirmada, os sobreviventes recuperados e qualquer marca ritual descrita em detalhes. Recompensa adicional para quem trouxer nomes.",
    author: "Arquivo do Mestre",
    location: "Korath",
    kind: "contrato",
    status: "publicado",
    protagonists: ["Alaric Dorne", "Sorrow Noxmourn"],
    chapterNumber: 4,
    replies: 2,
    createdAt: "2026-03-12T17:30:00.000Z",
    updatedAt: "2026-03-15T20:15:00.000Z",
  },
  {
    id: "pub-rumor-vazhir",
    title: "Rumor nas mesas de Vaz'hir",
    excerpt:
      "Corre a história de que alguém anda comprando reagentes raros em silêncio, sempre na mesma noite e sempre sem escolta visível.",
    body:
      "Ninguém sabe o destino dos reagentes, mas os vendedores foram instruídos a esquecer rostos e a dobrar o preço. Uma das bancas diz ter visto o selo de uma casa extinta entre as moedas.",
    author: "Arquivo do Mestre",
    location: "Vaz'hir",
    kind: "rumor",
    status: "publicado",
    protagonists: ["Hauz Darnen"],
    chapterNumber: 4,
    replies: 3,
    createdAt: "2026-03-13T22:00:00.000Z",
    updatedAt: "2026-03-15T23:30:00.000Z",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notify() {
  listeners.forEach((listener) => listener());
}

function readPublications(): CampaignPublication[] {
  if (!canUseStorage()) {
    return [...seedPublications];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [...seedPublications];
  }

  try {
    const parsed = JSON.parse(raw) as CampaignPublication[];
    return Array.isArray(parsed) ? parsed : [...seedPublications];
  } catch {
    return [...seedPublications];
  }
}

function readPersistedPublications() {
  return sortPublications(readPublications());
}

function writePublications(publications: CampaignPublication[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(publications));
}

function ensureSeeded() {
  if (!canUseStorage()) {
    return;
  }

  if (!window.localStorage.getItem(STORAGE_KEY)) {
    writePublications(seedPublications);
  }
}

function sortPublications(publications: CampaignPublication[]) {
  return [...publications].sort((left, right) => {
    if (left.chapterNumber !== right.chapterNumber) {
      return right.chapterNumber - left.chapterNumber;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureSeeded();

  if (!publicationSnapshot) {
    publicationSnapshot = readPersistedPublications();
  }

  return publicationSnapshot;
}

function persistPublication(
  draft: CampaignPublicationDraft,
): CampaignPublication {
  ensureSeeded();
  const publications = readPublications();
  const now = new Date().toISOString();
  const saved: CampaignPublication = draft.id
    ? {
        ...(publications.find((entry) => entry.id === draft.id) ?? {
          createdAt: now,
        }),
        ...draft,
        id: draft.id,
        updatedAt: now,
      }
    : {
        ...draft,
        id: `publication-${generateSecureId()}`,
        createdAt: now,
        updatedAt: now,
      };

  const next = publications.filter((entry) => entry.id !== saved.id);
  next.push(saved);
  publicationSnapshot = sortPublications(next);
  writePublications(publicationSnapshot);
  notify();

  return saved;
}

function removePublication(publicationId: string) {
  ensureSeeded();
  const publications = readPublications().filter((entry) => entry.id !== publicationId);
  publicationSnapshot = sortPublications(publications);
  writePublications(publicationSnapshot);
  notify();
}

export function useCampaignPublications() {
  const publications = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    publications,
    publishedPublications: publications.filter((entry) => entry.status === "publicado"),
    upsertPublication: persistPublication,
    deletePublication: removePublication,
  };
}
