import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  size_options: string[] | null;
  size_pricing: Array<{ size: string; price: number }>;
}

const SizePricingManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newSizePrice, setNewSizePrice] = useState({ size: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, size_options, size_pricing")
        .order("name");

      if (error) throw error;
      
      const typedProducts = (data || []).map((p: any) => ({
        ...p,
        size_pricing: Array.isArray(p.size_pricing) ? p.size_pricing : []
      })) as Product[];
      
      setProducts(typedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("حدث خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const addSizePrice = async () => {
    if (!newSizePrice.size || !newSizePrice.price || !selectedProduct) {
      toast.error("يرجى إدخال المقاس والسعر");
      return;
    }

    setSaving(true);
    try {
      const updatedPricing = [
        ...(selectedProduct.size_pricing || []),
        { size: newSizePrice.size, price: parseFloat(newSizePrice.price) }
      ];

      const { error } = await supabase
        .from("products")
        .update({ size_pricing: updatedPricing })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, size_pricing: updatedPricing });
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, size_pricing: updatedPricing } : p
      ));
      setNewSizePrice({ size: "", price: "" });
      toast.success("تم إضافة سعر المقاس");
    } catch (error) {
      console.error("Error adding size price:", error);
      toast.error("حدث خطأ في إضافة السعر");
    } finally {
      setSaving(false);
    }
  };

  const removeSizePrice = async (size: string) => {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const updatedPricing = (selectedProduct.size_pricing || []).filter(
        sp => sp.size !== size
      );

      const { error } = await supabase
        .from("products")
        .update({ size_pricing: updatedPricing })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, size_pricing: updatedPricing });
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, size_pricing: updatedPricing } : p
      ));
      toast.success("تم حذف سعر المقاس");
    } catch (error) {
      console.error("Error removing size price:", error);
      toast.error("حدث خطأ في حذف السعر");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
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

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">أسعار المقاسات</h2>
        {!selectedProduct ? (
          <p className="text-muted-foreground text-center py-8">
            اختر منتج لإدارة أسعار المقاسات
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>إضافة سعر لمقاس</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="المقاس (S, M, L)"
                  value={newSizePrice.size}
                  onChange={(e) => setNewSizePrice({ ...newSizePrice, size: e.target.value.toUpperCase() })}
                />
                <Input
                  type="number"
                  placeholder="السعر"
                  value={newSizePrice.price}
                  onChange={(e) => setNewSizePrice({ ...newSizePrice, price: e.target.value })}
                />
                <Button 
                  onClick={addSizePrice} 
                  disabled={saving || !newSizePrice.size || !newSizePrice.price}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>أسعار المقاسات الحالية</Label>
              <div className="space-y-2 mt-2">
                {selectedProduct.size_pricing && selectedProduct.size_pricing.length > 0 ? (
                  selectedProduct.size_pricing.map((sp) => (
                    <div
                      key={sp.size}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{sp.size}</Badge>
                        <span className="font-bold text-primary">{sp.price} جنيه</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSizePrice(sp.size)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد أسعار محددة للمقاسات</p>
                )}
              </div>
            </div>

            {selectedProduct.size_options && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">المقاسات المتاحة:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.size_options.map((size) => (
                    <Badge key={size} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SizePricingManagement;
