import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, MapPin, Tag, LayoutGrid, Image, Palette } from "lucide-react";
import OrdersManagement from "@/components/Admin/OrdersManagement";
import GovernoratesManagement from "@/components/Admin/GovernoratesManagement";
import ProductsManagement from "@/components/Admin/ProductsManagement";
import PackagesManagement from "@/components/Admin/PackagesManagement";
import OffersManagement from "@/components/Admin/OffersManagement";
import BannerManagement from "@/components/Admin/BannerManagement";
import ColorSizeManagement from "@/components/Admin/ColorSizeManagement";

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">لوحة التحكم</h1>
      
      <Tabs defaultValue="products" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-7 mb-8">
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
      </Tabs>
    </div>
  );
};

export default Admin;
