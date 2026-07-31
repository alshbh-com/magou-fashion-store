UPDATE public.categories SET id = gen_random_uuid()::text WHERE id IS NULL OR btrim(id) = '';

ALTER TABLE public.categories ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;
ALTER TABLE public.categories ALTER COLUMN id SET NOT NULL;

DO $$
DECLARE
  home_id text;
  women_clothes_id text;
  children_clothes_id text;
  men_accessories_id text;
BEGIN
  SELECT id INTO home_id FROM public.categories WHERE name_ar = 'ادوات منزلية' LIMIT 1;
  SELECT id INTO women_clothes_id FROM public.categories WHERE name_ar = 'ملابس حريمي' LIMIT 1;
  SELECT id INTO children_clothes_id FROM public.categories WHERE name_ar = 'ملابس اطفالي' LIMIT 1;
  SELECT id INTO men_accessories_id FROM public.categories WHERE name_ar = 'اكسسوارات رجالي' LIMIT 1;

  IF home_id IS NOT NULL THEN
    UPDATE public.products SET category_id = home_id
    WHERE category_id = '30fe31f3-8657-4143-9312-a6f7130ce4a8';

    UPDATE public.products SET category_id = home_id
    WHERE category_id IS NULL
      AND (name ILIKE '%كبة%' OR name ILIKE '%قهوة%' OR name ILIKE '%فشار%');
  END IF;

  IF women_clothes_id IS NOT NULL THEN
    UPDATE public.products SET category_id = women_clothes_id
    WHERE category_id = 'b2ebb293-d185-4dc9-a3ee-ee66c02895df';
  END IF;

  IF children_clothes_id IS NOT NULL THEN
    UPDATE public.products SET category_id = children_clothes_id
    WHERE category_id = 'e38831eb-3645-4112-8582-1498ce725c48';
  END IF;

  IF men_accessories_id IS NOT NULL THEN
    UPDATE public.products SET category_id = men_accessories_id
    WHERE category_id = '188a0b17-40d0-4f2a-8212-305725a964ef';
  END IF;
END $$;