import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Star, Truck, CreditCard, HeadphonesIcon, Heart, Package, Eye } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import BannersSection from "@/components/BannersSection";
import ProductQuickView from "@/components/ProductQuickView";

interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_offer: boolean;
  image_url: string | null;
  description: string | null;
  details: string | null;
  stock: number;
  color_options: string[] | null;
  size_options: string[] | null;
  size_pricing: any;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Subscribe to realtime updates
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories" as any)
        .select("id, name, description, image_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      setCategories((data || []) as unknown as Category[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
    <div className="animate-fade-in min-h-screen bg-white">
      {/* Content Container */}
      <div>
        {/* Banners Section */}
        <BannersSection />

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 bg-gradient-to-r from-primary to-orange-light bg-clip-text text-transparent">
                الأقسام
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/products?category=${category.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-gray-200 hover:border-primary">
                      <div className="relative overflow-hidden aspect-square">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                            <Package className="h-16 w-16 text-primary" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-bold text-lg mb-1 text-black">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-orange-light bg-clip-text text-transparent">
              منتجاتنا المميزة
            </h2>
            <Link to="/products">
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
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
                  <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-gray-200 hover:border-primary">
                    <div className="relative overflow-hidden aspect-square">
                      {product.is_offer && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-orange-light text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                          عرض خاص
                        </div>
                      )}
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white text-black shadow-md"
                          onClick={() => addToFavorites(product)}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white text-black shadow-md"
                          onClick={() => {
                            setSelectedProduct(product);
                            setQuickViewOpen(true);
                          }}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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
                          <span className="text-gray-400 line-through text-sm">
                            {product.price} جنيه
                          </span>
                        )}
                        <span className="text-primary font-bold text-xl">
                          {currentPrice} جنيه
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Link to={`/products/${product.id}`} className="w-full">
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-orange-light hover:from-orange-dark hover:to-primary text-white font-bold shadow-lg hover:shadow-xl transition-all" 
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? "نفذت الكمية" : "عرض التفاصيل"}
                        </Button>
                      </Link>
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
        <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 bg-gradient-to-r from-primary to-orange-light bg-clip-text text-transparent">
            لماذا تختارنا؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-primary"
              >
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-orange-light rounded-2xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
              اكتشف مجموعتنا الكاملة
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              أحدث صيحات الموضة بأفضل الأسعار
            </p>
            <Link to="/products">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                عرض جميع المنتجات
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Dialog */}
      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default Home;
