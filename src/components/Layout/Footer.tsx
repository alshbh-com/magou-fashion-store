import { Link } from "react-router-dom";
import { Facebook, MessageCircle, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold text-gradient-gold">
              Màgou Fashion
            </h3>
            <p className="text-muted-foreground">
              متجرك الأول للأزياء العصرية والراقية
            </p>
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
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">تواصل معنا</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/17RbzF2VCC/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors hover-scale"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/201095317035"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors hover-scale"
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
