export type DigitalProductType =
  | "livro_pdf"
  | "mapa"
  | "token"
  | "aventura"
  | "classe"
  | "item";

export interface StoreProduct {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  product_type: DigitalProductType;
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
  created_at?: string;
  updated_at?: string;
}

export interface LibraryItem {
  id: string;
  productId: string;
  paymentStatus: string;
  purchasedAt: string | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  amountTotal: number;
  currency: string;
  product: StoreProduct;
}

export interface StorefrontData {
  products: StoreProduct[];
  library: LibraryItem[];
  summary: {
    ownedCount: number;
    totalSpentCents: number;
  };
  viewer: {
    isAuthenticated: boolean;
    email: string | null;
  };
}

export const productTypeLabels: Record<DigitalProductType, string> = {
  livro_pdf: "Livros PDF",
  mapa: "Mapas",
  token: "Tokens",
  aventura: "Aventuras",
  classe: "Classes",
  item: "Itens",
};

export function formatStorePrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);
}

export function formatStoreDate(value: string | null) {
  if (!value) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function isOwnedProduct(library: LibraryItem[], productId: string) {
  return library.some((item) => item.productId === productId);
}
