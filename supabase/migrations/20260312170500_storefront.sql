CREATE TYPE public.digital_product_type AS ENUM (
  'livro_pdf',
  'mapa',
  'token',
  'aventura',
  'classe',
  'item'
);

CREATE TYPE public.store_order_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TABLE public.digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  product_type public.digital_product_type NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'brl',
  cover_url TEXT,
  format_details TEXT NOT NULL DEFAULT 'Download digital',
  download_size_label TEXT NOT NULL DEFAULT 'Arquivo digital',
  file_bucket TEXT NOT NULL DEFAULT 'digital-products',
  file_path TEXT NOT NULL,
  download_file_name TEXT NOT NULL,
  preview_points TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Digital products viewable by all"
ON public.digital_products
FOR SELECT
USING (true);

CREATE TABLE public.store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  payment_status public.store_order_status NOT NULL DEFAULT 'pending',
  amount_total INTEGER NOT NULL DEFAULT 0 CHECK (amount_total >= 0),
  currency TEXT NOT NULL DEFAULT 'brl',
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  purchased_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own store orders"
ON public.store_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE TRIGGER update_digital_products_updated_at
BEFORE UPDATE ON public.digital_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_orders_updated_at
BEFORE UPDATE ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'digital-products',
  'digital-products',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/json',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO public.digital_products (
  slug,
  title,
  short_description,
  description,
  product_type,
  price_cents,
  currency,
  format_details,
  download_size_label,
  file_path,
  download_file_name,
  preview_points,
  tags,
  is_active,
  is_featured,
  sort_order
)
VALUES
  (
    'grimorio-de-velkyn',
    'Livro PDF: Grimorio de Velkyn',
    'Livro base com faccoes, rituais e 80 paginas de lore jogavel.',
    'Suplemento em PDF para aprofundar a regiao de Velkyn com ganchos, lendas, tabelas de encontro e referencias para campanhas sombrias.',
    'livro_pdf',
    3990,
    'brl',
    'PDF colorido',
    '80 paginas',
    'pdfs/grimorio-de-velkyn.pdf',
    'grimorio-de-velkyn.pdf',
    ARRAY['Lore original', 'Tabelas aleatorias', 'Handouts para a mesa'],
    ARRAY['pdf', 'campanha', 'lore'],
    true,
    true,
    1
  ),
  (
    'atlas-de-batalha-ruinas',
    'Pacote de Mapas: Atlas das Ruinas',
    'Mapas taticos em grade para cripta, floresta e fortaleza.',
    'Colecao de mapas prontos para VTT com versoes limpa, anotada e noturna para encontros em ruinas antigas.',
    'mapa',
    2490,
    'brl',
    'ZIP com JPG e PNG',
    '12 mapas HD',
    'maps/atlas-das-ruinas.zip',
    'atlas-das-ruinas.zip',
    ARRAY['Grade pronta para VTT', 'Variantes dia e noite', 'Salas com escala'],
    ARRAY['mapas', 'vtt', 'encontro'],
    true,
    true,
    2
  ),
  (
    'bestiario-tokens-vol1',
    'Token Pack: Bestiario Vol. I',
    'Mais de 120 tokens para monstros, mortos-vivos e cultistas.',
    'Pacote digital com tokens circulares em PNG para criaturas de masmorra, emboscadas noturnas e chefes de ritual.',
    'token',
    1990,
    'brl',
    'ZIP com PNG recortado',
    '120 tokens',
    'tokens/bestiario-vol1.zip',
    'bestiario-vol1.zip',
    ARRAY['PNG com transparencia', 'Chefes e lacaios', 'Pronto para importacao'],
    ARRAY['tokens', 'monstros', 'png'],
    true,
    false,
    3
  ),
  (
    'aventuras-na-cripta',
    'Aventura: A Cripta dos Esquecidos',
    'Modulo completo para 3 a 5 jogadores do nivel 3 ao 5.',
    'Aventura digital com resumo da trama, encontros balanceados, pistas, recompensas e mapa de progressao para uma sessao longa ou mini arco.',
    'aventura',
    2990,
    'brl',
    'PDF + handouts',
    '1 aventura completa',
    'adventures/a-cripta-dos-esquecidos.zip',
    'a-cripta-dos-esquecidos.zip',
    ARRAY['Estrutura em atos', 'NPCs com motivacao', 'Desfechos alternativos'],
    ARRAY['aventuras', 'one-shot', 'modulo'],
    true,
    true,
    4
  ),
  (
    'classes-do-vazio',
    'Suplemento: Classes do Vazio',
    'Novas subclasses, talentos e progressao para campanhas dark fantasy.',
    'Expande as opcoes de personagem com trilhas de corrupcao, pactos proibidos e poderes voltados para horror e intriga.',
    'classe',
    2790,
    'brl',
    'PDF de regras',
    '36 paginas',
    'classes/classes-do-vazio.pdf',
    'classes-do-vazio.pdf',
    ARRAY['Subclasses originais', 'Talentos de campanha', 'Equilibrado para jogo longo'],
    ARRAY['classes', 'player-options', 'regras'],
    true,
    false,
    5
  ),
  (
    'arsenal-de-reliquias',
    'Colecao de Itens: Arsenal de Reliquias',
    'Cartas e fichas de itens raros para distribuir como loot premium.',
    'Pacote com cartas imprimiveis, descricoes mecanicas e efeitos narrativos para itens magicos, reliquias e consumiveis especiais.',
    'item',
    1690,
    'brl',
    'PDF + cartas para imprimir',
    '45 itens digitais',
    'items/arsenal-de-reliquias.zip',
    'arsenal-de-reliquias.zip',
    ARRAY['Cartas prontas', 'Itens raros e epicos', 'Gancho narrativo por item'],
    ARRAY['itens', 'loot', 'cartas'],
    true,
    false,
    6
  );
