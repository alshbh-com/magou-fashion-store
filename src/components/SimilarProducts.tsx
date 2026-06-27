import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface SimilarProductsProps {
  categoryId: string | null;
  currentProductId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  image_url: string | null;
}

const SimilarProducts = ({ categoryId, currentProductId }: SimilarProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoryId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, offer_price, is_offer, image_url")
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .limit(20);
      setProducts(data || []);
    };
    fetch();
  }, [categoryId, currentProductId]);

  if (!products.length) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-gradient-gold text-center">
        منتجات مشابهة
      </h2>
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-md bg-background/95"
          aria-label="السابق"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-md bg-background/95"
          aria-label="التالي"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-12 pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "thin" }}
        >
          {products.map((p) => {
            const price = p.is_offer && p.offer_price ? p.offer_price : p.price;
            return (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="flex-shrink-0 w-44 sm:w-52 snap-start"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all hover-scale h-full">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image_url || "/placeholder.svg"}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3 text-center">
                    <h3 className="text-sm font-semibold line-clamp-1 mb-1">{p.name}</h3>
                    <div className="flex justify-center text-primary mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {p.is_offer && p.offer_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {p.price} ج.م
                        </span>
                      )}
                      <span className="text-sm font-bold text-primary">{price} ج.م</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
