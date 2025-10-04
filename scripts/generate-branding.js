/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function createPng(width, height, colorFn) {
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) << 2;
      const { r, g, b, a } = colorFn(x, y, width, height);
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return png;
}

function writePng(png, filepath) {
  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(filepath);
    outStream.on("finish", resolve);
    outStream.on("error", reject);
    png.pack().pipe(outStream);
  });
}

async function createFavicon() {
  const size = 180;
  const center = size / 2;
  const base = hexToRgb("#0f172a");
  const cyan = hexToRgb("#38bdf8");
  const violet = hexToRgb("#a855f7");

  const png = createPng(size, size, (x, y, width, height) => {
    const dx = (x - center) / center;
    const dy = (y - center) / center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.max(0, 1 - dist);

    const blend = lerp(0, 1, glow * 0.9);
    const mixCyan = {
      r: Math.round(lerp(base.r, cyan.r, blend)),
      g: Math.round(lerp(base.g, cyan.g, blend)),
      b: Math.round(lerp(base.b, cyan.b, blend)),
    };

    const mixViolet = {
      r: Math.round(lerp(base.r, violet.r, blend * 0.7)),
      g: Math.round(lerp(base.g, violet.g, blend * 0.7)),
      b: Math.round(lerp(base.b, violet.b, blend * 0.7)),
    };

    const diagonal = (x / width + y / height) / 2;
    const weight = diagonal < 0.5 ? diagonal * 2 : (1 - diagonal) * 2;

    const r = Math.round(lerp(mixViolet.r, mixCyan.r, weight));
    const g = Math.round(lerp(mixViolet.g, mixCyan.g, weight));
    const b = Math.round(lerp(mixViolet.b, mixCyan.b, weight));

    const band = Math.abs(((x / width) * 2 - 1) * ((y / height) * 2 - 1));
    const accent = Math.max(0, 1 - band * 3);

    const finalR = Math.round(lerp(r, 255, accent * 0.18));
    const finalG = Math.round(lerp(g, 255, accent * 0.18));
    const finalB = Math.round(lerp(b, 245, accent * 0.12));

    return { r: finalR, g: finalG, b: finalB, a: 255 };
  });

  const markColor = hexToRgb("#f8fafc");
  for (let y = Math.floor(size * 0.35); y < Math.floor(size * 0.7); y += 1) {
    for (let x = Math.floor(size * 0.25); x < Math.floor(size * 0.75); x += 1) {
      const normalizedX = (x - size * 0.25) / (size * 0.5);
      const peak = Math.abs(normalizedX - 0.5) * 2;
      const stroke = peak < 0.75;

      const idx = (size * y + x) << 2;
      if (stroke) {
        png.data[idx] = Math.round(lerp(png.data[idx], markColor.r, 0.85));
        png.data[idx + 1] = Math.round(lerp(png.data[idx + 1], markColor.g, 0.85));
        png.data[idx + 2] = Math.round(lerp(png.data[idx + 2], markColor.b, 0.85));
      }
    }
  }

  const outPath = path.join("public", "apple-touch-icon.png");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await writePng(png, outPath);
}

async function createOgImage() {
  const width = 1200;
  const height = 630;
  const base = hexToRgb("#020617");
  const cyan = hexToRgb("#0ea5e9");
  const violet = hexToRgb("#7c3aed");
  const slate = hexToRgb("#1f2937");

  const png = createPng(width, height, (x, y) => {
    const vertical = y / height;
    const horizontal = x / width;

    const gradientR = lerp(base.r, slate.r, vertical * 0.6);
    const gradientG = lerp(base.g, slate.g, vertical * 0.6);
    const gradientB = lerp(base.b, slate.b, vertical * 0.6);

    const wave = Math.sin(horizontal * Math.PI * 4 + vertical * Math.PI * 2) * 0.15 + 0.25;
    const blend = Math.min(1, Math.max(0, wave));

    const r = Math.round(lerp(gradientR, lerp(violet.r, cyan.r, horizontal), blend * 0.45));
    const g = Math.round(lerp(gradientG, lerp(violet.g, cyan.g, horizontal), blend * 0.45));
    const b = Math.round(lerp(gradientB, lerp(violet.b, cyan.b, horizontal), blend * 0.45));

    return { r, g, b, a: 255 };
  });

  const accent = hexToRgb("#f8fafc");
  const stripeHeight = Math.floor(height * 0.12);
  for (let y = Math.floor(height * 0.35); y < Math.floor(height * 0.35) + stripeHeight; y += 1) {
    for (let x = Math.floor(width * 0.12); x < Math.floor(width * 0.88); x += 1) {
      const idx = (width * y + x) << 2;
      const t = (x - width * 0.12) / (width * 0.76);
      const glow = Math.sin(t * Math.PI);
      png.data[idx] = Math.round(lerp(png.data[idx], accent.r, glow * 0.4));
      png.data[idx + 1] = Math.round(lerp(png.data[idx + 1], accent.g, glow * 0.4));
      png.data[idx + 2] = Math.round(lerp(png.data[idx + 2], accent.b, glow * 0.4));
    }
  }

  const outPath = path.join("public", "og", "winshell-preview.png");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await writePng(png, outPath);
}

async function main() {
  await Promise.all([createFavicon(), createOgImage()]);
  const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="#38bdf8"/>\n      <stop offset="100%" stop-color="#a855f7"/>\n    </linearGradient>\n    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">\n      <feGaussianBlur stdDeviation="4" result="blur"/>\n      <feMerge>\n        <feMergeNode in="blur"/>\n        <feMergeNode in="SourceGraphic"/>\n      </feMerge>\n    </filter>\n  </defs>\n  <rect width="64" height="64" rx="20" fill="#0f172a"/>\n  <rect width="64" height="64" rx="20" fill="url(#g)" opacity="0.2"/>\n  <path d="M14 18 L22 46 L32 30 L42 46 L50 18" stroke="#f8fafc" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow)"/>\n</svg>`;
  fs.writeFileSync(path.join("public", "favicon.svg"), faviconSvg.trim());
  fs.writeFileSync(path.join("public", "site.webmanifest"), JSON.stringify({
    name: "WinShell",
    short_name: "WinShell",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0f172a",
    description: "WinShell blends CLI precision with GUI fluidity.",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
    ],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
