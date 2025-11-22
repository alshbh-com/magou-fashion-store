import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
  color_options?: string[];
  original_price?: number; // السعر الأصلي قبل العروض
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => Promise<void>;
  updateItemOptions: (id: string, color?: string, size?: string, newColor?: string, newSize?: string, newColorOptions?: string[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      // Group by id and size only, not by color
      const existing = prev.find((i) => 
        i.id === item.id && 
        i.size === item.size &&
        JSON.stringify(i.color_options) === JSON.stringify(item.color_options)
      );
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size && JSON.stringify(i.color_options) === JSON.stringify(item.color_options)
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      
      // Build notes from color_options and size
      let notes = "";
      if (item.color_options && item.color_options.length > 0) {
        const colorCounts = item.color_options.reduce((acc, color) => {
          acc[color] = (acc[color] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const colorText = Object.entries(colorCounts)
          .map(([color, count]) => count > 1 ? `${color} (${count})` : color)
          .join(", ");
        notes = `الألوان: ${colorText}`;
      }
      if (item.size) {
        notes += notes ? ` - المقاس: ${item.size}` : `المقاس: ${item.size}`;
      }
      
      return [...prev, { 
        ...item, 
        quantity: item.quantity || 1, 
        notes,
        original_price: item.original_price || item.price
      }];
    });
    toast.success(`تم إضافة ${item.name} إلى السلة`);
  };

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((item) => {
      // Remove item by id and size only (since we group by these)
      if (item.id !== id) return true;
      return item.size !== size;
    }));
    toast.success("تم حذف المنتج من السلة");
  };

  const updateQuantity = async (id: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
      return;
    }
    
    // Fetch product and offers to recalculate price based on quantity
    try {
      const [offersRes, productRes] = await Promise.all([
        supabase
          .from("product_offers")
          .select("*")
          .eq("product_id", id)
          .order("min_quantity", { ascending: true }),
        supabase
          .from("products")
          .select("price")
          .eq("id", id)
          .single()
      ]);
      
      setItems((prev) =>
        prev.map((item) => {
          // Update by id and size only
          if (item.id === id && item.size === size) {
            // Get base price (original price before any offers)
            const basePrice = item.original_price || productRes.data?.price || item.price;
            
            let unitPrice = basePrice;
            
            // Find applicable offer based on quantity
            if (offersRes.data && offersRes.data.length > 0) {
              const applicableOffer = offersRes.data
                .filter(o => quantity >= o.min_quantity && (!o.max_quantity || quantity <= o.max_quantity))
                .sort((a, b) => b.min_quantity - a.min_quantity)[0];
              
              if (applicableOffer) {
                // offer_price is total price for the quantity range, so divide by quantity
                unitPrice = applicableOffer.offer_price / quantity;
              }
            }
            
            return { 
              ...item, 
              quantity, 
              price: unitPrice,
              original_price: basePrice 
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error fetching offers:", error);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const updateItemOptions = (id: string, color?: string, size?: string, newColor?: string, newSize?: string, newColorOptions?: string[]) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id && item.size === size) {
          const finalSize = newSize !== undefined ? newSize : item.size;
          const finalColorOptions = newColorOptions !== undefined ? newColorOptions : item.color_options;
          
          let notes = "";
          if (finalColorOptions && finalColorOptions.length > 0) {
            const colorCounts = finalColorOptions.reduce((acc, color) => {
              acc[color] = (acc[color] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const colorText = Object.entries(colorCounts)
              .map(([color, count]) => count > 1 ? `${color} (${count})` : color)
              .join(", ");
            notes = `الألوان: ${colorText}`;
          }
          if (finalSize) {
            notes += notes ? ` - المقاس: ${finalSize}` : `المقاس: ${finalSize}`;
          }
          
          return { 
            ...item, 
            size: finalSize,
            color_options: finalColorOptions,
            notes
          };
        }
        return item;
      });
      
      // Force update localStorage immediately
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
    
    toast.success("تم تحديث المنتج");
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemOptions,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
