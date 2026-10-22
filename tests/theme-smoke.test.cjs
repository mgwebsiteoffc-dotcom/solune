const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

process.env.TZ = 'America/New_York';

const themeScript = fs.readFileSync(path.join(__dirname, '../assets/theme.js'), 'utf8');
const cartScript = fs.readFileSync(path.join(__dirname, '../assets/cart-drawer.js'), 'utf8');
const predictiveSearchScript = fs.readFileSync(path.join(__dirname, '../assets/predictive-search.js'), 'utf8');
const pickupAvailabilityScript = fs.readFileSync(path.join(__dirname, '../assets/pickup-availability.js'), 'utf8');

const createDom = (markup, url = 'https://shop.example/') => {
  const dom = new JSDOM(markup, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
  window.requestAnimationFrame = (callback) => setTimeout(() => callback(0), 0);
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
  if (window.HTMLDialogElement) {
    window.HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', ''); };
    window.HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
      this.dispatchEvent(new window.Event('close'));
    };
  }
  return dom;
};

const waitFor = async (predicate, message = 'Timed out waiting for mocked storefront state.') => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(message);
};

test('variant and sticky-cart changes sync price, sold-out state, URL, SKU, quantity rules, and visibility', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <section data-product-root data-current-variant-id="101" data-sold-out-label="Sold out">
      <select data-variant-select name="id"><option value="101" selected>30 ml</option><option value="202">60 ml</option></select>
      <input type="number" data-product-quantity value="99" min="1" step="1">
      <span data-product-price></span><s data-compare-price hidden></s>
      <p data-variant-status data-available="Available" data-unavailable="Unavailable" data-plan-unavailable="Subscription unavailable"></p>
      <button type="button" data-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button>
      <div data-product-sticky-bar hidden>
        <span data-sticky-product-price></span>
        <button type="button" data-sticky-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button>
      </div>
      <div class="product-block"><p data-product-sku><span data-product-sku-value></span></p></div>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules></script>
    </section>
  </body></html>`, 'https://shop.example/products/test');
  const { window } = dom;
  const root = window.document.querySelector('[data-product-root]');
  root.dataset.moneyFormat = '${{amount}}';
  root.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 101, options: ['30 ml'], price: 1200, compare_at_price: 1500, available: true, sku: 'S-30' },
    { id: 202, options: ['60 ml'], price: 2100, compare_at_price: 2100, available: false, sku: 'S-60' }
  ]);
  root.querySelector('[data-product-quantity-rules]').textContent = JSON.stringify([
    { id: 101, min: 2, increment: 3, max: 7 },
    { id: 202, min: 1, increment: 2, max: 6 }
  ]);
  let scrollY = 0;
  let primaryButtonBounds = { top: 100, bottom: 150 };
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  root.querySelector('[data-add-to-cart]').getBoundingClientRect = () => primaryButtonBounds;

  window.eval(themeScript);

  const quantity = root.querySelector('[data-product-quantity]');
  assert.equal(quantity.min, '2');
  assert.equal(quantity.step, '3');
  assert.equal(quantity.max, '5'); // highest valid quantity not exceeding Shopify's max of 7
  assert.equal(quantity.value, '5');
  assert.equal(root.querySelector('[data-product-price]').textContent, '$12.00');
  assert.equal(root.querySelector('[data-compare-price]').textContent, '$15.00');
  assert.equal(root.querySelector('[data-variant-status]').textContent, 'Available');
  assert.equal(root.querySelector('[data-product-sku-value]').textContent, 'S-30');
  const stickyBar = root.querySelector('[data-product-sticky-bar]');
  const stickyButton = root.querySelector('[data-sticky-add-to-cart]');
  assert.equal(stickyBar.hidden, true); // primary add button is in view
  assert.equal(root.querySelector('[data-sticky-product-price]').textContent, '$12.00');
  assert.equal(stickyButton.disabled, false);

  const variantSelect = root.querySelector('[data-variant-select]');
  variantSelect.value = '202';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.dataset.currentVariantId, '202');
  assert.equal(quantity.min, '1');
  assert.equal(quantity.step, '2');
  assert.equal(quantity.max, '5');
  assert.equal(root.querySelector('[data-variant-status]').textContent, 'Unavailable');
  assert.equal(root.querySelector('[data-product-price]').textContent, '$21.00');
  assert.equal(root.querySelector('[data-compare-price]').hidden, true);
  assert.equal(root.querySelector('[data-add-to-cart]').disabled, true);
  assert.equal(root.querySelector('[data-add-to-cart]').textContent, 'Sold out');
  assert.equal(root.querySelector('[data-product-sku-value]').textContent, 'S-60');
  assert.equal(root.querySelector('[data-sticky-product-price]').textContent, '$21.00');
  assert.equal(stickyButton.disabled, true);
  assert.equal(stickyButton.textContent, 'Sold out');
  assert.equal(new URL(window.location.href).searchParams.get('variant'), '202');

  scrollY = 500;
  primaryButtonBounds = { top: -100, bottom: -20 };
  window.dispatchEvent(new window.Event('scroll'));
  await waitFor(() => stickyBar.hidden === false);
  primaryButtonBounds = { top: 100, bottom: 150 };
  window.dispatchEvent(new window.Event('scroll'));
  await waitFor(() => stickyBar.hidden === true);
  dom.window.close();
});

test('PDP savings follow variant and selling-plan prices and hide without a valid compare-at discount', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section data-product-root data-current-variant-id="11">
      <select data-variant-select><option value="11" selected>20 ml</option><option value="22">40 ml</option><option value="33">10 ml</option></select>
      <select data-selling-plan-select data-requires-selling-plan="false">
        <option value="" data-one-time-purchase selected>One-time purchase</option>
        <option value="monthly-33" data-variant-id="33" data-price="900" data-compare-at-price="1100">Monthly</option>
      </select>
      <span data-product-price></span><s data-compare-price hidden></s>
      <span data-product-savings data-savings-display="amount" data-save-label="Save" data-percent-template="Save __PERCENT__%"></span>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules>[]</script>
    </section>
  </body></html>`);
  const { window } = dom;
  const root = window.document.querySelector('[data-product-root]');
  root.dataset.moneyFormat = '${{amount}}';
  root.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 11, options: ['20 ml'], price: 1200, compare_at_price: 1500, available: true },
    { id: 22, options: ['40 ml'], price: 2000, compare_at_price: 2000, available: true },
    { id: 33, options: ['10 ml'], price: 800, compare_at_price: 1200, available: true }
  ]);
  window.eval(themeScript);

  const variantSelect = root.querySelector('[data-variant-select]');
  const savings = root.querySelector('[data-product-savings]');
  assert.equal(root.querySelector('[data-product-price]').textContent, '$12.00');
  assert.equal(savings.textContent.trim(), 'Save $3.00');
  assert.equal(savings.hidden, false);

  variantSelect.value = '22';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(savings.hidden, true);

  savings.dataset.savingsDisplay = 'percentage';
  variantSelect.value = '33';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.querySelector('[data-product-price]').textContent, '$8.00');
  assert.equal(savings.textContent.trim(), 'Save 33%');
  assert.equal(savings.hidden, false);

  const sellingPlan = root.querySelector('[data-selling-plan-select]');
  sellingPlan.value = 'monthly-33';
  sellingPlan.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.querySelector('[data-product-price]').textContent, '$9.00');
  assert.equal(root.querySelector('[data-compare-price]').textContent, '$11.00');
  assert.equal(savings.textContent.trim(), 'Save 18%');

  savings.dataset.savingsDisplay = 'amount';
  sellingPlan.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(savings.textContent.trim(), 'Save $2.00');
  dom.window.close();
});

