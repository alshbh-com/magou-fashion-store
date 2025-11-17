-- Insert sample categories
INSERT INTO categories (name, name_ar, slug) VALUES 
('T-Shirts', 'تيشرتات', 't-shirts'),
('Hoodies', 'هوديز', 'hoodies'),
('Pants', 'بناطيل', 'pants'),
('Accessories', 'إكسسوارات', 'accessories');

-- Insert sample products
INSERT INTO products (name, name_ar, description_ar, price, stock_quantity, is_featured, category_id, image_url) 
SELECT 
  'تيشرت قطن' as name,
  'تيشرت قطن' as name_ar,
  'تيشرت قطن عالي الجودة ومريح' as description_ar,
  150 as price,
  50 as stock_quantity,
  true as is_featured,
  id as category_id,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' as image_url
FROM categories WHERE slug = 't-shirts'
UNION ALL
SELECT 
  'هودي شتوي' as name,
  'هودي شتوي' as name_ar,
  'هودي دافئ ومريح للشتاء' as description_ar,
  350 as price,
  30 as stock_quantity,
  true as is_featured,
  id as category_id,
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' as image_url
FROM categories WHERE slug = 'hoodies'
UNION ALL
SELECT 
  'بنطلون جينز' as name,
  'بنطلون جينز' as name_ar,
  'بنطلون جينز عصري وأنيق' as description_ar,
  250 as price,
  40 as stock_quantity,
  false as is_featured,
  id as category_id,
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' as image_url
FROM categories WHERE slug = 'pants';