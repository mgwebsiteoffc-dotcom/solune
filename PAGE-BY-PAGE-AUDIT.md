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
| Home | Editorial hero, all-products collection, first-available featured product, ingredient story, routine steps, newsletter, announcement, and footer content. Generated hero/ingredient/product images appear when merchant imagery or catalog products are missing. | Verify the rendered Shopify preview, real product/media data, image art direction, responsive spacing, merchandising hierarchy, and Theme Editor controls. Demo imagery is a fallback, not live-store product photography. |
| Collection | Product grid, sort, filters, price range, pagination, cards. Theme Editor can switch price filters between a dual-range slider and min/max fields, show list/availability facets as checkboxes or chips, and toggle counts. | Test filter combinations/clear state, slider behavior across currencies, mobile filter UX, sorting, empty states, pagination, merchandising controls, and Theme Editor visibility in Shopify. Shopify still defines whether each facet is a price range or a discrete list. |
| Search | Predictive search and mixed product/content results | Test keyboard/empty/error states, result types, filters, sort, and relevance; audit search metadata. |
| Product detail (PDP) | Variant selection, selling plans, media, skincare metafields, ratings, recommendations, sticky CTA. Theme Editor controls now cover desktop grid/stacked media, columns and spacing, mobile grid/slider with dots, image zoom level, video autoplay/looping, and product-info width. | Verify the settings appear and behave in Shopify; test gallery swipe/dots, variant-to-media navigation, zoom, video behavior, mobile layout, buy-box hierarchy, trust/shipping information, reviews, subscriptions, and app blocks. |
| Cart drawer/cart | AJAX drawer plus full cart page, notes, discounts, quantities, checkout | Verify add/change/remove, accelerated checkout, localized routes, empty state, free-shipping threshold, discount/plan lines, and all fallbacks in Shopify. |
| Blog/article | Blog index, article content/comments, article metadata | Audit editorial layouts, image/author/date behavior, pagination, internal links, and BlogPosting/breadcrumb structured data. |
| Contact/pages | Contact form, standard content page, 404 | Verify form errors/success and visible fields; review empty and long-content layouts. |
| Header/footer/localization | Responsive navigation, search, account link, social icons, localization selectors | Check mobile menu, focus/keyboard behavior, overlays, locale routing, account states, footer forms, and real store branding. |
| SEO/AEO | Canonical/social metadata and Product/Article structured data | Validate rendered metadata on every route; add/verify breadcrumb and blog structured data where appropriate; test duplicate/missing titles and descriptions. |

## CRO settings target

The requested **100+ CRO options are not complete yet**. Build them as meaningful, working controls attached to the relevant page/section—such as merchandising, trust, bundles/recommendations, urgency where truthful, cart progress, and content hierarchy. Do not inflate the count with duplicate or non-functional switches, and do not make unsupported skincare or shipping claims.

## Definition of done per page

1. Theme Check, schema and translation validation pass.
2. Desktop and mobile screenshots show intentional layout with no missing/unstyled controls.
3. Primary and error/empty states work with real Shopify data and routes.
4. Keyboard, focus, reduced-motion, contrast, and screen-reader behavior are checked.
5. SEO metadata and structured data are verified in rendered storefront HTML.
