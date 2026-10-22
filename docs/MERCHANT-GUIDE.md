---
layout: default
title: Solune merchant guide
permalink: /merchant-guide/
description: Store setup and product-content guidance for the Solune skincare Shopify theme.
---

# Solune merchant guide

Solune is an original Shopify Online Store 2.0 theme for skincare brands. This guide explains how to configure the theme without inventing product facts. Solune is still a development theme: its Shopify storefront behavior, Theme Editor experience, and Theme Store readiness have not yet been verified in an authenticated development store.

## 1. Preview the correct theme

1. In Shopify Admin, open **Online Store → Themes** and use **Customize** on the Solune preview theme you intend to edit.
2. Make changes in that theme's editor and press **Save**.
3. Use that same theme's **Preview** link to review the result. Do not expect edits to an unpublished preview to change the currently published storefront.
4. For code changes, upload/push to the intended unpublished theme first; a local code change alone does not update a Shopify theme.

Keep the preview unpublished while preparing the store. Use real products, policies, navigation, and brand-approved copy before presenting it to customers.

## 2. Brand appearance and storefront settings

In the theme editor, use **Theme settings** to choose a theme style and adjust colors, typography, currency display, motion, swatches, product cards, cart behavior, social links, favicon, and custom CSS. The typography controls use Shopify's font picker. In **Theme settings → Product card**, merchants can optionally show a second product image on hover/keyboard focus, toggle routine-step and Shopify unit-price details, and show an accurate low-stock badge for tracked stock with a configurable threshold. Touch layouts retain the primary image; unit prices appear only when Shopify provides measurement data, routine steps only when the product metafield is filled, and variants that allow selling past zero are never shown as low stock. Changing a setting only changes the theme being edited; verify the saved preview before assuming a change is live.

Replace demo imagery with licensed, brand-owned product and editorial photography before launch. Set useful alt text and review focal points and crops on desktop and mobile. The bundled `demo-*.jpg` files are visual fallbacks, not real product photography or claims about a product.

## 3. Product data and the product page

Create products in Shopify Admin and provide accurate titles, prices, inventory, variants, media, descriptions, and policies. Product media is drawn from the product's Shopify media gallery. The separate **Image** product-information block is additional editorial content; it does not replace or configure the gallery.

The Product section has a reorderable media block and product-information blocks, including title, vendor, rating (optionally linked to a reviews section or page), price, variants, quantity, buy buttons, PIN-code delivery checker, description, ingredients, skin profile, usage, image, collapsible text, modal, button, share links, SKU, badges, separators, line-item properties, inventory, pickup availability, complementary products, offers, feature-with-icon, and more-information content. Add only content that is accurate for that product. The default rating and pickup blocks may render no visible content until Shopify supplies the relevant data or availability. The default product template includes the PIN-code checker; configure its coverage list as described below.

To configure the product-page PIN checker, open **Theme settings → Delivery availability** and enter exact six-digit Indian PIN codes separated by commas, spaces, or new lines. The list is delivered to the storefront and checked in the browser; it is not a live courier lookup, must not be treated as a checkout restriction, and should contain only accurate coverage data. Leave it blank until verified. Shopify shipping profiles and checkout remain authoritative for actual rates and availability. An optional delivery-policy page can be selected in the Product block.

