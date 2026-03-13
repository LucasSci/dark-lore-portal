import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import factionIllustration from "@/assets/encyclopedia/faction-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
import monsterIllustration from "@/assets/encyclopedia/monster-illustration.svg";

export type EncyclopediaCategory =
  | "personagens"
  | "monstros"
  | "locais"
  | "faccoes"
  | "historia";

export interface EncyclopediaTimelineEvent {
  period: string;
  title: string;
  description: string;
}

export interface EncyclopediaNarrativeBlock {
  heading: string;
  body: string;
}

export interface EncyclopediaStat {
  label: string;
  value: string;
}

export interface EncyclopediaEntry {
  slug: string;
  title: string;
  category: EncyclopediaCategory;
  subtitle: string;
  summary: string;
  image: string;
  imageAlt: string;
  narrative: EncyclopediaNarrativeBlock[];
  internalLinks: string[];
  timeline: EncyclopediaTimelineEvent[];
  stats: EncyclopediaStat[];
}

export const encyclopediaCategories: Record<
  EncyclopediaCategory,
  {
    label: string;
    description: string;
  }
> = {
  personagens: {
    label: "Personagens",
    description: "Herois, governantes, profetas e nomes que moldam o conflito.",
  },
  monstros: {
    label: "Monstros",
    description: "Criaturas, horrores e predadores que surgem da escuridao.",
  },
  locais: {
    label: "Locais",
    description: "Ruinas, torres e fronteiras onde o mundo deixa suas cicatrizes.",
  },
  faccoes: {
    label: "Faccoes",
    description: "Ordens, conclaves e alianzas que disputam o destino do reino.",
  },
  historia: {
    label: "Historia",
    description: "Eras, colapsos e pactos que explicam o presente do universo.",
  },
};

export const globalTimeline: EncyclopediaTimelineEvent[] = [
  {
    period: "Era das Runas",
    title: "As runas ancoram o poder dos reinos",
    description: "Os primeiros arcanistas aprendem a gravar memoria e magia em pedra viva.",
  },
  {
    period: "Ano 0 da Ruina",
    title: "A Grande Ruina rompe o equilibrio",
    description: "Um ritual de contencao falha e abre fendas por todo o continente central.",
  },
  {
    period: "Ano 17",
    title: "A Ordem da Brasa Negra assume as fronteiras",
    description: "Milicias e inquisidores tomam antigas fortalezas para segurar as fendas.",
  },
  {
    period: "Ano 31",
    title: "A Cripta de Velkyn volta a pulsar",
    description: "Runas esquecidas despertam sob o vale e atraem faccoes rivais.",
  },
];

