# Database Structure

Este projeto usa o Supabase como banco principal. A migration
`supabase/migrations/20260312193000_world_database_structure.sql`
organiza o dominio de RPG em torno das entidades pedidas:

- `users`
- `characters`
- `campaigns`
- `sessions`
- `items`
- `spells`
- `monsters`
- `locations`
- `factions`
- `lore_entries`
- `products`
- `orders`

## Tabelas principais

- `campaigns`: campanha, GM, visibilidade, periodo, notas de sessao zero.
- `characters`: personagem do jogador ou NPC, agora ligado a campanha, faccao,
  local de origem e verbete de lore.
- `items`: item jogavel com slug, imagem, origem em produto digital e link para lore.
- `spells`: magia com slug, imagem, origem em produto digital e link para lore.
- `monsters`: bestiario com estatisticas, acoes, habitat e faccao associada.
- `locations`: locais navegaveis do mundo, com hierarquia, mapa e faccao controladora.
- `factions`: ordens, cultos, gremios e reinos com sede, lider e verbete.
- `lore_entries`: base editorial da enciclopedia, com categoria, narrativa e publicacao.

## Tabelas de apoio

- `campaign_members`: vinculo entre usuarios, personagens e campanhas.
- `lore_entry_media`: imagens e galeria de cada verbete.
- `lore_entry_links`: ligacoes internas entre paginas do lore.
- `lore_timeline_events`: eventos da linha do tempo por verbete.

## Compatibilidade com o que ja existe

Para nao quebrar o frontend atual, alguns nomes pedidos foram expostos como views
sobre tabelas ja usadas no projeto:

- `users` -> view sobre `profiles`
- `sessions` -> view sobre `game_sessions`
- `products` -> view sobre `digital_products`
- `orders` -> view sobre `store_orders`

Essas views usam `security_invoker = true` para respeitar as politicas de RLS das
tabelas originais.

## Relacoes centrais

- Um `campaign` pertence a um `user` (GM).
- Um `campaign` possui varios `sessions`.
- Um `campaign` possui varios `campaign_members`.
- Um `character` pode pertencer a um `campaign`, `faction` e `location`.
- Um `monster`, `location`, `faction`, `character`, `item` ou `spell` pode apontar
  para um `lore_entry`.
- Um `lore_entry` pode ter varias imagens, varios links internos e varios eventos
  de timeline.
- Um `product` pode ser a origem de `lore_entries`, `items`, `spells`, `monsters`,
  `locations` e `factions`.
- Um `order` representa a compra de um `product` por um `user`.
