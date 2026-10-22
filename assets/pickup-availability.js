(() => {
  const loadPickupAvailability = async (container, variantId) => {
    if (!container || !variantId || !container.dataset.baseUrl) return;
    const requestId = (Number(container.dataset.requestId) || 0) + 1;
    container.dataset.requestId = String(requestId);
    container.dataset.variantId = String(variantId);
    container.hidden = true;
    container.setAttribute('aria-busy', 'true');

    try {
      const baseUrl = new URL(container.dataset.baseUrl, window.location.origin);
      if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
        throw new Error('Pickup availability requires a valid storefront URL.');
      }
      const url = new URL(`variants/${encodeURIComponent(variantId)}/?section_id=pickup-availability`, baseUrl);
      if (url.origin !== baseUrl.origin) throw new Error('Pickup availability must stay on the storefront origin.');
      const response = await fetch(url, { headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`Pickup availability returned ${response.status}`);
      const responseUrl = response.url ? new URL(response.url, url) : url;
      if (responseUrl.origin !== baseUrl.origin) throw new Error('Pickup availability redirected to another origin.');
      const markup = await response.text();
      if (container.dataset.requestId !== String(requestId)) return;

      const documentFromResponse = new DOMParser().parseFromString(markup, 'text/html');
      const section = documentFromResponse.querySelector('#shopify-section-pickup-availability');
      if (!section) throw new Error('Pickup availability section was not returned');
      container.innerHTML = section.innerHTML;
      container.hidden = !container.innerHTML.trim();
      const productBlock = container.closest('.product-block');
      if (productBlock) productBlock.hidden = container.hidden;
    } catch (error) {
      if (container.dataset.requestId === String(requestId)) {
        container.innerHTML = '';
        container.hidden = true;
        const productBlock = container.closest('.product-block');
        if (productBlock) productBlock.hidden = true;
      }
    } finally {
      if (container.dataset.requestId === String(requestId)) container.removeAttribute('aria-busy');
    }
  };

  const initialize = (scope = document) => {
    scope.querySelectorAll('[data-store-availability-container]').forEach((container) => {
      loadPickupAvailability(container, container.dataset.variantId);
    });
  };

  window.SolunePickupAvailability = { load: loadPickupAvailability };
  initialize();
  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
})();
