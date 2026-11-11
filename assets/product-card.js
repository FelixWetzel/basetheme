// Image slideshow dots of snippets/product-card.liquid.
//
// A plain asset loaded on every page (layout/theme.liquid) rather than
// the snippet's own {% javascript %}: Shopify appears to bundle a snippet's
// script only on pages that render it, and the product page's
// recommendations are fetched after load — so there the dots never
// followed a swipe. Delegated from the document for the same reason
// (cards can arrive later); `scroll` doesn't bubble, hence capture.
(() => {
  const slideshowParts = (element) => {
    const media = element.closest('.product-card__media');
    return {
      track: media?.querySelector('[data-product-card-slideshow]'),
      dots: media ? Array.from(media.querySelectorAll('.product-card__dot')) : [],
    };
  };

  document.addEventListener('click', (event) => {
    const dot = event.target.closest('.product-card__dot');
    if (!dot) return;
    event.preventDefault();
    const { track, dots } = slideshowParts(dot);
    if (!track) return;
    track.scrollTo({ left: dots.indexOf(dot) * track.clientWidth, behavior: 'smooth' });
  });

  // Notice after a quick add: photo, "<TITLE> hinzugefügt" and the
  // "▸ Warenkorb ansehen" CTA below it (opens the cart drawer). Slides up
  // from the bottom and away again after 5s — paused while hovered.
  let toast = null;
  let toastTimer = null;
  const hideToast = () => {
    clearTimeout(toastTimer);
    toast?.classList.remove('is-visible');
  };
  const startToastTimer = () => {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  };
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  const showToast = (button) => {
    const data = button.dataset;
    if (!toast) {
      toast = element('div', 'quick-add-toast');
      toast.setAttribute('role', 'status');
      toast.addEventListener('pointerenter', () => clearTimeout(toastTimer));
      toast.addEventListener('pointerleave', startToastTimer);
      document.body.append(toast);
    }

    const parts = [];
    if (data.addedImage) {
      const image = element('img', 'quick-add-toast__image');
      image.src = data.addedImage;
      image.alt = '';
      parts.push(image);
    }
    toast.classList.toggle('quick-add-toast--no-image', !data.addedImage);

    const message = element('p', 'quick-add-toast__message');
    message.append(element('span', 'quick-add-toast__title', data.addedTitle), ` ${data.addedMessage}`);

    const view = element('button', 'quick-add-toast__view cta', data.viewCartLabel);
    view.type = 'button';
    view.addEventListener('click', () => {
      hideToast();
      window.ThemeCart?.show();
    });

    const body = element('div', 'quick-add-toast__body');
    body.append(message, view);
    parts.push(body);
    toast.replaceChildren(...parts);

    void toast.offsetHeight; // so a first appearance slides in too
    toast.classList.add('is-visible');
    startToastTimer();
  };

  // Quick add "+": adds the card's variant and opens the cart drawer
  // (which refreshes itself first, so the new item is in it) — or,
  // with data-quick-add-feedback, shows a notice at the bottom instead
  // and just refreshes the cart count. Falls back to the product page if the
  // add fails.
  // After adding: "✓ Hinzugefügt" on the button for 2s (label shown
  // on touch screens too), then back to "+".
  const showAdded = (button) => {
    const label = button.querySelector('.product-card__quick-add-label > span');
    if (!label) return;
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = label.textContent;
    label.textContent = button.dataset.addedLabel;
    button.classList.add('is-added');
    clearTimeout(button.addedTimer);
    button.addedTimer = setTimeout(() => {
      button.classList.remove('is-added');
      label.textContent = button.dataset.defaultLabel;
    }, 2000);
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-quick-add]');
    if (!button) return;
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;

    fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(button.dataset.variantId), quantity: 1 }] }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('quick add failed');
        showAdded(button);
        if (!window.ThemeCart) {
          window.location.href = `${window.Shopify?.routes?.root || '/'}cart`;
          return;
        }
        if (!button.hasAttribute('data-quick-add-feedback')) return window.ThemeCart.open();

        // Stay on the page: a notice slides up from the bottom, and
        // the cart count (and drawer content) updates in the background.
        // Shown once the cart count has been refreshed, so it's right
        return window.ThemeCart.refresh().then(() => showToast(button));
      })
      .catch(() => {
        window.location.href = button.dataset.fallbackUrl;
      })
      .finally(() => {
        button.disabled = false;
      });
  });

  // Keeps the active dot in sync whether the visitor swiped (touch)
  // or clicked a dot.
  document.addEventListener(
    'scroll',
    (event) => {
      const track = event.target;
      if (!(track instanceof Element) || !track.matches('[data-product-card-slideshow]')) return;
      const { dots } = slideshowParts(track);
      const index = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    },
    { capture: true, passive: true }
  );
})();
