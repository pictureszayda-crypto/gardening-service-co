(() => {
  const headerTarget = document.querySelector('[data-site-header]');
  const footerTarget = document.querySelector('[data-site-footer]');
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  const navItems = [
    ['Home', '/'],
    ['About', '/about/'],
    ['Services', '/services/'],
    ['Our Work', '/our-work/'],
    ['Residential', '/residential/'],
    ['Commercial', '/commercial/']
  ];

  if (headerTarget) {
    headerTarget.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="/" aria-label="Gardening Service Co. home">
            <span class="brand-mark" aria-hidden="true">✿</span>
            <span class="brand-name"><strong>Gardening Service Co.</strong><small>By Juan · Greater Los Angeles</small></span>
          </a>
          <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primary-nav"><span aria-hidden="true">☰</span></button>
          <nav class="primary-nav" id="primary-nav" aria-label="Main navigation">
            ${navItems.map(([label, href]) => {
              const active = path === href.replace(/\/$/, '') || (href !== '/' && path.startsWith(href.replace(/\/$/, '') + '/'));
              return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
            }).join('')}
            <a class="button button--dark header-cta" href="/contact/">Get a quote <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>`;
  }

  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-main">
            <div class="footer-brand">
              <a class="brand" href="/" aria-label="Gardening Service Co. home">
                <span class="brand-mark" aria-hidden="true">✿</span>
                <span class="brand-name"><strong>Gardening Service Co.</strong><small>By Juan</small></span>
              </a>
              <p>Family-owned gardening and landscaping services for homes and businesses throughout Greater Los Angeles.</p>
            </div>
            <div class="footer-column"><h2>Explore</h2><a href="/about/">About us</a><a href="/services/">Services</a><a href="/our-work/">Our work</a><a href="/residential/">Residential</a><a href="/commercial/">Commercial</a></div>
            <div class="footer-column"><h2>Get in touch</h2><a href="tel:+18189157442">818-915-7442</a><a href="mailto:blancatreeservices@gmail.com">blancatreeservices@gmail.com</a><a href="/contact/">Request a quote</a><a href="/payments/">Payment options</a></div>
            <div class="footer-column"><h2>Service area</h2><p>Greater Los Angeles</p><p>Service availability depends on project location and scope.</p></div>
          </div>
          <div class="footer-bottom"><p>© <span data-year></span> Gardening Service Co. All rights reserved.</p><p><a href="/contact/">Contact</a> · <a href="/payments/">Payments</a></p></div>
        </div>
      </footer>`;
    const year = footerTarget.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      toggle.querySelector('span').textContent = isOpen ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.querySelector('span').textContent = '☰';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.querySelector('span').textContent = '☰';
      }
    });
  }

  // Gallery filters
  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const items = [...gallery.querySelectorAll('[data-category]')];
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach(other => {
          const active = other === button;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        items.forEach(item => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
      });
    });
  }

  // Pre-fill the service select when a visitor follows a service-specific CTA.
  const serviceSelect = document.querySelector('#service-select');
  if (serviceSelect) {
    const requested = new URLSearchParams(window.location.search).get('service');
    if (requested) {
      const normalized = requested.toLowerCase();
      const match = [...serviceSelect.options].find(option => option.value.toLowerCase() === normalized || option.text.toLowerCase() === normalized);
      if (match) serviceSelect.value = match.value;
    }
  }

  // Quote form posts to a Cloudflare Pages Function. Without the function configured,
  // show a useful message rather than silently pretending the request was sent.
  const form = document.querySelector('#quote-form');
  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const status = document.querySelector('#form-status');
      const submit = form.querySelector('button[type="submit"]');
      status.textContent = '';
      status.removeAttribute('data-state');
      if (!form.reportValidity()) return;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'The form could not be sent right now.');
        status.dataset.state = 'success';
        status.textContent = 'Your request has been sent. Thank you. We will follow up using the contact information you provided.';
        form.reset();
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = error.message || 'Unable to send your request. Please call 818-915-7442 or email blancatreeservices@gmail.com.';
      } finally {
        submit.disabled = false;
        submit.innerHTML = 'Send quote request <span aria-hidden="true">↗</span>';
      }
    });
  }
})();
