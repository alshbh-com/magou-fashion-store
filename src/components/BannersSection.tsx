import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  link_url: string | null;
  display_order: number;
}

const BannersSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetchBanners();

    // Subscribe to realtime updates
    const bannersChannel = supabase
      .channel('banners-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        fetchBanners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bannersChannel);
    };
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  if (banners.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full px-0">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient-rose px-4">
          العروض والإعلانات 🎉
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="w-full overflow-hidden"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-contain bg-muted"
                />
              </div>
              {(banner.title || banner.description || banner.link_url) && (
                <div className="p-6 container mx-auto">
                  <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
                  {banner.description && (
                    <p className="text-muted-foreground mb-4">{banner.description}</p>
                  )}
                  {banner.link_url && (
                    <Button
                      asChild
                      className="w-full hover-glow"
                    >
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        اكتشف المزيد
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannersSection;