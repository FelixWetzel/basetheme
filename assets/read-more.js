// "+ Mehr lesen" for snippets/read-more.liquid (media-text, text and
// headline banner sections). The toggle only shows while the text is
// actually clamped, re-checked whenever the text's width changes
// (resize, font load).
// Clicks are delegated from the document, so sections re-rendered in
// the theme editor keep working.
(() => {
  const partsOf = (wrap) => ({
    text: wrap?.querySelector('[data-read-more-text]'),
    toggle: wrap?.querySelector('[data-read-more-toggle]'),
  });

  const updateToggle = (wrap) => {
    const { text, toggle } = partsOf(wrap);
    if (!text || !toggle || text.classList.contains('is-expanded')) return;
    toggle.hidden = text.scrollHeight <= text.clientHeight + 1;
  };

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => updateToggle(entry.target.closest('[data-read-more]')));
  });

  const init = () => {
    document.querySelectorAll('[data-read-more]').forEach((wrap) => {
      const { text } = partsOf(wrap);
      if (text) observer.observe(text);
      updateToggle(wrap);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.fonts?.ready.then(init);
  document.addEventListener('shopify:section:load', init);

  // Same Web Animations API height transition as the product/FAQ
  // accordions (see sections/product.liquid) instead of an instant
  // line-clamp toggle. Both directions animate in the expanded (plain
  // block, no clamp) layout — growing/shrinking the clipped height
  // reveals/hides the text progressively; only at rest does collapsed
  // go back to the clamped layout.
  const animations = new WeakMap();

  const animate = (text, startHeight, endHeight, expand) => {
    text.style.overflow = 'hidden';
    animations.get(text)?.cancel();
    const animation = text.animate({ height: [startHeight, endHeight] }, { duration: 250, easing: 'ease' });
    animations.set(text, animation);
    animation.onfinish = () => {
      text.classList.toggle('is-expanded', expand);
      text.style.height = text.style.overflow = '';
      animations.delete(text);
    };
  };

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-read-more-toggle]');
    if (!toggle) return;
    const { text } = partsOf(toggle.closest('[data-read-more]'));
    if (!text) return;

    const expanded = text.classList.contains('is-expanded');
    const startHeight = `${text.offsetHeight}px`;

    if (expanded) {
      text.classList.remove('is-expanded');
      const endHeight = `${text.offsetHeight}px`;
      text.classList.add('is-expanded');
      animate(text, startHeight, endHeight, false);
    } else {
      text.classList.add('is-expanded');
      const endHeight = `${text.offsetHeight}px`;
      animate(text, startHeight, endHeight, true);
    }

    toggle.textContent = expanded ? toggle.dataset.labelMore : toggle.dataset.labelLess;
    toggle.classList.toggle('is-expanded', !expanded);
  });
})();
