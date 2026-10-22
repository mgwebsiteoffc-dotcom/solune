# Solune — Shopify skincare theme

- **Working name:** Solune
- **Author:** Sani Kumar
- **Company:** Akestech Infotech Pvt Ltd
- **Planned Theme Store price:** USD $50 (to be configured in the approved listing; not hardcoded in theme code)
- **Testing:** unpublished development-store preview; no customer purchase required
- **Status:** development foundation; not yet tested on a Shopify development store or ready for Theme Store submission
- **Distribution:** Shopify Theme Store submission only; no direct theme sales are planned

Solune is an original, skincare-focused Online Store 2.0 theme with warm mineral colors, editorial typography, accessible shopping flows, and product education built around merchant-supplied facts. Prestige is a quality reference only; no Prestige code, layouts, assets, or branding are used.

The theme editor includes five original theme styles—Solune, Dew, Petal, Grove, and Dusk—with distinct color palettes and coordinated page widths, section spacing, swatches, corner radii, and product-card image proportions. Global settings are grouped into Appearance, Colors, Typography, Currency format, Animation, Color swatch, Product card, Cart, Delivery availability, Social media, Favicon, Custom CSS, and Theme style. The color panel exposes page/surface, input, overlay, sale, and rating colors; merchants can also control currency codes, motion, swatch shape/size, product-card behavior, and cart details.

The project starts from Shopify Skeleton Theme **v1.0.0** and preserves its MIT license. The MIT notice is retained for the upstream code; the intended commercial distribution channel for this theme remains the Shopify Theme Store. See `UPSTREAM.md` for source provenance and license details.

## Current foundation

- Responsive editorial homepage sections, collection merchandising, routines, ingredient storytelling, manually curated Instagram stories/posts/reels with an on-site viewer, a product video carousel, editable FAQ, newsletter signup, and Custom Liquid.
- Product pages with reorderable blocks and app blocks, separate option selectors with native color/image swatches, variant-aware media and pricing, a scroll-aware sticky add-to-cart bar, manual Indian PIN coverage check, selling plans, Shop Pay Installments, dynamic checkout, pickup availability, skincare metafields, and related/complementary recommendations.
- Gift card recipient fields, scheduled delivery, cart property display, a Shopify-hosted QR code, and Apple Wallet support.
- Collection and search storefront filters, sorting, predictive search, configurable product cards with optional secondary-image hover, routine-step/unit-price visibility, and tracked low-stock badges, metafield-backed ratings and sale badges, an AJAX cart drawer with quantity controls, free-shipping progress, discounts and taxes, accelerated checkout, and a responsive cart page.
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

Shopify Theme Check passes on the latest working tree: the 2026-10-22 run inspected 71 files with no offenses. The owner supplied `akestechinfotech@gmail.com` for the required `theme_support_email` in Theme Info; earlier checks failed only because that field was blank. Static JavaScript syntax, PostCSS parsing, JSON/embedded-schema parsing, translation-key, settings-data, and palette-contrast checks have also passed; they do not replace real Shopify storefront testing.

Run the fixture-based DOM smoke suite for single/multi-option variant and quantity updates, optional/required selling-plan state, sticky-cart behavior, PIN-code validation and Shopify section-load initialization, price-filter and sorting controls, mocked predictive search and pickup responses, dialogs/story focus return, gift-card form properties/date limits, carousel controls, mocked cart requests/note saves/error feedback, and native cart-form fallback. Source-contract assertions also cover product-card secondary-image, routine-step, unit-price, and low-stock settings and inventory gates. Run with:

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

The Shopify theme author field is set to Sani Kumar to respect Shopify's 25-character limit; this README records Akestech Infotech Pvt Ltd as the company. The final public theme name, Shopify Partner account identity, trademark availability, demo-store products/images, product support process, and Theme Store listing assets still need confirmation. A pre-release merchant guide is available at `docs/MERCHANT-GUIDE.md`, and theme metadata links directly to its public repository page. A GitHub Pages workflow is prepared; a repository admin must enable Pages with **GitHub Actions** as the build source and run **Deploy merchant documentation** to publish `https://mgwebsiteoffc-dotcom.github.io/solune/`. Until then, the branch-specific guide link is provisional. Development-only Issues links have been removed. The owner-provided Theme Info support address is `akestechinfotech@gmail.com`. This repository is a development foundation, not an approved or submission-ready theme.
