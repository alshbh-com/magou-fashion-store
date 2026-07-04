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
            Magou Group
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              مرحبًا بك في [ Magou Group ]، وجهتك الأولى للتسوق الإلكتروني، حيث نجمع لك كل ما تحتاجه في مكان واحد.
            </p>
            <p>
              نسعى إلى تقديم تجربة تسوق سهلة وآمنة، مع مجموعة متنوعة من المنتجات التي تلبي جميع الاحتياجات والأذواق. يضم متجرنا تشكيلة واسعة تشمل الأجهزة المنزلية، أدوات المطبخ، الإلكترونيات، الإكسسوارات، مستلزمات المنزل، منتجات العناية الشخصية، الهدايا، والعديد من الأقسام الأخرى، مع الحرص على إضافة أحدث المنتجات باستمرار.
            </p>
            <p>
              نؤمن بأن الجودة والسعر المناسب هما أساس ثقة عملائنا، لذلك نحرص على اختيار منتجات عالية الجودة بأسعار تنافسية، مع توفير خدمة عملاء متميزة وشحن سريع لضمان وصول طلباتكم بأفضل حالة وفي أسرع وقت.
            </p>
            <p>
              في [ Magou Group ]، هدفنا ليس فقط بيع المنتجات، بل بناء علاقة طويلة الأمد مع عملائنا من خلال المصداقية، والالتزام، وتقديم تجربة تسوق تستحق ثقتكم.
            </p>
            <p>
              كل ما تبحث عنه... ستجده هنا. 🛍️✨
            </p>
          </div>
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
            أن نصبح الوجهة الأولى للتسوق الإلكتروني، من خلال توفير تجربة تسوق متكاملة تجمع بين تنوع المنتجات، وجودتها، وأسعارها التنافسية، مع الالتزام بتقديم أفضل خدمة ممكنة لضمان رضا عملائنا.
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
