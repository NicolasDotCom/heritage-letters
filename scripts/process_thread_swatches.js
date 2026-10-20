const fs = require('fs');
const path = require('path');
const sharp = require('c:/laragon/www/letterscolombia-main/tools/fundas/node_modules/sharp');

const inputDir = 'C:/Users/Nico/Pictures/letterscolombia/HILOS LETTERS COLOMBIA';
const outputDir = path.join(__dirname, '..', 'assets');

async function processAll() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  console.log(`Processing ${files.length} thread swatch images...`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    // Normalize filename: replace ñ with n
    const cleanName = file.replace(/ñ/g, 'n');
    const outputPath = path.join(outputDir, cleanName);

    await sharp(inputPath)
      .resize(80, 80, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`Generated: ${cleanName}`);
  }

  console.log('Done processing all 32 swatches!');
}

processAll().catch(err => {
  console.error('Error processing swatches:', err);
  process.exit(1);
});
