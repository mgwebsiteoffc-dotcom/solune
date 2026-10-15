class SolunePredictiveSearch extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('[data-predictive-results]');
    this.status = this.querySelector('[data-predictive-status]');
    this.details = this.closest('details');
    this.activeIndex = -1;
    this.requestId = 0;

    if (!this.input || !this.results) return;

    this.input.addEventListener('input', () => {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.search(), 240);
    });
    this.input.addEventListener('keydown', (event) => this.onKeydown(event));
    this.details?.addEventListener('toggle', () => {
      if (this.details.open) window.requestAnimationFrame(() => this.input.focus());
      else this.close();
    });
    document.addEventListener('click', (event) => {
      if (this.details?.open && !this.details.contains(event.target)) this.details.open = false;
    });
  }

  async search() {
    const term = this.input.value.trim();
    if (term.length < 2) {
      this.close();
      return;
    }

    this.abortController?.abort();
    this.abortController = new AbortController();
    const requestId = ++this.requestId;
    const url = new URL(this.dataset.endpoint, window.location.origin);
    url.searchParams.set('q', term);
    url.searchParams.set('section_id', this.dataset.sectionId || 'predictive-search');
    url.searchParams.set('resources[type]', 'product,collection,page,article');
    url.searchParams.set('resources[limit]', '5');
    url.searchParams.set('resources[options][unavailable_products]', 'last');

    try {
      const response = await fetch(url.toString(), {
        signal: this.abortController.signal,
        headers: { Accept: 'text/html' }
      });
      if (!response.ok) throw new Error(`Predictive search returned ${response.status}`);
      const html = await response.text();
      if (requestId !== this.requestId) return;
      const documentFromResponse = new DOMParser().parseFromString(html, 'text/html');
      const section = documentFromResponse.querySelector('#shopify-section-predictive-search');
      if (!section) throw new Error('Predictive search section was not returned');
      this.results.innerHTML = section.innerHTML;
      const items = this.getItems();
      this.results.hidden = false;
      this.input.setAttribute('aria-expanded', 'true');
      this.input.removeAttribute('aria-activedescendant');
      this.activeIndex = -1;
      if (this.status) {
        this.status.textContent = items.length
          ? items.length === 1
            ? this.status.dataset.suggestionOne
            : this.status.dataset.suggestionsMany.replace('[count]', items.length)
          : this.status.dataset.noSuggestions;
      }
    } catch (error) {
      if (error.name !== 'AbortError' && requestId === this.requestId) this.close();
    }
  }

  getItems() {
    return [...this.results.querySelectorAll('[data-predictive-item]')];
  }

  onKeydown(event) {
    const items = this.getItems();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      if (this.details) {
        this.details.open = false;
        this.details.querySelector('summary')?.focus();
      }
      return;
    }
    if (!items.length) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (this.activeIndex === -1) this.activeIndex = direction === 1 ? 0 : items.length - 1;
      else this.activeIndex = (this.activeIndex + direction + items.length) % items.length;
      items.forEach((item, index) => item.setAttribute('aria-selected', String(index === this.activeIndex)));
      const active = items[this.activeIndex];
      this.input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && this.activeIndex >= 0) {
      const link = items[this.activeIndex].querySelector('a');
      if (link) {
        event.preventDefault();
        window.location.assign(link.href);
      }
    }
  }

  close() {
    this.abortController?.abort();
    this.requestId += 1;
    if (this.results) this.results.hidden = true;
    this.input?.setAttribute('aria-expanded', 'false');
    this.input?.removeAttribute('aria-activedescendant');
    this.activeIndex = -1;
    if (this.status) this.status.textContent = '';
  }
}

if (!customElements.get('predictive-search')) {
  customElements.define('predictive-search', SolunePredictiveSearch);
}
