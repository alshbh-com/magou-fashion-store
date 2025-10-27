import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send to WhatsApp
    const whatsappMessage = `
الاسم: ${formData.name}
البريد الإلكتروني: ${formData.email}
الهاتف: ${formData.phone}
الرسالة: ${formData.message}
    `.trim();
    
    const url = `https://wa.me/201095317035?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
    
    toast.success("سيتم فتح واتساب لإرسال رسالتك");
    
    // Reset form
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
          <Card className="p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">الهاتف</h3>
                <a href="tel:+201095317035" className="text-muted-foreground hover:text-primary transition-colors">
                  +201095317035
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
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
