const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');
  const sourceImage = path.join(publicDir, 'charms', 'chinese-knot.png');

  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found:', sourceImage);
    return;
  }

  // 1. 192x192 icon
  await sharp(sourceImage)
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 15, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. 512x512 icon
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 15, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. 512x512 maskable icon (with 15% safe padding)
  const charmInner = await sharp(sourceImage)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 15, b: 18, alpha: 1 }
    }
  })
    .composite([{ input: charmInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. apple-touch-icon (180x180)
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'contain', background: { r: 15, g: 15, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. favicon.png (32x32)
  await sharp(sourceImage)
    .resize(32, 32, { fit: 'contain', background: { r: 15, g: 15, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');
}

generate().catch(console.error);
