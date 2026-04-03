import foundryPtbr from "./foundry-ptbr.json";
import type {
  WitcherAttributeDefinition,
  WitcherAttributeKey,
  WitcherBackgroundPrompt,
  WitcherCriticalEntry,
  WitcherHitLocation,
  WitcherInventoryItem,
  WitcherProfessionDefinition,
  WitcherRaceDefinition,
  WitcherSpellDefinition,
} from "../types";

export const witcherPtbr = foundryPtbr as Record<string, string>;

export const WITCHER_ATTRIBUTES: WitcherAttributeDefinition[] = [
  { key: "int", label: "Inteligencia", abbr: "INT", description: "Leitura, deducao e memoria pratica." },
  { key: "ref", label: "Reflexos", abbr: "REF", description: "Ataque, resposta e dominio de combate." },
  { key: "dex", label: "Destreza", abbr: "DES", description: "Precisao, furtividade e pontaria." },
  { key: "body", label: "Corpo", abbr: "COR", description: "Forca, resistencia e impacto fisico." },
  { key: "spd", label: "Velocidade", abbr: "VEL", description: "Passo, corrida e reposicionamento." },
  { key: "emp", label: "Empatia", abbr: "EMP", description: "Leitura social, carisma e conexao." },
  { key: "cra", label: "Criatividade", abbr: "CRI", description: "Alquimia, artesanato e tecnicas finas." },
  { key: "will", label: "Vontade", abbr: "VON", description: "Magia, disciplina e resistencia mental." },
  { key: "luck", label: "Sorte", abbr: "SOR", description: "Reservatorio de sorte para momentos decisivos." },
];

export const WITCHER_RACES: WitcherRaceDefinition[] = [
  {
    value: "humano",
    label: "Humano",
    socialStanding: "Aceito em quase todos os reinos.",
    desc: "Adaptavel, numeroso e sempre enfiado nas guerras do Continente.",
    trait: "Escolhe um campo de origem que abre portas ou inimizades especificas.",
  },
  {
    value: "elfo",
    label: "Elfo",
    socialStanding: "Tolerado ou odiado conforme a fronteira.",
    desc: "Antigo povo da margem, com memoria longa e postura desconfiada.",
    trait: "Movimento silencioso e leitura aguçada de emboscadas e trilhas.",
  },
  {
    value: "anao",
    label: "Anao",
    socialStanding: "Respeitado por oficio, testado por preconceito.",
    desc: "Robusto, direto e ligado a rotas de forja, mineracao e contratos duros.",
    trait: "Resiste melhor a fadiga, venenos leves e trabalho pesado.",
  },
  {
    value: "halfling",
    label: "Halfling",
    socialStanding: "Subestimado ate mostrar a astucia.",
    desc: "Discreto, agil e dono de um talento perigoso para desaparecer de cena.",
    trait: "Leva vantagem em furtividade, circulacao e leitura de risco.",
  },
];

