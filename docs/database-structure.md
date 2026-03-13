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
- `sheet_definitions`: schema JSON versionado da ficha.
- `character_attribute_values`: store persistido de atributos, derivados e repeaters.
- `character_sheet_revisions`: historico append-only de revisoes da ficha.
- `vtt_pages`: pages do VTT com grid, camera e ordem de camadas.
- `vtt_page_assets`: manifest de battlemaps e variantes de asset.
- `vtt_scene_objects`: tokens, walls, drawings e fontes de luz serializados.
- `vtt_fog_states`: estado page-scoped de fog e explorer data.
- `vtt_session_presence`: heartbeat e papel dos usuarios conectados.
- `vtt_chat_messages`: chat persistido da mesa.
- `vtt_event_log`: log append-only para auditoria, replay parcial e debug.

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
- Um `sheet_definition` governa o formato de `character_attribute_values`.
- Um `character` pode ter varias `character_sheet_revisions`.
- Uma `session` pode ter varias `vtt_pages`, `vtt_scene_objects`, `vtt_chat_messages`
  e eventos em `vtt_event_log`.
- Uma `vtt_page` pode ter um `vtt_fog_state` e varios `vtt_page_assets`.
