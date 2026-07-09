import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, Star, ImagePlus } from "lucide-react";
import { uploadImageToImgbb } from "@/lib/imgbbUpload";

interface Review {
  id: string;
  customer_name: string | null;
  comment: string | null;
  image_url: string | null;
  rating: number;
  created_at: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment && !file) {
      toast.error("اكتب تعليقاً أو أرفق صورة");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (file) {
        imageUrl = await uploadImageToImgbb(file);
      }
      const { error } = await supabase.from("reviews").insert({
        customer_name: name || null,
        comment: comment || null,
        image_url: imageUrl,
        source: "customer",
        is_approved: false,
      });
      if (error) throw error;
      toast.success("تم استلام تقييمك، سيتم مراجعته قبل النشر");
      setName("");
      setComment("");
      setFile(null);
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("فشل في إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-gradient-gold">
          آراء وإثباتات العملاء
        </h1>
        <p className="text-muted-foreground mb-6">شاهد تجارب عملاء Magou Group الحقيقية</p>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <ImagePlus className="h-5 w-5" />
              أرسل تقييمك مع صورة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>أرسل تقييمك</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>اسمك (اختياري)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>تعليقك</Label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>صورة الإثبات *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" /> إرسال
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                * التقييم لن يظهر إلا بعد موافقة الإدارة
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">لا توجد تقييمات حالياً</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviews.map((r) => (
            <Card
              key={r.id}
              className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover-scale"
              onClick={() => setOpenImage(r.image_url)}
            >
              <img
                src={r.image_url}
                alt={r.customer_name || "إثبات"}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="p-3 space-y-1">
                {r.customer_name && (
                  <p className="font-semibold text-sm">{r.customer_name}</p>
                )}
                <div className="flex text-primary">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                {r.comment && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!openImage} onOpenChange={(o) => !o && setOpenImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {openImage && (
            <img src={openImage} alt="إثبات" className="w-full h-auto rounded" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reviews;
