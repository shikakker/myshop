const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const sitePackage = JSON.parse(fs.readFileSync(path.join(root, 'site/package.json'), 'utf8'));
const tsconfig = JSON.parse(fs.readFileSync(path.join(root, 'site/tsconfig.json'), 'utf8'));
const nextConfig = fs.readFileSync(path.join(root, 'site/next.config.js'), 'utf8');
const commerceConfig = fs.readFileSync(path.join(root, 'site/commerce-config.js'), 'utf8');
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

if (JSON.stringify(rootPackage.workspaces) !== JSON.stringify(['site'])) {
  failures.push('production install must contain only the deployable site workspace');
}

const providerDependencies = Object.keys(sitePackage.dependencies || {}).filter((name) =>
  name === '@vercel/commerce' || name.startsWith('@vercel/commerce-')
);
if (providerDependencies.length > 0) {
  failures.push('site must compile the local commerce source directly instead of installing legacy workspace packages');
}

const paths = tsconfig.compilerOptions?.paths || {};
if (paths['@vercel/commerce']?.[0] !== '../packages/commerce/src') {
  failures.push('tsconfig must alias @vercel/commerce to the maintained in-repo source');
}
if (paths['@vercel/commerce/*']?.[0] !== '../packages/commerce/src/*') {
  failures.push('tsconfig must alias @vercel/commerce/* to the maintained in-repo source');
}

if (!commerceConfig.includes("../packages/commerce/src/config.cjs")) {
  failures.push('commerce config must load core configuration from source without a built workspace package');
}
if (!commerceConfig.includes("../packages/local/src/next.config.cjs")) {
  failures.push('commerce config must load the local provider Next config from source without a built workspace package');
}

for (const header of [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
]) {
  if (!nextConfig.includes(header)) {
    failures.push(`site/next.config.js must configure ${header}`);
  }
}

if (failures.length) {
  console.error('Runtime dependency contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Runtime dependency contract verified.');
