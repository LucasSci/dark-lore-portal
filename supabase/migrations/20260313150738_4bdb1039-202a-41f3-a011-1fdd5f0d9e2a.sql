
-- Storage bucket for battlemaps and VTT assets
INSERT INTO storage.buckets (id, name, public) VALUES ('battlemaps', 'battlemaps', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read battlemaps
CREATE POLICY "Public battlemaps read" ON storage.objects
  FOR SELECT USING (bucket_id = 'battlemaps');

-- RLS: authenticated users can upload battlemaps
CREATE POLICY "Authenticated battlemaps upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'battlemaps');

-- RLS: users can update their own uploads
CREATE POLICY "Users update own battlemaps" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'battlemaps' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can delete their own uploads
CREATE POLICY "Users delete own battlemaps" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'battlemaps' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lore entries table for campaign content
CREATE TABLE IF NOT EXISTS public.lore_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'evento',
  summary text,
  content text,
  chapter_number int,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lore_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lore entries viewable by all" ON public.lore_entries
  FOR SELECT USING (is_published = true);

-- Campaign characters (NPCs from the story)
CREATE TABLE IF NOT EXISTS public.campaign_npcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  description text,
  faction text,
  location text,
  is_ally boolean DEFAULT true,
  portrait_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign NPCs viewable by all" ON public.campaign_npcs
  FOR SELECT USING (true);

-- Campaign locations
CREATE TABLE IF NOT EXISTS public.campaign_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text,
  description text,
  location_type text DEFAULT 'cidade',
  is_discovered boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign locations viewable by all" ON public.campaign_locations
  FOR SELECT USING (true);

-- Campaign factions
CREATE TABLE IF NOT EXISTS public.campaign_factions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  alignment text DEFAULT 'neutro',
  leader text,
  headquarters text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_factions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign factions viewable by all" ON public.campaign_factions
  FOR SELECT USING (true);

-- Campaign timeline events
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number int NOT NULL,
  title text NOT NULL,
  description text,
  event_type text DEFAULT 'narrativo',
  location text,
  participants text[],
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign events viewable by all" ON public.campaign_events
  FOR SELECT USING (true);
