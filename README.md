# MyShop Commerce Demo

MyShop is a provider-aware commerce storefront derived from the historical `vercel/commerce` monorepo. The current canonical repository is `shikakker/myshop`.

The default configuration is an **honest local demo**: catalog, search, product detail and cart interactions use deterministic sample data, while checkout/order submission is disabled. A real purchase flow is enabled only after a supported commerce provider and its required credentials are configured.

## Product model

```text
catalog / search
      |
 product detail
      |
     cart
      |
      +-- local provider --> demo only, no order submission
      |
      +-- configured provider --> provider checkout capability
```

The UI exposes the selected provider at build time so demo mode cannot accidentally render a live checkout CTA.

## Stack

- Next.js 12 / React 17 legacy commerce architecture
- TypeScript
- Tailwind CSS / PostCSS
- Turborepo + Yarn workspaces
- Multiple `@vercel/commerce-*` provider packages
- Vercel deployment with project root `site`
- Node.js 22 runtime contract

The Next.js 12 architecture is legacy/EOL technical debt and should be upgraded in a dedicated verified migration. This completion batch does not hide that risk by disabling engine or build checks.

## Default behavior

Without external environment variables, `site/commerce-config.js` selects:

```text
@vercel/commerce-local
```

Local mode provides sample products and cart behavior. The sample catalog is labeled `MyShop Demo`; product descriptions explicitly state that items are not offered for real purchase. Taxes/shipping are not represented as real charges, and checkout is disabled.

Customer profile/orders/wishlist routes fail closed when the selected provider does not enable the corresponding feature.

## Supported provider configuration

The inherited provider architecture can select supported adapters such as BigCommerce, Shopify, Swell, Saleor, Vendure, Spree, OrderCloud, Kibo, Commerce.js and others included in the monorepo.

Copy the example file:

```bash
cp site/.env.example site/.env.local
```

Set only the provider and credentials you actually use. Never commit real credentials. `site/.env.example` contains blank placeholders only.

A provider integration is not considered production-ready merely because its adapter package exists: checkout, auth, orders and provider-specific API behavior still require current credentials and runtime verification.

## Local development

Requirements:

- Node.js 22.x
- Yarn 1.x (`packageManager: yarn@1.22.17`)

Install from the monorepo root:

```bash
yarn install --frozen-lockfile
```

Run development mode from the root so workspace provider packages build/watch correctly:

```bash
yarn dev
```

## Verification

Run from the monorepo root:

```bash
yarn test
yarn types
yarn workspace next-commerce lint
yarn build
```

`yarn test` currently checks two critical repository contracts:

- runtime dependency contract — root/site Node 22 pins and removal of the obsolete Node-16-only direct `postcss-nesting@8` dependency;
- product honesty contract — no upstream ACME/lorem identity, explicit provider mode, demo-checkout guards, fail-closed account routes and neutral sample catalog claims.

GitHub Actions runs frozen install → contracts → TypeScript → site lint → production build.

## Deployment

Canonical Vercel project: `myshop` (`prj_dmh1zVvAphPJAlJtKgzAlxvOANKY`) with project root `site`.

The historical production/preview deployment is reachable and proves the inherited storefront can render, but it still contains the old ACME/Next.js Commerce identity and must not be used as evidence for the current branch.

The current product-completion branch is `ai/product-completion/myshop`. At the current checkpoint, new Vercel previews are being rejected **before build** by the account's Hobby build-rate limit. This is tracked in `PRODUCT_COMPLETION_STATUS.md`; no current-head Vercel/build PASS is claimed until execution resumes.

## Security and trust constraints

- No provider credentials are committed.
- Local mode cannot submit an order.
- Disabled auth/account features fail closed instead of showing empty fake account surfaces.
- Sample catalog data does not repeat old limited-edition, event, scarcity or charity claims from the upstream starter.
- Provider-specific checkout must be verified with current credentials before production use.
- The framework generation is legacy; dependency/security upgrade work remains a release concern until a verified Next.js migration is completed.

## Provenance

This project is adapted from Vercel's historical Next.js Commerce repository:

`https://github.com/vercel/commerce`

That provenance is intentionally retained. MyShop does not claim the inherited commerce architecture was authored from scratch.

## Status

See `PRODUCT_COMPLETION_STATUS.md` for the 10 core tasks, 10 improvements, 10 feature decisions, verification evidence, blockers and next action.
