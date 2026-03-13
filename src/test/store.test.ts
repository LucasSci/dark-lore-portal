import { describe, expect, it } from "vitest";
import {
  formatStoreDate,
  formatStorePrice,
  isOwnedProduct,
  productTypeLabels,
} from "@/lib/store";

describe("store helpers", () => {
  it("formats BRL prices for the storefront", () => {
    expect(formatStorePrice(3990, "brl")).toContain("39,90");
  });

  it("formats purchase dates in pt-BR style", () => {
    expect(formatStoreDate("2026-03-12T12:00:00.000Z")).toContain("2026");
  });

  it("detects when a product already belongs to the user library", () => {
    expect(
      isOwnedProduct(
        [
          {
            id: "order-1",
            productId: "product-1",
            paymentStatus: "paid",
            purchasedAt: "2026-03-12T12:00:00.000Z",
            downloadCount: 1,
            lastDownloadedAt: null,
            amountTotal: 1990,
            currency: "brl",
            product: {
              id: "product-1",
              slug: "atlas",
              title: "Atlas",
              short_description: null,
              description: null,
              product_type: "mapa",
              price_cents: 1990,
              currency: "brl",
              cover_url: null,
              format_details: "ZIP",
              download_size_label: "12 mapas",
              file_bucket: "digital-products",
              file_path: "maps/atlas.zip",
              download_file_name: "atlas.zip",
              preview_points: [],
              tags: [],
              is_active: true,
              is_featured: false,
              sort_order: 1,
            },
          },
        ],
        "product-1",
      ),
    ).toBe(true);
  });

  it("keeps product labels aligned with the storefront categories", () => {
    expect(productTypeLabels.livro_pdf).toBe("Livros PDF");
    expect(productTypeLabels.classe).toBe("Classes");
  });
});
