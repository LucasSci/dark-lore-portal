import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createStripeCheckoutSession } from "../_shared/stripe.ts";
import { getProductById } from "../_shared/store.ts";
import { createUserClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const supabase = createUserClient(req);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const body = await req.json();
    const productId = String(body?.productId ?? "");

    if (!productId) {
      return jsonResponse({ error: "Missing productId." }, 400);
    }

    const product = await getProductById(supabase, productId, { activeOnly: true });

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("store_orders")
      .select("id")
      .eq("product_id", product.id)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (existingOrderError) {
      throw new Error(existingOrderError.message);
    }

    if (existingOrder) {
      return jsonResponse(
        {
          error: "You already own this digital product.",
          code: "already_owned",
        },
        409,
      );
    }

    const siteUrl =
      Deno.env.get("SITE_URL") ??
      req.headers.get("origin") ??
      "http://localhost:5173";

    const session = await createStripeCheckoutSession(
      product,
      { id: user.id, email: user.email ?? null },
      siteUrl,
    );

    return jsonResponse({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown checkout error.",
      },
      500,
    );
  }
});
