-- حذف policies القديمة وإنشاء policies جديدة تسمح بالعمليات

-- Products policies
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Categories policies
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- Governorates policies
DROP POLICY IF EXISTS "Admins can insert governorates" ON public.governorates;
DROP POLICY IF EXISTS "Admins can update governorates" ON public.governorates;
DROP POLICY IF EXISTS "Admins can delete governorates" ON public.governorates;

CREATE POLICY "Anyone can insert governorates" ON public.governorates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update governorates" ON public.governorates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete governorates" ON public.governorates FOR DELETE USING (true);

-- Packages policies
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.packages;

CREATE POLICY "Anyone can insert packages" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update packages" ON public.packages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete packages" ON public.packages FOR DELETE USING (true);

-- Banners policies
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

CREATE POLICY "Anyone can insert banners" ON public.banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update banners" ON public.banners FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete banners" ON public.banners FOR DELETE USING (true);

-- Product Colors policies
DROP POLICY IF EXISTS "Admins can insert product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "Admins can update product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "Admins can delete product_colors" ON public.product_colors;

CREATE POLICY "Anyone can insert product_colors" ON public.product_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_colors" ON public.product_colors FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_colors" ON public.product_colors FOR DELETE USING (true);

-- Product Sizes policies
DROP POLICY IF EXISTS "Admins can insert product_sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Admins can update product_sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Admins can delete product_sizes" ON public.product_sizes;

CREATE POLICY "Anyone can insert product_sizes" ON public.product_sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_sizes" ON public.product_sizes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_sizes" ON public.product_sizes FOR DELETE USING (true);

-- Product Offers policies
DROP POLICY IF EXISTS "Admins can insert product_offers" ON public.product_offers;
DROP POLICY IF EXISTS "Admins can update product_offers" ON public.product_offers;
DROP POLICY IF EXISTS "Admins can delete product_offers" ON public.product_offers;

CREATE POLICY "Anyone can insert product_offers" ON public.product_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_offers" ON public.product_offers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_offers" ON public.product_offers FOR DELETE USING (true);

-- Product Images policies
DROP POLICY IF EXISTS "Admins can insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can delete product_images" ON public.product_images;

CREATE POLICY "Anyone can insert product_images" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_images" ON public.product_images FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_images" ON public.product_images FOR DELETE USING (true);