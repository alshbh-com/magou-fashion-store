import { Card } from "@/components/ui/card";
import { Star, Award, Users, TrendingUp } from "lucide-react";

const About = () => {
  const stats = [
    { icon: <Users className="h-8 w-8" />, value: "10,000+", label: "عميل سعيد" },
    { icon: <Award className="h-8 w-8" />, value: "5,000+", label: "منتج عالي الجودة" },
    { icon: <Star className="h-8 w-8" />, value: "4.9/5", label: "تقييم العملاء" },
    { icon: <TrendingUp className="h-8 w-8" />, value: "3+", label: "سنوات من الخبرة" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gradient-gold">
        من نحن
      </h1>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction */}
        <Card className="p-8">
          <h2 className="text-3xl font-display font-bold mb-6 text-primary">
            Màgou Fashion
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            نحن متجر متخصص في تقديم أفضل وأحدث صيحات الموضة العالمية. نؤمن بأن الأناقة حق للجميع، 
            ولذلك نسعى لتقديم منتجات عالية الجودة بأسعار مناسبة.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            مع فريق عمل محترف وخبرة تمتد لسنوات في عالم الموضة، نضمن لك تجربة تسوق استثنائية 
            ومنتجات تلبي تطلعاتك وتعكس أسلوبك الخاص.
          </p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover-scale hover:border-primary transition-all">
              <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <h2 className="text-2xl font-display font-bold mb-4 text-gradient-gold">رؤيتنا</h2>
          <p className="text-lg text-foreground/90 leading-relaxed">
            أن نكون الوجهة الأولى لكل من يبحث عن الأناقة والجودة في عالم الموضة، 
            مع الحفاظ على أعلى معايير الخدمة ورضا العملاء.
          </p>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover-scale">
            <h3 className="text-xl font-semibold mb-3 text-primary">الجودة</h3>
            <p className="text-muted-foreground">
              نختار منتجاتنا بعناية فائقة لضمان أعلى مستويات الجودة
            </p>
          </Card>
          <Card className="p-6 text-center hover-scale">
            <h3 className="text-xl font-semibold mb-3 text-primary">المصداقية</h3>
            <p className="text-muted-foreground">
              الشفافية والثقة هما أساس علاقتنا مع عملائنا
            </p>
          </Card>
          <Card className="p-6 text-center hover-scale">
            <h3 className="text-xl font-semibold mb-3 text-primary">الابتكار</h3>
            <p className="text-muted-foreground">
              نواكب أحدث صيحات الموضة ونقدمها لك أولاً بأول
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
