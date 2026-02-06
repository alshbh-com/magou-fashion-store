import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, ChevronDown, ChevronUp, Lock, Globe, ShoppingBag, User, ShoppingCart, Package, MapPin, Image, Box } from "lucide-react";

const BASE_URL = "https://jelvphpjoyvqhfixfdpb.supabase.co/functions/v1/mobile-api";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  category: string;
  body?: Record<string, string>;
  query?: Record<string, string>;
  response?: string;
}

const endpoints: ApiEndpoint[] = [
  // Products
  {
    method: "GET",
    path: "/products",
    description: "قائمة المنتجات مع البحث والفلترة والتصفح",
    auth: false,
    category: "المنتجات",
    query: {
      page: "رقم الصفحة (افتراضي: 1)",
      limit: "عدد النتائج (افتراضي: 20)",
      search: "بحث بالاسم أو الوصف",
      category_id: "فلترة حسب معرف القسم",
      category_slug: "فلترة حسب slug القسم",
      is_featured: "المنتجات المميزة فقط (true/false)",
      is_offer: "العروض فقط (true/false)",
      min_price: "أقل سعر",
      max_price: "أعلى سعر",
      sort_by: "ترتيب حسب (price, created_at, name)",
      sort_order: "اتجاه الترتيب (asc/desc)",
    },
  },
  {
    method: "GET",
    path: "/products/:id",
    description: "تفاصيل منتج مع الألوان والمقاسات والصور والعروض",
    auth: false,
    category: "المنتجات",
  },
  // Categories
  {
    method: "GET",
    path: "/categories",
    description: "قائمة الأقسام النشطة",
    auth: false,
    category: "الأقسام",
  },
  {
    method: "GET",
    path: "/categories/:id",
    description: "تفاصيل قسم محدد",
    auth: false,
    category: "الأقسام",
  },
  // Auth
  {
    method: "POST",
    path: "/auth/register",
    description: "تسجيل مستخدم جديد",
    auth: false,
    category: "المصادقة",
    body: {
      email: "البريد الإلكتروني (مطلوب)",
      password: "كلمة المرور (مطلوب)",
      name: "الاسم (اختياري)",
      phone: "رقم الهاتف (اختياري)",
    },
  },
  {
    method: "POST",
    path: "/auth/login",
    description: "تسجيل الدخول والحصول على التوكن",
    auth: false,
    category: "المصادقة",
    body: {
      email: "البريد الإلكتروني (مطلوب)",
      password: "كلمة المرور (مطلوب)",
    },
  },
  {
    method: "POST",
    path: "/auth/refresh",
    description: "تجديد التوكن المنتهي",
    auth: false,
    category: "المصادقة",
    body: {
      refresh_token: "توكن التجديد (مطلوب)",
    },
  },
  {
    method: "GET",
    path: "/auth/profile",
    description: "الحصول على بيانات المستخدم الحالي",
    auth: true,
    category: "المصادقة",
  },
  {
    method: "PUT",
    path: "/auth/profile",
    description: "تحديث بيانات المستخدم",
    auth: true,
    category: "المصادقة",
    body: {
      name: "الاسم الجديد",
      phone: "رقم الهاتف الجديد",
    },
  },
  {
    method: "POST",
    path: "/auth/logout",
    description: "تسجيل الخروج",
    auth: true,
    category: "المصادقة",
  },
  // Cart
  {
    method: "GET",
    path: "/cart",
    description: "عرض سلة المشتريات مع تفاصيل المنتجات والإجمالي",
    auth: true,
    category: "السلة",
  },
  {
    method: "POST",
    path: "/cart/add",
    description: "إضافة منتج للسلة (يزيد الكمية لو موجود)",
    auth: true,
    category: "السلة",
    body: {
      product_id: "معرف المنتج (مطلوب)",
      quantity: "الكمية (افتراضي: 1)",
      color_name: "اسم اللون (اختياري)",
      size_name: "اسم المقاس (اختياري)",
      notes: "ملاحظات (اختياري)",
    },
  },
  {
    method: "PUT",
    path: "/cart/:item_id",
    description: "تعديل كمية منتج في السلة",
    auth: true,
    category: "السلة",
    body: {
      quantity: "الكمية الجديدة (مطلوب، أكبر من 0)",
    },
  },
  {
    method: "DELETE",
    path: "/cart/:item_id",
    description: "حذف منتج من السلة",
    auth: true,
    category: "السلة",
  },
  {
    method: "DELETE",
    path: "/cart/clear",
    description: "تفريغ السلة بالكامل",
    auth: true,
    category: "السلة",
  },
  // Orders
  {
    method: "POST",
    path: "/orders",
    description: "إنشاء طلب جديد (الدفع عند الاستلام فقط)",
    auth: true,
    category: "الطلبات",
    body: {
      name: "اسم العميل (مطلوب)",
      phone: "رقم الهاتف - 11 رقم يبدأ بـ 01 (مطلوب)",
      phone2: "رقم هاتف إضافي (اختياري)",
      address: "العنوان بالتفصيل (مطلوب)",
      governorate_id: "معرف المحافظة (مطلوب)",
      notes: "ملاحظات (اختياري)",
      items: '[{ product_id, quantity, color_name?, size_name? }] (مطلوب)',
    },
  },
  {
    method: "GET",
    path: "/orders",
    description: "قائمة طلبات المستخدم الحالي",
    auth: true,
    category: "الطلبات",
  },
  {
    method: "GET",
    path: "/orders/:id",
    description: "تفاصيل طلب محدد مع المنتجات",
    auth: true,
    category: "الطلبات",
  },
  // Governorates
  {
    method: "GET",
    path: "/governorates",
    description: "قائمة المحافظات مع تكلفة الشحن",
    auth: false,
    category: "المحافظات",
  },
  // Banners
  {
    method: "GET",
    path: "/banners",
    description: "البانرات النشطة للعرض",
    auth: false,
    category: "البانرات",
  },
  // Packages
  {
    method: "GET",
    path: "/packages",
    description: "قائمة الباكدجات",
    auth: false,
    category: "الباكدجات",
  },
  {
    method: "GET",
    path: "/packages/:id",
    description: "تفاصيل باكدج مع المنتجات",
    auth: false,
    category: "الباكدجات",
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  POST: "bg-blue-500/15 text-blue-700 border-blue-300",
  PUT: "bg-amber-500/15 text-amber-700 border-amber-300",
  DELETE: "bg-red-500/15 text-red-700 border-red-300",
};

const categoryIcons: Record<string, React.ReactNode> = {
  "المنتجات": <ShoppingBag className="h-4 w-4" />,
  "الأقسام": <Box className="h-4 w-4" />,
  "المصادقة": <User className="h-4 w-4" />,
  "السلة": <ShoppingCart className="h-4 w-4" />,
  "الطلبات": <Package className="h-4 w-4" />,
  "المحافظات": <MapPin className="h-4 w-4" />,
  "البانرات": <Image className="h-4 w-4" />,
  "الباكدجات": <Box className="h-4 w-4" />,
};

const ApiDocumentation = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const categories = [...new Set(endpoints.map((e) => e.category))];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Base URL */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Base URL</h3>
            <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono break-all select-all">
              {BASE_URL}
            </code>
          </div>
          <button
            onClick={() => copyToClipboard(BASE_URL, "Base URL")}
            className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
            title="نسخ"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </Card>

      {/* Auth Info */}
      <Card className="p-4 border-amber-200 bg-amber-50/50">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          المصادقة (Authentication)
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          الـ Endpoints المحمية تتطلب إرسال التوكن في الـ Header:
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-3 py-1.5 rounded font-mono select-all flex-1">
            Authorization: Bearer {"<access_token>"}
          </code>
          <button
            onClick={() => copyToClipboard('Authorization: Bearer <access_token>', "Header")}
            className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </Card>

      {/* Endpoints by Category */}
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            {categoryIcons[category]}
            {category}
          </h2>
          <div className="space-y-2">
            {endpoints
              .filter((e) => e.category === category)
              .map((endpoint, idx) => {
                const globalIdx = endpoints.indexOf(endpoint);
                const isExpanded = expandedIndex === globalIdx;
                const fullUrl = `${BASE_URL}${endpoint.path}`;

                return (
                  <Card key={idx} className="overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedIndex(isExpanded ? null : globalIdx)}
                    >
                      <Badge
                        variant="outline"
                        className={`${methodColors[endpoint.method]} font-mono text-xs px-2 py-0.5 min-w-[60px] text-center`}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                      <div className="flex items-center gap-2">
                        {endpoint.auth ? (
                          <Lock className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(fullUrl, "URL");
                          }}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="نسخ الرابط"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4 space-y-3 bg-muted/20">
                        <p className="text-sm">{endpoint.description}</p>

                        {/* Full URL */}
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Full URL:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1 select-all">
                              {fullUrl}
                            </code>
                            <button
                              onClick={() => copyToClipboard(fullUrl, "Full URL")}
                              className="p-1.5 hover:bg-muted rounded transition-colors shrink-0"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* cURL Example */}
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">cURL:</span>
                          <div className="flex items-start gap-2 mt-1">
                            <code className="text-xs bg-gray-900 text-green-400 px-3 py-2 rounded font-mono break-all flex-1 select-all whitespace-pre-wrap">
                              {generateCurl(endpoint, fullUrl)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(generateCurl(endpoint, fullUrl), "cURL")}
                              className="p-1.5 hover:bg-muted rounded transition-colors shrink-0"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Query Params */}
                        {endpoint.query && (
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Query Parameters:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(endpoint.query).map(([key, desc]) => (
                                <div key={key} className="flex gap-2 text-xs">
                                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-primary">{key}</code>
                                  <span className="text-muted-foreground">{desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.body && (
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Request Body (JSON):</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(endpoint.body).map(([key, desc]) => (
                                <div key={key} className="flex gap-2 text-xs">
                                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-primary">{key}</code>
                                  <span className="text-muted-foreground">{desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auth badge */}
                        <div className="flex items-center gap-2">
                          {endpoint.auth ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                              <Lock className="h-3 w-3 ml-1" />
                              يتطلب تسجيل دخول
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                              <Globe className="h-3 w-3 ml-1" />
                              عام - بدون مصادقة
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

function generateCurl(endpoint: ApiEndpoint, fullUrl: string): string {
  let curl = `curl -X ${endpoint.method} "${fullUrl}"`;
  curl += ` \\\n  -H "Content-Type: application/json"`;

  if (endpoint.auth) {
    curl += ` \\\n  -H "Authorization: Bearer <access_token>"`;
  }

  curl += ` \\\n  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplbHZwaHBqb3l2cWhmaXhmZHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjg4NzIsImV4cCI6MjA3ODcwNDg3Mn0.l2lpqtk2Lw0FaxhGsbmlXE148sojM8oVvByy9PUOrOA"`;

  if (endpoint.body) {
    const bodyExample: Record<string, string> = {};
    Object.keys(endpoint.body).forEach((key) => {
      if (key === "email") bodyExample[key] = "user@example.com";
      else if (key === "password") bodyExample[key] = "password123";
      else if (key === "name") bodyExample[key] = "أحمد محمد";
      else if (key === "phone") bodyExample[key] = "01012345678";
      else if (key === "address") bodyExample[key] = "القاهرة، شارع التحرير";
      else if (key === "quantity") bodyExample[key] = "1";
      else if (key === "product_id") bodyExample[key] = "<product_uuid>";
      else if (key === "governorate_id") bodyExample[key] = "<governorate_uuid>";
      else if (key === "refresh_token") bodyExample[key] = "<refresh_token>";
      else if (key === "items") bodyExample[key] = '[{"product_id":"<uuid>","quantity":1}]';
      else bodyExample[key] = `<${key}>`;
    });
    curl += ` \\\n  -d '${JSON.stringify(bodyExample, null, 2)}'`;
  }

  return curl;
}

export default ApiDocumentation;
