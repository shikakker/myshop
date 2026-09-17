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
const navbar = read('site/components/common/Navbar/Navbar.tsx');
const productCard = read('site/components/product/ProductCard/ProductCard.tsx');
const hero = read('site/components/ui/Hero/Hero.tsx');
const search = read('site/components/search.tsx');
const searchbar = read('site/components/common/Searchbar/Searchbar.tsx');
const localSearch = read('packages/local/src/product/use-search.tsx');
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

const localSearchRequirements = [
  ['use the local catalog instead of returning a permanently empty result', /data\.json/],
  ['normalize local image alt text for ProductCard', /altText/],
  ['filter products by the search term', /includes\(normalizedSearch\)/],
  ['support low-to-high price sorting', /price-asc/],
  ['support high-to-low price sorting', /price-desc/],
  ['return an explicit found state', /found:\s*products\.length\s*>\s*0/],
];
for (const [label, pattern] of localSearchRequirements) {
  if (!pattern.test(localSearch)) failures.push(`local search must ${label}`);
}

const searchExperienceRequirements = [
  ['offer price refinements', /PRICE_FILTERS/],
  ['offer a clear-refinements action', /clearRefinements/],
  ['persist a grid-density preference', /myshop:grid-density/],
  ['remember recent search queries locally', /myshop:recent-searches/],
  ['offer a share/copy-search action', /copySearchLink/],
  ['announce result changes accessibly', /aria-live="polite"/],
  ['expose loading state to assistive technology', /aria-busy=/],
  ['render active refinement chips', /activeRefinements/],
  ['support compact and comfortable product grids', /gridDensity/],
  ['provide a recovery action for empty refined results', /Clear refinements/],
];
for (const [label, pattern] of searchExperienceRequirements) {
  if (!pattern.test(search)) failures.push(`search experience must ${label}`);
}

if (!/aria-label="Search products"/.test(searchbar)) {
  failures.push('search input must expose a durable accessible name without relying on a visually hidden label implementation');
}

const legacyNestedLink = /<Link\b[\s\S]{0,300}?>\s*<a\b/;
for (const [label, source] of [
  ['navbar', navbar],
  ['product card', productCard],
  ['footer', footer],
  ['hero', hero],
  ['search filters', search],
]) {
  if (legacyNestedLink.test(source)) {
    failures.push(`${label} must not render a nested anchor through legacy Next Link markup`);
  }
}

if (failures.length) {
  console.error('Product honesty contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Product honesty contract verified.');
