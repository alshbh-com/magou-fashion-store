import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Eye, Loader2, Filter, Mail, Edit, Plus, Minus, X, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  order_number: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_email: string | null;
  customer_notes: string | null;
  total: number | null;
  status: string | null;
  created_at: string | null;
  shipping_cost: number | null;
  subtotal: number | null;
  discount: number | null;
}

interface Product {
  id: string;
  name_ar: string;
  price: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  color_name: string | null;
  size_name: string | null;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItems, setEditingItems] = useState<OrderItem[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, price")
        .order("name_ar");
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(o => 
        (o.order_number?.toString() || "").includes(query) ||
        (o.customer_name || "").toLowerCase().includes(query) ||
        (o.customer_phone || "").includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [statusFilter, orders, searchQuery]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("order_number", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("فشل في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      const items = data || [];
      setOrderItems(items);
      return items as OrderItem[];
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast.error("فشل في تحميل تفاصيل الطلب");
      setOrderItems([]);
      return [];
    }
  };

  const viewOrder = async (order: Order) => {
    if (!order.id) return toast.error("رقم الطلب غير مكتمل، برجاء تحديث الصفحة");
    setSelectedOrder(order);
    setOrderItems([]);
    await fetchOrderItems(order.id);
    setDialogOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success("تم تحديث حالة الطلب");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("فشل في تحديث حالة الطلب");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    try {
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.filter(o => o.id !== orderId));
      toast.success("تم حذف الطلب");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("فشل في حذف الطلب");
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} طلب؟`)) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await supabase.from("order_items").delete().in("order_id", ids);
      const { error } = await supabase.from("orders").delete().in("id", ids);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => !selectedIds.has(o.id)));
      setSelectedIds(new Set());
      toast.success(`تم حذف ${ids.length} طلب`);
    } catch (err) {
      console.error(err);
      toast.error("فشل الحذف الجماعي");
    } finally {
      setBulkDeleting(false);
    }
  };

  // فتح نافذة التعديل
  const openEditDialog = async (order: Order) => {
    if (!order.id) return toast.error("رقم الطلب غير مكتمل، برجاء تحديث الصفحة");
    setEditingOrder({ ...order });
    const items = await fetchOrderItems(order.id);
    setEditingItems(items);
    setEditDialogOpen(true);
  };

  // تحديث عنصر في الطلب
  const updateEditingItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...editingItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingItems(newItems);
  };

  // حذف عنصر من الطلب
  const removeEditingItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  // إضافة منتج جديد للطلب
  const addProductToOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      product_name: product.name_ar,
      quantity: 1,
      price: product.price,
      color_name: null,
      size_name: null,
    };
    setEditingItems([...editingItems, newItem]);
  };

  // حفظ التعديلات
  const saveOrderChanges = async () => {
    if (!editingOrder) return;
    
    setSaving(true);
    try {
      // حذف العناصر القديمة
      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", editingOrder.id);

      // إضافة العناصر الجديدة
      const itemsToInsert = editingItems.map(item => ({
        order_id: editingOrder.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        color_name: item.color_name,
        size_name: item.size_name,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      // حساب المجموع الجديد
      const newSubtotal = editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newTotal = newSubtotal + (editingOrder.shipping_cost || 0) - (editingOrder.discount || 0);

      // تحديث الطلب
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          customer_name: editingOrder.customer_name,
          customer_phone: editingOrder.customer_phone,
          customer_address: editingOrder.customer_address,
          customer_city: editingOrder.customer_city,
          customer_notes: editingOrder.customer_notes,
          subtotal: newSubtotal,
          total: newTotal,
        })
        .eq("id", editingOrder.id);

      if (orderError) throw orderError;

      toast.success("تم حفظ التعديلات بنجاح");
      setEditDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("فشل في حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
      transferred: "bg-cyan-100 text-cyan-800",
    };

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      shipped: "تعديل",
      cancelled: "ملغي",
      transferred: "تم النقل للسيستم",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatOrderDate = (createdAt: string | null) => {
    if (!createdAt) return "تاريخ غير متاح";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1970) return "تاريخ غير متاح";
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderNumber = (order: Order) => order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 8)}`;

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      cancelled: 0,
      transferred: 0,
    };
    orders.forEach(o => {
        if (o.status && counts[o.status] !== undefined) {
          counts[o.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فلتر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">قيد الانتظار ({statusCounts.pending})</SelectItem>
                  <SelectItem value="confirmed">تم التأكيد ({statusCounts.confirmed})</SelectItem>
                  <SelectItem value="shipped">تعديل ({statusCounts.shipped})</SelectItem>
                  <SelectItem value="cancelled">ملغي ({statusCounts.cancelled})</SelectItem>
                  <SelectItem value="transferred">تم النقل للسيستم ({statusCounts.transferred})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="text-lg">
              عرض: {filteredOrders.length}
            </Badge>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="gap-2"
              >
                {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                حذف المحدد ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Box */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">المدينة</TableHead>
              <TableHead className="text-right">الإجمالي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} data-state={selectedIds.has(order.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(order.id)}
                    onCheckedChange={() => toggleSelected(order.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{getOrderNumber(order)}</TableCell>
                <TableCell>{order.customer_name || "-"}</TableCell>
                <TableCell dir="ltr">{order.customer_phone || "-"}</TableCell>
                <TableCell>
                  {order.customer_email ? (
                    <span className="text-xs">{order.customer_email}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>{order.customer_city || "-"}</TableCell>
                <TableCell>{Number(order.total || 0).toFixed(2)} جنيه</TableCell>
                <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                <TableCell>
                  {formatOrderDate(order.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditDialog(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteOrder(order.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">تفاصيل الطلب {selectedOrder ? getOrderNumber(selectedOrder) : ""}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Sidebar with Customer Info */}
              <div className="space-y-4">
                <Card className="p-4 sticky top-4">
                  <h3 className="font-semibold mb-3 text-lg">معلومات العميل</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">الاسم:</span>
                        <p className="font-semibold mt-1">{selectedOrder.customer_name || "-"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">الهاتف:</span>
                        <p className="font-semibold mt-1" dir="ltr">{selectedOrder.customer_phone || "-"}</p>
                    </div>
                    {selectedOrder.customer_email && (
                      <div>
                        <span className="font-medium text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          البريد الإلكتروني:
                        </span>
                        <p className="font-semibold mt-1 text-xs break-all">{selectedOrder.customer_email}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-muted-foreground">العنوان:</span>
                        <p className="font-semibold mt-1">{selectedOrder.customer_address || "-"}, {selectedOrder.customer_city || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي:</span>
                      <span className="font-semibold">{Number(selectedOrder.subtotal || 0).toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الشحن:</span>
                      <span className="font-semibold">{Number(selectedOrder.shipping_cost || 0).toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>الإجمالي:</span>
                      <span className="text-primary">{Number(selectedOrder.total || 0).toFixed(2)} جنيه</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Select
                      value={selectedOrder.status || "pending"}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="confirmed">تم التأكيد</SelectItem>
                        <SelectItem value="shipped">تعديل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                        <SelectItem value="transferred">تم النقل للسيستم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </div>

              {/* Products List */}
              <Card className="p-4 lg:col-span-2">
                <h3 className="font-semibold mb-4 text-lg">المنتجات ({orderItems.length})</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {orderItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                      لا توجد منتجات مسجلة لهذا الطلب
                    </div>
                  ) : orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{item.product_name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="bg-background px-2 py-0.5 rounded">الكمية: {item.quantity}</span>
                          {item.color_name && (
                            <span className="bg-background px-2 py-0.5 rounded">اللون: {item.color_name}</span>
                          )}
                          {item.size_name && (
                            <span className="bg-background px-2 py-0.5 rounded">المقاس: {item.size_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{Number(item.price || 0) * Number(item.quantity || 0)} جنيه</p>
                        <p className="text-xs text-muted-foreground">{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التعديل */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">تعديل الطلب {editingOrder ? getOrderNumber(editingOrder) : ""}</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-6">
              {/* معلومات العميل */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">معلومات العميل</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم</Label>
                    <Input
                      value={editingOrder.customer_name}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الهاتف</Label>
                    <Input
                      value={editingOrder.customer_phone}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>المدينة</Label>
                    <Input
                      value={editingOrder.customer_city}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>العنوان</Label>
                    <Input
                      value={editingOrder.customer_address}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={editingOrder.customer_notes || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_notes: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {/* المنتجات */}
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">المنتجات</h3>
                  <Select onValueChange={addProductToOrder}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="إضافة منتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {editingItems.map((item, index) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg border items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">{item.product_name}</p>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label className="text-xs">الكمية</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateEditingItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateEditingItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="h-7 w-14 text-center"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateEditingItem(index, 'quantity', item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">السعر</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => updateEditingItem(index, 'price', parseFloat(e.target.value) || 0)}
                              className="h-7"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">اللون</Label>
                            <Input
                              value={item.color_name || ""}
                              onChange={(e) => updateEditingItem(index, 'color_name', e.target.value || null)}
                              className="h-7"
                              placeholder="اختياري"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">المقاس</Label>
                            <Input
                              value={item.size_name || ""}
                              onChange={(e) => updateEditingItem(index, 'size_name', e.target.value || null)}
                              className="h-7"
                              placeholder="اختياري"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm mb-1">{item.price * item.quantity} جنيه</p>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7"
                          onClick={() => removeEditingItem(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي:</span>
                    <span className="font-semibold">
                      {editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)} جنيه
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الشحن:</span>
                    <span className="font-semibold">{editingOrder.shipping_cost} جنيه</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                    <span>الإجمالي:</span>
                    <span className="text-primary">
                      {editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (editingOrder.shipping_cost || 0) - (editingOrder.discount || 0)} جنيه
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={saveOrderChanges} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                  حفظ التعديلات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