export const WITCHER_PROFESSIONS: WitcherProfessionDefinition[] = [
  {
    value: "witcher",
    label: "Bruxo",
    desc: "Cacador mutageno treinado para contratos, monstros e sobrevivencia brutal.",
    definingSkill: "Esgrima",
    role: "Predador de monstros e rastreador profissional.",
    vigor: 2,
    paths: ["Treino de escola", "Hunts and contracts", "Trial scars"],
    favoredAttributes: ["ref", "body", "will"],
    starterGear: ["Espada de aco", "Espada de prata", "Medalhao de bruxo"],
  },
  {
    value: "mage",
    label: "Mago",
    desc: "Conjurador de caos com grimorio, foco e uma colecao perigosa de segredos.",
    definingSkill: "Lancar feiticos",
    role: "Artilharia magica, ritualista e estudioso.",
    vigor: 5,
    paths: ["Academia", "Politica arcana", "Rituais proibidos"],
    favoredAttributes: ["int", "will", "cra"],
    starterGear: ["Foco arcano", "Manto de academia", "Livro de formulas"],
  },
  {
    value: "priest",
    label: "Sacerdote",
    desc: "Voz de um culto, curandeiro de povoado ou inquisidor mascarado de fe.",
    definingSkill: "Ritual",
    role: "Suporte, invocacao e autoridade espiritual.",
    vigor: 3,
    paths: ["Doutrina", "Milagres", "Condenacao"],
    favoredAttributes: ["will", "emp", "int"],
    starterGear: ["Simbolo sagrado", "Roupa clerical", "Oleos rituais"],
  },
  {
    value: "man-at-arms",
    label: "Homem de armas",
    desc: "Soldado, guarda, veterano ou mercenario lapidado pela linha de frente.",
    definingSkill: "Corpo a corpo",
    role: "Linha de choque e disciplina militar.",
    vigor: 0,
    paths: ["Formacao", "Campo de batalha", "Comando"],
    favoredAttributes: ["body", "ref", "spd"],
    starterGear: ["Gibao acolchoado", "Lanca curta", "Escudo"],
  },
  {
    value: "bard",
    label: "Bardo",
    desc: "Cronista, espiao, diplomata ou veneno elegante em saloes e tavernas.",
    definingSkill: "Performance",
    role: "Face social e memoria viva da campanha.",
    vigor: 0,
    paths: ["Palco", "Rumores", "Patronos"],
    favoredAttributes: ["emp", "int", "luck"],
    starterGear: ["Lute de viagem", "Roupa chamativa", "Caderno de versos"],
  },
  {
    value: "craftsman",
    label: "Artesao",
    desc: "Ferreiro, armeiro ou inventor capaz de manter a companhia de pe.",
    definingSkill: "Criar",
    role: "Suporte logistico, reparos e producao.",
    vigor: 0,
    paths: ["Forja", "Diagramas", "Oficina ambulante"],
    favoredAttributes: ["cra", "int", "body"],
    starterGear: ["Kit de ferreiro", "Martelo de oficio", "Diagramas basicos"],
  },
];

export const WITCHER_SPELLS: WitcherSpellDefinition[] = [
  {
    id: "sign-aard",
    name: "Aard",
    tradition: "sinal",
    professionTags: ["witcher"],
    description: "Onda de impacto que quebra formacao, derruba inimigos e abre espaco.",
    range: "Cone curto",
    duration: "Instantaneo",
    damage: "1d6 concussivo",
    vigorCost: 2,
    difficulty: "Rotina",
  },
  {
    id: "sign-igni",
    name: "Igni",
    tradition: "sinal",
    professionTags: ["witcher"],
    description: "Jato de fogo curto que queima alvo, madeira seca e coragem fraca.",
    range: "Linha curta",
    duration: "Instantaneo",
    damage: "2d6 fogo",
    vigorCost: 2,
    difficulty: "Rotina",
  },
  {
    id: "sign-quen",
    name: "Quen",
    tradition: "sinal",
    professionTags: ["witcher"],
    description: "Escudo magico que absorve o primeiro impacto e compra uma respiracao a mais.",
    range: "Pessoal",
    duration: "Ate sofrer dano",
    damage: null,
    vigorCost: 1,
    difficulty: "Rotina",
  },
  {
    id: "sign-yrden",
    name: "Yrden",
    tradition: "sinal",
    professionTags: ["witcher"],
    description: "Selo no chao que trava movimentos e expoe criaturas espectrais.",
    range: "Area curta",
    duration: "3 rodadas",
    damage: null,
    vigorCost: 2,
    difficulty: "Desafiadora",
  },
];

export const WITCHER_INVENTORY: WitcherInventoryItem[] = [
  {
    id: "steel-sword",
    name: "Espada de aco",
    category: "arma",
    rarity: "comum",
    weight: 1.8,
    value: 180,
    damage: "3d6+2",
    stoppingPower: 0,
    effect: "Confiavel contra humanos, bestas e soldados.",
    description: "Lamina de estrada para trabalho diario, contratos e guerras pequenas.",
    hands: "uma",
  },
  {
    id: "silver-sword",
    name: "Espada de prata",
    category: "arma",
    rarity: "raro",
    weight: 1.6,
    value: 480,
    damage: "3d6+2",
    stoppingPower: 0,
    effect: "Ignora parte da resistencia de monstros vulneraveis a prata.",
    description: "Ferramenta cara, ritual e decisiva contra o que rasteja alem do humano.",
    hands: "uma",
  },
];

