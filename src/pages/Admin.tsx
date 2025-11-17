import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag, MapPin, Tag, LayoutGrid, Image, Palette, FolderTree, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/auth");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast.success("تم تسجيل الخروج");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="products" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderTree className="h-5 w-5" />
              <span className="text-xs">الأقسام</span>
            </TabsTrigger>
            <TabsTrigger value="colors-sizes" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="h-5 w-5" />
              <span className="text-xs">الألوان والمقاسات</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutGrid className="h-5 w-5" />
              <span className="text-xs">الطلبات</span>
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Tag className="h-5 w-5" />
              <span className="text-xs">العروض</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-5 w-5" />
              <span className="text-xs">الباكدج</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="h-5 w-5" />
              <span className="text-xs">البانرات</span>
            </TabsTrigger>
            <TabsTrigger value="governorates" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-xs">المحافظات</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="products" className="mt-0">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <CategoriesManagement />
            </TabsContent>

            <TabsContent value="colors-sizes" className="mt-0">
              <ColorSizeManagement />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="offers" className="mt-0">
              <OffersManagement />
            </TabsContent>

            <TabsContent value="packages" className="mt-0">
              <PackagesManagement />
            </TabsContent>

            <TabsContent value="banners" className="mt-0">
              <BannerManagement />
            </TabsContent>

            <TabsContent value="governorates" className="mt-0">
              <GovernoratesManagement />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
