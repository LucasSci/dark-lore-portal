CREATE TYPE public.campaign_status AS ENUM (
  'rascunho',
  'ativa',
  'pausada',
  'concluida',
  'arquivada'
);

CREATE TYPE public.campaign_member_role AS ENUM (
  'mestre',
  'jogador',
  'observador'
);

CREATE TYPE public.campaign_member_status AS ENUM (
  'convidado',
  'ativo',
  'removido',
  'encerrado'
);

CREATE TYPE public.session_status AS ENUM (
  'rascunho',
  'agendada',
  'ao_vivo',
  'encerrada',
  'cancelada'
);

CREATE TYPE public.lore_entry_category AS ENUM (
  'personagem',
  'monstro',
  'local',
  'faccao',
  'historia',
  'item',
  'magia',
  'campanha'
);

CREATE TYPE public.location_kind AS ENUM (
  'reino',
  'cidade',
  'fortaleza',
  'masmorra',
  'floresta',
  'ruina',
  'fronteira',
  'plano',
  'regiao'
);

CREATE TYPE public.faction_kind AS ENUM (
  'ordem',
  'culto',
  'gremio',
  'reino',
  'tribo',
  'cabala',
  'mercenarios'
);

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  cover_url TEXT,
  setting_name TEXT,
  game_master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.campaign_status NOT NULL DEFAULT 'rascunho',
  max_players INTEGER NOT NULL DEFAULT 5 CHECK (max_players > 0),
  start_date DATE,
  end_date DATE,
  session_zero_notes TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game masters create campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (auth.uid() = game_master_id);

CREATE POLICY "Game masters update campaigns"
ON public.campaigns
FOR UPDATE
USING (auth.uid() = game_master_id)
WITH CHECK (auth.uid() = game_master_id);

CREATE POLICY "Game masters delete campaigns"
ON public.campaigns
FOR DELETE
USING (auth.uid() = game_master_id);

CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  role public.campaign_member_role NOT NULL DEFAULT 'jogador',
  membership_status public.campaign_member_status NOT NULL DEFAULT 'convidado',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members visible to members and gm"
ON public.campaign_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = campaign_members.campaign_id
      AND (
        campaigns.game_master_id = auth.uid()
        OR campaigns.is_public
      )
  )
);

CREATE POLICY "Campaign members can join themselves or be managed by gm"
ON public.campaign_members
FOR INSERT
WITH CHECK (
  (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = campaign_members.campaign_id
        AND campaigns.is_public
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.game_master_id = auth.uid()
  )
);

CREATE POLICY "Campaign members updated by gm"
ON public.campaign_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.game_master_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.game_master_id = auth.uid()
  )
);

CREATE POLICY "Campaign members removed by self or gm"
ON public.campaign_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.campaigns
    WHERE campaigns.id = campaign_members.campaign_id
      AND campaigns.game_master_id = auth.uid()
  )
);

CREATE POLICY "Campaigns visible to members or public"
ON public.campaigns
FOR SELECT
USING (
  is_public
  OR auth.uid() = game_master_id
  OR EXISTS (
    SELECT 1
    FROM public.campaign_members
    WHERE campaign_members.campaign_id = campaigns.id
      AND campaign_members.user_id = auth.uid()
      AND campaign_members.membership_status = 'ativo'
  )
);

CREATE TABLE public.lore_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category public.lore_entry_category NOT NULL,
  excerpt TEXT,
  narrative TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  timeline_overview TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lore_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lore visible when published or owned"
ON public.lore_entries
FOR SELECT
USING (
  is_published
  OR auth.uid() = author_id
  OR (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = lore_entries.campaign_id
        AND campaigns.game_master_id = auth.uid()
    )
  )
  OR (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.campaign_members
      WHERE campaign_members.campaign_id = lore_entries.campaign_id
        AND campaign_members.user_id = auth.uid()
        AND campaign_members.membership_status = 'ativo'
    )
  )
);

CREATE POLICY "Authors create lore entries"
ON public.lore_entries
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND COALESCE(author_id, auth.uid()) = auth.uid()
);

CREATE POLICY "Authors or campaign gm update lore entries"
ON public.lore_entries
FOR UPDATE
USING (
  auth.uid() = author_id
  OR (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = lore_entries.campaign_id
        AND campaigns.game_master_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() = author_id
  OR (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = lore_entries.campaign_id
        AND campaigns.game_master_id = auth.uid()
    )
  )
);

CREATE POLICY "Authors or campaign gm delete lore entries"
ON public.lore_entries
FOR DELETE
USING (
  auth.uid() = author_id
  OR (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = lore_entries.campaign_id
        AND campaigns.game_master_id = auth.uid()
    )
  )
);

