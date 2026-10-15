# Solune — Shopify skincare theme

- **Working name:** Solune
- **Status:** development foundation; not ready for a Theme Store submission
- **Distribution:** Shopify Theme Store submission only; no direct theme sales are planned

Solune is an original, skincare-focused Online Store 2.0 theme with warm mineral colors, editorial typography, accessible shopping flows, and product education built around merchant-supplied facts. Prestige is a quality reference only; no Prestige code, layouts, assets, or branding are used.

The project starts from Shopify Skeleton Theme **v1.0.0** and preserves its MIT license. The MIT notice is retained for the upstream code; the intended commercial distribution channel for this theme remains the Shopify Theme Store. See `UPSTREAM.md` for source provenance and license details.

## Current foundation

- Responsive editorial homepage sections, collection merchandising, routines, ingredient storytelling, newsletter signup, and Custom Liquid.
- Product pages with reorderable blocks and app blocks, separate option selectors with native color/image swatches, variant-aware media and pricing, selling plans, Shop Pay Installments, dynamic checkout, pickup availability, skincare metafields, and related/complementary recommendations.
- Gift card recipient fields, scheduled delivery, cart property display, a Shopify-hosted QR code, and Apple Wallet support.
- Collection and search storefront filters, sorting, predictive search, product cards, cart discounts and taxes, selling plans, accelerated checkout, unit pricing, and a responsive cart with variant options.
- Shopify's `<shopify-account>` component, Follow on Shop, social media icons, favicon support, country/language selectors, localization-ready UI, product/article structured data, and canonical/social metadata.
- Product facts are merchant-supplied; the theme must not invent ingredient, efficacy, clinical, or safety claims.

Shopify manages `/agents.md` and its related agent-discovery routes by default. Solune doesn't override that managed content, so Shopify can keep its commerce protocol and endpoint details in sync with the store. The theme focuses on accurate product metadata, structured data, semantic content, and usable storefront search.

## Development

Install Shopify CLI and authenticate to a Shopify development store, then run:

```sh
shopify theme check
shopify theme dev --store your-development-store.myshopify.com
```

Theme Check is also configured in GitHub Actions. Static JavaScript syntax, CSS parsing, JSON/schema parsing, translation-key, and Liquid-parser checks have been run in this workspace; they do not replace Theme Check or real Shopify storefront testing. Shopify CLI, Theme Check, and Ruby are not available in this environment. A development store is still required to validate Liquid rendering, theme-editor behavior, checkout flows, storefront filtering, pickup availability, app blocks, gift card delivery/QR rendering, and Lighthouse scores.

## Project conventions

- Shopify Liquid, JSON templates, sections, section groups, and app blocks.
- Mobile-first, server-rendered storefront content; JavaScript progressively enhances interactions.
- Product-specific skincare facts are read from merchant-owned metafields and metaobjects. The theme never treats AI as a source of clinical, regulatory, or product claims.
- All customer-facing theme UI is localized through `locales/`.
- Optional app features must not be required for the core theme to work.

See `AGENTS.md`, `METAFIELDS.md`, `UPSTREAM.md`, and `SUBMISSION-CHECKLIST.md` for development rules, product data, source provenance, and outstanding review work.

## Before submission

The public theme name, author, trademark availability, demo-store products/images, product support process, and Theme Store listing assets still need confirmation. The current GitHub README and Issues URLs are working development documentation/support endpoints, not final merchant-facing support resources. This repository is a development foundation, not an approved or submission-ready theme.
