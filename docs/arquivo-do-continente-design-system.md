# Arquivo do Continente Design System

## Direcao visual
- Grim, ancient, premium, tactile.
- O portal deve parecer um artefato de leitura e navegacao, nao um dashboard generico.
- Preto profundo, dourado envelhecido, bronze escuro e superfices translucidas com profundidade.

## Tipografia
- Titulos: `Cinzel` para H1-H3 e chamadas de alto impacto.
- Texto corrido: `Inter` para leitura longa e interfaces.
- Medida recomendada: `60ch` a `68ch`.
- Grid base: espacamento em multiplos de `8px`.

## Tokens visuais
- Base: `--background`, `--background-strong`, `--surface-base`, `--surface-raised`.
- Acentos: `--brand`, `--warning`, `--info`, `--destructive`.
- Profundidade: `--shadow-panel`, `--shadow-elevated`, `backdrop-blur`.

## Primitives de layout
- `PageContainer`: largura e gutters consistentes.
- `Section`: cabecalho editorial reutilizavel com eyebrow, titulo, descricao e acoes.
- `Grid`: layouts padrao para cards, stats, feature split e sidebar.
- `Panel`: painel modular dark fantasy para areas laterais e blocos internos.

## Familias de card
- `ArtifactCard`
  - `relic`: destaque premium, borda dourada, maior elevacao.
  - `scroll`: leitura de lore em tom de pergaminho.
  - `minimal`: informacao secundaria, discreta.
- `FeatureCard`: bloco principal de narrativa ou destaque.
- `SideCard`: card lateral com icone, titulo e descricao.
- `StatCard`: metrica curta e legivel.
- `ListCard`: listas, feeds, modulos com cabecalho claro.

## Controles
- `Button`: primary, secondary, outline, ghost e estados semanticos.
- `Tag`: filtros e categorias com estado ativo/inativo.
- `Badge`: estados de status, labels e marcadores de contexto.
- `Input`, `Select`, `Tabs`: sempre sobre superfices escuras com blur leve e contraste forte.

## Aplicacao recomendada
- Home, Community, Universe e Campaign devem usar `Section` + `PageContainer`.
- Informacao lateral deve preferir `Panel` ou `SideCard`.
- Destaques editoriais devem preferir `FeatureCard`.
- Dados pequenos e sinais rapidos devem preferir `StatCard`.
- Feed, lista de rumores e entradas de enciclopedia devem preferir `ListCard`.