CREATE TABLE public.lore_entry_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.lore_entries(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lore_entry_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lore media follows lore visibility"
ON public.lore_entry_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_media.entry_id
      AND (
        lore_entries.is_published
        OR lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "Lore media managed by lore authors"
ON public.lore_entry_media
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_media.entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_media.entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE TABLE public.lore_entry_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_entry_id UUID NOT NULL REFERENCES public.lore_entries(id) ON DELETE CASCADE,
  target_entry_id UUID NOT NULL REFERENCES public.lore_entries(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'relacionado',
  link_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_entry_id, target_entry_id, link_type)
);

ALTER TABLE public.lore_entry_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lore links follow source visibility"
ON public.lore_entry_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_links.source_entry_id
      AND (
        lore_entries.is_published
        OR lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "Lore links managed by lore authors"
ON public.lore_entry_links
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_links.source_entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_entry_links.source_entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE TABLE public.lore_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.lore_entries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date_label TEXT NOT NULL,
  event_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lore_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lore timeline follows lore visibility"
ON public.lore_timeline_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_timeline_events.entry_id
      AND (
        lore_entries.is_published
        OR lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "Lore timeline managed by lore authors"
ON public.lore_timeline_events
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_timeline_events.entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lore_entries
    WHERE lore_entries.id = lore_timeline_events.entry_id
      AND (
        lore_entries.author_id = auth.uid()
        OR (
          lore_entries.campaign_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.campaigns
            WHERE campaigns.id = lore_entries.campaign_id
              AND campaigns.game_master_id = auth.uid()
          )
        )
      )
  )
);

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind public.location_kind NOT NULL DEFAULT 'regiao',
  short_description TEXT,
  image_url TEXT,
  map_image_url TEXT,
  parent_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
  source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations visible when published or owned"
ON public.locations
FOR SELECT
USING (is_published OR auth.uid() = created_by);

CREATE POLICY "Authenticated users create locations"
ON public.locations
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND COALESCE(created_by, auth.uid()) = auth.uid()
);

CREATE POLICY "Creators update locations"
ON public.locations
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators delete locations"
ON public.locations
FOR DELETE
USING (auth.uid() = created_by);

CREATE TABLE public.factions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind public.faction_kind NOT NULL DEFAULT 'ordem',
  tagline TEXT,
  short_description TEXT,
  image_url TEXT,
  headquarters_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  leader_character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
  source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.factions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Factions visible when published or owned"
ON public.factions
FOR SELECT
USING (is_published OR auth.uid() = created_by);

CREATE POLICY "Authenticated users create factions"
ON public.factions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND COALESCE(created_by, auth.uid()) = auth.uid()
);

CREATE POLICY "Creators update factions"
ON public.factions
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators delete factions"
ON public.factions
FOR DELETE
USING (auth.uid() = created_by);

ALTER TABLE public.locations
ADD COLUMN controlling_faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL;

CREATE TABLE public.monsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monster_family TEXT NOT NULL DEFAULT 'aberracao',
  size_label TEXT NOT NULL DEFAULT 'medio',
  challenge_rating NUMERIC(5,2) NOT NULL DEFAULT 1,
  armor_class INTEGER,
  hit_points INTEGER,
  speed TEXT,
  senses TEXT,
  languages TEXT,
  short_description TEXT,
  image_url TEXT,
  stat_block JSONB NOT NULL DEFAULT '{}'::jsonb,
  abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
  home_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
  source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.monsters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Monsters visible when published or owned"
ON public.monsters
FOR SELECT
USING (is_published OR auth.uid() = created_by);

CREATE POLICY "Authenticated users create monsters"
ON public.monsters
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND COALESCE(created_by, auth.uid()) = auth.uid()
);

