import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Favorites = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        المفضلة
      </h1>

      <div className="max-w-4xl mx-auto">
        {/* Empty Favorites State */}
        <Card className="p-12 text-center">
          <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">لا توجد منتجات مفضلة</h2>
          <p className="text-muted-foreground mb-6">
            اضف منتجاتك المفضلة لتسهيل الوصول إليها
          </p>
          <Link to="/products">
            <Button size="lg" className="hover-glow">
              استكشف المنتجات
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Favorites;
