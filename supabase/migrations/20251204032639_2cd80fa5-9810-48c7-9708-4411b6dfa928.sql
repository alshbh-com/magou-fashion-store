-- Fix orders delete policy - change to permissive
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete order_items" ON public.order_items;

-- Create permissive delete policies
CREATE POLICY "Anyone can delete orders" 
ON public.orders 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can delete order_items" 
ON public.order_items 
FOR DELETE 
USING (true);