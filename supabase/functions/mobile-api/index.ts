import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

function getSupabaseClient(authHeader?: string | null) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Public client (for unauthenticated requests)
  const publicClient = createClient(url, anonKey);

  // If auth header provided, create authenticated client
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    return { publicClient, authClient, serviceClient: createClient(url, serviceKey) };
  }

  return { publicClient, authClient: null, serviceClient: createClient(url, serviceKey) };
}

async function getAuthUser(authHeader: string | null) {
  if (!authHeader) return null;
  const { authClient } = getSupabaseClient(authHeader);
  if (!authClient) return null;
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ==================== ROUTES ====================

// --- PRODUCTS ---
async function handleProducts(req: Request, pathParts: string[], searchParams: URLSearchParams) {
  const { publicClient } = getSupabaseClient();

  // GET /products/:id - Product details
  if (req.method === "GET" && pathParts[2]) {
    const productId = pathParts[2];

    const [productRes, colorsRes, sizesRes, imagesRes, offersRes] = await Promise.all([
      publicClient.from("products").select("*, categories(id, name, name_ar, slug)").eq("id", productId).single(),
      publicClient.from("product_colors").select("*").eq("product_id", productId),
      publicClient.from("product_sizes").select("*").eq("product_id", productId),
      publicClient.from("product_images").select("*").eq("product_id", productId).order("display_order"),
      publicClient.from("product_offers").select("*").eq("product_id", productId).order("min_quantity"),
    ]);

    if (productRes.error) return errorResponse("Product not found", 404);

    return jsonResponse({
      ...productRes.data,
      colors: colorsRes.data || [],
      sizes: sizesRes.data || [],
      images: imagesRes.data || [],
      offers: offersRes.data || [],
    });
  }

  // GET /products - List products with search & filter
  if (req.method === "GET") {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("category_id");
    const categorySlug = searchParams.get("category_slug");
    const isFeatured = searchParams.get("is_featured");
    const isOffer = searchParams.get("is_offer");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const offset = (page - 1) * limit;

    let query = publicClient
      .from("products")
      .select("*, categories(id, name, name_ar, slug)", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%,description_ar.ilike.%${search}%`);
    }
    if (categoryId) query = query.eq("category_id", categoryId);
    if (categorySlug) {
      // Get category ID from slug first
      const { data: cat } = await publicClient.from("categories").select("id").eq("slug", categorySlug).single();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (isFeatured === "true") query = query.eq("is_featured", true);
    if (isOffer === "true") query = query.eq("is_offer", true);
    if (minPrice) query = query.gte("price", parseFloat(minPrice));
    if (maxPrice) query = query.lte("price", parseFloat(maxPrice));

    const ascending = sortOrder === "asc";
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) return errorResponse(error.message, 500);

    return jsonResponse({
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  }

  return errorResponse("Method not allowed", 405);
}

// --- CATEGORIES ---
async function handleCategories(req: Request, pathParts: string[]) {
  const { publicClient } = getSupabaseClient();

  if (req.method !== "GET") return errorResponse("Method not allowed", 405);

  // GET /categories/:id
  if (pathParts[2]) {
    const { data, error } = await publicClient
      .from("categories")
      .select("*")
      .eq("id", pathParts[2])
      .eq("is_active", true)
      .single();
    if (error) return errorResponse("Category not found", 404);
    return jsonResponse(data);
  }

  // GET /categories
  const { data, error } = await publicClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ categories: data });
}

// --- AUTH ---
async function handleAuth(req: Request, pathParts: string[]) {
  const action = pathParts[2];
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(url, anonKey);
  const authHeader = req.headers.get("Authorization");

  // POST /auth/register
  if (req.method === "POST" && action === "register") {
    const body = await req.json();
    const { email, password, name, phone } = body;

    if (!email || !password) return errorResponse("Email and password are required");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
      },
    });

    if (error) return errorResponse(error.message, 400);

    return jsonResponse({
      message: "Registration successful",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
        phone,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
    }, 201);
  }

  // POST /auth/login
  if (req.method === "POST" && action === "login") {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) return errorResponse("Email and password are required");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return errorResponse(error.message, 401);

    return jsonResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        phone: data.user.user_metadata?.phone,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  }

  // POST /auth/refresh
  if (req.method === "POST" && action === "refresh") {
    const body = await req.json();
    const { refresh_token } = body;

    if (!refresh_token) return errorResponse("Refresh token is required");

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return errorResponse(error.message, 401);

    return jsonResponse({
      session: {
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
        expires_at: data.session!.expires_at,
      },
    });
  }

  // GET /auth/profile
  if (req.method === "GET" && action === "profile") {
    const user = await getAuthUser(authHeader);
    if (!user) return errorResponse("Unauthorized", 401);

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      phone: user.user_metadata?.phone,
      created_at: user.created_at,
    });
  }

  // PUT /auth/profile
  if (req.method === "PUT" && action === "profile") {
    const user = await getAuthUser(authHeader);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { name, phone } = body;

    const { authClient } = getSupabaseClient(authHeader);
    const { data, error } = await authClient!.auth.updateUser({
      data: { name, phone },
    });

    if (error) return errorResponse(error.message, 400);

    return jsonResponse({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      phone: data.user.user_metadata?.phone,
    });
  }

  // POST /auth/logout
  if (req.method === "POST" && action === "logout") {
    const user = await getAuthUser(authHeader);
    if (!user) return errorResponse("Unauthorized", 401);

    const { authClient } = getSupabaseClient(authHeader);
    await authClient!.auth.signOut();

    return jsonResponse({ message: "Logged out successfully" });
  }

  return errorResponse("Not found", 404);
}

// --- CART ---
async function handleCart(req: Request, pathParts: string[], authHeader: string | null) {
  const user = await getAuthUser(authHeader);
  if (!user) return errorResponse("Unauthorized", 401);

  const { authClient } = getSupabaseClient(authHeader);
  if (!authClient) return errorResponse("Unauthorized", 401);

  // Helper: get or create cart
  async function getOrCreateCart() {
    const { data: existing } = await authClient!
      .from("carts")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (existing) return existing;

    const { data: newCart, error } = await authClient!
      .from("carts")
      .insert({ user_id: user!.id })
      .select()
      .single();

    if (error) throw error;
    return newCart;
  }

  // GET /cart - Get user's cart with items
  if (req.method === "GET" && !pathParts[2]) {
    const cart = await getOrCreateCart();

    const { data: items, error } = await authClient
      .from("cart_items")
      .select("*, products(id, name, name_ar, price, offer_price, is_offer, image_url)")
      .eq("cart_id", cart.id);

    if (error) return errorResponse(error.message, 500);

    const cartItems = (items || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      color_name: item.color_name,
      size_name: item.size_name,
      notes: item.notes,
      product: item.products,
    }));

    const total = cartItems.reduce((sum: number, item: any) => {
      const price = item.product?.is_offer && item.product?.offer_price
        ? item.product.offer_price
        : item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    return jsonResponse({
      cart_id: cart.id,
      items: cartItems,
      items_count: cartItems.length,
      total,
    });
  }

  // POST /cart/add - Add item to cart
  if (req.method === "POST" && pathParts[2] === "add") {
    const body = await req.json();
    const { product_id, quantity = 1, color_name, size_name, notes } = body;

    if (!product_id) return errorResponse("product_id is required");

    const cart = await getOrCreateCart();

    // Check if item already exists in cart (same product + color + size)
    const { data: existingItem } = await authClient
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .eq("color_name", color_name || "")
      .eq("size_name", size_name || "")
      .maybeSingle();

    if (existingItem) {
      const { data, error } = await authClient
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ message: "Cart item updated", item: data });
    }

    const { data, error } = await authClient
      .from("cart_items")
      .insert({
        cart_id: cart.id,
        product_id,
        quantity,
        color_name: color_name || null,
        size_name: size_name || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) return errorResponse(error.message, 500);
    return jsonResponse({ message: "Item added to cart", item: data }, 201);
  }

  // PUT /cart/:item_id - Update cart item quantity
  if (req.method === "PUT" && pathParts[2]) {
    const itemId = pathParts[2];
    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) return errorResponse("Valid quantity is required");

    const { data, error } = await authClient
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .select()
      .single();

    if (error) return errorResponse("Cart item not found", 404);
    return jsonResponse({ message: "Cart item updated", item: data });
  }

  // DELETE /cart/:item_id - Remove item from cart
  if (req.method === "DELETE" && pathParts[2] && pathParts[2] !== "clear") {
    const itemId = pathParts[2];

    const { error } = await authClient
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) return errorResponse("Cart item not found", 404);
    return jsonResponse({ message: "Item removed from cart" });
  }

  // DELETE /cart/clear - Clear entire cart
  if (req.method === "DELETE" && pathParts[2] === "clear") {
    const cart = await getOrCreateCart();

    const { error } = await authClient
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (error) return errorResponse(error.message, 500);
    return jsonResponse({ message: "Cart cleared" });
  }

  return errorResponse("Not found", 404);
}

// --- ORDERS ---
async function handleOrders(req: Request, pathParts: string[], authHeader: string | null) {
  const user = await getAuthUser(authHeader);
  if (!user) return errorResponse("Unauthorized", 401);

  const { authClient, serviceClient } = getSupabaseClient(authHeader);
  if (!authClient) return errorResponse("Unauthorized", 401);

  // GET /orders - List user's orders
  if (req.method === "GET" && !pathParts[2]) {
    const { data, error } = await authClient
      .from("orders")
      .select("*")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message, 500);
    return jsonResponse({ orders: data });
  }

  // GET /orders/:id - Order details with items
  if (req.method === "GET" && pathParts[2]) {
    const orderId = pathParts[2];

    const { data: order, error } = await authClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("customer_email", user.email)
      .single();

    if (error) return errorResponse("Order not found", 404);

    const { data: items } = await authClient
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    return jsonResponse({ ...order, items: items || [] });
  }

  // POST /orders - Create new order (Cash on Delivery)
  if (req.method === "POST") {
    const body = await req.json();
    const { name, phone, phone2, address, governorate_id, notes, items } = body;

    if (!name || !phone || !address || !governorate_id) {
      return errorResponse("name, phone, address, and governorate_id are required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Order must contain at least one item");
    }

    // Validate phone
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("01")) {
      return errorResponse("Phone must be 11 digits starting with 01");
    }

    // Get governorate
    const { data: gov, error: govError } = await authClient
      .from("governorates")
      .select("*")
      .eq("id", governorate_id)
      .single();

    if (govError || !gov) return errorResponse("Invalid governorate_id", 400);

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await authClient
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single();

      if (!product) return errorResponse(`Product ${item.product_id} not found`, 404);

      const price = product.is_offer && product.offer_price
        ? product.offer_price
        : product.price;

      subtotal += price * (item.quantity || 1);

      orderItems.push({
        product_id: item.product_id,
        product_name: product.name_ar || product.name,
        quantity: item.quantity || 1,
        price,
        color_name: item.color_name || null,
        size_name: item.size_name || null,
      });
    }

    const shippingCost = gov.shipping_cost;
    const total = subtotal + shippingCost;

    // Create or get customer
    let customerId = null;
    const { data: existingCustomer } = await serviceClient
      .from("customers")
      .select("id")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await serviceClient
        .from("customers")
        .insert({
          name,
          phone: cleanPhone,
          address,
          city: gov.name_ar,
          governorate_id: gov.id,
        })
        .select()
        .single();
      customerId = newCustomer?.id;
    }

    // Create order
    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .insert({
        customer_name: name,
        customer_phone: cleanPhone,
        customer_address: address,
        customer_city: gov.name_ar,
        customer_notes: notes || null,
        customer_email: user.email,
        customer_id: customerId,
        governorate_id: gov.id,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) return errorResponse(orderError.message, 500);

    // Create order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await serviceClient.from("order_items").insert(orderItemsWithOrderId);

    // Update stock
    for (const item of items) {
      const { data: product } = await serviceClient
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newStock = Math.max(0, product.stock_quantity - (item.quantity || 1));
        await serviceClient
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);
      }
    }

    // Clear user's cart after order
    const { data: cart } = await authClient
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cart) {
      await authClient.from("cart_items").delete().eq("cart_id", cart.id);
    }

    return jsonResponse({
      message: "Order created successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_method: "cash_on_delivery",
        items: orderItems,
      },
    }, 201);
  }

  return errorResponse("Method not allowed", 405);
}

// --- GOVERNORATES ---
async function handleGovernorates(req: Request) {
  if (req.method !== "GET") return errorResponse("Method not allowed", 405);

  const { publicClient } = getSupabaseClient();
  const { data, error } = await publicClient
    .from("governorates")
    .select("id, name, name_ar, shipping_cost")
    .order("name_ar");

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ governorates: data });
}

// --- BANNERS ---
async function handleBanners(req: Request) {
  if (req.method !== "GET") return errorResponse("Method not allowed", 405);

  const { publicClient } = getSupabaseClient();
  const { data, error } = await publicClient
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ banners: data });
}

// --- PACKAGES ---
async function handlePackages(req: Request, pathParts: string[]) {
  if (req.method !== "GET") return errorResponse("Method not allowed", 405);

  const { publicClient } = getSupabaseClient();

  if (pathParts[2]) {
    const { data, error } = await publicClient
      .from("packages")
      .select("*, package_products(*, products(id, name, name_ar, price, image_url))")
      .eq("id", pathParts[2])
      .single();

    if (error) return errorResponse("Package not found", 404);
    return jsonResponse(data);
  }

  const { data, error } = await publicClient
    .from("packages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ packages: data });
}

// ==================== MAIN HANDLER ====================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // pathParts: ["mobile-api", "products", ...]
    const resource = pathParts[1] || "";
    const authHeader = req.headers.get("Authorization");

    console.log(`[API] ${req.method} /${pathParts.slice(1).join("/")}`);

    switch (resource) {
      case "products":
        return await handleProducts(req, pathParts, url.searchParams);
      case "categories":
        return await handleCategories(req, pathParts);
      case "auth":
        return await handleAuth(req, pathParts);
      case "cart":
        return await handleCart(req, pathParts, authHeader);
      case "orders":
        return await handleOrders(req, pathParts, authHeader);
      case "governorates":
        return await handleGovernorates(req);
      case "banners":
        return await handleBanners(req);
      case "packages":
        return await handlePackages(req, pathParts);
      case "":
        return jsonResponse({
          name: "Magou Fashion Mobile API",
          version: "1.0.0",
          endpoints: [
            "GET /products",
            "GET /products/:id",
            "GET /categories",
            "GET /categories/:id",
            "POST /auth/register",
            "POST /auth/login",
            "POST /auth/refresh",
            "GET /auth/profile",
            "PUT /auth/profile",
            "POST /auth/logout",
            "GET /cart",
            "POST /cart/add",
            "PUT /cart/:item_id",
            "DELETE /cart/:item_id",
            "DELETE /cart/clear",
            "GET /orders",
            "GET /orders/:id",
            "POST /orders",
            "GET /governorates",
            "GET /banners",
            "GET /packages",
            "GET /packages/:id",
          ],
        });
      default:
        return errorResponse("Not found", 404);
    }
  } catch (error) {
    console.error("[API Error]", error);
    return errorResponse("Internal server error", 500);
  }
});
