# Shopify Theme Store submission checklist

This project is a development foundation. A checked implementation item means code is present; it does not imply real-store behavior, Lighthouse results, or Shopify review have passed. Theme Check results are recorded separately below.

## Progress snapshot — 2026-10-21

- **42 of 67 tracked checklist items are marked implemented/prepared; 25 remain open.** This is a checklist count, not a theme-readiness percentage.
- The largest pending work is the official Theme Info support email (needed for a clean current Theme Check), authenticated Shopify development-store QA, storefront accessibility/performance testing, Theme Store preparation, and implementing/verifying 100+ meaningful CRO controls.
- No authenticated Shopify store session is available in this workspace, so the store-dependent tests below remain open; no upload or live storefront QA is claimed.

## Current implementation

- [x] Start from the official Shopify Skeleton Theme v1.0.0, preserve its license, and document provenance.
- [x] Build an original, responsive skincare visual system with a curated section library and merchant-facing settings.
- [x] Add a development-only JSDOM smoke suite for selected storefront interactions; fixtures and mocked Shopify requests are not live-store or real-browser QA.
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
- [x] Add a customizable product-page block library for SKU, badges, ratings with an optional reviews link, separators, product variations, line-item properties, inventory, pickup, complementary products with block-level quick-add control, offers, icon features, text/collapsible text, an extra image, buttons, share links, on-site modals, and more-information content.
- [x] Implement gift card recipient email/name/message, scheduled delivery and timezone data, cart property display, QR code, gift card code, and Apple Wallet link.
- [x] Implement collection and search facets, sorting, responsive product results, predictive search, line/order discounts, tax-included messaging, cart notes/quantities, and accelerated cart checkout.
- [x] Implement customer account navigation, Follow on Shop, country/language localization, payment icons, social media icon settings, and favicon support.
- [x] Implement canonical/social metadata, Shopify Product/Article structured data, route-aware BreadcrumbList JSON-LD, and accessible visible breadcrumbs without replacing Shopify-managed `/agents.md` content.
- [x] Provide a reusable localized breadcrumb component on product, collection, collection-list, search, blog, article, page/contact, cart, and 404 templates.
- [x] Run `node --check` on storefront JavaScript assets.
- [x] Parse all Liquid files with Shopify's Liquid HTML parser; parse standalone JSON and embedded section schemas; audit translation keys.
- [x] Parse the theme stylesheets with PostCSS.
- [x] Run Shopify Theme Check with Shopify CLI via `npx`; the earlier pre-metadata-edit run inspected 66 files with no offenses (the latest result is recorded below).
- [ ] Pass the latest Theme Check with valid theme metadata; the latest run scans 68 files and reports one `ValidJSON` error because the required `theme_support_email` is blank pending the owner's official support address.
- [ ] Run the theme on an authenticated Shopify development store and verify Theme Editor behavior.
- [ ] Test the theme against Shopify's benchmark store and record Lighthouse performance/accessibility scores.

## Pre-submission verification

### Required shopping flows

