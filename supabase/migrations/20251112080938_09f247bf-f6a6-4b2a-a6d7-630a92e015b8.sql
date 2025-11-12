-- Add size_pricing column to products table to store size-specific prices
-- Format: [{"size": "S", "price": 200}, {"size": "M", "price": 400}]
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size_pricing jsonb DEFAULT '[]'::jsonb;

-- Create banners table for homepage advertisements
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to banners
CREATE POLICY "Allow public read banners" 
ON public.banners 
FOR SELECT 
USING (is_active = true);

-- Allow all operations on banners (for admin)
CREATE POLICY "Allow all on banners" 
ON public.banners 
FOR ALL 
USING (true);

-- Add trigger for updated_at on banners
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.banners IS 'Homepage banner advertisements with optional links';