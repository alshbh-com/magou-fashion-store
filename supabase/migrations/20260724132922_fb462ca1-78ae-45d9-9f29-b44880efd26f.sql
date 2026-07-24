
-- banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  title_ar text,
  description text,
  description_ar text,
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "public write banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- governorates
CREATE TABLE IF NOT EXISTS public.governorates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  shipping_cost numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.governorates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.governorates TO authenticated;
GRANT ALL ON public.governorates TO service_role;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read governorates" ON public.governorates FOR SELECT USING (true);
CREATE POLICY "public write governorates" ON public.governorates FOR ALL USING (true) WITH CHECK (true);

-- carts
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.carts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read carts" ON public.carts FOR SELECT USING (true);
CREATE POLICY "public write carts" ON public.carts FOR ALL USING (true) WITH CHECK (true);

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  product_id text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  size_name text,
  color_name text,
  price numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cart_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cart_items" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "public write cart_items" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

-- package_products
CREATE TABLE IF NOT EXISTS public.package_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id text NOT NULL,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_products TO authenticated;
GRANT ALL ON public.package_products TO service_role;
ALTER TABLE public.package_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read package_products" ON public.package_products FOR SELECT USING (true);
CREATE POLICY "public write package_products" ON public.package_products FOR ALL USING (true) WITH CHECK (true);

-- product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  image_url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "public write product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Ensure existing tables have public read/write policies too (in case grants exist but no policy)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','products','product_colors','product_sizes','product_offers','packages','orders','order_items','customers','reviews','themes']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='public read '||t) THEN
      EXECUTE format('CREATE POLICY "public read %s" ON public.%I FOR SELECT USING (true)', t, t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='public write '||t) THEN
      EXECUTE format('CREATE POLICY "public write %s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
    END IF;
  END LOOP;
END $$;
