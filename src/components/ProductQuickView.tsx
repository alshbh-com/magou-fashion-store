import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  image_url: string | null;
  description: string | null;
  details: string | null;
  stock: number;
  color_options: string[] | null;
  size_options: string[] | null;
  size_pricing: any;
}

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const getCurrentPrice = () => {
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
    
    return product.is_offer && product.offer_price ? product.offer_price : product.price;
  };

  const handleAddToCart = () => {
    // Check if color is required but not selected
    if (product.color_options && product.color_options.length > 0 && !selectedColor) {
      toast.error("يرجى اختيار اللون");
      return;
    }

    // Check if size is required but not selected
    if (product.size_options && product.size_options.length > 0 && !selectedSize) {
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
        color_options: product.color_options || undefined,
        size_options: product.size_options || undefined,
        notes: `${selectedColor ? `اللون ${selectedColor}` : ""}${selectedColor && selectedSize ? " و" : ""}${selectedSize ? `المقاس ${selectedSize}` : ""}`
      });
    }

    toast.success(`تم إضافة ${quantity} من ${product.name} إلى السلة`);
    onOpenChange(false);
    
    // Reset selections
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
  };

  const currentPrice = getCurrentPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-auto rounded-lg object-cover"
            />
            {product.is_offer && product.offer_price && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                عرض خاص
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>

            {/* Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary">
                {currentPrice} جنيه
              </span>
              {product.is_offer && product.offer_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.price} جنيه
                </span>
              )}
            </div>

            {/* Details */}
            {product.details && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{product.details}</p>
              </div>
            )}

            {/* Color Selection */}
            {product.color_options && product.color_options.length > 0 && (
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
            {product.size_options && product.size_options.length > 0 && (
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
              className="w-full"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              إضافة إلى السلة
            </Button>

            {product.stock === 0 && (
              <p className="text-red-500 text-center">المنتج غير متوفر حالياً</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
