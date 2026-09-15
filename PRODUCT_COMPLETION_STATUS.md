# MyShop Product Completion Status

## Product family

- **Canonical repository:** `shikakker/myshop`
- Upstream provenance: historical fork/adaptation of `vercel/commerce`
- **Canonical Vercel project:** `myshop` (`prj_dmh1zVvAphPJAlJtKgzAlxvOANKY`)
- Vercel project root: `site`
- Product: provider-aware commerce storefront demo / integration sandbox
- Default provider: `@vercel/commerce-local`

## Current batch

**State:** PARTIAL — build/install root cause and P0/P1 trust/core-flow defects are fixed in source, but exact-head install/typecheck/lint/build/Vercel/browser verification is not executing yet. The project is not DONE.

**Branch:** `ai/product-completion/myshop`  
**Base:** `main`  
**PR:** #2 — `fix: make MyShop demo deployable and honest` (draft)

## Product definition

**User → Problem → Core action → Value → Outcome**

Developer / portfolio reviewer / commerce integrator → needs a truthful storefront reference that can run with sample data or a configured provider → browses catalog/search/products, exercises cart, and sees whether the current provider supports checkout → understands the commerce UI/integration without mistaking demo data for real inventory/orders → can evaluate or continue provider integration safely.

## Initial verified state

- Historical Vercel deployment renders successfully and exposes sample local products.
- Public metadata/footer/homepage still identify the site as ACME / Next.js Commerce and link upstream Next.js/Vercel identity.
- Product descriptions repeat historical Next.js Conf scarcity/charity claims.
- Local provider checkout hook is empty, but cart UI offered `Proceed to Checkout` and linked to a checkout flow that does not exist for the local provider.
- Latest pre-fix Vercel previews fail during dependency installation because direct `postcss-nesting@8.0.1` only supports Node 12–16 while the Vercel project runs Node 22.
- No repository CI workflow existed.
- Vercel runtime error query for the inspected 7-day window returned no runtime error clusters on the historical deployment.

## T01–T10 — Core tasks

| ID | Status | Task / value / expected result / verification |
| --- | --- | --- |
| T01 | DONE | Identify canonical repo/Vercel project and upstream provenance; `main` contained canonical application code, older improvement branches were docs-only. |
| T02 | DONE | Fix Node/install root cause without disabling engine checks: root/site pin Node 22 and obsolete direct `postcss-nesting@8` is removed. Focused runtime contract RED→GREEN. |
| T03 | IN PROGRESS | Reproducible frozen install/typecheck/lint/build. Scripts + CI added; exact-head runner/build has not executed. |
| T04 | DONE | Make provider mode explicit to UI; `NEXT_PUBLIC_COMMERCE_PROVIDER` is generated from selected server build config. |
| T05 | DONE | Disable fake checkout in local demo mode; cart/sidebar explain that real provider configuration is required. |
| T06 | DONE | Replace upstream ACME/Next.js Commerce public identity, lorem and unsupported upstream claims with MyShop demo/provenance copy. |
| T07 | DONE | Neutralize local sample catalog vendor/event/scarcity/charity claims while preserving IDs/slugs/images/variants. |
| T08 | DONE | Fail closed for profile/orders/wishlist when corresponding provider features are disabled; improve loading/empty states. |
| T09 | IN PROGRESS | Add deployment/security hardening and environment/docs contract; baseline headers and `.env.example` added, exact runtime response verification pending. |
| T10 | BLOCKED | Exact-head browser QA and Vercel preview. BLOCKED ONLY BY current Vercel build-rate limit plus absence of an executing GitHub runner. |

## I01–I10 — Improvements

| ID | Status | Improvement |
| --- | --- | --- |
| I01 | DONE | Node 22 runtime contract matches Vercel and repo package metadata. |
| I02 | DONE | Runtime dependency contract prevents reintroducing Node-incompatible direct PostCSS nesting package. |
| I03 | DONE | Product honesty contract protects provider mode, demo checkout guards, upstream identity and sample catalog semantics. |
| I04 | DONE | GitHub CI workflow added: frozen install → contracts → typecheck → lint → build. |
| I05 | DONE | Explicit cart loading vs empty state; disabled checkout has recovery action. |
| I06 | DONE | Account-only routes fail closed when provider auth feature is disabled. |
| I07 | DONE | Baseline Next.js security headers: nosniff, anti-frame, strict referrer policy, camera/mic/geolocation permissions disabled. |
| I08 | DONE | `.env.example` contains blank provider placeholders only; no production secret added. |
| I09 | IN PROGRESS | Dependency/security modernization: current Next.js 12/React 17 generation is legacy/EOL and requires a separately verified migration. |
| I10 | DONE | README replaced with current product/deployment/provider/provenance documentation. |

## F01–F10 — Product features

