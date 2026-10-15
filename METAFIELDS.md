# Suggested skincare product data

Define these fields in Shopify Admin (or create a setup app later). The theme reads values only when a merchant supplies them; it must not imply that missing data exists.

| Namespace/key | Suggested type | Use |
| --- | --- | --- |
| `custom.skin_types` | List of single-line text | Skin types the merchant says the formula is intended for |
| `custom.skin_concerns` | List of single-line text | Merchant-authored concern categories |
| `custom.routine_step` | Single-line text | Cleanse, treat, moisturize, protect, etc. |
| `custom.key_ingredients` | List of metaobject references or multi-line text | Ingredient story / active ingredients |
| `custom.inci_list` | Multi-line text | Full ingredient declaration supplied by the brand |
| `custom.how_to_use` | Rich text | Brand-approved usage instructions |
| `custom.cautions` | Rich text | Brand-approved warnings, patch-test or use guidance |
| `custom.formula_notes` | Rich text | Verified formulation, testing, sourcing, or packaging details |
| `custom.texture` | Single-line text | Sensory description, if supplied by the merchant |

For ingredient metaobjects, useful fields include the display name, INCI name, merchant-written description, image, and related products. Any efficacy or clinical statements should be substantiated by the merchant and reviewed for the markets where the product is sold. Do not treat the theme or an AI tool as a source of medical or regulatory advice.
