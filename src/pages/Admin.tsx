import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, MapPin, Tag, LayoutGrid, Image, Palette, FolderTree, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrdersManagement from "@/components/Admin/OrdersManagement";
import GovernoratesManagement from "@/components/Admin/GovernoratesManagement";
import ProductsManagement from "@/components/Admin/ProductsManagement";
import PackagesManagement from "@/components/Admin/PackagesManagement";
import OffersManagement from "@/components/Admin/OffersManagement";
import BannerManagement from "@/components/Admin/BannerManagement";
import ColorSizeManagement from "@/components/Admin/ColorSizeManagement";
import CategoriesManagement from "@/components/Admin/CategoriesManagement";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      await checkAdminRole(session.user.id);
    } catch (error) {
      console.error('خطأ في التحقق:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !data) {
      toast.error('ليس لديك صلاحيات الأدمن');
      await supabase.auth.signOut();
      navigate('/auth');
      return;
    }

    setIsAdmin(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('تم تسجيل الخروج');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center flex-1">لوحة التحكم</h1>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
      <Tabs defaultValue="products" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            العروض
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            الباكدج
          </TabsTrigger>
          <TabsTrigger value="governorates" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            المحافظات
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            البانرات
          </TabsTrigger>
          <TabsTrigger value="colors-sizes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            الألوان والمقاسات
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            الأقسام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="offers">
          <OffersManagement />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesManagement />
        </TabsContent>

        <TabsContent value="governorates">
          <GovernoratesManagement />
        </TabsContent>

        <TabsContent value="banners">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="colors-sizes">
          <ColorSizeManagement />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
