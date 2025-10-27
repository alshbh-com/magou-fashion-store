import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Truck, CreditCard, HeadphonesIcon } from "lucide-react";

const Home = () => {
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
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
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
            <span className="block text-gradient-gold mt-2">Màgou Fashion</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8">
            أناقة لا تُضاهى، جودة لا تُقاوم
          </p>
          <Link to="/products">
            <Button size="lg" className="text-lg px-8 py-6 hover-scale hover-glow">
              تسوق الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient-gold">
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
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gradient-gold">
              اكتشف مجموعتنا الجديدة
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              أحدث صيحات الموضة بأفضل الأسعار
            </p>
            <Link to="/products">
              <Button size="lg" variant="default" className="hover-scale hover-glow">
                استكشف المنتجات
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
