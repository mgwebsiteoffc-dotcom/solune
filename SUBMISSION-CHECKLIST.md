# Shopify Theme Store submission checklist

This project is a development foundation. A checked implementation item means code is present; it does not imply real-store behavior, Lighthouse results, or Shopify review have passed. Theme Check results are recorded separately below.

## Progress snapshot — 2026-10-22

- **70 of 95 tracked checklist items are marked implemented/prepared; 25 remain open.** This is a checklist count, not a theme-readiness percentage.
- The largest pending work is authenticated Shopify development-store QA, storefront accessibility/performance testing, Partner Dashboard listing/payout confirmation, name/trademark clearance, publishing the merchant docs URL, clearing asset licenses, and implementing/verifying 100+ meaningful CRO controls.
- As checked on 2026-10-22, Shopify's published listing range is USD $100–$500 in $10 increments; the owner has confirmed $100, the minimum allowed. The owner has also confirmed the theme name and Partner account identity; the public GitHub Issues support URL is set in Theme Info, and the owner-provided support email remains documented separately. No authenticated Shopify store or Partner Dashboard session is available, so account-specific payout details and store tests remain unverified. The owner reported Theme Store validation errors for a missing `theme_support_url` and missing preset listing folders/templates; those specific package issues are addressed in the latest package, but successful Shopify acceptance and live storefront QA are not verified.

## Current implementation

