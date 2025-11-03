import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Star, Truck, CreditCard, HeadphonesIcon, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import magouLogo from "@/assets/magou-logo.png";

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  image_url: string | null;
  description: string | null;
  stock: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.is_offer && product.offer_price ? product.offer_price : product.price,
      image_url: product.image_url,
    });
  };

  const addToFavorites = (product: Product) => {
    toast.success(`تم إضافة ${product.name} إلى المفضلة`);
  };

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "شحن سريع",
      description: "توصيل لجميع المحافظات"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "دفع آمن",
      description: "طرق دفع متعددة وآمنة"
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8" />,
      title: "دعم 24/7",
      description: "خدمة عملاء متواصلة"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "جودة عالية",
      description: "منتجات مضمونة 100%"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center animate-slide-up">
            <img 
              src={magouLogo} 
              alt="Màgou Fashion" 
              className="h-48 w-auto logo-glow shimmer"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
            مرحباً بكم في عالم
            <span className="block text-gradient-orange mt-3 text-5xl md:text-7xl lg:text-8xl">Màgou Fashion</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-foreground/90 mb-10 font-medium animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Sparkles className="inline-block ml-2 h-8 w-8 text-primary animate-pulse" />
            أناقة لا تُضاهى، جودة لا تُقاوم
            <Sparkles className="inline-block mr-2 h-8 w-8 text-accent animate-pulse" />
          </p>
          
          <Link to="/products" className="animate-slide-up inline-block" style={{ animationDelay: '0.6s' }}>
            <Button size="lg" className="text-lg px-8 py-6 hover-glow hover-scale shadow-orange-glow">
              استكشف المجموعة
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-orange flex items-center gap-3">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              منتجاتنا المميزة
            </h2>
            <Link to="/products">
              <Button variant="outline" className="hover-glow hover-scale border-primary/50 hover:border-primary">
                عرض الكل
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const currentPrice = product.is_offer && product.offer_price ? product.offer_price : product.price;
                
                return (
                  <Card key={product.id} className="group overflow-hidden hover:shadow-orange-glow transition-all duration-500 hover-scale border-border hover:border-primary/50 bg-card/80 backdrop-blur">
                    <div className="relative overflow-hidden aspect-square">
                      {product.is_offer && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-bold z-10 shadow-orange-glow animate-pulse">
                          عرض خاص
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-card/90 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm z-20 transition-all"
                        onClick={() => addToFavorites(product)}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description || "منتج عالي الجودة"}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-primary">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.is_offer && product.offer_price && (
                          <span className="text-muted-foreground line-through text-sm">
                            {product.price} جنيه
                          </span>
                        )}
                        <span className="text-primary font-bold text-xl">
                          {currentPrice} جنيه
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full hover-glow" 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="ml-2 h-4 w-4" />
                        {product.stock === 0 ? "نفذت الكمية" : "أضف إلى السلة"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-6">لا توجد منتجات حالياً</p>
              <p className="text-muted-foreground">سيتم إضافة منتجات قريباً</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 text-gradient-orange">
            لماذا تختارنا؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 hover:from-secondary hover:to-card backdrop-blur-sm transition-all duration-500 hover-scale border border-border hover:border-primary/50 shadow-card-depth hover:shadow-orange-glow group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6 group-hover:scale-110 transition-transform duration-500 shadow-elegant">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 rounded-3xl p-16 text-center border-2 border-primary/40 shadow-orange-glow shimmer">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="relative z-10">
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-gradient-orange">
                اكتشف مجموعتنا الكاملة
              </h2>
              <p className="text-2xl text-foreground mb-10 max-w-3xl mx-auto font-medium">
                أحدث صيحات الموضة العالمية بأفضل الأسعار وأعلى جودة
              </p>
              <Link to="/products">
                <Button size="lg" className="text-lg px-10 py-7 hover-scale hover-glow shadow-orange-glow bg-gradient-to-r from-primary to-accent">
                  عرض جميع المنتجات
                  <ArrowLeft className="mr-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
