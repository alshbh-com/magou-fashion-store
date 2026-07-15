CREATE POLICY "Anyone can view all reviews (admin via app)" ON public.reviews FOR SELECT USING (true);
DROP POLICY "Anyone can view approved reviews" ON public.reviews;