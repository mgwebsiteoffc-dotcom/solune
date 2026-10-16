# Shopify Theme Store submission checklist

This project is a development foundation. A checked implementation item means code is present; it does not imply real-store behavior, Lighthouse results, or Shopify review have passed. Theme Check results are recorded separately below.

## Progress snapshot — 2026-10-16

- **28 of 52 tracked checklist items are marked implemented/prepared; 24 remain open.** This is a checklist count, not a theme-readiness percentage.
- The largest pending work is authenticated Shopify development-store QA, storefront accessibility/performance testing, Theme Store preparation, and implementing/verifying 100+ meaningful CRO controls.

## Current implementation

- [x] Start from the official Shopify Skeleton Theme v1.0.0, preserve its license, and document provenance.
- [x] Build an original, responsive skincare visual system with a curated section library and merchant-facing settings.
- [x] Add five original theme style presets, a 15-color role palette, modal/input/sale/rating color controls, editable radii, and product-card image proportions.
- [x] Expose Appearance, Colors, Typography, Currency format, Animation, Color swatch, Product card, Cart, Social media, Favicon, Custom CSS, and Theme style settings with working storefront behavior.
- [x] Add standard Shopify review-metafield ratings, sale badges, currency-code formatting, configurable swatch styles, and cart display controls.
- [x] Add a native AJAX cart drawer with quantity adjustment/removal, cart totals, optional free-shipping progress, and a cart-page fallback.
- [x] Add a scroll-aware PDP sticky add-to-cart bar synchronized with variant price and availability.
- [x] Expose Title H1–H4 visual styles and configurable sold-out, selector, swatch, variant-image, and size-chart controls in the product blocks.
- [x] Add editable Image with text, manually curated Instagram stories, and shoppable video/product carousel sections to the homepage template, with demo-image fallbacks.
- [x] Make Shopify-hosted UGC videos play inline and open story videos in an in-site viewer; story-card clicks do not navigate away from the storefront.
- [x] Add cart-drawer order-note saving through Shopify Ajax, cart-line unit prices and discount comparisons, and a single cart-page savings total.
- [x] Add separate tablet and mobile layout rules, responsive gutters, and tablet two-column layouts for key editorial and product sections.
- [x] Align newsletter submit controls and collection price-range inputs; add compact, responsive filter disclosures.
- [x] Include Online Store 2.0 JSON templates, header/footer section groups, app blocks, Custom Liquid section/blocks, and a contact template.
- [x] Implement the required storefront templates: 404, article, blog, cart, collection, home page, collection list, page, contact page, password, product, search, and gift card.
- [x] Implement separate product option selectors, image/color swatches, variant deep links, variant-aware media/prices/availability, quantity selection, unit pricing, rich media, accelerated checkout, pickup availability, Shop Pay Installments, selling plans, and product recommendations.
- [x] Implement gift card recipient email/name/message, scheduled delivery and timezone data, cart property display, QR code, gift card code, and Apple Wallet link.
- [x] Implement collection and search facets, sorting, responsive product results, predictive search, line/order discounts, tax-included messaging, cart notes/quantities, and accelerated cart checkout.
- [x] Implement customer account navigation, Follow on Shop, country/language localization, payment icons, social media icon settings, and favicon support.
- [x] Implement canonical/social metadata, Shopify Product/Article structured data, route-aware BreadcrumbList JSON-LD, and accessible visible breadcrumbs without replacing Shopify-managed `/agents.md` content.
- [x] Provide a reusable localized breadcrumb component on product, collection, collection-list, search, blog, article, page/contact, cart, and 404 templates.
- [x] Run `node --check` on storefront JavaScript assets.
- [x] Parse all Liquid files with Shopify's Liquid HTML parser; parse standalone JSON and embedded section schemas; audit translation keys.
- [x] Parse the theme stylesheets with PostCSS.
- [x] Run Shopify Theme Check with Shopify CLI via `npx` (61 files inspected with no offenses; product picker and homepage sections included).
- [ ] Run the theme on an authenticated Shopify development store and verify Theme Editor behavior.
- [ ] Test the theme against Shopify's benchmark store and record Lighthouse performance/accessibility scores.

## Pre-submission verification

### Required shopping flows

- [ ] Test single- and multi-option products, swatch images/colors, unavailable combinations, sold-out variants, variant URLs/media/prices, and variant quantity minimums, increments, and maximums.
- [ ] Test selling plans and cart display on optional- and required-subscription products.
- [ ] Test gift-card recipient validation, scheduled delivery (including the 90-day limit and timezone), cart properties, QR rendering, and Apple Wallet.
- [ ] Test pickup availability for available/unavailable locations and multiple variants.
- [ ] Test collection/search filters, sorting, empty states, pagination, predictive search, and all supported search result types.
- [ ] Test in-site UGC playback, story viewer play/close and focus restoration, carousel pagination, reduced motion, and no story-card redirects on desktop/mobile.
- [ ] Test line/order discounts, tax-inclusive prices, cart notes, quantity changes, unit prices, and accelerated checkout.
- [ ] Test AJAX cart drawer add/change/remove flows, free-shipping progress, section refresh, keyboard dismissal, and cart-page fallback.
- [ ] Test sticky PDP add-to-cart visibility, variant price/availability synchronization, and submission from the external form-associated button.
- [ ] Test customer account navigation, Follow on Shop, country/language selectors, and payment/social icons on eligible shops.
- [ ] Test app blocks and Custom Liquid insertion points; confirm the core theme works without apps.
- [ ] Finish the page-by-page PDP, collection, cart, blog/SEO, contact, and mobile design audit in a real development-store preview.
- [ ] Complete and verify the requested 100+ meaningful, working CRO controls across relevant theme sections; do not count duplicate or inert settings.

### Quality and listing readiness

- [x] Record author and company identity supplied by the owner: Sani Kumar / Akestech Infotech Pvt Ltd.
- [x] Record owner's pricing and test-access intent: USD $50 for the paid Theme Store listing; unpublished developer preview is free to test.
- [ ] Configure the final listing price and confirm Shopify's then-current listing and payout requirements.
- [ ] Confirm the final public theme name, Shopify Partner account identity, trademark availability, demo-store content, support process, and Theme Store listing assets.
- [ ] Replace the development GitHub README/Issues endpoints with stable merchant-facing documentation and support resources before submission.
- [ ] Build an original skincare demo store with licensed imagery, real product data, accurate policies/navigation, and no placeholders or unverified ingredient/clinical claims.
- [ ] Validate keyboard/screen-reader behavior, focus order, contrast, reduced motion, form labels/errors, all image ratios/focal points, and realistic long/short content.
- [ ] Test latest supported desktop/mobile browsers and relevant social-app webviews.
- [ ] Test mobile/desktop Lighthouse performance and accessibility on the home, product, and collection templates with Shopify's benchmark dataset and populated sections.
- [ ] Verify font, image, icon, and third-party asset licenses; confirm no external libraries or app-like features are required.
- [x] Package with Shopify CLI and inspect the generated ZIP for standard theme structure, key templates/configuration, and the included upstream license notice; this local preflight is not a Theme Store review.
- [ ] Complete the official Shopify Theme Store review workflow against its then-current requirements.

Do not describe the theme as approved, submission-ready, compliant, or conversion-lifting until the relevant store tests, performance/accessibility review, and Shopify review are complete.
