import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createUserClient(req);

    const [{ data: products, error: productsError }, { data: authData }] = await Promise.all([
      supabase
        .from("digital_products")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.auth.getUser(),
    ]);

    if (productsError) {
      throw new Error(productsError.message);
    }

    const user = authData.user;

    if (!user) {
      return jsonResponse({
        products: products ?? [],
        library: [],
        summary: {
          ownedCount: 0,
          totalSpentCents: 0,
        },
        viewer: {
          isAuthenticated: false,
          email: null,
        },
      });
    }

    const { data: libraryRows, error: libraryError } = await supabase
      .from("store_orders")
      .select(
        "id, product_id, payment_status, purchased_at, download_count, last_downloaded_at, amount_total, currency, product:digital_products(*)",
      )
      .eq("payment_status", "paid")
      .order("purchased_at", { ascending: false });

    if (libraryError) {
      throw new Error(libraryError.message);
    }

    const library = (libraryRows ?? []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      paymentStatus: row.payment_status,
      purchasedAt: row.purchased_at,
      downloadCount: row.download_count,
      lastDownloadedAt: row.last_downloaded_at,
      amountTotal: row.amount_total,
      currency: row.currency,
      product: row.product,
    }));

    return jsonResponse({
      products: products ?? [],
      library,
      summary: {
        ownedCount: library.length,
        totalSpentCents: library.reduce((sum, item) => sum + (item.amountTotal ?? 0), 0),
      },
      viewer: {
        isAuthenticated: true,
        email: user.email ?? null,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown storefront error.",
      },
      500,
    );
  }
});
