import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Loader2, AlertTriangle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadImageToImgbb } from "@/lib/imgbbUpload";

interface Product {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  is_offer: boolean;
  offer_price: number | null;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  category_id: string | null;
  show_in_offers?: boolean;
  show_in_new_arrivals?: boolean;
  free_shipping?: boolean;
}

interface Category {
  id: string;
  name_ar: string;
}

interface ProductOffer {
  min_quantity: number;
  max_quantity: number | null;
  offer_price: number;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name_ar: "",
    description_ar: "",
    price: 0,
    stock_quantity: 0,
    is_featured: false,
    is_offer: false,
    offer_price: 0,
    category_id: "",
    show_in_offers: false,
    show_in_new_arrivals: false,
    free_shipping: false,
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [quantityOffers, setQuantityOffers] = useState<ProductOffer[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<{id: string, image_url: string}[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProductOffers = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_offers")
        .select("*")
        .eq("product_id", productId)
        .order("min_quantity");

      if (error) throw error;
      setQuantityOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ar")
        .order("name_ar");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchExistingImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("id, image_url")
        .eq("product_id", productId)
        .order("display_order");

      if (error) throw error;
      setExistingAdditionalImages(data || []);
    } catch (error) {
      console.error("Error fetching existing images:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);
      let mainImageUrl = editingProduct?.image_url || null;
      
      // Upload main image via ImgBB
      if (mainImageFile) {
        try {
          mainImageUrl = await uploadImageToImgbb(mainImageFile);
          console.log('ImgBB main image uploaded:', mainImageUrl);
        } catch (err) {
          console.error('ImgBB upload error:', err);
          throw err;
        }
      }
      
      const productData = {
        name: formData.name_ar,
        name_ar: formData.name_ar,
        description: formData.description_ar,
        description_ar: formData.description_ar,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        is_featured: formData.is_featured,
        is_offer: formData.is_offer,
        offer_price: formData.is_offer ? formData.offer_price : null,
        image_url: mainImageUrl,
        category_id: formData.category_id || null,
        show_in_offers: formData.show_in_offers,
        show_in_new_arrivals: formData.show_in_new_arrivals,
        free_shipping: formData.free_shipping,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
        
        // Delete existing offers
        await supabase
          .from("product_offers")
          .delete()
          .eq("product_id", productId);
        
        toast.success("تم تحديث المنتج");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
        toast.success("تم إضافة المنتج");
      }

      // Save quantity offers
      if (quantityOffers.length > 0) {
        const offersToInsert = quantityOffers.map(offer => ({
          product_id: productId,
          min_quantity: offer.min_quantity,
          max_quantity: offer.max_quantity,
          offer_price: offer.offer_price,
        }));

        const { error: offersError } = await supabase
          .from("product_offers")
          .insert(offersToInsert);

        if (offersError) {
          console.error("Error saving offers:", offersError);
          toast.error("فشل في حفظ عروض الكمية");
        }
      }

      // Upload additional images via ImgBB
      if (additionalImageFiles.length > 0) {
        for (let i = 0; i < additionalImageFiles.length; i++) {
          const file = additionalImageFiles[i];
          try {
            const url = await uploadImageToImgbb(file);
            await supabase
              .from("product_images")
              .insert({
                product_id: productId,
                image_url: url,
                display_order: i + 1
              });
          } catch (err) {
            console.error('ImgBB additional image error:', err);
          }
        }
      }

      setDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("فشل في حفظ المنتج");
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      // First, delete related order items
      await supabase
        .from("order_items")
        .update({ product_id: null })
        .eq("product_id", id);

      // Delete related product offers
      await supabase
        .from("product_offers")
        .delete()
        .eq("product_id", id);

      // Delete related product colors
      await supabase
        .from("product_colors")
        .delete()
        .eq("product_id", id);

      // Delete related product sizes
      await supabase
        .from("product_sizes")
        .delete()
        .eq("product_id", id);

      // Delete related product images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      // Finally, delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      toast.success("تم حذف المنتج");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("فشل في حذف المنتج");
    }
  };

  const openEditDialog = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_ar: product.name_ar,
      description_ar: product.description_ar || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
      is_offer: product.is_offer,
      offer_price: product.offer_price || 0,
      category_id: product.category_id || "",
      show_in_offers: !!product.show_in_offers,
      show_in_new_arrivals: !!product.show_in_new_arrivals,
      free_shipping: !!product.free_shipping,
    });
    setMainImageFile(null);
    setAdditionalImageFiles([]);
    
    // Fetch existing additional images
    await fetchExistingImages(product.id);
    await fetchProductOffers(product.id);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      description_ar: "",
      price: 0,
      stock_quantity: 0,
      is_featured: false,
      is_offer: false,
      offer_price: 0,
      category_id: "",
      show_in_offers: false,
      show_in_new_arrivals: false,
      free_shipping: false,
    });
    setMainImageFile(null);
    setAdditionalImageFiles([]);
    setExistingAdditionalImages([]);
    setQuantityOffers([]);
    setEditingProduct(null);
  };

  const addQuantityOffer = () => {
    const lastOffer = quantityOffers[quantityOffers.length - 1];
    const nextMin = lastOffer ? (lastOffer.max_quantity || lastOffer.min_quantity) + 1 : 1;
    
    if (nextMin > 24) {
      toast.error("الحد الأقصى 24 قطعة");
      return;
    }

    setQuantityOffers([
      ...quantityOffers,
      {
        min_quantity: nextMin,
        max_quantity: nextMin === 24 ? null : nextMin,
        offer_price: formData.price,
      },
    ]);
  };

  const updateQuantityOffer = (index: number, field: keyof ProductOffer, value: number | null) => {
    const newOffers = [...quantityOffers];
    newOffers[index] = { ...newOffers[index], [field]: value };
    setQuantityOffers(newOffers);
  };

  const removeQuantityOffer = (index: number) => {
    setQuantityOffers(quantityOffers.filter((_, i) => i !== index));
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    resetForm();
    setDialogOpen(true);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_ar">اسم المنتج</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description_ar">وصف المنتج</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="stock_quantity">الكمية المتاحة</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Main Image - Upload from device */}
              <div>
                <Label htmlFor="main_image">الصورة الرئيسية (رفع من الجهاز)</Label>
                <Input
                  id="main_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setMainImageFile(file);
                  }}
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {editingProduct?.image_url && (
                    <div className="text-center relative group">
                      <img src={editingProduct.image_url} alt="الصورة الرئيسية" className="h-20 w-20 object-cover rounded border-2 border-primary" />
                      <span className="text-xs block">الحالية</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("هل تريد حذف الصورة الرئيسية؟")) return;
                          const { error } = await supabase
                            .from("products")
                            .update({ image_url: null })
                            .eq("id", editingProduct.id);
                          if (!error) {
                            setEditingProduct({ ...editingProduct, image_url: null });
                            toast.success("تم حذف الصورة");
                          }
                        }}
                        className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {mainImageFile && (
                    <div className="text-center">
                      <img src={URL.createObjectURL(mainImageFile)} alt="صورة جديدة" className="h-20 w-20 object-cover rounded border-2 border-green-500" />
                      <span className="text-xs block text-green-600">جديدة</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images - Upload multiple */}
              <div>
                <Label htmlFor="additional_images">صور إضافية (اختياري)</Label>
                <Input
                  id="additional_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAdditionalImageFiles(prev => [...prev, ...files]);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">يمكنك اختيار أكثر من صورة</p>
                
                <div className="flex gap-2 mt-2 flex-wrap">
                  {/* Existing additional images from database */}
                  {existingAdditionalImages.map((img, index) => (
                    <div key={img.id} className="text-center relative group">
                      <img src={img.image_url} alt={`صورة ${index + 1}`} className="h-20 w-20 object-cover rounded border" />
                      <span className="text-xs block">صورة {index + 1}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("هل تريد حذف هذه الصورة؟")) return;
                          const { error } = await supabase
                            .from("product_images")
                            .delete()
                            .eq("id", img.id);
                          if (!error) {
                            setExistingAdditionalImages(prev => prev.filter(i => i.id !== img.id));
                            toast.success("تم حذف الصورة");
                          }
                        }}
                        className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* New additional images to upload */}
                  {additionalImageFiles.map((file, index) => (
                    <div key={index} className="text-center relative group">
                      <img src={URL.createObjectURL(file)} alt={`صورة جديدة ${index + 1}`} className="h-20 w-20 object-cover rounded border-2 border-green-500" />
                      <span className="text-xs block text-green-600">جديدة</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">منتج مميز</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_offer"
                    checked={formData.is_offer}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_offer: checked })}
                  />
                  <Label htmlFor="is_offer">عرض خاص</Label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-semibold">الأقسام التي يظهر فيها المنتج</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show_in_offers"
                      checked={formData.show_in_offers}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_offers: checked })}
                    />
                    <Label htmlFor="show_in_offers">يظهر في العروض</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show_in_new_arrivals"
                      checked={formData.show_in_new_arrivals}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_new_arrivals: checked })}
                    />
                    <Label htmlFor="show_in_new_arrivals">وصل حديثاً</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="free_shipping"
                      checked={formData.free_shipping}
                      onCheckedChange={(checked) => setFormData({ ...formData, free_shipping: checked })}
                    />
                    <Label htmlFor="free_shipping">شحن مجاني</Label>
                  </div>
                </div>
              </div>

              {formData.is_offer && (
                <div>
                  <Label htmlFor="offer_price">سعر العرض (جنيه)</Label>
                  <Input
                    id="offer_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.offer_price}
                    onChange={(e) => setFormData({ ...formData, offer_price: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">عروض الكمية (اختياري)</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addQuantityOffer}
                    disabled={quantityOffers.length >= 24}
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة عرض
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  أضف أسعار خاصة حسب الكمية (مثال: قطعة واحدة 200 جنيه، 2-3 قطع 150 جنيه للقطعة)
                </p>
                
                {quantityOffers.map((offer, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">من كمية</Label>
                          <Input
                            type="number"
                            min="1"
                            max="24"
                            value={offer.min_quantity}
                            onChange={(e) => updateQuantityOffer(index, "min_quantity", parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">إلى كمية</Label>
                          <Input
                            type="number"
                            min={offer.min_quantity}
                            max="24"
                            value={offer.max_quantity || ""}
                            placeholder="غير محدود"
                            onChange={(e) => updateQuantityOffer(index, "max_quantity", e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">السعر (جنيه)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={offer.offer_price}
                            onChange={(e) => updateQuantityOffer(index, "offer_price", parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeQuantityOffer(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {offer.max_quantity 
                        ? `من ${offer.min_quantity} إلى ${offer.max_quantity} قطعة: ${offer.offer_price} جنيه للقطعة`
                        : `${offer.min_quantity}+ قطعة: ${offer.offer_price} جنيه للقطعة`
                      }
                    </p>
                  </Card>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  editingProduct ? "تحديث" : "إضافة"
                )}
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
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name_ar}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name_ar}</TableCell>
                <TableCell>
                  {product.is_offer && product.offer_price ? (
                    <div>
                      <span className="line-through text-muted-foreground">{product.price}</span>
                      <br />
                      <span className="text-primary font-bold">{product.offer_price} جنيه</span>
                    </div>
                  ) : (
                    <span>{product.price} جنيه</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.stock_quantity}</span>
                    {product.stock_quantity === 0 ? (
                      <Badge variant="destructive" className="flex items-center gap-1 animate-pulse bg-red-600 text-white px-3 py-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-bold">نفذ المخزون!</span>
                      </Badge>
                    ) : product.stock_quantity <= 10 ? (
                      <Badge variant="outline" className="flex items-center gap-1 border-orange-500 bg-orange-100 text-orange-700 px-3 py-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-bold">مخزون قليل ({product.stock_quantity})</span>
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {product.is_featured && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">مميز</span>
                    )}
                    {product.is_offer && (
                      <span className="text-xs bg-orange-light text-orange-dark px-2 py-1 rounded">عرض</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduct(product.id)}
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

export default ProductsManagement;
