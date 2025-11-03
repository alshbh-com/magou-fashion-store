import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import magouLogo from "@/assets/magou-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "المنتجات", path: "/products" },
    { name: "المفضلة", path: "/favorites" },
    { name: "من نحن", path: "/about" },
    { name: "اتصل بنا", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src={magouLogo} 
              alt="Màgou Fashion Logo" 
              className="h-16 w-auto logo-glow animate-slide-in"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-base font-semibold transition-all duration-300 hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-elegant" />
                )}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="hover-glow hover:bg-primary/10 transition-all">
                <Heart className="h-6 w-6" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="hover-glow hover:bg-primary/10 relative transition-all">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-orange-glow animate-pulse-glow">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground/80"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
