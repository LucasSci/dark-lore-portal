import { archiveReferenceArt } from "@/lib/archive-reference";
import { getEncyclopediaEntry } from "@/lib/encyclopedia";

export const SOZ_SITE = {
  title: "Sands of Zerrikania",
  subtitle: "Dark fantasy lore portal",
  tagline:
    "Um portal narrativo premium para profecia, bestiario, cronologia e campanhas sob as areias de Zerrikania.",
  universeLine:
    "Quando o Veu cede, o deserto desperta. Guardioes antigos, magia esquecida e convergencias violentas transformam Zerrikania no epicentro do impossivel.",
  prophecy:
    "Quando as areias forem tingidas de sangue e o vento trouxer o grito das cobras, o dragao se erguera. Na primeira noite, cairao os traidores. Na segunda, os justos serao provados. E na terceira, o deserto escolhera seu novo guardiao.",
} as const;

export const SOZ_WORLD_PILLARS = [
  {
    id: "veu",
    eyebrow: "O Veu",
    title: "A fronteira invisivel que mantinha cada realidade em seu lugar.",
    description:
      "O Veu nao era muro nem porta. Era a distancia necessaria para que cada mundo permanecesse inteiro. Quando comecou a ceder, o impossivel deixou de ser rumor e ganhou passagem.",
    accent: "A falha do Veu transforma anomalia em condicao historica.",
  },
  {
    id: "caos",
    eyebrow: "O Caos",
    title: "Uma inteligencia corretiva que enxerga excecoes como erro de criacao.",
    description:
      "O Espectro do Caos nao chega como deus ou demonio. Ele opera como funcao: observa misturas, desvios e ecos entre mundos e reage tentando corrigir aquilo que considera falha.",
    accent: "Nao odeia; corrige. E e isso que o torna mais assustador.",
  },
  {
    id: "convergencias",
    eyebrow: "As Convergencias",
    title: "Rotas, memorias e vidas que passam a obedecer a uma mesma pressao.",
    description:
      "Depois da primeira recusa do deserto, a crise deixa de agir apenas por rasgo aberto. Ela passa a reunir pessoas, cidades, objetos e sonhos em pontos de ressonancia inevitavel.",
    accent: "Toda convergencia aproxima leitura, pressagio e catastrofe.",
  },
  {
    id: "zerrikania",
    eyebrow: "Zerrikania",
    title: "O deserto dourado que virou o corpo visivel da profecia.",
    description:
      "Zerrikania nao e apenas paisagem. E territorio de reis, Sete Cobras, guardioes vivos, areia negra e memoria ritual. Depois da recusa, o proprio deserto passa a sangrar.",
    accent: "O mundo inteiro olha para Zerrikania quando quer entender o custo da falha.",
  },
  {
    id: "guardioes",
    eyebrow: "Os Guardioes",
    title: "Contencoes vivas que sustentam o mundo onde a realidade ameaca ceder.",
    description:
      "Grandes presencas antigas permanecem onde o Veu enfraquece. Nao por bondade, mas por necessidade. O simples fato de existirem parece manter o tecido do real coerente ao redor delas.",
    accent: "Sem os Guardioes, o continente seria um mapa de feridas abertas.",
  },
] as const;

