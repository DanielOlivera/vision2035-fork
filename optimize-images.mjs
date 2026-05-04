import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const sharp = require('./web/node_modules/sharp');

const INPUT_DIR = 'sources/img';
const OUTPUT_DIR = 'web/public/img/optimized';

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function optimizeImages() {
  try {
    const files = await getFiles(INPUT_DIR);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];

    console.log(`Buscando imágenes en ${INPUT_DIR}...`);

    for (const file of files) {
      const ext = path.extname(file);
      if (!imageExtensions.includes(ext.toLowerCase())) continue;

      const relativePath = path.relative(INPUT_DIR, file);
      // Reemplazar extensión original (sin importar mayúsculas/minúsculas) por .webp
      const outputFileName = path.basename(file).replace(new RegExp(`${ext.replace('.', '\\.')}$`, 'i'), '.webp');
      const outputRelativePath = path.join(path.dirname(relativePath), outputFileName);
      const outputFilePath = path.join(OUTPUT_DIR, outputRelativePath);
      const outputDir = path.dirname(outputFilePath);

      await fs.mkdir(outputDir, { recursive: true });

      console.log(`Procesando: ${relativePath} -> ${path.relative(process.cwd(), outputFilePath)}`);

      try {
        await sharp(file)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(outputFilePath);
      } catch (err) {
        console.error(`Error procesando ${file}:`, err.message);
      }
    }

    console.log('¡Optimización completada!');
  } catch (error) {
    console.error('Error general:', error);
  }
}

optimizeImages();
