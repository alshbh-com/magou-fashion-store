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
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
    fetchGovernorates();
  }, [items, navigate]);

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from("governorates")
        .select("*")
        .order("name");

      if (error) throw error;
      setGovernorates(data || []);
    } catch (error) {
      console.error("Error fetching governorates:", error);
      toast.error("حدث خطأ في تحميل المحافظات");
    }
  };

  const handleGovernorateChange = (value: string) => {
    setFormData({ ...formData, governorate: value });
    const gov = governorates.find((g) => g.id === value);
    setSelectedGovernorate(gov || null);
  };

  const handleSubmit = async (e: React.FormEvent, sendWhatsApp: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
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
            phone2: formData.phone2 || null,
            address: formData.address,
            governorate: selectedGovernorate?.name || null,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Create order with governorate_id
      const shippingCost = selectedGovernorate?.shipping_cost || 0;
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          governorate_id: selectedGovernorate?.id || null,
          total_amount: totalPrice,
          shipping_cost: shippingCost,
          status: "pending",
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_details: item.name,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Send WhatsApp message (optional)
      if (sendWhatsApp) {
        const whatsappMessage = `
🛍️ *طلب جديد من Màgou Fashion*

📋 *رقم الطلب للتأكيد:* #${order.order_number || order.id}

👤 *بيانات العميل:*
الاسم: ${formData.name}
الهاتف: ${formData.phone}
${formData.phone2 ? `هاتف 2: ${formData.phone2}` : ''}
المحافظة: ${selectedGovernorate?.name}
العنوان: ${formData.address}

🛒 *المنتجات:*
${items.map((item) => `- ${item.name} x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} جنيه`).join('\n')}

💰 *الملخص المالي:*
المجموع الفرعي: ${totalPrice.toFixed(2)} جنيه
الشحن: ${shippingCost.toFixed(2)} جنيه
الإجمالي: ${(totalPrice + shippingCost).toFixed(2)} جنيه

${formData.notes ? `📝 ملاحظات: ${formData.notes}` : ''}
        `.trim();

        const whatsappUrl = `https://wa.me/201095317035?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank");
      }

      // Clear cart and redirect
      clearCart();
      toast.success(sendWhatsApp ? "تم إرسال طلبك بنجاح!" : "تم حفظ طلبك بنجاح!");
      navigate("/");
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">رقم هاتف إضافي</Label>
                  <Input
                    id="phone2"
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
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
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="w-full hover-glow" 
                  size="lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      تأكيد الطلب وإرسال عبر واتساب
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  variant="outline" 
                  className="w-full" 
                  size="lg" 
                  disabled={loading}
                >
                  حفظ الطلب بدون إرسال واتساب
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
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
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
