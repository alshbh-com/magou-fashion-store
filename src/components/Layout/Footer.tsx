import { Link } from "react-router-dom";
import { Facebook, MessageCircle, Instagram, Phone, Truck, Package, Clock } from "lucide-react";

const Footer = () => {
  const facebookLinks = [
    "https://www.facebook.com/share/1DhYtEuZu9/?mibextid=wwXIfr",
    "https://www.facebook.com/share/1VqCRDCkEw/?mibextid=wwXIfr",
    "https://www.facebook.com/share/1AC5zCSYw2/?mibextid=wwXIfr",
  ];

  const customerServiceNumbers = ["01109427244", "01095317035", "01109427245"];

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold text-gradient-gold">
              Màgou Fashion
            </h3>
            <p className="text-muted-foreground">
              متجرك الأول للأزياء العصرية والراقية
            </p>
          </div>

          {/* Shipping Policy - مضافة قبل خدمة العملاء */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-600" />
              سياسة الشحن والتوصيل
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 mt-0.5 text-amber-500" />
                <p>
                  <span className="font-medium text-foreground">معاينة المنتج:</span>
                  يتم معاينة المنتج قبل الاستلام. في حال رفض الطلب يتم احتساب مصاريف الشحن على العميل.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-amber-500" />
                <p>
                  <span className="font-medium text-foreground">مدة التوصيل للمحافظات:</span>
                  من 3 إلى 5 أيام عمل لأي محافظة.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-amber-500" />
                <p>
                  <span className="font-medium text-foreground">مدة التوصيل للقاهرة والجيزة:</span>
                  من يومين إلى 3 أيام عمل.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">خدمة العملاء</h4>
            <div className="flex flex-col gap-2">
              {customerServiceNumbers.map((number, index) => (
                <a
                  key={index}
                  href={`tel:+2${number}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">روابط سريعة</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                المنتجات
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                من نحن
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                اتصل بنا
              </Link>
            </nav>
          </div>

          {/* Social Media */}
          <div className="space-y-4 md:col-span-2">
            <h4 className="text-lg font-semibold text-foreground">تواصل معنا</h4>
            <div className="flex flex-wrap gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ma_g0u?igsh=aG9nbzM2Z2loMm52&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-muted text-foreground rounded-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all hover-scale"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              
              {/* Facebook Pages */}
              {facebookLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-muted text-foreground rounded-full hover:bg-blue-600 hover:text-white transition-colors hover-scale"
                  title={`Facebook ${index + 1}`}
                >
                  <Facebook className="h-5 w-5" />
                </a>
              ))}
              
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@mag0u_fashion?_r=1&_t=ZS-91pf447Z36z"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-muted text-foreground rounded-full hover:bg-gray-800 hover:text-white transition-colors hover-scale"
                title="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              
              {/* WhatsApp */}
              <a
                href="https://wa.me/201109427245"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-muted text-foreground rounded-full hover:bg-green-500 hover:text-white transition-colors hover-scale"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Màgou Fashion. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
