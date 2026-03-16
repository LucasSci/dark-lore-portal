const monsters = [
    {
        nome: "Cérberos da Caçada Selvagem",
        tipo: "Construto",
        descricao: "Nascidos, segundo alguns especialistas, de um cristal de gelo mágico, os Cérberos da Caçada Selvagem correm ao lado dos seus mestres espectrais. Como cães ferozes e famintos, atacam tudo que cruza o seu caminho sem pensar.",
        fraqueza: ["Óleo de elemental", 'Bomba de dimerítio', 'Igni', 'Axii'],
        regiao: ["Invocado pela caçada selvagem"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/b/b4/Gwent_cardart_monsters_wild_hunt_hound.png/revision/latest?cb=20181028222817"
    },
    {
        nome: "Djinn",
        tipo: "Construto",
        descricao: "Criatura mágica extremamente poderosa, formada de energia do ar. Pode controlar ventos e tempestades, lançando relâmpagos e causando destruição em larga escala. Enfrentar um Djinn sem preparação é praticamente suicídio.",
        fraqueza: ["Óleo de elemental", "Dimerítio"],
        regiao: ["Skellige", "Ruínas antigas", "Torres de magos"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/e/e2/Tw3_journal_djinn.png/revision/latest?cb=20160409111026"
    },
    {
        nome: "Elemental do Fogo",
        tipo: "Construto",
        descricao: "Um ser feito inteiramente de chamas vivas, capaz de incinerar tudo ao seu redor. Extremamente agressivo, persegue suas presas sem hesitar e é resistente à maioria dos ataques físicos.",
        fraqueza: ["Aard", "Bomba de dimerítio", "Óleo de construto"],
        regiao: ["Montanhas", "Vulcões", "Ruínas incendiadas"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d0/Tw3_journal_fireelemental.png/revision/latest?cb=20160409120404"
    },
    {
        nome: "Elemental do Gelo",
        tipo: "Construto",
        descricao: "Criatura formada de gelo mágico e energia elemental. Pode criar tempestades de neve e congelar inimigos à distância. Muito resistente a ataques físicos, mas vulnerável a calor e fogo.",
        fraqueza: ["Bomba de dimerítio"],
        regiao: ["Montanhas geladas", "Cavernas árticas", "Ruínas congeladas"],
        nivelDePerigo: 5,
        imageUrl: 'https://static.wikia.nocookie.net/witcher/images/c/c6/Tw3_journal_iceelemental.png/revision/latest?cb=20160409141539'
    },
    {
        nome: "Elemental da Terra",
        tipo: "Construto",
        descricao: "Um colosso de pedra e terra animado por magia antiga. Extremamente resistente, com força bruta capaz de esmagar um homem com um único golpe. Costuma ser invocado por magos poderosos para servir como guardião.",
        fraqueza: ["Óleo de elemental", "Bomba de dimerítio"],
        regiao: ["Cavernas", "Ruínas antigas", "Florestas densas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/94/Tw3_journal_earthelemental.png/revision/latest?cb=20160409114804"
    },
    {
        nome: "Golem",
        tipo: "Construto",
        descricao: "Criaturas feitas de pedra ou argila e animadas por poderosos feitiços. Servem como guardiões implacáveis, incapazes de sentir dor, medo ou cansaço. Seu poder físico é imenso, mas são lentos e previsíveis.",
        fraqueza: ["Óleo de construto", "Bomba de Dimerítio"],
        regiao: ["Ruínas mágicas", "Torres de magos", "Laboratórios abandonados"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d6/Tw3_journal_golem.png/revision/latest?cb=20160409131122"
    },
    {
        nome: "Gárgula",
        tipo: "Construto",
        descricao: "Estátuas animadas por magia antiga, geralmente criadas para proteger locais sagrados ou laboratórios de magos. Apesar de sua aparência rígida, são ágeis e capazes de atacar com força devastadora. Suas asas permitem movimentos rápidos e imprevisíveis.",
        fraqueza: ["Bomba de Dimerítio", "Óleo de elemental", "Quen"],
        regiao: ["Ruínas antigas", "Torres de magos", "Túmulos esquecidos"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/b/be/Tw3_journal_gargoyle.png/revision/latest?cb=20160409175319"
    },
    {
        nome: "O Fantasma Apiário",
        tipo: "Construto",
        descricao: "O Fantasma Apiário é o espírito vingativo de um apicultor que morreu de forma trágica, geralmente cercado por suas próprias abelhas. Costuma assombrar colmeias abandonadas e fazendas, atacando intrusos com enxames etéreos e lâminas espectrais.",
        fraqueza: ["Bomba de dimerítio", "Óleo Elemental", "Igni", "Axii"],
        regiao: ["Campos de Velen", "Fazendas abandonadas", "Apiários antigos"],
        nivelDePerigo: 3,
        imageUrl: 'https://static.wikia.nocookie.net/witcher/images/f/f6/Tw3_journal_theapiarianphantom.png/revision/latest?cb=20160409162145'
    },
    {
        nome: "Therazane",
        tipo: "Construto",
        descricao: "Therazane é um colossal elemental de pedra e solo, considerado uma das manifestações mais puras da própria terra. Seu corpo é formado por rochas encantadas e minerais raros, e sua força bruta é comparável à de uma montanha em movimento. Apesar de lento, cada golpe seu é devastador.",
        fraqueza: ["Óleo de elemental", "Bomba de Dimerítio", "Yrden"],
        regiao: ["Montanhas Rochosas", "Cavernas profundas", "Ruínas subterrâneas"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/97/Tw3_journal_therazane.png/revision/latest?cb=20160409171526"
    },
    {
        nome: "Basilisco",
        tipo: "Draconídeo",
        descricao: "Criatura lendária com corpo de réptil gigante e olhar capaz de paralisar ou até matar. Movimenta-se silenciosamente, espreitando suas presas antes de atacar com dentes e garras afiadas. Geralmente encontrado em cavernas ou ruínas antigas.",
        fraqueza: ["Estrelas Dançantes (bomba)", "Óleo de draconídeo", "Aard"],
        regiao: ["Cavernas", "Ruínas antigas", "Florestas densas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/b/bc/Tw3_journal_basilisk.png/revision/latest?cb=20160408164921"
    },
    {
        nome: "Basilisco de Prata",
        tipo: "Draconídeo",
        descricao: "Versão ainda mais perigosa do basilisco comum, coberto por escamas prateadas que o tornam mais resistente a ataques físicos. Seu olhar é letal e seus golpes extremamente rápidos. Normalmente encontrado em locais remotos e isolados.",
        fraqueza: ["Óleo de draconídeo", "Aard", "Igni"],
        regiao: ["Montanhas isoladas", "Cavernas profundas", "Ruínas antigas"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/thewitcher/images/9/92/Basilisco_de_Prata.png/revision/latest?cb=20170113181724&path-prefix=pt-br"
    },
    {
        nome: "Cocatriz",
        tipo: "Draconídeo",
        descricao: "Criatura alada e venenosa, híbrida entre dragão e galo, com garras afiadas e cauda poderosa. Costuma atacar de forma rápida e imprevisível, e seu veneno pode enfraquecer seriamente suas vítimas. Geralmente encontrada em cavernas ou ruínas antigas.",
        fraqueza: ["Óleo de Draconídeo", "Aard", "Bomba de Colmeia"],
        regiao: ["Cavernas", "Ruínas antigas", "Florestas densas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/2/2a/Tw3_journal_cockatrice.png/revision/latest?cb=20160408171230"
    },
    {
        nome: "Lagaz",
        tipo: "Draconídeo",
        descricao: "Lagazes são frequentemente confundidos com wyverns ou tordos. Porém, não se engane: lagazes são criaturas cruéis e terríveis e confundir eles com wyverns pode acabar muito mal. Enquanto um wyvern pode cortar ao meio e devorar uma pessoa sem treino em segundos, apenas um lagaz consegue assar ele por inteiro com uma baforada de fogo.",
        fraqueza: ["Óleo de Draconídeo", "Quen", "Aard", "Bomba de Colmeia"],
        regiao: ["Florestas densas", "Montanhas", "Planícies selvagens"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/thewitcher/images/3/30/Tw3_journal_dracolizard.png/revision/latest?cb=20160704190027&path-prefix=pt-br"
    },
    {
        nome: "Tordo",
        tipo: "Draconídeo",
        descricao: "Os tordos devem o seu nome singular às longas e afiadas pontas das suas caudas. Um golpe dessas armas pode cortar um escudo de carvalho ao meio, e a mão que o carrega também. Apesar de seu nome evocar imagens de simples pássaros, lutar contra um tordo não é nada como ir a um galeto, e termina em morte, em vez de sobremesa.",
        fraqueza: ["Óleo de draconídeo", "Aard"],
        regiao: ["Montanhas", "Cavernas remotas", "Ruínas antigas"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/2/2f/Tw3_journal_forktail.png/revision/latest?cb=20160408181043"
    },
    {
        nome: "Wyvern",
        tipo: "Draconídeo",
        descricao: "Dragão menor e ágil, capaz de voar e atacar com garras, cauda e fogo. Embora menos poderoso que um draconídeo adulto, ainda representa uma ameaça significativa devido à sua velocidade e ataques imprevisíveis.",
        fraqueza: ["Óleo de draconídeo"],
        regiao: ["Montanhas", "Florestas remotas", "Ruínas antigas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/2/2a/Tw3_journal_wyvern.png/revision/latest?cb=20160408185115"
    },
    {
        nome: "Wyvern Real",
        tipo: "Draconídeo",
        descricao: "Variante maior e mais poderosa do wyvern comum. Possui corpo musculoso, asas fortes e respira fogo ou ácido, dependendo da espécie. Extremamente agressivo e territorial, ataca qualquer intruso com velocidade e precisão.",
        fraqueza: ["Óleo de draconídeo", "Aard"],
        regiao: ["Montanhas isoladas", "Ruínas antigas", "Cavernas remotas"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/8/8a/Tw3_journal_royalwyvern.png/revision/latest?cb=20160408182854"
    },
    {
        nome: "Aparição",
        tipo: "Espectro",
        descricao: "Espírito vingativo que assombra locais específicos, como casas abandonadas ou cemitérios. Capaz de atravessar paredes e desaparecer à vontade, atacando de surpresa com ataques etéreos. Seu contato direto causa medo e dano espiritual.",
        fraqueza: ["Yrden", "Quen"],
        regiao: ["Cemitérios", "Casas abandonadas", "Ruínas assombradas"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/c6/Tw3_journal_wraith.png/revision/latest?cb=20160514164125"
    },
    {
        nome: "Aparição Diurna",
        tipo: "Espectro",
        descricao: "Versão de Aparição que aparece durante o dia, com aparência menos sombria, mas igualmente perigosa. Ataca com golpes rápidos e desaparece em rajadas de luz, confundindo o inimigo. Geralmente ligada a locais amaldiçoados ou tragédias passadas.",
        fraqueza: ["Óleo Espectral", "Yrden", "Bomba pó de lua"],
        regiao: ["Vilarejos abandonados", "Campos amaldiçoados"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/5/5e/Tw3_journal_noonwraith.png/revision/latest?cb=20160514075449"
    },
    {
        nome: "Aparição Noturna",
        tipo: "Espectro",
        descricao: "Espírito que surge à noite, mais agressivo e perigoso que sua versão diurna. Ataca sorrateiramente e é difícil de detectar, podendo atravessar obstáculos e desaparecer repentinamente. Assombra locais ligados a mortes violentas.",
        fraqueza: ["Óleo Espectral", "Yrden", "Bomba pó de lua"],
        regiao: ["Cemitérios", "Casas abandonadas", "Florestas sombrias"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/cc/Tw3_journal_nightwraith.png/revision/latest?cb=20160514062541"
    },
    {
        nome: "Beann'shie",
        tipo: "Espectro",
        descricao: "Espírito feminino da mitologia élfica, conhecido por seu canto hipnótico que enlouquece ou desorienta aqueles que o ouvem. Aparece geralmente em locais isolados e abandonados, causando terror e confusão antes de atacar.",
        fraqueza: ["Óleo Espectral", "Yrden"],
        regiao: ["Florestas remotas", "Ruínas antigas", "Áreas isoladas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/90/Tw3_journal_banshee.png/revision/latest?cb=20160605084002"
    },
    {
        nome: "Barghest",
        tipo: "Espectro",
        descricao: "Uma criatura sombria e monstruosa, frequentemente descrita como um cão negro gigantesco, ligada a presságios de morte. Ataca com mordidas poderosas e agilidade sobrenatural, perseguindo suas presas incansavelmente durante a noite.",
        fraqueza: ["Igni", "Axii"],
        regiao: ["Florestas sombrias", "Cemitérios", "Ruínas abandonadas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/8/8e/Tw3_journal_barghest.png/revision/latest?cb=20160605081940"
    },
    {
        nome: "Etéreo",
        tipo: "Espectro",
        descricao: "Espírito intangível que existe entre o mundo físico e o espiritual. Pode atravessar paredes e desaparecer à vontade, atacando de surpresa com golpes rápidos ou manipulando o ambiente ao seu favor. Muito difícil de combater sem preparação.",
        fraqueza: ["Óleo Espectral", "Nevasca"],
        regiao: ["Cemitérios", "Casas abandonadas", "Ruínas assombradas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/8/8e/Tw3_journal_ethereal.png/revision/latest?cb=20160219205305"
    },
    {
        nome: "Hym",
        tipo: "Espectro",
        descricao: "Um dos espíritos mais temidos, o Hym é uma entidade que se alimenta da culpa e do remorso. Ele se apega a uma vítima, sussurrando e atormentando-a até levá-la à loucura ou ao suicídio. Não ataca fisicamente de início, mas sua presença é devastadora.",
        fraqueza: ["Óleo Espectral", "Igni", "Bomba Pó de Lua"],
        regiao: ["Skellige", "Casas isoladas", "Vilarejos amaldiçoados"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/a/ab/Tw3_journal_hym.png/revision/latest?cb=20160512191140"
    },
    {
        nome: "Penitente",
        tipo: "Espectro",
        descricao: "Espírito atormentado que surge quando alguém morre em meio a remorso e pecados não redimidos. O Penitente é envolto em correntes e grilhões espectrais, simbolizando sua culpa eterna. Extremamente agressivo e resistente, manifesta-se apenas à noite.",
        fraqueza: ["Yrden", "Igni"],
        regiao: ["Cemitérios", "Ruínas amaldiçoadas", "Vilarejos abandonados"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/e/e0/Tw3_journal_penitent.png/revision/latest?cb=20200617024604"
    },
    {
        nome: "Cão",
        tipo: "Fera",
        descricao: "Animal comum, porém feroz quando em matilha ou provocado. Embora não seja uma criatura monstruosa, cães selvagens podem representar perigo, especialmente em áreas rurais ou devastadas pela guerra, onde a fome os torna agressivos.",
        fraqueza: ["Sinais de Axii", "Sinais de Igni"],
        regiao: ["Vilarejos", "Campos abertos", "Florestas"],
        nivelDePerigo: 1,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/e/e4/Tw3_journal_dog.png/revision/latest?cb=20160304193515"
    },
    {
        nome: "Javali Selvagem",
        tipo: "Fera",
        descricao: "Criatura agressiva e territorial, o javali selvagem ataca qualquer um que invada seu espaço. Apesar de não possuir habilidades mágicas, sua força bruta e presas afiadas o tornam um adversário perigoso, especialmente em grupo.",
        fraqueza: ["Yrden", "Igni"],
        regiao: ["Florestas", "Campos abertos", "Regiões rurais"],
        nivelDePerigo: 2,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/93/Tw3_journal_wild_boar.png/revision/latest?cb=20170501180811"
    },
    {
        nome: "Lobo",
        tipo: "Fera",
        descricao: "Predador inteligente e veloz que caça em matilhas. Lobos atacam de forma coordenada, cercando suas presas antes de avançar. Embora não sejam criaturas mágicas, sua ferocidade e instinto de grupo os tornam adversários letais para viajantes desavisados.",
        fraqueza: [],
        regiao: ["Florestas", "Montanhas", "Campos nevados"],
        nivelDePerigo: 2,
        imageUrl: "https://static.wikia.nocookie.net/thewitcher/images/6/62/Tw3_journal_wolf.png/revision/latest?cb=20160705142545&path-prefix=pt-br"
    },
    {
        nome: "Pantera",
        tipo: "Fera",
        descricao: "Fera ágil e furtiva que ataca de forma silenciosa e letal. As panteras costumam se esconder na vegetação densa, aguardando o momento certo para abater a presa com garras e presas afiadas. Sua velocidade e reflexos tornam o combate direto extremamente perigoso.",
        fraqueza: ["Óleo de fera"],
        regiao: ["Florestas tropicais", "Ruínas antigas", "Terras do sul"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/da/Tw3_journal_panther.png/revision/latest?cb=20160531173331"
    },
    {
        nome: "Urso",
        tipo: "Fera",
        descricao: "Animal imenso e poderoso, conhecido por sua força bruta e resistência quase sobrenatural. Ursos atacam com golpes devastadores e podem suportar grande quantidade de dano antes de recuar. Apesar de lentos, são extremamente perigosos em combate corpo a corpo.",
        fraqueza: ["Óleo de fera", "Sinais de Quen"],
        regiao: ["Florestas", "Montanhas geladas", "Regiões selvagens de Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/0/07/Tw3_journal_bear.png/revision/latest?cb=20160304204324"
    },
    {
        nome: "Ekhidna",
        tipo: "Híbrido",
        descricao: "Criatura voadora semelhante a uma harpia, porém muito mais poderosa. Possui corpo serpentino e asas largas, atacando de cima com investidas rápidas e gritos ensurdecedores. Seu sangue contém propriedades venenosas e é altamente valioso para alquimistas.",
        fraqueza: ["Óleo de híbrido", "Colmeia (bomba)", "Igni", "Aard"],
        regiao: ["Skellige", "Falésias costeiras", "Ilhas montanhosas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/96/Gwent_cardart_skellige_deafening_siren.jpg/revision/latest?cb=20211026001142",
    },
    {
        nome: "Erínia",
        tipo: "Híbrido",
        descricao: "Uma versão ainda mais feroz e agressiva das harpias. As Erínias possuem asas poderosas e garras afiadas, combinando agilidade aérea com ataques brutais. Costumam viver em bandos e proteger territórios elevados com violência implacável.",
        fraqueza: ["Aard"],
        regiao: ["Montanhas", "Falésias de Skellige", "Ruínas antigas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/f/fd/Tw3_journal_erynia.png/revision/latest?cb=20160410184627"
    },
    {
        nome: "Grifo",
        tipo: "Híbrido",
        descricao: "Criatura majestosa e mortal, com corpo de leão e asas de águia. Os grifos são extremamente territoriais e atacam qualquer um que se aproxime de seus ninhos. Voam em alta velocidade e mergulham sobre as presas com força devastadora.",
        fraqueza: ["Óleo de híbrido", "Aard", "Colmeia (bomba)"],
        regiao: ["Campos abertos", "Montanhas", "Ruínas antigas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/15/Tw3_journal_griffin.png/revision/latest?cb=20160313093034"
    },
    {
        nome: "Harpia",
        tipo: "Híbrido",
        descricao: "Criatura alada e grotesca com corpo de pássaro e rosto humanoide. As harpias são conhecidas por atacar viajantes em penhascos e falésias, arranhando e rasgando suas vítimas com garras afiadas antes de devorá-las.",
        fraqueza: ["Óleo de híbrido", "Aard", "Colmeia (bomba)"],
        regiao: ["Falésias", "Montanhas", "Ruínas costeiras"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d5/Tw3_journal_harpy.png/revision/latest?cb=20160415131121"
    },
    {
        nome: "Sereia",
        tipo: "Híbrido",
        descricao: "Criaturas anfíbias que habitam as águas costeiras. As sereias são belas e traiçoeiras, alternando entre formas humanas e monstruosas. Atacam viajantes e pescadores, usando sua voz encantadora para atrair vítimas antes de despedaçá-las com garras e dentes.",
        fraqueza: ["Óleo de híbrido", "Aard", "Igni", "Colmeia (bomba)"],
        regiao: ["Costas de Skellige", "Falésias", "Lagos profundos"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/0/05/Tw3_journal_siren.png/revision/latest?cb=20170315035056"
    },
    {
        nome: "Súcubo",
        tipo: "Híbrido",
        descricao: "Criatura demoníaca de aparência sedutora que se alimenta da energia vital de humanos, especialmente através de atos de paixão. Embora nem sempre hostil, um súcubo pode se tornar mortal se ameaçado ou se alguém interferir em seu território.",
        fraqueza: ["Quen"],
        regiao: ["Ruínas antigas", "Cavernas", "Vilarejos isolados"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/14/Tw3_journal_succubus.png/revision/latest?cb=20160410081007"
    },
    {
        nome: "Aracna",
        tipo: "Insectoide",
        descricao: "Uma mistura de aranha e caranguejo, a Aracna, também conhecida como aranha-caranguejo, é uma criatura monstruosa temida em diversas regiões, especialmente por sua habilidade de se camuflar em meio ao ambiente.",
        fraqueza: ["Óleo de Insectoide"],
        regiao: ["Florestas aluviais", "Dunas de areia", "Cavernas escuras"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/8/8a/Tw3_journal_arachas.png/revision/latest?cb=20160417091446"
    },
    {
        nome: "Aracna Quitinosa",
        tipo: "Insectoide",
        descricao: "Também conhecida como “aracna de armadura”, é uma grande variante da aracna cuja carapaça quitinosa maciça cobre o corpo, tornando-a ainda mais resistente aos ataques físicos. Costuma saltar para perto da vítima e cuspir veneno, além de esmagar com suas pinças poderosas.",
        fraqueza: ["Óleo de Insectoide", "Papa-figo"],
        regiao: ["Novigrad", "Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/7/70/Tw3_journal_armoredarachas.png/revision/latest?cb=20160417094636"
    },
    {
        nome: "Aracna Venenosa",
        tipo: "Insectoide",
        descricao: "Variante extremamente venenosa da aracna, capaz de cuspir toxinas potentes e imobilizar suas presas com teias pegajosas antes de atacar com pinças esmagadoras. Habita minas abandonadas e cavernas pantanosas.",
        fraqueza: ["Óleo de Insectoide", "Papa-figo", "Igni", "Yrden"],
        regiao: ["Velen", "Mina abandonada", "Pântanos"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/67/Tw3_journal_venomousarachas.png/revision/latest?cb=20160417095313"
    },
    {
        nome: "Aracnomorfo",
        tipo: "Insectoide",
        descricao: "Monstro pós-Conjunção que lembra uma aranha gigante, prefere cavernas profundas e pântanos úmidos. Lança teias para imobilizar sua presa antes de atacar e pode surpreender viajantes incautos.",
        fraqueza: ["Óleo de Insectoide", "Aard", "Axii"],
        regiao: ["Cavernas profundas", "Pântanos isolados"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/5/5f/Tw3_journal_arachnomorph.png/revision/latest?cb=20170501180449"
    },
    {
        nome: "Centopeia Gigante",
        tipo: "Insectoide",
        descricao: "Uma criatura monstruosa coberta por carapaça quitinosa espessa, com inúmeras patas afiadas e glândulas que expelem ácido. Costuma se enterrar e re-emergir para atacar de surpresa.",
        fraqueza: ["Óleo de Insectoide", "Yrden"],
        regiao: ["Sous-terras de Toussaint", "Ninhos de monstros” por toda a região"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/de/Tw3_journal_scolopendromorph.png/revision/latest?cb=20160605181533"
    },
    {
        nome: "Endriúga Macho",
        tipo: "Insectoide",
        descricao: "Variante macho das endriúgas, criadas em colônias de Insectoides após a Conjunção. O macho é maior, mais agressivo e vive para lutar, atacando com cauda espinhosa venenosa e golpes brutais.",
        fraqueza: ["Óleo de Insectoide", "Quen", "Aard"],
        regiao: ["Florestas inundadas", "Pântanos de Velen", "Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/e/e8/Tw3_journal_endregadrone.png/revision/latest?cb=20160417123451"
    },
    {
        nome: "Endriúga Operária",
        tipo: "Insectoide",
        descricao: "As endriúgas operárias são responsáveis pela manutenção do ninho e pela proteção das crias. Menores e mais fracas que os machos, mas atacam em grupos e podem imobilizar presas rapidamente com ferrões venenosos.",
        fraqueza: ["Óleo de Insectoide", "Igni", "Aard"],
        regiao: ["Velen", "Pântanos", "Florestas úmidas"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/1b/Tw3_journal_endregaworker.png/revision/latest?cb=20160417123908"
    },
    {
        nome: "Endriúga Guerreira",
        tipo: "Insectoide",
        descricao: "As endriúgas guerreiras são as defensoras mais ferozes da colônia. Maiores e mais resistentes que as operárias, elas patrulham o território ao redor do ninho e atacam qualquer intruso com força brutal e veneno corrosivo.",
        fraqueza: ["Óleo de Insectoide", "Igni", "Aard"],
        regiao: ["Velen", "Florestas densas", "Pântanos infestados"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/18/Gwent_cardart_syndicate_arena_endrega.png/revision/latest?cb=20190718034650"
    },
    {
        nome: "Quiquimora",
        tipo: "Insectoide",
        descricao: "As Quiquimoras são versões mutantes e muito mais perigosas das endriúgas, normalmente surgidas em locais altamente contaminados ou afetados pela magia do Caos. Elas são maiores, mais resistentes e exalam um veneno extremamente potente. Acredita-se que habitem ninhos subterrâneos e regiões pantanosas, onde reinam como verdadeiras rainhas das endriúgas.",
        fraqueza: ["Óleo de Insectoide", "Igni", "Aard"],
        regiao: ["Tucas de endriúgas", "Pântanos", "Velen"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/3/36/Gwent_cardart_monsters_kikimore_stalker.png/revision/latest?cb=20230413150507"
    },
    {
        nome: "Verme de Areia",
        tipo: "Insectoide",
        descricao: "Insectoide do deserto de Ddiddiwedht com carapaça resistente. Costuma emboscar viajantes ao se enterrar na areia e emergir repentinamente com o chifre gigante para atacar. Vive em grupo e sua ameaça aumenta com a quantidade.",
        fraqueza: ["Óleo de Insectoide", "Samum", "Vento do Norte", "Estrela Dançante"],
        regiao: ["Deserto de Ddiddiwedht"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/e/e0/Tw3_sandcrap_close_up.jpg/revision/latest?cb=20170312224302"
    },
    {
        nome: "Afogador",
        tipo: "Necrófago",
        descricao: "Os afogadores são criaturas monstruosas que habitam áreas próximas à água, como rios e lagos. São conhecidos por atacar viajantes e pescadores, arrastando-os para a morte nas profundezas. Seus corpos são inchados e cobertos de limo, e suas garras afiadas são letais tanto em terra quanto na água.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Novigrad", "Skellige", "Pomar Branco", "Toussaint"],
        nivelDePerigo: 2,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/0/09/Tw3_journal_drowner.png/revision/latest?cb=20160408145419"
    },
    {
        nome: "Afogador Mortal",
        tipo: "Necrófago",
        descricao: "Versão mais forte e agressiva dos afogadores comuns, o Afogador Mortal é reconhecido por sua coloração escura e comportamento extremamente territorial. Mais rápido e resistente, ele costuma liderar grupos de afogadores menores, atacando com golpes brutais e mordidas venenosas.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Skellige", "Margens de rios e lagos"],
        nivelDePerigo: 3,
        imageUrl: "https://witcher.fandom.com/pt-br/wiki/Arquivo:Bestiary_Drowned_dead_full.png"
    },
    {
        nome: "Barroso",
        tipo: "Necrófago",
        descricao: "O Barroso é uma mutação mais poderosa dos afogadores, encontrada em regiões pantanosas e lamacentas. Seu corpo é coberto por crostas endurecidas de lama e algas, tornando-o mais resistente a ataques físicos. É extremamente agressivo e pode emergir subitamente da água ou do lodo para surpreender suas presas.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Pântanos", "Margens de rios"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/c1/Mucknixer.png/revision/latest?cb=20160405144408"
    },
    {
        nome: "Bruxa Lamuriosa",
        tipo: "Necrófago",
        descricao: "As Bruxas Lamuriosas são espíritos femininos atormentados que vagam por pântanos e ruínas, lamentando suas mortes trágicas. São conhecidas por atrair viajantes com choros e cantos lúgubres, apenas para drenarem sua vitalidade quando se aproximam. Sua aparência é horrenda, com pele pálida e cabelos desgrenhados, e são extremamente vulneráveis à luz e à magia de purificação.",
        fraqueza: ["Yrden", "Igni", "Lâmpada mágica", "Óleo espectral"],
        regiao: ["Velen", "Pântanos", "Ruínas antigas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/a/a9/Tw3_journal_water_hag.png/revision/latest?cb=20160410082616"
    },
    {
        nome: "Bruxa Aquática",
        tipo: "Necrófago",
        descricao: "As Bruxas Aquáticas são criaturas grotescas que habitam pântanos e margens lamacentas de rios. Apesar do nome, não possuem relação com a magia — são monstros carnívoros que usam o ambiente aquático para emboscar suas vítimas. Seus ataques são rápidos e brutais, e sua aparência lembra uma mulher deformada coberta de limo e crostas de sujeira.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Pântanos", "Lagos e rios rasos"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/3/36/Tw3_journal_waterhag.png/revision/latest?cb=20160507172627"
    },
    {
        nome: "Bruxa Sepulcral",
        tipo: "Necrófago",
        descricao: "A Bruxa Sepulcral é uma variação mais poderosa e agressiva das Bruxas Aquáticas, encontrada em cemitérios, catacumbas e ruínas antigas. Sua aparência é ainda mais macabra, com carne apodrecida e olhos brilhando em meio à escuridão. Alimenta-se de cadáveres frescos e tem um olfato apurado para carne humana viva. Seus ataques são devastadores, misturando força bruta e agilidade.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Ruínas antigas", "Catacumbas", "Cemitérios"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d0/Tw3_journal_gravehag.png/revision/latest?cb=20160502093748"
    },
    {
        nome: "Carniçal-atroz",
        tipo: "Necrófago",
        descricao: "Os Carniçais-atrozes são versões mais evoluídas e perigosas dos carniçais comuns. Quando um carniçal se alimenta excessivamente de carne humana, seu corpo sofre mutações, tornando-se maior, mais rápido e mais resistente. Sua fome insaciável o leva a atacar qualquer ser vivo por perto, e seu toque e mordida podem infectar com toxinas letais.",
        fraqueza: ["Óleo de necrófago", "Igni"],
        regiao: ["Velen", "Túmulos", "Campos de batalha", "Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/64/Tw3_journal_alghoul.png/revision/latest?cb=20160502062720"
    },
    {
        nome: "Carniçal",
        tipo: "Necrófago",
        descricao: "Os carniçais são criaturas nojentas que se alimentam dos cadáveres deixados em campos de batalha e cemitérios. Possuem aparência humanoide deformada, pele acinzentada e garras afiadas. Embora fracos individualmente, costumam atacar em bandos e podem entrar em frenesi ao sentir o cheiro de sangue, tornando-se ainda mais perigosos.",
        fraqueza: ["Óleo de necrófago", "Igni"],
        regiao: ["Velen", "White Orchard", "Campos de batalha", "Ruínas"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/c9/Tw3_journal_ghoul.png/revision/latest?cb=20160502084919"
    },
    {
        nome: "Necroso",
        tipo: "Necrófago",
        descricao: "O Necroso é uma mutação ainda mais avançada e perigosa dos carniçais. Maior, mais rápido e com pele endurecida, é capaz de resistir a golpes diretos e causar ferimentos profundos com suas garras envenenadas. Caça preferencialmente à noite e costuma liderar pequenos grupos de necrófagos menores, tornando-se uma ameaça mortal para qualquer um que atravesse seu território.",
        fraqueza: ["Óleo de necrófago", "Igni", "Quen"],
        regiao: ["Velen", "Skellige", "Ruínas", "Campos de batalha"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/61/Tw3_journal_rotfiend.png/revision/latest?cb=20160507155715"
    },
    {
        nome: "Nevoloso",
        tipo: "Necrófago",
        descricao: "O Nevoloso é um dos tipos mais raros e temidos de necrófago. Sua pele é escura e coberta por crostas endurecidas, e seus olhos brilham em tons amarelados na escuridão. Extremamente ágil e violento, o Nevoloso prefere caçar à noite, emboscando suas vítimas silenciosamente antes de dilacerá-las com suas garras. Diz-se que sua presença é sempre acompanhada por um fedor insuportável de carne podre.",
        fraqueza: ["Óleo de necrófago", "Igni", "Yrden"],
        regiao: ["Velen", "Skellige", "Campos de batalha", "Ruínas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/a/a6/Tw3_journal_foglet.png/revision/latest?cb=20160510171637"
    },
    {
        nome: "Ciclope",
        tipo: "Ogroide",
        descricao: "Os Ciclopes são gigantes de um olho só, dotados de força brutal e temperamento explosivo. Vivem em regiões montanhosas e ilhas isoladas, e são conhecidos por esmagar intrusos com rochas ou golpes devastadores de suas massas improvisadas. Apesar de lentos, seus ataques são extremamente letais, e seu couro grosso os torna resistentes a armas comuns.",
        fraqueza: ["Óleo de ogroide", "Quen", "Axii"],
        regiao: ["Skellige", "Montanhas", "Cavernas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/db/Tw3_journal_cyclops.png/revision/latest?cb=20160511201414"
    },
    {
        nome: "Gigante de Gelo",
        tipo: "Ogroide",
        descricao: "Os Gigantes de Gelo são imensos ogroides que habitam regiões montanhosas e geladas. Possuem pele resistente como pedra e podem lançar ataques devastadores usando pedras ou membros poderosos. Extremamente fortes, sua lentidão é compensada pela força bruta e pela resistência ao frio intenso.",
        fraqueza: ["Óleo de ogroide", "Igni", "Aard"],
        regiao: ["Skellige", "Montanhas geladas", "Regiões remotas do norte"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/ca/Tw3_journal_icegiant.png/revision/latest?cb=20160512134822"
    },
    {
        nome: "Nekker",
        tipo: "Ogroide",
        descricao: "Os Nekkrs são pequenas criaturas humanoides agressivas que atacam em grupos. Vivem em florestas, ruínas e cavernas, emboscando viajantes e caçando em bando. Apesar do tamanho reduzido, sua velocidade e coordenação tornam-nos perigosos quando em enxame.",
        fraqueza: ["Óleo de ogroide", "Igni", "Aard"],
        regiao: ["Velen", "Florestas", "Ruínas", "Skellige"],
        nivelDePerigo: 2,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/a/a1/Tw3_journal_nekker.png/revision/latest?cb=20160511195816"
    },
    {
        nome: "Troll do Gelo",
        tipo: "Ogroide",
        descricao: "Os Trolls do Gelo são gigantescos ogroides que habitam regiões montanhosas e geladas. Extremamente fortes e resistentes, eles atacam com socos e pedras enormes, podendo esmagar suas presas facilmente. Apesar de sua força, são relativamente lentos e previsíveis em seus movimentos.",
        fraqueza: ["Óleo de ogroide", "Igni", "Aard"],
        regiao: ["Skellige", "Montanhas geladas", "Regiões remotas do norte"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/8/84/Tw3_journal_icetroll.png/revision/latest?cb=20160510194727"
    },
    {
        nome: "Troll de Pedra",
        tipo: "Ogroide",
        descricao: "Os Trolls de Pedra são gigantes lentos, mas incrivelmente resistentes, encontrados em montanhas e cavernas rochosas. Sua pele espessa e endurecida os protege da maioria dos ataques físicos, e eles usam sua força bruta para arremessar pedras ou esmagar inimigos com golpes poderosos.",
        fraqueza: ["Óleo de ogroide", "Quen"],
        regiao: ["Montanhas", "Cavernas", "Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/69/Tw3_journal_rocktroll.png/revision/latest?cb=20160406062443"
    },
    {
        nome: "Arquespora",
        tipo: "Amaldiçoado",
        descricao: "Planta monstruosa amaldiçoada que brota em solos fertilizados pelo sangue de vítimas de crimes cruéis. Ataca com folhas que funcionam como mandíbulas e pode lançar ácido cáustico à distância. Encontrada em Toussaint na expansão Blood & Wine. :contentReference[oaicite:3]{index=3}",
        fraqueza: ["Óleo de amaldiçoado", "Igni", "Aard"],
        regiao: ["Toussaint"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/cd/Tw3_journal_echinops.png/revision/latest?cb=20160605082337",

    },
    {
        nome: "Berserker",
        tipo: "Amaldiçoado",
        descricao: "Guerreiros da ilha de Skellige que se transformam em ursos ou meio‑ursos quando dominados pela fúria do combate. A lenda conta que, uma vez transformados, perdem sua consciência humana e seguem apenas a sede de sangue até saciarem a fúria para então retornarem à forma humana.",
        fraqueza: ["Óleo de amaldiçoado", "Quen", "Igni"],
        regiao: ["Skellige", "Vildkaarls", "Village"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/4/48/Tw3_journal_berserker.png/revision/latest?cb=20160408152240"
    },
    {
        nome: "Lobisomem",
        tipo: "Amaldiçoado",
        descricao: "O lobisomem é uma criatura amaldiçoada que se transforma em uma forma monstruosa à noite ou quando tomado pela fúria. Possui força e agilidade sobre-humanas, garras afiadas e dentes poderosos. Costuma habitar florestas densas e regiões isoladas, atacando viajantes e animais sem aviso.",
        fraqueza: ["Óleo de amaldiçoado", "Igni"],
        regiao: ["Velen", "Florestas", "Skellige", "Ruínas isoladas"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/b/ba/Tw3_journal_werewolf.png/revision/latest?cb=20160408161038"
    },
    {
        nome: "Fetulho",
        tipo: "Amaldiçoado",
        descricao: "Criatura nascida de um feto não enterrado ou descuidado, que se alimenta do sangue de mulheres grávidas. Se ameaçado, pode se transformar em uma versão maior e mais feroz, semelhante a um ghoul. :contentReference[oaicite:1]{index=1}",
        fraqueza: ["Óleo de amaldiçoado", "Axii"],
        regiao: ["Poleiro do Corvo - Velen"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/4/4c/Tw3_journal_botchling.png/revision/latest?cb=20170602062312"
    },
    {
        nome: "Sapo Príncipe",
        tipo: "Amaldiçoado",
        descricao: "Criatura amaldiçoada e venenosa que habita os esgotos de Oxenfurt. Embora sua aparência seja de um pequeno sapo com coroa, é extremamente perigoso, atacando com muco venenoso e chicotadas com a língua. É um inimigo considerado chefe na expansão Hearts of Stone.",
        fraqueza: ["Vento Norte", "Papa-figo Dourado", "Óleo de amaldiçoado", "Yrden"],
        regiao: ["Oxenfurt – Esgotos"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/f/ff/Tw3_journal_the_toad_prince.png/revision/latest?cb=20151101193448"
    },
    {
        nome: "Ulfhedinn",
        tipo: "Amaldiçoado",
        descricao: "O Ulfhedinn é um lobisomem extremamente forte e feroz que habita as ilhas de Skellige. Reconhecível pela pelagem alvinegra com manchas escuras, é mais agressivo, ágil e resistente que lobisomens comuns, tornando-se especialmente perigoso quando sente que está prestes a morrer.",
        fraqueza: ["Óleo de amaldiçoado", "Igni", "Fungo demoníaco", "Pó da lua"],
        regiao: ["Skellige"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/0/06/Tw3_journal_ulfhedinn.png/revision/latest?cb=20160408154719"
    },
    {
        nome: "Chorabash",
        tipo: "Relicto",
        descricao: "Chorabashes são criaturas das trevas das florestas antigas, parentes menores dos demônios, mas ainda assim muito perigosos. Caminham em quatro patas e atacam com mordidas, chutes e garras, destruindo tudo que encontram, incluindo animais e plantações. Não possuem fala, comunicando-se apenas com grunhidos e rosnados.",
        fraqueza: ["Óleo de Relicto", "Igni", "Aard"],
        regiao: ["Skellige", "Kaer Morhen"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/6a/Tw3_journal_chort.png/revision/latest?cb=20160319151758"
    },
    {
        nome: "Demônio",
        tipo: "Relicto",
        descricao: "Demônios são monstros assustadores, com aparência lembrando um cervo e um terceiro olho hipnotizante. Vivem em florestas densas e pântanos e são extremamente perigosos quando confrontados, capazes de matar humanos facilmente.",
        fraqueza: ["Óleo de Relicto", "Igni", "Yrden"],
        regiao: ["Velen", "Florestas densas", "Pântanos"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/0/05/Tw3_journal_fiend.png/revision/latest?cb=20160512145354"
    },
    {
        nome: "Diabrete",
        tipo: "Relicto",
        descricao: "Diabretes são criaturas místicas que podem se transformar em dopplers. No jogo, aparecem como inimigos que evitam confrontos, mas quando cercados tornam-se extremamente perigosos, podendo copiar habilidades e forças de seus adversários. Encontrados em Novigrad durante o contrato 'Diabrete'.",
        fraqueza: ["Óleo de Relicto", "Igni", "Yrden"],
        regiao: ["Novigrad"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/90/Tw3_journal_imp.png/revision/latest?cb=20200617024539"
    },
    {
        nome: "Dúplice",
        tipo: "Relicto",
        descricao: "Os dúplices (ou dopplers) são metamorfos capazes de assumir a forma de qualquer pessoa ou animal com peso corporal similar. Eles copiam não só a aparência física, mas também roupas, equipamentos e habilidades da forma assumida. No entanto, são vulneráveis a prata e podem ser contidos com correntes de prata.",
        fraqueza: ["Prata", "Óleo de Relicto", "Igni", "Yrden"],
        regiao: ["Novigrad", "Oxenfurt", "Skellige"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d6/Tw3_journal_doppler.png/revision/latest?cb=20160201073231"
    },
    {
        nome: "Liche",
        tipo: "Relicto",
        descricao: "O Leshy, conhecido como Liche, é um espírito protetor das florestas, mas extremamente perigoso quando seu território é invadido. Caça intrusos com paciência e precisão, usando a própria natureza como arma e imitando sons da floresta para atrair suas presas.",
        fraqueza: ["Óleo de Amaldiçoado", "Igni", "Yrden"],
        regiao: ["Florestas de Velen", "Florestas densas de Skellige"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/3/39/Tw3_journal_leshen.png/revision/latest?cb=20160511131517"
    },
    {
        nome: "Moiras",
        tipo: "Relicto",
        descricao: "As Moiras são três bruxas antigas e poderosas, conhecidas como Senhoras da Floresta, que manipulam os destinos dos mortais com mãos ensopadas de sangue. São cruéis, caprichosas e capazes de oferecer visões ou promessas em troca de servidão, sempre cobrando um preço por seus pactos.",
        fraqueza: ["Óleo de Híbrido", "Igni", "Yrden"],
        regiao: ["Velen – Pântano Retorcido"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/15/Tw3_journal_crones.png/revision/latest?cb=20160320064504"
    },
    {
        nome: "Púero",
        tipo: "Relicto",
        descricao: "Os púeros são criaturas simpáticas e quase extintas, que vivem próximas a florestas e pântanos. Possuem aparência semelhante a crianças humanas, mas com grandes olhos vibrantes e pele pálida azulada. São tímidos, apegados ao território e agem como guardiões discretos de pessoas e animais próximos.",
        fraqueza: [],
        regiao: ["Florestas", "Pântanos"],
        nivelDePerigo: 1,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/1/1b/Tw3_journal_godlings.png/revision/latest?cb=20170315192531"
    },
    {
        nome: "Shaelmaar",
        tipo: "Relicto",
        descricao: "Shaelmaars são grandes criaturas que passam a maior parte de suas vidas no subsolo, escavando túneis e raramente surgindo à superfície. Quando aparecem, atacam pessoas e destroem construções com tremores causados por suas escavações. São cegos e detectam presas por vibrações e sons.",
        fraqueza: ["Aard"],
        regiao: ["Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/6/61/Tw3_journal_sharley.png/revision/latest?cb=20160531173602"
    },
    {
        nome: "Silvano",
        tipo: "Relicto",
        descricao: "Os silvanos, também chamados de salgueiros ou pucks, são uma raça rara e inteligente nativa das florestas dos Reinos do Norte. Possuem traços físicos de cabra, como chifres, pernas peludas, cascos fendidos e cauda com penacho, e são conhecidos por seu gosto por brincadeiras, festas e música.",
        fraqueza: ["Óleo de relicto", "Igni", "Fungo demoníaco", "Samum"],
        regiao: ["Florestas dos Reinos do Norte"],
        nivelDePerigo: 3,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/9/94/Tw3_journal_sylvan.png/revision/latest?cb=20160407085103"
    },
    {
        nome: "Troncoso",
        tipo: "Relicto",
        descricao: "Os Troncosos, também conhecidos como Spriggans, são espíritos da floresta que protegem a natureza e atacam qualquer intruso em seu território. Podem manipular plantas, lançar feitiços e se camuflar entre árvores e arbustos, tornando-se adversários astutos e perigosos.",
        fraqueza: ["Óleo de Relicto", "Igni", "Bomba de dimerítio"],
        regiao: ["Florestas de Velen", "Florestas de Skellige"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/f/fe/Tw3_journal_spriggan.png/revision/latest?cb=20160604124832"
    },
    {
        nome: "Alpor",
        tipo: "Vampiro",
        descricao: "Alpores são vampiros sutis que se alimentam de forma sorrateira, causando pesadelos em suas vítimas com mordidas agonizantes. Diferentemente de outros vampiros, não despedaçam suas presas, deixando apenas marcas superficiais de mordida. São inteligentes e podem assumir formas disfarçadas para se aproximar das vítimas.",
        fraqueza: ["Óleo de Vampiro", "Pó de Lua", "Sangue Preto", "Yrden"],
        regiao: ["Velen", "Novigrad", "Toussaint"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/a/a9/Tw3_journal_alp.png/revision/latest?cb=20160605082627"
    },
    {
        nome: "Lâmia",
        tipo: "Vampiro",
        descricao: "As lâmias são vampiras que se disfarçam como mulheres sedutoras, mas revelam sua verdadeira forma como enormes morcegos negros com presas afiadas e garras letais. Ágeis, fortes e resistentes à luz do sol, são predadoras perigosas que atacam qualquer intruso.",
        fraqueza: ["Óleo de Vampiro", "Pó de Lua", "Sangue Preto", "Yrden"],
        regiao: ["Velen", "Florestas densas", "Regiões próximas a vilarejos", "Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d1/Tw3_journal_bruxa.png/revision/latest?cb=20160605085612"
    },
    {
        nome: "Ekimmu",
        tipo: "Vampiro",
        descricao: "Ekimmus são vampiros selvagens que atacam suas vítimas sem piedade, alimentando-se do sangue e dilacerando seus corpos. Raros e extremamente perigosos, vivem em regiões afastadas e evitam a luz do dia, atacando viajantes desavisados ou qualquer intruso que invada seu território.",
        fraqueza: ["Óleo de Vampiro", "Fungo Demoníaco", "Igni"],
        regiao: ["Cidades"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/d/d8/Tw3_journal_ekimmara.png/revision/latest?cb=20160514172201"
    },
    {
        nome: "Fleder",
        tipo: "Vampiro",
        descricao: "Fleders são vampiros selvagens e cruéis, semelhantes a ekimmus em comportamento. Vivem próximos a humanos, mas atacam de forma brutal, desmembrando suas vítimas sem piedade. São rápidos e letais, tornando-se adversários formidáveis mesmo para bruxos experientes.",
        fraqueza: ["Óleo de Vampiro", "Sangue Preto"],
        regiao: ["Cemitérios", "Prédios abandonados", "Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/c3/Tw3_journal_fleder.png/revision/latest?cb=20160605100142"
    },
    {
        nome: "Garkain",
        tipo: "Vampiro",
        descricao: "Garkains são vampiros inferiores, mais horríveis que os Fleders. Paralisam suas vítimas com sua aparência e atacam com saltos, garras afiadas e veneno das protuberâncias em suas cabeças. Alimentam-se de sangue e carne fresca, atacando de telhados ou locais elevados.",
        fraqueza: ["Óleo de Vampiro", "Sangue Preto"],
        regiao: ["Cemitérios", "Prédios abandonados", "Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/b/bb/Tw3_journal_garkain.png/revision/latest?cb=20160611160030"
    },
    {
        nome: "Katakan",
        tipo: "Vampiro",
        descricao: "Os katakans são vampiros inteligentes e sutis que se alimentam do sangue da população dos Reinos do Norte desde a Conjunção das Esferas. Preferem atacar sorrateiramente, bebendo o sangue de suas vítimas em doses menores e deixando apenas marcas superficiais de mordida.",
        fraqueza: ["Yrden", "Igni"],
        regiao: ["Reinos do Norte", "Cidades", "Cavernas escuras"],
        nivelDePerigo: 4,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/cd/Tw3_journal_katakan.png/revision/latest?cb=20160514194654"
    },
    {
        nome: "Protofleder",
        tipo: "Vampiro",
        descricao: "Protofleders são uma variação primitiva dos fleders, existentes apenas nas cavernas de Hen Gàidh em Toussaint. São raros e considerados ancestrais imediatos dos fleders, com grandes mandíbulas e garras afiadas, atacando suas presas com ferocidade.",
        fraqueza: ["Óleo de Vampiro", "Sangue Preto"],
        regiao: ["Cavernas de Hen Gàidh, Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/c/c8/Tw3_journal_protofleder.png/revision/latest?cb=20160611130116"
    },
    {
        nome: "Vampiro Superior",
        tipo: "Vampiro",
        descricao: "Os vampiros superiores são uma subespécie extremamente rara e poderosa. Possuem grande capacidade de regeneração, intelecto elevado e consciência altamente desenvolvida. Resistentes à luz solar e muito perigosos, são predadores formidáveis e entre os mais letais encontrados no Continente.",
        fraqueza: ["Óleo de Vampiro", "Sangue", "Igni"],
        regiao: ["Velen", "Novigrad", "Skellige", "Toussaint"],
        nivelDePerigo: 5,
        imageUrl: "https://static.wikia.nocookie.net/witcher/images/2/20/Tw3_journal_highervampire.png/revision/latest?cb=20160514060501"
    }
]

export default monsters