test('multi-option swatch and size controls resolve variants and expose sold-out/media changes', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section data-product-root data-current-variant-id="101" data-sold-out-label="Sold out">
      <select data-variant-select>
        <option value="101" selected>Rose, 30 ml</option><option value="102">Rose, 60 ml</option>
        <option value="201">Blue, 30 ml</option><option value="202">Blue, 60 ml</option>
      </select>
      <fieldset data-product-option-group data-option-index="0" data-hide-sold-out="false">
        <legend>Color <span data-option-current-value>Rose</span></legend>
        <input type="radio" name="color" value="Rose" data-product-option data-option-index="0" checked><label>Rose</label>
        <input type="radio" name="color" value="Blue" data-product-option data-option-index="0"><label>Blue</label>
      </fieldset>
      <div data-product-option-group data-option-index="1" data-hide-sold-out="false">
        <label>Size <span data-option-current-value>30 ml</span></label>
        <select data-product-option data-option-index="1">
          <option value="30 ml" selected data-option-base-label="30 ml">30 ml</option>
          <option value="60 ml" data-option-base-label="60 ml">60 ml</option>
        </select>
      </div>
      <span data-product-price></span><s data-compare-price hidden></s>
      <p data-variant-status data-available="Available" data-unavailable="Unavailable" data-plan-unavailable="Plan unavailable"></p>
      <button data-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button>
      <div data-media-id="502"></div><div data-media-id="504"></div>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules>[]</script>
    </section>
  </body></html>`, 'https://shop.example/products/serum');
  const { window } = dom;
  const root = window.document.querySelector('[data-product-root]');
  root.dataset.moneyFormat = '${{amount}}';
  root.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 101, options: ['Rose', '30 ml'], price: 1200, compare_at_price: 1200, available: true, sku: 'R-30', featured_media: { id: 501 } },
    { id: 102, options: ['Rose', '60 ml'], price: 1800, compare_at_price: 1800, available: false, sku: 'R-60', featured_media: { id: 502 } },
    { id: 201, options: ['Blue', '30 ml'], price: 1300, compare_at_price: 1300, available: true, sku: 'B-30', featured_media: { id: 503 } },
    { id: 202, options: ['Blue', '60 ml'], price: 1900, compare_at_price: 1900, available: true, sku: 'B-60', featured_media: { id: 504 } }
  ]);
  const scrolledMedia = [];
  root.querySelectorAll('[data-media-id]').forEach((media) => {
    media.scrollIntoView = (options) => scrolledMedia.push({ id: media.dataset.mediaId, options });
  });
  window.eval(themeScript);

  const sizeSelect = root.querySelector('[data-product-option-group][data-option-index="1"] select');
  sizeSelect.value = '60 ml';
  sizeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.dataset.currentVariantId, '102');
  assert.equal(root.querySelector('[data-variant-status]').textContent, 'Unavailable');
  assert.equal(root.querySelector('[data-product-price]').textContent, '$18.00');
  assert.equal(root.querySelector('[data-add-to-cart]').disabled, true);
  assert.equal(root.querySelector('[data-add-to-cart]').textContent, 'Sold out');
  assert.equal(sizeSelect.selectedOptions[0].dataset.optionAvailable, 'false');
  assert.equal(sizeSelect.selectedOptions[0].textContent, '60 ml — Sold out');
  assert.equal(root.querySelector('[data-option-index="0"][value="Rose"] + label').classList.contains('is-sold-out'), true);
  assert.equal(root.querySelector('[data-option-current-value]').textContent, 'Rose');
  assert.equal(scrolledMedia.at(-1).id, '502');
  assert.equal(scrolledMedia.at(-1).options.behavior, 'auto');
  assert.equal(new URL(window.location.href).searchParams.get('variant'), '102');

  const blueSwatch = root.querySelector('[data-option-index="0"][value="Blue"]');
  assert.equal(blueSwatch.dataset.optionAvailable, 'true');
  blueSwatch.checked = true;
  blueSwatch.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.dataset.currentVariantId, '202');
  assert.equal(root.querySelector('[data-variant-status]').textContent, 'Available');
  assert.equal(root.querySelector('[data-product-price]').textContent, '$19.00');
  assert.equal(root.querySelector('[data-add-to-cart]').disabled, false);
  assert.equal(root.querySelector('[data-option-current-value]').textContent, 'Blue');
  assert.equal(scrolledMedia.at(-1).id, '504');
  assert.equal(new URL(window.location.href).searchParams.get('variant'), '202');
  dom.window.close();
});

test('featured-product quantities stay associated with the form and follow variant quantity rules', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section data-product-root data-current-variant-id="11">
      <input type="hidden" name="id" value="11" form="FeaturedProductForm" data-variant-select>
      <label for="FeaturedQuantity">Quantity</label>
      <input id="FeaturedQuantity" type="number" name="quantity" value="1" min="1" step="1" form="FeaturedProductForm" data-product-quantity>
      <span data-product-price></span><s data-compare-price hidden></s>
      <p data-variant-status data-available="Available" data-unavailable="Unavailable" data-plan-unavailable="Plan unavailable"></p>
      <form id="FeaturedProductForm" action="/cart/add.js"><button type="submit" name="add" data-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button></form>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules></script>
    </section>
  </body></html>`);
  const { window } = dom;
  const root = window.document.querySelector('[data-product-root]');
  root.dataset.moneyFormat = '${{amount}}';
  root.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 11, options: ['Cream'], price: 1000, compare_at_price: 1000, available: true },
    { id: 22, options: ['Refill'], price: 1800, compare_at_price: 1800, available: true }
  ]);
  root.querySelector('[data-product-quantity-rules]').textContent = JSON.stringify([
    { id: 11, min: 1, increment: 1, max: 0 },
    { id: 22, min: 3, increment: 2, max: 8 }
  ]);
  window.eval(themeScript);

  const form = window.document.getElementById('FeaturedProductForm');
  const variantId = root.querySelector('[data-variant-select]');
  const quantity = root.querySelector('[data-product-quantity]');
  assert.equal(new window.FormData(form).get('id'), '11');
  assert.equal(new window.FormData(form).get('quantity'), '1');

  variantId.value = '22';
  variantId.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(quantity.min, '3');
  assert.equal(quantity.step, '2');
  assert.equal(quantity.max, '7');
  assert.equal(quantity.value, '3');
  assert.equal(new window.FormData(form).get('id'), '22');
  assert.equal(new window.FormData(form).get('quantity'), '3');
  dom.window.close();
});

test('pincode checker validates Indian PINs and uses only the configured coverage list', () => {
  const dom = createDom(`<!doctype html><html><body>
    <div data-pincode-checker data-serviceable-pincodes="201001, 110001\n560001" data-invalid-message="Enter a valid PIN." data-available-message="Listed for delivery." data-unavailable-message="Not listed." data-unconfigured-message="Coverage is not configured.">
      <form data-pincode-form novalidate>
        <input data-pincode-input maxlength="6" pattern="[1-9][0-9]{5}">
        <button type="submit">Check</button>
      </form>
      <p data-pincode-status role="status" aria-live="polite" hidden></p>
    </div>
  </body></html>`);
  const { window } = dom;
  window.eval(themeScript);
  const form = window.document.querySelector('[data-pincode-form]');
  const input = window.document.querySelector('[data-pincode-input]');
  const status = window.document.querySelector('[data-pincode-status]');
  const submit = () => {
    const event = new window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };

  input.value = '012345';
  submit();
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(status.textContent, 'Enter a valid PIN.');
  assert.equal(status.dataset.state, 'error');

  input.value = '201001';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  submit();
  assert.equal(input.hasAttribute('aria-invalid'), false);
  assert.equal(status.textContent, 'Listed for delivery.');
  assert.equal(status.dataset.state, 'success');

  input.value = '700001';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  submit();
  assert.equal(status.textContent, 'Not listed.');
  assert.equal(status.dataset.state, 'error');

  window.document.querySelector('[data-pincode-checker]').dataset.serviceablePincodes = '  \n ';
  input.value = '201001';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  submit();
  assert.equal(status.textContent, 'Coverage is not configured.');
  dom.window.close();
});

test('PIN checker initializes when Shopify loads a new section', () => {
  const dom = createDom('<!doctype html><html><body></body></html>');
  const { window } = dom;
  window.eval(themeScript);

  const section = window.document.createElement('section');
  section.innerHTML = `<div data-pincode-checker data-serviceable-pincodes="201001" data-available-message="Listed for delivery." data-invalid-message="Invalid PIN." data-unavailable-message="Not listed." data-unconfigured-message="Unconfigured.">
    <form data-pincode-form><input data-pincode-input><button type="submit">Check</button></form>
    <p data-pincode-status role="status" aria-live="polite" hidden></p>
  </div>`;
  window.document.body.append(section);
  section.dispatchEvent(new window.CustomEvent('shopify:section:load', { bubbles: true }));

  const form = section.querySelector('[data-pincode-form]');
  const input = section.querySelector('[data-pincode-input]');
  const status = section.querySelector('[data-pincode-status]');
  input.value = '201001';
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(status.textContent, 'Listed for delivery.');
  assert.equal(status.dataset.state, 'success');
  dom.window.close();
});

