
# خطة التنفيذ الشاملة

سأنفذ كل الطلبات في دفعة واحدة بالترتيب التالي:

## 1. رفع الصور عبر ImgBB API
- إنشاء utility `src/lib/imgbbUpload.ts` يرفع الصور إلى `https://api.imgbb.com/1/upload` بالمفتاح `2ab2a8ea4a6e2b1b4f3df5591062ff75`
- تعديل `ProductsManagement.tsx` و `BannerManagement.tsx` و `ReviewsManagement.tsx` لاستخدام ImgBB بدل Supabase Storage
- تخزين الرابط الناتج فقط في DB

## 2. تغيير اللوجو في كل مكان
- رفع اللوجو الجديد كـ Lovable Asset
- استبداله في `Header.tsx`, `Footer.tsx`, `AdminLoginDialog.tsx`, `favicon`, `og:image`, وكل ملف يستورد اللوجو القديم

## 3. تحسين سرعة المتجر
- إضافة lazy loading للصور (`loading="lazy"`)
- Code splitting للصفحات الإدارية (React.lazy + Suspense في App.tsx)
- تحويل الصور لـ width/height محددين لتجنب layout shift
- إضافة React Query staleTime أعلى

## 4. SEO باسم Magou Group
- تحديث `index.html` title/meta/og باسم "Magou Group"
- إضافة JSON-LD Organization
- تحديث robots.txt و sitemap.xml

## 5. اسم Magou Group ظاهر أعلى المتجر
- إضافة top bar في `Header.tsx` يعرض "Magou Group"

## 6. زر × لمسح فلتر الأقسام
- في `Products.tsx` بجانب select الأقسام يظهر زر × عند اختيار قسم لإرجاعه لـ "all"

## 7. الحفاظ على المسافات في الوصف
- استخدام `whitespace-pre-wrap` على عرض الوصف والتفاصيل في `ProductDetails.tsx` و `Products.tsx`

## 8. تحديد المنتج في أكتر من قسم (مميز/عروض/إلخ)
- migration: إضافة أعمدة boolean `is_featured`, `show_in_offers`, `show_in_new_arrivals` للجدول `products`
- إضافة switches في `ProductsManagement.tsx` لكل خيار
- تعديل `Home.tsx` لاستخدام هذه الفلاتر

## 9. المنتجات المشابهة في صفحة المنتج
- في `ProductDetails.tsx` إضافة قسم سفلي يجلب 4 منتجات من نفس `category_id` (باستثناء المنتج الحالي)

## 10. سياسة الاستبدال والاسترجاع
- إنشاء `src/pages/ReturnPolicy.tsx` (14 يوم)
- إضافة route في `App.tsx` ولينك في `Footer.tsx`

## 11. الشحن المجاني لمنتجات محددة
- migration: عمود `free_shipping boolean default false` في `products`
- switch في `ProductsManagement.tsx`
- في `Checkout.tsx`: إذا كل منتجات الكارت `free_shipping=true` → الشحن = 0 وعرض شارة

## 12. صفحة الريفيوهات (Reviews)
- migration: جدول `reviews` (id, customer_name, image_url, comment, is_approved, source ['admin','customer'], created_at)
- صفحة `Admin/ReviewsManagement.tsx` لرفع/قبول/حذف/فتح الصور
- صفحة `src/pages/Reviews.tsx` للعرض العام (المعتمدة فقط)
- نموذج رفع للعميل (يصل غير معتمد)
- route + لينك في الـ Header/Footer

## 13. تحديد متعدد للطلبات في الأدمن
- في `OrdersManagement.tsx`: checkbox في كل صف + checkbox "تحديد الكل" + زر "حذف المحدد"

## ملاحظات تقنية
- ImgBB API key سيكون في كود الفرونت (مفتاح public للخدمة)
- كل migrations مع GRANT + RLS صحيحة
- استخدام التوكنز السيمانتيك في index.css بدون hardcoded colors
- المنتجات المشابهة: realtime channel optional، فقط fetch عند تغيير `id`

## النواتج الرئيسية
- ~3 migrations (products columns, reviews table, إلخ)
- ~6 ملفات جديدة (utility, ReturnPolicy, Reviews page, ReviewsManagement admin, الخ)
- ~10 ملفات معدلة
