import { supabase } from "@/integrations/supabase/client";
import type { StorefrontData } from "@/lib/store";

async function invokeFunction<T>(name: string, body?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(name, body ? { body } : undefined);

  if (error) {
    throw new Error(error.message);
  }

  return data as T;
}

export function fetchStorefrontData() {
  return invokeFunction<StorefrontData>("storefront-data");
}

export function createStoreCheckout(productId: string) {
  return invokeFunction<{ url: string | null; sessionId: string }>(
    "create-store-checkout",
    { productId },
  );
}

export function confirmStorePurchase(sessionId: string) {
  return invokeFunction<{
    orderId: string;
    downloadUrl: string | null;
  }>("confirm-store-purchase", { sessionId });
}

export function createDownloadLink(productId: string) {
  return invokeFunction<{ downloadUrl: string; fileName: string }>(
    "create-download-link",
    { productId },
  );
}