test('product cards offer optional alternate images, accurate savings, and data-gated low-stock badges', () => {
  const settingsSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/settings_schema.json'), 'utf8'));
  const localeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.default.schema.json'), 'utf8'));
  const storefrontLocale = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.default.json'), 'utf8'));
  const productCardGroup = settingsSchema.find((group) => group.name === 't:general.product_card');
  const settingTypes = new Map(productCardGroup.settings.map((setting) => [setting.id, setting.type]));
  const savingsSetting = productCardGroup.settings.find((setting) => setting.id === 'product_card_savings_display');
  const cardSnippet = fs.readFileSync(path.join(__dirname, '../snippets/product-card.liquid'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../assets/theme.css'), 'utf8');

  assert.equal(settingTypes.get('product_card_show_secondary_image'), 'checkbox');
  assert.equal(settingTypes.get('product_card_show_low_stock'), 'checkbox');
  assert.equal(settingTypes.get('product_card_low_stock_threshold'), 'range');
  assert.equal(settingTypes.get('product_card_show_routine_step'), 'checkbox');
  assert.equal(settingTypes.get('product_card_show_unit_price'), 'checkbox');
  assert.equal(settingTypes.get('product_card_savings_display'), 'select');
  assert.equal(savingsSetting.default, 'none');
  assert.deepEqual(savingsSetting.options.map((option) => option.value), ['none', 'amount', 'percentage']);
  assert.match(cardSnippet, /product_card_show_secondary_image/);
  assert.match(cardSnippet, /product_card_show_low_stock/);
  assert.match(cardSnippet, /product_card_show_routine_step/);
  assert.match(cardSnippet, /product_card_show_unit_price/);
  assert.match(cardSnippet, /inventory_management != blank/);
  assert.match(cardSnippet, /inventory_policy != 'continue'/);
  assert.match(cardSnippet, /product_card_low_stock_threshold/);
  assert.match(cardSnippet, /product_card_savings_display/);
  assert.match(cardSnippet, /card_savings_percentage/);
  assert.match(cardSnippet, /product-card__savings/);
  assert.match(cardSnippet, /card_variant\.compare_at_price > card_variant\.price and settings\.product_card_savings_display == 'amount'/);
  assert.match(cardSnippet, /card_variant\.compare_at_price > card_variant\.price and settings\.product_card_savings_display == 'percentage'/);
  assert.match(cardSnippet, /aria-label="[^"]*product\.inventory_low_stock/s);
  assert.match(themeCss, /product-card__secondary-image/);
  assert.match(themeCss, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(themeCss, /product-card__badge--low-stock/);
  assert.match(themeCss, /product-card__savings/);
  assert.ok(localeSchema.labels.product_card_show_secondary_image_info);
  assert.ok(localeSchema.labels.product_card_show_low_stock_info);
  assert.ok(localeSchema.labels.product_card_show_routine_step_info);
  assert.ok(localeSchema.labels.product_card_show_unit_price_info);
  assert.ok(localeSchema.labels.product_card_savings_display_info);
  assert.deepEqual(Object.keys(localeSchema.options.product_card_savings_display).sort(), ['amount', 'none', 'percentage']);
  assert.equal(storefrontLocale.general.save, 'Save');
  assert.equal(storefrontLocale.general.save_percent, 'Save {{ percent }}%');
});

test('user-controlled search, comment, article, collection, pickup, and menu output is escaped', () => {
  const searchSection = fs.readFileSync(path.join(__dirname, '../sections/search.liquid'), 'utf8');
  const predictiveSearch = fs.readFileSync(path.join(__dirname, '../sections/predictive-search.liquid'), 'utf8');
  const articleSection = fs.readFileSync(path.join(__dirname, '../sections/article.liquid'), 'utf8');
  const blogSection = fs.readFileSync(path.join(__dirname, '../sections/blog.liquid'), 'utf8');
  const collectionsSection = fs.readFileSync(path.join(__dirname, '../sections/collections.liquid'), 'utf8');
  const pickupSection = fs.readFileSync(path.join(__dirname, '../sections/pickup-availability.liquid'), 'utf8');
  const productInfoMerchandising = fs.readFileSync(path.join(__dirname, '../snippets/product-info-merchandising.liquid'), 'utf8');
  const navigationMenu = fs.readFileSync(path.join(__dirname, '../snippets/navigation-menu.liquid'), 'utf8');
  const metaTags = fs.readFileSync(path.join(__dirname, '../snippets/meta-tags.liquid'), 'utf8');

  assert.match(searchSection, /'search\.result_count_one' \| t: terms: search\.terms, count: search\.results_count \| escape/);
  assert.match(searchSection, /'search\.result_count_other' \| t: terms: search\.terms, count: search\.results_count \| escape/);
  assert.match(predictiveSearch, /'search\.view_all' \| t: terms: predictive_search\.terms \| escape/);
  assert.match(articleSection, /comment\.content \| strip_html \| escape/);
  assert.match(blogSection, /article\.excerpt_or_content \| strip_html \| truncatewords: section\.settings\.excerpt_words \| escape/);
  assert.match(collectionsSection, /collection\.description \| strip_html \| truncatewords: 18 \| escape/);
  assert.match(pickupSection, /primary_pickup\.location\.name \| escape/);
  assert.ok(productInfoMerchandising.includes('data-base-url="{{ shop.url | escape }}{{ routes.root_url | escape }}"'));
  assert.match(navigationMenu, /'accessibility\.open_submenu' \| t: title: link\.title \| escape/);
  assert.match(navigationMenu, /'accessibility\.open_submenu' \| t: title: child_link\.title \| escape/);
  assert.match(metaTags, /canonical_url \| escape/);
  assert.match(metaTags, /meta_url \| escape/);
  assert.match(metaTags, /page_image \| image_url: width: 1200 \| escape/);
});

test('PDP price block exposes optional localized savings display controls', () => {
  const productSection = fs.readFileSync(path.join(__dirname, '../sections/product.liquid'), 'utf8');
  const schemaStart = productSection.indexOf('{% schema %}');
  const schemaEnd = productSection.indexOf('{% endschema %}');
  const schema = JSON.parse(productSection.slice(schemaStart + '{% schema %}'.length, schemaEnd).trim());
  const priceBlock = schema.blocks.find((block) => block.type === 'price');
  const settings = new Map(priceBlock.settings.map((setting) => [setting.id, setting]));
  const savingsSnippet = fs.readFileSync(path.join(__dirname, '../snippets/product-price-savings.liquid'), 'utf8');
  const localeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.default.schema.json'), 'utf8'));
  const themeCss = fs.readFileSync(path.join(__dirname, '../assets/theme.css'), 'utf8');

  assert.equal(settings.get('show_savings')?.type, 'checkbox');
  assert.equal(settings.get('show_savings')?.default, false);
  assert.equal(settings.get('savings_display')?.type, 'select');
  assert.deepEqual(settings.get('savings_display')?.options.map((option) => option.value), ['amount', 'percentage']);
  assert.match(productSection, /render 'product-price-savings'/);
  assert.match(savingsSnippet, /data-product-savings data-savings-display=/);
  assert.match(savingsSnippet, /compare_at_price > current_price/);
  assert.match(themeCss, /product-price__savings/);
  assert.ok(localeSchema.labels.show_product_savings_info);
  assert.deepEqual(Object.keys(localeSchema.options.product_savings_display).sort(), ['amount', 'percentage']);
});

test('collection, featured-collection, and recommendation grids expose responsive column controls', () => {
  const sections = ['collection', 'featured-collection', 'product-recommendations'];
  const expectedDefaults = {
    grid_columns_desktop: 4,
    grid_columns_tablet: 3,
    grid_columns_mobile: 2
  };
  const themeCss = fs.readFileSync(path.join(__dirname, '../assets/theme.css'), 'utf8');
  const localeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.default.schema.json'), 'utf8'));

  sections.forEach((sectionName) => {
    const liquid = fs.readFileSync(path.join(__dirname, `../sections/${sectionName}.liquid`), 'utf8');
    const schemaStart = liquid.indexOf('{% schema %}');
    const schemaEnd = liquid.indexOf('{% endschema %}');
    assert.ok(schemaStart >= 0 && schemaEnd > schemaStart, `${sectionName} must expose a section schema`);
    const schemaText = liquid.slice(schemaStart + '{% schema %}'.length, schemaEnd).trim();
    const schema = JSON.parse(schemaText);
    const settings = new Map(schema.settings.map((setting) => [setting.id, setting]));

    Object.entries(expectedDefaults).forEach(([id, defaultValue]) => {
      assert.equal(settings.get(id)?.type, 'range', `${sectionName} ${id} should be an editor range`);
      assert.equal(settings.get(id)?.default, defaultValue, `${sectionName} ${id} should preserve its responsive default`);
    });
    const mobileColumns = settings.get('grid_columns_mobile');
    assert.equal(mobileColumns.max, 3, `${sectionName} mobile columns should offer at least three valid range values`);
    assert.ok((mobileColumns.max - mobileColumns.min) / mobileColumns.step >= 2);
    assert.match(liquid, /class="product-grid" style="[^"]*--product-grid-columns-desktop:/);
    assert.match(liquid, /--product-grid-columns-tablet:/);
    assert.match(liquid, /--product-grid-columns-mobile:/);
  });

  assert.ok(themeCss.includes('grid-template-columns: repeat(var(--product-grid-columns-desktop, 4)'));
  assert.ok(themeCss.includes('grid-template-columns: repeat(var(--product-grid-columns-tablet, 3)'));
  assert.ok(themeCss.includes('grid-template-columns: repeat(var(--product-grid-columns-mobile, 2)'));
  assert.ok(localeSchema.labels.grid_columns_desktop);
  assert.ok(localeSchema.labels.grid_columns_tablet);
  assert.ok(localeSchema.labels.grid_columns_mobile);
});

test('Shop the Look provides accessible product hotspots, editable products, and responsive cards alongside Featured Product', () => {
  const shopTheLook = fs.readFileSync(path.join(__dirname, '../sections/shop-the-look.liquid'), 'utf8');
  const featuredProduct = fs.readFileSync(path.join(__dirname, '../sections/featured-product.liquid'), 'utf8');
  const productCard = fs.readFileSync(path.join(__dirname, '../snippets/product-card.liquid'), 'utf8');
  const homeTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/index.json'), 'utf8'));
  const schemaStart = shopTheLook.indexOf('{% schema %}');
  const schemaEnd = shopTheLook.indexOf('{% endschema %}');
  assert.ok(schemaStart >= 0 && schemaEnd > schemaStart);
  const schema = JSON.parse(shopTheLook.slice(schemaStart + '{% schema %}'.length, schemaEnd).trim());
  const lookProductBlock = schema.blocks.find((block) => block.type === 'look_product');
  const blockSettings = new Map(lookProductBlock.settings.map((setting) => [setting.id, setting]));
  assert.equal(blockSettings.get('product')?.type, 'product');
  for (const position of ['horizontal_position', 'vertical_position']) {
    const setting = blockSettings.get(position);
    assert.equal(setting?.type, 'range');
    assert.equal(setting?.min, 0);
    assert.equal(setting?.max, 100);
    assert.ok((setting.max - setting.min) / setting.step >= 2);
  }
  assert.equal(schema.max_blocks, 4);
  assert.match(shopTheLook, /role="group" aria-label=/);
  assert.match(shopTheLook, /href="\{\{ look_product\.url \| escape \}\}"/);
  assert.match(shopTheLook, /render 'product-card', product: look_product/);
  assert.match(shopTheLook, /show_vendor_override: section\.settings\.show_vendor/);
  assert.match(shopTheLook, /show_quick_add: section\.settings\.show_quick_add/);
  assert.match(productCard, /show_vendor_override == false/);
  assert.match(shopTheLook, /demo-hero\.jpg/);
  assert.match(shopTheLook, /data-image-position=/);
  assert.match(shopTheLook, /data-image-ratio=/);
  assert.match(featuredProduct, /render 'product-variant-picker'/);
  assert.match(featuredProduct, /form 'product', featured_product/);
  assert.equal(homeTemplate.sections.shop_the_look.type, 'shop-the-look');
  assert.equal(homeTemplate.sections.shop_the_look.block_order.length, 3);
  assert.ok(homeTemplate.order.indexOf('featured_product') < homeTemplate.order.indexOf('shop_the_look'));
  assert.ok(homeTemplate.order.includes('shop_the_look'));
});

test('PIN, FAQ, and story editor schemas expose requested controls in the default homepage (source check only)', () => {
  const parseSection = (sectionName) => {
    const liquid = fs.readFileSync(path.join(__dirname, `../sections/${sectionName}.liquid`), 'utf8');
    const start = liquid.indexOf('{% schema %}');
    const end = liquid.indexOf('{% endschema %}');
    assert.ok(start >= 0 && end > start, `${sectionName} must have an editor schema`);
    return { liquid, schema: JSON.parse(liquid.slice(start + '{% schema %}'.length, end).trim()) };
  };
  const product = parseSection('product');
  const faq = parseSection('faq');
  const stories = parseSection('instagram-stories');
  const themeSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/settings_schema.json'), 'utf8'));
  const home = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/index.json'), 'utf8'));
  const pinBlock = product.schema.blocks.find((block) => block.type === 'pincode_checker');
  const faqBlock = faq.schema.blocks.find((block) => block.type === 'question');
  const storyBlock = stories.schema.blocks.find((block) => block.type === 'story');
  const coverageSetting = themeSettings.flatMap((group) => group.settings || []).find((setting) => setting.id === 'delivery_serviceable_pincodes');
  const storySettings = new Map(stories.schema.settings.map((setting) => [setting.id, setting]));
  const storyBlockSettings = new Map(storyBlock.settings.map((setting) => [setting.id, setting]));
  const faqBlockSettings = new Map(faqBlock.settings.map((setting) => [setting.id, setting]));

  assert.ok(pinBlock);
  assert.ok(pinBlock.settings.some((setting) => setting.id === 'policy_page'));
  assert.ok(coverageSetting);
  assert.equal(faqBlockSettings.get('question')?.type, 'text');
  assert.equal(faqBlockSettings.get('answer')?.type, 'richtext');
  assert.equal(storySettings.get('profile_url')?.type, 'url');
  assert.equal(storyBlockSettings.get('content_type')?.type, 'select');
  assert.deepEqual(storyBlockSettings.get('content_type')?.options.map((option) => option.value), ['story', 'post', 'reel']);
  assert.equal(storyBlockSettings.get('image')?.type, 'image_picker');
  assert.equal(storyBlockSettings.get('video')?.type, 'video');
  assert.match(stories.liquid, /class="story-viewer__pagination"/);
  assert.match(stories.liquid, /data-story-step="-1"/);
  assert.match(stories.liquid, /data-story-step="1"/);
  assert.match(stories.liquid, /forloop\.first/);
  assert.match(stories.liquid, /forloop\.last/);
  assert.match(stories.liquid, /general\.page_of/);
  assert.ok(home.sections.faq && home.sections.instagram_stories);
});

test('contact page exposes editable support details and accessible required form feedback', () => {
  const liquid = fs.readFileSync(path.join(__dirname, '../sections/contact-form.liquid'), 'utf8');
  const start = liquid.indexOf('{% schema %}');
  const end = liquid.indexOf('{% endschema %}');
  assert.ok(start >= 0 && end > start);
  const schema = JSON.parse(liquid.slice(start + '{% schema %}'.length, end).trim());
  const contactTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/page.contact.json'), 'utf8'));
  const contactBlock = schema.blocks.find((block) => block.type === 'contact_detail');
  const settings = new Map(schema.settings.map((setting) => [setting.id, setting]));
  const blockSettings = new Map(contactBlock.settings.map((setting) => [setting.id, setting]));

  assert.equal(contactTemplate.sections.main.type, 'contact-form');
  assert.equal(settings.get('faq_page')?.type, 'page');
  assert.equal(blockSettings.get('kind')?.type, 'select');
  assert.deepEqual(blockSettings.get('kind')?.options.map((option) => option.value), ['email', 'phone', 'address', 'hours']);
  assert.match(liquid, /form 'contact'/);
  assert.match(liquid, /name="contact\[email\]"[^>]*required/);
  assert.match(liquid, /name="contact\[body\]" required/);
  assert.match(liquid, /aria-invalid="true" aria-describedby=/);
  assert.match(liquid, /data-contact-feedback/);
  assert.match(liquid, /mailto:/);
  assert.match(liquid, /tel:/);
});

test('product recommendations refuse cross-origin markup before injecting HTML', () => {
  const dom = createDom(`<!doctype html><html><body><section id="Recommendations" data-product-recommendations data-url="https://collector.example/recommendations"></section></body></html>`);
  const { window } = dom;
  let fetchCalls = 0;
  window.fetch = () => { fetchCalls += 1; throw new Error('A cross-origin request should not be made.'); };
  window.eval(themeScript);
  const recommendations = window.document.getElementById('Recommendations');
  assert.equal(fetchCalls, 0);
  assert.equal(recommendations.dataset.loaded, 'false');
  dom.window.close();
});

test('contact form status messages receive focus after a response and section reload', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section id="contact-section"><p id="contact-success" role="status" tabindex="-1" data-contact-feedback>Message sent.</p></section>
  </body></html>`);
  const { window } = dom;
  window.eval(themeScript);
  const firstMessage = window.document.getElementById('contact-success');
  assert.equal(window.document.activeElement, firstMessage);

  const secondMessage = window.document.createElement('p');
  secondMessage.id = 'contact-errors';
  secondMessage.tabIndex = -1;
  secondMessage.dataset.contactFeedback = '';
  secondMessage.textContent = 'Please correct the form.';
  const section = window.document.getElementById('contact-section');
  section.append(secondMessage);
  section.dispatchEvent(new window.Event('shopify:section:load', { bubbles: true }));
  assert.equal(window.document.activeElement, secondMessage);
  dom.window.close();
});

test('product modal and story viewer return focus to their openers', () => {
  const dom = createDom(`<!doctype html><html><body>
    <button id="modal-trigger" type="button" aria-controls="product-modal" data-product-modal-trigger>Details</button>
    <dialog id="product-modal" data-product-info-modal><button type="button" data-product-modal-close>Close modal</button></dialog>
    <button id="story-trigger" type="button" aria-controls="story-dialog" data-story-open>Open story</button>
    <dialog id="story-dialog" data-story-dialog><button type="button" data-story-close>Close story</button><video></video></dialog>
  </body></html>`);
  const { window } = dom;
  let storyPlayCount = 0;
  let storyPauseCount = 0;
  const storyVideo = window.document.querySelector('#story-dialog video');
  storyVideo.play = () => { storyPlayCount += 1; return Promise.resolve(); };
  storyVideo.pause = () => { storyPauseCount += 1; };
  window.eval(themeScript);

  const modalTrigger = window.document.getElementById('modal-trigger');
  modalTrigger.focus();
  modalTrigger.click();
  assert.equal(window.document.getElementById('product-modal').open, true);
  assert.equal(window.document.activeElement, window.document.querySelector('[data-product-modal-close]'));
  window.document.querySelector('[data-product-modal-close]').click();
  assert.equal(window.document.getElementById('product-modal').open, false);
  assert.equal(window.document.activeElement, modalTrigger);

  const storyTrigger = window.document.getElementById('story-trigger');
  const pageUrl = window.location.href;
  storyTrigger.focus();
  storyTrigger.click();
  assert.equal(storyTrigger.tagName, 'BUTTON');
  assert.equal(window.location.href, pageUrl);
  assert.equal(window.document.getElementById('story-dialog').open, true);
  assert.equal(storyPlayCount, 1);
  window.document.querySelector('[data-story-close]').click();
  assert.equal(window.document.getElementById('story-dialog').open, false);
  assert.equal(storyPauseCount, 1);
  assert.equal(window.document.activeElement, storyTrigger);
  dom.window.close();
});

test('story viewer paginates in place, stops outgoing media, and restores focus to the original tile', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section class="instagram-stories-section">
      <button id="story-one-trigger" type="button" data-story-open aria-controls="story-one">Open first story</button>
      <dialog id="story-one" data-story-dialog>
        <button type="button" data-story-close>Close first story</button>
        <button type="button" data-story-step="-1" disabled>Previous</button>
        <button type="button" data-story-step="1">Next</button>
        <video></video>
      </dialog>
      <button id="story-two-trigger" type="button" data-story-open aria-controls="story-two">Open second story</button>
      <dialog id="story-two" data-story-dialog>
        <button type="button" data-story-close>Close second story</button>
        <button type="button" data-story-step="-1">Previous</button>
        <button type="button" data-story-step="1" disabled>Next</button>
        <video></video>
      </dialog>
    </section>
  </body></html>`);
  const { window } = dom;
  const firstDialog = window.document.getElementById('story-one');
  const secondDialog = window.document.getElementById('story-two');
  const firstVideo = firstDialog.querySelector('video');
  const secondVideo = secondDialog.querySelector('video');
  let firstPlayCount = 0;
  let firstPauseCount = 0;
  let secondPlayCount = 0;
  let secondPauseCount = 0;
  firstVideo.play = () => { firstPlayCount += 1; return Promise.resolve(); };
  firstVideo.pause = () => { firstPauseCount += 1; };
  secondVideo.play = () => { secondPlayCount += 1; return Promise.resolve(); };
  secondVideo.pause = () => { secondPauseCount += 1; };
  window.eval(themeScript);

  const firstTrigger = window.document.getElementById('story-one-trigger');
  const pageUrl = window.location.href;
  firstTrigger.focus();
  firstTrigger.click();
  assert.equal(firstDialog.open, true);
  assert.equal(firstPlayCount, 1);
  assert.equal(window.document.activeElement, firstDialog.querySelector('[data-story-close]'));
  assert.equal(firstDialog.querySelector('[data-story-step="-1"]').disabled, true);

  firstDialog.querySelector('[data-story-step="1"]').click();
  assert.equal(firstDialog.open, false);
  assert.equal(secondDialog.open, true);
  assert.equal(firstPauseCount, 1);
  assert.equal(firstVideo.currentTime, 0);
  assert.equal(secondPlayCount, 1);
  assert.equal(window.document.activeElement, secondDialog.querySelector('[data-story-close]'));
  assert.equal(window.location.href, pageUrl);
  secondDialog.querySelector('[data-story-step="1"]').click();
  assert.equal(secondDialog.open, true); // the final page has no next item

  secondDialog.querySelector('[data-story-step="-1"]').click();
  assert.equal(secondDialog.open, false);
  assert.equal(firstDialog.open, true);
  assert.equal(secondPauseCount, 1);
  assert.equal(firstPlayCount, 2);
  firstDialog.querySelector('[data-story-close]').click();
  assert.equal(firstDialog.open, false);
  assert.equal(window.document.activeElement, firstTrigger);
  dom.window.close();
});

