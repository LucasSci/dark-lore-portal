const STRIPE_API_BASE = "https://api.stripe.com/v1";
const encoder = new TextEncoder();

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  status: string | null;
  payment_status: string | null;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
  payment_intent: string | null;
  customer_details?: {
    email?: string | null;
  } | null;
}

interface CheckoutProductInput {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  product_type: string;
  price_cents: number;
  currency: string;
  cover_url: string | null;
}

interface CheckoutUserInput {
  id: string;
  email: string | null;
}

function getStripeSecretKey() {
  const secret = Deno.env.get("STRIPE_SECRET_KEY");

  if (!secret) {
    throw new Error("Missing environment variable: STRIPE_SECRET_KEY");
  }

  return secret;
}

async function stripeRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...init?.headers,
    },
  });

  const payloadText = await response.text();
  const payload = payloadText ? JSON.parse(payloadText) : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Stripe request failed.");
  }

  return payload as T;
}

export async function createStripeCheckoutSession(
  product: CheckoutProductInput,
  user: CheckoutUserInput,
  siteUrl: string,
) {
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("success_url", `${siteUrl}/loja?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl}/loja?checkout=cancelled`);
  params.set("allow_promotion_codes", "true");
  params.set("client_reference_id", user.id);
  params.set("metadata[user_id]", user.id);
  params.set("metadata[product_id]", product.id);
  params.set("metadata[product_slug]", product.slug);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", product.currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(product.price_cents));
  params.set("line_items[0][price_data][product_data][name]", product.title);
  params.set("line_items[0][price_data][product_data][metadata][product_id]", product.id);
  params.set("line_items[0][price_data][product_data][metadata][product_slug]", product.slug);
  params.set("line_items[0][price_data][product_data][metadata][product_type]", product.product_type);

  if (product.short_description) {
    params.set(
      "line_items[0][price_data][product_data][description]",
      product.short_description,
    );
  }

  if (product.cover_url?.startsWith("http")) {
    params.set("line_items[0][price_data][product_data][images][0]", product.cover_url);
  }

  if (user.email) {
    params.set("customer_email", user.email);
  }

  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function computeHmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
) {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const expectedSignatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || !expectedSignatures.length) {
    return false;
  }

  const toleranceSeconds = 300;
  const parsedTimestamp = Number(timestamp);

  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  if (Math.abs(Date.now() / 1000 - parsedTimestamp) > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = await computeHmac(webhookSecret, signedPayload);

  return expectedSignatures.some((signature) => safeEqual(signature, computedSignature));
}
