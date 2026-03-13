import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  createSignedProductUrl,
  getProductById,
  incrementDownloadCount,
} from "../_shared/store.ts";
import { createAdminClient, createUserClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const userClient = createUserClient(req);
    const { data: authData } = await userClient.auth.getUser();
    const user = authData.user;

    if (!user) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const body = await req.json();
    const productId = String(body?.productId ?? "");

    if (!productId) {
      return jsonResponse({ error: "Missing productId." }, 400);
    }

    const { data: order, error: orderError } = await userClient
      .from("store_orders")
      .select("id, download_count")
      .eq("product_id", productId)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (orderError) {
      throw new Error(orderError.message);
    }

    if (!order) {
      return jsonResponse({ error: "You do not own this product yet." }, 403);
    }

    const adminClient = createAdminClient();
    const product = await getProductById(adminClient, productId);
    const downloadUrl = await createSignedProductUrl(adminClient, product);
    await incrementDownloadCount(adminClient, order.id, order.download_count ?? 0);

    return jsonResponse({
      downloadUrl,
      fileName: product.download_file_name,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown download error.",
      },
      500,
    );
  }
});