test('shoppable video carousel paginates, honors reduced motion, and toggles its play affordance', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <section class="shoppable-video-section">
      <button type="button" data-shoppable-video-step="-1">Previous</button>
      <button type="button" data-shoppable-video-step="1">Next</button>
      <div data-shoppable-video-track>
        <article class="shoppable-video-card"><div class="shoppable-video-card__media"><video></video><button type="button" data-shoppable-video-play>Play</button></div></article>
        <article class="shoppable-video-card"><div class="shoppable-video-card__media"><video></video><button type="button" data-shoppable-video-play>Play</button></div></article>
        <article class="shoppable-video-card"><div class="shoppable-video-card__media"><video></video><button type="button" data-shoppable-video-play>Play</button></div></article>
      </div>
      <div data-shoppable-video-pagination data-page-label-template="Page __CURRENT__ of __TOTAL__"></div>
    </section>
  </body></html>`);
  const { window } = dom;
  const track = window.document.querySelector('[data-shoppable-video-track]');
  Object.defineProperty(track, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 900 });
  let lastScrollBehavior;
  track.querySelector('.shoppable-video-card').getBoundingClientRect = () => ({ width: 250 });
  track.scrollBy = ({ left, behavior }) => {
    lastScrollBehavior = behavior;
    track.scrollLeft = Math.max(0, Math.min(600, track.scrollLeft + left));
    track.dispatchEvent(new window.Event('scroll'));
  };
  track.scrollTo = ({ left, behavior }) => {
    lastScrollBehavior = behavior;
    track.scrollLeft = left;
    track.dispatchEvent(new window.Event('scroll'));
  };
  track.querySelectorAll('video').forEach((video) => {
    video.play = () => { video.dispatchEvent(new window.Event('play')); return Promise.resolve(); };
    video.pause = () => { video.dispatchEvent(new window.Event('pause')); };
  });
  window.eval(themeScript);

  const pagination = window.document.querySelector('[data-shoppable-video-pagination]');
  const dots = pagination.querySelectorAll('[data-shoppable-video-page]');
  assert.equal(dots.length, 3);
  assert.equal(dots[0].getAttribute('aria-current'), 'true');
  const previous = window.document.querySelector('[data-shoppable-video-step="-1"]');
  const next = window.document.querySelector('[data-shoppable-video-step="1"]');
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, false);

  next.click();
  assert.equal(lastScrollBehavior, 'auto'); // createDom requests reduced motion
  await waitFor(() => dots[1].getAttribute('aria-current') === 'true');
  dots[2].click();
  assert.equal(track.scrollLeft, 600);
  await waitFor(() => dots[2].getAttribute('aria-current') === 'true');
  assert.equal(next.disabled, true);
  assert.equal(previous.disabled, false);

  const playButton = track.querySelector('[data-shoppable-video-play]');
  playButton.click();
  assert.equal(playButton.hidden, true);
  track.querySelector('video').pause();
  assert.equal(playButton.hidden, false);
  dom.window.close();
});

test('price filters keep accessible values in sync and sorting auto-submits', () => {
  const dom = createDom(`<!doctype html><html><body>
    <form id="collection-filters">
      <div class="facet-price-slider" data-price-range>
        <input type="range" name="filter.v.price.gte" min="0" max="100" value="20" data-price-range-min>
        <input type="range" name="filter.v.price.lte" min="0" max="100" value="80" data-price-range-max>
      </div>
      <span data-price-min-output></span><span data-price-max-output></span>
    </form>
    <form id="collection-sort">
      <select name="sort_by" data-auto-submit>
        <option value="featured">Featured</option>
        <option value="price-ascending">Price, low to high</option>
      </select>
    </form>
  </body></html>`);
  const { window } = dom;
  const slider = window.document.querySelector('[data-price-range]');
  slider.dataset.moneyFormat = '${{amount}}';
  const sortingForm = window.document.getElementById('collection-sort');
  let submitCount = 0;
  sortingForm.addEventListener('submit', (event) => {
    submitCount += 1;
    event.preventDefault();
  });
  window.eval(themeScript);

  const minimum = slider.querySelector('[data-price-range-min]');
  const maximum = slider.querySelector('[data-price-range-max]');
  assert.equal(window.document.querySelector('[data-price-min-output]').textContent, '$20.00');
  assert.equal(window.document.querySelector('[data-price-max-output]').textContent, '$80.00');
  assert.equal(minimum.getAttribute('aria-valuetext'), '$20.00');
  assert.equal(maximum.getAttribute('aria-valuetext'), '$80.00');
  assert.equal(slider.style.getPropertyValue('--range-start'), '20%');
  assert.equal(slider.style.getPropertyValue('--range-end'), '80%');

  minimum.value = '90';
  minimum.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(minimum.value, '80'); // minimum cannot pass the maximum
  assert.equal(maximum.value, '80');
  assert.equal(minimum.getAttribute('aria-valuetext'), '$80.00');

  minimum.value = '50';
  minimum.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(window.document.querySelector('[data-price-min-output]').textContent, '$50.00');
  assert.equal(slider.style.getPropertyValue('--range-start'), '50%');

  const sort = sortingForm.querySelector('[data-auto-submit]');
  sort.value = 'price-ascending';
  sort.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(submitCount, 1);
  dom.window.close();
});

test('predictive search refuses cross-origin endpoints before sending shopper queries', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <predictive-search data-endpoint="https://collector.example/search/suggest" data-section-id="predictive-search">
      <form><input type="search"><div data-predictive-results hidden></div><p data-predictive-status data-suggestion-one="One" data-suggestions-many="[count] suggestions" data-no-suggestions="None"></p></form>
    </predictive-search>
  </body></html>`);
  const { window } = dom;
  let fetchCalls = 0;
  window.fetch = () => { fetchCalls += 1; throw new Error('A cross-origin request should not be made.'); };
  window.eval(predictiveSearchScript);
  const component = window.document.querySelector('predictive-search');
  component.input.value = 'private search';
  await component.search();
  assert.equal(fetchCalls, 0);
  assert.equal(component.results.hidden, true);
  assert.equal(component.input.getAttribute('aria-expanded'), 'false');
  dom.window.close();
});

