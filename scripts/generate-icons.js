const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Crie uma imagem base 512x512 como ícone principal
// Coloque um arquivo icon-base.png na pasta public com seu logo

async function generateIcons() {
  const sizes = [16, 32, 180, 192, 512];
  const inputPath = path.join(__dirname, '../public/icon-base.png');
  const outputDir = path.join(__dirname, '../public/icons');

  // Cria diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Gerado ícone ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ícone ${size}x${size}:`, error);
    }
  }

  // Cria favicon.ico (formato ICO)
  await sharp(inputPath)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon.ico'));

  console.log('✅ Gerado favicon.ico');

  // Cria versões específicas
  await sharp(inputPath)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));

  await sharp(inputPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));

  await sharp(inputPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  await sharp(inputPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'android-chrome-192x192.png'));

  await sharp(inputPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'android-chrome-512x512.png'));

  console.log('🎉 Todos os ícones gerados com sucesso!');
}

generateIcons();