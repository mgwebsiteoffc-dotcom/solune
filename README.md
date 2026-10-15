# Solune — Shopify skincare theme

- **Working name:** Solune
- **Author:** Sani Kumar
- **Company:** Akestech Infotech Pvt Ltd
- **Planned Theme Store price:** USD $50 (to be configured in the approved listing; not hardcoded in theme code)
- **Testing:** unpublished development-store preview; no customer purchase required
- **Status:** development foundation; not yet tested on a Shopify development store or ready for Theme Store submission
- **Distribution:** Shopify Theme Store submission only; no direct theme sales are planned

Solune is an original, skincare-focused Online Store 2.0 theme with warm mineral colors, editorial typography, accessible shopping flows, and product education built around merchant-supplied facts. Prestige is a quality reference only; no Prestige code, layouts, assets, or branding are used.

The theme editor includes five original theme styles—Solune, Dew, Petal, Grove, and Dusk—with distinct color palettes and coordinated page widths, section spacing, corner radii, and product-card image proportions. Merchants can choose fonts from Shopify's font picker and edit individual colors using the theme palette.

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

Theme Check passed both in GitHub Actions and via Shopify CLI 4.9.4 invoked with `npx` (54 files inspected, no offenses). Static JavaScript syntax, CSS parsing, JSON/schema parsing, translation-key, and Liquid-parser checks have also passed; they do not replace real Shopify storefront testing. No development store is connected to this workspace yet. Liquid rendering, theme-editor behavior, checkout flows, storefront filtering, pickup availability, app blocks, gift card delivery/QR rendering, and Lighthouse scores still need testing on a real development store.

## Project conventions

- Shopify Liquid, JSON templates, sections, section groups, and app blocks.
- Mobile-first, server-rendered storefront content; JavaScript progressively enhances interactions.
- Product-specific skincare facts are read from merchant-owned metafields and metaobjects. The theme never treats AI as a source of clinical, regulatory, or product claims.
- All customer-facing theme UI is localized through `locales/`.
- Optional app features must not be required for the core theme to work.

See `AGENTS.md`, `METAFIELDS.md`, `UPSTREAM.md`, and `SUBMISSION-CHECKLIST.md` for development rules, product data, source provenance, and outstanding review work.

## Before submission

Author and company metadata now identify Sani Kumar and Akestech Infotech Pvt Ltd. The final public theme name, Shopify Partner account identity, trademark availability, demo-store products/images, product support process, and Theme Store listing assets still need confirmation. The current GitHub README and Issues URLs are development documentation/support endpoints, not final merchant-facing support resources. This repository is a development foundation, not an approved or submission-ready theme.
