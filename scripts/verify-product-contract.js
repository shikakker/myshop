const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const seo = read('site/config/seo_meta.json');
const home = read('site/pages/index.tsx');
const cart = read('site/pages/cart.tsx');
const cartSidebar = read('site/components/cart/CartSidebarView/CartSidebarView.tsx');
const footer = read('site/components/common/Footer/Footer.tsx');
const nextConfig = read('site/next.config.js');
const localCatalog = read('packages/local/src/data.json');
const orders = read('site/pages/orders.tsx');
const profile = read('site/pages/profile.tsx');
const wishlist = read('site/pages/wishlist.tsx');

for (const [label, source] of [
  ['SEO', seo],
  ['home', home],
  ['footer', footer],
  ['orders', orders],
  ['wishlist', wishlist],
]) {
  if (/ACME Storefront|\bACME\b|Dessert dragée|Cupcake ipsum|Biscuit oat cake/i.test(source)) {
    failures.push(`${label} still exposes upstream/demo placeholder identity or lorem copy`);
  }
}

if (/nextjs\.org\/commerce/.test(seo)) {
  failures.push('SEO must not claim the upstream Next.js Commerce site as this storefront URL');
}

if (!/NEXT_PUBLIC_COMMERCE_PROVIDER/.test(nextConfig)) {
  failures.push('Next config must expose the selected provider as a read-only public build-time value');
}

for (const [label, source] of [
  ['cart', cart],
  ['cart sidebar', cartSidebar],
]) {
  if (!/isCommerceDemo/.test(source)) {
    failures.push(`${label} must explicitly guard checkout for the local demo provider`);
  }
}

for (const [label, source] of [
  ['orders', orders],
  ['profile', profile],
]) {
  if (!/COMMERCE_CUSTOMERAUTH_ENABLED/.test(source) || !/notFound:\s*true/.test(source)) {
    failures.push(`${label} must fail closed when customer authentication is disabled`);
  }
}

if (/"vendor"\s*:\s*"Next\.js"|Next\.js Conf|limited edition|All proceeds will be donated/i.test(localCatalog)) {
  failures.push('local catalog must not expose upstream event, scarcity, charity, or vendor claims as current product data');
}

if (!/This item is not offered for real purchase/.test(localCatalog)) {
  failures.push('local catalog descriptions must state that sample inventory is not offered for real purchase');
}

if (failures.length) {
  console.error('Product honesty contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Product honesty contract verified.');
