import { supabase } from "@/integrations/supabase/client";
import type { AssetManifest } from "@/lib/virtual-tabletop";

type UntypedSupabaseClient = typeof supabase & {
  from: (table: string) => any;
};

const db = supabase as UntypedSupabaseClient;

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

function ensureImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem valida para usar como battlemap.");
  }
}

export function createAssetManifestDraft(file: {
  name: string;
  type: string;
}): AssetManifest {
  let assetId: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    assetId = `asset-${crypto.randomUUID()}`;
  } else {
    assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
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

export async function readImageDimensions(file: File) {
  ensureImageFile(file);

  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nao foi possivel ler a imagem do battlemap."));
    };

    image.src = objectUrl;
  });
}

export function recommendBattlemapGrid(
  dimensions: { width: number; height: number },
  preferredColumns: number,
) {
  const columns = Math.max(4, Math.round(preferredColumns));
  const rows = Math.max(4, Math.round((dimensions.height / dimensions.width) * columns));

  return {
    columns,
    rows,
  };
}

export function resolveBattlemapPublicUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (/^(https?:|blob:|data:)/.test(path)) {
    return path;
  }

  return supabase.storage.from("battlemaps").getPublicUrl(path).data.publicUrl;
}

export async function uploadBattlemapAsset(options: {
  file: File;
  sessionId: string;
  pageId: string;
  columns: number;
  rows: number;
  gridSize: number;
}) {
  ensureImageFile(options.file);

  const manifest = createAssetManifestDraft(options.file);
  manifest.gridMetadata = {
    columns: options.columns,
    rows: options.rows,
    gridSize: options.gridSize,
    offsetX: 0,
    offsetY: 0,
  };
  manifest.processingStatus = "ready";
  manifest.pageCount = 1;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      assetId: null,
      assetUrl: URL.createObjectURL(options.file),
      manifest,
      persisted: false,
    };
  }

  const fileName = sanitizeFileName(options.file.name);
  const storagePath = `${user.id}/${options.sessionId}/${Date.now()}-${fileName}`;

  const uploadResult = await supabase.storage
    .from("battlemaps")
    .upload(storagePath, options.file, {
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadResult.error) {
    return {
      assetId: null,
      assetUrl: URL.createObjectURL(options.file),
      manifest,
      persisted: false,
    };
  }

  const { data: assetRow, error: assetError } = await db
    .from("vtt_page_assets")
    .insert({
      session_id: options.sessionId,
      page_id: options.pageId,
      kind: "map",
      mime_type: options.file.type,
      original_path: storagePath,
      board_variant_path: storagePath,
      thumb_variant_path: storagePath,
      zoom_variant_path: storagePath,
      grid_metadata: manifest.gridMetadata,
      page_count: 1,
      processing_status: "ready",
    })
    .select("*")
    .single();

  if (assetError || !assetRow?.id) {
    return {
      assetId: null,
      assetUrl: resolveBattlemapPublicUrl(storagePath) ?? URL.createObjectURL(options.file),
      manifest,
      persisted: false,
    };
  }

  return {
    assetId: String(assetRow.id),
    assetUrl: resolveBattlemapPublicUrl(storagePath) ?? URL.createObjectURL(options.file),
    manifest,
    persisted: true,
  };
}
