import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { retrieveStripeCheckoutSession } from "../_shared/stripe.ts";
import {
  createSignedProductUrl,
  fulfillStripeSession,
  getProductById,
  incrementDownloadCount,
  isStripeSessionPaid,
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
    const sessionId = String(body?.sessionId ?? "");

    if (!sessionId) {
      return jsonResponse({ error: "Missing sessionId." }, 400);
    }

    const session = await retrieveStripeCheckoutSession(sessionId);

    if (session.metadata?.user_id !== user.id) {
      return jsonResponse({ error: "Purchase does not belong to this user." }, 403);
    }

    const adminClient = createAdminClient();
    const order = await fulfillStripeSession(adminClient, session);

    if (!isStripeSessionPaid(session)) {
      return jsonResponse(
        {
          error: "Checkout session is not paid yet.",
          order,
        },
        409,
      );
    }

    const product = await getProductById(adminClient, session.metadata?.product_id ?? "");
    const downloadUrl = await createSignedProductUrl(adminClient, product);
    await incrementDownloadCount(adminClient, order.id, order.download_count ?? 0);

    return jsonResponse({
      orderId: order.id,
      product,
      downloadUrl,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown purchase confirmation error.",
      },
      500,
    );
  }
});
