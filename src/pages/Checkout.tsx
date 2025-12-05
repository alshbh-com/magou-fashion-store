import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, Loader2 } from "lucide-react";

interface Governorate {
  id: string;
  name: string;
  shipping_cost: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phone2: "",
    governorate: "",
    address: "",
    notes: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
    fetchGovernorates();
    
    // تجميع الملاحظات من المنتجات
    const combinedNotes = items
      .filter(item => item.notes)
      .map(item => `${item.name}: ${item.notes}`)
      .join('\n');
    
    if (combinedNotes) {
      setFormData(prev => ({ ...prev, notes: combinedNotes }));
    }
  }, [items, navigate]);

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from("governorates")
        .select("id, name_ar, shipping_cost")
        .order("name_ar");

      if (error) throw error;
      
      const formattedData = data?.map(g => ({
        id: g.id,
        name: g.name_ar,
        shipping_cost: g.shipping_cost
      })) || [];
      
      setGovernorates(formattedData);
    } catch (error) {
      console.error("Error fetching governorates:", error);
      toast.error("فشل في تحميل المحافظات");
    }
  };

  const handleGovernorateChange = (value: string) => {
    setFormData({ ...formData, governorate: value });
    const gov = governorates.find((g) => g.id === value);
    setSelectedGovernorate(gov || null);
  };

  const validatePhoneNumber = (phone: string) => {
    // تنظيف الرقم من المسافات والشرطات
    const cleanPhone = phone.replace(/\D/g, '');
    
    // التحقق من أن الرقم يحتوي على 11 رقمًا
    if (cleanPhone.length !== 11) {
      return "يجب أن يتكون رقم الهاتف من 11 رقمًا";
    }
    
    // التحقق من أن الرقم يبدأ بـ 01 (للهواتف المصرية)
    if (!cleanPhone.startsWith('01')) {
      return "يجب أن يبدأ رقم الهاتف بـ 01";
    }
    
    // التحقق من أن الرقم يحتوي على أرقام فقط
    if (!/^\d+$/.test(cleanPhone)) {
      return "يجب أن يحتوي رقم الهاتف على أرقام فقط";
    }
    
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // السماح فقط بالأرقام
    const numericValue = value.replace(/\D/g, '');
    
    // حفظ الرقم بالصيغة النظيفة
    setFormData({ ...formData, phone: numericValue });
    
    // التحقق من الصحة في الوقت الفعلي
    if (numericValue) {
      const error = validatePhoneNumber(numericValue);
      setPhoneError(error);
    } else {
      setPhoneError("");
    }
  };

  const handlePhone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // السماح فقط بالأرقام للرقم الإضافي أيضًا
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, phone2: numericValue });
  };

  const handleSubmit = async (e: React.FormEvent, sendWhatsApp: boolean = false) => {
    e.preventDefault();
    
    // Validate phone number
    if (!formData.phone) {
      toast.error("الرجاء إدخال رقم الهاتف");
      setPhoneError("رقم الهاتف مطلوب");
      return;
    }
    
    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      toast.error(phoneValidationError);
      setPhoneError(phoneValidationError);
      return;
    }
    
    // Validate governorate selection
    if (!selectedGovernorate) {
      toast.error("الرجاء اختيار المحافظة");
      return;
    }
    
    setLoading(true);

    console.log("Selected Governorate:", selectedGovernorate);
    console.log("Form Data:", formData);

    try {
      // Check if user is logged in to get their email
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || null;

      // 1. Create or get customer
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", formData.phone)
        .maybeSingle();

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: selectedGovernorate.name,
            governorate_id: selectedGovernorate.id,
          })
          .select()
          .single();

        if (customerError) {
          console.error("Customer Error:", customerError);
          throw customerError;
        }
        customerId = newCustomer.id;
      }

      // 2. Create order
      const shippingCost = selectedGovernorate.shipping_cost;
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_city: selectedGovernorate.name,
        customer_notes: formData.notes || null,
        customer_email: userEmail,
        customer_id: customerId,
        governorate_id: selectedGovernorate.id,
        subtotal: totalPrice,
        shipping_cost: shippingCost,
        total: totalPrice + shippingCost,
        status: "pending" as const,
      };
      
      console.log("Creating order with data:", orderData);
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error("Order Error:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", order);

      // 3. Create order items
      const orderItems = items.map((item) => {
        // Combine color_options into a single string
        let colorName = null;
        if (item.color_options && item.color_options.length > 0) {
          const colorCounts = item.color_options.reduce((acc, color) => {
            acc[color] = (acc[color] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          colorName = Object.entries(colorCounts)
            .map(([color, count]) => count > 1 ? `${color} (${count})` : color)
            .join(", ");
        } else if (item.color) {
          colorName = item.color;
        }
        
        return {
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          color_name: colorName,
          size_name: item.size || null,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Items Error:", itemsError);
        throw itemsError;
      }

      // 4. Update product stock
      for (const item of items) {
        const { data: currentProduct } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (currentProduct) {
          const newStock = Math.max(0, currentProduct.stock_quantity - item.quantity);
          await supabase
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", item.id);
        }
      }

      // 5. Show success message
      clearCart();
      
      // Show full-screen success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300';
      successDiv.innerHTML = `
        <div class="text-center space-y-6 p-8">
          <div class="text-6xl mb-4">✓</div>
          <h2 class="text-3xl font-bold text-primary">تم تأكيد الطلب الخاص بكم</h2>
          <p class="text-xl text-muted-foreground">شكراً على استخدامك متجر ماجو فاشون</p>
          <p class="text-lg">وسيتم التواصل معك قريباً</p>
        </div>
      `;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.classList.add('animate-out', 'fade-out', 'duration-300');
        setTimeout(() => {
          document.body.removeChild(successDiv);
          navigate("/");
        }, 300);
      }, 5000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = totalPrice + (selectedGovernorate?.shipping_cost || 0);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        إتمام الطلب
      </h1>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="01xxxxxxxxx (11 رقم)"
                    className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {phoneError && (
                    <p className="text-sm text-destructive mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    يجب أن يتكون رقم الهاتف من 11 رقم ويبدأ بـ 01
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone2">رقم هاتف إضافي (اختياري)</Label>
                  <Input
                    id="phone2"
                    type="tel"
                    value={formData.phone2}
                    onChange={handlePhone2Change}
                    placeholder="01xxxxxxxxx (اختياري)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="governorate">المحافظة *</Label>
                <Select required value={formData.governorate} onValueChange={handleGovernorateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name} - شحن: {gov.shipping_cost} جنيه
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">العنوان بالتفصيل *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="المنطقة، الشارع، رقم المبنى، معالم بارزة..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات خاصة بالطلب (اختياري)"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit"
                  className="w-full hover-glow" 
                  size="lg" 
                  disabled={loading || !!phoneError}
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      اشتري الآن
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-gradient-gold">ملخص الطلب</h2>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.color}-${item.size}-${index}`} className="flex gap-3">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {item.price} جنيه
                    </p>
                  </div>
                  <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{totalPrice.toFixed(2)} جنيه</span>
              </div>
              {selectedGovernorate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن ({selectedGovernorate.name})</span>
                  <span className="font-semibold">{selectedGovernorate.shipping_cost.toFixed(2)} جنيه</span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{finalTotal.toFixed(2)} جنيه</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
