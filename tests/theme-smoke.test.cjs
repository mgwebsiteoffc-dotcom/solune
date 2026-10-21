const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

process.env.TZ = 'America/New_York';

const themeScript = fs.readFileSync(path.join(__dirname, '../assets/theme.js'), 'utf8');
const cartScript = fs.readFileSync(path.join(__dirname, '../assets/cart-drawer.js'), 'utf8');

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

test('gift-card recipient toggle enforces email and local 90-day date bounds across DST', () => {
  const dom = createDom(`<!doctype html><html><body>
    <div data-gift-card-recipient>
      <input type="checkbox" data-gift-card-recipient-toggle>
      <div data-gift-card-recipient-fields>
        <input type="email" name="properties[Recipient email]">
        <input type="date" name="properties[Send on]" data-gift-card-send-on>
        <input type="hidden" name="properties[__shopify_offset]" data-gift-card-timezone>
      </div>
    </div>
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

  const toggle = window.document.querySelector('[data-gift-card-recipient-toggle]');
  const fields = window.document.querySelector('[data-gift-card-recipient-fields]');
  const email = fields.querySelector('input[type="email"]');
  const sendDate = window.document.querySelector('[data-gift-card-send-on]');
  const timezone = window.document.querySelector('[data-gift-card-timezone]');
  assert.equal(sendDate.min, '2026-03-07');
  assert.equal(sendDate.max, '2026-06-05');
  assert.equal(timezone.value, '300');

  toggle.checked = true;
  toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(fields.hidden, false);
  assert.equal(email.disabled, false);
  assert.equal(email.required, true);
  toggle.checked = false;
  toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(fields.hidden, true);
  assert.equal(email.disabled, true);
  dom.window.close();
});

test('mock Ajax cart handles an external form-associated submit, changes, removes, announces, and closes', async () => {
  const dom = createDom(`<!doctype html><html><body>
    <span data-cart-count>0</span>
    <dialog data-cart-drawer data-add-url="/cart/add.js" data-change-url="/cart/change.js" data-update-url="/cart/update.js" data-cart-url="/cart.js" data-section-url="/cart?section_id=cart-drawer" data-added-label="Added to bag" data-update-error="Cart update failed">
      <button type="button" data-cart-drawer-close>Close</button>
      <div data-cart-drawer-body><p data-cart-drawer-empty>Empty bag</p></div>
      <p data-cart-drawer-status role="status" aria-live="polite"></p>
    </dialog>
    <form id="ProductForm" method="post" action="/cart/add.js"><input name="id" value="variant-1"></form>
    <button id="external-add" type="submit" name="add" form="ProductForm">Add</button>
  </body></html>`);
  const { window } = dom;
  let itemCount = 0;
  let quantity = 0;
  const jsonResponse = (value) => ({ ok: true, json: async () => value });
  const htmlResponse = (value) => ({ ok: true, text: async () => value });
  const sectionMarkup = () => {
    const content = itemCount
      ? `<ul><li data-cart-line data-line-key="line-1"><input type="number" value="${quantity}" data-cart-quantity data-line-key="line-1" aria-label="Quantity"><button type="button" data-cart-quantity-step="up" data-line-key="line-1">+</button><a href="/cart/change?line=1&amp;quantity=0" data-cart-remove data-line-key="line-1">Remove</a></li></ul>`
      : '<p data-cart-drawer-empty>Empty bag</p>';
    return `<dialog data-cart-drawer><button type="button" data-cart-drawer-close>Close</button><div data-cart-drawer-body>${content}</div><p data-cart-drawer-status role="status" aria-live="polite"></p></dialog>`;
  };

  window.fetch = async (input, init = {}) => {
    const url = new URL(input, window.location.href);
    if (url.pathname === '/cart/add.js') {
      itemCount = 1;
      quantity = 1;
      return jsonResponse({ item_count: itemCount });
    }
    if (url.pathname === '/cart/change.js') {
      quantity = Number(init.body.get('quantity'));
      itemCount = quantity;
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
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '1');
  assert.equal(drawer.open, true);
  assert.equal(window.document.querySelector('[data-cart-drawer-status]').textContent, 'Added to bag');

  window.document.querySelector('[data-cart-quantity-step="up"]').click();
  await waitFor(() => window.document.querySelector('[data-cart-count]').textContent === '2'
    && window.document.querySelector('[data-cart-quantity]')?.value === '2');
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