- [x] Run a JSDOM fixture test for direct variant-selector changes, sold-out UI, price/SKU/variant-URL updates, and quantity-rule minimum/increment/maximum normalization.
- [ ] Verify single- and multi-option products against real Shopify data, including swatch images/colors, unavailable combinations, variant media/prices, and quantity minimums, increments, and maximums.
- [x] Run JSDOM fixture checks for optional-plan discount/compare-at pricing, required-plan variant matching, and unavailable-plan add-to-cart state.
- [ ] Test Shopify selling-plan submissions and cart display on optional- and required-subscription products.
- [x] Run a JSDOM fixture test for recipient-field required/disabled state and the local 90-day date boundary across the New York spring-DST transition.
- [ ] Test Shopify gift-card recipient validation, scheduled delivery/timezone handling, cart properties, QR rendering, and Apple Wallet.
- [x] Run mocked pickup-availability tests for variant-specific requests, stale-response protection, and hiding an empty availability block.
- [ ] Test Shopify pickup availability for available/unavailable locations and multiple real variants.
- [x] Verify with JSDOM that collection price-range controls update visible/ARIA values, clamp crossing bounds, and sorting auto-submits; no Shopify-generated facets or server filtering were tested.
- [x] Exercise predictive-search request parameters, short-query handling, mock result/empty states for product, collection, page, and article items, keyboard selection, Escape/focus return, and live status; requests and result HTML are mocked.
- [ ] Test collection/search filters, sorting, empty states, pagination, predictive search, and all supported search result types against real Shopify storefront data.
- [x] Run JSDOM fixture tests for story/modal focus return, mocked in-site playback controls, video-carousel pagination, reduced-motion behavior, and no story-tile navigation.
- [ ] Verify in-site UGC playback, focus restoration, pagination, reduced motion, and no story-card redirects on real desktop/mobile browsers.
- [ ] Test line/order discounts, tax-inclusive prices, cart notes, quantity changes, unit prices, and accelerated checkout.
- [x] Run mocked AJAX-cart JSDOM tests for add/change/remove/count/empty/cancel paths and external form-associated submission.
- [ ] Test AJAX cart drawer behavior against Shopify for section refresh, free-shipping progress, keyboard dismissal, and cart-page fallback.
- [x] Run JSDOM fixture tests for sticky PDP bar visibility and variant price/availability synchronization; the external form-associated submit path is covered in the mocked cart test.
- [ ] Verify sticky PDP add-to-cart and form association in a real Shopify storefront.
- [ ] Test customer account navigation, Follow on Shop, country/language selectors, and payment/social icons on eligible shops.
- [x] Static code audit confirms app blocks and Custom Liquid are optional extension points and the core theme has no required app dependency; this is not runtime QA.
- [ ] Test app-block and Custom Liquid insertion behavior in Shopify's Theme Editor.
- [ ] Finish the page-by-page PDP, collection, cart, blog/SEO, contact, and mobile design audit in a real development-store preview.
- [ ] Complete and verify the requested 100+ meaningful, working CRO controls across relevant theme sections; do not count duplicate or inert settings.

### Quality and listing readiness

- [x] Record author and company identity supplied by the owner: Sani Kumar / Akestech Infotech Pvt Ltd.
- [x] Record owner's pricing and test-access intent: USD $50 for the paid Theme Store listing; unpublished developer preview is free to test.
- [ ] Configure the final listing price and confirm Shopify's then-current listing and payout requirements.
- [ ] Confirm the final public theme name, Shopify Partner account identity, trademark availability, demo-store content, support process, and Theme Store listing assets.
- [x] Add a pre-release merchant guide and remove development-only README/Issues links from theme metadata.
- [ ] Replace the provisional branch-specific guide URL with the permanent docs URL, enable the prepared GitHub Pages workflow if desired, and set the official support email; the current support-email field is blank.
- [ ] Build an original skincare demo store with licensed imagery, real product data, accurate policies/navigation, and no placeholders or unverified ingredient/clinical claims.
- [ ] Validate keyboard/screen-reader behavior, focus order, contrast, reduced motion, form labels/errors, all image ratios/focal points, and realistic long/short content.
- [ ] Test latest supported desktop/mobile browsers and relevant social-app webviews.
- [ ] Test mobile/desktop Lighthouse performance and accessibility on the home, product, and collection templates with Shopify's benchmark dataset and populated sections.
- [x] Inventory static asset and dependency use: no runtime npm/pip package dependencies or remote third-party UI libraries/icon sets; development smoke tests use `jsdom` and are excluded from the theme package; fonts use Shopify's font picker, the gift-card QR uses Shopify's hosted `qrcode.js` helper, and the theme includes three local demo JPEGs.
- [ ] Verify and retain license/provenance records for selected fonts, the hosted QR helper, demo images, and any final store/listing assets before submission.
- [x] Package with Shopify CLI and inspect the generated ZIP for standard theme structure, key templates/configuration, the upstream license notice, and exclusion of the development-only test/package files (85 theme files); this local preflight is not a Theme Store review.
- [ ] Complete the official Shopify Theme Store review workflow against its then-current requirements.

Do not describe the theme as approved, submission-ready, compliant, or conversion-lifting until the relevant store tests, performance/accessibility review, and Shopify review are complete.
