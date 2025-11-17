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
  const [selectedItems, setSelectedItems] = useState<Array<{ color: string; size: string }>>([{ color: "", size: "" }]);
  const [quantity, setQuantity] = useState(1);

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
    
    const matchingOffer = offers.find(offer => {
      const meetsMin = qty >= offer.min_quantity;
      const meetsMax = !offer.max_quantity || qty <= offer.max_quantity;
      return meetsMin && meetsMax;
    });
    
    return matchingOffer ? matchingOffer.offer_price : null;
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Check if there's a quantity-based offer
    const offerPrice = getOfferPrice(quantity);
    if (offerPrice) return offerPrice;
    
    // Otherwise use regular product price or offer price
    return product.is_offer && product.offer_price ? product.offer_price : product.price;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // التحقق من أن عدد الاختيارات يطابق الكمية
    if (selectedItems.length !== quantity) {
      toast.error(`يرجى اختيار ${quantity} من الألوان والمقاسات`);
      return;
    }

    // التحقق من اكتمال جميع الاختيارات
    for (let i = 0; i < selectedItems.length; i++) {
      if (colors.length > 0 && !selectedItems[i].color) {
        toast.error(`يرجى اختيار اللون للقطعة ${i + 1}`);
        return;
      }
      if (sizes.length > 0 && !selectedItems[i].size) {
        toast.error(`يرجى اختيار المقاس للقطعة ${i + 1}`);
        return;
      }
    }

    const currentPrice = getCurrentPrice();

    // إضافة كل قطعة بالألوان والمقاسات المختارة
    selectedItems.forEach((item) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image_url: product.image_url,
        color: item.color || undefined,
        size: item.size || undefined,
      });
    });

    toast.success(`تم إضافة ${quantity} من ${product.name} إلى السلة`);
    setSelectedItems([]);
    setQuantity(1);
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(newQuantity);
    const currentItems = [...selectedItems];
    
    if (newQuantity > selectedItems.length) {
      // إضافة عناصر فارغة
      for (let i = selectedItems.length; i < newQuantity; i++) {
        currentItems.push({ color: "", size: "" });
      }
    } else {
      // حذف العناصر الزائدة
      currentItems.splice(newQuantity);
    }
    
    setSelectedItems(currentItems);
  };

  const updateSelectedItem = (index: number, field: 'color' | 'size', value: string) => {
    const newItems = [...selectedItems];
    if (!newItems[index]) {
      newItems[index] = { color: "", size: "" };
    }
    newItems[index][field] = value;
    setSelectedItems(newItems);
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
              className="w-full object-contain aspect-square"
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

          {/* Quantity-based offers display */}
          {offers && offers.length > 0 && (
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-semibold mb-3 text-primary">عروض الكمية</h3>
              <div className="space-y-2">
                {offers.map((offer, index) => (
                  <div key={offer.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">
                      {offer.max_quantity 
                        ? `${offer.min_quantity} - ${offer.max_quantity} قطعة`
                        : `${offer.min_quantity}+ قطعة`
                      }
                    </span>
                    <span className="font-bold text-primary">{offer.offer_price} جنيه/قطعة</span>
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
                onClick={() => updateQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {product.stock_quantity > 0 ? `متوفر: ${product.stock_quantity} قطعة` : "غير متوفر"}
            </p>
          </div>

          {selectedItems.map((item, index) => (
            <Card key={index} className="p-6 border-2 shadow-sm">
              <div className="space-y-6">
                <h3 className="font-semibold text-xl text-primary">القطعة {index + 1}</h3>
                
                {colors.length > 0 && (
                  <div>
                    <Label className="mb-3 block text-base font-semibold">اختر اللون</Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => updateSelectedItem(index, 'color', color.color_name_ar)}
                          className={`group relative p-4 border-2 rounded-xl transition-all hover:shadow-lg ${
                            item.color === color.color_name_ar
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {color.color_code && (
                              <div
                                className="w-12 h-12 rounded-full border-4 border-background shadow-md group-hover:scale-110 transition-transform"
                                style={{ 
                                  backgroundColor: color.color_code,
                                  boxShadow: `0 4px 12px ${color.color_code}40`
                                }}
                              />
                            )}
                            <span className="text-sm font-medium text-center">{color.color_name_ar}</span>
                          </div>
                          {item.color === color.color_name_ar && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <Label className="mb-3 block text-base font-semibold">اختر المقاس</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => updateSelectedItem(index, 'size', size.size_name)}
                          className={`group relative p-4 border-2 rounded-xl transition-all hover:shadow-lg ${
                            item.size === size.size_name
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-center space-y-1">
                            <div className="font-bold text-lg">{size.size_name}</div>
                            <div className="text-primary font-semibold">{size.price} جنيه</div>
                            {size.stock_quantity !== null && (
                              <div className="text-xs text-muted-foreground">
                                متوفر: {size.stock_quantity}
                              </div>
                            )}
                          </div>
                          {item.size === size.size_name && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}

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
