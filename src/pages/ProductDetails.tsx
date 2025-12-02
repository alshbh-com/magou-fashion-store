import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

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
  const [productImages, setProductImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({});
  const [selectedSize, setSelectedSize] = useState("");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchColors();
      fetchSizes();
      fetchOffers();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchProductImages();
    }
  }, [product]);

  const fetchProductImages = async () => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id)
        .order("display_order");

      if (error) throw error;
      
      // Combine main image with additional images
      const allImages: string[] = [];
      if (product?.image_url) {
        allImages.push(product.image_url);
      }
      if (data && data.length > 0) {
        allImages.push(...data.map(img => img.image_url));
      }
      
      setProductImages(allImages);
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

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
        // Return the discount amount, not the final price
        return offer.offer_price;
      }
    }
    return null;
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Get the base price (either from selected size or product)
    const selectedSizeData = sizes.find(s => s.size_name === selectedSize);
    const basePrice = selectedSizeData && selectedSizeData.price > 0 
      ? selectedSizeData.price 
      : product.price;
    
    // Calculate subtotal
    const subtotal = basePrice * quantity;
    
    // Check for quantity offers first (discount amount)
    const offerDiscount = getOfferPrice(quantity);
    if (offerDiscount) {
      // Subtract discount from subtotal
      return subtotal - offerDiscount;
    }
    
    // Check for regular offer
    if (product.is_offer && product.offer_price) {
      return product.offer_price * quantity;
    }
    
    // Return base price * quantity
    return subtotal;
  };

  const getTotalSelectedColors = () => {
    return Object.values(selectedColors).reduce((sum, count) => sum + count, 0);
  };

  const handleColorQuantityChange = (colorName: string, count: number) => {
    setSelectedColors((prev) => {
      const newColors = { ...prev };
      
      if (count <= 0) {
        delete newColors[colorName];
      } else {
        const currentTotal = getTotalSelectedColors() - (prev[colorName] || 0);
        const maxAllowed = quantity - currentTotal;
        newColors[colorName] = Math.min(count, maxAllowed);
      }
      
      return newColors;
    });
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 500) return;
    setQuantity(newQuantity);
    
    // Adjust color selections if needed
    const totalColors = getTotalSelectedColors();
    if (totalColors > newQuantity) {
      // Proportionally reduce colors
      const ratio = newQuantity / totalColors;
      const newColors: Record<string, number> = {};
      
      Object.entries(selectedColors).forEach(([color, count]) => {
        const newCount = Math.max(1, Math.floor(count * ratio));
        newColors[color] = newCount;
      });
      
      setSelectedColors(newColors);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check stock availability
    if (product.stock_quantity <= 0) {
      toast.error("عذراً، نفذت الكمية من هذا المنتج");
      return;
    }
    
    // Make size selection mandatory if sizes are available
    if (sizes.length > 0 && !selectedSize) {
      toast.error("اختيار المقاس إجباري");
      return;
    }
    
    // Validation for colors
    const totalColors = getTotalSelectedColors();
    if (colors.length > 0 && totalColors === 0) {
      toast.error("يرجى اختيار الألوان");
      return;
    }
    
    if (colors.length > 0 && totalColors !== quantity) {
      toast.error(`يرجى اختيار ${quantity} قطع من الألوان (المجموع الحالي: ${totalColors})`);
      return;
    }

    // Get the base price (either from selected size or product)
    const selectedSizeData = sizes.find(s => s.size_name === selectedSize);
    const basePrice = selectedSizeData && selectedSizeData.price > 0 
      ? selectedSizeData.price 
      : product.price;
    
    // Calculate unit price considering offers
    let unitPrice = basePrice;
    const subtotal = basePrice * quantity;
    const offerDiscount = getOfferPrice(quantity);
    
    if (offerDiscount) {
      // offer_price is a discount amount to subtract from subtotal
      const finalTotal = subtotal - offerDiscount;
      unitPrice = finalTotal / quantity;
    } else if (product.is_offer && product.offer_price) {
      unitPrice = product.offer_price;
    }

    // Calculate savings
    const regularTotal = basePrice * quantity;
    const discountedTotal = unitPrice * quantity;
    const savings = regularTotal - discountedTotal;

    // Build color options array for cart
    const colorOptionsArray: string[] = [];
    Object.entries(selectedColors).forEach(([color, count]) => {
      for (let i = 0; i < count; i++) {
        colorOptionsArray.push(color);
      }
    });

    // Add single item with combined color options
    addToCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      image_url: product.image_url,
      quantity: quantity,
      size: selectedSize || undefined,
      color_options: colorOptionsArray,
      original_price: basePrice
    });

    if (savings > 0) {
      toast.success(`تم إضافة ${product.name} إلى السلة مع توفير ${savings.toFixed(2)} جنيه! 🎉`);
    }

    // Reset selections
    setQuantity(1);
    setSelectedColors({});
    setSelectedSize("");
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
        <div className="space-y-2">
          {/* Main carousel */}
          <Card className="overflow-hidden border-2 border-primary/20 relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {productImages.length > 0 ? (
                  productImages.map((img, idx) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0">
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full object-contain aspect-square bg-muted"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex-[0_0_100%] min-w-0">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full object-contain aspect-square bg-muted"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            {productImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                  onClick={() => emblaApi?.scrollPrev()}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                  onClick={() => emblaApi?.scrollNext()}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
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
                {offers.map((offer) => {
                  const basePrice = product.price;
                  const subtotal = basePrice * offer.min_quantity;
                  const finalPrice = subtotal - offer.offer_price;
                  const discountPercent = ((offer.offer_price / subtotal) * 100).toFixed(0);
                  return (
                    <div key={offer.id} className="flex justify-between items-center text-xs">
                      <span className="font-medium">
                        {offer.min_quantity} قطعة {offer.max_quantity ? `- ${offer.max_quantity}` : '+'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{finalPrice.toFixed(2)} ج.م</span>
                        <span className="text-green-600 font-semibold">(خصم {offer.offer_price} ج)</span>
                      </div>
                    </div>
                  );
                })}
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
                اللون ({getTotalSelectedColors()}/{quantity})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedColors[color.color_name_ar]
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-border shadow-md"
                      style={{ backgroundColor: color.color_code || "#cccccc" }}
                    />
                    <span className="text-xs font-medium text-center">
                      {color.color_name_ar}
                    </span>
                    <div className="flex items-center gap-1 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleColorQuantityChange(color.color_name_ar, (selectedColors[color.color_name_ar] || 0) - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <input
                        type="number"
                        min="0"
                        max={quantity - getTotalSelectedColors() + (selectedColors[color.color_name_ar] || 0)}
                        value={selectedColors[color.color_name_ar] || 0}
                        onChange={(e) => handleColorQuantityChange(color.color_name_ar, parseInt(e.target.value) || 0)}
                        className="w-full h-7 text-center border rounded text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleColorQuantityChange(color.color_name_ar, (selectedColors[color.color_name_ar] || 0) + 1)}
                        disabled={getTotalSelectedColors() >= quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
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

          {product.stock_quantity <= 0 ? (
            <div className="w-full p-4 text-center bg-destructive/10 border-2 border-destructive rounded-lg">
              <p className="text-destructive font-bold text-lg">نفذت الكمية</p>
              <p className="text-muted-foreground text-sm mt-1">سيتوفر المنتج قريباً</p>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full hover-glow"
              size="lg"
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              إضافة إلى السلة
            </Button>
          )}

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
