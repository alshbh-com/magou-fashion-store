import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  details: string;
  price: number;
  is_offer: boolean;
  offer_price: number | null;
  image_url: string | null;
  color_options: string[];
  size_options: string[];
  size_pricing: any;
  stock: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
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

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Check if there's a size-specific price
    if (selectedSize && product.size_pricing) {
      try {
        const pricingArray = Array.isArray(product.size_pricing) 
          ? product.size_pricing 
          : [];
        const sizePrice = pricingArray.find((sp: any) => sp.size === selectedSize);
        if (sizePrice && sizePrice.price) return sizePrice.price;
      } catch (e) {
        console.error("Error parsing size pricing", e);
      }
    }
    
    // Return offer price or regular price
    return product.is_offer && product.offer_price ? product.offer_price : product.price;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if color is required but not selected
    if (product.color_options?.length > 0 && !selectedColor) {
      toast.error("يرجى اختيار اللون");
      return;
    }

    // Check if size is required but not selected
    if (product.size_options?.length > 0 && !selectedSize) {
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
        color_options: product.color_options,
        size_options: product.size_options,
        notes: `${selectedColor ? `اللون ${selectedColor}` : ""}${selectedColor && selectedSize ? " و" : ""}${selectedSize ? `المقاس ${selectedSize}` : ""}`
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
        <Button onClick={() => navigate("/products")}>العودة للمنتجات</Button>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/products")}
        className="mb-6 gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمنتجات
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-lg object-cover"
          />
          {product.is_offer && product.offer_price && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
              عرض خاص
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">
              {currentPrice} جنيه
            </span>
            {product.is_offer && product.offer_price && (
              <span className="text-xl text-muted-foreground line-through">
                {product.price} جنيه
              </span>
            )}
          </div>

          {/* Details */}
          {product.details && (
            <Card className="p-4 bg-muted">
              <h3 className="font-bold mb-2">تفاصيل المنتج:</h3>
              <p className="text-sm whitespace-pre-wrap">{product.details}</p>
            </Card>
          )}

          {/* Color Selection */}
          {product.color_options?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                اختر اللون <span className="text-red-500">*</span>
              </label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className={!selectedColor ? "border-red-500" : ""}>
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  {product.color_options.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Size Selection */}
          {product.size_options?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                اختر المقاس <span className="text-red-500">*</span>
              </label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className={!selectedSize ? "border-red-500" : ""}>
                  <SelectValue placeholder="اختر المقاس" />
                </SelectTrigger>
                <SelectContent>
                  {product.size_options.map((size) => {
                    let sizePrice = null;
                    try {
                      const pricingArray = Array.isArray(product.size_pricing) ? product.size_pricing : [];
                      sizePrice = pricingArray.find((sp: any) => sp.size === size);
                    } catch (e) {}
                    
                    return (
                      <SelectItem key={size} value={size}>
                        {size}
                        {sizePrice && sizePrice.price && ` - ${sizePrice.price} جنيه`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">الكمية</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              المتوفر: {product.stock} قطعة
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full gap-2"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-5 w-5" />
            إضافة إلى السلة
          </Button>

          {product.stock === 0 && (
            <p className="text-red-500 text-center">المنتج غير متوفر حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;