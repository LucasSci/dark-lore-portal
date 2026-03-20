import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ICONS = process.argv.slice(2);
const DEFAULT_ICONS = [
  "icon_tw3_aceite_005",
  "icon_tw3_alcohol_004",
  "icon_tw3_alquimia_006",
  "icon_tw3_arma_020",
  "icon_tw3_arma_048",
  "icon_tw3_bomba_003",
  "icon_tw3_botas_011",
  "icon_tw3_carta_005",
  "icon_tw3_comida_009",
  "icon_tw3_comida_019",
  "icon_tw3_comida_021",
  "icon_tw3_comida_028",
  "icon_tw3_coraza_014",
  "icon_tw3_guantes_006",
  "icon_tw3_hierba_010",
  "icon_tw3_hierba_016",
  "icon_tw3_hierba_026",
  "icon_tw3_joya_004",
  "icon_tw3_joya_012",
  "icon_tw3_libro_008",
  "icon_tw3_metal_009",
  "icon_tw3_monstruoso_011",
  "icon_tw3_monstruoso_018",
  "icon_tw3_monstruoso_026",
  "icon_tw3_monstruoso_045",
  "icon_tw3_pocion_004",
  "icon_tw3_runa_005",
  "icon_tw3_runa_012",
  "icon_tw3_virote_006",
];

const SOURCE_DIR =
  "C:\\Users\\Lucas\\Downloads\\icones_tw3\\Monti Icon Pack The Witcher 3 v1.0\\Override";
const OUTPUT_DIR = path.resolve(".codex_tmp");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "shop-icon-contact-sheet.png");

function decodeTga(filePath) {
  const buffer = fs.readFileSync(filePath);
  const idLength = buffer.readUInt8(0);
  const colorMapType = buffer.readUInt8(1);
  const imageType = buffer.readUInt8(2);
  const width = buffer.readUInt16LE(12);
  const height = buffer.readUInt16LE(14);
  const pixelDepth = buffer.readUInt8(16);
  const imageDescriptor = buffer.readUInt8(17);

  if (colorMapType !== 0) {
    throw new Error(`Unsupported color map in ${filePath}`);
  }

  if (imageType !== 2) {
    throw new Error(`Unsupported TGA type ${imageType} in ${filePath}`);
  }

  if (pixelDepth !== 24 && pixelDepth !== 32) {
    throw new Error(`Unsupported pixel depth ${pixelDepth} in ${filePath}`);
  }

  const bytesPerPixel = pixelDepth / 8;
  const topOrigin = (imageDescriptor & 0x20) !== 0;
  const pixelsOffset = 18 + idLength;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const sourceY = topOrigin ? y : height - 1 - y;

    for (let x = 0; x < width; x += 1) {
      const sourceIndex = pixelsOffset + (sourceY * width + x) * bytesPerPixel;
      const targetIndex = (y * width + x) * 4;

      rgba[targetIndex] = buffer[sourceIndex + 2];
      rgba[targetIndex + 1] = buffer[sourceIndex + 1];
      rgba[targetIndex + 2] = buffer[sourceIndex];
      rgba[targetIndex + 3] = bytesPerPixel === 4 ? buffer[sourceIndex + 3] : 255;
    }
  }

  return { width, height, rgba };
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function fillRect(target, canvasWidth, x, y, width, height, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      const index = (row * canvasWidth + col) * 4;
      target[index] = color[0];
      target[index + 1] = color[1];
      target[index + 2] = color[2];
      target[index + 3] = color[3];
    }
  }
}

function drawScaledIcon(target, canvasWidth, icon, offsetX, offsetY, scale) {
  for (let y = 0; y < icon.height; y += 1) {
    for (let x = 0; x < icon.width; x += 1) {
      const sourceIndex = (y * icon.width + x) * 4;
      const pixel = [
        icon.rgba[sourceIndex],
        icon.rgba[sourceIndex + 1],
        icon.rgba[sourceIndex + 2],
        icon.rgba[sourceIndex + 3],
      ];

      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const targetIndex =
            ((offsetY + y * scale + dy) * canvasWidth + (offsetX + x * scale + dx)) * 4;
          target[targetIndex] = pixel[0];
          target[targetIndex + 1] = pixel[1];
          target[targetIndex + 2] = pixel[2];
          target[targetIndex + 3] = pixel[3];
        }
      }
    }
  }
}

const icons = ICONS.length ? ICONS : DEFAULT_ICONS;
const columns = 5;
const cellSize = 112;
const iconScale = 2;
const padding = 16;
const rows = Math.ceil(icons.length / columns);
const canvasWidth = columns * cellSize;
const canvasHeight = rows * cellSize;
const canvas = Buffer.alloc(canvasWidth * canvasHeight * 4);

fillRect(canvas, canvasWidth, 0, 0, canvasWidth, canvasHeight, [26, 20, 16, 255]);

icons.forEach((iconName, index) => {
  const icon = decodeTga(path.join(SOURCE_DIR, `${iconName}.tga`));
  const column = index % columns;
  const row = Math.floor(index / columns);
  const cellX = column * cellSize;
  const cellY = row * cellSize;

  fillRect(canvas, canvasWidth, cellX + 8, cellY + 8, cellSize - 16, cellSize - 16, [52, 39, 30, 255]);
  drawScaledIcon(canvas, canvasWidth, icon, cellX + padding, cellY + padding, iconScale);
});

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, encodePng(canvasWidth, canvasHeight, canvas));
console.log(OUTPUT_FILE);
