# Dark Lore Portal - UI Renewal Handoff

## Figma File Structure
- `00 Cover`
- `01 Product Principles`
- `02 Foundations Lite`
- `03 Navigation + App Shell`
- `10 Jogar`
- `11 Mesa`
- `12 Mestre`
- `13 Ficha`
- `14 Story Engine`
- `20 Public Mapping`

## Product Principles
- Foundry utilitario, nao ornamental por padrao
- Dark fantasy preservado, mas com foco em legibilidade e estado
- `Narrative Shell` para rotas publicas
- `Session Shell` para jogar, mestre, ficha, story engine e depois oraculo
- O playfield e sempre protegido; o HUD orbita a cena

## Foundations Lite

### Color Roles
- `Background / Ink`: `--background`, `--background-strong`, `--surface-ink`
- `Surface / Raised`: `--surface-base`, `--surface-raised`, `--surface-strong`
- `Primary / Brand`: `--brand`, `--gold-light`, `--gold-dark`
- `Status`: `--status-good`, `--status-warn`, `--status-bad`, `--status-info`
- `Borders`: `--outline-variant`, `--border`

### Typography
- Display / headings: `--font-display`
- Body / product text: `--font-body`
- Mono / technical reads: `--font-mono`

### Shape + Elevation
- Base radius: `0`
- Product panels use thin strokes + soft inner highlight
- Shadow roles:
  - `--shadow-panel`
  - `--shadow-elevated`
  - `--shadow-glow-brand`

## Shared Components Mapped to Code
- `TopNav`
  - public/session variants in `/src/components/Header.tsx`
- `SectionHeader`
  - `/src/components/product/ProductShell.tsx`
- `PanelCard`
  - `/src/components/product/ProductShell.tsx`
- `MetricCard`
  - `/src/components/product/ProductShell.tsx`
- `ActionStrip`
  - `/src/components/product/ProductShell.tsx`
- `SidebarModule`
  - `/src/components/product/ProductShell.tsx`
- `StatusBanner`
  - `/src/components/product/ProductShell.tsx`
- `EmptyState`
  - `/src/components/product/ProductShell.tsx`

## Session Shell Styles
- `/src/styles/session-shell.css`
- Applied through theme `session` in `/src/lib/route-manifest.ts`
- Mounted via `/src/components/Layout.tsx`

## Screen Mapping

### 10 Jogar
- Hero with session overview
- Metrics row
- Module grid for Mesa, Oraculo, Ficha, Mestre, Story Engine
- Campaign launcher area
- Lore bridge sidebar

### 11 Mesa
- Reference shell for all operational surfaces
- Left controls rail
- Protected central stage
- Right command/sidebar structure
- Tactical top strip and session state

### 12 Mestre
- Command deck hero
- Metrics + priorities
- Quick links to Mesa, Story Engine and Oraculo
- Embedded command console below

### 13 Ficha
- Character dossier hero
- Summary rail
- Main sheet canvas
- Secondary tools row for dice, inventory and spellbook

### 14 Story Engine
- Production workspace hero
- Project metrics and linked context
- Left project rail + main work area
- Step states for ingest, analyze, characters and production

### 20 Public Mapping
- Public routes inherit the cleaner top nav and reduced shell noise
- `Home` becomes the clearest bridge between narrative archive and session suite
- `Universo`, `Bestiario`, `Cronicas`, `Mapa`, `Contato` should keep editorial tone but lose redundant ornament

## Responsive Intent
- Desktop first
- Top nav wraps before collapsing
- Session metrics collapse into 1-column cards under `768px`
- Internal pages preserve hierarchy before decorative density

## Current Constraint
- The Figma connector did not expose writable tools in this session, so this handoff mirrors the planned Figma file locally until the connector is available again.
