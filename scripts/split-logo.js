/**
 * Splits the two-tone Kyle Arby lockup into two tightly-cropped alpha masks.
 *
 * Input  : KYLEARBY_LOGO_Asset 1.png  (Kyle Arby #181D27 + Santos #D2D7DF)
 * Output : logo-name.png   — "Kyle Arby" glyphs, white on transparent
 *          logo-santos.png — "Santos"   glyphs, white on transparent
 *
 * The outputs carry shape only (RGB forced to white, original alpha kept), so
 * CSS mask-image can paint them with any theme token.
 */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const SRC = process.argv[2];
const OUTDIR = process.argv[3];

// ---------- decode ----------
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a png");
  let pos = 8;
  let width = 0, height = 0, depth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("interlaced png unsupported");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (depth !== 8) throw new Error("bit depth " + depth + " unsupported");
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error("colour type " + colorType + " unsupported");

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);

  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      switch (filter) {
        case 0: break;
        case 1: v = v + a; break;
        case 2: v = v + b; break;
        case 3: v = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error("bad filter " + filter);
      }
      cur[i] = v & 0xff;
    }
  }

  // normalise to RGBA
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    let r, g, b, a;
    if (channels === 4) { r = out[i*4]; g = out[i*4+1]; b = out[i*4+2]; a = out[i*4+3]; }
    else if (channels === 3) { r = out[i*3]; g = out[i*3+1]; b = out[i*3+2]; a = 255; }
    else if (channels === 2) { r = g = b = out[i*2]; a = out[i*2+1]; }
    else { r = g = b = out[i]; a = 255; }
    rgba[i*4] = r; rgba[i*4+1] = g; rgba[i*4+2] = b; rgba[i*4+3] = a;
  }
  return { width, height, rgba };
}

// ---------- encode ----------
function crc32(buf) {
  let c, table = crc32.t;
  if (!table) {
    table = crc32.t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- split ----------
const img = decodePNG(fs.readFileSync(SRC));
const { width, height, rgba } = img;

const DARK = [0x18, 0x1d, 0x27];
const PALE = [0xd2, 0xd7, 0xdf];
const d2 = (r,g,b,ref) => (r-ref[0])**2 + (g-ref[1])**2 + (b-ref[2])**2;

const groups = {
  name:   { px: [], minX: 1e9, maxX: -1, minY: 1e9, maxY: -1 },
  santos: { px: [], minX: 1e9, maxX: -1, minY: 1e9, maxY: -1 },
};

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const a = rgba[i + 3];
    if (a < 8) continue;
    const r = rgba[i], g = rgba[i+1], b = rgba[i+2];
    const key = d2(r,g,b,DARK) <= d2(r,g,b,PALE) ? "name" : "santos";
    const G = groups[key];
    G.px.push([x, y, a]);
    if (x < G.minX) G.minX = x; if (x > G.maxX) G.maxX = x;
    if (y < G.minY) G.minY = y; if (y > G.maxY) G.maxY = y;
  }
}

const report = {};
for (const [key, G] of Object.entries(groups)) {
  if (G.maxX < 0) { report[key] = "EMPTY"; continue; }
  const w = G.maxX - G.minX + 1;
  const h = G.maxY - G.minY + 1;
  const out = Buffer.alloc(w * h * 4); // transparent
  for (const [x, y, a] of G.px) {
    const o = ((y - G.minY) * w + (x - G.minX)) * 4;
    out[o] = 255; out[o+1] = 255; out[o+2] = 255; out[o+3] = a;
  }
  const file = path.join(OUTDIR, key === "name" ? "logo-name.png" : "logo-santos.png");
  fs.writeFileSync(file, encodePNG(w, h, out));
  report[key] = { file: path.basename(file), box: { x: [G.minX, G.maxX], y: [G.minY, G.maxY] }, size: [w, h], pixels: G.px.length, aspect: +(w / h).toFixed(4) };
}

console.log(JSON.stringify({ source: { width, height }, ...report }, null, 1));
