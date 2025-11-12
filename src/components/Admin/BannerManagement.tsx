import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
}

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    link_url: "",
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("حدث خطأ في تحميل الإعلانات");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addBanner = async () => {
    if (!newBanner.title.trim() || !selectedFile) {
      toast.error("يرجى إدخال العنوان واختيار صورة");
      return;
    }

    setSaving(true);
    setUploading(true);
    
    const loadingToast = toast.loading("جاري رفع الإعلان...");
    
    try {
      const imageUrl = await uploadImage(selectedFile);

      const { error } = await supabase
        .from("banners")
        .insert([{
          title: newBanner.title,
          description: newBanner.description || null,
          image_url: imageUrl,
          link_url: newBanner.link_url || null,
          is_active: newBanner.is_active,
          display_order: banners.length,
        }]);

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success("تم إضافة الإعلان بنجاح");
      setNewBanner({ title: "", description: "", link_url: "", is_active: true });
      setSelectedFile(null);
      await fetchBanners();
    } catch (error) {
      console.error("Error adding banner:", error);
      toast.dismiss(loadingToast);
      toast.error("حدث خطأ في إضافة الإعلان");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !currentStatus })
        .eq("id", bannerId);

      if (error) throw error;
      toast.success("تم تحديث حالة الإعلان");
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("حدث خطأ في تحديث الإعلان");
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", bannerId);

      if (error) throw error;
      toast.success("تم حذف الإعلان");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("حدث خطأ في حذف الإعلان");
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
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">إضافة إعلان جديد</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="banner-title">العنوان</Label>
            <Input
              id="banner-title"
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              placeholder="عنوان الإعلان"
            />
          </div>

          <div>
            <Label htmlFor="banner-description">الوصف (اختياري)</Label>
            <Textarea
              id="banner-description"
              value={newBanner.description}
              onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
              placeholder="وصف الإعلان"
            />
          </div>

          <div>
            <Label htmlFor="banner-link">الرابط (اختياري)</Label>
            <Input
              id="banner-link"
              value={newBanner.link_url}
              onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="banner-image">الصورة</Label>
            <Input
              id="banner-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                تم اختيار: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={newBanner.is_active}
              onCheckedChange={(checked) => setNewBanner({ ...newBanner, is_active: checked })}
            />
            <Label>تفعيل الإعلان</Label>
          </div>

          <Button 
            onClick={addBanner} 
            disabled={saving || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="ml-2 h-4 w-4" />
                إضافة الإعلان
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">الإعلانات الحالية</h2>
        <div className="space-y-4">
          {banners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">لا توجد إعلانات</p>
          ) : (
            banners.map((banner) => (
              <Card key={banner.id} className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {banner.description}
                      </p>
                    )}
                    {banner.link_url && (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {banner.link_url}
                      </a>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => toggleBannerStatus(banner.id, banner.is_active)}
                        />
                        <span className="text-sm">
                          {banner.is_active ? "مفعّل" : "غير مفعّل"}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBanner(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default BannerManagement;
