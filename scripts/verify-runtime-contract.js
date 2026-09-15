const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const sitePackage = JSON.parse(fs.readFileSync(path.join(root, 'site/package.json'), 'utf8'));
const failures = [];

if (rootPackage.engines?.node !== '22.x') {
  failures.push('root package.json must pin engines.node to 22.x');
}

if (sitePackage.engines?.node !== '22.x') {
  failures.push('site/package.json must pin engines.node to 22.x');
}

if (sitePackage.dependencies?.['postcss-nesting']) {
  failures.push('site must not directly install legacy postcss-nesting; postcss-preset-env owns the compatible nesting plugin');
}

if (failures.length) {
  console.error('Runtime dependency contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Runtime dependency contract verified.');
