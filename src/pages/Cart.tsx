import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag, Trash2, Plus, Minus, Settings2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductColor {
  id: string;
  color_name_ar: string;
}

interface ProductSize {
  id: string;
  size_name: string;
  price: number;
}

const Cart = () => {
  const { items, removeFromCart, updateQuantity, updateItemOptions, totalPrice } = useCart();
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [availableColors, setAvailableColors] = useState<Record<string, ProductColor[]>>({});
  const [availableSizes, setAvailableSizes] = useState<Record<string, ProductSize[]>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({});
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [editingQuantity, setEditingQuantity] = useState<number>(1);

  useEffect(() => {
    items.forEach(item => {
      fetchProductOptions(item.id);
    });
  }, [items]);

  const fetchProductOptions = async (productId: string) => {
    try {
      const [colorsRes, sizesRes] = await Promise.all([
        supabase.from("product_colors").select("*").eq("product_id", productId),
        supabase.from("product_sizes").select("*").eq("product_id", productId)
      ]);

      if (colorsRes.data) {
        setAvailableColors(prev => ({ ...prev, [productId]: colorsRes.data }));
      }
      if (sizesRes.data) {
        setAvailableSizes(prev => ({ ...prev, [productId]: sizesRes.data }));
      }
    } catch (error) {
      console.error("Error fetching product options:", error);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item.cartItemId);
    setEditingQuantity(item.quantity);
    
    // Convert color_options array to Record<string, number>
    const colorCounts: Record<string, number> = {};
    if (item.color_options && item.color_options.length > 0) {
      item.color_options.forEach((color: string) => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    }
    setSelectedColors(colorCounts);
    setSelectedSize(item.size || "");
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
        const maxAllowed = editingQuantity - currentTotal;
        newColors[colorName] = Math.min(count, maxAllowed);
      }
      
      return newColors;
    });
  };

  const handleSaveOptions = (cartItemId: string) => {
    // Convert Record<string, number> back to array
    const colorOptionsArray: string[] = [];
    Object.entries(selectedColors).forEach(([color, count]) => {
      for (let i = 0; i < count; i++) {
        colorOptionsArray.push(color);
      }
    });
    
    updateItemOptions(cartItemId, selectedSize, colorOptionsArray);
    setEditingItem(null);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
          سلة المشتريات
        </h1>

        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">سلة المشتريات فارغة</h2>
            <p className="text-muted-foreground mb-6">
              ابدأ التسوق الآن واضف منتجاتك المفضلة
            </p>
            <Link to="/products">
              <Button size="lg" className="hover-glow">
                تسوق الآن
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        سلة المشتريات
      </h1>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.cartItemId} className="p-3 bg-cart-rose">
              <div className="flex gap-3">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg truncate flex-1">{item.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => removeFromCart(item.cartItemId!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Product Details - Compact */}
                  <div className="text-xs sm:text-sm space-y-0.5 mb-2">
                   {item.notes && (
                      <p className="text-muted-foreground font-medium text-xs">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">السعر: <span className="font-semibold text-primary">{item.price.toFixed(2)} ج</span></p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-0.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-0 hover:bg-muted"
                          onClick={() => updateQuantity(item.cartItemId!, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-0 hover:bg-muted"
                          onClick={() => updateQuantity(item.cartItemId!, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-primary">
                        {(item.price * item.quantity).toFixed(2)} ج
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs w-full"
                          onClick={() => handleEditItem(item)}
                        >
                          <Settings2 className="h-3 w-3 ml-1" />
                          تعديل الخيارات
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>تعديل الألوان والمقاس</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {availableColors[item.id] && availableColors[item.id].length > 0 && (
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                الألوان ({getTotalSelectedColors()}/{editingQuantity})
                              </label>
                              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                {availableColors[item.id].map((color) => (
                                  <div
                                    key={color.id}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                                      selectedColors[color.color_name_ar]
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    <span className="text-xs font-medium text-center">
                                      {color.color_name_ar}
                                    </span>
                                    <div className="flex items-center gap-1 w-full">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleColorQuantityChange(color.color_name_ar, (selectedColors[color.color_name_ar] || 0) - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <input
                                        type="number"
                                        min="0"
                                        max={editingQuantity - getTotalSelectedColors() + (selectedColors[color.color_name_ar] || 0)}
                                        value={selectedColors[color.color_name_ar] || 0}
                                        onChange={(e) => handleColorQuantityChange(color.color_name_ar, parseInt(e.target.value) || 0)}
                                        className="w-full h-6 text-center border rounded text-xs"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleColorQuantityChange(color.color_name_ar, (selectedColors[color.color_name_ar] || 0) + 1)}
                                        disabled={getTotalSelectedColors() >= editingQuantity}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {availableSizes[item.id] && availableSizes[item.id].length > 0 && (
                            <div>
                              <label className="text-sm font-medium mb-2 block">المقاس</label>
                              <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المقاس" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSizes[item.id].map((size) => (
                                    <SelectItem key={size.id} value={size.size_name}>
                                      {size.size_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <Button 
                            className="w-full" 
                            onClick={() => handleSaveOptions(item.cartItemId!)}
                          >
                            حفظ التعديلات
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-gradient-gold">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{totalPrice.toFixed(2)} جنيه</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} جنيه</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  * سيتم حساب الشحن في الخطوة التالية
                </p>
              </div>
            </div>

            <Button 
              className="w-full hover-glow" 
              size="lg"
              onClick={handleCheckout}
            >
              إتمام الطلب
            </Button>
            
            <Link to="/products">
              <Button variant="outline" className="w-full mt-3">
                متابعة التسوق
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
