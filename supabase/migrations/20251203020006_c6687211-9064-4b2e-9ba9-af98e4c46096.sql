-- Add columns for additional images in products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url_2 text,
ADD COLUMN IF NOT EXISTS image_url_3 text;