import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  image_url: string | null;
  description: string | null;
  details: string | null;
  stock_quantity: number;
  size_pricing: any;
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

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const { addToCart } = useCart();
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && open) {
      fetchColors();
      fetchSizes();
      setQuantity(1);
    }
  }, [product, open]);

  const fetchColors = async () => {
    if (!product) return;
    try {
      const { data, error } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", product.id);

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
    if (!product) return;
    try {
      const { data, error } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", product.id);

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
    onOpenChange(false);
    setQuantity(1);
  };

  if (!product) return null;

  const currentPrice = getCurrentPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              src={product.image_url || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg aspect-square"
            />
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
            
            <div className="flex items-center gap-3">
              {product.is_offer && product.offer_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.price} جنيه
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
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
                      className={`px-3 py-2 border-2 rounded-lg transition-all ${
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
                      className={`px-3 py-2 border-2 rounded-lg transition-all ${
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
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-10 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {product.stock_quantity > 0 ? `متوفر: ${product.stock_quantity} قطعة` : "غير متوفر"}
              </p>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-orange-light hover:from-orange-dark hover:to-primary"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock_quantity === 0 ? "نفذت الكمية" : "إضافة إلى السلة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
