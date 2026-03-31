# Dark Lore Portal Visual Foundations

## Objetivo
Consolidar um sistema visual dark-first, editorial e jogável para o Arquivo do Continente.

## Paleta
- `surface-night`: base escura sem preto absoluto
- `surface-ink`: camada mais profunda para leitura e VTT
- `parchment-soft`: texto claro de corpo
- `ancient-gold`: destaque primário
- `soft-amber`: realce de hover e headings
- `muted-bronze`: bordas, outlines e separadores

## Princípios
- O fundo sustenta o conteúdo; não disputa com ele.
- O dourado sinaliza importância; não cobre a interface inteira.
- Profundidade deve vir de contraste, borda, glow controlado e transparência.
- Textura deve ficar nas extremidades e nas superfícies, nunca no centro do texto.

## Papéis de superfície
- `background`: página inteira
- `surface-base`: painéis editoriais
- `surface-raised`: cards e shells
- `surface-strong`: módulos em destaque
- `surface-ink`: overlays, VTT e áreas de foco

## Tipografia
- `display / heading`: Cinzel
- `body / interface`: Inter
- Labels e tabs sempre em uppercase com tracking amplo
- Medida de leitura recomendada: `60ch` a `68ch`

## Motion
- Fade e slide curtos, 400–800ms
- Hover lift leve
- Partículas somente em heróis e superfícies de entrada
- Nada decorativo deve bloquear clique ou leitura

## Uso de assets
- `archive-portal-mark.svg`: marca/selo do portal
- `mystic-divider.svg`: separação de seções
- `rune-circle.svg`: fundos de modal, CTAs ou hero
- `footer-runes.svg`: acabamento do rodapé

## Observações de ferramenta
- Figma: usar para espelhar tokens e composições, caso a integração esteja autorizada.
- Canva: útil para texturas e variações leves de ornamentação, se a conta estiver conectada.
- Vercel: usar na fase final para validar bundle, deploy e performance.
