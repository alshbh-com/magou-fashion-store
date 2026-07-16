// TikTok Pixel event helpers. The pixel snippet is loaded in index.html.

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

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
};

export const trackAddToCart = (c: Content & { value?: number }) => {
  track("AddToCart", {
    contents: [{ ...c, content_type: c.content_type ?? "product", quantity: c.quantity ?? 1 }],
    value: c.value ?? (c.price ?? 0) * (c.quantity ?? 1),
    currency: "EGP",
  });
};

export const trackInitiateCheckout = (contents: Content[], value: number) => {
  track("InitiateCheckout", {
    contents: contents.map((c) => ({ ...c, content_type: c.content_type ?? "product" })),
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
};
