(() => {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const formatWithDelimiters = (number, precision = 2, thousands = ',', decimal = '.') => {
    const amount = (Number(number) / 100).toFixed(precision).split('.');
    amount[0] = amount[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousands}`);
    return amount[1] ? `${amount[0]}${decimal}${amount[1]}` : amount[0];
  };

  const formatMoney = (cents, format) => {
    const moneyFormat = format || '${{amount}}';
    const match = moneyFormat.match(/\{\{\s*(\w+)\s*\}\}/);
    if (!match) return moneyFormat;

    const token = match[1];
    const precision = token.includes('no_decimals') ? 0 : 2;
    let thousands = ',';
    let decimal = '.';
    if (token.includes('comma_separator')) {
      thousands = '.';
      decimal = ',';
    } else if (token.includes('space_separator')) {
      thousands = ' ';
      decimal = ',';
    } else if (token.includes('apostrophe_separator')) {
      thousands = "'";
      decimal = '.';
    }

    const amount = formatWithDelimiters(cents, precision, thousands, decimal);
    return moneyFormat.replace(match[0], amount);
  };

  const getVariants = (root) => {
    const json = root.querySelector('[data-product-variants]');
    if (!json) return [];
    try {
      return JSON.parse(json.textContent);
    } catch (error) {
      return [];
    }
  };

  const getOptionGroups = (root) => [...root.querySelectorAll('[data-product-option-group]')]
    .sort((first, second) => Number(first.dataset.optionIndex) - Number(second.dataset.optionIndex));

  const getOptionGroupValue = (group) => {
    const checkedRadio = group.querySelector('input[data-product-option]:checked');
    if (checkedRadio) return checkedRadio.value;
    return group.querySelector('select[data-product-option]')?.value;
  };

  const getSelectedOptionValues = (root) => getOptionGroups(root).map(getOptionGroupValue);

  const setOptionGroupValue = (group, value) => {
    const radio = [...group.querySelectorAll('input[data-product-option]')]
      .find((input) => String(input.value) === String(value));
    if (radio) radio.checked = true;

    const select = group.querySelector('select[data-product-option]');
    if (select) select.value = String(value);
  };

  const syncOptionPicker = (root, variant, variants) => {
    const groups = getOptionGroups(root);
    const soldOutLabel = root.dataset.soldOutLabel || 'Sold out';

    groups.forEach((group, index) => {
      const selectedValue = variant.options?.[index];
      if (selectedValue !== undefined) setOptionGroupValue(group, selectedValue);

      const currentValue = group.querySelector('[data-option-current-value]');
      if (currentValue && selectedValue !== undefined) currentValue.textContent = selectedValue;

      const select = group.querySelector('select[data-product-option]');
      if (select) {
        [...select.options].forEach((option) => {
          const optionVariants = variants.filter((item) => String(item.options?.[index]) === String(option.value));
          const hasAvailableVariant = optionVariants.some((item) => item.available);
          option.disabled = optionVariants.length === 0;
          option.dataset.optionAvailable = String(hasAvailableVariant);
          const baseLabel = option.dataset.optionBaseLabel || option.value;
          option.textContent = hasAvailableVariant ? baseLabel : `${baseLabel} — ${soldOutLabel}`;
        });
      }

      group.querySelectorAll('input[data-product-option]').forEach((input) => {
        const optionVariants = variants.filter((item) => String(item.options?.[index]) === String(input.value));
        const hasAvailableVariant = optionVariants.some((item) => item.available);
        input.disabled = optionVariants.length === 0;
        input.dataset.optionAvailable = String(hasAvailableVariant);
        input.nextElementSibling?.classList.toggle('is-sold-out', !hasAvailableVariant);
      });
    });
  };

  const updateSellingPlans = (root, variant) => {
    const select = root.querySelector('[data-selling-plan-select]');
    if (!select) return false;

    const previousValue = select.value;
    const requiresPlan = select.dataset.requiresSellingPlan === 'true';
    const options = [...select.options];
    const oneTimeOption = options.find((option) => option.hasAttribute('data-one-time-purchase'));
    const matchingPlans = options.filter((option) => String(option.dataset.variantId) === String(variant.id));

    options.forEach((option) => {
      if (!option.dataset.variantId) return;
      const matchesVariant = String(option.dataset.variantId) === String(variant.id);
      option.hidden = !matchesVariant;
      option.disabled = !matchesVariant;
    });

    if (oneTimeOption) {
      oneTimeOption.hidden = false;
      oneTimeOption.disabled = requiresPlan;
    }

    let nextOption = matchingPlans.find((option) => option.value === previousValue);
    if (!nextOption && previousValue === '' && !requiresPlan) nextOption = oneTimeOption;
    if (!nextOption) nextOption = matchingPlans[0] || (!requiresPlan ? oneTimeOption : null);

    if (nextOption) {
      select.value = nextOption.value;
      select.disabled = false;
      return false;
    }

    select.value = '';
    select.disabled = true;
    return requiresPlan;
  };

  const updateDisplayedPrice = (root, variant) => {
    const moneyFormat = root.dataset.moneyFormat;
    const sellingPlan = root.querySelector('[data-selling-plan-select]')?.selectedOptions[0];
    const planApplies = sellingPlan && String(sellingPlan.dataset.variantId) === String(variant.id);
    let priceValue = Number(variant.price);
    let compareValue = Number(variant.compare_at_price);

    if (planApplies) {
      priceValue = Number(sellingPlan.dataset.price || variant.price);
      const allocationCompare = Number(sellingPlan.dataset.compareAtPrice || 0);
      if (allocationCompare > priceValue) compareValue = allocationCompare;
      else if (Number(variant.price) > priceValue) compareValue = Number(variant.compare_at_price) > Number(variant.price)
        ? Number(variant.compare_at_price)
        : Number(variant.price);
      else compareValue = Number(variant.compare_at_price);
    }

    const price = root.querySelector('[data-product-price]');
    const comparePrice = root.querySelector('[data-compare-price]');
    const hasDiscount = compareValue > priceValue;
    if (price) {
      price.textContent = formatMoney(priceValue, moneyFormat);
      price.classList.toggle('price--sale', hasDiscount);
    }
    if (comparePrice) {
      comparePrice.hidden = !hasDiscount;
      if (hasDiscount) comparePrice.textContent = formatMoney(compareValue, moneyFormat);
    }
  };

  const updateVariant = (root, select, updateUrl = true) => {
    const variants = getVariants(root);
    const variant = variants.find((item) => String(item.id) === String(select.value));
    if (!variant) return;

    syncOptionPicker(root, variant, variants);
    const status = root.querySelector('[data-variant-status]');
    const addButton = root.querySelector('[data-add-to-cart]');
    const planUnavailable = updateSellingPlans(root, variant);
    const moneyFormat = root.dataset.moneyFormat;

    updateDisplayedPrice(root, variant);

    if (status) {
      status.textContent = planUnavailable
        ? status.dataset.planUnavailable
        : variant.available
          ? status.dataset.available
          : status.dataset.unavailable;
    }

    if (addButton) {
      addButton.disabled = !variant.available || planUnavailable;
      addButton.textContent = planUnavailable
        ? addButton.dataset.planUnavailableLabel
        : variant.available
          ? addButton.dataset.addLabel
          : addButton.dataset.soldOutLabel;
    }
    const paymentButton = root.querySelector('.shopify-payment-button');
    if (paymentButton) paymentButton.hidden = !variant.available || planUnavailable;

    const unitPrice = root.querySelector('[data-unit-price]');
    if (unitPrice) {
      unitPrice.hidden = !variant.unit_price;
      if (variant.unit_price) {
        const amount = unitPrice.querySelector('[data-unit-price-amount]');
        if (amount) amount.textContent = formatMoney(variant.unit_price, moneyFormat);
        const measurement = unitPrice.querySelector('[data-unit-price-measure]');
        if (measurement && variant.unit_price_measurement) {
          measurement.textContent = `${variant.unit_price_measurement.reference_value}${variant.unit_price_measurement.reference_unit}`;
        }
      }
    }

    const pickupContainer = root.querySelector('[data-store-availability-container]');
    if (pickupContainer && window.SolunePickupAvailability) {
      window.SolunePickupAvailability.load(pickupContainer, variant.id);
    }

    const mediaId = variant.featured_media && variant.featured_media.id;
    if (mediaId && updateUrl) {
      const media = root.querySelector(`[data-media-id="${mediaId}"]`);
      if (media) {
        media.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'nearest'
        });
      }
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete('option_values');
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }
  };

  const resolveOptionChange = (root, changedControl) => {
    const groups = getOptionGroups(root);
    const variants = getVariants(root);
    const variantSelect = root.querySelector('[data-variant-select]');
    const changedIndex = Number(changedControl.dataset.optionIndex);
    const selectedValues = getSelectedOptionValues(root);
    const exactVariant = variants.find((variant) => variant.options?.every((value, index) => String(value) === String(selectedValues[index])));
    let variant = exactVariant;

    if (!variant) {
      const candidates = variants.filter((item) => String(item.options?.[changedIndex]) === String(changedControl.value));
      candidates.sort((first, second) => {
        const countMatches = (candidate) => candidate.options.reduce((count, value, index) => (
          index === changedIndex || String(value) === String(selectedValues[index]) ? count + 1 : count
        ), 0);
        const matchDifference = countMatches(second) - countMatches(first);
        if (matchDifference !== 0) return matchDifference;
        return Number(second.available) - Number(first.available);
      });
      variant = candidates[0];
    }

    if (!variant || !variantSelect) return;
    const groupsByIndex = new Map(groups.map((group) => [Number(group.dataset.optionIndex), group]));
    variant.options.forEach((value, index) => {
      const group = groupsByIndex.get(index);
      if (group) setOptionGroupValue(group, value);
    });
    variantSelect.value = String(variant.id);
    variantSelect.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const updateGiftCardRecipient = (toggle) => {
    const root = toggle.closest('[data-gift-card-recipient]');
    const fields = root?.querySelector('[data-gift-card-recipient-fields]');
    if (!fields) return;

    fields.hidden = !toggle.checked;
    fields.querySelectorAll('input, textarea').forEach((input) => {
      input.disabled = !toggle.checked;
      if (input.name === 'properties[Recipient email]') input.required = toggle.checked;
    });

    const timezone = root.querySelector('[data-gift-card-timezone]');
    if (timezone) timezone.value = String(new Date().getTimezoneOffset());

    const sendOn = root.querySelector('[data-gift-card-send-on]');
    if (sendOn) {
      const localDate = (date) => {
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
        return adjustedDate.toISOString().slice(0, 10);
      };
      const today = new Date();
      const latestDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      sendOn.min = localDate(today);
      sendOn.max = localDate(latestDate);
    }
  };

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-variant-select]')) {
      const root = event.target.closest('[data-product-root]');
      if (root) updateVariant(root, event.target);
      return;
    }
    if (event.target.matches('[data-product-option]')) {
      const root = event.target.closest('[data-product-root]');
      if (root) resolveOptionChange(root, event.target);
      return;
    }
    if (event.target.matches('[data-selling-plan-select]')) {
      const root = event.target.closest('[data-product-root]');
      const variantSelect = root?.querySelector('[data-variant-select]');
      const variants = root ? getVariants(root) : [];
      const variant = variants.find((item) => String(item.id) === String(variantSelect?.value));
      if (root && variant) updateDisplayedPrice(root, variant);
      return;
    }
    if (event.target.matches('[data-gift-card-recipient-toggle]')) {
      updateGiftCardRecipient(event.target);
      return;
    }
    if (event.target.matches('[data-auto-submit]')) {
      const form = event.target.form;
      if (form) {
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.submit();
      }
    }
  });

  const initializeProducts = (scope = document) => {
    const roots = [];
    if (scope.matches?.('[data-product-root]')) roots.push(scope);
    roots.push(...scope.querySelectorAll('[data-product-root]'));
    roots.forEach((root) => {
      const select = root.querySelector('[data-variant-select]');
      if (select) updateVariant(root, select, false);
    });
  };

  const initializeGiftCardRecipients = (scope = document) => {
    const toggles = [];
    if (scope.matches?.('[data-gift-card-recipient-toggle]')) toggles.push(scope);
    toggles.push(...scope.querySelectorAll('[data-gift-card-recipient-toggle]'));
    toggles.forEach(updateGiftCardRecipient);
  };

  initializeProducts();
  initializeGiftCardRecipients();

  const loadRecommendations = async (element) => {
    const url = element.dataset.url;
    if (!url || element.dataset.loaded === 'true') return;
    element.dataset.loaded = 'true';

    try {
      const response = await fetch(url, { headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`Recommendations returned ${response.status}`);
      const markup = await response.text();
      const documentFromResponse = new DOMParser().parseFromString(markup, 'text/html');
      const replacement = documentFromResponse.getElementById(element.id);
      if (!replacement) throw new Error('Recommendations section was not returned');
      element.innerHTML = replacement.innerHTML;
      element.hidden = replacement.hidden;
    } catch (error) {
      element.dataset.loaded = 'false';
    }
  };

  const observeRecommendations = (scope = document) => {
    const elements = [...(scope.matches?.('[data-product-recommendations]:not([data-observed])') ? [scope] : []), ...scope.querySelectorAll('[data-product-recommendations]:not([data-observed])')];
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadRecommendations(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '200px 0px' });
      elements.forEach((element) => {
        element.dataset.observed = 'true';
        observer.observe(element);
      });
    } else {
      elements.forEach((element) => loadRecommendations(element));
    }
  };

  observeRecommendations();
  document.addEventListener('shopify:section:load', (event) => {
    initializeProducts(event.target);
    initializeGiftCardRecipients(event.target);
    observeRecommendations(event.target);
  });
})();