Use the metafields in [`METAFIELDS.md`](https://github.com/mgwebsiteoffc-dotcom/solune/blob/arena/b7b66b26-solune/METAFIELDS.md) for optional skincare information such as skin types, concerns, routine step, ingredients, usage, cautions, formula notes, and texture. These fields are merchant-entered content; the theme does not substantiate clinical, efficacy, safety, certification, or regulatory claims.

### Variants, subscriptions, and quick add

- Configure option names, values, images, swatches, stock, and prices on the Shopify product. The theme reads Shopify's variants and availability; it does not create missing options.
- The variant picker can use buttons or a dropdown and can expose swatches, named option-image choices, sold-out handling, and a size-chart page.
- Selling-plan choices appear when Shopify provides plans and the Product section allows them or the product requires a plan. Test actual optional- and required-plan products before launch.
- Product-card and complementary-product quick add are limited to available, single-variant products with no gift-card recipient flow, selling plans, or minimum quantity above one. Other products link to their product page so shoppers can choose options or enter recipient/scheduled-delivery details. These quick-add forms cannot include PDP-only personalization fields or app blocks; turn quick add off when those fields are operationally required.
- The homepage Featured Product section has a configurable quantity block (included by default on the homepage) and a variant-aware Shopify quantity rule. It has a separate purchase form and does not inherit the PDP's line-item-property blocks or app-block setup. It accepts its own app blocks, but verify their form association before relying on them for required product data. Shoppable-video cards likewise have their own purchase forms and can skip PDP-only fields; use these shortcuts only for products that do not require those fields or provide equivalent inputs on that section. Video-card direct add is limited to available single-variant products without gift-card recipient flows, selling plans, or minimum quantity above one; products needing choices route to the PDP and unavailable simple products show a disabled sold-out CTA.
- Required personalization, quantity limits, and gift-card date bounds in the theme are browser-side controls. Edited requests can bypass HTML/JavaScript constraints; confirm Shopify or an app enforces any rule that must be mandatory for fulfillment.
- The rating block can optionally link to a reviews section/page you configure. The link is only rendered when Shopify's standard `reviews.rating` and `reviews.rating_count` metafields are present; the product-card rating is hidden without those values. No review app is required just to display values already supplied in the metafields.

## 4. Collections and search

Create and populate Shopify collections, then configure the collection section's description, filters, price-filter style, filter-value style, counts, sorting, product-card options, and page size. Shopify controls which storefront filters are available; configure product/collection metafields and filters in Shopify's Search & Discovery tools where appropriate. Check empty collections and no-result search pages after catalog setup.

## 5. Cart and checkout

The theme's cart drawer is a native Shopify Ajax enhancement with a cart-page fallback. In **Theme settings → Cart**, merchants can enable the drawer, optionally enable free-shipping progress, set a threshold, and control cart images, vendor, order note, tax/shipping notes, and the continue-shopping link. Cart quantity controls reflect each variant's minimum, increment, and maximum; the drawer also retains a dedicated Remove action. Verify how Shopify handles rule changes for items already in a cart. Set any shipping threshold to match the store's actual policy and currency. Product and featured-product blocks may expose Shopify's accelerated checkout button, and the cart page renders Shopify's additional checkout buttons. These alternate routes can bypass the drawer and its optional note/progress UI; whether cart-page buttons preserve unsaved quantity or note edits must be checked on a development store. Disable dynamic checkout where shoppers must review/save cart details first, and verify actual enabled payment methods. The theme cannot change Shopify's checkout policy or promise shipping terms that the merchant has not configured.

Gift cards and their recipient/scheduled-delivery fields use Shopify's gift-card flow. Pickup availability depends on Shopify locations and inventory. Test both with the store's actual products and locations.

## 6. Homepage stories and video

The **Stories, posts & reels** section uses one horizontal 4:5 portrait-card style for manually curated Instagram stories, image posts, and reels. Choose a content type and add licensed images or Shopify-hosted video; tapping a tile opens the on-site viewer, and selected videos play there without redirecting. Set the separate section profile link or the global Instagram URL for the external follow link. The theme does not import Instagram content automatically; no Instagram API connection is included. The separate shoppable-video carousel uses matching portrait cards, Shopify-hosted videos, and an optional product per card; its video plays inline and its product CTA follows the safe quick-add/PDP rules above. The homepage FAQ section has editable questions and answers—replace defaults with accurate brand information and avoid unsupported skincare or medical claims. Test media, focus return, captions, reduced-motion behavior, and mobile layout on real devices.

## 7. Optional apps and custom content

Product and featured-product sections expose optional Shopify app blocks. The theme also includes Custom Liquid insertion points. These are extension points, not dependencies of the core theme. If an app is installed, review its markup, performance, accessibility, privacy behavior, and support requirements separately.

## 8. SEO, localization, and launch review

Set page titles, descriptions, product data, navigation, domain, policies, and translations in Shopify. Solune outputs canonical/social metadata, product/article structured data, and route-aware breadcrumbs from the available Shopify data. Validate the rendered storefront after content is added; structured data does not replace accurate page content or guarantee search features.

Before publication, test product variants and quantity rules, subscriptions, gift cards, pickup, collection/search, video/story playback, cart/discount/tax flows, keyboard and screen-reader behavior, responsive layouts, and current desktop/mobile browsers. Run Lighthouse on populated home, product, and collection pages. A Theme Check pass is static validation, not live storefront QA or Theme Store approval.

## Support status

The official support email `akestechinfotech@gmail.com` is set in Theme Info. The merchant guide URL remains branch-specific until a permanent public documentation URL is enabled. Do not send passwords, API keys, or customer data when requesting support.
