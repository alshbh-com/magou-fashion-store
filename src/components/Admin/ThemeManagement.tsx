import { useState } from "react";
import { Check, Palette, Moon, Sun, Gift, Heart, Leaf, Snowflake, GraduationCap, ShoppingBag, Star, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const themeIcons: Record<string, React.ReactNode> = {
  "default": <Palette className="h-6 w-6" />,
  "ramadan": <Moon className="h-6 w-6" />,
  "eid-fitr": <Gift className="h-6 w-6" />,
  "eid-adha": <Star className="h-6 w-6" />,
  "national-day": <Flag className="h-6 w-6" />,
  "mothers-day": <Heart className="h-6 w-6" />,
  "valentines": <Heart className="h-6 w-6" />,
  "sham-nessim": <Leaf className="h-6 w-6" />,
  "back-school": <GraduationCap className="h-6 w-6" />,
  "winter": <Snowflake className="h-6 w-6" />,
  "summer-sale": <Sun className="h-6 w-6" />,
  "black-friday": <ShoppingBag className="h-6 w-6" />,
};

const ThemeManagement = () => {
  const { themes, activeTheme, setActiveTheme, loading } = useTheme();
  const [applying, setApplying] = useState<string | null>(null);

  const handleApplyTheme = async (themeId: string) => {
    setApplying(themeId);
    try {
      await setActiveTheme(themeId);
      toast.success("تم تطبيق الثيم بنجاح!");
    } catch (error) {
      toast.error("حدث خطأ أثناء تطبيق الثيم");
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>جاري تحميل الثيمات...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          إدارة الثيمات والمناسبات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            اختر الثيم المناسب للمناسبة الحالية. الثيم النشط حاليًا: <span className="font-bold text-primary">{activeTheme?.name_ar || "غير محدد"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                theme.is_active
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Theme Preview */}
              <div
                className="h-24 relative"
                style={{
                  background: `linear-gradient(135deg, hsl(${theme.primary_color}) 0%, hsl(${theme.accent_color}) 100%)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    {themeIcons[theme.slug] || <Palette className="h-6 w-6 text-white" />}
                  </div>
                </div>
                {theme.is_active && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-4" style={{ backgroundColor: `hsl(${theme.card_color})` }}>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: `hsl(${theme.foreground_color})` }}
                >
                  {theme.name_ar}
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: `hsl(${theme.foreground_color})`, opacity: 0.7 }}
                >
                  {theme.name}
                </p>

                {/* Color Preview */}
                <div className="flex gap-1 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${theme.primary_color})` }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${theme.secondary_color})` }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${theme.accent_color})` }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${theme.background_color})` }}
                    title="Background"
                  />
                </div>

                <Button
                  onClick={() => handleApplyTheme(theme.id)}
                  disabled={theme.is_active || applying === theme.id}
                  className="w-full"
                  variant={theme.is_active ? "secondary" : "default"}
                >
                  {applying === theme.id ? (
                    "جاري التطبيق..."
                  ) : theme.is_active ? (
                    <>
                      <Check className="h-4 w-4 ml-2" />
                      مُفعّل
                    </>
                  ) : (
                    "تطبيق الثيم"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeManagement;
