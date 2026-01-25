import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Theme {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  is_active: boolean;
  primary_color: string;
  primary_foreground: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  card_color: string;
  muted_color: string;
  border_color: string;
  decoration_url?: string;
}

interface ThemeContextType {
  activeTheme: Theme | null;
  themes: Theme[];
  loading: boolean;
  setActiveTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveThemeState] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("name_ar");

      if (error) throw error;

      const typedThemes = (data || []) as Theme[];
      setThemes(typedThemes);
      
      const active = typedThemes.find((t) => t.is_active);
      if (active) {
        setActiveThemeState(active);
        applyTheme(active);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    root.style.setProperty("--primary", theme.primary_color);
    root.style.setProperty("--primary-foreground", theme.primary_foreground);
    root.style.setProperty("--secondary", theme.secondary_color);
    root.style.setProperty("--accent", theme.accent_color);
    root.style.setProperty("--background", theme.background_color);
    root.style.setProperty("--foreground", theme.foreground_color);
    root.style.setProperty("--card", theme.card_color);
    root.style.setProperty("--card-foreground", theme.foreground_color);
    root.style.setProperty("--popover", theme.card_color);
    root.style.setProperty("--popover-foreground", theme.foreground_color);
    root.style.setProperty("--muted", theme.muted_color);
    root.style.setProperty("--muted-foreground", `${theme.foreground_color.split(' ')[0]} ${theme.foreground_color.split(' ')[1] || '0%'} 45%`);
    root.style.setProperty("--border", theme.border_color);
    root.style.setProperty("--input", theme.border_color);
    root.style.setProperty("--ring", theme.primary_color);
  };

  const setActiveTheme = async (themeId: string) => {
    try {
      // Deactivate all themes
      await supabase
        .from("themes")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Activate selected theme
      await supabase
        .from("themes")
        .update({ is_active: true })
        .eq("id", themeId);

      const theme = themes.find((t) => t.id === themeId);
      if (theme) {
        setActiveThemeState({ ...theme, is_active: true });
        applyTheme(theme);
      }

      await fetchThemes();
    } catch (error) {
      console.error("Error setting active theme:", error);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        themes,
        loading,
        setActiveTheme,
        refreshThemes: fetchThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
