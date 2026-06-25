import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [index, setIndex] = useState(0);

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
      setIndex(0);
    };
    fetch();
  }, [categoryId, currentProductId]);

  if (!products.length) return null;

  const p = products[index];
  const price = p.is_offer && p.offer_price ? p.offer_price : p.price;

  const prev = () => setIndex((i) => (i - 1 + products.length) % products.length);
  const next = () => setIndex((i) => (i + 1) % products.length);

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-gradient-gold text-center">
        منتجات مشابهة
      </h2>
      <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          disabled={products.length <= 1}
          aria-label="السابق"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Link to={`/products/${p.id}`} className="flex-1 max-w-sm">
          <Card className="overflow-hidden hover:shadow-lg transition-all hover-scale">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={p.image_url || "/placeholder.svg"}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-4 text-center">
              <h3 className="text-base font-semibold line-clamp-1 mb-2">{p.name}</h3>
              <div className="flex items-center justify-center gap-2">
                {p.is_offer && p.offer_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {p.price} ج.م
                  </span>
                )}
                <span className="text-base font-bold text-primary">{price} ج.م</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          disabled={products.length <= 1}
          aria-label="التالي"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      {products.length > 1 && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          {index + 1} / {products.length}
        </p>
      )}
    </section>
  );
};

export default SimilarProducts;
