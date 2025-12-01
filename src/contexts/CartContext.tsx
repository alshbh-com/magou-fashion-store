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
  original_price?: number;
  cartItemId?: string; // Unique identifier for each cart item
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  updateItemOptions: (cartItemId: string, newSize?: string, newColorOptions?: string[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate unique cart item ID
const generateCartItemId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all items have cartItemId
      return parsed.map((item: CartItem) => ({
        ...item,
        cartItemId: item.cartItemId || generateCartItemId()
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    try {
      const qty = item.quantity || 1;
      
      // Check for existing item with same specs
      const existing = items.find((i) => 
        i.id === item.id && 
        i.size === item.size &&
        JSON.stringify(i.color_options) === JSON.stringify(item.color_options)
      );
      
      if (existing && existing.cartItemId) {
        // Update quantity for existing item
        await updateQuantity(existing.cartItemId, existing.quantity + qty);
        toast.success(`تم تحديث ${item.name} في السلة`);
        return;
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
      
      // Add new item with unique cartItemId
      const newItem: CartItem = {
        ...item,
        quantity: qty,
        notes,
        original_price: item.original_price || item.price,
        cartItemId: generateCartItemId()
      };
      
      setItems(prev => [...prev, newItem]);
      toast.success(`تم إضافة ${item.name} إلى السلة`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("حدث خطأ أثناء الإضافة للسلة");
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.success("تم حذف المنتج من السلة");
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    // Find the item to get its product id
    const targetItem = items.find(i => i.cartItemId === cartItemId);
    if (!targetItem) return;
    
    // Fetch product and offers to recalculate price based on quantity
    try {
      const [offersRes, productRes] = await Promise.all([
        supabase
          .from("product_offers")
          .select("*")
          .eq("product_id", targetItem.id)
          .order("min_quantity", { ascending: true }),
        supabase
          .from("products")
          .select("price")
          .eq("id", targetItem.id)
          .single()
      ]);
      
      setItems((prev) =>
        prev.map((item) => {
          if (item.cartItemId === cartItemId) {
            // Get base price (original price before any offers)
            const basePrice = item.original_price || productRes.data?.price || item.price;
            
            let unitPrice = basePrice;
            
            // Find applicable offer based on quantity
            if (offersRes.data && offersRes.data.length > 0) {
              const applicableOffer = offersRes.data
                .filter(o => quantity >= o.min_quantity && (!o.max_quantity || quantity <= o.max_quantity))
                .sort((a, b) => b.min_quantity - a.min_quantity)[0];
              
              if (applicableOffer) {
                // offer_price is a discount amount to subtract from total
                const subtotal = basePrice * quantity;
                const finalTotal = subtotal - applicableOffer.offer_price;
                unitPrice = finalTotal / quantity;
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
          if (item.cartItemId === cartItemId) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const updateItemOptions = (cartItemId: string, newSize?: string, newColorOptions?: string[]) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.cartItemId === cartItemId) {
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
