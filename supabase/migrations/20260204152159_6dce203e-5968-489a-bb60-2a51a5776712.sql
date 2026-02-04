-- Update the default theme with the new Cyan/Blue color scheme
UPDATE public.themes
SET 
  primary_color = '195 85% 45%',
  primary_foreground = '0 0% 100%',
  secondary_color = '30 25% 92%',
  accent_color = '210 75% 50%',
  background_color = '0 0% 100%',
  foreground_color = '210 15% 15%',
  card_color = '30 30% 97%',
  muted_color = '30 20% 94%',
  border_color = '210 15% 85%'
WHERE slug = 'default';

-- If no default theme exists, insert one
INSERT INTO public.themes (
  name, name_ar, slug, is_active,
  primary_color, primary_foreground, secondary_color, accent_color,
  background_color, foreground_color, card_color, muted_color, border_color
)
SELECT 
  'Default', 'الافتراضي', 'default', true,
  '195 85% 45%', '0 0% 100%', '30 25% 92%', '210 75% 50%',
  '0 0% 100%', '210 15% 15%', '30 30% 97%', '30 20% 94%', '210 15% 85%'
WHERE NOT EXISTS (SELECT 1 FROM public.themes WHERE slug = 'default');