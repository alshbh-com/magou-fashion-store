
-- Create themes table to store available themes
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean DEFAULT false,
  primary_color text NOT NULL,
  primary_foreground text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_color text NOT NULL,
  foreground_color text NOT NULL,
  card_color text NOT NULL,
  muted_color text NOT NULL,
  border_color text NOT NULL,
  decoration_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Anyone can update themes" ON public.themes FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert themes" ON public.themes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete themes" ON public.themes FOR DELETE USING (true);

-- Insert default themes
INSERT INTO public.themes (name, name_ar, slug, is_active, primary_color, primary_foreground, secondary_color, accent_color, background_color, foreground_color, card_color, muted_color, border_color) VALUES
-- Default Theme (Copper)
('Default', 'الافتراضي', 'default', true, '15 60% 45%', '0 0% 100%', '0 0% 88%', '15 55% 50%', '0 0% 100%', '0 0% 15%', '0 0% 98%', '0 0% 94%', '0 0% 85%'),

-- Ramadan Theme (Deep Purple & Gold)
('Ramadan', 'رمضان', 'ramadan', false, '270 60% 35%', '0 0% 100%', '45 80% 50%', '45 90% 55%', '270 20% 8%', '45 80% 90%', '270 30% 12%', '270 20% 18%', '270 30% 25%'),

-- Eid al-Fitr Theme (Bright Green & Gold)
('Eid al-Fitr', 'عيد الفطر', 'eid-fitr', false, '145 70% 40%', '0 0% 100%', '45 80% 55%', '45 90% 50%', '145 20% 98%', '145 50% 15%', '145 30% 95%', '145 20% 90%', '145 30% 80%'),

-- Eid al-Adha Theme (Deep Burgundy & Gold)
('Eid al-Adha', 'عيد الأضحى', 'eid-adha', false, '350 65% 40%', '0 0% 100%', '45 75% 50%', '45 85% 55%', '350 15% 98%', '350 50% 15%', '350 25% 95%', '350 15% 90%', '350 25% 80%'),

-- Egyptian National Day (Red, White, Black with Gold)
('National Day', 'اليوم الوطني', 'national-day', false, '0 75% 45%', '0 0% 100%', '45 70% 50%', '0 0% 15%', '0 0% 100%', '0 0% 15%', '0 0% 98%', '0 5% 94%', '0 10% 85%'),

-- Mother's Day (Pink & Rose)
('Mother''s Day', 'عيد الأم', 'mothers-day', false, '330 70% 55%', '0 0% 100%', '330 40% 90%', '340 75% 60%', '330 30% 98%', '330 50% 20%', '330 35% 95%', '330 25% 90%', '330 30% 80%'),

-- Valentine's Day (Red & Pink)
('Valentine''s Day', 'عيد الحب', 'valentines', false, '350 80% 50%', '0 0% 100%', '350 50% 90%', '330 70% 60%', '350 30% 98%', '350 60% 20%', '350 40% 95%', '350 30% 90%', '350 35% 80%'),

-- Spring / Sham El-Nessim (Bright Green & Yellow)
('Sham El-Nessim', 'شم النسيم', 'sham-nessim', false, '120 60% 45%', '0 0% 100%', '55 85% 60%', '80 70% 50%', '120 40% 98%', '120 40% 15%', '120 35% 95%', '120 25% 90%', '120 30% 80%'),

-- Back to School (Blue & Orange)
('Back to School', 'العودة للمدارس', 'back-school', false, '210 80% 45%', '0 0% 100%', '30 85% 55%', '210 70% 55%', '210 30% 98%', '210 50% 15%', '210 35% 95%', '210 25% 90%', '210 30% 80%'),

-- Winter / Christmas (Red & Green)
('Winter Season', 'موسم الشتاء', 'winter', false, '0 70% 45%', '0 0% 100%', '140 50% 40%', '0 65% 50%', '0 0% 100%', '0 0% 15%', '0 0% 98%', '0 5% 94%', '140 20% 85%'),

-- Summer Sale (Orange & Cyan)
('Summer Sale', 'تخفيضات الصيف', 'summer-sale', false, '25 90% 50%', '0 0% 100%', '185 70% 50%', '35 85% 55%', '185 30% 98%', '25 60% 20%', '185 35% 95%', '185 25% 90%', '25 40% 80%'),

-- Black Friday (Black & Gold)
('Black Friday', 'الجمعة السوداء', 'black-friday', false, '0 0% 10%', '45 80% 55%', '45 75% 50%', '45 85% 55%', '0 0% 5%', '45 80% 90%', '0 0% 10%', '0 0% 15%', '45 50% 30%');
