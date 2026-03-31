import { BookMarked, Compass, ScrollText, Skull, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import ArchivePortalSection from "@/components/portal/ArchivePortalSection";
import PortalDoorCard from "@/components/portal/PortalDoorCard";
import PortalHeroSection from "@/components/portal/PortalHeroSection";
import RitualSectionHeading from "@/components/portal/RitualSectionHeading";
import { encyclopediaEntries } from "@/lib/encyclopedia";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getWitcherBestiaryMetadata } from "@/lib/witcher-bestiary";

const primaryPortals = [
  {
    title: "Universo",
    description: "Reinos, linhagens, faccoes e ruinas lidas como um unico corpo de historia.",
    to: "/universo",
    cta: "Explorar universo",
    image: archiveReferenceArt.wanderer,
    icon: BookMarked,
  },
  {
    title: "Bestiario",
    description: "Criaturas, entidades e presencas sem repouso preservadas em dossies de caca.",
    to: "/bestiario",
    cta: "Abrir bestiario",
    image: archiveReferenceArt.creature,
    icon: Skull,
  },
  {
    title: "Cronicas",
    description: "Relatos de estrada, contratos e manuscritos que mantem a campanha respirando.",
    to: "/cronicas",
    cta: "Ler cronicas",
    image: archiveReferenceArt.desk,
    icon: ScrollText,
  },
] as const;

const archiveIndexCards = [
  {
    icon: BookMarked,
    title: "Universo",
    description: "Perfis, eras, faccoes e verbetes ligados ao mesmo arquivo.",
    path: "/universo",
  },
  {
    icon: Skull,
    title: "Bestiario",
    description: "Fraquezas, habitats, niveis de perigo e notas de encontro.",
    path: "/bestiario",
  },
  {
    icon: ScrollText,
    title: "Cronicas",
    description: "Capitulos, registros de sessao e manuscritos de campanha.",
    path: "/cronicas",
  },
  {
    icon: Compass,
    title: "Mapa",
    description: "Atlas por camadas, rotas, regioes, locais e travessias.",
    path: "/mapa",
  },
  {
    icon: Swords,
    title: "Jogar",
    description: "Hub de sessao com mesa, oraculo e preparo para a proxima cena.",
    path: "/jogar",
  },
] as const;

const archivePortals = [
  {
    title: "Abrir o atlas",
    description: "Cruze cartas regionais, fronteiras e locais do continente sem romper a leitura.",
    to: "/mapa",
    cta: "Ir para o mapa",
  },
  {
    title: "Entrar na sessao",
    description: "Acesse a mesa, organize a cena e mantenha dossies e cronicas por perto.",
    to: "/jogar",
    cta: "Abrir sessao",
  },
  {
    title: "Consultar o oraculo",
    description: "Leia registros em voz alta ou mantenha um dialogo continuo com Luna.",
    to: "/jogar/oraculo",
    cta: "Despertar Luna",
  },
  {
    title: "Enviar correspondencia",
    description: "Abra um canal direto com o arquivo para propostas, duvidas e contato.",
    to: "/contato",
    cta: "Ir para contato",
  },
] as const;

const bestiaryPreview = encyclopediaEntries
  .filter((entry) => entry.category === "monstros")
  .slice(0, 3);

