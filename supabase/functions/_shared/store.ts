import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { StripeCheckoutSession } from "./stripe.ts";

export interface StoreProductRecord {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  product_type: string;
  price_cents: number;
  currency: string;
  cover_url: string | null;
  format_details: string;
  download_size_label: string;
  file_bucket: string;
  file_path: string;
  download_file_name: string;
  preview_points: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export function isStripeSessionPaid(session: StripeCheckoutSession) {
  return session.status === "complete" && (
    session.payment_status === "paid" ||
    (session.amount_total ?? 0) === 0
  );
}

export async function getProductById(
  supabaseClient: SupabaseClient,
  productId: string,
  options?: { activeOnly?: boolean },
) {
  let query = supabaseClient
    .from("digital_products")
    .select("*")
    .eq("id", productId);

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw new Error("Digital product not found.");
  }

  return data as StoreProductRecord;
}

export async function fulfillStripeSession(
  adminClient: SupabaseClient,
  session: StripeCheckoutSession,
) {
  const metadata = session.metadata ?? {};
  const userId = metadata.user_id;
  const productId = metadata.product_id;

  if (!userId || !productId) {
    throw new Error("Checkout session metadata is missing user_id or product_id.");
  }

  const paymentStatus = isStripeSessionPaid(session)
    ? "paid"
    : session.payment_status === "unpaid"
      ? "pending"
      : "failed";

  const { data: existingOrder, error: existingOrderError } = await adminClient
    .from("store_orders")
    .select("id, payment_status, purchased_at")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingOrderError) {
    throw new Error("Unable to inspect existing store order.");
  }

  const resolvedPaymentStatus =
    existingOrder?.payment_status === "paid" ? "paid" : paymentStatus;
  const purchasedAt =
    existingOrder?.payment_status === "paid"
      ? existingOrder.purchased_at
      : resolvedPaymentStatus === "paid"
        ? existingOrder?.purchased_at ?? new Date().toISOString()
        : null;

  const { data, error } = await adminClient
    .from("store_orders")
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        payment_status: resolvedPaymentStatus,
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "brl",
        purchased_at: purchasedAt,
        metadata: {
          checkout_status: session.status,
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email ?? null,
        },
      },
      { onConflict: "user_id,product_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to save store order.");
  }

  return data;
}

export async function createSignedProductUrl(
  adminClient: SupabaseClient,
  product: Pick<StoreProductRecord, "file_bucket" | "file_path" | "download_file_name">,
  expiresInSeconds = 900,
) {
  const { data, error } = await adminClient.storage
    .from(product.file_bucket)
    .createSignedUrl(product.file_path, expiresInSeconds, {
      download: product.download_file_name,
    });

  if (error || !data?.signedUrl) {
    throw new Error("Unable to create signed download link.");
  }

  return data.signedUrl;
}

export async function incrementDownloadCount(
  adminClient: SupabaseClient,
  orderId: string,
  currentDownloadCount: number,
) {
  const { error } = await adminClient
    .from("store_orders")
    .update({
      download_count: currentDownloadCount + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error("Unable to update download count.");
  }
}
