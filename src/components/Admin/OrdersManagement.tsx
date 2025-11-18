import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Eye, Loader2 } from "lucide-react";
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
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number;
  subtotal: number;
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
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_number", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast.error("فشل في تحميل تفاصيل الطلب");
    }
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
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
      // حذف عناصر الطلب أولاً
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // حذف الطلب
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-orange-light text-orange-dark",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      transferred: "bg-cyan-100 text-cyan-800",
    };

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
      transferred: "تم النقل للسيستم",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status] || status}
      </Badge>
    );
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
        <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
        <Badge variant="outline" className="text-lg">
          إجمالي الطلبات: {orders.length}
        </Badge>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">المدينة</TableHead>
              <TableHead className="text-right">الإجمالي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.order_number}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.customer_phone}</TableCell>
                <TableCell>{order.customer_city}</TableCell>
                <TableCell>{order.total} جنيه</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString("ar-EG")}
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
            <DialogTitle className="text-xl">تفاصيل الطلب #{selectedOrder?.order_number}</DialogTitle>
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
                      <p className="font-semibold mt-1">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">الهاتف:</span>
                      <p className="font-semibold mt-1" dir="ltr">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">العنوان:</span>
                      <p className="font-semibold mt-1">{selectedOrder.customer_address}, {selectedOrder.customer_city}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي:</span>
                      <span className="font-semibold">{selectedOrder.subtotal} جنيه</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الشحن:</span>
                      <span className="font-semibold">{selectedOrder.shipping_cost} جنيه</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>الإجمالي:</span>
                      <span className="text-primary">{selectedOrder.total} جنيه</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="processing">قيد المعالجة</SelectItem>
                        <SelectItem value="shipped">تم الشحن</SelectItem>
                        <SelectItem value="delivered">تم التوصيل</SelectItem>
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
                  {orderItems.map((item) => (
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
                        <p className="font-semibold text-sm">{item.price * item.quantity} جنيه</p>
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
    </div>
  );
};

export default OrdersManagement;
