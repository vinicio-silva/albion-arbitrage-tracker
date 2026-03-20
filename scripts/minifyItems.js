import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const inFile = path.join(rootDir, 'items.json');
const outDir = path.join(rootDir, 'public');
const outFile = path.join(outDir, 'items-min.json');

try {
  console.log("Reading items.json...");
  const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  
  console.log("Minifying data...");
  const minified = data.map(item => {
    let label = item.UniqueName;
    if (item.LocalizedNames && item.LocalizedNames['EN-US']) {
      label = item.LocalizedNames['EN-US'];
    }
    return {
      value: item.UniqueName,
      label
    };
  });

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(minified));
  console.log(`Successfully minified ${data.length} items to public/items-min.json`);
} catch (err) {
  console.error("Failed to minify items:", err);
  process.exit(1);
}
