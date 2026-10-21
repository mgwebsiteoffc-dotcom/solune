# Solune page-by-page build and QA plan

A Theme Check pass does not mean a storefront page looks finished. Each page below remains open until it is inspected in a real Shopify development store at desktop and mobile widths and its interactions are tested.

## Screenshot-driven first pass

- **Theme upload:** The author metadata now uses `Sani Kumar` (within Shopify's 25-character limit). The latest user-reported CLI push also rejected `max` on the cart free-shipping number setting and warned about `.github/` in `.shopifyignore`; the local fix removes `min`/`max` and uses the recursive `.github/**` pattern. A fresh Shopify upload is still required to confirm acceptance.
- **Contact page:** Contact inputs and textarea now have explicit visible, high-contrast styles. Recheck the exact uploaded preview because the supplied screenshot showed labels without visible controls.
- **Header/account:** Replaced the default `<shopify-account>` popover (including its externally styled Shop sign-in panel) with a theme-styled account link.
- **Cart:** Added an AJAX cart drawer with line quantity controls/removal, updated counts and totals, optional free-shipping progress, accessible close behavior, and normal cart-page fallbacks. Real Shopify Ajax/section-rendering behavior still needs development-store verification.
- **Product page:** Added a scroll-aware sticky add-to-cart bar that follows the selected variant's price and availability. This is a first PDP improvement, not a completed product-page design.

## Remaining route audit

| Page/flow | Current code baseline | Work still required |
| --- | --- | --- |
| Home | Editorial hero, all-products collection, first-available featured product, image-with-text, ingredient story, routine steps, manually curated Instagram-story cards that open an in-site story viewer, shoppable portrait video cards that play inline with product add-to-cart, newsletter, announcement, and footer content. Generated hero/ingredient/product images appear when merchant imagery or catalog products are missing. | Verify rendered Shopify playback and cart-drawer behavior on desktop/mobile, confirm story/video play never navigates away, test story-dialog close/focus restoration, pagination and keyboard controls, real product/video data, image art direction, responsive spacing, merchandising hierarchy, and Theme Editor controls. Instagram stories are manually curated and do not connect to Instagram’s API. Demo imagery is a fallback, not live-store product photography. |
| Collection | Product grid, sort, filters, price range, pagination, cards. Theme Editor can switch price filters between a dual-range slider and min/max fields, show list/availability facets as checkboxes or chips, and toggle counts. | Test filter combinations/clear state, slider behavior across currencies, mobile filter UX, sorting, empty states, pagination, merchandising controls, and Theme Editor visibility in Shopify. Shopify still defines whether each facet is a price range or a discrete list. |
| Search | Predictive search and mixed product/content results | Test keyboard/empty/error states, result types, filters, sort, and relevance; audit search metadata. |
| Product detail (PDP) | The default template includes a Product media block plus vendor, title, rating with an optional reviews link, price, product variations, quantity, buy buttons, pickup availability, description, ingredient details, skin profile, and how-to-use blocks. The product-information Add block menu also exposes SKU, badges, separators, line-item properties, inventory, complementary products with an optional quick-add control (subject to the global product-card quick-add switch), offers, feature-with-icon, generic and collapsible text, an extra Image block, Button, Share buttons, Modal, and More information. Product media renders `product.media` automatically and offers one-column grid, two-column grid, highlighted-first grid, left/bottom thumbnail carousels, or a dots carousel, plus image ratio, spacing, mobile layout/controls, zoom, and video settings. Title blocks expose H1–H4 visual styles; variant-picker blocks expose sold-out hiding, Block/Dropdown selectors, swatch presentation, named option-image choices, and an optional size-chart page. Vendor/price styles, quantity stepper with variant quantity-rule min/max/increment support, description accordion, and text styles are also configurable. | Verify every Product media layout and new product-information block appears and behaves in Shopify's Theme Editor; test modal keyboard/focus behavior, image alt text, line-item properties through add-to-cart, inventory/pickup variant changes, share links, and complementary quick-add behavior through the cart drawer; test real product variants, sold-out option combinations, Shopify swatches, named variant images, size-chart links, gallery controls/zoom/video, mobile layout, buy-box hierarchy, trust/shipping information, reviews, subscriptions, and app blocks. Product-specific skincare content still must come from merchant product data; don't invent claims. |
| Cart drawer/cart | AJAX drawer plus full cart page, order-note saving, line quantity/remove controls, per-line price/savings, cart savings summary, free-shipping progress, and checkout | Verify add/change/remove, order-note persistence, accelerated checkout, localized routes, empty state, free-shipping threshold, discount/plan lines, and all fallbacks in Shopify. |
| Blog/article | Blog index, article content/comments, Shopify Article structured data, and visible route-aware breadcrumbs/BreadcrumbList JSON-LD | Audit editorial layouts, image/author/date behavior, pagination, internal links, and rendered structured data in Shopify. |
| Contact/pages | Contact form, standard content page, 404 | Verify form errors/success and visible fields; review empty and long-content layouts. |
| Header/footer/localization | Responsive navigation, search, account link, social icons, localization selectors | Check mobile menu, focus/keyboard behavior, overlays, locale routing, account states, footer forms, and real store branding. |
| SEO/AEO | Canonical/social metadata, Shopify Product/Article structured data, route-aware BreadcrumbList JSON-LD, and accessible visible breadcrumbs on key routes | Validate rendered metadata and schema on every route in Shopify; test duplicate/missing titles and descriptions and search-engine reporting. |

## CRO settings target

The requested **100+ CRO options are not complete yet**. Build them as meaningful, working controls attached to the relevant page/section—such as merchandising, trust, bundles/recommendations, urgency where truthful, cart progress, and content hierarchy. Do not inflate the count with duplicate or non-functional switches, and do not make unsupported skincare or shipping claims.

## Definition of done per page

1. Theme Check, schema and translation validation pass.
2. Desktop and mobile screenshots show intentional layout with no missing/unstyled controls.
3. Primary and error/empty states work with real Shopify data and routes.
4. Keyboard, focus, reduced-motion, contrast, and screen-reader behavior are checked.
5. SEO metadata and structured data are verified in rendered storefront HTML.
