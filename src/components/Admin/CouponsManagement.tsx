import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  min_order_amount: number | null;
  created_at: string;
}

interface Usage {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  discount_amount: number;
  order_id: string | null;
  created_at: string;
}

const empty = {
  code: "",
  discount_type: "percent",
  discount_value: 10,
  max_uses: "" as string | number,
  min_order_amount: "" as string | number,
  is_active: true,
  expires_at: "",
};

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [usagesOpen, setUsagesOpen] = useState(false);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [usageCoupon, setUsageCoupon] = useState<Coupon | null>(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("فشل تحميل الكوبونات");
    setCoupons((data as any) || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      max_uses: c.max_uses ?? "",
      min_order_amount: c.min_order_amount ?? "",
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error("الكود مطلوب");
    if (!form.discount_value || Number(form.discount_value) <= 0) return toast.error("قيمة الخصم مطلوبة");

    const payload: any = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses === "" ? null : Number(form.max_uses),
      min_order_amount: form.min_order_amount === "" ? null : Number(form.min_order_amount),
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const { error } = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);

    if (error) return toast.error("فشل الحفظ: " + error.message);
    toast.success(editing ? "تم تحديث الكوبون" : "تم إنشاء الكوبون");
    setOpen(false);
    fetchCoupons();
  };

  const del = async (c: Coupon) => {
    if (!confirm(`حذف الكوبون ${c.code}؟`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) return toast.error("فشل الحذف");
    toast.success("تم الحذف");
    fetchCoupons();
  };

  const showUsages = async (c: Coupon) => {
    setUsageCoupon(c);
    setUsagesOpen(true);
    const { data } = await supabase
      .from("coupon_usages")
      .select("*")
      .eq("coupon_id", c.id)
      .order("created_at", { ascending: false });
    setUsages((data as any) || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold">إدارة كوبونات الخصم</h2>
        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" /> كوبون جديد
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8">جاري التحميل...</p>
      ) : coupons.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">لا توجد كوبونات بعد</Card>
      ) : (
        <div className="grid gap-3">
          {coupons.map((c) => {
            const expired = c.expires_at && new Date(c.expires_at) < new Date();
            const maxedOut = c.max_uses && c.used_count >= c.max_uses;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-lg font-mono">{c.code}</span>
                      {c.is_active && !expired && !maxedOut ? (
                        <Badge className="bg-green-600">نشط</Badge>
                      ) : (
                        <Badge variant="destructive">{expired ? "منتهي" : maxedOut ? "مستنفد" : "متوقف"}</Badge>
                      )}
                      <Badge variant="outline">
                        {c.discount_type === "percent" ? `${c.discount_value}%` : `${c.discount_value} ج`}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1">
                      <span>الاستخدامات: {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}</span>
                      {c.min_order_amount ? <span>حد أدنى: {c.min_order_amount} ج</span> : null}
                      {c.expires_at ? <span>ينتهي: {new Date(c.expires_at).toLocaleDateString("ar-EG")}</span> : null}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => showUsages(c)}>
                      <Eye className="h-4 w-4 ml-1" /> الاستخدامات
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل كوبون" : "كوبون جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>كود الكوبون *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع الخصم</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">نسبة %</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>قيمة الخصم *</Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>عدد مرات الاستخدام المسموح (فارغ = غير محدود)</Label>
              <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="مثال: 100" />
            </div>
            <div>
              <Label>حد أدنى للطلب (اختياري)</Label>
              <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="مثال: 500" />
            </div>
            <div>
              <Label>تاريخ انتهاء (اختياري)</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>مفعّل</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <Button className="w-full" onClick={save}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={usagesOpen} onOpenChange={setUsagesOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>استخدامات الكوبون {usageCoupon?.code}</DialogTitle>
          </DialogHeader>
          {usages.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">لم يستخدم بعد</p>
          ) : (
            <div className="space-y-2">
              {usages.map((u) => (
                <div key={u.id} className="p-3 border rounded flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                  <div>
                    <p className="font-semibold">{u.customer_name || "بدون اسم"}</p>
                    <p className="text-muted-foreground">{u.customer_phone || "-"}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-primary">-{Number(u.discount_amount).toFixed(2)} ج</p>
                    <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString("ar-EG")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManagement;