export const WITCHER_HIT_LOCATIONS: WitcherHitLocation[] = [
  { label: "Cabeca", attackPenalty: -6, damageMultiplier: 3 },
  { label: "Torso", attackPenalty: -1, damageMultiplier: 1 },
  { label: "Torso", attackPenalty: -1, damageMultiplier: 1 },
  { label: "Torso", attackPenalty: -1, damageMultiplier: 1 },
  { label: "Braco direito", attackPenalty: -3, damageMultiplier: 0.5 },
  { label: "Braco esquerdo", attackPenalty: -3, damageMultiplier: 0.5 },
  { label: "Perna direita", attackPenalty: -2, damageMultiplier: 0.5 },
  { label: "Perna direita", attackPenalty: -2, damageMultiplier: 0.5 },
  { label: "Perna esquerda", attackPenalty: -2, damageMultiplier: 0.5 },
  { label: "Perna esquerda", attackPenalty: -2, damageMultiplier: 0.5 },
];

export const WITCHER_SIMPLE_CRITICALS: WitcherCriticalEntry[] = [
  { range: [2, 3], title: "Perna torcida", description: "Movimento comprometido. Velocidade, Esquiva e Atletismo sofrem forte penalidade ate tratamento." },
  { range: [4, 5], title: "Braco torcido", description: "A mao falha sob carga. Acoes com aquele braco ficam penalizadas ate estabilizacao." },
  { range: [6, 8], title: "Fragmento preso", description: "Parte de roupa ou armadura entrou na ferida. Recuperacao cai drasticamente ate cirurgia." },
  { range: [9, 10], title: "Costelas rachadas", description: "Respirar doi. Corpo e carregamento despencam ate o ferimento ser tratado." },
  { range: [11, 11], title: "Cicatriz desfigurante", description: "A face foi marcada. Conversas empaticas e seducao ficam mais dificeis." },
  { range: [12, 12], title: "Mandibula rachada", description: "Falar e conjurar custam caro. Magia e combate verbal sofrem penalidade imediata." },
];

export const WITCHER_BACKGROUNDS: WitcherBackgroundPrompt[] = [
  { title: "Marca de estrada", detail: "Seu primeiro contrato terminou em silencio demais. Desde entao, voce mede cada aldeia pelo cheiro da madeira queimada." },
  { title: "Ruina herdada", detail: "Sua familia caiu antes de deixar nome. O que restou foi uma divida, um simbolo e um inimigo que ainda respira." },
  { title: "Julgamento da escola", detail: "Alguem na escola apostou que voce nao voltaria dos testes. Voce voltou, mas deixou algo de si na mesa de pedra." },
];

export const WITCHER_HOMELANDS = ["Aedirn", "Cintra", "Kaedwen", "Kovir", "Mahakam", "Nilfgaard", "Redania", "Skellige", "Temeria", "Verden"] as const;
export const WITCHER_SCHOOLS = ["Lobo", "Gato", "Grifo", "Urso", "Vibora", "Manticora"] as const;

export function getWitcherProfession(professionValue: string) {
  return WITCHER_PROFESSIONS.find((entry) => entry.value === professionValue) ?? null;
}

export function getWitcherRace(raceValue: string) {
  return WITCHER_RACES.find((entry) => entry.value === raceValue) ?? null;
}

export function getWitcherAttribute(attributeKey: string) {
  return WITCHER_ATTRIBUTES.find((entry) => entry.key === attributeKey) ?? null;
}

export function getWitcherCritical(rollTotal: number) {
  return WITCHER_SIMPLE_CRITICALS.find((entry) => rollTotal >= entry.range[0] && rollTotal <= entry.range[1]) ?? null;
}

export function getWitcherHitLocation(rollTotal: number) {
  const clamped = Math.max(1, Math.min(10, rollTotal));
  return WITCHER_HIT_LOCATIONS[clamped - 1] ?? WITCHER_HIT_LOCATIONS[1];
}

export function buildRandomWitcherBackground(random = Math.random) {
  const entry = WITCHER_BACKGROUNDS[Math.floor(random() * WITCHER_BACKGROUNDS.length)] ?? WITCHER_BACKGROUNDS[0];
  return `${entry.title}: ${entry.detail}`;
}

export function buildRandomAttributeSpread(total = 60, min = 2, max = 10) {
  const values = Object.fromEntries(WITCHER_ATTRIBUTES.map((attribute) => [attribute.key, min])) as Record<
    WitcherAttributeKey,
    number
  >;
  let remaining = total - min * WITCHER_ATTRIBUTES.length;

  while (remaining > 0) {
    const attribute = WITCHER_ATTRIBUTES[Math.floor(Math.random() * WITCHER_ATTRIBUTES.length)];
    if (values[attribute.key] >= max) continue;
    values[attribute.key] += 1;
    remaining -= 1;
  }

  return values;
}
