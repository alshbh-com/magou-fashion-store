import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

interface ProductOffer {
  id: string;
  min_quantity: number;
  max_quantity: number | null;
  offer_price: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchColors();
      fetchSizes();
      fetchOffers();
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
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("product_offers")
        .select("*")
        .eq("product_id", id)
        .order("min_quantity");

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const getOfferPrice = (qty: number) => {
    if (!offers || offers.length === 0) return null;
    
    for (const offer of offers) {
      if (qty >= offer.min_quantity && (!offer.max_quantity || qty <= offer.max_quantity)) {
        return offer.offer_price;
      }
    }
    return null;
  };

  const getCurrentPrice = () => {
    // Check for size-specific pricing first
    if (selectedSize && sizes.length > 0) {
      const sizeData = sizes.find(s => s.size_name === selectedSize);
      if (sizeData && sizeData.price > 0) {
        return sizeData.price;
      }
    }

    // Check for quantity-based offers
    const offerPrice = getOfferPrice(quantity);
    if (offerPrice) return offerPrice;

    // Check for regular offer
    if (product?.is_offer && product.offer_price) {
      return product.offer_price;
    }

    return product?.price || 0;
  };

  const handleColorClick = (colorName: string) => {
    setSelectedColors(prev => {
      // If already selected, remove it
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      }
      // If less than quantity, add it
      if (prev.length < quantity) {
        return [...prev, colorName];
      }
      // If equals quantity, replace the last one
      return [...prev.slice(0, -1), colorName];
    });
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 12) return;
    
    setQuantity(newQuantity);
    // Adjust selected colors to match new quantity
    if (selectedColors.length > newQuantity) {
      setSelectedColors(selectedColors.slice(0, newQuantity));
    } else if (selectedColors.length === 1 && newQuantity > 1) {
      // If one color selected and quantity increased, fill all with same color
      setSelectedColors(Array(newQuantity).fill(selectedColors[0]));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate color selection
    if (colors.length > 0) {
      if (selectedColors.length === 0) {
        toast.error("الرجاء اختيار اللون");
        return;
      }
      if (selectedColors.length !== quantity) {
        toast.error(`الرجاء اختيار ${quantity} لون`);
        return;
      }
    }

    const currentPrice = getCurrentPrice();
    const basePrice = product.is_offer && product.offer_price ? product.offer_price : product.price;
    const savings = ((basePrice - currentPrice) * quantity).toFixed(2);

    // Group selected colors by their count
    const colorCounts = selectedColors.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Add items to cart
    Object.entries(colorCounts).forEach(([color, count]) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        quantity: count,
        image_url: product.image_url,
        color,
        size: selectedSize || undefined,
      });
    });

    if (parseFloat(savings) > 0) {
      toast.success(`تم الإضافة للسلة! وفرت ${savings} جنيه 💰`);
    } else {
      toast.success("تم الإضافة للسلة");
    }

    // Reset selections
    setSelectedColors([]);
    setSelectedSize("");
    setQuantity(1);
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
  const basePrice = product.is_offer && product.offer_price ? product.offer_price : product.price;
  const totalSavings = ((basePrice - currentPrice) * quantity).toFixed(2);

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
              className="w-full object-contain aspect-square bg-muted"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {product.is_offer && product.offer_price && currentPrice !== product.price && (
              <span className="text-xl text-muted-foreground line-through">
                {product.price} ج.م
              </span>
            )}
            <span className="text-2xl font-bold text-primary">
              {currentPrice} ج.م
            </span>
            {parseFloat(totalSavings) > 0 && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                توفير {totalSavings} ج.م 💰
              </span>
            )}
          </div>

          {/* Quantity-based offers */}
          {offers && offers.length > 0 && (
            <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-semibold text-sm mb-2 text-primary">🎁 عروض الكمية</h3>
              <div className="space-y-1">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex justify-between items-center text-xs">
                    <span className="font-medium">
                      {offer.min_quantity === offer.max_quantity 
                        ? `${offer.min_quantity} قطعة`
                        : offer.max_quantity 
                          ? `${offer.min_quantity} - ${offer.max_quantity} قطعة`
                          : `${offer.min_quantity}+ قطعة`
                      }
                    </span>
                    <span className="font-bold text-primary">{offer.offer_price} ج.م/قطعة</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">الكمية</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Colors Selection */}
          {colors && colors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                اللون ({selectedColors.length}/{quantity})
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const count = selectedColors.filter(c => c === color.color_name_ar).length;
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorClick(color.color_name_ar)}
                      className={`relative px-4 py-2 border-2 rounded-lg transition-all ${
                        selectedColors.includes(color.color_name_ar)
                          ? "border-primary bg-primary/10 font-semibold"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {color.color_name_ar}
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes Selection */}
          {sizes && sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                المقاس (اختياري)
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.size_name)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      selectedSize === size.size_name
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div>{size.size_name}</div>
                    {size.price > 0 && (
                      <div className="text-xs text-muted-foreground">{size.price} ج.م</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            className="w-full hover-glow"
            size="lg"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            إضافة إلى السلة
          </Button>

          {product.details && (
            <Card className="p-4 mt-4">
              <h3 className="font-semibold mb-2">تفاصيل المنتج</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {product.details}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
