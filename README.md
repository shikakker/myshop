# MyShop Commerce Demo

MyShop is a provider-aware commerce storefront derived from Vercel's historical `vercel/commerce` architecture. The canonical repository is `shikakker/myshop`.

The default configuration is an **honest local demo**: deterministic sample catalog data powers browsing, search, product detail and cart interactions, while real checkout/order submission stays disabled until a supported external commerce provider and valid credentials are configured.

## What works in the local demo

- browse the in-repo sample catalog and product details;
- search product name, vendor and description;
- sort by latest and price;
- refine search by category, designer and price band;
- see active refinements and clear them in one action;
- switch between comfortable and compact result grids, with the preference stored locally;
- keep up to five recent searches locally and clear that history;
- copy/share the current search URL;
- use cart interactions without presenting the sample cart as a real order flow;
- fail closed on provider-dependent customer surfaces when the selected provider does not support them.

The sample inventory explicitly states that it is not offered for real purchase. No production inventory, scarcity, charity, tax, shipping or order claims are inferred from the demo data.

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
      +-- configured provider --> provider-specific checkout capability
```

The selected provider is exposed to the UI as a read-only build-time value so local demo mode cannot accidentally present a live checkout path.

## Stack

- Next.js 15.5.24 / React 18.2
- TypeScript 5.9
- Tailwind CSS / PostCSS
- Yarn 1 workspaces
- in-repo commerce core and local provider source
- optional inherited provider adapters for external commerce systems
- Vercel, project root `site`
- Node.js 22 runtime contract

## Default provider

Without external environment variables, `site/commerce-config.js` selects the in-repo local commerce provider. It uses deterministic sample products and local cart behavior.

Customer profile, orders and wishlist routes fail closed when the selected provider does not enable the corresponding capability. Real provider behavior is not considered verified merely because an adapter exists in the repository.

## External provider configuration

Copy the example file:

```bash
cp site/.env.example site/.env.local
```

Set only the provider and credentials you actually use. Never commit real credentials. `site/.env.example` contains placeholders only.

Checkout, customer authentication, orders, provider webhooks and authoritative inventory still require provider-specific credentials and E2E verification before production use.

## Local development

Requirements:

- Node.js 22.x
- Yarn 1.x

Install from the repository root:

```bash
yarn install --frozen-lockfile
```

Run development mode:

```bash
yarn dev
```

## Verification

Run from the repository root:

```bash
yarn test
yarn types
yarn workspace next-commerce lint
yarn build
```

`yarn test` contains blocking source contracts for runtime/dependency boundaries and product honesty. The product contract also guards the functional local-search path, search discovery controls, typed provider boundary, current Next Link markup and removal of unsafe product-variant casts.

GitHub Actions performs:

```text
contracts -> frozen install -> production audit -> TypeScript -> zero-warning lint -> production build
```

The production audit blocks critical/high findings. Moderate transitive findings remain visible rather than being silently ignored.

## Deployment

Canonical Vercel project: `myshop` (`prj_dmh1zVvAphPJAlJtKgzAlxvOANKY`) with project root `site`.

The product-completion branch is `ai/product-completion/myshop`, tracked by Draft PR #2. Current branch previews are built from Git and must match the branch Git SHA before they are used as verification evidence.

Production is not automatically promoted from this workstream.

## Security and trust boundaries

- no provider credentials are committed;
- local mode cannot submit a real order;
- account-only features fail closed when unsupported;
- production dependency audit blocks high/critical findings;
- CI GitHub token is read-only;
- baseline anti-sniffing, frame, referrer and permissions headers are configured;
- local search history and grid-density preferences stay in browser storage;
- provider checkout/auth still require current real-provider verification.

## Provenance

This project is adapted from Vercel's historical Next.js Commerce repository:

`https://github.com/vercel/commerce`

That provenance is intentionally retained. MyShop does not claim the inherited commerce architecture was authored from scratch.

## Status

See `PRODUCT_COMPLETION_STATUS.md` for the current 10 core tasks, 10 product features, 10 design/UX improvements, verification evidence and remaining external blockers.
