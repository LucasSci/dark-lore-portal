import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import factionIllustration from "@/assets/encyclopedia/faction-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
import monsterIllustration from "@/assets/encyclopedia/monster-illustration.svg";
import { witcherBestiaryEntries } from "@/lib/witcher-bestiary";

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

export interface EncyclopediaVttProfile {
  hp: number;
  ac: number;
  initiativeBonus: number;
  role: string;
  note: string;
  color?: string;
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
  vtt?: EncyclopediaVttProfile;
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
    description: "Eruditos, escolhidos, mercenarios e sobreviventes que atravessam o colapso do Veu.",
  },
  monstros: {
    label: "Monstros",
    description: "Aparicoes, guardioes e criaturas que surgem quando o mundo deixa de se comportar como deveria.",
  },
  locais: {
    label: "Locais",
    description: "Costas, desertos, adegas e limiares onde a realidade se rasga e volta diferente.",
  },
  faccoes: {
    label: "Faccoes",
    description: "Conclaves, templos e agrupamentos que tentam interpretar ou controlar a crise.",
  },
  historia: {
    label: "Historia",
    description: "Quedas, profecias e convergencias que reorganizam a cronica de Zerrikania.",
  },
};

export const globalTimeline: EncyclopediaTimelineEvent[] = [
  {
    period: "Prologo",
    title: "O Veu comeca a ceder",
    description:
      "A fronteira invisivel entre mundos afrouxa, e a realidade deixa de manter sozinha a antiga distancia entre o que deveria permanecer separado.",
  },
  {
    period: "Capitulos 1-5",
    title: "Merlin testemunha as Irmas de Prata",
    description:
      "Na costa, o erudito passa de observador a cronista do colapso enquanto mulheres de prata, portais e medos coletivos surgem como consequencia da fissura.",
  },
  {
    period: "Capitulos 6-11",
    title: "Nashara recusa a correcao total",
    description:
      "Em Zerrikania, a profecia, os Guardioes e o Dragao Negro empurram o mundo para uma escolha entre sobrevivencia sem excecao e um futuro ainda imperfeito.",
  },
  {
    period: "Capitulo 12",
    title: "O Espectro recalcula com os Fragmentos de Luna",
    description:
      "Depois da recusa de Nashara, a crise passa a operar por convergencia: vidas distantes se tornam vetores de uma nova leitura do colapso.",
  },
  {
    period: "Capitulos 12-17",
    title: "Alaric, Sorrow e Hauz sao reunidos",
    description:
      "O Grimorio Lunar, o deserto, Elarion e Vaz'hir puxam tres trajetorias diferentes para o mesmo limiar.",
  },
];

