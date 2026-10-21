(() => {
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;

  const state = { lastTrigger: null, isUpdating: false };
  const getUrl = (attribute) => drawer.dataset[attribute];
  const getStatus = () => drawer.querySelector('[data-cart-drawer-status]');

  const announce = (message) => {
    const status = getStatus();
    if (status) status.textContent = message;
  };

  const updateCartCount = (count) => {
    document.querySelectorAll('[data-cart-count]').forEach((counter) => {
      counter.textContent = String(count);
      const trigger = counter.closest('[data-cart-label]');
      if (trigger) trigger.setAttribute('aria-label', `${trigger.dataset.cartLabel}, ${count}`);
    });
  };

  const getQuantityBounds = (input) => {
    const rawMinimum = Number(input.min);
    const minimum = Number.isFinite(rawMinimum) && rawMinimum > 0 ? rawMinimum : 1;
    const rawIncrement = Number(input.step);
    const increment = Number.isFinite(rawIncrement) && rawIncrement > 0 ? rawIncrement : 1;
    const rawMaximum = input.max === '' ? Number.POSITIVE_INFINITY : Number(input.max);
    const maximum = Number.isFinite(rawMaximum)
      ? minimum + Math.floor(Math.max(0, rawMaximum - minimum) / increment) * increment
      : Number.POSITIVE_INFINITY;
    return { minimum, increment, maximum };
  };

  const normalizeCartQuantity = (input, quantity) => {
    const { minimum, increment, maximum } = getQuantityBounds(input);
    const value = String(quantity ?? '').trim();
    if (!value) return minimum;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return minimum;
    if (parsed <= 0) return 0;
    const clamped = Math.min(maximum, Math.max(minimum, parsed));
    return minimum + Math.floor((clamped - minimum) / increment) * increment;
  };

  const updateCartQuantityControls = () => {
    drawer.querySelectorAll('[data-cart-quantity]').forEach((input) => {
      const { minimum, maximum } = getQuantityBounds(input);
      if (Number.isFinite(maximum)) input.max = String(maximum);
      const quantity = Number(input.value || minimum);
      const line = input.closest('[data-cart-line]');
      const downButton = line?.querySelector('[data-cart-quantity-step="down"]');
      const upButton = line?.querySelector('[data-cart-quantity-step="up"]');
      if (downButton) downButton.disabled = quantity <= minimum;
      if (upButton) upButton.disabled = quantity >= maximum;
    });
  };

  const openDrawer = async (trigger) => {
    state.lastTrigger = trigger || state.lastTrigger;
    if (!drawer.open) {
      if (typeof drawer.showModal === 'function') drawer.showModal();
      else drawer.setAttribute('open', '');
    }
    try {
      await refreshDrawer();
    } catch (error) {
      announce(drawer.dataset.updateError || 'Your bag could not be refreshed.');
    }
  };

  const closeDrawer = () => {
    if (typeof drawer.close === 'function' && drawer.open) drawer.close();
    else drawer.removeAttribute('open');
    state.lastTrigger?.focus?.();
  };

  const parseJsonResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.description || data.message || drawer.dataset.updateError;
      throw new Error(message || 'Your bag could not be updated.');
    }
    return data;
  };

  const refreshDrawer = async (focusLineKey = null) => {
    const focusWasInsideDrawer = drawer.contains(document.activeElement);
    const sectionUrl = getUrl('sectionUrl');
    const cartUrl = getUrl('cartUrl');
    const [sectionResponse, cartResponse] = await Promise.all([
      fetch(sectionUrl, { headers: { Accept: 'text/html' }, credentials: 'same-origin' }),
      fetch(cartUrl, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    ]);

    if (!sectionResponse.ok) throw new Error(`Cart drawer section returned ${sectionResponse.status}`);
    const [markup, cart] = await Promise.all([sectionResponse.text(), parseJsonResponse(cartResponse)]);
    const parsedDocument = new DOMParser().parseFromString(markup, 'text/html');
    const nextDrawer = parsedDocument.querySelector('[data-cart-drawer]');
    if (!nextDrawer) throw new Error('Cart drawer markup was not returned.');

    drawer.innerHTML = nextDrawer.innerHTML;
    updateCartCount(cart.item_count || 0);
    updateCartQuantityControls();

    if (focusLineKey) {
      const quantities = [...drawer.querySelectorAll('[data-cart-quantity]')];
      const nextQuantity = quantities.find((input) => input.dataset.lineKey === focusLineKey) || quantities[0];
      (nextQuantity || drawer.querySelector('[data-cart-drawer-close]'))?.focus({ preventScroll: true });
    } else if (focusWasInsideDrawer) {
      drawer.querySelector('[data-cart-drawer-close]')?.focus({ preventScroll: true });
    }
    return cart;
  };

  const changeLineQuantity = async (lineKey, quantity, focusAfterUpdate = false) => {
    if (state.isUpdating || !lineKey) return;
    state.isUpdating = true;
    const line = [...drawer.querySelectorAll('[data-cart-line]')]
      .find((item) => item.dataset.lineKey === lineKey);
    const input = line?.querySelector('[data-cart-quantity]');
    const nextQuantity = input
      ? normalizeCartQuantity(input, quantity)
      : Math.max(0, Number(quantity) || 0);
    if (input) {
      input.value = String(nextQuantity);
      updateCartQuantityControls();
    }
    line?.setAttribute('aria-busy', 'true');

    try {
      const body = new URLSearchParams({ id: lineKey, quantity: String(nextQuantity) });
      const response = await fetch(getUrl('changeUrl'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: 'same-origin',
        body
      });
      const cart = await parseJsonResponse(response);
      updateCartCount(cart.item_count || 0);
      await refreshDrawer(focusAfterUpdate ? lineKey : null);
      announce('');
    } catch (error) {
      line?.removeAttribute('aria-busy');
      await refreshDrawer(focusAfterUpdate ? lineKey : null).catch(() => {});
      announce(drawer.dataset.updateError || error.message);
    } finally {
      state.isUpdating = false;
    }
  };

  const showFormError = (form, message) => {
    let error = form.querySelector('[data-cart-form-error]');
    if (!error) {
      error = document.createElement('p');
      error.className = 'form-status form-status--error';
      error.setAttribute('role', 'alert');
      error.dataset.cartFormError = '';
      form.prepend(error);
    }
    error.textContent = message;
  };

  const saveCartNote = async (form) => {
    if (form.dataset.cartNoteSaving === 'true') return;
    const noteField = form.querySelector('[name="note"]');
    const submitter = form.querySelector('[type="submit"]');
    if (!noteField) return;

    const wasDisabled = submitter?.disabled || false;
    form.dataset.cartNoteSaving = 'true';
    form.querySelector('[data-cart-form-error]')?.remove();
    if (submitter) {
      submitter.disabled = true;
      submitter.setAttribute('aria-busy', 'true');
    }

    try {
      const response = await fetch(getUrl('updateUrl'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: 'same-origin',
        body: new URLSearchParams({ note: noteField.value })
      });
      const cart = await parseJsonResponse(response);
      updateCartCount(cart.item_count || 0);
      announce(drawer.dataset.noteSavedLabel || 'Order note saved.');
    } catch (error) {
      showFormError(form, drawer.dataset.noteUpdateError || error.message || drawer.dataset.updateError);
    } finally {
      if (submitter) {
        submitter.disabled = wasDisabled;
        submitter.removeAttribute('aria-busy');
      }
      delete form.dataset.cartNoteSaving;
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-cart-drawer-open]');
    if (trigger) {
      event.preventDefault();
      openDrawer(trigger);
      return;
    }

    if (event.target.closest('[data-cart-drawer-close]')) {
      closeDrawer();
      return;
    }

    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
      event.preventDefault();
      if (state.isUpdating) return;
      changeLineQuantity(removeButton.dataset.lineKey, 0, true);
      return;
    }

    const stepButton = event.target.closest('[data-cart-quantity-step]');
    if (stepButton) {
      if (state.isUpdating) return;
      const lineKey = stepButton.dataset.lineKey;
      const input = [...drawer.querySelectorAll('[data-cart-quantity]')]
        .find((candidate) => candidate.dataset.lineKey === lineKey);
      if (!input) return;
      const { minimum, increment } = getQuantityBounds(input);
      const direction = stepButton.dataset.cartQuantityStep === 'up' ? 1 : -1;
      const currentQuantity = Number(input.value || minimum);
      const nextQuantity = normalizeCartQuantity(input, Math.max(minimum, currentQuantity + direction * increment));
      input.value = String(nextQuantity);
      updateCartQuantityControls();
      changeLineQuantity(lineKey, nextQuantity, true);
    }
  });

  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) closeDrawer();
  });

  drawer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDrawer();
  });

  drawer.addEventListener('change', (event) => {
    const input = event.target.closest('[data-cart-quantity]');
    if (!input || state.isUpdating) return;
    const quantity = normalizeCartQuantity(input, input.value);
    input.value = String(quantity);
    updateCartQuantityControls();
    changeLineQuantity(input.dataset.lineKey, quantity, true);
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.matches('[data-cart-note-form]')) {
      event.preventDefault();
      saveCartNote(form);
      return;
    }
    if (!form.action.includes('/cart/add')) return;
    if (form.dataset.cartDrawerSubmitting === 'true') return;

    event.preventDefault();
    form.dataset.cartDrawerSubmitting = 'true';
    const submitter = event.submitter instanceof HTMLButtonElement || event.submitter instanceof HTMLInputElement
      ? event.submitter
      : form.querySelector('[name="add"]');
    const wasDisabled = submitter?.disabled || false;
    submitter?.setAttribute('aria-busy', 'true');
    if (submitter) submitter.disabled = true;
    form.querySelector('[data-cart-form-error]')?.remove();
    let shouldRefocusSubmitter = false;

    try {
      const response = await fetch(getUrl('addUrl'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        body: new FormData(form)
      });
      await parseJsonResponse(response);
      state.lastTrigger = submitter || document.activeElement;
      if (!drawer.open) {
        if (typeof drawer.showModal === 'function') drawer.showModal();
        else drawer.setAttribute('open', '');
      }
      announce(drawer.dataset.addedLabel || 'Added to your bag.');
      try {
        await refreshDrawer();
        announce(drawer.dataset.addedLabel || 'Added to your bag.');
      } catch (error) {
        announce(drawer.dataset.updateError || 'Your bag was updated. Open the bag page to review it.');
      }
    } catch (error) {
      showFormError(form, error.message || drawer.dataset.updateError || 'Could not add this item.');
      shouldRefocusSubmitter = true;
    } finally {
      if (submitter) {
        submitter.disabled = wasDisabled;
        submitter.removeAttribute('aria-busy');
      }
      delete form.dataset.cartDrawerSubmitting;
    }
    if (shouldRefocusSubmitter && submitter && !submitter.disabled) submitter.focus();
  });

  updateCartQuantityControls();
})();
