// TikTok Pixel event helpers. The pixel snippet is loaded in index.html.

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
    fbq?: (...args: unknown[]) => void;
  }
}

const fbTrack = (event: string, params?: Record<string, unknown>) => {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      if (params) window.fbq("track", event, params);
      else window.fbq("track", event);
    }
  } catch (err) {
    console.error("Meta pixel error:", err);
  }
};


type Content = {
  content_id: string;
  content_name?: string;
  content_type?: "product";
  quantity?: number;
  price?: number;
};

const track = (event: string, params?: Record<string, unknown>) => {
  try {
    if (typeof window !== "undefined" && window.ttq?.track) {
      window.ttq.track(event, params);
    }
  } catch (err) {
    console.error("TikTok pixel error:", err);
  }
};

export const trackViewContent = (c: Content & { value?: number }) => {
  track("ViewContent", {
    contents: [{ ...c, content_type: c.content_type ?? "product", quantity: c.quantity ?? 1 }],
    value: c.value ?? c.price ?? 0,
    currency: "EGP",
  });
  fbTrack("ViewContent", {
    content_ids: [c.content_id],
    content_name: c.content_name,
    content_type: "product",
    value: c.value ?? c.price ?? 0,
    currency: "EGP",
  });
};

export const trackAddToCart = (c: Content & { value?: number }) => {
  const value = c.value ?? (c.price ?? 0) * (c.quantity ?? 1);
  track("AddToCart", {
    contents: [{ ...c, content_type: c.content_type ?? "product", quantity: c.quantity ?? 1 }],
    value,
    currency: "EGP",
  });
  fbTrack("AddToCart", {
    content_ids: [c.content_id],
    content_name: c.content_name,
    content_type: "product",
    value,
    currency: "EGP",
  });
};

export const trackInitiateCheckout = (contents: Content[], value: number) => {
  track("InitiateCheckout", {
    contents: contents.map((c) => ({ ...c, content_type: c.content_type ?? "product" })),
    value,
    currency: "EGP",
  });
  fbTrack("InitiateCheckout", {
    content_ids: contents.map((c) => c.content_id),
    contents: contents.map((c) => ({ id: c.content_id, quantity: c.quantity ?? 1 })),
    content_type: "product",
    value,
    currency: "EGP",
  });
};

export const trackPurchase = (contents: Content[], value: number) => {
  track("CompletePayment", {
    contents: contents.map((c) => ({ ...c, content_type: c.content_type ?? "product" })),
    value,
    currency: "EGP",
  });
  // Also fire Purchase for compatibility
  track("Purchase", {
    contents: contents.map((c) => ({ ...c, content_type: c.content_type ?? "product" })),
    value,
    currency: "EGP",
  });
  fbTrack("Purchase", {
    content_ids: contents.map((c) => c.content_id),
    contents: contents.map((c) => ({ id: c.content_id, quantity: c.quantity ?? 1 })),
    content_type: "product",
    value,
    currency: "EGP",
  });
};

