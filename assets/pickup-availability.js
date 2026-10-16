(() => {
  const loadPickupAvailability = async (container, variantId) => {
    if (!container || !variantId || !container.dataset.baseUrl) return;
    const requestId = (Number(container.dataset.requestId) || 0) + 1;
    container.dataset.requestId = String(requestId);
    container.dataset.variantId = String(variantId);
    container.hidden = true;
    container.setAttribute('aria-busy', 'true');

    try {
      const url = new URL(`variants/${encodeURIComponent(variantId)}/?section_id=pickup-availability`, container.dataset.baseUrl);
      const response = await fetch(url, { headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`Pickup availability returned ${response.status}`);
      const markup = await response.text();
      if (container.dataset.requestId !== String(requestId)) return;

      const documentFromResponse = new DOMParser().parseFromString(markup, 'text/html');
      const section = documentFromResponse.querySelector('.shopify-section');
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
