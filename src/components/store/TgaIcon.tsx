import { useEffect, useState } from "react";

const tgaUrlCache = new Map<string, string>();

interface DecodedTga {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function decodeTga(buffer: ArrayBuffer): DecodedTga {
  const view = new DataView(buffer);
  const idLength = view.getUint8(0);
  const colorMapType = view.getUint8(1);
  const imageType = view.getUint8(2);
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  const pixelDepth = view.getUint8(16);
  const imageDescriptor = view.getUint8(17);

  if (colorMapType !== 0) {
    throw new Error("Color-mapped TGA is not supported.");
  }

  if (imageType !== 2) {
    throw new Error(`Unsupported TGA image type: ${imageType}`);
  }

  if (pixelDepth !== 24 && pixelDepth !== 32) {
    throw new Error(`Unsupported TGA pixel depth: ${pixelDepth}`);
  }

  const bytesPerPixel = pixelDepth / 8;
  const pixelsOffset = 18 + idLength;
  const topOrigin = (imageDescriptor & 0x20) !== 0;
  const source = new Uint8Array(buffer, pixelsOffset);
  const rgba = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const sourceY = topOrigin ? y : height - 1 - y;

    for (let x = 0; x < width; x += 1) {
      const sourceIndex = (sourceY * width + x) * bytesPerPixel;
      const targetIndex = (y * width + x) * 4;

      rgba[targetIndex] = source[sourceIndex + 2];
      rgba[targetIndex + 1] = source[sourceIndex + 1];
      rgba[targetIndex + 2] = source[sourceIndex];
      rgba[targetIndex + 3] = bytesPerPixel === 4 ? source[sourceIndex + 3] : 255;
    }
  }

  return { width, height, data: rgba };
}

async function createTgaDataUrl(src: string, scale: number, renderSize?: number) {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}`);
  }

  const { width, height, data } = decodeTga(await response.arrayBuffer());
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to create 2D context for TGA rendering.");
  }

  context.putImageData(new ImageData(data, width, height), 0, 0);

  if (renderSize) {
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = renderSize;
    scaledCanvas.height = renderSize;
    const scaledContext = scaledCanvas.getContext("2d");

    if (!scaledContext) {
      throw new Error("Failed to create scaled 2D context for TGA rendering.");
    }

    scaledContext.imageSmoothingEnabled = false;
    scaledContext.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    return scaledCanvas.toDataURL("image/png");
  }

  if (scale <= 1) {
    return canvas.toDataURL("image/png");
  }

  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = width * scale;
  scaledCanvas.height = height * scale;
  const scaledContext = scaledCanvas.getContext("2d");

  if (!scaledContext) {
    throw new Error("Failed to create scaled 2D context for TGA rendering.");
  }

  scaledContext.imageSmoothingEnabled = false;
  scaledContext.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
  return scaledCanvas.toDataURL("image/png");
}

export function TgaIcon({
  src,
  alt,
  className,
  scale = 1,
  renderSize,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  scale?: number;
  renderSize?: number;
  onError?: () => void;
}) {
  const cacheKey = `${src}::${scale}::${renderSize ?? "auto"}`;
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => tgaUrlCache.get(cacheKey) ?? null);

  useEffect(() => {
    let cancelled = false;

    if (tgaUrlCache.has(cacheKey)) {
      setResolvedSrc(tgaUrlCache.get(cacheKey) ?? null);
      return () => {
        cancelled = true;
      };
    }

    void createTgaDataUrl(src, scale, renderSize)
      .then((nextSrc) => {
        if (cancelled) {
          return;
        }

        tgaUrlCache.set(cacheKey, nextSrc);
        setResolvedSrc(nextSrc);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setResolvedSrc(null);
        onError?.();
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, onError, renderSize, scale, src]);

  if (!resolvedSrc) {
    return null;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      draggable={false}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