test('mock predictive search requests supported resource types and exposes keyboard-accessible results', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <details open>
      <summary id="search-trigger">Search</summary>
      <predictive-search data-endpoint="/search/suggest" data-section-id="predictive-search">
        <input type="search" role="combobox" aria-expanded="false">
        <div data-predictive-results hidden></div>
        <p data-predictive-status role="status" aria-live="polite" data-suggestion-one="1 suggestion" data-suggestions-many="[count] suggestions" data-no-suggestions="No suggestions"></p>
      </predictive-search>
    </details>
  </body></html>`, 'https://shop.example/');
  const { window } = dom;
  let responseMarkup = `<div id="shopify-section-predictive-search"><ul>
    <li id="PredictiveProduct-1" data-predictive-item role="option" aria-selected="false"><a href="/products/serum">Serum</a></li>
    <li id="PredictiveCollection-1" data-predictive-item role="option" aria-selected="false"><a href="/collections/serums">Serums</a></li>
    <li id="PredictivePage-1" data-predictive-item role="option" aria-selected="false"><a href="/pages/shipping">Shipping</a></li>
    <li id="PredictiveArticle-1" data-predictive-item role="option" aria-selected="false"><a href="/blogs/journal/routine">Routine</a></li>
  </ul></div>`;
  const requests = [];
  window.fetch = async (input, init) => {
    requests.push({ url: new URL(input, window.location.href), init });
    return { ok: true, text: async () => responseMarkup };
  };
  window.eval(predictiveSearchScript);

  const component = window.document.querySelector('predictive-search');
  const input = component.querySelector('input[type="search"]');
  const results = component.querySelector('[data-predictive-results]');
  const details = component.closest('details');
  input.value = 'serum';
  await component.search();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.searchParams.get('q'), 'serum');
  assert.equal(requests[0].url.searchParams.get('section_id'), 'predictive-search');
  assert.equal(requests[0].url.searchParams.get('resources[type]'), 'product,collection,page,article');
  assert.equal(requests[0].url.searchParams.get('resources[limit]'), '5');
  assert.equal(requests[0].url.searchParams.get('resources[options][unavailable_products]'), 'last');
  assert.equal(requests[0].init.headers.Accept, 'text/html');
  assert.equal(results.querySelectorAll('[data-predictive-item]').length, 4);
  assert.equal(results.hidden, false);
  assert.equal(input.getAttribute('aria-expanded'), 'true');
  assert.equal(component.querySelector('[data-predictive-status]').textContent, '4 suggestions');

  const arrowDown = new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
  input.dispatchEvent(arrowDown);
  assert.equal(arrowDown.defaultPrevented, true);
  assert.equal(input.getAttribute('aria-activedescendant'), 'PredictiveProduct-1');
  assert.equal(results.querySelector('#PredictiveProduct-1').getAttribute('aria-selected'), 'true');
  const arrowUp = new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
  input.dispatchEvent(arrowUp);
  assert.equal(input.getAttribute('aria-activedescendant'), 'PredictiveArticle-1'); // wraps to the last suggestion

  const escape = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  input.dispatchEvent(escape);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(details.open, false);
  assert.equal(results.hidden, true);
  assert.equal(input.getAttribute('aria-expanded'), 'false');
  assert.equal(window.document.activeElement.id, 'search-trigger');

  responseMarkup = '<div id="shopify-section-predictive-search"><p>No result items</p></div>';
  input.value = 'unknown item';
  await component.search();
  assert.equal(component.querySelector('[data-predictive-status]').textContent, 'No suggestions');
  assert.equal(results.hidden, false);

  input.value = 'x';
  await component.search();
  assert.equal(requests.length, 2); // terms shorter than two characters do not make a request
  assert.equal(results.hidden, true);
  assert.equal(input.getAttribute('aria-expanded'), 'false');
  dom.window.close();
});

test('subscription selectors update optional discounts and required-plan availability', () => {
  const dom = createDom(`<!doctype html><html><body>
    <section id="optional-product" data-product-root data-current-variant-id="11" data-sold-out-label="Sold out">
      <select data-variant-select><option value="11" selected>Serum</option></select>
      <select data-selling-plan-select data-requires-selling-plan="false">
        <option value="" data-one-time-purchase selected>One time</option>
        <option value="optional-monthly" data-variant-id="11" data-price="900" data-compare-at-price="1000">Monthly</option>
      </select>
      <span data-product-price></span><s data-compare-price hidden></s>
      <p data-variant-status data-available="Available" data-unavailable="Unavailable" data-plan-unavailable="Plan unavailable"></p>
      <button data-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules>[]</script>
    </section>
    <section id="required-product" data-product-root data-current-variant-id="101" data-sold-out-label="Sold out">
      <select data-variant-select><option value="101" selected>30 ml</option><option value="202">60 ml</option><option value="303">90 ml</option></select>
      <select data-selling-plan-select data-requires-selling-plan="true" required>
        <option value="" data-one-time-purchase disabled>One time</option>
        <option value="required-monthly-101" data-variant-id="101" data-price="1100" data-compare-at-price="1200" selected>Monthly</option>
        <option value="required-monthly-202" data-variant-id="202" data-price="1900" data-compare-at-price="2100">Monthly</option>
      </select>
      <span data-product-price></span><s data-compare-price hidden></s>
      <p data-variant-status data-available="Available" data-unavailable="Unavailable" data-plan-unavailable="Plan unavailable"></p>
      <button data-add-to-cart data-add-label="Add to bag" data-sold-out-label="Sold out" data-plan-unavailable-label="Plan unavailable"></button>
      <script type="application/json" data-product-variants></script>
      <script type="application/json" data-product-quantity-rules>[]</script>
    </section>
  </body></html>`);
  const { window } = dom;
  const optionalRoot = window.document.getElementById('optional-product');
  optionalRoot.dataset.moneyFormat = '${{amount}}';
  optionalRoot.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 11, options: ['Serum'], price: 1000, compare_at_price: 1000, available: true }
  ]);
  const requiredRoot = window.document.getElementById('required-product');
  requiredRoot.dataset.moneyFormat = '${{amount}}';
  requiredRoot.querySelector('[data-product-variants]').textContent = JSON.stringify([
    { id: 101, options: ['30 ml'], price: 1200, compare_at_price: 1200, available: true },
    { id: 202, options: ['60 ml'], price: 2100, compare_at_price: 2100, available: true },
    { id: 303, options: ['90 ml'], price: 3000, compare_at_price: 3000, available: true }
  ]);
  window.eval(themeScript);

  const optionalPlan = optionalRoot.querySelector('[data-selling-plan-select]');
  assert.equal(optionalPlan.value, '');
  assert.equal(optionalRoot.querySelector('[data-product-price]').textContent, '$10.00');
  optionalPlan.value = 'optional-monthly';
  optionalPlan.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(optionalRoot.querySelector('[data-product-price]').textContent, '$9.00');
  assert.equal(optionalRoot.querySelector('[data-compare-price]').textContent, '$10.00');
  assert.equal(optionalRoot.querySelector('[data-compare-price]').hidden, false);

  const requiredPlan = requiredRoot.querySelector('[data-selling-plan-select]');
  const variantSelect = requiredRoot.querySelector('[data-variant-select]');
  assert.equal(requiredPlan.value, 'required-monthly-101');
  variantSelect.value = '202';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(requiredPlan.value, 'required-monthly-202');
  assert.equal(requiredRoot.querySelector('[data-product-price]').textContent, '$19.00');
  assert.equal(requiredPlan.querySelector('[data-variant-id="101"]').disabled, true);

  variantSelect.value = '303';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(requiredPlan.disabled, true);
  assert.equal(requiredRoot.querySelector('[data-variant-status]').textContent, 'Plan unavailable');
  assert.equal(requiredRoot.querySelector('[data-add-to-cart]').disabled, true);
  assert.equal(requiredRoot.querySelector('[data-add-to-cart]').textContent, 'Plan unavailable');

  variantSelect.value = '101';
  variantSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(requiredPlan.disabled, false);
  assert.equal(requiredPlan.value, 'required-monthly-101');
  assert.equal(requiredRoot.querySelector('[data-add-to-cart]').disabled, false);
  dom.window.close();
});

test('pickup availability ignores stale variants, rejects cross-origin redirects, and hides unavailable content', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <div class="product-block">
      <div data-store-availability-container data-base-url="https://shop.example/" data-variant-id="101" hidden aria-live="polite"></div>
    </div>
  </body></html>`);
  const { window } = dom;
  const pending = [];
  window.fetch = (input, init) => new Promise((resolve) => {
    pending.push({ url: new URL(input, window.location.href), init, resolve });
  });
  window.eval(pickupAvailabilityScript);

  const container = window.document.querySelector('[data-store-availability-container]');
  const block = container.closest('.product-block');
  assert.equal(pending.length, 1);
  assert.equal(pending[0].url.pathname, '/variants/101/');
  assert.equal(pending[0].url.searchParams.get('section_id'), 'pickup-availability');
  assert.equal(pending[0].init.headers.Accept, 'text/html');

  const updatedRequest = window.SolunePickupAvailability.load(container, '202');
  assert.equal(pending.length, 2);
  assert.equal(container.dataset.variantId, '202');
  assert.equal(container.getAttribute('aria-busy'), 'true');
  pending[1].resolve({ ok: true, text: async () => '<div id="shopify-section-pickup-availability" class="shopify-section"><p>Pickup available for 60 ml</p></div>' });
  await updatedRequest;
  assert.equal(container.hidden, false);
  assert.equal(block.hidden, false);
  assert.match(container.textContent, /Pickup available for 60 ml/);
  assert.equal(container.hasAttribute('aria-busy'), false);

  pending[0].resolve({ ok: true, text: async () => '<div id="shopify-section-pickup-availability" class="shopify-section"><p>Stale pickup data for 30 ml</p></div>' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.match(container.textContent, /Pickup available for 60 ml/);
  assert.doesNotMatch(container.textContent, /Stale pickup data/);

  const unavailableRequest = window.SolunePickupAvailability.load(container, '303');
  assert.equal(pending.length, 3);
  pending[2].resolve({ ok: true, text: async () => '<div id="shopify-section-pickup-availability" class="shopify-section"></div>' });
  await unavailableRequest;
  assert.equal(container.hidden, true);
  assert.equal(block.hidden, true);
  assert.equal(container.hasAttribute('aria-busy'), false);

  const redirectedRequest = window.SolunePickupAvailability.load(container, '404');
  assert.equal(pending.length, 4);
  let redirectedMarkupRead = false;
  pending[3].resolve({
    ok: true,
    url: 'https://collector.example/pickup',
    text: async () => {
      redirectedMarkupRead = true;
      return '<div id="shopify-section-pickup-availability"><img src=x onerror=alert(1)></div>';
    }
  });
  await redirectedRequest;
  assert.equal(redirectedMarkupRead, false);
  assert.equal(container.innerHTML, '');
  assert.equal(container.hidden, true);
  dom.window.close();
});

