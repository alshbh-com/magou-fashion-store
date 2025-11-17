-- Add admin policies for all tables
-- Products table
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Categories table
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Governorates table
CREATE POLICY "Admins can insert governorates"
ON governorates FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update governorates"
ON governorates FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete governorates"
ON governorates FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Packages table
CREATE POLICY "Admins can insert packages"
ON packages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update packages"
ON packages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete packages"
ON packages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Product colors table
CREATE POLICY "Admins can insert product_colors"
ON product_colors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product_colors"
ON product_colors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product_colors"
ON product_colors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Product sizes table
CREATE POLICY "Admins can insert product_sizes"
ON product_sizes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product_sizes"
ON product_sizes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product_sizes"
ON product_sizes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Product offers table
CREATE POLICY "Admins can insert product_offers"
ON product_offers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product_offers"
ON product_offers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product_offers"
ON product_offers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Product images table
CREATE POLICY "Admins can insert product_images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product_images"
ON product_images FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product_images"
ON product_images FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Banners table
CREATE POLICY "Admins can insert banners"
ON banners FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banners"
ON banners FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banners"
ON banners FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders table - admins can view and update
CREATE POLICY "Admins can select orders"
ON orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Order items table - admins can view and manage
CREATE POLICY "Admins can select order_items"
ON order_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order_items"
ON order_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order_items"
ON order_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));