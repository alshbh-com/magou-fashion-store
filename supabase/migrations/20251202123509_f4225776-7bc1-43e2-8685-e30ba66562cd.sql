-- Create package_products table to link packages with products
CREATE TABLE public.package_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(package_id, product_id)
);

-- Enable RLS
ALTER TABLE public.package_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for package_products" 
ON public.package_products 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert package_products" 
ON public.package_products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update package_products" 
ON public.package_products 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete package_products" 
ON public.package_products 
FOR DELETE 
USING (true);