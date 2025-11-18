import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

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
  size_options?: string[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
  updateItemOptions: (id: string, color?: string, size?: string, newColor?: string, newSize?: string) => void;
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
      const existing = prev.find((i) => 
        i.id === item.id && 
        i.color === item.color && 
        i.size === item.size
      );
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    toast.success(`تم إضافة ${item.name} إلى السلة`);
  };

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((item) => 
      !(item.id === id && item.color === color && item.size === size)
    ));
    toast.success("تم حذف المنتج من السلة");
  };

  const updateQuantity = (id: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) => 
        (item.id === id && item.color === color && item.size === size) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const updateItemOptions = (id: string, color?: string, size?: string, newColor?: string, newSize?: string) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id && item.color === color && item.size === size) {
          const finalColor = newColor !== undefined ? newColor : item.color;
          const finalSize = newSize !== undefined ? newSize : item.size;
          
          let notes = "";
          if (finalColor && finalSize) {
            notes = `اللون ${finalColor} والمقاس ${finalSize}`;
          } else if (finalColor) {
            notes = `اللون ${finalColor}`;
          } else if (finalSize) {
            notes = `المقاس ${finalSize}`;
          }
          
          return { 
            ...item, 
            color: finalColor, 
            size: finalSize,
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
