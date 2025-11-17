import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
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
  const [activeSection, setActiveSection] = useState("products");

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

  const renderSection = () => {
    switch (activeSection) {
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "offers":
        return <OffersManagement />;
      case "packages":
        return <PackagesManagement />;
      case "governorates":
        return <GovernoratesManagement />;
      case "banners":
        return <BannerManagement />;
      case "colors-sizes":
        return <ColorSizeManagement />;
      case "categories":
        return <CategoriesManagement />;
      default:
        return <ProductsManagement />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-auto">
          <div className="border-b bg-background sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">لوحة التحكم</h1>
              <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
          
          <div className="container mx-auto px-6 py-6">
            {renderSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