test('gift-card recipient toggle enforces email, form properties, and local 90-day date bounds across DST', () => {
  const dom = createDom(`<!doctype html><html><body>
    <form id="gift-card-form">
    <div data-gift-card-recipient>
      <input type="checkbox" data-gift-card-recipient-toggle>
      <div data-gift-card-recipient-fields>
        <input type="email" name="properties[Recipient email]">
        <input type="date" name="properties[Send on]" data-gift-card-send-on>
        <input type="hidden" name="properties[__shopify_offset]" data-gift-card-timezone>
      </div>
    </div>
    </form>
  </body></html>`);
  const { window } = dom;
  const RealDate = window.Date;
  class FrozenDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-03-07T23:30:00'])); }
    static now() { return new RealDate('2026-03-07T23:30:00').getTime(); }
  }
  Object.setPrototypeOf(FrozenDate, RealDate);
  window.Date = FrozenDate;
  window.eval(themeScript);

  const form = window.document.getElementById('gift-card-form');
  const toggle = window.document.querySelector('[data-gift-card-recipient-toggle]');
  const fields = window.document.querySelector('[data-gift-card-recipient-fields]');
  const email = fields.querySelector('input[type="email"]');
  const sendDate = window.document.querySelector('[data-gift-card-send-on]');
  const timezone = window.document.querySelector('[data-gift-card-timezone]');
  assert.equal(sendDate.min, '2026-03-07');
  assert.equal(sendDate.max, '2026-06-05');
  assert.equal(timezone.value, '300');
  assert.equal(new window.FormData(form).has('properties[Recipient email]'), false);

  toggle.checked = true;
  toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(fields.hidden, false);
  assert.equal(email.disabled, false);
  assert.equal(email.required, true);
  email.value = 'customer@example.test';
  sendDate.value = '2026-06-05';
  const properties = new window.FormData(form);
  assert.equal(properties.get('properties[Recipient email]'), 'customer@example.test');
  assert.equal(properties.get('properties[Send on]'), '2026-06-05');
  assert.equal(properties.get('properties[__shopify_offset]'), '300');
  toggle.checked = false;
  toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(fields.hidden, true);
  assert.equal(email.disabled, true);
  const disabledProperties = new window.FormData(form);
  assert.equal(disabledProperties.has('properties[Recipient email]'), false);
  assert.equal(disabledProperties.has('properties[Send on]'), false);
  assert.equal(disabledProperties.has('properties[__shopify_offset]'), false);
  dom.window.close();
});

