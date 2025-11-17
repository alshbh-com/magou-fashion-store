-- إنشاء مستخدم admin في auth.users
-- ملاحظة: يجب إنشاء المستخدم يدوياً من لوحة Supabase أو استخدام signUp
-- لكن يمكننا إعداد الجداول

-- التأكد من أن جدول user_roles موجود
-- (موجود بالفعل في المشروع)

-- إضافة policy للسماح للمستخدمين برؤية أدوارهم
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- إضافة policy للسماح للأدمن بإدارة الأدوار
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));