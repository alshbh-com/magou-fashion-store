-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS offer_price numeric,
ADD COLUMN IF NOT EXISTS is_offer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS details text,
ADD COLUMN IF NOT EXISTS size_pricing jsonb DEFAULT '[]'::jsonb;

-- Create governorates table
CREATE TABLE IF NOT EXISTS public.governorates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  shipping_cost numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on governorates
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;

-- Public read access for governorates
CREATE POLICY "Public read access for governorates"
ON public.governorates
FOR SELECT
USING (true);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  address text,
  city text,
  governorate_id uuid REFERENCES public.governorates(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Anyone can create customers
CREATE POLICY "Anyone can create customers"
ON public.customers
FOR INSERT
WITH CHECK (true);

-- Create product_offers table for quantity-based pricing
CREATE TABLE IF NOT EXISTS public.product_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity integer NOT NULL,
  max_quantity integer,
  offer_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on product_offers
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;

-- Public read access for product_offers
CREATE POLICY "Public read access for product_offers"
ON public.product_offers
FOR SELECT
USING (true);

-- Update orders table to link with customers
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id),
ADD COLUMN IF NOT EXISTS governorate_id uuid REFERENCES public.governorates(id),
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;

-- Create user_roles enum and table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Insert default governorates
INSERT INTO public.governorates (name, name_ar, shipping_cost) VALUES
  ('Cairo', 'القاهرة', 50),
  ('Giza', 'الجيزة', 50),
  ('Alexandria', 'الإسكندرية', 60),
  ('Mansoura', 'المنصورة', 70),
  ('Tanta', 'طنطا', 70),
  ('Assiut', 'أسيوط', 80),
  ('Suez', 'السويس', 65),
  ('Luxor', 'الأقصر', 90),
  ('Aswan', 'أسوان', 100)
ON CONFLICT DO NOTHING;

-- Insert sample products with images
INSERT INTO public.products (name, name_ar, description, description_ar, price, offer_price, is_offer, image_url, stock_quantity, is_featured, category_id) 
SELECT 
  'T-Shirt',
  'تيشيرت',
  'Comfortable cotton t-shirt',
  'تيشيرت قطني مريح',
  150,
  120,
  true,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  50,
  true,
  c.id
FROM public.categories c
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, name_ar, description, description_ar, price, stock_quantity, image_url, is_featured, category_id) 
SELECT 
  'Jeans',
  'جينز',
  'Classic blue jeans',
  'بنطلون جينز كلاسيكي',
  300,
  30,
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  true,
  c.id
FROM public.categories c
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, name_ar, description, description_ar, price, stock_quantity, image_url, category_id) 
SELECT 
  'Jacket',
  'جاكيت',
  'Warm winter jacket',
  'جاكيت شتوي دافئ',
  500,
  20,
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  c.id
FROM public.categories c
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add product colors for sample products
INSERT INTO public.product_colors (product_id, color_name, color_name_ar, color_code)
SELECT p.id, 'Red', 'أحمر', '#FF0000'
FROM public.products p
WHERE p.name = 'T-Shirt'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.product_colors (product_id, color_name, color_name_ar, color_code)
SELECT p.id, 'Blue', 'أزرق', '#0000FF'
FROM public.products p
WHERE p.name = 'T-Shirt'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.product_colors (product_id, color_name, color_name_ar, color_code)
SELECT p.id, 'Black', 'أسود', '#000000'
FROM public.products p
WHERE p.name = 'Jeans'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add product sizes
INSERT INTO public.product_sizes (product_id, size_name, price, stock_quantity)
SELECT p.id, 'S', 150, 20
FROM public.products p
WHERE p.name = 'T-Shirt'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.product_sizes (product_id, size_name, price, stock_quantity)
SELECT p.id, 'M', 150, 15
FROM public.products p
WHERE p.name = 'T-Shirt'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.product_sizes (product_id, size_name, price, stock_quantity)
SELECT p.id, 'L', 150, 15
FROM public.products p
WHERE p.name = 'T-Shirt'
LIMIT 1
ON CONFLICT DO NOTHING;