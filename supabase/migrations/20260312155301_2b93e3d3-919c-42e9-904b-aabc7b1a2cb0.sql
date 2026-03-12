
-- Enum types
CREATE TYPE public.character_race AS ENUM ('humano', 'elfo', 'anao', 'orc', 'tiefling', 'draconato', 'halfling', 'gnomo');
CREATE TYPE public.character_class AS ENUM ('guerreiro', 'mago', 'ladino', 'clerigo', 'ranger', 'paladino', 'barbaro', 'bardo', 'druida', 'feiticeiro', 'bruxo', 'monge');
CREATE TYPE public.item_type AS ENUM ('arma', 'armadura', 'pocao', 'pergaminho', 'material', 'miscelanea');
CREATE TYPE public.item_rarity AS ENUM ('comum', 'incomum', 'raro', 'epico', 'lendario');
CREATE TYPE public.combat_status AS ENUM ('aguardando', 'em_andamento', 'finalizado');
CREATE TYPE public.spell_school AS ENUM ('abjuracao', 'conjuracao', 'adivinhacao', 'encantamento', 'evocacao', 'ilusao', 'necromancia', 'transmutacao');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Aventureiro',
  avatar_url TEXT,
  is_game_master BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Characters
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  race character_race NOT NULL DEFAULT 'humano',
  class character_class NOT NULL DEFAULT 'guerreiro',
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  forca INTEGER NOT NULL DEFAULT 10,
  destreza INTEGER NOT NULL DEFAULT 10,
  constituicao INTEGER NOT NULL DEFAULT 10,
  inteligencia INTEGER NOT NULL DEFAULT 10,
  sabedoria INTEGER NOT NULL DEFAULT 10,
  carisma INTEGER NOT NULL DEFAULT 10,
  hp_max INTEGER NOT NULL DEFAULT 10,
  hp_current INTEGER NOT NULL DEFAULT 10,
  mp_max INTEGER NOT NULL DEFAULT 0,
  mp_current INTEGER NOT NULL DEFAULT 0,
  armor_class INTEGER NOT NULL DEFAULT 10,
  initiative_bonus INTEGER NOT NULL DEFAULT 0,
  speed INTEGER NOT NULL DEFAULT 30,
  gold INTEGER NOT NULL DEFAULT 0,
  background TEXT,
  appearance TEXT,
  portrait_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own characters" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own characters" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own characters" ON public.characters FOR DELETE USING (auth.uid() = user_id);

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  attribute TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills viewable by all" ON public.skills FOR SELECT USING (true);

-- Character Skills
CREATE TABLE public.character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficient BOOLEAN NOT NULL DEFAULT false,
  bonus INTEGER NOT NULL DEFAULT 0,
  UNIQUE(character_id, skill_id)
);
ALTER TABLE public.character_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own char skills" ON public.character_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_skills.character_id AND characters.user_id = auth.uid())
);
CREATE POLICY "Users manage own char skills" ON public.character_skills FOR ALL USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_skills.character_id AND characters.user_id = auth.uid())
);

-- Spells
CREATE TABLE public.spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  school spell_school NOT NULL DEFAULT 'evocacao',
  level INTEGER NOT NULL DEFAULT 0,
  casting_time TEXT NOT NULL DEFAULT '1 ação',
  range TEXT NOT NULL DEFAULT 'Toque',
  duration TEXT NOT NULL DEFAULT 'Instantâneo',
  damage TEXT,
  mp_cost INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spells viewable by all" ON public.spells FOR SELECT USING (true);

-- Character Spells
CREATE TABLE public.character_spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  spell_id UUID NOT NULL REFERENCES public.spells(id) ON DELETE CASCADE,
  prepared BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(character_id, spell_id)
);
ALTER TABLE public.character_spells ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own char spells" ON public.character_spells FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_spells.character_id AND characters.user_id = auth.uid())
);
CREATE POLICY "Users manage own char spells" ON public.character_spells FOR ALL USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_spells.character_id AND characters.user_id = auth.uid())
);

-- Items
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  item_type item_type NOT NULL DEFAULT 'miscelanea',
  rarity item_rarity NOT NULL DEFAULT 'comum',
  weight NUMERIC(6,2) NOT NULL DEFAULT 0,
  value INTEGER NOT NULL DEFAULT 0,
  damage TEXT,
  armor_bonus INTEGER,
  effect TEXT,
  is_default BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable by all" ON public.items FOR SELECT USING (true);

