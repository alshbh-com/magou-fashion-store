
-- 1. Fix products table: backfill null ids, set default, NOT NULL, primary key
UPDATE public.products SET id = gen_random_uuid()::text WHERE id IS NULL;
UPDATE public.products SET created_at = now() WHERE created_at IS NULL;

ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.products ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN created_at SET DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.products'::regclass AND contype='p') THEN
    ALTER TABLE public.products ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 2. Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  min_order_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Public can insert coupons" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update coupons" ON public.coupons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete coupons" ON public.coupons FOR DELETE USING (true);

-- 3. Coupon usages table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupon_usages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_usages TO authenticated;
GRANT ALL ON public.coupon_usages TO service_role;

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read coupon_usages" ON public.coupon_usages FOR SELECT USING (true);
CREATE POLICY "Public insert coupon_usages" ON public.coupon_usages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete coupon_usages" ON public.coupon_usages FOR DELETE USING (true);

-- Auto-increment used_count when a usage is inserted
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons SET used_count = used_count + 1, updated_at = now() WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_coupon_usage ON public.coupon_usages;
CREATE TRIGGER trg_increment_coupon_usage
  AFTER INSERT ON public.coupon_usages
  FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();

-- 4. Add coupon_code column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
