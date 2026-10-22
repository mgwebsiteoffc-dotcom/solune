# Solune — Shopify skincare theme

- **Owner-confirmed public theme name:** Solune
- **Author:** Sani Kumar
- **Company / Shopify Partner account:** Akestech Infotech Pvt Ltd
- **Owner-confirmed desired listing price:** USD $50 (not within Shopify's currently published USD $100–$500 range in $10 increments; cannot be configured for a Theme Store listing under that guidance and is not hardcoded in theme code)
- **Testing:** unpublished development-store preview; no customer purchase required
- **Status:** development foundation; not yet tested on a Shopify development store or ready for Theme Store submission
- **Distribution:** Shopify Theme Store submission only; no direct theme sales are planned

Solune is an original, skincare-focused Online Store 2.0 theme with warm mineral colors, editorial typography, accessible shopping flows, and product education built around merchant-supplied facts. Prestige is a quality reference only; no Prestige code, layouts, assets, or branding are used.

The theme editor includes five original theme styles—Solune, Dew, Petal, Grove, and Dusk—with distinct color palettes and coordinated page widths, section spacing, swatches, corner radii, and product-card image proportions. Global settings are grouped into Appearance, Colors, Typography, Currency format, Animation, Color swatch, Product card, Cart, Delivery availability, Social media, Favicon, Custom CSS, and Theme style. The color panel exposes page/surface, input, overlay, sale, and rating colors; merchants can also control currency codes, motion, swatch shape/size, product-card behavior, and cart details.

The project starts from Shopify Skeleton Theme **v1.0.0** and preserves its MIT license. The MIT notice is retained for the upstream code; the intended commercial distribution channel for this theme remains the Shopify Theme Store. See `UPSTREAM.md` for source provenance and `ASSET-PROVENANCE.md` for the current media/font/Shopify-helper license register; the latter records unresolved clearance and is not a claim that those assets are approved for commercial use.

## Current foundation

- Responsive editorial homepage sections, collection merchandising, routines, ingredient storytelling, an original Shop the Look image with numbered product hotspots and editable product cards, manually curated Instagram stories/posts/reels with an on-site viewer and previous/next pagination, a product video carousel, editable FAQ, newsletter signup, and Custom Liquid.
- Product pages with reorderable blocks and app blocks, separate option selectors with native color/image swatches, variant-aware media and pricing, optional amount/percentage savings that follow selected variants and selling plans, a scroll-aware sticky add-to-cart bar, manual Indian PIN coverage check, Shop Pay Installments, dynamic checkout, pickup availability, skincare metafields, and related/complementary recommendations.
- Gift card recipient fields, scheduled delivery, cart property display, a Shopify-hosted QR code, and Apple Wallet support.
- Collection and search storefront filters, sorting, and predictive search; independent desktop/tablet/mobile grid density for collections, featured collections, and recommendations; configurable product cards with optional secondary-image hover, routine-step/unit-price visibility, tracked low-stock badges, and savings sourced from Shopify compare-at prices; metafield-backed ratings and sale badges; an AJAX cart drawer with quantity controls, free-shipping progress, discounts and taxes; accelerated checkout; and a responsive cart page.
- Customer account navigation, Follow on Shop, social media icons, favicon support, country/language selectors, localization-ready UI, product/article structured data, and canonical/social metadata.
- Product facts are merchant-supplied; the theme must not invent ingredient, efficacy, clinical, or safety claims.

Shopify manages `/agents.md` and its related agent-discovery routes by default. Solune doesn't override that managed content, so Shopify can keep its commerce protocol and endpoint details in sync with the store. The theme focuses on accurate product metadata, structured data, semantic content, and usable storefront search.

## Development

Install Shopify CLI, authenticate to your Shopify account, and run:

```sh
npm install --global @shopify/cli
shopify auth login
shopify theme check
shopify theme dev --store your-development-store.myshopify.com
```

To upload a persistent, unpublished preview theme (never make the live theme the test target):

```sh
shopify theme push --store your-development-store.myshopify.com --unpublished --theme "Solune Development Preview"
```

Shopify Theme Check passes on the latest working tree: the 2026-10-22 run inspected 73 files with no offenses. The owner supplied `akestechinfotech@gmail.com` for the required `theme_support_email` in Theme Info; earlier checks failed only because that field was blank. Static JavaScript syntax, PostCSS parsing, JSON/embedded-schema parsing, translation-key, settings-data, and palette-contrast checks have also passed; they do not replace real Shopify storefront testing.

A repository-level security pass also checked exposed credential patterns, storefront output contexts, JavaScript sinks, dependencies, and workflow permissions. Search terms, user comments, merchant-entered menu/pickup labels, plain-text excerpts, and canonical/social metadata URLs are escaped at output; cart, predictive-search, and recommendation fetches reject cross-origin endpoints, and pickup availability rejects cross-origin redirects; GitHub Actions are pinned to verified commit SHAs; `npm audit` reported zero known vulnerabilities in the development dependency tree on 2026-10-22. The latest GitHub CI run passes on the pinned Ubuntu 24.04 runner; a prior `ubuntu-latest` run produced Node 20 and runner-image migration notices, prompting the runner pin. This is not a penetration test or a guarantee about Shopify/app-injected code, merchant-authored rich text, or live-store configuration. Shopify's current [Theme Store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements) still require thorough testing and formal review; before submission, verify codebase eligibility/originality and review the manually curated Instagram story/post/reel modules against restrictions on app-dependent or API-dependent app-like features (the sections are not live-synced).

Run the fixture-based DOM smoke suite for single/multi-option variant and quantity updates, optional/required selling-plan state, sticky-cart behavior, PIN-code validation and Shopify section-load initialization, price-filter and sorting controls, mocked predictive search and pickup responses, dialog/story focus return and in-viewer pagination, gift-card form properties/date limits, carousel controls, mocked cart requests/note saves/error feedback, and native cart-form fallback. DOM fixtures cover PDP savings updates across variants and selling plans and reject cross-origin cart, predictive-search, and recommendation requests plus pickup redirects; source-contract assertions cover Shop the Look product/hotspot schema and homepage placement, PIN/FAQ/story editor schema exposure, PDP price-block controls, product-card merchandising settings, compare-at savings display, low-stock inventory gates, untrusted search/comment/menu/pickup output escaping, and responsive product-grid settings across collection, featured-collection, and recommendation sections. These source checks do not verify the live Theme Editor. Run with:

```sh
npm ci
npm test
```

The suite uses development-only `jsdom`, excluded from the Shopify theme package. Its fixtures and mocked requests do not substitute for real Shopify data or browser QA. No authenticated development-store preview has been tested from this workspace. Liquid rendering, Theme Editor behavior, checkout flows, storefront filtering, pickup availability, app blocks, gift-card delivery/QR rendering, and Lighthouse scores still need testing on a real development store.

## Project conventions

- Shopify Liquid, JSON templates, sections, section groups, and app blocks.
- Mobile-first, server-rendered storefront content; JavaScript progressively enhances interactions.
- Product-specific skincare facts are read from merchant-owned metafields and metaobjects. The theme never treats AI as a source of clinical, regulatory, or product claims.
- All customer-facing theme UI is localized through `locales/`.
- Optional app features must not be required for the core theme to work.

See [`docs/MERCHANT-GUIDE.md`](docs/MERCHANT-GUIDE.md) for store setup and theme-editor guidance, plus `AGENTS.md`, `METAFIELDS.md`, `UPSTREAM.md`, `PAGE-BY-PAGE-AUDIT.md`, and `SUBMISSION-CHECKLIST.md` for development rules, product data, source provenance, route/bypass review, and outstanding work.

## Before submission

The Shopify theme author field is set to Sani Kumar to respect Shopify's 25-character limit. The owner confirmed **Solune** as the public theme name and **Akestech Infotech Pvt Ltd** as the Shopify Partner account identity. The theme metadata already uses `Solune`. Shopify's current [theme naming rules](https://shopify.dev/docs/storefronts/themes/store/requirements#18-naming-themes-and-theme-presets) require 1–2 words, fewer than 30 characters, and a name distinct from existing themes, Shopify products, the company, and Partner account; Solune meets the basic length and company-name checks, but trademark availability and full name-conflict clearance have not been verified. The support process, demo-store content, and listing assets still need completion.

As checked on 2026-10-22, Shopify's published [Theme Store listing guidance](https://shopify.dev/docs/storefronts/themes/store/review-process/listings#theme-price) sets theme prices from USD $100 to $500 in $10 increments. The owner's earlier USD $50 target is outside that range. Shopify's [revenue-share guidance](https://shopify.dev/docs/storefronts/themes/store/revenue-share) states a 15% share of gross theme sales, a 2.9% billing processing fee, applicable sales tax, and possible regional operating fees. Account eligibility, payout method/timing, tax information, and the fees shown for this Partner account still need confirmation in the Partner Dashboard; this repository cannot configure or verify them.

A pre-release merchant guide is available at `docs/MERCHANT-GUIDE.md`, and theme metadata links directly to its public repository page. The GitHub Pages workflow is present on this working branch but is not listed among the repository's active workflows. A repository admin must merge it to the default branch, enable Pages with **GitHub Actions** as the build source, and run **Deploy merchant documentation** to publish `https://mgwebsiteoffc-dotcom.github.io/solune/`. Until the deployment succeeds, the branch-specific guide link is provisional and the Pages URL must not be treated as live. Development-only Issues links have been removed. The owner-provided Theme Info support address is `akestechinfotech@gmail.com`. This repository is a development foundation, not an approved or submission-ready theme.
