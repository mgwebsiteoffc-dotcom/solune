# Asset provenance and license register

**Audit date:** 2026-10-22  
**Status:** Inventory only; this document is not a license grant or legal clearance. Items marked unverified must not be represented as cleared for a Theme Store demo, listing, or merchant store.

## Theme source

| Item | Current record | Status / action |
|---|---|---|
| Shopify Skeleton Theme v1.0.0 | Upstream repository and MIT notice are recorded in [`UPSTREAM.md`](UPSTREAM.md), `LICENSE.md`, and `assets/LICENSE.txt`. | Retain the notices. Re-check current Theme Store eligibility and originality requirements before submission. |

## Bundled preview images

These JPEGs are used as clearly labeled theme-preview fallbacks, not as factual product photography. The three binary files first appear together in commit [`1bb3c4a`](https://github.com/mgwebsiteoffc-dotcom/solune/commit/1bb3c4ab655cafa6df7e3b53ea61a55d4945fe1c) (2026-10-16). That commit contains no source URLs, creator credits, prompts, or license documents; the commit date and visual content do not prove rights.

| File | Dimensions | SHA-256 | Known source record | Clearance |
|---|---:|---|---|---|
| `assets/demo-hero.jpg` | 1264 × 848 | `9eb8d25e5162a4811a2c5d4b9e26a728d2860cdd2ba0b4ac45e390f08703b2b0` | Recorded in the project history as an AI-generated preview image; the exact prompt, generation record, and applicable output-use terms are not retained here. | **Unverified.** Preserve the generation record/terms or replace it with an asset whose commercial rights are documented. |
| `assets/demo-ingredient.jpg` | 928 × 1152 | `87834c086a4a97b843a4cdfbef1b83d673e0ca80932749ad2f9d313eeb05bc14` | No source, creator, prompt, or license record found in the repository history. | **Unverified.** Identify and retain the source and commercial-use permission, or replace it. |
| `assets/demo-product.jpg` | 928 × 1152 | `d5468018eb4cc0b752c2ce39e3d937e86586b189fc55fe0ccb3ddb76b6a02e07` | No source, creator, prompt, or license record found in the repository history. | **Unverified.** Identify and retain the source and commercial-use permission, or replace it. |

Do not use these preview images as a substitute for a populated demo store with actual, brand-authorized product media. Keep the visible preview labels and replace the images before a final Theme Store demo if clearance is not established.

## Fonts

The theme bundles no font files. Typography is selected through Shopify's `font_picker` settings and rendered through Shopify's Liquid `font_face` filter. The current development settings select `work_sans_n4` (Work Sans) and `libre_baskerville_n4` (Libre Baskerville). Record the exact families used by the final demo store and retain Shopify's applicable font-library terms/attribution before submitting listing imagery. No independent font-license document is currently stored in this repository.

## Shopify-hosted gift-card assets

| Asset | Implementation/source reference | Status / action |
|---|---|---|
| QR-code helper | `templates/gift_card.liquid` loads `vendor/qrcode.js` using Shopify's `shopify_asset_url`; the helper is not vendored in this repository. | The theme code identifies Shopify as the delivery source, but does not record a helper version or its license text. Confirm Shopify's applicable use/license documentation for the submission record; do not describe a third-party license as verified from this repository alone. |
| Apple Wallet badge | `templates/gift_card.liquid` references Shopify's `gift-card/add-to-apple-wallet.svg` using `shopify_asset_url`. | Shopify-hosted asset; retain the Shopify source reference and verify any then-current use requirements before submission. |

## Final demo-store and listing assets

No final demo-store catalogue, product photography, policy copy, screenshots, or Theme Store listing media is recorded in this repository. Before launch, create an asset register for each such item with its creator/source, acquisition or generation date, license/permission, permitted channels and territories, attribution requirements, and a file checksum. Verify that product facts and policies are owner-approved and not inferred from placeholder imagery.

## Sign-off needed

The provenance checklist item should remain open until every asset actually used in the public demo and listing has a retained source/license record, the relevant commercial-use scope is confirmed, and the owner has approved the final content. This register documents gaps; it does **not** clear any unverified image, font, or hosted helper for commercial publication.