| ID | Status | Feature — user need — value — complexity — priority |
| --- | --- | --- |
| F01 | DONE | Sample catalog browsing — evaluate storefront/product UI without external provider — M — P0. |
| F02 | DONE | Search/category navigation — find sample/provider products — M — P1. |
| F03 | DONE | Product detail/variants — inspect provider-normalized product model — M — P1. |
| F04 | DONE | Cart — exercise quantities/pricing and provider cart hooks — M — P0. |
| F05 | DONE | Explicit demo mode — prevent sample catalog/cart from being mistaken for a live store — S — P0. |
| F06 | BLOCKED | Real checkout — complete purchase via configured provider — H — P0 for a real store, but blocked by external provider credentials/configuration. |
| F07 | DEFERRED WITH REASON | Customer profile/orders — useful only with a provider that enables verified customer auth/order history — M — P2. |
| F08 | DEFERRED WITH REASON | Wishlist — provider-dependent and disabled in current default config — M — P2. |
| F09 | DONE | Provider-aware feature gates — only show supported commerce surfaces — M — P1. |
| F10 | DEFERRED WITH REASON | Production merchandising/real inventory — requires business/catalog decisions and real provider data; sample data is intentionally retained as demo — L — P2. |

## Fresh verification evidence

- Historical deployed homepage HTTP: **200**. It reproduces the pre-fix ACME/upstream metadata and sample catalog, so it is baseline evidence only, not current-head evidence.
- Historical Vercel runtime error query (7-day inspected window): **no runtime error clusters found**.
- Pre-fix Vercel build logs: **FAIL at install** with `postcss-nesting@8.0.1` engine incompatibility on Node 22; root cause identified and direct dependency removed in current branch.
- Focused runtime dependency contract: **RED→GREEN** for root/site Node 22 pins and absence of legacy direct `postcss-nesting`.
- Focused product honesty contract: **RED→GREEN** for provider exposure, demo checkout guards, ACME/lorem/Next.js SEO cleanup, neutral catalog semantics and fail-closed account routes.
- Focused local catalog check: **PASS** for JSON parse, removal of upstream event/scarcity/charity vendor claims, and explicit non-purchasable demo description.
- Current exact-head Vercel status: **FAIL BEFORE BUILD** with account `upgradeToPro=build-rate-limit`; this is not represented as a code/build failure.
- Current GitHub workflow runs: **none registered/executed yet** for the newly added workflow; no install/typecheck/lint/build PASS is claimed.
- Current-head browser QA: **NOT VERIFIED**.

## Security / reliability notes

- No real provider credential is committed by this batch.
- Local provider cannot submit an order through the UI.
- Customer-only surfaces are hidden when provider customer auth is disabled.
- Sample inventory no longer carries old real-world scarcity/event/charity claims.
- App-level response headers are configured; CSP is deferred until exact-head browser/provider QA because commerce providers may require external scripts/frames.
- Framework/dependency generation remains old (Next.js 12 / React 17); this is a known security/maintenance risk and not declared resolved.

## External blockers

- **Exact-head Vercel build/preview:** BLOCKED ONLY BY the Vercel account Hobby build-rate limit; deployments are rejected before build.
- **Exact-head GitHub CI:** BLOCKED ONLY BY absence of an executing/registered workflow run for the new branch workflow at the current checkpoint.
- **Real checkout/orders:** BLOCKED ONLY BY selection/configuration of a supported external commerce provider plus its production credentials/business setup.
- **Framework modernization verification:** current environment cannot safely complete/verify a major Next.js migration until full install/build/browser execution is available.

## Project checkpoint

**PROJECT:** MyShop (`shikakker/myshop`)  
**Initial:** production-like upstream ACME identity; fake local checkout; unsupported sample claims; broken Node-22 Vercel install; no CI; legacy framework.  
**Fixed:** Node/dependency contract, local demo checkout guard, provider mode, catalog/product identity, account feature gates, loading/empty states, response headers, CI/scripts, env/docs/provenance.  
**Features:** catalog/search/product/cart demo; provider-aware feature gates; real checkout intentionally blocked until real provider config.  
**Verification:** Install = NOT RUN exact head; Build = NOT RUN exact head; Typecheck = NOT RUN exact head; Lint = NOT RUN exact head; Tests = focused contracts PASS / full repo `yarn test` NOT RUN exact head; Browser QA = NOT VERIFIED; Vercel Preview = BLOCKED BEFORE BUILD; Historical runtime = 200 / no recent runtime error clusters.  
**Git:** `ai/product-completion/myshop`, draft PR #2.  
**Remaining blockers:** exact-head Vercel/CI execution and external real-commerce provider inputs only.  
**Status:** **PARTIAL**.

## Next action when blockers clear

Run `yarn install --frozen-lockfile && yarn test && yarn types && yarn workspace next-commerce lint && yarn build`, then deploy the exact head to canonical `myshop`, verify headers and `/`, search/category, product detail, cart add/update/remove, demo checkout denial, disabled account routes, 404/error states and 375/768/1024/1440 responsive behavior. Fix all failures before making PR #2 ready or promoting production.