export const SOZ_CHRONOLOGY_ERAS = [
  {
    id: "era-do-veu",
    eyebrow: "Era do Veu",
    title: "Quando o mundo ainda parecia bastar a si mesmo.",
    description:
      "Antes das travessias, o Veu sustentava a distancia entre realidades. Reis, magos e sacerdotes podiam discutir o desconhecido sem precisar encara-lo como emergencia.",
    highlight: "A ordem antiga dependia da distancia, nao da forca.",
  },
  {
    id: "primeiras-convergencias",
    eyebrow: "Primeiras Convergencias",
    title: "Os pequenos erros passam a se repetir e deixam de parecer coincidencia.",
    description:
      "Luzes sobre o mar, animais deformados, reflexos impossiveis e caminhos que lembram lugares errados anunciam que a realidade ja nao consegue sustentar a propria postura.",
    highlight: "O mundo avisa antes de falhar por inteiro.",
  },
  {
    id: "queda-das-irmas-de-prata",
    eyebrow: "Queda das Irmas de Prata",
    title: "A travessia consciente muda o mar e obriga a historia a aceitar precedente.",
    description:
      "Luna e suas ecos inauguram o medo do que veio de fora. O impossivel deixa de ser teoria de arquivo e ganha testemunha, toque e memoria.",
    highlight: "A primeira travessia aceita torna o colapso inevitavel.",
  },
  {
    id: "deserto-sangrando",
    eyebrow: "O Deserto Sangrando",
    title: "Nashara recusa a correcao total e Zerrikania paga o preco.",
    description:
      "A areia escurece, os Guardioes sustentam uma contencao cada vez mais custosa e o deserto se torna o corpo visivel da escolha entre ordem absoluta e falha viva.",
    highlight: "A recusa salva a excecao, mas condena o mundo a continuar ferido.",
  },
  {
    id: "era-atual",
    eyebrow: "Era Atual",
    title: "Campanhas, grimorios e vetores convergem de novo sob as areias.",
    description:
      "Alaric, Sorrow, Hauz e outros nomes passam a orbitar o mesmo limiar. O continente entra numa fase em que leitura, campanha e profecia deixam de poder ser separadas.",
    highlight: "O agora de Zerrikania e uma guerra de memoria, rota e interpretacao.",
  },
] as const;

export type SozCampaignRecord = {
  slug: string;
  title: string;
  status: string;
  era: string;
  synopsis: string;
  description: string;
  image: string;
  characterSlugs: string[];
  locationSlugs: string[];
  fieldReports: string[];
  eventHighlights: string[];
};

export const SOZ_CAMPAIGNS: SozCampaignRecord[] = [
  {
    slug: "ecos-de-areth-ur",
    title: "Ecos de Areth-Ur",
    status: "Campanha atual",
    era: "1272",
    synopsis:
      "A campanha atual acompanha vetores atraidos pelo deserto depois que grimorios, profecias e guardioes antigos voltam a responder uns aos outros.",
    description:
      "Ecos de Areth-Ur usa Zerrikania como centro de gravidade. Rastros do Grimorio Lunar, presencas sob a areia, memoria ritual e as ruinas de uma cidade soterrada pressionam a companhia a decidir o que deve ser preservado e o que precisa cair.",
    image: archiveReferenceArt.portal,
    characterSlugs: ["nashara", "alaric-dorne", "sorrow-noxmourn", "hauz-darnen"],
    locationSlugs: ["zerrikania-de-areia-negra", "elarion", "novigrad-subterranea"],
    fieldReports: [
      "Rumores apontam reagentes raros circulando sob selos extintos em Vaz'hir.",
      "Guardioes antigos continuam sustentando uma contencao cada vez mais cara no coracao do deserto.",
      "A cidade enterrada de Areth-Ur e tratada como mito por reis prudentes e como destino por toda ordem desesperada.",
    ],
    eventHighlights: [
      "O Grimorio Lunar volta a responder como se estivesse lendo os vivos em troca.",
      "A areia negra avanca sobre rotas antes tratadas como seguras por mercadores e templos.",
      "Faccões rivais tentam usar a profecia como arma politica antes que o deserto escolha por conta propria.",
      "Cada sessao aproxima a companhia do limiar onde Areth-Ur pode reaparecer ou desaparecer para sempre.",
    ],
  },
];

export function getSozCampaign(slug: string) {
  return SOZ_CAMPAIGNS.find((campaign) => campaign.slug === slug) ?? null;
}

export function resolveSozCharacters(slugs: string[]) {
  return slugs
    .map((slug) => getEncyclopediaEntry(slug))
    .filter((entry): entry is NonNullable<ReturnType<typeof getEncyclopediaEntry>> => Boolean(entry));
}

export function resolveSozLocations(slugs: string[]) {
  return slugs
    .map((slug) => getEncyclopediaEntry(slug))
    .filter((entry): entry is NonNullable<ReturnType<typeof getEncyclopediaEntry>> => Boolean(entry));
}
