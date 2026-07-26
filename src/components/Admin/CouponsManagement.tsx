import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Users, Pencil } from "lucide-react";

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
}

interface Usage {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  discount_amount: number;
  order_id: string | null;
  created_at: string;
}

const emptyForm = {
  code: "",
  discount_type: "fixed",
  discount_value: 0,
  max_uses: "" as string | number,
  is_active: true,
  expires_at: "",
  min_order_amount: 0,
};

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [usagesFor, setUsagesFor] = useState<Coupon | null>(null);
  const [usages, setUsages] = useState<Usage[]>([]);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error("فشل تحميل الكوبونات");
    setCoupons((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_uses: c.max_uses ?? "",
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      min_order_amount: c.min_order_amount ?? 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error("أدخل كود الكوبون");
    if (!form.discount_value || form.discount_value <= 0) return toast.error("أدخل قيمة الخصم");

    const payload: any = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses === "" || form.max_uses === null ? null : Number(form.max_uses),
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      min_order_amount: Number(form.min_order_amount) || 0,
    };

    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) return toast.error("فشل تحديث الكوبون: " + error.message);
      toast.success("تم تحديث الكوبون");
    } else {
      const { error } = await supabase.from("coupons").insert([payload]);
      if (error) return toast.error("فشل إنشاء الكوبون: " + error.message);
      toast.success("تم إنشاء الكوبون");
    }
    setDialogOpen(false);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الكوبون؟")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error("فشل الحذف");
    toast.success("تم الحذف");
    fetch();
  };

  const viewUsages = async (c: Coupon) => {
    setUsagesFor(c);
    const { data } = await supabase
      .from("coupon_usages")
      .select("*")
      .eq("coupon_id", c.id)
      .order("created_at", { ascending: false });
    setUsages((data as any) || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الكوبونات</h2>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 ml-2" /> كوبون جديد
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
      ) : coupons.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">لا يوجد كوبونات بعد</Card>
      ) : (
        <div className="grid gap-3">
          {coupons.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold bg-muted px-3 py-1 rounded">{c.code}</code>
                    {!c.is_active && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">معطّل</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    خصم: {c.discount_type === "percentage" ? `${c.discount_value}%` : `${c.discount_value} ج`}
                    {c.min_order_amount ? ` • حد أدنى ${c.min_order_amount} ج` : ""}
                  </p>
                  <p className="text-sm">
                    استُخدم: <strong>{c.used_count}</strong>
                    {c.max_uses ? ` / ${c.max_uses}` : " (غير محدود)"}
                    {c.expires_at ? ` • ينتهي: ${new Date(c.expires_at).toLocaleDateString("ar-EG")}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewUsages(c)}>
                    <Users className="h-4 w-4 ml-1" /> المستخدمين
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الكوبون" : "كوبون جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>الكود</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع الخصم</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>القيمة</Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الحد الأقصى للاستخدام</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="فارغ = غير محدود" />
              </div>
              <div>
                <Label>حد أدنى للطلب</Label>
                <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>تاريخ الانتهاء (اختياري)</Label>
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

      <Dialog open={!!usagesFor} onOpenChange={(o) => !o && setUsagesFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>مستخدمو الكوبون {usagesFor?.code}</DialogTitle>
          </DialogHeader>
          {usages.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">لا يوجد استخدامات بعد</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usages.map((u) => (
                <Card key={u.id} className="p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">{u.customer_name || "—"}</span>
                    <span className="text-primary font-bold">-{u.discount_amount} ج</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between mt-1">
                    <span>{u.customer_phone || ""}</span>
                    <span>{new Date(u.created_at).toLocaleString("ar-EG")}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManagement;
