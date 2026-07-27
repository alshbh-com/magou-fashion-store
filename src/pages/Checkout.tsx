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
import { Loader2, Ticket, Check, X } from "lucide-react";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tiktokPixel";

interface Governorate {
  id: string;
  name: string;
  shipping_cost: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  discount_amount: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFreeShipping, setHasFreeShipping] = useState(false);
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
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    fetchGovernorates();
    checkFreeShipping();

    trackInitiateCheckout(
      items.map((it) => ({
        content_id: it.id,
        content_name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
      totalPrice,
    );

    const combinedNotes = items
      .filter(item => item.notes)
      .map(item => `${item.name}: ${item.notes}`)
      .join('\n');
    if (combinedNotes) {
      setFormData(prev => ({ ...prev, notes: combinedNotes }));
    }
  }, [items, navigate]);

  const checkFreeShipping = async () => {
    if (items.length === 0) return setHasFreeShipping(false);
    const ids = [...new Set(items.map((i) => i.id))];
    const { data: products } = await supabase
      .from("products").select("id, free_shipping").in("id", ids);
    const productFree = !!products && products.length === ids.length
      && products.every((p: any) => p.free_shipping === true);
    if (productFree) return setHasFreeShipping(true);
    const { data: offers } = await supabase
      .from("product_offers")
      .select("product_id, min_quantity, max_quantity, free_shipping")
      .in("product_id", ids);
    const tierFree = items.some((item) => {
      const io = (offers || []).filter((o: any) => o.product_id === item.id);
      return io.some((o: any) =>
        o.free_shipping === true
        && item.quantity >= o.min_quantity
        && (!o.max_quantity || item.quantity <= o.max_quantity)
      );
    });
    setHasFreeShipping(tierFree);
  };

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from("governorates").select("id, name_ar, shipping_cost").order("name_ar");
      if (error) throw error;
      setGovernorates((data || []).map(g => ({
        id: g.id, name: g.name_ar, shipping_cost: g.shipping_cost
      })));
    } catch (e) {
      console.error(e);
      toast.error("فشل في تحميل المحافظات");
    }
  };

  const handleGovernorateChange = (value: string) => {
    setFormData({ ...formData, governorate: value });
    const gov = governorates.find((g) => g.id === value);
    setSelectedGovernorate(gov || null);
  };

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) return "يجب أن يتكون رقم الهاتف من 11 رقمًا";
    if (!cleanPhone.startsWith('01')) return "يجب أن يبدأ رقم الهاتف بـ 01";
    if (!/^\d+$/.test(cleanPhone)) return "يجب أن يحتوي رقم الهاتف على أرقام فقط";
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, phone: numericValue });
    setPhoneError(numericValue ? validatePhoneNumber(numericValue) : "");
  };

  const handlePhone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone2: e.target.value.replace(/\D/g, '') });
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return toast.error("أدخل كود الكوبون");
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (error || !data) {
        toast.error("كود الكوبون غير صحيح");
        return;
      }
      if (!data.is_active) return toast.error("هذا الكوبون غير مفعّل");
      if (data.expires_at && new Date(data.expires_at) < new Date())
        return toast.error("انتهت صلاحية هذا الكوبون");
      if (data.max_uses && data.used_count >= data.max_uses)
        return toast.error("تم استنفاد هذا الكوبون");
      if (data.min_order_amount && totalPrice < Number(data.min_order_amount))
        return toast.error(`الحد الأدنى للطلب ${data.min_order_amount} جنيه`);

      let discount = 0;
      if (data.discount_type === "percent") {
        discount = (totalPrice * Number(data.discount_value)) / 100;
      } else {
        discount = Number(data.discount_value);
      }
      discount = Math.min(discount, totalPrice);
      setAppliedCoupon({ id: data.id, code: data.code, discount_amount: discount });
      toast.success(`تم تطبيق الكوبون! خصم ${discount.toFixed(2)} جنيه`);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      toast.error("الرجاء إدخال رقم الهاتف");
      setPhoneError("رقم الهاتف مطلوب");
      return;
    }
    const err = validatePhoneNumber(formData.phone);
    if (err) { toast.error(err); setPhoneError(err); return; }
    if (!selectedGovernorate) return toast.error("الرجاء اختيار المحافظة");

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || null;

      const { data: existingCustomer } = await supabase
        .from("customers").select("*").eq("phone", formData.phone).maybeSingle();
      let customerId = existingCustomer?.id;
      if (!customerId) {
        const { data: newC, error: cErr } = await supabase.from("customers").insert({
          name: formData.name, phone: formData.phone, address: formData.address,
          city: selectedGovernorate.name, governorate_id: selectedGovernorate.id,
        }).select().single();
        if (cErr) throw cErr;
        customerId = newC.id;
      }

      const shippingCost = hasFreeShipping ? 0 : selectedGovernorate.shipping_cost;
      const discountAmount = appliedCoupon?.discount_amount || 0;
      const finalTotal = Math.max(0, totalPrice - discountAmount) + shippingCost;

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
        discount: discountAmount,
        coupon_code: appliedCoupon?.code || null,
        total: finalTotal,
        status: "pending" as const,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders").insert([orderData]).select().single();
      if (orderError) throw orderError;

      const orderItems = items.map((item) => {
        let colorName: string | null = null;
        if (item.color_options && item.color_options.length > 0) {
          const counts = item.color_options.reduce((acc, c) => {
            acc[c] = (acc[c] || 0) + 1; return acc;
          }, {} as Record<string, number>);
          colorName = Object.entries(counts)
            .map(([c, n]) => n > 1 ? `${c} (${n})` : c).join(", ");
        } else if (item.color) colorName = item.color;
        return {
          order_id: order.id, product_id: item.id, product_name: item.name,
          quantity: item.quantity, price: item.price,
          color_name: colorName, size_name: item.size || null,
        };
      });
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      // Record coupon usage
      if (appliedCoupon) {
        await supabase.from("coupon_usages").insert({
          coupon_id: appliedCoupon.id,
          order_id: order.id,
          customer_name: formData.name,
          customer_phone: formData.phone,
          discount_amount: discountAmount,
        });
        // Increment used_count
        const { data: cur } = await supabase
          .from("coupons").select("used_count").eq("id", appliedCoupon.id).single();
        if (cur) {
          await supabase.from("coupons")
            .update({ used_count: (cur.used_count || 0) + 1 })
            .eq("id", appliedCoupon.id);
        }
      }

      // Update stock
      for (const item of items) {
        const { data: p } = await supabase
          .from("products").select("stock_quantity").eq("id", item.id).single();
        if (p) {
          await supabase.from("products")
            .update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) })
            .eq("id", item.id);
        }
      }

      trackPurchase(
        items.map((it) => ({
          content_id: it.id, content_name: it.name,
          quantity: it.quantity, price: it.price,
        })),
        finalTotal,
      );
      clearCart();

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300';
      successDiv.innerHTML = `
        <div class="text-center space-y-6 p-8">
          <div class="text-6xl mb-4">✓</div>
          <h2 class="text-3xl font-bold text-primary">تم تأكيد الطلب الخاص بكم</h2>
          <p class="text-xl text-muted-foreground">شكراً على استخدامك متجر ماجو فاشون</p>
          <p class="text-lg">وسيتم التواصل معك قريباً</p>
        </div>`;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        successDiv.classList.add('animate-out', 'fade-out', 'duration-300');
        setTimeout(() => { document.body.removeChild(successDiv); navigate("/"); }, 300);
      }, 5000);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  const discountAmount = appliedCoupon?.discount_amount || 0;
  const shippingCost = hasFreeShipping ? 0 : (selectedGovernorate?.shipping_cost || 0);
  const finalTotal = Math.max(0, totalPrice - discountAmount) + shippingCost;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-12 animate-fade-in">
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-center mb-3 sm:mb-4 text-gradient-gold">
        إتمام الطلب
      </h1>
      {hasFreeShipping && (
        <p className="text-center mb-4 sm:mb-8 text-green-600 font-bold text-sm sm:text-lg">
          🎉 شحن مجاني على طلبك
        </p>
      )}

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">بيانات التوصيل</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm">الاسم الكامل *</Label>
                <Input id="name" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm">رقم الهاتف *</Label>
                  <Input id="phone" type="tel" inputMode="numeric" required
                    value={formData.phone} onChange={handlePhoneChange}
                    placeholder="01xxxxxxxxx"
                    className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                </div>
                <div>
                  <Label htmlFor="phone2" className="text-sm">رقم إضافي (اختياري)</Label>
                  <Input id="phone2" type="tel" inputMode="numeric"
                    value={formData.phone2} onChange={handlePhone2Change}
                    placeholder="01xxxxxxxxx" />
                </div>
              </div>

              <div>
                <Label htmlFor="governorate" className="text-sm">المحافظة *</Label>
                <Select required value={formData.governorate} onValueChange={handleGovernorateChange}>
                  <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name} - شحن: {gov.shipping_cost} ج
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm">العنوان بالتفصيل *</Label>
                <Textarea id="address" required value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="المنطقة، الشارع، رقم المبنى..."
                  rows={3} />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">ملاحظات (اختياري)</Label>
                <Textarea id="notes" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات خاصة بالطلب"
                  rows={2} />
              </div>

              {/* Coupon Section */}
              <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                <Label className="text-sm flex items-center gap-2 mb-2">
                  <Ticket className="h-4 w-4" /> كوبون الخصم
                </Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-2 bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-md p-2 sm:p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          خصم {appliedCoupon.discount_amount.toFixed(2)} جنيه
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon"
                      onClick={removeCoupon} className="h-8 w-8 flex-shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="أدخل كود الكوبون"
                      className="flex-1" />
                    <Button type="button" variant="outline"
                      onClick={applyCoupon} disabled={couponLoading}
                      className="flex-shrink-0">
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تطبيق"}
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full hover-glow" size="lg"
                disabled={loading || !!phoneError}>
                {loading ? (<><Loader2 className="ml-2 h-5 w-5 animate-spin" />جاري الإرسال...</>) : "اشتري الآن"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gradient-gold">ملخص الطلب</h2>

            <div className="space-y-3 mb-4 sm:mb-6 max-h-52 sm:max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-2 sm:gap-3">
                  <img src={item.image_url || "/placeholder.svg"} alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm line-clamp-1">{item.name}</p>
                    {item.notes && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{item.notes}</p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.quantity} × {item.price.toFixed(2)} ج
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 sm:space-y-3 border-t border-border pt-3 sm:pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{totalPrice.toFixed(2)} ج</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>خصم الكوبون ({appliedCoupon.code})</span>
                  <span className="font-semibold">-{discountAmount.toFixed(2)} ج</span>
                </div>
              )}
              {selectedGovernorate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  {hasFreeShipping ? (
                    <span className="font-semibold text-green-600">مجاني</span>
                  ) : (
                    <span className="font-semibold">{shippingCost.toFixed(2)} ج</span>
                  )}
                </div>
              )}
              <div className="border-t border-border pt-2 sm:pt-3">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{finalTotal.toFixed(2)} ج</span>
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
