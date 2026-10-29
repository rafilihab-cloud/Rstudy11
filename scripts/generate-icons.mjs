import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  // 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  // 512x512 standard icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  // 180x180 Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // 512x512 Maskable icon with 10% safe zone padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 30, g: 58, b: 138, alpha: 1 } // #1e3a8a
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  // 64x64 favicon.ico (png format inside ico or 64x64 png fallback)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  console.log('PWA icons generated successfully.');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
