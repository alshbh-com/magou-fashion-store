
-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text,
  name_ar text,
  description text,
  description_ar text,
  price numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_offer boolean DEFAULT false,
  offer_price numeric,
  image_url text,
  image_url_2 text,
  image_url_3 text,
  category_id text,
  show_in_offers boolean DEFAULT false,
  show_in_new_arrivals boolean DEFAULT false,
  free_shipping boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "public write products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete products" ON public.products FOR DELETE USING (true);

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS public.product_images (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- ============ PRODUCT SIZES ============
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text,
  size_name text,
  price numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.product_sizes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sizes TO authenticated;
GRANT ALL ON public.product_sizes TO service_role;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all product_sizes" ON public.product_sizes FOR ALL USING (true) WITH CHECK (true);

-- ============ PRODUCT COLORS ============
CREATE TABLE IF NOT EXISTS public.product_colors (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text,
  color_name text,
  color_name_ar text,
  color_code text,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.product_colors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_colors TO authenticated;
GRANT ALL ON public.product_colors TO service_role;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all product_colors" ON public.product_colors FOR ALL USING (true) WITH CHECK (true);

-- ============ PRODUCT OFFERS ============
CREATE TABLE IF NOT EXISTS public.product_offers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text,
  min_quantity integer DEFAULT 1,
  max_quantity integer,
  offer_price numeric DEFAULT 0,
  free_shipping boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.product_offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_offers TO authenticated;
GRANT ALL ON public.product_offers TO service_role;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all product_offers" ON public.product_offers FOR ALL USING (true) WITH CHECK (true);

-- ============ PACKAGE PRODUCTS ============
CREATE TABLE IF NOT EXISTS public.package_products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  package_id text,
  product_id text,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.package_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_products TO authenticated;
GRANT ALL ON public.package_products TO service_role;
ALTER TABLE public.package_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all package_products" ON public.package_products FOR ALL USING (true) WITH CHECK (true);

-- ============ GOVERNORATES ============
CREATE TABLE IF NOT EXISTS public.governorates (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text,
  name_ar text,
  shipping_cost numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.governorates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.governorates TO authenticated;
GRANT ALL ON public.governorates TO service_role;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all governorates" ON public.governorates FOR ALL USING (true) WITH CHECK (true);

-- ============ BANNERS ============
CREATE TABLE IF NOT EXISTS public.banners (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text,
  title_ar text,
  description text,
  description_ar text,
  image_url text,
  link_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text,
  customer_name text,
  rating integer DEFAULT 5,
  comment text,
  image_url text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- ============ THEMES ============
CREATE TABLE IF NOT EXISTS public.themes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text,
  name_ar text,
  slug text UNIQUE,
  is_active boolean DEFAULT false,
  primary_color text,
  primary_foreground text,
  secondary_color text,
  accent_color text,
  background_color text,
  foreground_color text,
  card_color text,
  muted_color text,
  border_color text,
  decoration_url text,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes TO authenticated;
GRANT ALL ON public.themes TO service_role;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all themes" ON public.themes FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.themes (name, name_ar, slug, is_active, primary_color, primary_foreground, secondary_color, accent_color, background_color, foreground_color, card_color, muted_color, border_color)
VALUES ('Default','التصميم الأساسي','default', true, '190 90% 55%','0 0% 100%','35 45% 88%','225 70% 35%','0 0% 100%','220 15% 15%','0 0% 100%','215 20% 92%','215 20% 88%')
ON CONFLICT (slug) DO NOTHING;

-- ============ CARTS ============
CREATE TABLE IF NOT EXISTS public.carts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ CART ITEMS ============
CREATE TABLE IF NOT EXISTS public.cart_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cart_id text,
  product_id text,
  quantity integer DEFAULT 1,
  size_name text,
  color_name text,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own cart items" ON public.cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));

-- ============ ORDERS (plural — used by the app) ============
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number bigserial,
  customer_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  customer_address text,
  customer_city text,
  customer_notes text,
  governorate_id text,
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status text DEFAULT 'تم التاكيد',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Also open policies on existing pre-created tables so the app can read/write them
DO $$ BEGIN
  EXECUTE 'GRANT SELECT ON public.categories TO anon';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated';
  EXECUTE 'GRANT ALL ON public.categories TO service_role';
  EXECUTE 'ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pub_all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT ON public.packages TO anon';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated';
  EXECUTE 'GRANT ALL ON public.packages TO service_role';
  EXECUTE 'ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pub_all packages" ON public.packages FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT ON public.customers TO anon';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated';
  EXECUTE 'GRANT ALL ON public.customers TO service_role';
  EXECUTE 'ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pub_all customers" ON public.customers FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT ON public.order_items TO anon';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated';
  EXECUTE 'GRANT ALL ON public.order_items TO service_role';
  EXECUTE 'ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pub_all order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
