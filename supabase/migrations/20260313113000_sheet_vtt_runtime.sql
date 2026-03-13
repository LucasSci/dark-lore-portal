create or replace function public.can_access_game_session(session_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.game_sessions sessions
    where sessions.id = session_uuid
      and sessions.game_master_id = auth.uid()
  )
  or exists (
    select 1
    from public.session_players players
    where players.session_id = session_uuid
      and players.user_id = auth.uid()
  );
$$;

create or replace function public.owns_character(character_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.characters characters
    where characters.id = character_uuid
      and characters.user_id = auth.uid()
  );
$$;

create table if not exists public.sheet_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  version integer not null default 1,
  name text not null,
  schema jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.character_attribute_values (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  sheet_definition_id uuid not null references public.sheet_definitions(id) on delete cascade,
  attributes jsonb not null default '{}'::jsonb,
  derived jsonb not null default '{}'::jsonb,
  repeaters jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  unique (character_id, sheet_definition_id)
);

create table if not exists public.character_sheet_revisions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  sheet_definition_id uuid not null references public.sheet_definitions(id) on delete cascade,
  revision integer not null,
  source text not null default 'ui',
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (character_id, sheet_definition_id, revision)
);

create table if not exists public.vtt_pages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  name text not null,
  grid_type text not null default 'square',
  grid_size integer not null default 72,
  width integer not null default 12,
  height integer not null default 8,
  background_asset_id uuid null,
  layer_order text[] not null default array['map', 'objects', 'gm', 'walls', 'foreground'],
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vtt_page_assets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  page_id uuid references public.vtt_pages(id) on delete cascade,
  kind text not null,
  mime_type text not null,
  original_path text not null,
  board_variant_path text,
  thumb_variant_path text,
  zoom_variant_path text,
  grid_metadata jsonb not null default '{}'::jsonb,
  page_count integer not null default 1,
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vtt_scene_objects (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  page_id uuid not null references public.vtt_pages(id) on delete cascade,
  object_type text not null,
  layer text not null,
  position jsonb not null default '{}'::jsonb,
  size jsonb not null default '{}'::jsonb,
  rotation numeric not null default 0,
  payload jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.vtt_fog_states (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  page_id uuid not null references public.vtt_pages(id) on delete cascade unique,
  fog_state jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.vtt_session_presence (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'player',
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create table if not exists public.vtt_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  page_id uuid references public.vtt_pages(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  tone text not null default 'party',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.vtt_event_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  page_id uuid references public.vtt_pages(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  revision integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_character_attribute_values_character on public.character_attribute_values(character_id);
create index if not exists idx_character_sheet_revisions_character on public.character_sheet_revisions(character_id, revision desc);
create index if not exists idx_vtt_pages_session on public.vtt_pages(session_id);
create index if not exists idx_vtt_page_assets_session on public.vtt_page_assets(session_id);
create index if not exists idx_vtt_scene_objects_page on public.vtt_scene_objects(page_id);
create index if not exists idx_vtt_chat_messages_session on public.vtt_chat_messages(session_id, created_at desc);
create index if not exists idx_vtt_event_log_session on public.vtt_event_log(session_id, created_at desc);

alter table public.sheet_definitions enable row level security;
alter table public.character_attribute_values enable row level security;
alter table public.character_sheet_revisions enable row level security;
alter table public.vtt_pages enable row level security;
alter table public.vtt_page_assets enable row level security;
alter table public.vtt_scene_objects enable row level security;
alter table public.vtt_fog_states enable row level security;
alter table public.vtt_session_presence enable row level security;
alter table public.vtt_chat_messages enable row level security;
alter table public.vtt_event_log enable row level security;

create policy "sheet_definitions_select_authenticated"
on public.sheet_definitions
for select
to authenticated
using (true);

create policy "character_attribute_values_owner_read"
on public.character_attribute_values
for select
to authenticated
using (public.owns_character(character_id));

create policy "character_attribute_values_owner_write"
on public.character_attribute_values
for all
to authenticated
using (public.owns_character(character_id))
with check (public.owns_character(character_id));

create policy "character_sheet_revisions_owner_read"
on public.character_sheet_revisions
for select
to authenticated
using (public.owns_character(character_id));

create policy "character_sheet_revisions_owner_write"
on public.character_sheet_revisions
for insert
to authenticated
with check (public.owns_character(character_id));

create policy "vtt_pages_session_access"
on public.vtt_pages
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));

create policy "vtt_page_assets_session_access"
on public.vtt_page_assets
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));

create policy "vtt_scene_objects_session_access"
on public.vtt_scene_objects
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));

create policy "vtt_fog_states_session_access"
on public.vtt_fog_states
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));

create policy "vtt_session_presence_member_access"
on public.vtt_session_presence
for all
to authenticated
using (
  public.can_access_game_session(session_id)
  and (user_id = auth.uid() or public.can_access_game_session(session_id))
)
with check (
  public.can_access_game_session(session_id)
  and user_id = auth.uid()
);

create policy "vtt_chat_messages_session_access"
on public.vtt_chat_messages
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));

create policy "vtt_event_log_session_access"
on public.vtt_event_log
for all
to authenticated
using (public.can_access_game_session(session_id))
with check (public.can_access_game_session(session_id));
