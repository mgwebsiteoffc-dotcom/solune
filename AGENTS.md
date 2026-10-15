# Solune coding-agent guide

## Product and design

- Solune is a skincare-only Shopify Online Store 2.0 theme intended exclusively for Shopify Theme Store distribution.
- Use an original visual system: warm mineral surfaces, deep botanical ink, restrained chartreuse accents, editorial serif display type, and clear product education.
- Prestige is a quality reference only. Never copy its source, markup, distinctive layouts, component patterns, assets, text, branding, or screenshots. Do not fork Prestige, Dawn, or Horizon.
- Don't invent product efficacy, ingredient concentrations, dermatologist/clinical claims, certifications, or safety guidance. Product facts must come from merchant-entered product data.

## Shopify architecture

- This theme is based on Shopify Skeleton Theme v1.0.0. Keep JSON templates, sections, section groups, merchant-addable sections, and app-block compatibility.
- Use Liquid/HTML for essential content and progressively enhance with small, native JavaScript modules.
- Keep every required storefront template. Keep the Custom Liquid section available on section-capable templates.
- The main product section must support reorderable content blocks and `@app` blocks. Optional app integrations must not become dependencies of core shopping flows.
- Use `routes.*` for storefront URLs, responsive Shopify image filters, semantic HTML, unique form IDs, visible keyboard focus, and locale keys for customer-facing UI.
- Don't add `robots.txt.liquid`, `config/markets.json`, or custom `agents.md`/`llms.txt` templates without a documented platform need. Shopify's managed agent-discovery content keeps UCP/MCP details current; the theme should not replace it casually.
- Keep third-party code, fonts, and images properly licensed. Never ship private credentials or API keys in theme assets.

## Quality gates

Before marking work complete:

1. Run `shopify theme check` when Shopify CLI/Theme Check is available.
2. Parse all JSON templates, section-group JSON, settings schema/data, embedded section schemas, and locale files.
3. Audit all content and schema translation keys.
4. Verify required templates, presets, product app blocks, account component visibility, and pickup/recommendation flows.
5. Test mobile and desktop in a Shopify development store, including keyboard interaction, missing images, app blocks, variants, selling plans, currency/language selectors, and cart discounts.
6. Check Lighthouse performance and accessibility on home, product, and collection templates. Passing Theme Check or the Theme Store minimum alone doesn't make a theme submission-ready.

## Scope

Implement one independently testable component at a time. Keep merchant settings purposeful and grouped; don't add switches just to inflate a feature count. Update `SUBMISSION-CHECKLIST.md` when a review requirement is implemented or tested.
