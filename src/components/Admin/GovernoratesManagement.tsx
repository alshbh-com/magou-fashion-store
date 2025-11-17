import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Governorate {
  id: string;
  name: string;
  name_ar: string;
  shipping_cost: number;
}

const GovernoratesManagement = () => {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGovernorate, setEditingGovernorate] = useState<Governorate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    shipping_cost: 0,
  });

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from("governorates")
        .select("*")
        .order("name_ar");

      if (error) throw error;
      setGovernorates(data || []);
    } catch (error) {
      console.error("Error fetching governorates:", error);
      toast.error("فشل في تحميل المحافظات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGovernorate) {
        // تحديث
        const { error } = await supabase
          .from("governorates")
          .update({
            name: formData.name,
            name_ar: formData.name_ar,
            shipping_cost: formData.shipping_cost,
          })
          .eq("id", editingGovernorate.id);

        if (error) throw error;
        toast.success("تم تحديث المحافظة");
      } else {
        // إضافة جديد
        const { error } = await supabase
          .from("governorates")
          .insert([formData]);

        if (error) throw error;
        toast.success("تم إضافة المحافظة");
      }

      setDialogOpen(false);
      setEditingGovernorate(null);
      setFormData({ name: "", name_ar: "", shipping_cost: 0 });
      fetchGovernorates();
    } catch (error) {
      console.error("Error saving governorate:", error);
      toast.error("فشل في حفظ المحافظة");
    }
  };

  const deleteGovernorate = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحافظة؟")) return;

    try {
      const { error } = await supabase
        .from("governorates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGovernorates(governorates.filter(g => g.id !== id));
      toast.success("تم حذف المحافظة");
    } catch (error) {
      console.error("Error deleting governorate:", error);
      toast.error("فشل في حذف المحافظة");
    }
  };

  const openEditDialog = (governorate: Governorate) => {
    setEditingGovernorate(governorate);
    setFormData({
      name: governorate.name,
      name_ar: governorate.name_ar,
      shipping_cost: governorate.shipping_cost,
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingGovernorate(null);
    setFormData({ name: "", name_ar: "", shipping_cost: 0 });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة المحافظات</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة محافظة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGovernorate ? "تعديل محافظة" : "إضافة محافظة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_ar">الاسم بالعربي</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">الاسم بالإنجليزي</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shipping_cost">تكلفة الشحن (جنيه)</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingGovernorate ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المحافظة</TableHead>
              <TableHead className="text-right">الاسم بالإنجليزي</TableHead>
              <TableHead className="text-right">تكلفة الشحن</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {governorates.map((governorate) => (
              <TableRow key={governorate.id}>
                <TableCell className="font-medium">{governorate.name_ar}</TableCell>
                <TableCell>{governorate.name}</TableCell>
                <TableCell>{governorate.shipping_cost} جنيه</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(governorate)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteGovernorate(governorate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default GovernoratesManagement;
