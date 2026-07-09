ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);