- [x] Start from the official Shopify Skeleton Theme v1.0.0, preserve its license, and document provenance.
- [x] Build an original, responsive skincare visual system with a curated section library and merchant-facing settings.
- [x] Add a development-only JSDOM smoke suite for selected storefront interactions; fixtures and mocked Shopify requests are not live-store or real-browser QA.
- [x] Add the two Shopify presets—Solune (skincare) and Wellness—alongside the 15-color role palette, modal/input/sale/rating color controls, editable radii, and product-card image proportions.
- [x] Expose Appearance, Colors, Typography, Currency format, Animation, Color swatch, Product card, Cart, Delivery availability, Social media, Favicon, Custom CSS, and Theme style settings with working storefront behavior.
- [x] Add standard Shopify review-metafield ratings, sale badges, currency-code formatting, configurable swatch styles, and cart display controls.
- [x] Add optional product-card secondary-image hover/focus, routine-step and unit-price visibility, and data-gated low-stock badges using Shopify-tracked inventory with a merchant-set threshold.
- [x] Add an off-by-default product-card savings display for selected variants, showing a localized money amount or rounded percentage only when Shopify's compare-at price exceeds its current price.
- [x] Add an off-by-default PDP Price-block savings display in amount or percentage format that updates with the selected variant and selling plan.
- [x] Add per-section desktop/tablet/mobile product-grid column controls to Collection, Featured Collection, and Product Recommendations sections.
- [x] Add a native AJAX cart drawer with quantity adjustment/removal, cart totals, optional free-shipping progress, and a cart-page fallback.
- [x] Add a scroll-aware PDP sticky add-to-cart bar synchronized with variant price and availability.
- [x] Add a configurable Indian PIN-code coverage list and PDP checker; the feature is client-side information only, not courier integration or checkout enforcement.
- [x] Expose Title H1–H4 visual styles and configurable sold-out, selector, swatch, variant-image, and size-chart controls in the product blocks.
- [x] Add editable Image with text, manually curated Instagram story/post/reel cards in a shared portrait-card style, a shoppable video carousel, and an editable FAQ section to the homepage template.
- [x] Make selected Shopify-hosted social videos play in the on-site story viewer with previous/next pagination; story/post/reel tile clicks stay on the storefront, while the external Instagram profile link remains separate.
- [x] Add cart-drawer order-note saving through Shopify Ajax, cart-line unit prices and discount comparisons, and a single cart-page savings total.
- [x] Add separate tablet and mobile layout rules, responsive gutters, and tablet two-column layouts for key editorial and product sections.
- [x] Align newsletter submit controls and collection price-range inputs; add compact, responsive filter disclosures.
- [x] Include Online Store 2.0 JSON templates, header/footer section groups, app blocks, Custom Liquid section/blocks, and a contact template.
- [x] Implement the required storefront templates: 404, article, blog, cart, collection, home page, collection list, page, contact page, password, product, search, and gift card; the contact page now has responsive editable store-detail cards, an optional help/FAQ link, Shopify form errors/status, and status focus management.
- [x] Add merchant-editable skin-concern and ingredient-index sections, dedicated concern/ingredient/routine page templates, and a local static design preview; source contracts and local routes pass, but authenticated Shopify behavior remains unverified.
- [x] Add Shopify-hosted Video with text, a responsive image gallery with merchant-set captions/links, and icon-highlight columns; include them in the homepage and populated static preview. Video playback requires a Shopify video to be selected.
- [x] Add responsive product-linked routine merchandising with Shopify product pickers, editable step labels/guidance, Shopify-derived price/media/PDP links, editor-only unassigned placeholders, and no empty live section; the local preview uses illustrative sample cards.
- [x] Add responsive editorial journal cards with Shopify article pickers, optional excerpt/date/author and blog link controls, editor-only empty guidance, and no empty live section; the local preview is not connected to Shopify article data.
- [x] Implement separate product option selectors, image/color swatches, variant deep links, variant-aware media/prices/availability, quantity selection, unit pricing, rich media, accelerated checkout, pickup availability, Shop Pay Installments, selling plans, and product recommendations.
- [x] Add a variant-aware quantity-selector block to Featured Product and include it in the default homepage setup.
- [x] Add an original Shop the Look section with editable product blocks, adjustable image hotspots, responsive image/list layouts, accessible product links, eligible quick add, and populated demo placeholders; retain the existing configurable Featured Product section on the homepage.
- [x] Add source-contract and JSDOM tests for the PIN/FAQ/story schemas plus the contact page's editable email/phone/address/hours details, help-page link, required fields, and success/error focus management; Shopify form delivery and live Theme Editor/browser validation remain open.
- [x] Add a customizable product-page block library for SKU, badges, ratings with an optional reviews link, separators, product variations, line-item properties, inventory, pickup, complementary products with block-level quick-add control, offers, icon features, text/collapsible text, an extra image, buttons, share links, on-site modals, and more-information content.
- [x] Implement gift card recipient email/name/message, scheduled delivery and timezone data, cart property display, QR code, gift card code, and Apple Wallet link.
- [x] Implement collection and search facets, sorting, responsive product results, predictive search, line/order discounts, tax-included messaging, cart notes, variant-rule-aware cart quantity edits, and accelerated cart checkout.
- [x] Implement customer account navigation, Follow on Shop, country/language localization, payment icons, social media icon settings, and favicon support.
- [x] Implement canonical/social metadata, Shopify Product/Article structured data, route-aware BreadcrumbList JSON-LD, and accessible visible breadcrumbs without replacing Shopify-managed `/agents.md` content.
- [x] Provide a reusable localized breadcrumb component on product, collection, collection-list, search, blog, article, page/contact, cart, and 404 templates.
- [x] Run `node --check` on storefront JavaScript assets.
- [x] Parse all Liquid files with Shopify's Liquid HTML parser; parse standalone JSON and embedded section schemas; audit translation keys.
- [x] Parse the theme stylesheets with PostCSS.
- [x] Run Shopify Theme Check with Shopify CLI via `npx`; the earlier pre-metadata-edit run inspected 66 files with no offenses (the latest result is recorded below).
- [x] Run Shopify Theme Check on the latest working tree (`npx --yes @shopify/cli@latest theme check`); the 2026-10-22 run inspected 88 files with no offenses.
- [x] Validate section range schemas and fix the collection, featured-collection, and product-recommendations mobile-column controls to expose at least three values while keeping the default at two.
- [x] Review storefront output handling: escape reflected search terms, customer comments, merchant-provided menu/pickup labels, plain-text excerpts, and canonical/social metadata URLs; reject cross-origin cart/search/recommendation endpoints and pickup redirects; add source and DOM security tests. Merchant-authored rich-text bodies remain intentionally rendered as Shopify content.
- [x] Pin GitHub Actions to verified full commit SHAs, disable unnecessary persisted checkout credentials, pin the CI runner to Ubuntu 24.04, and keep each workflow's `GITHUB_TOKEN` permissions scoped to required tasks.
- [x] Run `npm audit`; no known vulnerabilities were reported across the dependency tree on 2026-10-22 (the only direct dependency is development-only `jsdom`).
- [ ] Run the theme on an authenticated Shopify development store and verify Theme Editor behavior, app-injected content, and live storefront security-sensitive flows.
- [ ] Verify the PIN-code setting/block, FAQ question blocks, and story/post/reel content-type/media/profile-link controls in Theme Editor; then test their populated storefront output on desktop and mobile.
- [ ] Test the theme against Shopify's benchmark store and record Lighthouse performance/accessibility scores.

## Pre-submission verification

### Required shopping flows

