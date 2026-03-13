import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { verifyStripeWebhookSignature, type StripeCheckoutSession } from "../_shared/stripe.ts";
import { fulfillStripeSession } from "../_shared/store.ts";
import { createAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new Error("Missing environment variable: STRIPE_WEBHOOK_SECRET");
    }

    const signatureHeader = req.headers.get("stripe-signature");

    if (!signatureHeader) {
      return jsonResponse({ error: "Missing stripe-signature header." }, 400);
    }

    const payload = await req.text();
    const isValidSignature = await verifyStripeWebhookSignature(
      payload,
      signatureHeader,
      webhookSecret,
    );

    if (!isValidSignature) {
      return jsonResponse({ error: "Invalid webhook signature." }, 400);
    }

    const event = JSON.parse(payload);
    const eventType = String(event?.type ?? "");

    if (
      eventType === "checkout.session.completed" ||
      eventType === "checkout.session.async_payment_succeeded" ||
      eventType === "checkout.session.async_payment_failed"
    ) {
      const session = event?.data?.object as StripeCheckoutSession | undefined;

      if (session) {
        const adminClient = createAdminClient();
        await fulfillStripeSession(adminClient, session);
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown webhook error.",
      },
      500,
    );
  }
});
