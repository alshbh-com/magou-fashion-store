
ALTER TABLE public.orders ALTER COLUMN customer_phone TYPE text USING customer_phone::text;
ALTER TABLE public.products ALTER COLUMN offer_price TYPE numeric USING NULLIF(offer_price,'')::numeric;
ALTER TABLE public.package_products ADD COLUMN IF NOT EXISTS quantity int NOT NULL DEFAULT 1;
