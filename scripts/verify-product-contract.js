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

for (const [label, source] of [
  ['SEO', seo],
  ['home', home],
  ['footer', footer],
]) {
  if (/ACME Storefront|\bACME\b|Dessert dragée|Cupcake ipsum/.test(source)) {
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

if (failures.length) {
  console.error('Product honesty contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Product honesty contract verified.');
