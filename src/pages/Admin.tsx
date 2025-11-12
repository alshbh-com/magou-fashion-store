import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";
import BannerManagement from "@/components/Admin/BannerManagement";
import SizePricingManagement from "@/components/Admin/SizePricingManagement";

interface Product {
  id: string;
  name: string;
  color_options: string[] | null;
  size_options: string[] | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products" as any)
        .select("id, name, color_options, size_options")
        .order("name");

      if (error) throw error;
      setProducts((data || []) as unknown as Product[]);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("حدث خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const addColor = async () => {
    if (!newColor.trim() || !selectedProduct) return;
    
    setSaving(true);
    try {
      const updatedColors = [...(selectedProduct.color_options || []), newColor.trim()];
      
      const { error } = await supabase
        .from("products" as any)
        .update({ color_options: updatedColors })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, color_options: updatedColors });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, color_options: updatedColors } : p));
      setNewColor("");
      toast.success("تم إضافة اللون");
    } catch (error) {
      console.error("Error adding color:", error);
      toast.error("حدث خطأ في إضافة اللون");
    } finally {
      setSaving(false);
    }
  };

  const removeColor = async (color: string) => {
    if (!selectedProduct) return;
    
    setSaving(true);
    try {
      const updatedColors = (selectedProduct.color_options || []).filter(c => c !== color);
      
      const { error } = await supabase
        .from("products" as any)
        .update({ color_options: updatedColors })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, color_options: updatedColors });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, color_options: updatedColors } : p));
      toast.success("تم حذف اللون");
    } catch (error) {
      console.error("Error removing color:", error);
      toast.error("حدث خطأ في حذف اللون");
    } finally {
      setSaving(false);
    }
  };

  const addSize = async () => {
    if (!newSize.trim() || !selectedProduct) return;
    
    setSaving(true);
    try {
      const updatedSizes = [...(selectedProduct.size_options || []), newSize.trim().toUpperCase()];
      
      const { error } = await supabase
        .from("products" as any)
        .update({ size_options: updatedSizes })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, size_options: updatedSizes });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, size_options: updatedSizes } : p));
      setNewSize("");
      toast.success("تم إضافة المقاس");
    } catch (error) {
      console.error("Error adding size:", error);
      toast.error("حدث خطأ في إضافة المقاس");
    } finally {
      setSaving(false);
    }
  };

  const removeSize = async (size: string) => {
    if (!selectedProduct) return;
    
    setSaving(true);
    try {
      const updatedSizes = (selectedProduct.size_options || []).filter(s => s !== size);
      
      const { error } = await supabase
        .from("products" as any)
        .update({ size_options: updatedSizes })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, size_options: updatedSizes });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, size_options: updatedSizes } : p));
      toast.success("تم حذف المقاس");
    } catch (error) {
      console.error("Error removing size:", error);
      toast.error("حدث خطأ في حذف المقاس");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-black via-primary to-black bg-clip-text text-transparent">
          لوحة تحكم الأدمن
        </h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          العودة للرئيسية
        </Button>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="size-pricing">أسعار المقاسات</TabsTrigger>
          <TabsTrigger value="banners">الإعلانات</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Products List */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">المنتجات</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant={selectedProduct?.id === product.id ? "default" : "outline"}
                    className="w-full justify-start text-right"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Colors Management */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">الألوان</h2>
              {!selectedProduct ? (
                <p className="text-muted-foreground text-center py-8">اختر منتج لإدارة الألوان</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="color">إضافة لون جديد</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="مثال: أسود، أبيض"
                        onKeyPress={(e) => e.key === 'Enter' && addColor()}
                      />
                      <Button onClick={addColor} disabled={saving || !newColor.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>الألوان المتاحة</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.color_options && selectedProduct.color_options.length > 0 ? (
                        selectedProduct.color_options.map((color) => (
                          <Badge key={color} variant="secondary" className="text-sm">
                            {color}
                            <button
                              onClick={() => removeColor(color)}
                              disabled={saving}
                              className="mr-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد ألوان</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Sizes Management */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">المقاسات</h2>
              {!selectedProduct ? (
                <p className="text-muted-foreground text-center py-8">اختر منتج لإدارة المقاسات</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="size">إضافة مقاس جديد</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="size"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                        placeholder="مثال: S, M, L, XL"
                        onKeyPress={(e) => e.key === 'Enter' && addSize()}
                      />
                      <Button onClick={addSize} disabled={saving || !newSize.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>المقاسات المتاحة</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.size_options && selectedProduct.size_options.length > 0 ? (
                        selectedProduct.size_options.map((size) => (
                          <Badge key={size} variant="secondary" className="text-sm">
                            {size}
                            <button
                              onClick={() => removeSize(size)}
                              disabled={saving}
                              className="mr-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد مقاسات</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="size-pricing" className="mt-6">
          <SizePricingManagement />
        </TabsContent>

        <TabsContent value="banners" className="mt-6">
          <BannerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
