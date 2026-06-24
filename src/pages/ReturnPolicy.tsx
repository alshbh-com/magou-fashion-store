import { Card } from "@/components/ui/card";
import { RefreshCw, ShieldCheck, Clock, AlertCircle } from "lucide-react";

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-center mb-2 text-gradient-gold">
        سياسة الاستبدال والاسترجاع
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Magou Group تضمن لك تجربة تسوق آمنة وموثوقة
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 space-y-3 border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">مدة الاسترجاع</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            يحق للعميل استرجاع أو استبدال المنتج خلال <span className="font-bold text-primary">14 يوم</span> من
            تاريخ الاستلام.
          </p>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">شروط الاسترجاع</h2>
          </div>
          <ul className="text-muted-foreground leading-relaxed list-disc pr-5 space-y-1">
            <li>المنتج بحالته الأصلية بدون استخدام.</li>
            <li>الاحتفاظ بالتغليف والملصقات الأصلية.</li>
            <li>وجود إيصال الشراء أو رقم الطلب.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">خطوات الاستبدال</h2>
          </div>
          <ol className="text-muted-foreground leading-relaxed list-decimal pr-5 space-y-1">
            <li>تواصل مع خدمة العملاء.</li>
            <li>اذكر رقم الطلب وسبب الاستبدال.</li>
            <li>سيتم تحديد موعد لاستلام المنتج.</li>
            <li>يتم إرسال البديل خلال 3-5 أيام عمل.</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-3 border-2 border-destructive/30">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">منتجات غير قابلة للاسترجاع</h2>
          </div>
          <ul className="text-muted-foreground leading-relaxed list-disc pr-5 space-y-1">
            <li>المنتجات التي تم استخدامها أو تلفها.</li>
            <li>الملابس الداخلية والإكسسوارات الشخصية.</li>
            <li>المنتجات بعد مرور 14 يوم من الاستلام.</li>
          </ul>
        </Card>
      </div>

      <Card className="p-6 bg-muted/50">
        <p className="text-center text-muted-foreground">
          لأي استفسار، تواصل مع خدمة عملاء <span className="font-bold text-foreground">Magou Group</span> على
          الأرقام الموجودة في الأسفل.
        </p>
      </Card>
    </div>
  );
};

export default ReturnPolicy;