export const encyclopediaEntries: EncyclopediaEntry[] = [
  {
    slug: "elara-voss",
    title: "Elara Voss",
    category: "personagens",
    subtitle: "Arcanista exilada e principal cartografa das fendas de Velkyn.",
    summary: "Elara transformou o estudo das fendas em uma arte de sobrevivencia, ligando academias mortas, faccoes vivas e o mapa ritual do vale.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de uma arcanista em estilo de cronica.",
    narrative: [
      {
        heading: "Voz da margem",
        body: "Filha de uma linhagem menor da capital, Elara recusou o conforto da corte para seguir os relatos de campo sobre runas que respiravam. Quando o Conclave das Cinzas decidiu censurar suas anotacoes, ela levou os cadernos para as fronteiras e passou a registrar os locais onde o tecido do mundo rasga.",
      },
      {
        heading: "Cartografia viva",
        body: "Seu metodo mistura calculo, supersticao e coragem. Elara desenha mapas sobre pergaminhos tratados com cinza de vela e sangue de tinta, porque acredita que certos lugares so podem ser lembrados se a memoria pagar um preco. Por isso, suas cartas sao cobicadas tanto pela Ordem da Brasa Negra quanto por saqueadores da Cripta de Velkyn.",
      },
      {
        heading: "Papel na campanha",
        body: "Na enciclopedia, Elara funciona como ponte entre personagens, faccoes e historia. Seguir seus registros leva direto a locais como a Torre de Obsidiana e ajuda a entender por que a Grande Ruina nunca terminou de fato.",
      },
    ],
    internalLinks: [
      "cripta-de-velkyn",
      "conclave-das-cinzas",
      "grande-ruina",
    ],
    timeline: [
      {
        period: "Ano 21",
        title: "Expulsao do Conclave",
        description: "Elara e removida dos arquivos depois de publicar um mapa proibido das fendas do sul.",
      },
      {
        period: "Ano 27",
        title: "Primeira expedicao a Velkyn",
        description: "Ela registra anomalias na cripta e prova que as runas da Ruina continuam ativas.",
      },
      {
        period: "Ano 31",
        title: "Mapa das respiracoes",
        description: "Seu atlas passa a circular entre aventureiros e muda a disputa pela regiao.",
      },
    ],
    stats: [
      { label: "Afiliacao", value: "Independente" },
      { label: "Especialidade", value: "Mapas runicos" },
      { label: "Ligacao central", value: "Cripta de Velkyn" },
    ],
  },
  {
    slug: "rei-aedric-iv",
    title: "Rei Aedric IV",
    category: "personagens",
    subtitle: "Soberano que governa um reino cansado, preso entre fe e pragmatismo.",
    summary: "Aedric IV segura o trono com discursos de unidade, mas depende de faccoes que ja nao compartilham o mesmo futuro.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um rei em tons dourados e sombrios.",
    narrative: [
      {
        heading: "Trono rachado",
        body: "Aedric herdou o reino depois de uma sucessao curta e brutal. Desde entao, tenta parecer maior do que a crise que comanda. Seus decretos falam em restauracao, mas seu conselho trabalha no modo de contingencia ha mais de uma decada.",
      },
      {
        heading: "Aliancas custosas",
        body: "Sem tropas suficientes para guardar todas as estradas, o rei entregou fortalezas inteiras a ordens militares e tolerou o crescimento de conclaves de estudo. Essa escolha manteve o reino de pe, mas fragmentou a autoridade real.",
      },
      {
        heading: "Figura de tensao",
        body: "As paginas sobre Aedric ligam politica e campo de batalha. Quem entende o rei entende por que faccoes como a Ordem da Brasa Negra agem com tanta autonomia e por que locais como a Torre de Obsidiana ainda escapam ao controle da coroa.",
      },
    ],
    internalLinks: [
      "ordem-da-brasa-negra",
      "torre-de-obsidiana",
      "era-das-runas",
    ],
    timeline: [
      {
        period: "Ano 14",
        title: "Coroacao em tempos de fome",
        description: "Aedric assume o trono em meio a saques nas estradas do norte.",
      },
      {
        period: "Ano 19",
        title: "Pacto das fortalezas",
        description: "Ele delega trechos da fronteira a ordens militares e perde poder direto.",
      },
      {
        period: "Ano 30",
        title: "Conselho dividido",
        description: "A coroa passa a depender de informacoes trazidas por exploradores independentes.",
      },
    ],
    stats: [
      { label: "Titulo", value: "Rei de Aldren" },
      { label: "Forca politica", value: "Fragil e ritualizada" },
      { label: "Aliados", value: "Ordens militares" },
    ],
  },
  {
    slug: "sentinela-sombria",
    title: "Sentinela Sombria",
    category: "monstros",
    subtitle: "Guardiao runico despertado por presencas vivas em zonas seladas.",
    summary: "As sentinelas nao cacam por fome; elas patrulham para manter um juramento antigo, mesmo depois da queda de seus criadores.",
    image: monsterIllustration,
    imageAlt: "Placa de bestiario com um rosto monstruoso e olhos dourados.",
    narrative: [
      {
        heading: "Origem ritual",
        body: "As sentinelas nasceram na Era das Runas como servos de vigia, fundidas com metal escuro, osso e um fragmento de eco espiritual. Quando as casas runicas ruiram, muitas permaneceram nos corredores que haviam jurado proteger.",
      },
      {
        heading: "Comportamento",
        body: "Elas nao falam, mas respondem a gravacoes antigas, sinos votivos e padroes de luz. Exploradores experientes dizem que cada sentinela repete um pedaco do ultimo comando que ouviu, preso num ciclo que mistura disciplina e fantasma.",
      },
      {
        heading: "Uso enciclopedico",
        body: "Este verbete conecta monstros e historia: entender a sentinela ajuda a ler a Cripta de Velkyn e a perceber como a Grande Ruina deixou maquinas vivas espalhadas pelo mapa.",
      },
    ],
    internalLinks: [
      "cripta-de-velkyn",
      "era-das-runas",
      "grande-ruina",
    ],
    timeline: [
      {
        period: "Era das Runas",
        title: "Primeiras forjas de vigia",
        description: "As casas runicas criam guardioes para proteger laboratorios e criptas.",
      },
      {
        period: "Ano 0 da Ruina",
        title: "Quebra dos comandos",
        description: "A maioria das sentinelas perde cadeia de comando e entra em patrulha eterna.",
      },
      {
        period: "Ano 31",
        title: "Despertar em Velkyn",
        description: "O retorno das runas faz novas sentinelas sairem das paredes da cripta.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Guardiao runico" },
      { label: "Ameaca", value: "Alta em corredores fechados" },
      { label: "Fraqueza", value: "Comandos rituais incompletos" },
    ],
  },
  {
    slug: "devorador-de-cinzas",
    title: "Devorador de Cinzas",
    category: "monstros",
    subtitle: "Predador de campos queimados que se alimenta de memoria e calor.",
    summary: "Nas areas em que a Ruina queimou a historia local, o Devorador aparece como se estivesse recolhendo o que sobrou do mundo.",
    image: monsterIllustration,
    imageAlt: "Ilustracao de um monstro enciclopedia em tons vermelhos e dourados.",
    narrative: [
      {
        heading: "Rastro de brasas",
        body: "Ninguem sabe se ele evoluiu de um animal real ou de uma maldicao. O que se sabe e que sempre surge depois de incendios ritualisticos, quando a fumaca ainda carrega nomes que ninguem mais lembra.",
      },
      {
        heading: "Caca e territorio",
        body: "O Devorador ronda ruinas frias como se procurasse calor residual. Ele evita cidades grandes e prefere fronteiras devastadas, onde a presenca humana ainda nao conseguiu dar significado novo ao espaco destruido.",
      },
      {
        heading: "Ligacoes narrativas",
        body: "Este monstro faz pontes entre locais devastados, faccoes incendiarias e eventos da Grande Ruina. Muitas cronicas da Ordem da Brasa Negra o tratam como mau agouro de uma nova abertura de fenda.",
      },
    ],
    internalLinks: [
      "ordem-da-brasa-negra",
      "grande-ruina",
      "torre-de-obsidiana",
    ],
    timeline: [
      {
        period: "Ano 3",
        title: "Primeiros relatos no leste",
        description: "Patrulhas encontram pegadas carbonizadas em campos abandonados.",
      },
      {
        period: "Ano 18",
        title: "Fogueiras do norte",
        description: "O monstro aparece apos o incendio de tres vilas perto das fortalezas fronteiricas.",
      },
      {
        period: "Ano 29",
        title: "Cacada falha",
        description: "Uma companhia inteira some ao tentar persegui-lo alem da cinza funda.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Aberracao de ruina" },
      { label: "Habitat", value: "Campos queimados" },
      { label: "Sinal", value: "Cinza morna ao amanhecer" },
    ],
  },
  {
    slug: "cripta-de-velkyn",
    title: "Cripta de Velkyn",
    category: "locais",
    subtitle: "Santuario subterraneo em que runas antigas voltaram a pulsar.",
    summary: "Velkyn e ao mesmo tempo mausoleu, laboratorio e cofre de erros antigos. Por isso o local concentra aventureiros, faccoes e monstros como nenhum outro ponto do reino.",
    image: locationIllustration,
    imageAlt: "Paisagem ilustrada de ruinas e torres em estilo atlas.",
    narrative: [
      {
        heading: "Camadas de pedra e sigilo",
        body: "A cripta foi escavada em epocas diferentes. Os niveis superiores guardam sepulturas nobres, enquanto os inferiores escondem corredores de pesquisa runica que jamais deveriam ter sido anexados a um santuario funerario.",
      },
      {
        heading: "Centro da disputa",
        body: "Toda faccao importante quer algo dali: armas, mapas, provas, reliquias ou simplesmente o direito de dizer que controla o lugar. Isso faz de Velkyn um palco natural para conflitos e uma pagina central da enciclopedia.",
      },
      {
        heading: "Ponto de referencia",
        body: "Quem entra por Velkyn rapidamente esbarra em Elara Voss, sentinelas sombrias e registros da Grande Ruina. O local foi pensado para funcionar como nodo de ligacoes internas entre as principais areas do universo.",
      },
    ],
    internalLinks: [
      "elara-voss",
      "sentinela-sombria",
      "conclave-das-cinzas",
    ],
    timeline: [
      {
        period: "Antes da Ruina",
        title: "Fundacao funeraria",
        description: "Nobres do vale constroem uma cripta cerimonial sobre cavidades mais antigas.",
      },
      {
        period: "Ano 0",
        title: "Selamento apressado",
        description: "Depois da Grande Ruina, corredores inferiores sao lacrados com runas de emergencia.",
      },
      {
        period: "Ano 31",
        title: "Pulso reativado",
        description: "As runas retornam e revelam passagens que nao constavam nos mapas da corte.",
      },
    ],
    stats: [
      { label: "Regiao", value: "Vale de Velkyn" },
      { label: "Estado", value: "Instavel e disputado" },
      { label: "Acesso", value: "Expedicoes autorizadas ou clandestinas" },
    ],
  },
  {
    slug: "torre-de-obsidiana",
    title: "Torre de Obsidiana",
    category: "locais",
    subtitle: "Observatorio vertical onde a coroa perdeu o controle da propria memoria.",
    summary: "A Torre de Obsidiana domina a fronteira oriental e guarda arquivos que foram reescritos tantas vezes que ja parecem uma forma de magia.",
    image: locationIllustration,
    imageAlt: "Ilustracao de uma torre sombria destacada em um atlas fantastico.",
    narrative: [
      {
        heading: "Arquivo acima da guerra",
        body: "A torre foi desenhada para observar ceu, fronteira e fluxo ritual. Em teoria, ela serviria ao trono. Na pratica, virou um espaco de negociacao entre burocratas, magos e vigias que alteram registros para manter certas verdades fora da corte.",
      },
      {
        heading: "Biblioteca opaca",
        body: "Seus andares guardam espelhos de obsidiana que respondem a nomes esquecidos. Alguns documentos so podem ser lidos quando refletidos nesses espelhos, e outros simplesmente devolvem imagens de eventos que jamais foram oficialmente admitidos.",
      },
      {
        heading: "Funcao enciclopedica",
        body: "A torre conecta personagens politicos, faccoes e a linha maior da historia. Nela, o leitor percebe como o passado do reino foi administrado, escondido e vendido como estabilidade.",
      },
    ],
    internalLinks: [
      "rei-aedric-iv",
      "devorador-de-cinzas",
      "grande-ruina",
    ],
    timeline: [
      {
        period: "Era das Runas",
        title: "Levantamento da torre",
        description: "Astronomos runicos constroem a estrutura para monitorar correntes celestes.",
      },
      {
        period: "Ano 11",
        title: "Militarizacao do arquivo",
        description: "A coroa converte o observatorio em posto de inteligencia e censura.",
      },
      {
        period: "Ano 28",
        title: "Apagao de registros",
        description: "Andares inteiros desaparecem dos inventarios oficiais sem explicacao convincente.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Observatorio e arquivo" },
      { label: "Controle", value: "Coroa e burocracias rivais" },
      { label: "Perigo", value: "Memoria distorcida" },
    ],
  },
  {
    slug: "ordem-da-brasa-negra",
    title: "Ordem da Brasa Negra",
    category: "faccoes",
    subtitle: "Milicia sagrada que protege fronteiras enquanto negocia poder politico.",
    summary: "A Ordem nasceu para conter a Ruina, mas sobreviveu tempo suficiente para desenvolver uma ambicao propria.",
    image: factionIllustration,
    imageAlt: "Sigilo ilustrado de uma faccao militar e religiosa.",
    narrative: [
      {
        heading: "Mandato de fronteira",
        body: "A Ordem recebeu fortalezas, permissao de patrulha e imunidades juridicas em troca de vigiar fendas e comboios. O acordo parecia emergencial, mas se tornou permanente e fez da ordem um poder paralelo.",
      },
      {
        heading: "Doutrina de fogo",
        body: "Seus capitulos acreditam que toda corrupcao pode ser contida com disciplina, vigia e purga. Essa visao os torna eficientes contra monstros, mas perigosos para aldeias inteiras quando suspeitam de contagio ritual.",
      },
      {
        heading: "Posicao no mundo",
        body: "Na enciclopedia, a Ordem serve como elo entre politica, locais e monstros. Ela cruza o caminho de Aedric, do Devorador de Cinzas e de praticamente toda expedicao que tenta agir fora da fronteira oficial.",
      },
    ],
    internalLinks: [
      "rei-aedric-iv",
      "devorador-de-cinzas",
      "grande-ruina",
    ],
    timeline: [
      {
        period: "Ano 2",
        title: "Fundacao emergencial",
        description: "Veteranos e inquisidores se unem para proteger povoados proximos das fendas.",
      },
      {
        period: "Ano 17",
        title: "Autonomia armada",
        description: "A ordem assume fortalezas e passa a responder mais ao proprio concilio do que ao trono.",
      },
      {
        period: "Ano 30",
        title: "Campanha de purga",
        description: "Capitulos rivais discordam sobre como lidar com locais reativados como Velkyn.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Milicia religiosa" },
      { label: "Base", value: "Fortalezas da fronteira" },
      { label: "Influencia", value: "Alta fora da capital" },
    ],
  },
  {
    slug: "conclave-das-cinzas",
    title: "Conclave das Cinzas",
    category: "faccoes",
    subtitle: "Rede de estudiosos que coleta, esconde e vende conhecimento perigoso.",
    summary: "O Conclave afirma preservar saber. Seus criticos respondem que ele preserva, acima de tudo, o monopolio sobre a interpretacao do passado.",
    image: factionIllustration,
    imageAlt: "Sigilo ilustrado de uma ordem erudita e secreta.",
    narrative: [
      {
        heading: "Arquivo e mercado",
        body: "O Conclave nasceu das ruinas de bibliotecas queimadas. Seus membros juraram salvar o maximo de textos possivel, mas logo perceberam que controlar a leitura de certos textos lhes dava poder sobre reis e aventureiros.",
      },
      {
        heading: "Censura elegante",
        body: "Ao inves de destruir tudo o que teme, o Conclave prefere trancar, recortar e editar. Foi essa politica que colocou Elara Voss contra seus superiores e espalhou copias incompletas de mapas e rituais por toda a fronteira.",
      },
      {
        heading: "Papel na enciclopedia",
        body: "A faccao cria ligacoes internas naturais com historia, locais e personagens. Sempre que o leitor encontra uma lacuna no passado do reino, quase sempre existe uma sala do Conclave onde essa lacuna foi produzida de proposito.",
      },
    ],
    internalLinks: [
      "elara-voss",
      "cripta-de-velkyn",
      "era-das-runas",
    ],
    timeline: [
      {
        period: "Ano 4",
        title: "Fundacao dos arquivos cinzentos",
        description: "Scribas e sobreviventes organizam os primeiros depositos secretos de conhecimento.",
      },
      {
        period: "Ano 21",
        title: "Censura das cartas runicas",
        description: "O Conclave expulsa Elara e confisca parte de seus mapas.",
      },
      {
        period: "Ano 31",
        title: "Retorno a Velkyn",
        description: "Delegacoes discretas tentam recuperar artefatos antes da coroa descobrir tudo.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Rede erudita" },
      { label: "Metodo", value: "Arquivar e controlar" },
      { label: "Recurso central", value: "Conhecimento proibido" },
    ],
  },
  {
    slug: "grande-ruina",
    title: "Grande Ruina",
    category: "historia",
    subtitle: "Evento fundador da era atual, quando o mundo passou a vazar por suas proprias costuras.",
    summary: "A Grande Ruina nao foi um unico desastre, mas uma cadeia de falhas rituais que redesenhou politica, geografia e memoria.",
    image: historyIllustration,
    imageAlt: "Codice ilustrado com linha do tempo dourada.",
    narrative: [
      {
        heading: "Falha em cascata",
        body: "Tudo indica que a Ruina comecou como um esforco coordenado para estabilizar redes de runas continentais. Quando uma casa principal caiu, as outras tentaram compensar o fluxo e produziram uma reacao em cadeia que abriu fendas e apagou regioes inteiras dos mapas.",
      },
      {
        heading: "Depois do rasgo",
        body: "Povoados desapareceram, fortalezas viraram ilhas e arquivos passaram a contradizer uns aos outros. A Ruina nao apenas matou pessoas; ela embaralhou a forma como o reino lembrava de si mesmo.",
      },
      {
        heading: "Centro da enciclopedia",
        body: "Este verbete e o eixo de navegacao do sistema. Quase todas as paginas se conectam a ele porque a Ruina explica a origem dos monstros, a fragmentacao das faccoes e a importancia de locais como Velkyn e a Torre de Obsidiana.",
      },
    ],
    internalLinks: [
      "era-das-runas",
      "torre-de-obsidiana",
      "ordem-da-brasa-negra",
    ],
    timeline: [
      {
        period: "Ano 0",
        title: "Ruptura inicial",
        description: "A malha runica continental entra em colapso e as fendas se multiplicam.",
      },
      {
        period: "Ano 1 a 5",
        title: "Cartografia perdida",
        description: "A corte reescreve mapas sem conseguir acompanhar o que realmente mudou.",
      },
      {
        period: "Ano 17 em diante",
        title: "Normalizacao da crise",
        description: "Ordens militares e conclaves passam a administrar o que deveria ser emergencia.",
      },
    ],
    stats: [
      { label: "Escopo", value: "Continental" },
      { label: "Consequencia", value: "Fendas e apagamentos" },
      { label: "Legado", value: "Estado de crise permanente" },
    ],
  },
  {
    slug: "era-das-runas",
    title: "Era das Runas",
    category: "historia",
    subtitle: "Periodo em que casas arcanas estruturaram o reino sobre escrita viva.",
    summary: "Antes da Ruina, as runas eram arquitetura, lei, medicina e guerra. A era terminou, mas seus alicerces ainda sustentam o presente.",
    image: historyIllustration,
    imageAlt: "Pergaminho ilustrado com marcas de linha do tempo e runas.",
    narrative: [
      {
        heading: "Escrita como engenharia",
        body: "Durante a Era das Runas, conhecimento e construcao eram praticamente a mesma coisa. Pontes, muralhas, arquivos e juramentos eram gravados em superficies capazes de responder a voz, sangue ou memoria.",
      },
      {
        heading: "Ascensao das casas",
        body: "As grandes casas runicas competiam por precisao, alcance e prestigio. Dessa corrida surgiram observatorios, guardioes artificiais e criptas tao complexas que sobreviveram a seus fundadores.",
      },
      {
        heading: "Importancia enciclopedica",
        body: "Este verbete da contexto para monstros como a Sentinela Sombria e para locais como a Torre de Obsidiana. Ele funciona como porta de entrada para tudo que parece antigo demais para a politica atual.",
      },
    ],
    internalLinks: [
      "sentinela-sombria",
      "torre-de-obsidiana",
      "conclave-das-cinzas",
    ],
    timeline: [
      {
        period: "Seculos iniciais",
        title: "Fundacao das casas runicas",
        description: "Mestres de inscricao transformam cidades em sistemas de escrita funcional.",
      },
      {
        period: "Apice",
        title: "Expansao dos observatorios",
        description: "Torres e criptas ganham funcao cientifica, ritual e politica ao mesmo tempo.",
      },
      {
        period: "Declinio",
        title: "Sobrecarga da rede",
        description: "A ambicao por integrar tudo na mesma malha prepara o terreno para a Ruina.",
      },
    ],
    stats: [
      { label: "Tema central", value: "Magia estrutural" },
      { label: "Instituicoes", value: "Casas runicas" },
      { label: "Heranca", value: "Ruinas vivas e artefatos" },
    ],
  },
];

export function getEncyclopediaEntry(slug: string) {
  return encyclopediaEntries.find((entry) => entry.slug === slug) ?? null;
}

export function getEntriesByCategory(category: EncyclopediaCategory) {
  return encyclopediaEntries.filter((entry) => entry.category === category);
}

export function getLinkedEntries(entry: EncyclopediaEntry) {
  return entry.internalLinks
    .map((slug) => getEncyclopediaEntry(slug))
    .filter((linkedEntry): linkedEntry is EncyclopediaEntry => Boolean(linkedEntry));
}