-- Character Inventory
CREATE TABLE public.character_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own inventory" ON public.character_inventory FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_inventory.character_id AND characters.user_id = auth.uid())
);
CREATE POLICY "Users manage own inventory" ON public.character_inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM public.characters WHERE characters.id = character_inventory.character_id AND characters.user_id = auth.uid())
);

-- Game Sessions
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game_master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_players INTEGER NOT NULL DEFAULT 4,
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_round INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions viewable by all" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "GM creates sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = game_master_id);
CREATE POLICY "GM updates sessions" ON public.game_sessions FOR UPDATE USING (auth.uid() = game_master_id);
CREATE POLICY "GM deletes sessions" ON public.game_sessions FOR DELETE USING (auth.uid() = game_master_id);

-- Session Players
CREATE TABLE public.session_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, character_id)
);
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session players viewable" ON public.session_players FOR SELECT USING (true);
CREATE POLICY "Users join sessions" ON public.session_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave sessions" ON public.session_players FOR DELETE USING (auth.uid() = user_id);

-- Combat Encounters
CREATE TABLE public.combat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Combate',
  status combat_status NOT NULL DEFAULT 'aguardando',
  current_turn INTEGER NOT NULL DEFAULT 0,
  round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.combat_encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Combat viewable by all" ON public.combat_encounters FOR SELECT USING (true);
CREATE POLICY "GM manages combat" ON public.combat_encounters FOR ALL USING (
  EXISTS (SELECT 1 FROM public.game_sessions WHERE game_sessions.id = combat_encounters.session_id AND game_sessions.game_master_id = auth.uid())
);

-- Combat Participants
CREATE TABLE public.combat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.combat_encounters(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  npc_name TEXT,
  initiative INTEGER NOT NULL DEFAULT 0,
  hp_current INTEGER NOT NULL DEFAULT 10,
  hp_max INTEGER NOT NULL DEFAULT 10,
  is_npc BOOLEAN NOT NULL DEFAULT false,
  turn_order INTEGER NOT NULL DEFAULT 0,
  conditions TEXT[] DEFAULT '{}'
);
ALTER TABLE public.combat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable" ON public.combat_participants FOR SELECT USING (true);
CREATE POLICY "GM manages participants" ON public.combat_participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.combat_encounters ce
    JOIN public.game_sessions gs ON gs.id = ce.session_id
    WHERE ce.id = combat_participants.encounter_id AND gs.game_master_id = auth.uid()
  )
);

-- Battle Log
CREATE TABLE public.battle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.combat_encounters(id) ON DELETE CASCADE,
  round INTEGER NOT NULL DEFAULT 1,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  damage INTEGER,
  dice_roll TEXT,
  dice_result INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Battle log viewable" ON public.battle_log FOR SELECT USING (true);
CREATE POLICY "Battle log insertable" ON public.battle_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Dice Roll History
CREATE TABLE public.dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  dice_type TEXT NOT NULL,
  num_dice INTEGER NOT NULL DEFAULT 1,
  modifier INTEGER NOT NULL DEFAULT 0,
  results INTEGER[] NOT NULL,
  total INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dice_rolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dice rolls viewable" ON public.dice_rolls FOR SELECT USING (true);
CREATE POLICY "Users create own rolls" ON public.dice_rolls FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Aventureiro'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default skills
INSERT INTO public.skills (name, description, attribute) VALUES
  ('Acrobacia', 'Piruetas, saltos e equilíbrio', 'destreza'),
  ('Arcanismo', 'Conhecimento de magia e planos', 'inteligencia'),
  ('Atletismo', 'Escalar, nadar, saltar', 'forca'),
  ('Atuação', 'Entreter e disfarçar-se', 'carisma'),
  ('Enganação', 'Mentir e ludibriar', 'carisma'),
  ('Furtividade', 'Mover-se sem ser notado', 'destreza'),
  ('História', 'Conhecimento do passado', 'inteligencia'),
  ('Intimidação', 'Coagir através do medo', 'carisma'),
  ('Investigação', 'Procurar pistas e deduzir', 'inteligencia'),
  ('Medicina', 'Estabilizar e diagnosticar', 'sabedoria'),
  ('Natureza', 'Conhecimento do mundo natural', 'inteligencia'),
  ('Percepção', 'Notar coisas ao redor', 'sabedoria'),
  ('Persuasão', 'Influenciar com tato', 'carisma'),
  ('Prestidigitação', 'Truques manuais e furtos', 'destreza'),
  ('Religião', 'Conhecimento divino', 'inteligencia'),
  ('Sobrevivência', 'Rastrear e sobreviver ao ar livre', 'sabedoria');

