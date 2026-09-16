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

if (sitePackage.dependencies?.next !== '15.5.24') {
  failures.push('site must use the patched Next.js 15.5.24 runtime');
}
if (sitePackage.dependencies?.react !== '18.2.0' || sitePackage.dependencies?.['react-dom'] !== '18.2.0') {
  failures.push('site must use React 18.2.0 with the migrated Next runtime');
}
if (sitePackage.dependencies?.['js-cookie'] !== '3.0.7') {
  failures.push('site must use js-cookie 3.0.7 or later patched behavior');
}
if (sitePackage.dependencies?.postcss !== '8.5.28') {
  failures.push('site must use patched PostCSS 8.5.28');
}
if (rootPackage.resolutions?.postcss !== '8.5.28') {
  failures.push('workspace must pin patched PostCSS 8.5.28 across transitive dependencies');
}
if (rootPackage.resolutions?.browserslist !== '4.28.7') {
  failures.push('workspace must pin patched browserslist 4.28.7 across the CSS toolchain');
}
if (rootPackage.resolutions?.braces !== '3.0.3') {
  failures.push('workspace must pin patched braces 3.0.3 across the CSS toolchain');
}
if (rootPackage.resolutions?.picomatch !== '2.3.2') {
  failures.push('workspace must pin patched picomatch 2.3.2 across the CSS toolchain');
}
if (rootPackage.resolutions?.nanoid !== '3.3.18') {
  failures.push('workspace must pin patched nanoid 3.3.18 across the CSS toolchain');
}
if (sitePackage.scripts?.lint?.includes('next lint')) {
  failures.push('Next 15 migration must not rely on the removed next lint command');
}

if (sitePackage.dependencies?.['postcss-nesting']) {
  failures.push('site must not directly install legacy postcss-nesting; postcss-preset-env owns the compatible nesting plugin');
}

if (sitePackage.dependencies?.['@vercel/fetch']) {
  failures.push('site must use the Node 22 platform fetch instead of the obsolete @vercel/fetch wrapper');
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

if (commerceConfig.includes("require('@vercel/commerce/config')")) {
  failures.push('commerce config must not require the legacy built @vercel/commerce package');
}
if (!commerceConfig.includes("../packages/local/src/next.config.cjs")) {
  failures.push('commerce config must load the local provider Next config from source without a built workspace package');
}
if (!commerceConfig.includes("'@vercel/commerce': path.resolve(__dirname, '../packages/commerce/src')")) {
  failures.push('webpack must alias @vercel/commerce to the in-repo core source');
}
if (!commerceConfig.includes('delete config.commerce')) {
  failures.push('commerce config must strip the internal custom commerce key before Next.js validates next.config');
}
if (!commerceConfig.includes('String(Boolean(value))')) {
  failures.push('commerce feature flags exposed through next.config env must be strings, not booleans');
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
