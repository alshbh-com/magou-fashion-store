import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
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

interface ProductOffer {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity: number | null;
  offer_price: number;
}

interface Product {
  id: string;
  name_ar: string;
  price: number;
}

interface OfferWithProduct extends ProductOffer {
  product_name: string;
  product_price: number;
}

const OffersManagement = () => {
  const [offers, setOffers] = useState<OfferWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ProductOffer | null>(null);
  const [formData, setFormData] = useState({
    product_id: "",
    min_quantity: 1,
    max_quantity: null as number | null,
    offer_price: 0,
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, price")
        .order("name_ar");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("product_offers")
        .select("*")
        .order("min_quantity");

      if (error) throw error;

      // جلب بيانات المنتجات المرتبطة
      const offersWithProducts = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: product } = await supabase
            .from("products")
            .select("name_ar, price")
            .eq("id", offer.product_id)
            .single();

          return {
            ...offer,
            product_name: product?.name_ar || "",
            product_price: product?.price || 0,
          };
        })
      );

      setOffers(offersWithProducts);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("فشل في تحميل العروض");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const offerData = {
        product_id: formData.product_id,
        min_quantity: formData.min_quantity,
        max_quantity: formData.max_quantity,
        offer_price: formData.offer_price,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from("product_offers")
          .update(offerData)
          .eq("id", editingOffer.id);

        if (error) throw error;
        toast.success("تم تحديث العرض");
      } else {
        const { error } = await supabase
          .from("product_offers")
          .insert([offerData]);

        if (error) throw error;
        toast.success("تم إضافة العرض");
      }

      setDialogOpen(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("فشل في حفظ العرض");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;

    try {
      const { error } = await supabase
        .from("product_offers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOffers(offers.filter(o => o.id !== id));
      toast.success("تم حذف العرض");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("فشل في حذف العرض");
    }
  };

  const openEditDialog = (offer: OfferWithProduct) => {
    setEditingOffer(offer);
    setFormData({
      product_id: offer.product_id,
      min_quantity: offer.min_quantity,
      max_quantity: offer.max_quantity,
      offer_price: offer.offer_price,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      min_quantity: 1,
      max_quantity: null,
      offer_price: 0,
    });
  };

  const openAddDialog = () => {
    setEditingOffer(null);
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
        <h2 className="text-2xl font-bold">إدارة العروض</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عرض
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? "تعديل عرض" : "إضافة عرض جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">المنتج</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name_ar} - {product.price} جنيه
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_quantity">الحد الأدنى للكمية</Label>
                  <Input
                    id="min_quantity"
                    type="number"
                    min="1"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_quantity">الحد الأقصى للكمية (اختياري)</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    min="1"
                    value={formData.max_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="offer_price">سعر العرض (جنيه)</Label>
                <Input
                  id="offer_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.offer_price}
                  onChange={(e) => setFormData({ ...formData, offer_price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingOffer ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">السعر الأصلي</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">سعر العرض</TableHead>
              <TableHead className="text-right">التوفير</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => {
              const savings = ((offer.product_price * offer.min_quantity) - offer.offer_price);
              const savingsPercent = ((savings / (offer.product_price * offer.min_quantity)) * 100).toFixed(0);
              
              return (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.product_name}</TableCell>
                  <TableCell>{offer.product_price} جنيه</TableCell>
                  <TableCell>
                    {offer.min_quantity}
                    {offer.max_quantity && ` - ${offer.max_quantity}`} قطعة
                  </TableCell>
                  <TableCell className="font-bold text-primary">{offer.offer_price} جنيه</TableCell>
                  <TableCell className="text-green-600">
                    {savings.toFixed(0)} جنيه ({savingsPercent}%)
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(offer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOffer(offer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default OffersManagement;