test('cart Ajax rejects cross-origin endpoints before sending shopper or cart data', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <dialog data-cart-drawer data-add-url="https://collector.example/cart/add.js" data-change-url="/cart/change.js" data-update-url="/cart/update.js" data-cart-url="/cart.js" data-section-url="/cart?section_id=cart-drawer"></dialog>
    <form id="ProductForm" action="/cart/add.js" method="post"><input name="id" value="variant-1"><input name="quantity" value="1"><button type="submit" name="add">Add</button></form>
  </body></html>`);
  const { window } = dom;
  let fetchCalls = 0;
  window.fetch = () => { fetchCalls += 1; throw new Error('A cross-origin request should not be made.'); };
  window.eval(cartScript);
  const form = window.document.getElementById('ProductForm');
  form.requestSubmit(form.querySelector('[name="add"]'));
  await waitFor(() => Boolean(form.querySelector('[data-cart-form-error]')));
  assert.equal(fetchCalls, 0);
  assert.equal(form.querySelector('[data-cart-form-error]').textContent, 'Cart requests must stay on this storefront.');
  dom.window.close();
});

test('cart add failures announce an accessible error and restore the submit button', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <dialog data-cart-drawer data-add-url="/cart/add.js" data-change-url="/cart/change.js" data-update-url="/cart/update.js" data-cart-url="/cart.js" data-section-url="/cart?section_id=cart-drawer" data-update-error="Cart update failed"></dialog>
    <form id="ProductForm" action="/cart/add.js" method="post"><input name="id" value="variant-sold-out"><button type="submit" name="add">Add to bag</button></form>
  </body></html>`);
  const { window } = dom;
  window.fetch = async () => ({ ok: false, json: async () => ({ description: 'This option is no longer available.' }) });
  window.eval(cartScript);

  const form = window.document.getElementById('ProductForm');
  const submit = form.querySelector('[name="add"]');
  let submitEvent;
  form.addEventListener('submit', (event) => { submitEvent = event; });
  form.requestSubmit(submit);
  assert.equal(submitEvent.defaultPrevented, true);
  await waitFor(() => Boolean(form.querySelector('[data-cart-form-error]')));
  const error = form.querySelector('[data-cart-form-error]');
  assert.equal(error.getAttribute('role'), 'alert');
  assert.equal(error.textContent, 'This option is no longer available.');
  assert.equal(submit.disabled, false);
  assert.equal(submit.hasAttribute('aria-busy'), false);
  assert.equal(form.dataset.cartDrawerSubmitting, undefined);
  assert.equal(window.document.activeElement, submit);
  assert.equal(window.document.querySelector('[data-cart-drawer]').open, false);
  dom.window.close();
});

