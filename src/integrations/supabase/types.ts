export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          title: string | null
          title_ar: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          title?: string | null
          title_ar?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          title?: string | null
          title_ar?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string | null
          color_name: string | null
          created_at: string | null
          id: string
          price: number | null
          product_id: string | null
          quantity: number | null
          size_name: string | null
        }
        Insert: {
          cart_id?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          size_name?: string | null
        }
        Update: {
          cart_id?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          size_name?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          name: string | null
          name_ar: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          name_ar?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          name_ar?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          governorate_id: string | null
          id: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          governorate_id?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          governorate_id?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      governorates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          name_ar: string | null
          shipping_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          name_ar?: string | null
          shipping_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          name_ar?: string | null
          shipping_cost?: number | null
        }
        Relationships: []
      }
      order: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_city: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_notes: string | null
          customer_phone: number | null
          discount: number | null
          governorate_id: string | null
          id: string | null
          order_number: number | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: number | null
          discount?: number | null
          governorate_id?: string | null
          id?: string | null
          order_number?: number | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: number | null
          discount?: number | null
          governorate_id?: string | null
          id?: string | null
          order_number?: number | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color_name: string | null
          created_at: string | null
          id: string | null
          order_id: string | null
          price: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          size_name: string | null
        }
        Insert: {
          color_name?: string | null
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          size_name?: string | null
        }
        Update: {
          color_name?: string | null
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          size_name?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_city: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          discount: number | null
          governorate_id: string | null
          id: string
          order_number: number
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          discount?: number | null
          governorate_id?: string | null
          id?: string
          order_number?: number
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          discount?: number | null
          governorate_id?: string | null
          id?: string
          order_number?: number
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_products: {
        Row: {
          created_at: string | null
          id: string
          package_id: string | null
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          package_id?: string | null
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          package_id?: string | null
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string | null
          image_url: string | null
          name: string | null
          name_ar: string | null
          price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          name_ar?: string | null
          price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          name_ar?: string | null
          price?: number | null
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_code: string | null
          color_name: string | null
          color_name_ar: string | null
          created_at: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          color_code?: string | null
          color_name?: string | null
          color_name_ar?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          color_code?: string | null
          color_name?: string | null
          color_name_ar?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          product_id?: string | null
        }
        Relationships: []
      }
      product_offers: {
        Row: {
          created_at: string | null
          free_shipping: boolean | null
          id: string
          max_quantity: number | null
          min_quantity: number | null
          offer_price: number | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          free_shipping?: boolean | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          offer_price?: number | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          free_shipping?: boolean | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          offer_price?: number | null
          product_id?: string | null
        }
        Relationships: []
      }
      product_sizes: {
        Row: {
          created_at: string | null
          id: string
          price: number | null
          product_id: string | null
          size_name: string | null
          stock_quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string | null
          size_name?: string | null
          stock_quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string | null
          size_name?: string | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          details: string | null
          free_shipping: boolean | null
          id: string
          image_url: string | null
          image_url_2: string | null
          image_url_3: string | null
          is_featured: boolean | null
          is_offer: boolean | null
          name: string | null
          name_ar: string | null
          offer_price: number | null
          price: number | null
          show_in_new_arrivals: boolean | null
          show_in_offers: boolean | null
          size_pricing: Json | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          details?: string | null
          free_shipping?: boolean | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          name?: string | null
          name_ar?: string | null
          offer_price?: number | null
          price?: number | null
          show_in_new_arrivals?: boolean | null
          show_in_offers?: boolean | null
          size_pricing?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          details?: string | null
          free_shipping?: boolean | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          name?: string | null
          name_ar?: string | null
          offer_price?: number | null
          price?: number | null
          show_in_new_arrivals?: boolean | null
          show_in_offers?: boolean | null
          size_pricing?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          product_id: string | null
          rating: number | null
          source: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          source?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          source?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          accent_color: string | null
          background_color: string | null
          border_color: string | null
          card_color: string | null
          created_at: string | null
          decoration_url: string | null
          foreground_color: string | null
          id: string
          is_active: boolean | null
          muted_color: string | null
          name: string | null
          name_ar: string | null
          primary_color: string | null
          primary_foreground: string | null
          secondary_color: string | null
          slug: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          border_color?: string | null
          card_color?: string | null
          created_at?: string | null
          decoration_url?: string | null
          foreground_color?: string | null
          id?: string
          is_active?: boolean | null
          muted_color?: string | null
          name?: string | null
          name_ar?: string | null
          primary_color?: string | null
          primary_foreground?: string | null
          secondary_color?: string | null
          slug?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          border_color?: string | null
          card_color?: string | null
          created_at?: string | null
          decoration_url?: string | null
          foreground_color?: string | null
          id?: string
          is_active?: boolean | null
          muted_color?: string | null
          name?: string | null
          name_ar?: string | null
          primary_color?: string | null
          primary_foreground?: string | null
          secondary_color?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