- [x] Run a JSDOM fixture test for direct variant-selector changes, sold-out UI, price/SKU/variant-URL updates, and quantity-rule minimum/increment/maximum normalization.
- [x] Run a JSDOM fixture for two-option color/size selectors, variant resolution, sold-out label/state, add-to-cart status, price/URL updates, and featured-media scroll selection.
- [x] Verify a Featured Product fixture serializes an external quantity field with the selected variant and applies variant-specific minimum/increment/maximum rules.
- [ ] Verify single- and multi-option products against real Shopify data, including Shopify-rendered swatch images/colors, unavailable combinations, variant media/prices and savings, optional/required selling-plan prices, and quantity minimums, increments, and maximums.
- [x] Audit PDP/sticky, product-card, video, Featured Product, cart-page, and accelerated-checkout purchase paths at source level; guard quick add for variants, gift cards, selling plans, and minimum quantities; document remaining PDP-only and client-side bypasses. This is not live shopper QA.
- [x] Run JSDOM fixture checks for optional-plan discount/compare-at pricing, required-plan variant matching, unavailable-plan add-to-cart state, and PDP savings updates across variant and plan prices.
- [ ] Test Shopify selling-plan submissions and cart display on optional- and required-subscription products.
- [x] Run a JSDOM fixture test for recipient-field required/disabled state, enabled/disabled form-property serialization, and the local 90-day date boundary across the New York spring-DST transition.
- [ ] Test Shopify gift-card recipient validation, scheduled delivery/timezone handling, cart properties, QR rendering, and Apple Wallet.
- [x] Run mocked pickup-availability tests for variant-specific requests, stale-response protection, and hiding an empty availability block.
- [ ] Test Shopify pickup availability for available/unavailable locations and multiple real variants.
- [x] Verify with JSDOM that collection price-range controls update visible/ARIA values, clamp crossing bounds, and sorting auto-submits; no Shopify-generated facets or server filtering were tested.
- [x] Exercise predictive-search request parameters, short-query handling, mock result/empty states for product, collection, page, and article items, keyboard selection, Escape/focus return, and live status; requests and result HTML are mocked.
- [ ] Test collection/search filters, sorting, empty states, pagination, predictive search, and all supported search result types against real Shopify storefront data; verify responsive column controls at real breakpoints and the product-card image, routine-step, unit-price, savings-display, tracked low-stock controls, and PDP price-block savings settings with real products in Theme Editor.
- [x] Run JSDOM fixture tests for story/modal focus return, mocked in-site playback, story-viewer and video-carousel pagination, reduced-motion carousel behavior, and no story-tile navigation; the same viewer hooks serve the curated story/post/reel card types. Real-browser verification remains open.
- [x] Test the PIN checker in JSDOM for valid and invalid six-digit Indian PINs, configured-listed/unlisted coverage, and the blank/unconfigured list state; no courier API or Shopify checkout was tested.
- [x] Extend tests for PIN-checker initialization on Shopify section load and source-contract coverage of secondary-image, routine-step, unit-price, savings, and low-stock product-card settings, compare-at/inventory gates, translations, and CSS.
- [x] Add source-contract coverage for responsive grid schema defaults, inline settings, translations, and desktop/tablet/mobile CSS.
- [ ] Verify story/post/reel on-site playback, focus restoration, pagination, reduced motion, and no tile redirects on real desktop/mobile browsers.
- [x] Run a mocked cart-note save test covering the `/cart/update.js` payload, submit-button busy state, and live confirmation.
- [ ] Verify Shopify line/order discounts, tax-inclusive prices, cart notes, quantity changes, unit prices, and accelerated checkout.
- [x] Run mocked AJAX-cart JSDOM tests for add/change/remove/count/empty/cancel paths, form-associated submission, and variant min/increment/max enforcement including rounding to a valid cart quantity.
- [x] Verify in JSDOM that native product/cart form submissions remain un-intercepted when the optional drawer is absent or the form is a checkout action.
- [x] Run a mocked add-error case to verify the server message is exposed as an alert and the enabled submit button regains focus after its busy/disabled state is restored.
- [ ] Test AJAX cart drawer behavior against Shopify for section refresh, free-shipping progress, keyboard dismissal, and cart-page fallback.
- [x] Run JSDOM fixture tests for sticky PDP bar visibility and variant price/availability synchronization; the external form-associated submit path is covered in the mocked cart test.
- [ ] Verify sticky PDP add-to-cart and form association in a real Shopify storefront.
- [ ] Test customer account navigation, Follow on Shop, country/language selectors, and payment/social icons on eligible shops.
- [x] Static code audit confirms app blocks and Custom Liquid are optional extension points, the core theme has no required app dependency, and Instagram stories/posts/reels are manually curated Shopify image/video blocks with a separate profile link and no Instagram API synchronization; this is not runtime QA or Shopify Theme Store approval.
- [ ] Test app-block and Custom Liquid insertion behavior in Shopify's Theme Editor.
- [ ] Finish the page-by-page PDP, collection, cart, blog/SEO, contact, and mobile design audit in a real development-store preview.
- [ ] Complete and verify the requested 100+ meaningful, working CRO controls across relevant theme sections; do not count duplicate or inert settings.

