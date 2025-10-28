import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Star, Truck, CreditCard, HeadphonesIcon, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

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
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            background: "var(--gradient-hero)",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground">
            مرحباً بكم في
            <span className="block text-gradient-orange mt-2 animate-pulse-glow">Màgou Fashion</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8">
            أناقة لا تُضاهى، جودة لا تُقاوم
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-orange">
              منتجاتنا المميزة
            </h2>
            <Link to="/products">
              <Button variant="outline" className="hover-glow">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
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
                  <Card key={product.id} className="group overflow-hidden hover:shadow-[0_0_30px_hsl(45,95%,55%,0.2)] transition-all duration-300 hover-scale">
                    <div className="relative overflow-hidden aspect-square">
                      {product.is_offer && (
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold z-10">
                          عرض خاص
                        </div>
                      )}
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-background/80 hover:bg-background"
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
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient-orange">
            لماذا تختارنا؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-card hover:bg-secondary transition-all duration-300 hover-scale border border-border hover:border-primary"
              >
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-12 text-center border border-primary/30">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gradient-orange">
              اكتشف مجموعتنا الكاملة
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              أحدث صيحات الموضة بأفضل الأسعار
            </p>
            <Link to="/products">
              <Button size="lg" variant="default" className="hover-scale hover-glow">
                عرض جميع المنتجات
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
