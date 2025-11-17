-- Fix RLS policies for customers, orders, and order_items tables
-- Allow anyone to insert customers, orders, and order_items

-- Customers table policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable read for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.customers;

CREATE POLICY "Enable insert for all users" ON public.customers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.customers
FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.customers
FOR UPDATE USING (true);

-- Orders table policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable read for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;

CREATE POLICY "Enable insert for all users" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.orders
FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.orders
FOR UPDATE USING (true);

-- Order items table policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_items;

CREATE POLICY "Enable insert for all users" ON public.order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.order_items
FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.order_items
FOR UPDATE USING (true);