CREATE POLICY "Creators update monsters"
ON public.monsters
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators delete monsters"
ON public.monsters
FOR DELETE
USING (auth.uid() = created_by);

ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS origin_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_npc BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.spells
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source_product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.campaigns
ADD COLUMN lore_entry_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
ADD COLUMN starting_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;

ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS session_code TEXT DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
ADD COLUMN IF NOT EXISTS status public.session_status NOT NULL DEFAULT 'rascunho',
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS map_state JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS fog_state JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS chat_state JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS initiative_state JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX characters_slug_key
ON public.characters (slug)
WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX characters_lore_entry_id_key
ON public.characters (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX items_slug_key
ON public.items (slug)
WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX items_lore_entry_id_key
ON public.items (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX spells_slug_key
ON public.spells (slug)
WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX spells_lore_entry_id_key
ON public.spells (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX campaigns_lore_entry_id_key
ON public.campaigns (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX locations_lore_entry_id_key
ON public.locations (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX factions_lore_entry_id_key
ON public.factions (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX monsters_lore_entry_id_key
ON public.monsters (lore_entry_id)
WHERE lore_entry_id IS NOT NULL;

CREATE UNIQUE INDEX game_sessions_session_code_key
ON public.game_sessions (session_code)
WHERE session_code IS NOT NULL;

CREATE INDEX campaigns_game_master_id_idx
ON public.campaigns (game_master_id);

CREATE INDEX campaign_members_campaign_id_idx
ON public.campaign_members (campaign_id);

CREATE INDEX campaign_members_user_id_idx
ON public.campaign_members (user_id);

CREATE INDEX characters_campaign_id_idx
ON public.characters (campaign_id);

CREATE INDEX characters_faction_id_idx
ON public.characters (faction_id);

CREATE INDEX characters_origin_location_id_idx
ON public.characters (origin_location_id);

CREATE INDEX game_sessions_campaign_id_idx
ON public.game_sessions (campaign_id);

CREATE INDEX game_sessions_location_id_idx
ON public.game_sessions (location_id);

CREATE INDEX lore_entries_category_idx
ON public.lore_entries (category);

CREATE INDEX lore_entries_campaign_id_idx
ON public.lore_entries (campaign_id);

CREATE INDEX lore_entry_media_entry_id_idx
ON public.lore_entry_media (entry_id);

CREATE INDEX lore_entry_links_source_entry_id_idx
ON public.lore_entry_links (source_entry_id);

CREATE INDEX lore_entry_links_target_entry_id_idx
ON public.lore_entry_links (target_entry_id);

CREATE INDEX lore_timeline_events_entry_id_idx
ON public.lore_timeline_events (entry_id);

CREATE INDEX locations_parent_location_id_idx
ON public.locations (parent_location_id);

CREATE INDEX locations_controlling_faction_id_idx
ON public.locations (controlling_faction_id);

CREATE INDEX factions_headquarters_location_id_idx
ON public.factions (headquarters_location_id);

CREATE INDEX factions_leader_character_id_idx
ON public.factions (leader_character_id);

CREATE INDEX monsters_home_location_id_idx
ON public.monsters (home_location_id);

CREATE INDEX monsters_faction_id_idx
ON public.monsters (faction_id);

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lore_entries_updated_at
BEFORE UPDATE ON public.lore_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factions_updated_at
BEFORE UPDATE ON public.factions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monsters_updated_at
BEFORE UPDATE ON public.monsters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP VIEW IF EXISTS public.users;
CREATE VIEW public.users AS
SELECT
  profiles.user_id AS id,
  profiles.id AS profile_id,
  profiles.display_name,
  profiles.avatar_url,
  profiles.is_game_master,
  profiles.created_at,
  profiles.updated_at
FROM public.profiles;
ALTER VIEW public.users SET (security_invoker = true);

DROP VIEW IF EXISTS public.sessions;
CREATE VIEW public.sessions AS
SELECT
  game_sessions.id,
  game_sessions.campaign_id,
  game_sessions.location_id,
  game_sessions.session_code,
  game_sessions.name,
  game_sessions.description,
  game_sessions.summary,
  game_sessions.game_master_id,
  game_sessions.status,
  game_sessions.max_players,
  game_sessions.is_active,
  game_sessions.current_round,
  game_sessions.scheduled_for,
  game_sessions.started_at,
  game_sessions.ended_at,
  game_sessions.map_state,
  game_sessions.fog_state,
  game_sessions.chat_state,
  game_sessions.initiative_state,
  game_sessions.metadata,
  game_sessions.created_at,
  game_sessions.updated_at
FROM public.game_sessions;
ALTER VIEW public.sessions SET (security_invoker = true);

DROP VIEW IF EXISTS public.products;
CREATE VIEW public.products AS
SELECT
  digital_products.id,
  digital_products.slug,
  digital_products.title,
  digital_products.short_description,
  digital_products.description,
  digital_products.product_type,
  digital_products.price_cents,
  digital_products.currency,
  digital_products.cover_url,
  digital_products.format_details,
  digital_products.download_size_label,
  digital_products.file_bucket,
  digital_products.file_path,
  digital_products.download_file_name,
  digital_products.preview_points,
  digital_products.tags,
  digital_products.is_active,
  digital_products.is_featured,
  digital_products.sort_order,
  digital_products.created_at,
  digital_products.updated_at
FROM public.digital_products;
ALTER VIEW public.products SET (security_invoker = true);

DROP VIEW IF EXISTS public.orders;
CREATE VIEW public.orders AS
SELECT
  store_orders.id,
  store_orders.user_id,
  store_orders.product_id,
  store_orders.stripe_checkout_session_id,
  store_orders.stripe_payment_intent_id,
  store_orders.payment_status AS status,
  store_orders.amount_total,
  store_orders.currency,
  store_orders.download_count,
  store_orders.purchased_at,
  store_orders.last_downloaded_at,
  store_orders.metadata,
  store_orders.created_at,
  store_orders.updated_at
FROM public.store_orders;
ALTER VIEW public.orders SET (security_invoker = true);

GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.sessions TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