const handcraftedEncyclopediaEntries: EncyclopediaEntry[] = [
  {
    slug: "merlin",
    title: "Merlin",
    category: "personagens",
    subtitle: "Erudito costeiro que presencia o inicio visivel do rasgo no Veu e decide nao organizar tudo em um livro seguro demais.",
    summary:
      "Merlin deixa de ser apenas testemunha e se torna eixo moral da primeira metade da cronica: ele ve cedo o que esta acontecendo e entende cedo demais o perigo de transformar isso em sistema fechado demais.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um erudito envelhecido diante do mar.",
    narrative: [
      {
        heading: "O observador da costa",
        body:
          "Merlin aparece quando o colapso ainda pode ser confundido com boato, delirio ou mau pressagio. Sua grande funcao no texto e notar que o mundo nao esta so produzindo monstros novos, mas desaprendendo a ser inteiro.",
      },
      {
        heading: "O homem que nomeia sem domesticar",
        body:
          "Ele observa as Irmas de Prata, escuta pescadores, sacerdotes, reis e magos, mas se recusa a tratar o problema como uma equacao confortável. Merlin compreende algo raro: conhecimento arrancado do conjunto pode ser mais perigoso do que ignorancia.",
      },
      {
        heading: "Legado de fragmento",
        body:
          "Sua morte importa porque ele nao entrega ao mundo um tratado definitivo. Em vez disso, deixa margens, observacoes e restos, como se quisesse impedir que leitores tardios transformassem a ferida do Veu em ferramenta de poder rapido.",
      },
    ],
    internalLinks: ["cedencia-do-veu", "irmas-de-prata", "fragmentos-de-luna"],
    timeline: [
      {
        period: "Capitulos 1-5",
        title: "Reconhece a mudanca na costa",
        description:
          "Entre mar, falas de aldeia e sinais de passagem, Merlin percebe que a realidade esta cedendo antes de todo o resto aceitar isso.",
      },
      {
        period: "Crise do medo",
        title: "Enfrenta sacerdotes, magos e curiosos",
        description:
          "Sua cabana vira ponto de consulta para quem quer respostas simples num fenomeno que so oferece consequencias.",
      },
      {
        period: "Capitulo 12",
        title: "Morre sem fechar o sentido do que viu",
        description:
          "A ausencia de um texto final vira parte da propria defesa contra leituras convenientes do colapso.",
      },
    ],
    stats: [
      { label: "Papel", value: "Cronista da fissura" },
      { label: "Ambiente", value: "Costa e abrigo de observacao" },
      { label: "Legado", value: "Fragmentos, margens e prudencia" },
    ],
  },
  {
    slug: "nashara",
    title: "Nashara",
    category: "personagens",
    subtitle: "Figura profetizada de Zerrikania que caminha entre Guardioes e recusa a solucao perfeita demais.",
    summary:
      "Nashara nao e so heroina do deserto. Ela se torna o ponto em que a historia pergunta se o mundo vale mais inteiro sem excecoes ou ferido, mas ainda capaz de mudar.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de uma mulher do deserto sob um ceu rachado.",
    narrative: [
      {
        heading: "Nome preparado pelo medo",
        body:
          "A profecia faz de Nashara uma resposta aguardada por reis, templos, magos e povos exaustos. Isso pesa sobre sua vida inteira: ela cresce entre versos repetidos por outros, mesmo antes de decidir o que pensa deles.",
      },
      {
        heading: "Entre Guardioes e destino",
        body:
          "A cronica a aproxima dos Guardioes, da areia negra, da serpente alada e do Dragao Negro. Mas sua importancia real nao esta em obedecer ao papel escrito; esta em entender que muita gente queria que ela confirmasse uma conclusao pronta.",
      },
      {
        heading: "A recusa que muda o eixo",
        body:
          "Diante da promessa de uma correcao absoluta, Nashara escolhe a falha viva em vez da paz sem excecao. Essa negativa reposiciona todo o universo: o mundo continua doente, mas nao se entrega a um conserto que mataria o que escapa ao calculo.",
      },
    ],
    internalLinks: ["profecia-de-nashara", "zerrikania-de-areia-negra", "dragao-negro"],
    timeline: [
      {
        period: "Capitulos 6-8",
        title: "Passa a ser lida como centro da profecia",
        description:
          "Os versos deixam de ser rumor disperso e passam a convergir explicitamente para o nome de Nashara.",
      },
      {
        period: "Capitulo 9",
        title: "Confronta o Dragao Negro",
        description:
          "Sua escolha diante da solucao total redefiniria a direcao da crise.",
      },
      {
        period: "Capitulos 10-11",
        title: "Vira memoria disputada",
        description:
          "Depois da recusa, Zerrikania continua sangrando e a historia dela comeca a ser recontada, aparada e usada por outros.",
      },
    ],
    stats: [
      { label: "Funcao narrativa", value: "Escolhida que diz nao" },
      { label: "Dominio", value: "Zerrikania e os Guardioes" },
      { label: "Conflito central", value: "Destino contra excecao" },
    ],
  },
  {
    slug: "alaric-dorne",
    title: "Alaric Dorne",
    category: "personagens",
    subtitle: "Erudito de Novigrad que usa o Grimorio Lunar para medir uma falha e acaba puxado para dentro dela.",
    summary:
      "Alaric representa a segunda metade da cronica: um homem de metodo, desconfiado do sobrenatural teatral, que descobre tarde demais que o livro ja estava lendo ele de volta.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um mago erudito com grimorio fechado.",
    narrative: [
      {
        heading: "Metodo antes de fe",
        body:
          "Alaric nao entra na historia como devoto ou aventureiro romântico. Ele prepara circulos, mede prata, corta a propria palma e trata o ritual como experimento controlado, o que torna o fracasso ainda mais significativo.",
      },
      {
        heading: "O Grimorio escolhe mais do que responde",
        body:
          "Ao usar o Grimorio Lunar para tatear a margem do fenomeno, Alaric descobre que o portal nao foi somente aberto. Ele foi reconhecido. O texto trabalha isso como violacao reciproca: ele toca o outro lado e o outro lado toca de volta.",
      },
      {
        heading: "Leitor puxado para dentro",
        body:
          "Nos capitulos finais, Alaric continua sendo o homem do livro, da leitura e da analise, mas agora num espaco em que parede, taverna, caverna e deserto se comportam como camadas sobrepostas. Seu papel passa a ser menos iniciar e mais interpretar sob pressao.",
      },
    ],
    internalLinks: ["novigrad-subterranea", "fragmentos-de-luna", "elarion"],
    timeline: [
      {
        period: "Capitulo 12",
        title: "Executa o ritual do Grimorio Lunar",
        description:
          "Na adega escondida de Novigrad, Alaric corta a propria mao e descobre que a pagina responde a outra coisa.",
      },
      {
        period: "Travessia",
        title: "E puxado para o deserto por ressonancia",
        description:
          "A experiencia deixa claro que a ruptura entre mundos ja nao e passiva.",
      },
      {
        period: "Capitulos 16-17",
        title: "Passa a compor o trio de leitura de Vaz'hir",
        description:
          "Sua funcao muda de experimentador isolado para vetor consciente dentro de uma convergencia maior.",
      },
    ],
    stats: [
      { label: "Origem", value: "Novigrad" },
      { label: "Ferramenta central", value: "Grimorio Lunar" },
      { label: "Traco dominante", value: "Metodo e desconfiança" },
    ],
  },
  {
    slug: "sorrow-noxmourn",
    title: "Sorrow Noxmourn",
    category: "personagens",
    subtitle: "Mercenario elfico de ironia seca, arrastado por contratos ruins e por uma relacao nada natural com a morte.",
    summary:
      "Sorrow e o personagem que mais rapidamente fareja falsidade em cenas construidas demais, mas isso nao o impede de ser escolhido pela propria distorcao do mundo.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um elfo com taça e alaude ao alcance da mao.",
    narrative: [
      {
        heading: "Cinismo profissional",
        body:
          "Sorrow aceita servicos por dinheiro, conveniencia e curiosidade mal resolvida, mas raramente por crença. Seu modo de ler carruagens, estalagens, clientes e vinho funciona como defesa contra qualquer sistema que tente se fingir de mais limpo do que e.",
      },
      {
        heading: "Proximidade errada com a morte",
        body:
          "Vaz'hir diz que a relacao dele com a morte nao e natural, e o texto trata isso como traço estrutural, nao como susto momentaneo. Isso torna Sorrow uma peca anomala: alguem vivo, funcional e, ainda assim, tocado por um tipo de continuidade que o resto do grupo nao partilha.",
      },
      {
        heading: "O humor como autodefesa",
        body:
          "Nas cenas com Alaric e Hauz, Sorrow usa sarcasmo para desarmar hierarquias e testar o espaco. O que o torna importante nao e apenas a lingua ferina, mas a capacidade de sentir quando uma mentira esta estavel demais para ser casual.",
      },
    ],
    internalLinks: ["alaric-dorne", "hauz-darnen", "elarion"],
    timeline: [
      {
        period: "Capitulo 13",
        title: "Aceita a carruagem e o contrato torto",
        description:
          "O pedido ligado a cancao, retorno e deserto o coloca na rota da convergencia.",
      },
      {
        period: "Travessia",
        title: "Chega ao mesmo dominio limiar que os outros vetores",
        description:
          "Seu sarcasmo sobrevive, mas a cena ja nao permite tratar tudo como mero golpe de contratante rico.",
      },
      {
        period: "Capitulos 16-17",
        title: "Assume papel de leitor agressivo do espaco",
        description:
          "Sorrow testa a mentira do ambiente com o proprio corpo e com a recusa de aceitar conforto rapido.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Mercenario elfico" },
      { label: "Instrumentos", value: "Alaude, sarcasmo e observacao" },
      { label: "Anomalia", value: "Ligacao inadequada com a morte" },
    ],
  },
  {
    slug: "hauz-darnen",
    title: "Hauz Darnen",
    category: "personagens",
    subtitle: "Guerreiro de leitura economica, guiado por uma espada que reconhece nomes antes da mente aceitar o que eles significam.",
    summary:
      "Hauz carrega o polo mais fisico da convergencia, e sua arma comeca a lembrar coisas mais antigas do que ele gostaria.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um guerreiro com espada envolta em pano.",
    narrative: [
      {
        heading: "Poucas perguntas, muita memoria",
        body:
          "Hauz e apresentado como alguem que atravessa vilarejos, ruinas e cavernas sem desperdiçar palavras. O silencio dele nao e vazio; e economia de quem aprendeu a nao oferecer ao mundo mais superficie do que o necessario.",
      },
      {
        heading: "A espada conhece Elarion",
        body:
          "Quando o nome Elarion surge, a lamina reage antes de qualquer explicacao satisfatoria. Hauz nao e o erudito do grupo, mas carrega um arquivo de reconhecimento no proprio metal que empunha.",
      },
      {
        heading: "Centro de gravidade do trio",
        body:
          "Ao lado de Alaric e Sorrow, Hauz funciona como eixo de materialidade. Ele mede risco pelo corpo, pelo cabo da espada e pelo comportamento das paredes, mantendo a leitura da cena aterrada mesmo quando o mundo insiste em se dobrar.",
      },
    ],
    internalLinks: ["alaric-dorne", "sorrow-noxmourn", "elarion"],
    timeline: [
      {
        period: "Capitulos 15-16",
        title: "E puxado para a caverna do encontro",
        description:
          "Sua rota chega a um limiar onde espada, grimorio e deserto passam a conversar entre si.",
      },
      {
        period: "Nome revelado",
        title: "Pronuncia Elarion e sente a resposta",
        description:
          "O reconhecimento pela lamina indica que Hauz ja vinha carregando mais passado do que sabia.",
      },
      {
        period: "Capitulo 17",
        title: "Mantem o olhar armado dentro do ambiente falso-estavel",
        description:
          "Quando o trio desperta na estalagem improvavel, Hauz e o primeiro a tratar a estabilidade como suspeita.",
      },
    ],
    stats: [
      { label: "Papel", value: "Guerreiro e ancora fisica" },
      { label: "Marca central", value: "Espada que reconhece Elarion" },
      { label: "Metodo", value: "Economia, instinto e pressao corporal" },
    ],
  },
  {
    slug: "agregor",
    title: "Agregor",
    category: "personagens",
    subtitle: "Vigia das marinhas frias que nota a mudanca no horizonte antes do resto da costa encontrar coragem para nomea-la.",
    summary:
      "Agregor e um dos primeiros homens a ver a estranheza se aproximando pelo mar e a compreender que o fenomeno nao se parece com pressagio, tempestade ou supersticao comum.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de um vigia costeiro diante de um mar metalico.",
    narrative: [
      {
        heading: "Olhos voltados para o horizonte",
        body:
          "Na beira do mar, Agregor observa a luz se movendo sobre a agua com paciencia de homem acostumado a diferenciar milagre, fraude e desastre. O que ele encontra nao cabe em nenhuma dessas caixas por muito tempo.",
      },
      {
        heading: "Primeiro a desconfiar da forma errada do mundo",
        body:
          "Sua importancia esta menos no combate e mais na leitura do instante. Ele sente cedo demais que a agua, a lua e o brilho no horizonte estao obedecendo a outra ordem.",
      },
      {
        heading: "Testemunha antes do rumor",
        body:
          "Os relatos sobre o que vem do mar ganham corpo porque Agregor viu antes de quase todos e nao se permitiu chamar aquilo de exagero por conforto.",
      },
    ],
    internalLinks: ["merlin", "irmas-de-prata", "cedencia-do-veu"],
    timeline: [
      {
        period: "Prologo",
        title: "Percebe a luz sobre o mar",
        description:
          "O primeiro pressentimento da crise ganha forma diante dele antes de se espalhar pela costa.",
      },
      {
        period: "Vigilia da costa",
        title: "Ajuda a transformar espanto em relato",
        description:
          "Sua observacao reforca a ideia de que o fenomeno nao e alucinacao isolada.",
      },
    ],
    stats: [
      { label: "Funcao", value: "Testemunha da costa" },
      { label: "Marca", value: "Olhar treinado para o mar" },
      { label: "Ligacao", value: "Primeiros sinais do Veu" },
    ],
  },
  {
    slug: "vazhir",
    title: "Vaz'hir",
    category: "personagens",
    subtitle: "Figura do limiar que recebe o trio em Elarion e fala como quem ja mede o mundo por outras regras.",
    summary:
      "Vaz'hir ocupa a borda entre guia, carcereiro e leitor da falha. Sua presenca marca o ponto em que Alaric, Sorrow e Hauz deixam de atravessar a crise e passam a ser atravessados por ela.",
    image: characterIllustration,
    imageAlt: "Retrato ilustrado de uma figura silenciosa junto a um braseiro no limiar.",
    narrative: [
      {
        heading: "Guardiao do espaco instavel",
        body:
          "Ele surge em Elarion como alguem que conhece a sala, o braseiro, o vinho e a tensao daquele ambiente melhor do que qualquer recem-chegado jamais conseguiria conhecer.",
      },
      {
        heading: "Leitor de gente e de falha",
        body:
          "Vaz'hir observa o trio nao apenas como visitantes, mas como vetores possiveis de uma abertura que o mundo ainda nao conseguiu fechar.",
      },
      {
        heading: "Calma mais inquietante que ameaca aberta",
        body:
          "Sua fala pesa porque nunca precisa de pressa. Ele fala como quem ja conhece a margem do que esta por vir e so espera descobrir quem entre os presentes vai aguentar ficar de pe.",
      },
    ],
    internalLinks: ["alaric-dorne", "sorrow-noxmourn", "hauz-darnen", "elarion"],
    timeline: [
      {
        period: "Capitulos 16-17",
        title: "Recebe os vetores em Elarion",
        description:
          "O encontro com Alaric, Sorrow e Hauz muda o tom da cronica e torna o limiar mais pessoal.",
      },
      {
        period: "A leitura comeca",
        title: "Define o trio como parte do problema e da resposta",
        description:
          "Sua presenca transforma a caverna em sala de prova e de avaliacao.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Figura do limiar" },
      { label: "Dominio", value: "Elarion" },
      { label: "Funcao", value: "Leitor da convergencia" },
    ],
  },
  {
    slug: "irmas-de-prata",
    title: "Irmas de Prata",
    category: "monstros",
    subtitle: "Nome dado pelos vivos a aparicoes femininas ligadas ao afrouxamento do Veu e ao medo que aprende a se repetir.",
    summary:
      "As Irmas de Prata nao sao santas, nem simplesmente espectros. Elas surgem como um dos primeiros sinais de que a realidade parou de obedecer ao costume.",
    image: monsterIllustration,
    imageAlt: "Ilustracao de figuras prateadas junto ao mar.",
    narrative: [
      {
        heading: "Aparicao antes da explicacao",
        body:
          "Elas surgem na costa quando ainda seria confortavel chamar tudo de boato ou histeria. Caminham, tocam agua, olham demais e obrigam homens, mulheres e velhos a inventar nomes para aquilo que nao cabe mais na ordem comum.",
      },
      {
        heading: "Medo com forma humana",
        body:
          "O terror causado pelas Irmas de Prata nao vem de massacre facil. Vem da naturalidade errada. Elas parecem proximas demais de um corpo, de uma fala e de uma presenca reconhecivel, como se o mundo tivesse produzido duplicatas sem decidir o que fazer com elas.",
      },
      {
        heading: "Marco do inicio do colapso",
        body:
          "Na enciclopedia, elas servem para mostrar o ponto exato em que a crise deixa de ser teoria de mago e vira experiencia social. A partir delas, medo, conselho e política deixam de poder fingir que ainda estao lidando com o mesmo mundo.",
      },
    ],
    internalLinks: ["merlin", "cedencia-do-veu", "conclaves-do-veu"],
    timeline: [
      {
        period: "Capitulos 1-3",
        title: "Surgem nas falésias e na costa",
        description:
          "Os primeiros relatos insistem em mulheres que andam sobre a agua, tocam gente e deixam a normalidade parecer fraca demais.",
      },
      {
        period: "Difusao do medo",
        title: "Viram nome coletivo para a falha",
        description:
          "Pescadores, aldeias e templos passam a repetir o termo como modo de dar figura ao inexplicavel.",
      },
      {
        period: "Legado",
        title: "Se tornam sinal de que o Veu ja afrouxou demais",
        description:
          "Mesmo quando outras criaturas mais vastas surgem, elas seguem marcando o ponto em que a cronica deixou de parecer apenas rumor.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Aparicoes do Veu" },
      { label: "Ambiente", value: "Costa, agua e transicao" },
      { label: "Perigo", value: "Desorientacao e medo social" },
    ],
  },
  {
    slug: "escorpiao-sob-as-areias",
    title: "Escorpiao sob as Areias",
    category: "monstros",
    subtitle: "Colosso que se move sob o deserto e opera menos como predador comum do que como peso cravado na ferida do mundo.",
    summary:
      "O grande escorpiao nao e so besta do deserto. Ele representa a classe dos Guardioes: criaturas antigas cuja simples permanencia segura um pedaco do rasgo.",
    image: monsterIllustration,
    imageAlt: "Ilustracao de um escorpiao colossal sob dunas escuras.",
    narrative: [
      {
        heading: "Guardiao antes de monstro",
        body:
          "Os relatos insistem que o escorpiao nao vinha para aldeias, nao pedia culto e nao caçava por sadismo. Permanecia. Essa permanencia muda tudo, porque faz a criatura parecer parte da estrutura do mundo, e nao somente algo que escapou dela.",
      },
      {
        heading: "Areia negra e contençao viva",
        body:
          "Quando Zerrikania escurece, o escorpiao deixa de ser apenas imagem de poder antigo e passa a reagir como musculo tenso ao redor de uma ferida. Sua presença e lida como contençao viva, ainda que parcial, do que o Veu deixou passar.",
      },
      {
        heading: "Ameaca de campanha",
        body:
          "O escorpiao sustenta a escala cosmologica da historia sem perder uso imediato de mesa. Pode surgir como boss, guardiao regional ou prova de que alguem esta perto demais de uma rachadura sensivel.",
      },
    ],
    internalLinks: ["guardioes-do-veu", "zerrikania-de-areia-negra", "profecia-de-nashara"],
    timeline: [
      {
        period: "Capitulos 6-8",
        title: "E visto como um dos primeiros Guardioes nomeados",
        description:
          "Caravanas, pastores e viajantes passam a reconhecer o colosso sob as dunas como presença constante demais para ser acaso.",
      },
      {
        period: "Capitulos 10-11",
        title: "Reage a recusa de Nashara",
        description:
          "O deserto ao redor muda de qualidade e o escorpiao deixa de parecer simples peso imovel.",
      },
      {
        period: "Legado",
        title: "Vira emblema da ferida que ainda segura",
        description:
          "Mesmo quando a história avança para Elarion e para o Grimorio Lunar, o escorpiao continua simbolizando contençao instavel.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Guardiao colossal do deserto" },
      { label: "Funçao", value: "Contençao viva e pressao territorial" },
      { label: "Tatica", value: "Movimento subterraneo e investida esmagadora" },
      { label: "Risco", value: "Altissimo perto de rachaduras do Veu" },
    ],
    vtt: {
      hp: 58,
      ac: 17,
      initiativeBonus: 2,
      role: "guardiao colossal",
      note: "Ataca saindo da areia e pune alvos agrupados com ferrão e esmagamento.",
      color: "#7d5b2f",
    },
  },
  {
    slug: "dragao-negro",
    title: "Dragao Negro",
    category: "monstros",
    subtitle: "Criatura-voz que oferece correcao absoluta e trata a excecao como o custo inaceitavel de um mundo imperfeito.",
    summary:
      "O Dragao Negro e um dos seres mais perigosos da cronica porque nao convence pela força bruta primeiro, mas por um raciocinio de paz total que elimina aquilo que escapa.",
    image: monsterIllustration,
    imageAlt: "Ilustracao de um dragao negro emergindo de rochas escuras.",
    narrative: [
      {
        heading: "Monstro com argumento",
        body:
          "Ao contrario de criaturas que ferem pela fome ou pelo territorio, o Dragao Negro fala. E fala com a conviccao de quem ja transformou a propria visao em mecanismo de mundo. Por isso o encontro com Nashara pesa mais do que simples combate.",
      },
      {
        heading: "Paz sem excecao",
        body:
          "Sua proposta e clara: remover os atrasos, as anomalias, os Guardioes e tudo o que insiste em escapar do calculo para que o mundo finalmente cesse de sangrar. O horror nao esta so na escala disso, mas no fato de a ideia soar racional por alguns instantes.",
      },
      {
        heading: "Ruptura filosofica da campanha",
        body:
          "Este verbete concentra o conflito moral mais forte do arquivo. Com ele, a lore de Zerrikania deixa de ser apenas cronica de sobrevivencia e passa a discutir se salvar o mundo ainda vale quando o preço e amputar toda diferença.",
      },
    ],
    internalLinks: ["nashara", "profecia-de-nashara", "guardioes-do-veu"],
    timeline: [
      {
        period: "Capitulo 9",
        title: "Confronta Nashara",
        description:
          "O Dragao Negro oferece uma sobrevivencia organizada demais para nao soar monstruosa.",
      },
      {
        period: "Recusa",
        title: "Perde a correcao total",
        description:
          "A resposta de Nashara falha o calculo que ele vinha preparando.",
      },
      {
        period: "Depois do recuo",
        title: "Sua ausencia pesa mais do que a presenca",
        description:
          "O deserto passa a carregar o vazio deixado por uma soluçao recusada, nao um alivio verdadeiro.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Guardiao draconico e agente de correcao" },
      { label: "Poder", value: "Violencia cosmologica e persuasao" },
      { label: "Ameaca", value: "Apagamento das excecoes" },
    ],
    vtt: {
      hp: 86,
      ac: 19,
      initiativeBonus: 5,
      role: "boss cosmologico",
      note: "Usa presenca esmagadora, desloca terreno e obriga testes contra medo e obediência.",
      color: "#3a332d",
    },
  },
  {
    slug: "guardioes-do-veu",
    title: "Guardioes do Veu",
    category: "monstros",
    subtitle: "Classe de criaturas antigas que nao existe para ser entendida como fauna comum, mas como contençao viva da ferida do mundo.",
    summary:
      "Os Guardioes pesam mais do que qualquer ataque isolado. Eles seguram, atrasam e estabilizam partes do rasgo, mesmo quando ninguem compreende totalmente o custo disso.",
    image: monsterIllustration,
    imageAlt: "Ilustracao de guardioes antigos surgindo entre areia, asa e rocha.",
    narrative: [
      {
        heading: "Nao sao apenas monstros",
        body:
          "Os primeiros relatos insistem numa diferenca importante: Guardioes nao invadem vilas, nao pedem culto e nao se comportam como simples predadores. Eles permanecem onde o mundo precisa de peso, o que os torna mais perturbadores do que uma criatura de caça.",
      },
      {
        heading: "Contençao viva",
        body:
          "Escorpiao sob as areias, serpente alada e Dragao Negro participam da mesma logica maior. Cada um encarna uma forma de retardar, estabilizar ou reinterpretar a ferida deixada pelo Veu, ainda que isso nunca seja apresentado como soluçao limpa.",
      },
      {
        heading: "Problema e defesa ao mesmo tempo",
        body:
          "Os Guardioes ajudam a segurar o colapso, mas tambem podem ser parte do impasse que impede o mundo de sair de seu estado doente. Por isso, a cronica os trata como criaturas indispensaveis e insuportaveis ao mesmo tempo.",
      },
    ],
    internalLinks: ["cedencia-do-veu", "escorpiao-sob-as-areias", "dragao-negro"],
    timeline: [
      {
        period: "Primeiros registros",
        title: "Sao nomeados quando a contençao deixa de parecer coincidencia",
        description:
          "Homens, magos e reis passam a chamar de Guardioes aquilo que continua parado exatamente onde o rasgo mais pressiona.",
      },
      {
        period: "Ascensao de Nashara",
        title: "Entram no centro da profecia",
        description:
          "A escolhida passa a ser lida como alguem capaz de caminhar entre eles e decidir pelo mundo.",
      },
      {
        period: "Pos-recusa",
        title: "Permanecem, mas de outro modo",
        description:
          "Depois que a correcao total falha, os Guardioes deixam de ser apenas peso estavel e passam a participar de um equilibrio mais perigoso.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Classe de criaturas-ancora" },
      { label: "Funçao", value: "Contençao e atraso do colapso" },
      { label: "Paradoxo", value: "Defesa e impasse ao mesmo tempo" },
    ],
  },
  {
    slug: "zerrikania-de-areia-negra",
    title: "Zerrikania de Areia Negra",
    category: "locais",
    subtitle: "Versao ferida do deserto em que a areia escurece, o horizonte se move errado e o mundo inteiro passa a soar gasto.",
    summary:
      "Zerrikania deixa de ser so paisagem exotica. Ela vira o corpo visivel da crise: um territorio onde o Veu falhou de forma persistente.",
    image: locationIllustration,
    imageAlt: "Ilustracao de dunas escuras sob um ceu quebrado.",
    narrative: [
      {
        heading: "O deserto escurecido",
        body:
          "A areia negra nao toma tudo de uma vez. Ela surge em veios, manchas e superficies que brilham sem o brilho certo, como se a materia tivesse sido chamuscada por dentro. O arquivo insiste nessa mudança lenta porque ela revela um mundo adoecendo sem clarão conveniente.",
      },
      {
        heading: "Territorio de ressonancia",
        body:
          "Em Zerrikania, dunas mudam de lugar, vozes caminham ao lado de passos e rotas inteiras perdem a honestidade. E um lugar em que geografia, medo e memoria se contagiam mutuamente.",
      },
      {
        heading: "Paisagem da recusa",
        body:
          "Depois de Nashara dizer nao a correçao total, Zerrikania continua sangrando. Isso a torna o grande palco visivel da escolha: um mundo ainda aberto ao imprevisivel, mas incapaz de voltar ao que era antes.",
      },
    ],
    internalLinks: ["nashara", "escorpiao-sob-as-areias", "profecia-de-nashara"],
    timeline: [
      {
        period: "Capitulos 10-11",
        title: "A areia escurece",
        description:
          "O deserto passa a exibir a ferida do Veu de modo visivel e territorial.",
      },
      {
        period: "Pos-recusa",
        title: "Ritmos do mundo ficam errados",
        description:
          "Dunas, sonhos, vozes e caminhos deixam de obedecer ao costume anterior.",
      },
      {
        period: "Memoria historica",
        title: "O territorio vira prova viva da escolha",
        description:
          "Toda narrativa sobre Nashara ou Guardioes volta, cedo ou tarde, ao estado de Zerrikania.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Deserto rasgado pelo Veu" },
      { label: "Sintoma principal", value: "Areia negra e rotas instaveis" },
      { label: "Valor narrativo", value: "Corpo visivel da crise" },
    ],
  },
  {
    slug: "novigrad-subterranea",
    title: "Novigrad Subterranea",
    category: "locais",
    subtitle: "Rede de adegas, alçapoes e camaras escondidas onde o metodo de Alaric encontra o perigo de um livro que responde demais.",
    summary:
      "Novigrad subterranea mostra que a crise ja nao pertence apenas ao deserto: cidades racionais tambem possuem poroes prontos para falhar.",
    image: locationIllustration,
    imageAlt: "Ilustracao de uma adega escondida sob a cidade.",
    narrative: [
      {
        heading: "Esconderijo de metodo",
        body:
          "A camara usada por Alaric nao e templo nem palacio. E adega, deposito e laboratório improvisado, um lugar onde o saber tenta reduzir o sobrenatural a algo medivel sem admitir o quanto depende de sorte.",
      },
      {
        heading: "Cidade que finge nao olhar",
        body:
          "Novigrad aparece como centro urbano capaz de fornecer dicionarios, objetos raros, corredores discretos e intermediarios duvidosos. Sua grande ironia e parecer estável o bastante para mascarar o fato de que ja abriga brechas demais.",
      },
      {
        heading: "Porta para o outro lado",
        body:
          "Quando o Grimorio Lunar responde, a adega subterranea deixa de ser só esconderijo e se torna dobradiça entre o mundo conhecido e o deserto impossível que espera do outro lado da fissura.",
      },
    ],
    internalLinks: ["alaric-dorne", "fragmentos-de-luna", "elarion"],
    timeline: [
      {
        period: "Capitulo 12",
        title: "Alaric prepara o ritual",
        description:
          "A cidade fornece o ambiente aparentemente controlavel em que o erro pode parecer só detalhe tecnico.",
      },
      {
        period: "Abertura",
        title: "A adega se torna portal",
        description:
          "O espaço é reclassificado de esconderijo para limiar operativo do colapso.",
      },
      {
        period: "Legado",
        title: "Novigrad entra na cronica do Veu",
        description:
          "O colapso deixa de ser assunto distante do deserto e passa a tocar o coração urbano do conhecimento pragmático.",
      },
    ],
    stats: [
      { label: "Tipo", value: "Adega e câmara ritual" },
      { label: "Ligacao", value: "Grimorio Lunar" },
      { label: "Tema", value: "Metodo que perde controle" },
    ],
  },
  {
    slug: "elarion",
    title: "Elarion",
    category: "locais",
    subtitle: "Nome-lugar reconhecido por espada, portal e sombra antes que qualquer personagem consiga explica-lo de forma segura.",
    summary:
      "Elarion funciona como destino e conceito ao mesmo tempo: uma borda onde caverna, estalagem, leitura e captura coexistem sem se resolver totalmente.",
    image: locationIllustration,
    imageAlt: "Ilustracao de um limiar rochoso que se dobra em sala iluminada.",
    narrative: [
      {
        heading: "Lugar pronunciado antes de entendido",
        body:
          "O nome Elarion surge quando a espada de Hauz reage e quando Alaric percebe que o portal nao o levou apenas ao deserto. Isso faz do local algo mais antigo do que a capacidade imediata de descreve-lo.",
      },
      {
        heading: "Caverna, taverna e leitura",
        body:
          "Nas cenas finais, Elarion parece aceitar sobreposicoes: rocha, calor, mesa, vinho, caverna e uma estalagem falsa-estavel coexistem. O resultado e um ambiente que nao nega a materialidade, mas a organiza sob regras que ninguem controla por inteiro.",
      },
      {
        heading: "Espaco de triagem",
        body:
          "Com Vaz'hir e o Grimorio Lunar por perto, Elarion se torna lugar de leitura. Nao leitura de pagina apenas, mas de gente, limite, falha, obediência e ruptura. E um local em que a propria cena parece avaliar os presentes.",
      },
    ],
    internalLinks: ["alaric-dorne", "hauz-darnen", "fragmentos-de-luna"],
    timeline: [
      {
        period: "Travessia",
        title: "Elarion e reconhecido antes de ser descrito",
        description:
          "O nome antecede a compreensão e funciona como gatilho para espada, memória e portal.",
      },
      {
        period: "Capitulos 16-17",
        title: "Vira sala de convergencia",
        description:
          "Alaric, Sorrow e Hauz descobrem que ja nao estao apenas presos, mas sendo lidos dentro dele.",
      },
      {
        period: "Limiar persistente",
        title: "Permanece como ponto de passagem incompleto",
        description:
          "O local não fecha seus significados; ele os sustenta em tensão.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Limiar e nome antigo" },
      { label: "Funçao", value: "Convergencia e leitura" },
      { label: "Sinal", value: "Reconhecimento pela espada e pelo portal" },
    ],
  },
  {
    slug: "conclaves-do-veu",
    title: "Conclaves do Veu",
    category: "faccoes",
    subtitle: "Rede dispersa de magos, eruditos e copistas que tenta medir, conter e nomear a falha sem jamais controlá-la por inteiro.",
    summary:
      "O estudo do colapso nunca pertenceu a um unico centro. Conclaves, magos e escribas aparecem como infraestrutura intelectual da crise, ao mesmo tempo util e insuficiente.",
    image: factionIllustration,
    imageAlt: "Ilustracao de um conclave de estudiosos sobre mapas e runas.",
    narrative: [
      {
        heading: "Saber reunido sob atraso",
        body:
          "Quando o Veu começa a ceder, conclaves sao reunidos, tratados antigos voltam a circular e magos que antes pareciam periféricos reaparecem com linguagem de contençao, continuidade e remendo. O problema e que quase sempre chegam tarde ao que ja mudou.",
      },
      {
        heading: "Controle por vocabulário",
        body:
          "A força dessa facção está em nomear, comparar mapas, registrar ciclos e tentar dar forma ao que assusta. Sua fragilidade está em acreditar, repetidas vezes, que o vocabulário correto basta para reduzir a falha a sistema administrável.",
      },
      {
        heading: "Porta para o segundo arco",
        body:
          "Sem esse fundo de estudos, Grimorio Lunar, Fragmentos de Luna e o próprio método de Alaric perderiam contexto. Os conclaves nao resolvem a crise, mas constroem o idioma pelo qual o colapso passa a ser perseguido.",
      },
    ],
    internalLinks: ["cedencia-do-veu", "merlin", "fragmentos-de-luna"],
    timeline: [
      {
        period: "Primeira resposta",
        title: "Conclaves sao formados para registrar as falhas",
        description:
          "As anomalias deixam de ser apenas susto local e passam a gerar mobilização erudita organizada.",
      },
      {
        period: "Escalada",
        title: "Mapas, runas e linguagem de contençao ganham centralidade",
        description:
          "O saber técnico tenta acompanhar um mundo que muda mais rápido do que os relatórios.",
      },
      {
        period: "Arco final",
        title: "Seu legado reaparece no Grimorio Lunar",
        description:
          "A convergência de Alaric nasce sobre séculos de estudo acumulado e mal digerido.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Rede erudita" },
      { label: "Metodo", value: "Registrar, comparar e conter" },
      { label: "Fraqueza", value: "Sempre chegar um pouco tarde" },
    ],
  },
  {
    slug: "templos-da-profecia",
    title: "Templos da Profecia",
    category: "faccoes",
    subtitle: "Sacerdotes, santuários e tradições que absorvem os versos do colapso e os convertem em destino socialmente utilizável.",
    summary:
      "Os templos nao apenas rezam. Eles recortam versos, transformam rumor em profecia compartilhavel e ajudam a produzir a forma publica de figuras como Nashara.",
    image: factionIllustration,
    imageAlt: "Ilustracao de templos e sacerdotes em torno de pergaminhos profeticos.",
    narrative: [
      {
        heading: "A profecia como administração do medo",
        body:
          "Quando os versos surgem, sacerdotes e templos passam a selecionar o que convém citar, o que deve ser aparado e o que pode soar como sentido para povos exaustos. O resultado e menos revelação pura do que política de sobrevivência simbólica.",
      },
      {
        heading: "Fabricantes de centro",
        body:
          "Ao repetir trechos, interpretar sinais e colar nomes a imagens, os templos ajudam a transformar Nashara numa figura organizada pelo desejo coletivo. Isso da direção a muita gente, mas também reduz a complexidade daquilo que realmente aconteceu.",
      },
      {
        heading: "Memória aparada",
        body:
          "Depois da recusa, o mesmo aparelho templário que ajudou a erguer a expectativa trabalha para limpar a parte mais ofensiva da verdade. A memória pública preserva o nome, mas amputa a recusa e a profundidade do custo.",
      },
    ],
    internalLinks: ["profecia-de-nashara", "nashara", "zerrikania-de-areia-negra"],
    timeline: [
      {
        period: "Capitulos 7-8",
        title: "Os versos deixam de ser rumor e entram nos templos",
        description:
          "A profecia ganha repetição, autoridade e recorte institucional.",
      },
      {
        period: "Ascensao de Nashara",
        title: "Templos ajudam a fixar um nome ao centro dos versos",
        description:
          "A leitura coletiva começa a produzir destino socialmente reconhecível.",
      },
      {
        period: "Depois da recusa",
        title: "A facção reescreve a memória para torná-la suportável",
        description:
          "O passado permanece, mas as partes mais desconfortáveis são as primeiras a desaparecer do registro compartilhado.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Rede sacerdotal e ritual" },
      { label: "Funçao", value: "Interpretar e aparar a profecia" },
      { label: "Recurso central", value: "Autoridade sobre o sentido público" },
    ],
  },
  {
    slug: "cedencia-do-veu",
    title: "Cedencia do Veu",
    category: "historia",
    subtitle: "Momento em que a fronteira entre mundos deixa de se sustentar sozinha e obriga a realidade a conviver com passagem, eco e erro.",
    summary:
      "O prologo redefine a base do universo: antes de qualquer cidade, profecia ou espada, existe o fato de que o Veu cedeu e nunca mais deixou o mundo plenamente inteiro.",
    image: historyIllustration,
    imageAlt: "Ilustracao de cronica com uma fissura luminosa entre mundos.",
    narrative: [
      {
        heading: "Quando o mundo bastava a si mesmo",
        body:
          "A abertura insiste numa ordem antiga em que mar, florestas, estradas e céu ainda pertenciam ao seu lugar costumeiro. Isso torna a queda mais forte, porque a ruptura nao nasce num mundo ja arruinado, mas num mundo que acreditava poder continuar igual.",
      },
      {
        heading: "Fronteira sem forma simples",
        body:
          "O Veu não e descrito como porta, linha ou muro. E uma distância necessária. Quando ela afrouxa, o desastre nao aparece apenas como explosão; aparece como erro fino, recorrência, detalhe fora de eixo e caminho que responde ao lugar errado.",
      },
      {
        heading: "Catastrofe lenta",
        body:
          "A grande força desse evento histórico esta na lentidão. O mundo não desaba de uma vez; ele aprende a piorar sem clarão suficiente para convencer todo mundo ao mesmo tempo.",
      },
    ],
    internalLinks: ["merlin", "irmas-de-prata", "conclaves-do-veu"],
    timeline: [
      {
        period: "Prologo",
        title: "O Veu afrouxa",
        description:
          "A distância entre realidades deixa de manter-se inteira e começa a permitir passagem, resíduo e erro.",
      },
      {
        period: "Primeiras reações",
        title: "Magos, reis e sacerdotes tentam nomear a crise",
        description:
          "O mundo ainda resiste a acreditar no tamanho do problema.",
      },
      {
        period: "Longa duração",
        title: "A falha vira condição histórica",
        description:
          "Deixa de ser incidente e se transforma em ambiente.",
      },
    ],
    stats: [
      { label: "Escala", value: "Cosmologica" },
      { label: "Sintoma", value: "Passagem, eco e erro" },
      { label: "Marca", value: "Catastrofe lenta" },
    ],
  },
  {
    slug: "profecia-de-nashara",
    title: "Profecia de Nashara",
    category: "historia",
    subtitle: "Conjunto de versos, medos e expectativas que transforma uma vida em ponto de apoio para reis, templos e povos exaustos.",
    summary:
      "A profecia nao e so mensagem sobrenatural. E uma estrutura de repeticao social que prepara o mundo para desejar uma figura que resolva aquilo que ninguem mais consegue suportar.",
    image: historyIllustration,
    imageAlt: "Ilustracao de um pergaminho profetico sobre areia escura.",
    narrative: [
      {
        heading: "Nascimento difuso",
        body:
          "A profecia nao nasce limpa nem assinada. Ela se espalha por bocas, templos, velhos, soldados, copistas e sonhos, ganhando forma aos poucos até parecer anterior a si mesma.",
      },
      {
        heading: "Produzindo uma escolhida",
        body:
          "O ponto mais forte do evento e mostrar que o mundo nao espera apenas uma pessoa; ele fabrica uma necessidade. Nashara cresce dentro dessa necessidade, cercada por versos que a antecedem e por instituições interessadas em dar corpo a eles.",
      },
      {
        heading: "Recusa e mutilaçao da memoria",
        body:
          "Quando a escolhida diz nao ao conserto absoluto, a profecia nao some. Ela muda de uso. Parte dela vira justificativa, parte vira lenda, e a fraçao mais ofensiva da verdade começa a ser retirada do registro comum.",
      },
    ],
    internalLinks: ["nashara", "templos-da-profecia", "dragao-negro"],
    timeline: [
      {
        period: "Capitulos 7-8",
        title: "Os versos circulam por reis, templos e desertos",
        description:
          "A profecia deixa de ser ruído isolado e ganha autoridade coletiva.",
      },
      {
        period: "Ascensao",
        title: "Nashara e fixada como centro dos sinais",
        description:
          "O mundo escolhe um nome para organizar o proprio pavor.",
      },
      {
        period: "Depois",
        title: "A memoria da recusa e aparada",
        description:
          "Sobrevive o mito; some a parte da decisão que mais ofende o desejo de ordem.",
      },
    ],
    stats: [
      { label: "Forma", value: "Versos, repeticao e espera coletiva" },
      { label: "Funçao", value: "Dar centro ao medo historico" },
      { label: "Consequencia", value: "Escolhida produzida e depois recontada" },
    ],
  },
  {
    slug: "fragmentos-de-luna",
    title: "Fragmentos de Luna",
    category: "historia",
    subtitle: "Residuos de passagem e memoria imperfeita que tornam possivel a convergencia do segundo arco.",
    summary:
      "Os Fragmentos de Luna explicam por que o colapso deixa de agir apenas por paisagem e passa a agir por pessoas, vidas e vetores capazes de serem lidos e rearranjados.",
    image: historyIllustration,
    imageAlt: "Ilustracao de estilhaços de memoria sobre um grimorio aberto.",
    narrative: [
      {
        heading: "Resíduo que atravessa gente",
        body:
          "Os fragmentos não se manifestam apenas como objeto. Eles aparecem como memória deslocada, eco estrutural e sensibilidade incorreta em vidas distintas, fazendo o Veu ficar mais poroso onde quase ninguem perceberia um padrâo.",
      },
      {
        heading: "Doença de convergencia",
        body:
          "Depois da recusa de Nashara, o Espectro do Caos deixa de buscar linha reta e passa a trabalhar por aproximaçao. Alaric, Sorrow e Hauz se tornam importantes porque encarnam modos diferentes de sustentar, ler ou romper essa convergência.",
      },
      {
        heading: "Historia que entra no limiar",
        body:
          "Este evento e o elo entre a primeira grande cronica de Zerrikania e a segunda, mais fechada em leitura, grimorio e captura. Sem ele, o arco de Elarion pareceria outro livro. Com ele, vira continuidade deformada do mesmo colapso.",
      },
    ],
    internalLinks: ["merlin", "alaric-dorne", "elarion"],
    timeline: [
      {
        period: "Pos-recusa",
        title: "O Espectro abandona a linha reta",
        description:
          "A crise passa a operar por convergencia em vez de depender de um unico agente central.",
      },
      {
        period: "Capitulo 12",
        title: "O Grimorio Lunar reconhece o primeiro vetor",
        description:
          "Alaric toca uma estrutura que já esperava por contato.",
      },
      {
        period: "Capitulos 16-17",
        title: "Os vetores sao reunidos em Elarion",
        description:
          "Fragmentos de memória, espada, morte e livro deixam de estar separados.",
      },
    ],
    stats: [
      { label: "Natureza", value: "Residuo de memoria e passagem" },
      { label: "Efeito", value: "Convergencia de vetores" },
      { label: "Ponte", value: "Une Nashara ao arco de Alaric" },
    ],
  },
];

export const encyclopediaEntries: EncyclopediaEntry[] = [
  ...handcraftedEncyclopediaEntries,
  ...witcherBestiaryEntries,
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

export function getVttReadyEntries() {
  return encyclopediaEntries.filter(
    (entry): entry is EncyclopediaEntry & { vtt: EncyclopediaVttProfile } =>
      Boolean(entry.vtt),
  );
}
