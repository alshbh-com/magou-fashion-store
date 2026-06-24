
-- 1. Add new product columns
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS show_in_offers boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_new_arrivals boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT false;

-- 2. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  comment text,
  image_url text NOT NULL,
  rating integer DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can manage reviews (admin via app)"
  ON public.reviews FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete reviews (admin via app)"
  ON public.reviews FOR DELETE
  USING (true);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