export default function HomePage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="mx-auto max-w-[1380px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <PortalHeroSection
        kicker={archiveBrand.subtitle}
        titleTop="Arquivo do"
        titleBottom="Continente"
        tagline="Bestiarios, cartas do atlas, manuscritos e registros de sessao reunidos sob o mesmo selo."
        backgroundImage={archiveReferenceArt.hero}
        actions={[
          { label: "Explorar Universo", to: "/universo" },
          { label: "Abrir Bestiario", to: "/bestiario", variant: "secondary" },
          { label: "Entrar na Campanha", to: "/jogar", variant: "secondary" },
        ]}
      />

      <section className="dark-lore-door-grid">
        {primaryPortals.map((portal, index) => (
          <motion.div
            key={portal.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: index * 0.06 }}
          >
            <PortalDoorCard {...portal} />
          </motion.div>
        ))}
      </section>

      <section className="dark-lore-page-frame dark-lore-editorial-grid">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.58, ease: "easeOut" }}
          className="dark-lore-editorial-copy"
        >
          <p className="dark-lore-section-kicker">O chamado</p>
          <h2 className="dark-lore-section-title">Um portal feito para ler, cruzar e levar o mundo para a mesa.</h2>
          <p className="dark-lore-editorial-text">
            O Arquivo do Continente organiza lore, criaturas, cronicas e cartas do atlas como
            partes de uma mesma travessia. Primeiro voce entende o mundo. Depois encontra suas
            ameacas, abre os registros e leva tudo para a sessao.
          </p>
          <p className="dark-lore-editorial-text">
            Nada aqui deveria soar como ferramenta isolada. O mapa conversa com os verbetes, o
            bestiario dialoga com as cronicas, e a sessao continua a leitura sem quebrar o clima.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/mapa" className="dark-lore-button">
              Abrir Atlas Completo
            </Link>
            <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
              Cruzar com a Sessao
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.58, ease: "easeOut", delay: 0.08 }}
          className="dark-lore-editorial-figure"
        >
          <img
            src={archiveReferenceArt.portal}
            alt=""
            aria-hidden="true"
            className="dark-lore-editorial-image"
          />
          <div className="dark-lore-editorial-glow" />
        </motion.div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <RitualSectionHeading
            kicker="Indice do arquivo"
            title="Cinco portas para continuar a leitura"
            description="Cada trilha foi reduzida ao essencial: entrar, compreender o contexto e seguir para a proxima camada do continente sem friccao."
            align="center"
          />

          <div className="dark-lore-codex-grid">
            {archiveIndexCards.map(({ icon: Icon, title, description, path }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.24 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="dark-lore-archive-card dark-lore-archive-card-compact"
              >
                <Link to={path} className="dark-lore-codex-card">
                  <div className="dark-lore-icon-emblem">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="dark-lore-card-title text-[clamp(1.35rem,1.8vw,1.7rem)]">{title}</h3>
                    <p className="dark-lore-card-copy">{description}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <RitualSectionHeading
            kicker="Bestiario em vigilia"
            title="Tres presencas ja catalogadas"
            description="O arquivo de criaturas continua ligado ao mundo. Cada dossie pode abrir caca, atlas, cronica e sessao a partir do mesmo registro."
            align="center"
          />

          <div className="dark-lore-bestiary-grid">
            {bestiaryPreview.map((entry, index) => {
              const metadata = getWitcherBestiaryMetadata(entry.slug);

              return (
                <motion.article
                  key={entry.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.48, delay: index * 0.06 }}
                  className="dark-lore-beast-card"
                >
                  <div className="dark-lore-beast-image-wrap">
                    <img src={entry.image} alt={entry.imageAlt} className="dark-lore-beast-image" />
                  </div>
                  <div className="dark-lore-beast-body">
                    <h3 className="dark-lore-card-title text-[clamp(1.55rem,2vw,2rem)]">{entry.title}</h3>
                    <p className="dark-lore-card-meta">
                      {metadata?.type ?? "Entidade"}
                      {metadata ? ` - perigo ${metadata.dangerLevel}/5` : ""}
                    </p>
                    <p className="dark-lore-card-copy">{entry.summary}</p>
                    <Link to={`/bestiario/${entry.slug}`} className="dark-lore-button dark-lore-button-small">
                      Ver ficha
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <ArchivePortalSection
        kicker="Passagens do arquivo"
        title="Cada sala leva a outra"
        description="Atlas, bestiario, cronicas e sessao foram organizados como um unico arquivo. Entre por qualquer porta e o resto do continente se abre em seguida."
        items={archivePortals}
      />

      <section className="dark-lore-cta-band">
        <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
        <Link to="/jogar" className="dark-lore-button">
          Entrar no Portal
        </Link>
      </section>
    </div>
  );
}
