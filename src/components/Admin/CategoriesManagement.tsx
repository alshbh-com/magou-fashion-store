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

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  created_at: string | null;
}

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_ar: "",
    slug: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name_ar");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("فشل في تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        name: formData.name_ar, // Use Arabic for English too
        name_ar: formData.name_ar,
        slug: formData.slug,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("تم تحديث القسم");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([categoryData]);

        if (error) throw error;
        toast.success("تم إضافة القسم");
      }

      setDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("فشل في حفظ القسم");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      toast.success("تم حذف القسم");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("فشل في حذف القسم");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_ar: category.name_ar,
      slug: category.slug,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      slug: "",
    });
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    resetForm();
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
        <h2 className="text-2xl font-bold">إدارة الأقسام</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة قسم
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "تعديل قسم" : "إضافة قسم جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_ar">اسم القسم</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">الرابط (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="t-shirts"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCategory ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم القسم</TableHead>
              <TableHead className="text-right">الرابط</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name_ar}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCategory(category.id)}
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

export default CategoriesManagement;
