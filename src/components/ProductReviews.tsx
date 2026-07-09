import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Star, ImagePlus, Send } from "lucide-react";
import { uploadImageToImgbb } from "@/lib/imgbbUpload";

interface Review {
  id: string;
  customer_name: string | null;
  comment: string | null;
  image_url: string | null;
  rating: number;
  created_at: string;
}

const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment && !file) {
      toast.error("اكتب تعليقاً أو أرفق صورة");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImageToImgbb(file);
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        customer_name: name || null,
        comment: comment || null,
        image_url: imageUrl,
        rating,
        source: "customer",
        is_approved: false,
      });
      if (error) throw error;
      toast.success("تم استلام تقييمك، سيظهر بعد المراجعة");
      setName("");
      setComment("");
      setRating(5);
      setFile(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">التعليقات والتقييمات ({reviews.length})</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= Math.round(avg)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} من 5
              </span>
            </div>
          )}
        </div>
        <Button onClick={() => setShowForm((s) => !s)} variant="outline">
          <ImagePlus className="ml-2 h-4 w-4" />
          {showForm ? "إلغاء" : "أضف تقييمك"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-6 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>اسمك (اختياري)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>التقييم</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    aria-label={`${i} نجوم`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        i <= rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>تعليقك</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>صورة (اختياري)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="ml-2 h-4 w-4" />
              )}
              إرسال
            </Button>
            <p className="text-xs text-muted-foreground">
              التقييم لن يظهر إلا بعد موافقة الإدارة
            </p>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          لا توجد تعليقات بعد. كن أول من يقيّم!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">
                    {r.customer_name || "عميل"}
                  </p>
                  <div className="flex mt-1">
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
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm whitespace-pre-wrap">{r.comment}</p>
              )}
              {r.image_url && (
                <img
                  src={r.image_url}
                  alt=""
                  className="mt-3 h-32 w-32 object-cover rounded cursor-pointer hover-scale"
                  loading="lazy"
                  onClick={() => setOpenImage(r.image_url)}
                />
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!openImage} onOpenChange={(o) => !o && setOpenImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {openImage && <img src={openImage} alt="" className="w-full rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;
