# Shopify Theme Store submission checklist

This project is a development foundation. A checked implementation item means code is present; it does not imply real-store behavior, Lighthouse results, or Shopify review have passed. Theme Check results are recorded separately below.

## Current implementation

- [x] Start from the official Shopify Skeleton Theme v1.0.0, preserve its license, and document provenance.
- [x] Build an original, responsive skincare visual system with a curated section library and merchant-facing settings.
- [x] Add five original theme style presets, a theme color palette, editable corner radii, and product-card image proportions.
- [x] Add separate tablet and mobile layout rules, responsive gutters, and tablet two-column layouts for key editorial and product sections.
- [x] Include Online Store 2.0 JSON templates, header/footer section groups, app blocks, Custom Liquid section/blocks, and a contact template.
- [x] Implement the required storefront templates: 404, article, blog, cart, collection, home page, collection list, page, contact page, password, product, search, and gift card.
- [x] Implement separate product option selectors, image/color swatches, variant deep links, variant-aware media/prices/availability, quantity selection, unit pricing, rich media, accelerated checkout, pickup availability, Shop Pay Installments, selling plans, and product recommendations.
- [x] Implement gift card recipient email/name/message, scheduled delivery and timezone data, cart property display, QR code, gift card code, and Apple Wallet link.
- [x] Implement collection and search facets, sorting, responsive product results, predictive search, line/order discounts, tax-included messaging, cart notes/quantities, and accelerated cart checkout.
- [x] Implement account component, Follow on Shop, country/language localization, payment icons, social media icon settings, and favicon support.
- [x] Implement canonical/social metadata and Shopify Product/Article structured data without replacing Shopify-managed `/agents.md` content.
- [x] Run `node --check` on storefront JavaScript assets.
- [x] Parse all Liquid files with Shopify's Liquid HTML parser; parse standalone JSON and embedded section schemas; audit translation keys.
- [x] Parse the theme stylesheets with PostCSS.
- [x] Run Shopify Theme Check in GitHub Actions and Shopify CLI 4.9.4 (`npx`; 54 files inspected with no offenses).
- [ ] Run the theme on an authenticated Shopify development store and verify Theme Editor behavior.
- [ ] Test the theme against Shopify's benchmark store and record Lighthouse performance/accessibility scores.

## Pre-submission verification

### Required shopping flows

- [ ] Test single- and multi-option products, swatch images/colors, unavailable combinations, sold-out variants, variant URLs, variant media, and product prices.
- [ ] Test selling plans and cart display on optional- and required-subscription products.
- [ ] Test gift-card recipient validation, scheduled delivery (including the 90-day limit and timezone), cart properties, QR rendering, and Apple Wallet.
- [ ] Test pickup availability for available/unavailable locations and multiple variants.
- [ ] Test collection/search filters, sorting, empty states, pagination, predictive search, and all supported search result types.
- [ ] Test line/order discounts, tax-inclusive prices, cart notes, quantity changes, unit prices, and accelerated checkout.
- [ ] Test account component, Follow on Shop, country/language selectors, and payment/social icons on eligible shops.
- [ ] Test app blocks and Custom Liquid insertion points; confirm the core theme works without apps.

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
- [ ] Package with Shopify CLI, inspect the ZIP against Shopify's current Theme Store requirements, and complete the official review workflow.

Do not describe the theme as approved, submission-ready, compliant, or conversion-lifting until the relevant store tests, performance/accessibility review, and Shopify review are complete.
