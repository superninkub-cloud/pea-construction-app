const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images/materials');
const outputFile = path.join(__dirname, '../lib/materialImages.json');

function generateManifest() {
  if (!fs.existsSync(imagesDir)) {
    console.log('Images directory does not exist yet. Creating empty manifest.');
    fs.writeFileSync(outputFile, JSON.stringify({}, null, 2));
    return;
  }

  const files = fs.readdirSync(imagesDir);
  const manifest = {};
  
  let count = 0;
  for (const file of files) {
    // Only process common image formats
    if (/\.(png|jpe?g|webp|gif)$/i.test(file)) {
      const code = path.basename(file, path.extname(file));
      manifest[code] = `/images/materials/${file}`;
      count++;
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest with ${count} images.`);
}

generateManifest();
