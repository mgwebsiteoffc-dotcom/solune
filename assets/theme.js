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

  const updatePriceRange = (slider, changedInput) => {
    const minimumInput = slider.querySelector('[data-price-range-min]');
    const maximumInput = slider.querySelector('[data-price-range-max]');
    if (!minimumInput || !maximumInput) return;

    const rangeMaximum = Number(minimumInput.max);
    let minimum = Number(minimumInput.value);
    let maximum = Number(maximumInput.value);
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return;

    if (minimum > maximum) {
      if (changedInput === minimumInput) minimum = maximum;
      else maximum = minimum;
    }

    minimumInput.value = String(minimum);
    maximumInput.value = String(maximum);
    minimumInput.style.zIndex = changedInput === minimumInput ? '5' : '4';
    maximumInput.style.zIndex = changedInput === maximumInput ? '5' : '4';

    const start = rangeMaximum > 0 ? (minimum / rangeMaximum) * 100 : 0;
    const end = rangeMaximum > 0 ? (maximum / rangeMaximum) * 100 : 100;
    slider.style.setProperty('--range-start', `${Math.max(0, Math.min(100, start))}%`);
    slider.style.setProperty('--range-end', `${Math.max(0, Math.min(100, end))}%`);

    const moneyFormat = slider.dataset.moneyFormat;
    const minimumText = formatMoney(Math.round(minimum * 100), moneyFormat);
    const maximumText = formatMoney(Math.round(maximum * 100), moneyFormat);
    const minimumOutput = slider.parentElement.querySelector('[data-price-min-output]');
    const maximumOutput = slider.parentElement.querySelector('[data-price-max-output]');
    if (minimumOutput) minimumOutput.textContent = minimumText;
    if (maximumOutput) maximumOutput.textContent = maximumText;
    minimumInput.setAttribute('aria-valuetext', minimumText);
    maximumInput.setAttribute('aria-valuetext', maximumText);
  };

  const initializePriceRanges = (scope = document) => {
    const sliders = [];
    if (scope.matches?.('[data-price-range]')) sliders.push(scope);
    sliders.push(...scope.querySelectorAll('[data-price-range]'));
    sliders.forEach((slider) => {
      if (slider.dataset.priceRangeInitialized === 'true') return;
      slider.dataset.priceRangeInitialized = 'true';
      updatePriceRange(slider);
    });
  };

  const updateGalleryControls = (gallery) => {
    const container = gallery.closest('.product-gallery-container');
    if (!container || gallery.clientWidth === 0) return;
    const controls = [...container.querySelectorAll('[data-gallery-dot], [data-gallery-thumb]')];
    if (controls.length === 0) return;
    const activeIndex = Math.max(0, Math.round(gallery.scrollLeft / gallery.clientWidth));
    controls.forEach((control) => {
      const controlIndex = Number(control.dataset.galleryDot ?? control.dataset.galleryThumb);
      if (controlIndex === activeIndex) control.setAttribute('aria-current', 'true');
      else control.removeAttribute('aria-current');
    });
  };

  const initializeProductGalleries = (scope = document) => {
    const galleries = [];
    if (scope.matches?.('[data-product-gallery]')) galleries.push(scope);
    galleries.push(...scope.querySelectorAll('[data-product-gallery]'));
    galleries.forEach((gallery) => {
      if (gallery.dataset.galleryInitialized === 'true') return;
      gallery.dataset.galleryInitialized = 'true';
      const container = gallery.closest('.product-gallery-container');
      const desktopCarouselLayouts = ['thumbnails_left', 'thumbnails_bottom', 'dots_carousel'];
      const hasDesktopCarousel = desktopCarouselLayouts.includes(container?.dataset.desktopLayout);
      if (gallery.dataset.mobileLayout !== 'slider' && !hasDesktopCarousel) return;

      let animationFrame = 0;
      gallery.addEventListener('scroll', () => {
        if (animationFrame) return;
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          updateGalleryControls(gallery);
        });
      }, { passive: true });
      updateGalleryControls(gallery);
    });
  };

  const updateShoppableVideoControls = (track) => {
    const section = track.closest('.shoppable-video-section');
    if (!section) return;
    const pagination = section.querySelector('[data-shoppable-video-pagination]');
    if (track.clientWidth === 0) {
      if (pagination) pagination.hidden = true;
      return;
    }
    const maximumScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const previousButton = section.querySelector('[data-shoppable-video-step="-1"]');
    const nextButton = section.querySelector('[data-shoppable-video-step="1"]');
    if (previousButton) previousButton.disabled = track.scrollLeft <= 1;
    if (nextButton) nextButton.disabled = track.scrollLeft >= maximumScroll - 1;

    if (!pagination) return;
    const pageCount = maximumScroll > 1 ? Math.max(2, Math.ceil(track.scrollWidth / track.clientWidth)) : 1;
    pagination.hidden = pageCount < 2;
    if (pagination.dataset.pageCount !== String(pageCount)) {
      pagination.replaceChildren();
      const labelTemplate = pagination.dataset.pageLabelTemplate || 'Page __CURRENT__ of __TOTAL__';
      for (let index = 0; index < pageCount; index += 1) {
        const dot = document.createElement('button');
        dot.className = 'shoppable-video-pagination__dot';
        dot.type = 'button';
        dot.dataset.shoppableVideoPage = String(index);
        dot.setAttribute('aria-label', labelTemplate.replace('__CURRENT__', String(index + 1)).replace('__TOTAL__', String(pageCount)));
        pagination.append(dot);
      }
      pagination.dataset.pageCount = String(pageCount);
    }
    const activePage = maximumScroll > 1 ? Math.round((track.scrollLeft / maximumScroll) * (pageCount - 1)) : 0;
    pagination.querySelectorAll('[data-shoppable-video-page]').forEach((dot) => {
      if (Number(dot.dataset.shoppableVideoPage) === activePage) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const initializeShoppableVideoCarousels = (scope = document) => {
    const tracks = [];
    if (scope.matches?.('[data-shoppable-video-track]')) tracks.push(scope);
    tracks.push(...scope.querySelectorAll('[data-shoppable-video-track]'));
    tracks.forEach((track) => {
      if (track.dataset.carouselInitialized === 'true') return;
      track.dataset.carouselInitialized = 'true';
      let animationFrame = 0;
      track.addEventListener('scroll', () => {
        if (animationFrame) return;
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          updateShoppableVideoControls(track);
        });
      }, { passive: true });
      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => updateShoppableVideoControls(track));
        resizeObserver.observe(track);
      } else {
        window.addEventListener('resize', () => updateShoppableVideoControls(track));
      }
      track.querySelectorAll('video').forEach((video) => {
        const playButton = video.closest('.shoppable-video-card__media')?.querySelector('[data-shoppable-video-play]');
        if (!playButton) return;
        video.addEventListener('play', () => { playButton.hidden = true; });
        video.addEventListener('pause', () => { playButton.hidden = false; });
        video.addEventListener('ended', () => { playButton.hidden = false; });
        if (!video.paused) playButton.hidden = true;
      });
      updateShoppableVideoControls(track);
    });
  };

  const initializeProductInfoBlocks = (scope = document) => {
    const dialogs = [];
    if (scope.matches?.('[data-product-info-modal]')) dialogs.push(scope);
    dialogs.push(...scope.querySelectorAll('[data-product-info-modal]'));
    dialogs.forEach((dialog) => {
      if (dialog.dataset.productInfoModalInitialized === 'true') return;
      dialog.dataset.productInfoModalInitialized = 'true';
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog && typeof dialog.close === 'function') dialog.close();
      });
      dialog.addEventListener('close', () => {
        const opener = dialog._productInfoOpener;
        dialog._productInfoOpener = null;
        opener?.focus?.();
      });
    });

    const nativeShareButtons = [];
    if (scope.matches?.('[data-product-native-share]')) nativeShareButtons.push(scope);
    nativeShareButtons.push(...scope.querySelectorAll('[data-product-native-share]'));
    nativeShareButtons.forEach((button) => {
      button.hidden = typeof navigator.share !== 'function';
    });
  };

  const updateProductSku = (root, variant) => {
    root.querySelectorAll('[data-product-sku]').forEach((element) => {
      const sku = variant.sku || '';
      const value = element.querySelector('[data-product-sku-value]');
      if (value) value.textContent = sku;
      element.hidden = !sku;
      const block = element.closest('.product-block');
      if (block) block.hidden = !sku;
    });
  };

  const updateProductBadges = (root, variant) => {
    root.querySelectorAll('[data-product-badges]').forEach((container) => {
      const saleBadge = container.querySelector('[data-product-badge-sale]');
      const soldOutBadge = container.querySelector('[data-product-badge-sold-out]');
      if (saleBadge) {
        saleBadge.hidden = container.dataset.showSale !== 'true'
          || Number(variant.compare_at_price || 0) <= Number(variant.price || 0);
      }
      if (soldOutBadge) soldOutBadge.hidden = container.dataset.showSoldOut !== 'true' || Boolean(variant.available);
      container.hidden = ![...container.children].some((child) => !child.hidden);
      const block = container.closest('.product-block');
      if (block) block.hidden = container.hidden;
    });
  };

  const updateProductInventory = (root, variant) => {
    root.querySelectorAll('[data-product-inventory]').forEach((element) => {
      const isAvailable = Boolean(variant.available);
      const quantity = Number(variant.inventory_quantity || 0);
      const threshold = Number(element.dataset.lowStockThreshold || 0);
      const canShowQuantity = element.dataset.showQuantity === 'true'
        && Boolean(variant.inventory_management)
        && variant.inventory_policy !== 'continue'
        && quantity > 0
        && quantity <= threshold;
      let message = isAvailable ? element.dataset.inStockLabel : element.dataset.soldOutLabel;
      if (isAvailable && canShowQuantity) {
        message = (element.dataset.lowStockTemplate || '').replace('__COUNT__', String(quantity));
      }
      const messageElement = element.querySelector('[data-product-inventory-message]');
      if (messageElement) messageElement.textContent = message;
      element.classList.toggle('product-inventory--available', isAvailable && !canShowQuantity);
      element.classList.toggle('product-inventory--low-stock', isAvailable && canShowQuantity);
      element.classList.toggle('product-inventory--unavailable', !isAvailable);
    });
  };

  const stopStoryPlayback = (dialog) => {
    const video = dialog.querySelector('video');
    if (video) {
      video.pause();
      try { video.currentTime = 0; } catch (error) { /* Metadata may not be ready yet. */ }
    }
  };

  const closeStoryDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
      return;
    }
    dialog.removeAttribute('open');
    stopStoryPlayback(dialog);
    const opener = dialog._storyOpener;
    dialog._storyOpener = null;
    opener?.focus?.();
  };

  const initializeStoryDialogs = (scope = document) => {
    const dialogs = [];
    if (scope.matches?.('[data-story-dialog]')) dialogs.push(scope);
    dialogs.push(...scope.querySelectorAll('[data-story-dialog]'));
    dialogs.forEach((dialog) => {
      if (dialog.dataset.storyDialogInitialized === 'true') return;
      dialog.dataset.storyDialogInitialized = 'true';
      dialog.addEventListener('close', () => {
        stopStoryPlayback(dialog);
        const opener = dialog._storyOpener;
        dialog._storyOpener = null;
        opener?.focus?.();
      });
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeStoryDialog(dialog);
      });
    });
  };

  const getVariants = (root) => {
    const json = root.querySelector('[data-product-variants]');
    if (!json) return [];
    try {
      const variants = JSON.parse(json.textContent);
      const rulesJson = root.querySelector('[data-product-quantity-rules]');
      if (!rulesJson) return variants;
      const rules = JSON.parse(rulesJson.textContent);
      const rulesById = new Map(rules.map((rule) => [String(rule.id), rule]));
      return variants.map((variant) => ({
        ...variant,
        quantity_rule: rulesById.get(String(variant.id)) || variant.quantity_rule || {}
      }));
    } catch (error) {
      return [];
    }
  };

  const updateQuantityStepperButtons = (input) => {
    const stepper = input.closest('.quantity-stepper');
    if (!stepper) return;
    const minimum = Number(input.min || 1);
    const maximum = input.max === '' ? Number.POSITIVE_INFINITY : Number(input.max);
    const value = Number(input.value || minimum);
    stepper.querySelectorAll('[data-quantity-step]').forEach((button) => {
      const direction = Number(button.dataset.quantityStep);
      button.disabled = direction < 0 ? value <= minimum : value >= maximum;
    });
  };

  const updateProductQuantityRules = (root, variant) => {
    const rule = variant.quantity_rule || {};
    const minimum = Math.max(1, Number(rule.min) || 1);
    const increment = Math.max(1, Number(rule.increment) || 1);
    const maximum = Number(rule.max);
    const hasMaximum = Number.isFinite(maximum) && maximum > 0;
    const lastValidQuantity = hasMaximum
      ? minimum + Math.floor(Math.max(0, maximum - minimum) / increment) * increment
      : Number.POSITIVE_INFINITY;

    root.querySelectorAll('[data-product-quantity]').forEach((input) => {
      input.min = String(minimum);
      input.step = String(increment);
      if (Number.isFinite(lastValidQuantity)) input.max = String(lastValidQuantity);
      else input.removeAttribute('max');

      const current = Number(input.value);
      let next = Number.isFinite(current) && current >= minimum
        ? minimum + Math.floor((current - minimum) / increment) * increment
        : minimum;
      if (Number.isFinite(lastValidQuantity)) next = Math.min(next, lastValidQuantity);
      input.value = String(next);
      updateQuantityStepperButtons(input);
    });
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
    const selectedValues = variant.options || getSelectedOptionValues(root);

    groups.forEach((group, index) => {
      const selectedValue = selectedValues[index];
      const hideSoldOut = group.dataset.hideSoldOut === 'true';
      if (selectedValue !== undefined) setOptionGroupValue(group, selectedValue);

      const currentValue = group.querySelector('[data-option-current-value]');
      if (currentValue && selectedValue !== undefined) currentValue.textContent = selectedValue;

      const getMatchingVariants = (value) => variants.filter((item) => (
        String(item.options?.[index]) === String(value)
        && item.options?.every((candidateValue, candidateIndex) => (
          candidateIndex === index || String(candidateValue) === String(selectedValues[candidateIndex])
        ))
      ));

      const select = group.querySelector('select[data-product-option]');
      if (select) {
        [...select.options].forEach((option) => {
          const optionVariants = getMatchingVariants(option.value);
          const hasAvailableVariant = optionVariants.some((item) => item.available);
          const isSelected = String(option.value) === String(selectedValue);
          option.hidden = hideSoldOut && !hasAvailableVariant && !isSelected;
          option.disabled = optionVariants.length === 0 || (hideSoldOut && !hasAvailableVariant && !isSelected);
          option.dataset.optionAvailable = String(hasAvailableVariant);
          const baseLabel = option.dataset.optionBaseLabel || option.value;
          option.textContent = hasAvailableVariant ? baseLabel : `${baseLabel} — ${soldOutLabel}`;
        });
      }

      group.querySelectorAll('input[data-product-option]').forEach((input) => {
        const optionVariants = getMatchingVariants(input.value);
        const hasAvailableVariant = optionVariants.some((item) => item.available);
        const isSelected = String(input.value) === String(selectedValue);
        const isHidden = hideSoldOut && !hasAvailableVariant && !isSelected;
        input.hidden = isHidden;
        input.disabled = optionVariants.length === 0 || isHidden;
        input.dataset.optionAvailable = String(hasAvailableVariant);
        if (input.nextElementSibling) {
          input.nextElementSibling.hidden = isHidden;
          input.nextElementSibling.classList.toggle('is-sold-out', !hasAvailableVariant);
        }
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
    updateProductQuantityRules(root, variant);
    const status = root.querySelector('[data-variant-status]');
    const addButton = root.querySelector('[data-add-to-cart]');
    const planUnavailable = updateSellingPlans(root, variant);
    const moneyFormat = root.dataset.moneyFormat;

    root.dataset.currentVariantId = String(variant.id);
    updateDisplayedPrice(root, variant);
    updateProductSku(root, variant);
    updateProductBadges(root, variant);
    updateProductInventory(root, variant);

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
    const stickyButton = root.querySelector('[data-sticky-add-to-cart]');
    const stickyPrice = root.querySelector('[data-sticky-product-price]');
    if (stickyButton) {
      stickyButton.disabled = !variant.available || planUnavailable;
      stickyButton.textContent = planUnavailable
        ? stickyButton.dataset.planUnavailableLabel
        : variant.available
          ? stickyButton.dataset.addLabel
          : stickyButton.dataset.soldOutLabel;
    }
    const displayedPrice = root.querySelector('[data-product-price]');
    if (stickyPrice && displayedPrice) stickyPrice.textContent = displayedPrice.textContent;
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
      const latestDate = new Date(today);
      latestDate.setDate(latestDate.getDate() + 90);
      sendOn.min = localDate(today);
      sendOn.max = localDate(latestDate);
    }
  };

  document.addEventListener('input', (event) => {
    if (!event.target.matches('[data-price-range-min], [data-price-range-max]')) return;
    const slider = event.target.closest('[data-price-range]');
    if (slider) updatePriceRange(slider, event.target);
  });

  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-product-quantity]')) updateQuantityStepperButtons(event.target);
  });

  document.addEventListener('click', (event) => {
    const productModalTrigger = event.target.closest?.('[data-product-modal-trigger]');
    if (productModalTrigger) {
      const dialog = document.getElementById(productModalTrigger.getAttribute('aria-controls'));
      if (!dialog) return;
      dialog._productInfoOpener = productModalTrigger;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      dialog.querySelector('[data-product-modal-close]')?.focus();
      return;
    }

    const productModalCloseButton = event.target.closest?.('[data-product-modal-close]');
    if (productModalCloseButton) {
      const dialog = productModalCloseButton.closest('[data-product-info-modal]');
      if (dialog && typeof dialog.close === 'function') dialog.close();
      else if (dialog) {
        dialog.removeAttribute('open');
        const opener = dialog._productInfoOpener;
        dialog._productInfoOpener = null;
        opener?.focus?.();
      }
      return;
    }

    const nativeShareButton = event.target.closest?.('[data-product-native-share]');
    if (nativeShareButton && typeof navigator.share === 'function') {
      navigator.share({ title: nativeShareButton.dataset.shareTitle, url: nativeShareButton.dataset.shareUrl })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            const status = nativeShareButton.closest('[data-product-share]')?.querySelector('[data-product-share-status]');
            if (status) status.textContent = nativeShareButton.dataset.shareError || '';
          }
        });
      return;
    }

    const copyLinkButton = event.target.closest?.('[data-product-copy-link]');
    if (copyLinkButton) {
      const shareContainer = copyLinkButton.closest('[data-product-share]');
      const status = shareContainer?.querySelector('[data-product-share-status]');
      const url = copyLinkButton.dataset.shareUrl || window.location.href;
      const copiedMessage = copyLinkButton.dataset.copySuccess || '';
      const failedMessage = copyLinkButton.dataset.copyFailed || '';
      const announce = (copied) => { if (status) status.textContent = copied ? copiedMessage : failedMessage; };
      const fallbackCopy = () => {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
        field.remove();
        announce(copied);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => announce(true), fallbackCopy);
      else fallbackCopy();
      return;
    }

    const zoomButton = event.target.closest?.('[data-image-zoom]');
    if (zoomButton) {
      const media = zoomButton.closest('.product-gallery__media');
      if (!media) return;
      const isZoomed = media.dataset.imageZoomed === 'true';
      media.dataset.imageZoomed = String(!isZoomed);
      zoomButton.setAttribute('aria-pressed', String(!isZoomed));
      zoomButton.setAttribute('aria-label', isZoomed ? zoomButton.dataset.zoomLabel : zoomButton.dataset.resetLabel);
      return;
    }

    const quantityStepButton = event.target.closest?.('[data-quantity-step]');
    if (quantityStepButton) {
      const input = document.getElementById(quantityStepButton.dataset.quantityInput);
      if (!input) return;
      const minimum = Number(input.min || 1);
      const maximum = input.max === '' ? Number.POSITIVE_INFINITY : Number(input.max);
      const increment = Number(input.step || 1);
      const current = Number(input.value || minimum);
      const next = current + (Number(quantityStepButton.dataset.quantityStep) * increment);
      input.value = String(Number.isFinite(maximum) ? Math.min(maximum, Math.max(minimum, next)) : Math.max(minimum, next));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const storyCloseButton = event.target.closest?.('[data-story-close]');
    if (storyCloseButton) {
      closeStoryDialog(storyCloseButton.closest('[data-story-dialog]'));
      return;
    }

    const storyTrigger = event.target.closest?.('[data-story-open]');
    if (storyTrigger) {
      const dialog = document.getElementById(storyTrigger.getAttribute('aria-controls'));
      if (!dialog) return;
      dialog._storyOpener = storyTrigger;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      const video = dialog.querySelector('video');
      if (video) {
        try { video.currentTime = 0; } catch (error) { /* The browser can seek after metadata loads. */ }
        const playback = video.play();
        playback?.catch?.(() => {});
      }
      dialog.querySelector('[data-story-close]')?.focus();
      return;
    }

    const videoPlayButton = event.target.closest?.('[data-shoppable-video-play]');
    if (videoPlayButton) {
      const video = videoPlayButton.closest('.shoppable-video-card__media')?.querySelector('video');
      if (!video) return;
      const playback = video.play();
      playback?.catch?.(() => {});
      return;
    }

    const pageIndicator = event.target.closest?.('[data-shoppable-video-page]');
    if (pageIndicator) {
      const section = pageIndicator.closest('.shoppable-video-section');
      const track = section?.querySelector('[data-shoppable-video-track]');
      const pagination = pageIndicator.closest('[data-shoppable-video-pagination]');
      const pageCount = Number(pagination?.dataset.pageCount || 1);
      if (!track || pageCount < 2) return;
      const pageIndex = Number(pageIndicator.dataset.shoppableVideoPage);
      const maximumScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      track.scrollTo({
        left: maximumScroll * (pageIndex / (pageCount - 1)),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      return;
    }

    const carouselControl = event.target.closest?.('[data-shoppable-video-step]');
    if (carouselControl) {
      const track = carouselControl.closest('.shoppable-video-section')?.querySelector('[data-shoppable-video-track]');
      const firstCard = track?.querySelector('.shoppable-video-card');
      if (!track || !firstCard) return;
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const distance = firstCard.getBoundingClientRect().width + gap;
      const direction = Number(carouselControl.dataset.shoppableVideoStep);
      track.scrollBy({
        left: distance * direction,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      return;
    }

    const galleryControl = event.target.closest?.('[data-gallery-dot], [data-gallery-thumb]');
    if (!galleryControl) return;
    const gallery = galleryControl.closest('.product-gallery-container')?.querySelector('[data-product-gallery]');
    const targetIndex = galleryControl.dataset.galleryDot ?? galleryControl.dataset.galleryThumb;
    const media = gallery?.querySelector(`[data-gallery-index="${targetIndex}"]`);
    if (media) {
      event.preventDefault();
      media.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  });

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
      if (select) {
        updateVariant(root, select, false);
        return;
      }
      const selectedVariant = getVariants(root).find((variant) => String(variant.id) === String(root.dataset.currentVariantId));
      if (!selectedVariant) return;
      updateProductSku(root, selectedVariant);
      updateProductBadges(root, selectedVariant);
      updateProductInventory(root, selectedVariant);
    });
  };

  const initializeGiftCardRecipients = (scope = document) => {
    const toggles = [];
    if (scope.matches?.('[data-gift-card-recipient-toggle]')) toggles.push(scope);
    toggles.push(...scope.querySelectorAll('[data-gift-card-recipient-toggle]'));
    toggles.forEach(updateGiftCardRecipient);
  };

  const initializePincodeCheckers = (scope = document) => {
    const checkers = [];
    if (scope.matches?.('[data-pincode-checker]')) checkers.push(scope);
    checkers.push(...scope.querySelectorAll('[data-pincode-checker]'));
    checkers.forEach((checker) => {
      if (checker.dataset.pincodeInitialized === 'true') return;
      const form = checker.querySelector('[data-pincode-form]');
      const input = checker.querySelector('[data-pincode-input]');
      const status = checker.querySelector('[data-pincode-status]');
      if (!form || !input || !status) return;
      checker.dataset.pincodeInitialized = 'true';

      const showStatus = (message, state) => {
        status.textContent = message;
        status.dataset.state = state;
        status.hidden = false;
      };

      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        status.hidden = true;
        status.textContent = '';
        delete status.dataset.state;
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const pincode = input.value.trim();
        input.value = pincode;
        input.removeAttribute('aria-invalid');

        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
          input.setAttribute('aria-invalid', 'true');
          showStatus(checker.dataset.invalidMessage || 'Enter a valid six-digit Indian PIN code.', 'error');
          return;
        }

        const serviceablePincodes = (checker.dataset.serviceablePincodes || '')
          .split(/[\s,;]+/)
          .map((value) => value.trim())
          .filter((value) => /^[1-9][0-9]{5}$/.test(value));
        if (serviceablePincodes.length === 0) {
          showStatus(checker.dataset.unconfiguredMessage || 'Delivery coverage has not been configured.', 'error');
          return;
        }

        if (serviceablePincodes.includes(pincode)) {
          showStatus(checker.dataset.availableMessage || 'This PIN code is listed for delivery.', 'success');
        } else {
          showStatus(checker.dataset.unavailableMessage || 'This PIN code is not in the configured coverage list.', 'error');
        }
      });
    });
  };

  const initializeStickyProductBars = (scope = document) => {
    const bars = [];
    if (scope.matches?.('[data-product-sticky-bar]')) bars.push(scope);
    bars.push(...scope.querySelectorAll('[data-product-sticky-bar]'));
    bars.forEach((bar) => {
      if (bar.dataset.stickyInitialized === 'true') return;
      const root = bar.closest('[data-product-root]');
      const primaryButton = root?.querySelector('[data-add-to-cart]');
      if (!root || !primaryButton) return;
      bar.dataset.stickyInitialized = 'true';
      let scheduled = false;
      const updateVisibility = () => {
        scheduled = false;
        const bounds = primaryButton.getBoundingClientRect();
        const buttonIsVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
        bar.hidden = buttonIsVisible || window.scrollY < 240;
      };
      const scheduleVisibilityUpdate = () => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(updateVisibility);
      };
      window.addEventListener('scroll', scheduleVisibilityUpdate, { passive: true });
      window.addEventListener('resize', scheduleVisibilityUpdate);
      updateVisibility();
    });
  };

  initializePriceRanges();
  initializeProductGalleries();
  initializeShoppableVideoCarousels();
  initializeStoryDialogs();
  initializeProducts();
  initializeGiftCardRecipients();
  initializePincodeCheckers();
  initializeStickyProductBars();

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
  initializeProductInfoBlocks();
  document.addEventListener('shopify:section:load', (event) => {
    initializePriceRanges(event.target);
    initializeProductGalleries(event.target);
    initializeShoppableVideoCarousels(event.target);
    initializeStoryDialogs(event.target);
    initializeProductInfoBlocks(event.target);
    initializeProducts(event.target);
    initializeGiftCardRecipients(event.target);
    initializePincodeCheckers(event.target);
    initializeStickyProductBars(event.target);
    observeRecommendations(event.target);
  });
})();