### Quality and listing readiness

- [x] Record author and company identity supplied by the owner: Sani Kumar / Akestech Infotech Pvt Ltd.
- [x] Record owner's confirmed desired price and test-access intent: USD $100 for the paid Theme Store listing; unpublished developer preview is free to test.
- [ ] Configure the confirmed USD $100 listing price in the Partner Dashboard and verify Shopify's then-current payout requirements. As checked 2026-10-22, $100 is the minimum of Shopify's published USD $100–$500 range in $10 increments. Published revenue-share guidance lists 15% of gross theme sales, a 2.9% billing processing fee, applicable sales tax, and possible regional operating fees; account-specific payout/tax details still need Partner Dashboard confirmation.
- [x] Record owner confirmation of public theme name **Solune** and Shopify Partner account identity **Akestech Infotech Pvt Ltd**; the theme metadata uses Solune. This confirms the owner's selection only, not name-conflict or trademark clearance.
- [x] Add per-preset listing drafts (industry, tagline, description, features) and populated homepage templates for the two presets in `config/settings_data.json`; verified demo-store details, catalog sizes, screenshots, and remaining Partner Dashboard information are still open.
- [ ] Verify trademark/name-conflict clearance for Solune and complete demo-store content, support process, and Theme Store listing assets. The author and support email are recorded; the legal and operational checks remain open.
- [x] Add the pre-release merchant guide, document the owner-provided support email, keep the branch-specific documentation URL, and configure public GitHub Issues as `theme_support_url`; Shopify's metadata schema permits either email or URL, not both.
- [ ] Replace the provisional branch-specific guide URL with a permanent public docs URL. The Pages workflow is present on this branch but is not listed among active repository workflows; it must reach the default branch, Pages must be enabled with GitHub Actions by a repository admin, and deployment must succeed. Theme Info currently uses the public issue tracker as its one allowed support channel; the owner-provided support email is documented separately.
- [ ] Build an original skincare demo store with licensed imagery, real product data, accurate policies/navigation, and no placeholders or unverified ingredient/clinical claims.
- [ ] Validate keyboard/screen-reader behavior, focus order, contrast, reduced motion, form labels/errors, all image ratios/focal points, and realistic long/short content.
- [ ] Test latest supported desktop/mobile browsers and relevant social-app webviews.
- [ ] Test mobile/desktop Lighthouse performance and accessibility on the home, product, and collection templates with Shopify's benchmark dataset and populated sections.
- [x] Inventory static asset and dependency use: no runtime npm/pip package dependencies or remote third-party UI libraries/icon sets; development smoke tests use `jsdom` and are excluded from the theme package; fonts use Shopify's font picker, the gift-card QR uses Shopify's hosted `qrcode.js` helper, and the theme includes three local demo JPEGs. `ASSET-PROVENANCE.md` records dimensions, checksums, and known sources while explicitly flagging unverified licenses; it does not close the separate license-clearance item.
- [ ] Verify and retain license/provenance records for selected fonts, the hosted QR helper, demo images, and any final store/listing assets before submission; `ASSET-PROVENANCE.md` inventories current sources and explicitly flags unresolved clearance, so this item remains open.
- [x] Package with Shopify CLI and inspect `Solune-0.1.0.zip` for standard theme structure, skincare discovery/media sections, templates, theme configuration, and exclusion of local preview/docs/tests/package files (99 theme files); ZIP integrity passes, but this local preflight is not a Theme Store review.
- [ ] Complete the official Shopify Theme Store review workflow against its then-current requirements; verify codebase eligibility/originality and confirm the manually curated Instagram story/post/reel modules comply with restrictions on app-dependent or API-dependent app-like features.

Do not describe the theme as approved, submission-ready, compliant, or conversion-lifting until the relevant store tests, performance/accessibility review, and Shopify review are complete.
