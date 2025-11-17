import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name_ar: string;
}

interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_name_ar: string;
  color_code: string | null;
}

interface ProductSize {
  id: string;
  product_id: string;
  size_name: string;
  price: number;
  stock_quantity: number | null;
}

const ColorSizeManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [colorForm, setColorForm] = useState({
    color_name: "",
    color_name_ar: "",
    color_code: "#000000",
  });

  const [sizeForm, setSizeForm] = useState({
    size_name: "",
    price: 0,
    stock_quantity: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductColors();
      fetchProductSizes();
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar")
        .order("name_ar");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductColors = async () => {
    if (!selectedProductId) return;

    try {
      const { data, error } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", selectedProductId);

      if (error) throw error;
      setColors(data || []);
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("فشل في تحميل الألوان");
    }
  };

  const fetchProductSizes = async () => {
    if (!selectedProductId) return;

    try {
      const { data, error } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", selectedProductId);

      if (error) throw error;
      setSizes(data || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
      toast.error("فشل في تحميل المقاسات");
    }
  };

  const addColor = async () => {
    if (!selectedProductId || !colorForm.color_name_ar) {
      toast.error("الرجاء اختيار منتج وإدخال اسم اللون");
      return;
    }

    try {
      const { error } = await supabase.from("product_colors").insert([
        {
          product_id: selectedProductId,
          color_name: colorForm.color_name_ar, // Use Arabic for English too
          color_name_ar: colorForm.color_name_ar,
          color_code: colorForm.color_code,
        },
      ]);

      if (error) throw error;

      toast.success("تم إضافة اللون");
      setColorForm({ color_name: "", color_name_ar: "", color_code: "#000000" });
      fetchProductColors();
    } catch (error) {
      console.error("Error adding color:", error);
      toast.error("فشل في إضافة اللون");
    }
  };

  const deleteColor = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا اللون؟")) return;

    try {
      const { error } = await supabase
        .from("product_colors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("تم حذف اللون");
      fetchProductColors();
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("فشل في حذف اللون");
    }
  };

  const addSize = async () => {
    if (!selectedProductId || !sizeForm.size_name) {
      toast.error("الرجاء اختيار منتج وإدخال اسم المقاس");
      return;
    }

    try {
      const { error } = await supabase.from("product_sizes").insert([
        {
          product_id: selectedProductId,
          size_name: sizeForm.size_name,
          price: sizeForm.price,
          stock_quantity: sizeForm.stock_quantity,
        },
      ]);

      if (error) throw error;

      toast.success("تم إضافة المقاس");
      setSizeForm({ size_name: "", price: 0, stock_quantity: 0 });
      fetchProductSizes();
    } catch (error) {
      console.error("Error adding size:", error);
      toast.error("فشل في إضافة المقاس");
    }
  };

  const deleteSize = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقاس؟")) return;

    try {
      const { error } = await supabase
        .from("product_sizes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("تم حذف المقاس");
      fetchProductSizes();
    } catch (error) {
      console.error("Error deleting size:", error);
      toast.error("فشل في حذف المقاس");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة الألوان والمقاسات</h2>

      <Card className="p-6">
        <div className="mb-6">
          <Label>اختر المنتج</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المنتج" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProductId && (
          <Tabs defaultValue="colors" dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors">الألوان</TabsTrigger>
              <TabsTrigger value="sizes">المقاسات</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">إضافة لون جديد</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>اسم اللون</Label>
                    <Input
                      value={colorForm.color_name_ar}
                      onChange={(e) =>
                        setColorForm({ ...colorForm, color_name_ar: e.target.value })
                      }
                      placeholder="أحمر، أزرق، إلخ"
                    />
                  </div>
                  <div>
                    <Label>كود اللون</Label>
                    <Input
                      type="color"
                      value={colorForm.color_code}
                      onChange={(e) =>
                        setColorForm({ ...colorForm, color_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addColor} className="w-full">
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </Card>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اللون</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.color_code || "#000" }}
                        />
                      </TableCell>
                      <TableCell>{color.color_name_ar}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteColor(color.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="sizes" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">إضافة مقاس جديد</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>المقاس</Label>
                    <Input
                      value={sizeForm.size_name}
                      onChange={(e) =>
                        setSizeForm({ ...sizeForm, size_name: e.target.value })
                      }
                      placeholder="S، M، L، XL، إلخ"
                    />
                  </div>
                  <div>
                    <Label>السعر</Label>
                    <Input
                      type="number"
                      value={sizeForm.price}
                      onChange={(e) =>
                        setSizeForm({ ...sizeForm, price: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      value={sizeForm.stock_quantity}
                      onChange={(e) =>
                        setSizeForm({ ...sizeForm, stock_quantity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addSize} className="w-full">
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </Card>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المقاس</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell>{size.size_name}</TableCell>
                      <TableCell>{size.price} جنيه</TableCell>
                      <TableCell>{size.stock_quantity || 0}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSize(size.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default ColorSizeManagement;
