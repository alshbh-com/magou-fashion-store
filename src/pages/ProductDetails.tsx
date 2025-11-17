import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, ShoppingCart, Minus, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  details: string;
  price: number;
  is_offer: boolean;
  offer_price: number | null;
  image_url: string | null;
  size_pricing: any;
  stock_quantity: number;
}

interface ProductColor {
  id: string;
  color_name: string;
  color_name_ar: string;
  color_code: string | null;
}

interface ProductSize {
  id: string;
  size_name: string;
  price: number;
  stock_quantity: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchColors();
      fetchSizes();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("فشل في تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      const { data, error } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", id);

      if (error) throw error;
      setColors(data || []);
      if (data && data.length > 0) {
        setSelectedColor(data[0].color_name_ar);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const { data, error } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", id);

      if (error) throw error;
      setSizes(data || []);
      if (data && data.length > 0) {
        setSelectedSize(data[0].size_name);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    if (selectedSize) {
      const sizeData = sizes.find(s => s.size_name === selectedSize);
      if (sizeData && sizeData.price) return sizeData.price;
    }
    
    return product.is_offer && product.offer_price ? product.offer_price : product.price;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (colors.length > 0 && !selectedColor) {
      toast.error("يرجى اختيار اللون");
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.error("يرجى اختيار المقاس");
      return;
    }

    const currentPrice = getCurrentPrice();

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image_url: product.image_url,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      });
    }

    toast.success(`تم إضافة ${quantity} من ${product.name} إلى السلة`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">المنتج غير موجود</p>
        <Button onClick={() => navigate("/products")}>العودة إلى المنتجات</Button>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/products")}
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        العودة إلى المنتجات
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="overflow-hidden border-2 border-primary/20">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover aspect-square"
            />
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {product.is_offer && product.offer_price && (
              <span className="text-2xl text-muted-foreground line-through">
                {product.price} جنيه
              </span>
            )}
            <span className="text-3xl font-bold text-primary">
              {currentPrice} جنيه
            </span>
          </div>

          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">اللون</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.color_name_ar)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      selectedColor === color.color_name_ar
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {color.color_name_ar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">المقاس</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.size_name)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      selectedSize === size.size_name
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size.size_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">الكمية</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {product.stock_quantity > 0 ? `متوفر: ${product.stock_quantity} قطعة` : "غير متوفر"}
            </p>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-orange-light hover:from-orange-dark hover:to-primary text-white font-bold text-lg py-6"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock_quantity === 0 ? "نفذت الكمية" : "إضافة إلى السلة"}
          </Button>

          {product.details && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-3">تفاصيل المنتج</h3>
              <p className="text-muted-foreground whitespace-pre-line">{product.details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