-- Seed default spells
INSERT INTO public.spells (name, description, school, level, casting_time, range, duration, damage, mp_cost) VALUES
  ('Mísseis Arcanos', 'Três dardos de energia atingem alvos automaticamente', 'evocacao', 1, '1 ação', '36m', 'Instantâneo', '3d4+3', 1),
  ('Bola de Fogo', 'Esfera de chamas explode numa área', 'evocacao', 3, '1 ação', '45m', 'Instantâneo', '8d6', 3),
  ('Curar Ferimentos', 'Toque restaura pontos de vida', 'evocacao', 1, '1 ação', 'Toque', 'Instantâneo', NULL, 1),
  ('Escudo Arcano', 'Barreira mágica protege contra ataques', 'abjuracao', 1, '1 reação', 'Pessoal', '1 rodada', NULL, 1),
  ('Raio de Gelo', 'Raio gelado causa dano e reduz velocidade', 'evocacao', 0, '1 ação', '18m', 'Instantâneo', '1d8', 0),
  ('Detectar Magia', 'Sente a presença de magia ao redor', 'adivinhacao', 1, '1 ação', 'Pessoal', '10 min', NULL, 1),
  ('Invisibilidade', 'Criatura tocada torna-se invisível', 'ilusao', 2, '1 ação', 'Toque', '1 hora', NULL, 2),
  ('Relâmpago', 'Raio de eletricidade em linha reta', 'evocacao', 3, '1 ação', '30m linha', 'Instantâneo', '8d6', 3),
  ('Ressurreição', 'Traz uma criatura de volta à vida', 'necromancia', 5, '1 hora', 'Toque', 'Instantâneo', NULL, 5),
  ('Nuvem Mortal', 'Nuvem de veneno letal', 'conjuracao', 5, '1 ação', '36m', '10 min', '5d8', 5);

-- Seed default items
INSERT INTO public.items (name, description, item_type, rarity, weight, value, damage, armor_bonus, effect) VALUES
  ('Espada Longa', 'Lâmina de aço temperado', 'arma', 'comum', 3, 15, '1d8', NULL, NULL),
  ('Arco Longo', 'Arco de teixo para longo alcance', 'arma', 'comum', 2, 50, '1d8', NULL, NULL),
  ('Adaga', 'Lâmina curta e versátil', 'arma', 'comum', 1, 2, '1d4', NULL, NULL),
  ('Machado de Batalha', 'Machado pesado de guerra', 'arma', 'comum', 4, 10, '1d8', NULL, NULL),
  ('Cajado Arcano', 'Cajado imbuído de energia mágica', 'arma', 'incomum', 4, 100, '1d6', NULL, '+1 em ataques mágicos'),
  ('Cota de Malha', 'Armadura de anéis metálicos entrelaçados', 'armadura', 'comum', 55, 75, NULL, 16, NULL),
  ('Armadura de Couro', 'Proteção leve e flexível', 'armadura', 'comum', 10, 10, NULL, 11, NULL),
  ('Escudo de Aço', 'Escudo resistente de aço', 'armadura', 'comum', 6, 10, NULL, 2, NULL),
  ('Poção de Cura', 'Restaura 2d4+2 pontos de vida', 'pocao', 'comum', 0.5, 50, NULL, NULL, 'Cura 2d4+2 HP'),
  ('Poção de Mana', 'Restaura 2d4 pontos de mana', 'pocao', 'comum', 0.5, 75, NULL, NULL, 'Restaura 2d4 MP'),
  ('Pergaminho de Bola de Fogo', 'Pergaminho de uso único', 'pergaminho', 'raro', 0.1, 200, '8d6', NULL, 'Conjura Bola de Fogo'),
  ('Espada Flamejante', 'Lâmina envolta em chamas eternas', 'arma', 'epico', 3, 5000, '2d6+1d6 fogo', NULL, 'Causa dano de fogo adicional'),
  ('Armadura do Dragão', 'Forjada com escamas de dragão', 'armadura', 'lendario', 65, 15000, NULL, 20, 'Resistência a fogo');
