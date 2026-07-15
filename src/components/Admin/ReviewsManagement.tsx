import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Eye, Check, X, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImageToImgbb } from "@/lib/imgbbUpload";

interface Review {
  id: string;
  customer_name: string | null;
  comment: string | null;
  image_url: string | null;
  rating: number;
  is_approved: boolean;
  source: string;
  created_at: string;
  product_id: string | null;
  products?: { name: string } | null;
}

interface ProductOption {
  id: string;
  name: string;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [productId, setProductId] = useState<string>("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name").order("name");
    setProducts(data || []);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("فشل التحميل");
    } else {
      setReviews((data as any) || []);
    }
    setLoading(false);
  };

  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !comment && !name) {
      return toast.error("أضف صورة أو تعليقاً");
    }
    setUploading(true);
    try {
      let url: string | null = null;
      if (file) {
        url = await uploadImageToImgbb(file);
      }
      const { error } = await supabase.from("reviews").insert({
        product_id: productId || null,
        customer_name: name || null,
        comment: comment || null,
        image_url: url,
        rating,
        source: "admin",
        is_approved: true,
      });
      if (error) throw error;
      toast.success("تمت الإضافة");
      setName("");
      setComment("");
      setFile(null);
      setProductId("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error("فشل الرفع");
    } finally {
      setUploading(false);
    }
  };

  const toggleApprove = async (r: Review) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: !r.is_approved })
      .eq("id", r.id);
    if (error) return toast.error("فشل التحديث");
    toast.success(r.is_approved ? "تم الإخفاء" : "تم الموافقة");
    fetchReviews();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف التقييم؟")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error("فشل الحذف");
    toast.success("تم الحذف");
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">إضافة إثبات / تقييم</h2>
        <form onSubmit={addReview} className="space-y-3">
          <div>
            <Label>المنتج (اختياري)</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنتج" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>التقييم (نجوم)</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i} نجوم`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      i <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>اسم العميل (اختياري)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>الصورة (اختياري)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div>
            <Label>تعليق (اختياري)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Upload className="h-4 w-4 ml-2" />
            )}
            إضافة
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">كل التقييمات ({reviews.length})</h2>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reviews.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <div className="relative">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt=""
                      className="w-full aspect-square object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => setOpenImage(r.image_url)}
                    />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      بدون صورة
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${
                      r.is_approved ? "bg-green-600" : "bg-orange-500"
                    }`}
                  >
                    {r.is_approved ? "ظاهر" : "بانتظار الموافقة"}
                  </Badge>
                </div>
                <div className="p-3 space-y-2">
                  {r.products?.name && (
                    <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded inline-block">
                      {r.products.name}
                    </p>
                  )}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i <= (r.rating || 5)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {r.customer_name && <p className="text-sm font-semibold">{r.customer_name}</p>}
                  {r.comment && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    مصدر: {r.source === "admin" ? "الأدمن" : "العميل"}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={r.is_approved}
                        onCheckedChange={() => toggleApprove(r)}
                      />
                      <span className="text-xs">{r.is_approved ? <Check className="h-3 w-3 inline" /> : <X className="h-3 w-3 inline" />}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setOpenImage(r.image_url)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!openImage} onOpenChange={(o) => !o && setOpenImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {openImage && <img src={openImage} alt="" className="w-full h-auto rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManagement;
