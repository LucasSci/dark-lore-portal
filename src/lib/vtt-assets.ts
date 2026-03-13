import type { AssetManifest } from "@/lib/virtual-tabletop";

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

export function createAssetManifestDraft(file: {
  name: string;
  type: string;
}): AssetManifest {
  const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeName = sanitizeFileName(file.name);

  return {
    assetId,
    kind: "map",
    mimeType: file.type,
    original: `original/${assetId}/${safeName}`,
    variants: {
      board_variant: `variants/${assetId}/board-${safeName}`,
      thumb_variant: `variants/${assetId}/thumb-${safeName}`,
      zoom_variant: `variants/${assetId}/zoom-${safeName}`,
    },
    gridMetadata: {
      columns: 12,
      rows: 8,
      gridSize: 72,
      offsetX: 0,
      offsetY: 0,
    },
    pageCount: file.type === "application/pdf" ? 0 : 1,
    processingStatus: file.type === "application/pdf" ? "processing" : "pending",
  };
}

export function selectBestAssetVariant(manifest: AssetManifest, zoomScale: number) {
  if (zoomScale >= 1.3 && manifest.variants.zoom_variant) {
    return manifest.variants.zoom_variant;
  }

  if (zoomScale <= 0.75 && manifest.variants.thumb_variant) {
    return manifest.variants.thumb_variant;
  }

  return manifest.variants.board_variant ?? manifest.original;
}
