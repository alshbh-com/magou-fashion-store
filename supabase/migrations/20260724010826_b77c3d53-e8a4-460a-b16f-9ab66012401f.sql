
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS source text DEFAULT 'customer';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_pricing jsonb;
