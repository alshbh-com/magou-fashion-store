import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    if (!categoryId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, offer_price, is_offer, image_url")
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .limit(8);
      setProducts(data || []);
    };
    fetch();
  }, [categoryId, currentProductId]);

  if (!products.length) return null;

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-gradient-gold text-center">
        منتجات مشابهة
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const price = p.is_offer && p.offer_price ? p.offer_price : p.price;
          return (
            <Link key={p.id} to={`/products/${p.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all hover-scale">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={p.image_url || "/placeholder.svg"}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-1 mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
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
    </section>
  );
};

export default SimilarProducts;
