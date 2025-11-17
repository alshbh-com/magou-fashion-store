import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ShoppingCart, Search, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
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
  stock_quantity: number;
  size_pricing: any;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Subscribe to realtime updates
    const productsChannel = supabase
      .channel('products-changes-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sortBy, selectedCategory]);

  const fetchCategories = async () => {
    try {
const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("حدث خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category_id === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA = a.is_offer && a.offer_price ? a.offer_price : a.price;
          const priceB = b.is_offer && b.offer_price ? b.offer_price : b.price;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA = a.is_offer && a.offer_price ? a.offer_price : a.price;
          const priceB = b.is_offer && b.offer_price ? b.offer_price : b.price;
          return priceB - priceA;
        });
        break;
      case "offers":
        filtered = filtered.filter((p) => p.is_offer);
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToFavorites = (product: Product) => {
    toast.success(`تم إضافة ${product.name} إلى المفضلة`);
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        منتجاتنا
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">الافتراضي</SelectItem>
            <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
            <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
            <SelectItem value="offers">العروض الخاصة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const currentPrice = product.is_offer && product.offer_price ? product.offer_price : product.price;
          
          return (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover:shadow-[0_0_30px_hsl(45,95%,55%,0.2)] transition-all duration-300 hover-scale cursor-pointer"
              onClick={() => navigate(`/products/${product.id}`)}
            >
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
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(product);
                    }}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                      setQuickViewOpen(true);
                    }}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${product.id}`);
                  }}
                >
                  عرض التفاصيل
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">لا توجد منتجات متاحة</p>
        </div>
      )}

      {/* Quick View Dialog */}
      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default Products;
