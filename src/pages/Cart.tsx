import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, updateItemOptions, totalPrice } = useCart();
  const navigate = useNavigate();

  // Check if all items with options have selections
  const hasIncompleteSelections = items.some(item => 
    (item.color_options && item.color_options.length > 0 && !item.color) ||
    (item.size_options && item.size_options.length > 0 && !item.size)
  );

  const handleCheckout = (e: React.MouseEvent) => {
    if (hasIncompleteSelections) {
      e.preventDefault();
      toast.error("يرجى اختيار اللون والمقاس لجميع المنتجات");
      return;
    }
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
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <Card key={`${item.id}-${item.color}-${item.size}-${index}`} className="p-4 bg-cart-rose">
              <div className="flex gap-4">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">
                      {item.notes}
                    </p>
                  )}
                  <p className="text-primary font-bold mb-3">{item.price} جنيه</p>
                  
                  {/* Color and Size Selection */}
                  <div className="space-y-3 mb-4 p-3 bg-secondary/50 rounded-lg border border-border">
                    {item.color_options && item.color_options.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-sm font-semibold flex items-center gap-1">
                          اللون
                          {!item.color && <span className="text-destructive">*</span>}
                        </label>
                        <Select 
                          value={item.color || ""} 
                          onValueChange={(value) => updateItemOptions(item.id, item.color, item.size, value, item.size)}
                        >
                          <SelectTrigger className={`w-full h-10 ${!item.color ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="اختر اللون" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.color_options.map((color) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {item.size_options && item.size_options.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-sm font-semibold flex items-center gap-1">
                          المقاس
                          {!item.size && <span className="text-destructive">*</span>}
                        </label>
                        <Select 
                          value={item.size || ""} 
                          onValueChange={(value) => updateItemOptions(item.id, item.color, item.size, item.color, value)}
                        >
                          <SelectTrigger className={`w-full h-10 ${!item.size ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="اختر المقاس" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.size_options.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-0 hover:bg-muted"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-0 hover:bg-muted"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id, item.color, item.size)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-left">
                  <p className="font-bold text-lg">
                    {(item.price * item.quantity).toFixed(2)} جنيه
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-gradient-gold">ملخص الطلب</h2>
            
            {hasIncompleteSelections && (
              <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm">
                  يرجى اختيار اللون والمقاس لجميع المنتجات قبل إتمام الطلب
                </AlertDescription>
              </Alert>
            )}
            
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
              disabled={hasIncompleteSelections}
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