test('cart forms keep their native fallback when the drawer is absent or action is not add-to-cart', () => {
  const fallbackDom = createDom(`<!doctype html><html><body>
    <form id="ProductForm" action="/cart/add" method="post"><input name="id" value="variant-1"></form>
    <button type="submit" form="ProductForm">Add</button>
  </body></html>`);
  let fetchCalls = 0;
  fallbackDom.window.fetch = () => { fetchCalls += 1; throw new Error('Fallback should not issue an Ajax request.'); };
  fallbackDom.window.eval(cartScript);
  const productForm = fallbackDom.window.document.getElementById('ProductForm');
  const nativeAdd = new fallbackDom.window.Event('submit', { bubbles: true, cancelable: true });
  productForm.dispatchEvent(nativeAdd);
  assert.equal(nativeAdd.defaultPrevented, false);
  assert.equal(fetchCalls, 0);
  fallbackDom.window.close();

  const checkoutDom = createDom(`<!doctype html><html><body>
    <dialog data-cart-drawer data-add-url="/cart/add.js" data-change-url="/cart/change.js" data-update-url="/cart/update.js" data-cart-url="/cart.js" data-section-url="/cart?section_id=cart-drawer"></dialog>
    <form id="CheckoutForm" action="/cart" method="post"><button name="checkout" type="submit">Checkout</button></form>
  </body></html>`);
  checkoutDom.window.fetch = () => { fetchCalls += 1; throw new Error('Checkout fallback should not issue an Ajax add.'); };
  checkoutDom.window.eval(cartScript);
  const checkoutForm = checkoutDom.window.document.getElementById('CheckoutForm');
  const nativeCheckout = new checkoutDom.window.Event('submit', { bubbles: true, cancelable: true });
  checkoutForm.dispatchEvent(nativeCheckout);
  assert.equal(nativeCheckout.defaultPrevented, false);
  assert.equal(fetchCalls, 0);
  checkoutDom.window.close();
});

test('mock Ajax cart handles an external form-associated submit, changes, removes, announces, and closes', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <span data-cart-count>0</span>
    <dialog data-cart-drawer data-add-url="/cart/add.js" data-change-url="/cart/change.js" data-update-url="/cart/update.js" data-cart-url="/cart.js" data-section-url="/cart?section_id=cart-drawer" data-added-label="Added to bag" data-note-saved-label="Order note saved." data-update-error="Cart update failed">
      <button type="button" data-cart-drawer-close>Close</button>
      <div data-cart-drawer-body><p data-cart-drawer-empty>Empty bag</p></div>
      <p data-cart-drawer-status role="status" aria-live="polite"></p>
    </dialog>
    <form id="ProductForm" method="post" action="/cart/add.js"><input name="id" value="variant-1"><input name="quantity" value="2"></form>
    <button id="external-add" type="submit" name="add" form="ProductForm">Add</button>
  </body></html>`);
  const { window } = dom;
  let itemCount = 0;
  let quantity = 0;
  let changeCalls = 0;
  let lastChangedQuantity = null;
  let savedNote = '';
  const jsonResponse = (value) => ({ ok: true, json: async () => value });
  const htmlResponse = (value) => ({ ok: true, text: async () => value });
  const sectionMarkup = () => {
    const content = itemCount
      ? `<ul><li data-cart-line data-line-key="line-1"><button type="button" data-cart-quantity-step="down" data-line-key="line-1">−</button><input type="number" min="2" step="3" max="9" value="${quantity}" data-cart-quantity data-line-key="line-1" aria-label="Quantity"><button type="button" data-cart-quantity-step="up" data-line-key="line-1">+</button><a href="/cart/change?line=1&amp;quantity=0" data-cart-remove data-line-key="line-1">Remove</a></li></ul><form action="/cart" method="post" data-cart-note-form><textarea name="note"></textarea><button type="submit" name="update">Save note</button></form>`
      : '<p data-cart-drawer-empty>Empty bag</p>';
    return `<dialog data-cart-drawer><button type="button" data-cart-drawer-close>Close</button><div data-cart-drawer-body>${content}</div><p data-cart-drawer-status role="status" aria-live="polite"></p></dialog>`;
  };

  window.fetch = async (input, init = {}) => {
    const url = new URL(input, window.location.href);
    if (url.pathname === '/cart/add.js') {
      quantity = Number(init.body.get('quantity') || 1);
      itemCount = quantity;
      return jsonResponse({ item_count: itemCount });
    }
    if (url.pathname === '/cart/change.js') {
      changeCalls += 1;
      lastChangedQuantity = Number(init.body.get('quantity'));
      quantity = lastChangedQuantity;
      itemCount = quantity;
      return jsonResponse({ item_count: itemCount });
    }
    if (url.pathname === '/cart/update.js') {
      savedNote = init.body.get('note');
      return jsonResponse({ item_count: itemCount });
    }
    if (url.pathname === '/cart.js') return jsonResponse({ item_count: itemCount });
    if (url.pathname === '/cart' && url.searchParams.has('section_id')) return htmlResponse(sectionMarkup());
    throw new Error(`Unexpected request ${url}`);
  };
  window.eval(cartScript);

  const drawer = window.document.querySelector('[data-cart-drawer]');
  const form = window.document.getElementById('ProductForm');
  const submit = window.document.getElementById('external-add');
  let submitEvent;
  form.addEventListener('submit', (event) => { submitEvent = event; });
  form.requestSubmit(submit);
  assert.equal(submitEvent.submitter, submit);
  assert.equal(submitEvent.defaultPrevented, true);
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '2');
  assert.equal(quantity, 2);
  assert.equal(drawer.open, true);
  assert.equal(window.document.querySelector('[data-cart-drawer-status]').textContent, 'Added to bag');

  let quantityInput = window.document.querySelector('[data-cart-quantity]');
  assert.equal(quantityInput.min, '2');
  assert.equal(quantityInput.step, '3');
  assert.equal(quantityInput.max, '8');
  assert.equal(quantityInput.value, '2');
  assert.equal(window.document.querySelector('[data-cart-quantity-step="down"]').disabled, true);
  window.document.querySelector('[data-cart-quantity-step="up"]').click();
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '5'
    && window.document.querySelector('[data-cart-quantity]')?.value === '5');
  assert.equal(lastChangedQuantity, 5);
  assert.equal(window.document.querySelector('[data-cart-quantity-step="down"]').disabled, false);

  quantityInput = window.document.querySelector('[data-cart-quantity]');
  quantityInput.value = '6';
  quantityInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitFor(() => changeCalls === 2 && lastChangedQuantity === 5
    && window.document.querySelector('[data-cart-quantity]')?.value === '5');
  await waitFor(() => window.document.querySelector('[data-cart-drawer-status]').textContent === '');
  await new Promise((resolve) => setTimeout(resolve, 0));
  window.document.querySelector('[data-cart-quantity-step="up"]').click();
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '8'
    && window.document.querySelector('[data-cart-quantity]')?.value === '8');
  assert.equal(window.document.querySelector('[data-cart-quantity-step="up"]').disabled, true);
  await waitFor(() => window.document.querySelector('[data-cart-drawer-status]').textContent === '');
  await new Promise((resolve) => setTimeout(resolve, 0));

  const noteForm = drawer.querySelector('[data-cart-note-form]');
  const noteField = noteForm.querySelector('[name="note"]');
  const noteSubmit = noteForm.querySelector('[type="submit"]');
  let noteSubmitEvent;
  noteForm.addEventListener('submit', (event) => { noteSubmitEvent = event; });
  noteField.value = 'Please include a routine card.';
  noteForm.requestSubmit(noteSubmit);
  assert.equal(noteSubmitEvent.defaultPrevented, true);
  await waitFor(() => window.document.querySelector('[data-cart-drawer-status]').textContent === 'Order note saved.');
  assert.equal(savedNote, 'Please include a routine card.');
  assert.equal(noteSubmit.disabled, false);
  assert.equal(noteSubmit.hasAttribute('aria-busy'), false);

  window.document.querySelector('[data-cart-remove]').click();
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '0');
  assert.ok(window.document.querySelector('[data-cart-drawer-empty]'));

  const cancelEvent = new window.Event('cancel', { cancelable: true });
  drawer.dispatchEvent(cancelEvent);
  assert.equal(cancelEvent.defaultPrevented, true);
  assert.equal(drawer.open, false);
  assert.equal(window.document.activeElement, submit);
  dom.window.close();
});
