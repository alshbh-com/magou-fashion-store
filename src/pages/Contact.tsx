import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, MapPin, Instagram, Facebook, Truck, Package, Clock } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const customerServiceNumbers = ["01109427244", "01095317035", "01109427245"];
  
  const facebookLinks = [
    { url: "https://www.facebook.com/share/1DhYtEuZu9/?mibextid=wwXIfr", name: "صفحة 1" },
    { url: "https://www.facebook.com/share/1VqCRDCkEw/?mibextid=wwXIfr", name: "صفحة 2" },
    { url: "https://www.facebook.com/share/1AC5zCSYw2/?mibextid=wwXIfr", name: "صفحة 3" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappMessage = `
الاسم: ${formData.name}
البريد الإلكتروني: ${formData.email}
الهاتف: ${formData.phone}
الرسالة: ${formData.message}
    `.trim();
    
    const url = `https://wa.me/201109427245?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
    
    toast.success("سيتم فتح واتساب لإرسال رسالتك");
    
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        اتصل بنا
      </h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="الاسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="رسالتك"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full hover-glow">
              إرسال عبر واتساب
              <MessageCircle className="mr-2 h-5 w-5" />
            </Button>
          </form>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Shipping Policy - NEW SECTION */}
          <Card className="p-6 hover-scale border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                <Truck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3 text-yellow-700 dark:text-yellow-300">
                  سياسة الشحن والتوصيل
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                    <p className="flex-1">
                      <span className="font-semibold">تفاصيل المنتج قبل الاستلام:</span>
                      يتم معاينة المنتج قبل الاستلام، وفي حال رفض الطلب يتم احتساب مصاريف الشحن على العميل.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                    <p className="flex-1">
                      <span className="font-semibold">مدة التوصيل للمحافظات:</span>
                      من 3 إلى 5 أيام عمل لأي محافظة.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                    <p className="flex-1">
                      <span className="font-semibold">مدة التوصيل للقاهرة والجيزة:</span>
                      من يومين إلى 3 أيام عمل.
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                      ملاحظة: جميع أوقات التوصيل تشمل أيام العمل فقط (السبت - الخميس) ولا تشمل العطلات الرسمية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Phone Numbers */}
          <Card className="p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">أرقام خدمة العملاء</h3>
                <div className="space-y-2">
                  {customerServiceNumbers.map((number, index) => (
                    <a
                      key={index}
                      href={`tel:+2${number}`}
                      className="block text-muted-foreground hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      +2{number}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* WhatsApp */}
          <Card className="p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">واتساب</h3>
                <a
                  href="https://wa.me/201095317035"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  تواصل معنا مباشرة
                </a>
              </div>
            </div>
          </Card>

          {/* Social Media */}
          <Card className="p-6 hover-scale">
            <h3 className="font-semibold text-lg mb-4">تابعنا على</h3>
            <div className="space-y-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ma_g0u?igsh=aG9nbzM2Z2loMm52&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram - @ma_g0u</span>
              </a>
              
              {/* Facebook Pages */}
              {facebookLinks.map((fb, index) => (
                <a
                  key={index}
                  href={fb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span>Facebook - {fb.name}</span>
                </a>
              ))}
              
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@mag0u_fashion?_r=1&_t=ZS-91pf447Z36z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok - @mag0u_fashion</span>
              </a>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">الموقع</h3>
                <p className="text-muted-foreground">
                  مصر - نخدم جميع المحافظات
                </p>
              </div>
            </div>
          </Card>

          {/* Working Hours */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-gradient-gold">ساعات العمل</h3>
            <div className="space-y-2 text-foreground/90">
              <p>السبت - الخميس: 9 صباحاً - 10 مساءً</p>
              <p>الجمعة: 2 ظهراً - 10 مساءً</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
