import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Loader2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Package {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
}

interface Product {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
}

interface PackageProduct {
  product_id: string;
  quantity: number;
}

const PackagesManagement = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<PackageProduct[]>([]);
  const [formData, setFormData] = useState({
    name_ar: "",
    description_ar: "",
    price: 0,
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchProducts();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("name_ar");

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("فشل في تحميل الباكدج");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, price, image_url")
        .order("name_ar");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchPackageProducts = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from("package_products")
        .select("product_id, quantity")
        .eq("package_id", packageId);

      if (error) throw error;
      setSelectedProducts(data || []);
    } catch (error) {
      console.error("Error fetching package products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `packages/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      const dataToSave = {
        name: formData.name_ar,
        name_ar: formData.name_ar,
        description: formData.description_ar,
        description_ar: formData.description_ar,
        price: formData.price,
        image_url: imageUrl || null,
      };

      let packageId: string;

      if (editingPackage) {
        const { error } = await supabase
          .from("packages")
          .update(dataToSave)
          .eq("id", editingPackage.id);

        if (error) throw error;
        packageId = editingPackage.id;

        // Delete existing package products
        await supabase
          .from("package_products")
          .delete()
          .eq("package_id", packageId);

        toast.success("تم تحديث الباكدج");
      } else {
        const { data, error } = await supabase
          .from("packages")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        packageId = data.id;
        toast.success("تم إضافة الباكدج");
      }

      // Save package products
      if (selectedProducts.length > 0) {
        const productsToInsert = selectedProducts.map(sp => ({
          package_id: packageId,
          product_id: sp.product_id,
          quantity: sp.quantity,
        }));

        const { error: productsError } = await supabase
          .from("package_products")
          .insert(productsToInsert);

        if (productsError) {
          console.error("Error saving package products:", productsError);
        }
      }

      setDialogOpen(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("فشل في حفظ الباكدج");
    } finally {
      setUploading(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الباكدج؟")) return;

    try {
      const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPackages(packages.filter(p => p.id !== id));
      toast.success("تم حذف الباكدج");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("فشل في حذف الباكدج");
    }
  };

  const openEditDialog = async (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name_ar: pkg.name_ar,
      description_ar: pkg.description_ar || "",
      price: pkg.price,
      image_url: pkg.image_url || "",
    });
    setImageFile(null);
    await fetchPackageProducts(pkg.id);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      description_ar: "",
      price: 0,
      image_url: "",
    });
    setSelectedProducts([]);
    setImageFile(null);
  };

  const openAddDialog = () => {
    setEditingPackage(null);
    resetForm();
    setDialogOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    const exists = selectedProducts.find(sp => sp.product_id === productId);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(sp => sp.product_id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, { product_id: productId, quantity: 1 }]);
    }
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map(sp =>
      sp.product_id === productId ? { ...sp, quantity: Math.max(1, quantity) } : sp
    ));
  };

  const getProductById = (id: string) => products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة الباكدج</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة باكدج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "تعديل باكدج" : "إضافة باكدج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_ar">الاسم</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: باكدج 6 قطع"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description_ar">الوصف</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="6 قطع من أي منتج بسعر 350 جنيه"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">السعر (جنيه)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">صورة الباكدج</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {(formData.image_url || imageFile) && (
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded mt-2"
                  />
                )}
              </div>

              <div>
                <Label className="mb-3 block">اختر المنتجات للباكدج</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {products.map((product) => {
                    const isSelected = selectedProducts.some(sp => sp.product_id === product.id);
                    const selectedProduct = selectedProducts.find(sp => sp.product_id === product.id);
                    
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="h-10 w-10 object-cover rounded" />
                        )}
                        <span className="flex-1 text-sm">{product.name_ar}</span>
                        <span className="text-sm text-muted-foreground">{product.price} ج.م</span>
                        {isSelected && (
                          <Input
                            type="number"
                            min="1"
                            value={selectedProduct?.quantity || 1}
                            onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedProducts.length > 0 && (
                <Card className="p-3 bg-muted/50">
                  <h4 className="font-semibold mb-2">المنتجات المختارة ({selectedProducts.length})</h4>
                  <div className="space-y-1">
                    {selectedProducts.map(sp => {
                      const product = getProductById(sp.product_id);
                      return product ? (
                        <div key={sp.product_id} className="flex justify-between text-sm">
                          <span>{product.name_ar} × {sp.quantity}</span>
                          <span>{(product.price * sp.quantity).toFixed(2)} ج.م</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                      <span>السعر الأصلي:</span>
                      <span className="line-through text-muted-foreground">
                        {selectedProducts.reduce((sum, sp) => {
                          const product = getProductById(sp.product_id);
                          return sum + (product ? product.price * sp.quantity : 0);
                        }, 0).toFixed(2)} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>سعر الباكدج:</span>
                      <span>{formData.price} ج.م</span>
                    </div>
                  </div>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                {editingPackage ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الصورة</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  {pkg.image_url && (
                    <img
                      src={pkg.image_url}
                      alt={pkg.name_ar}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{pkg.name_ar}</TableCell>
                <TableCell className="max-w-xs truncate">{pkg.description_ar}</TableCell>
                <TableCell className="font-bold text-primary">{pkg.price} جنيه</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePackage(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PackagesManagement;