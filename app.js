/**
 * Find Aura — app.js
 * Production-ready Vanilla JS (ES6+) for findaura.org
 * Zero dependencies, mobile-first, Instagram-browser optimised
 */

/* ============================================================
   STATE
   ============================================================ */
const state = {
  products: [],         // Raw product list (sorted newest-first)
  filtered: [],         // Currently displayed products
  searchQuery: '',
  activeCategory: 'all',
  urlPinnedId: null,    // Product ID from ?id= or ?p= param
  isAdminMode: false,
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const CATEGORIES = [
  { id: 'all',       label: 'All' },
  { id: 'viral',     label: '🔥 Viral' },
  { id: 'desk',      label: 'Desk & Tech' },
  { id: 'room',      label: 'Room Aura' },
  { id: 'gadgets',   label: 'Gadgets' },
  { id: 'car',       label: 'Car & EDC' },
];

/** Map pill IDs to `category` strings stored in JSON */
const CATEGORY_MAP = {
  all:     null,
  viral:   null,         // special: matches tags containing "viral"
  desk:    'Desk & Tech',
  room:    'Room Aura',
  gadgets: 'Gadgets',
  car:     'Car & EDC',
};

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  parseUrlParams();
  buildStaticShell();
  renderSkeletons(6);
  await loadProducts();
  if (state.isAdminMode) showAdminMode();
});

/* ============================================================
   URL PARAM PARSING
   ============================================================ */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id') || params.get('p');
  if (rawId) {
    state.urlPinnedId = normalizeId(rawId);
    state.searchQuery  = state.urlPinnedId;
  }
  state.isAdminMode = params.get('admin') === 'true';
}

/** Normalise any id/search input: strip #, strip leading zeros for comparison,
    but preserve zero-padded form for display matching */
function normalizeId(raw) {
  if (!raw) return '';
  return String(raw).replace(/^#/, '').replace(/^0+/, '') || '0';
}

/** Given a product id string like "08", return the numeric string "8" */
function numericId(id) {
  return String(parseInt(id, 10));
}

/* ============================================================
   STATIC SHELL
   ============================================================ */
function buildStaticShell() {
  document.getElementById('app').innerHTML = `
    <!-- HEADER -->
    <header class="site-header" role="banner">
      <div>
        <span class="brand-logo gradient-text">Find Aura</span>
        <span class="verified-badge" aria-label="Verified affiliate partner">
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Official
        </span>
      </div>
      <p class="tagline">Viral Tech &amp; Everyday Finds — Enter the # from the video below</p>
      <nav class="social-links" aria-label="Social media">
        <a href="https://instagram.com/findaura.official" target="_blank" rel="noopener noreferrer"
           class="social-link" aria-label="Instagram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>
        <a href="https://tiktok.com/@findaura" target="_blank" rel="noopener noreferrer"
           class="social-link" aria-label="TikTok">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.68a8.18 8.18 0 004.78 1.52V6.72a4.84 4.84 0 01-1.01-.03z"/>
          </svg>
        </a>
      </nav>
    </header>

    <!-- STICKY CONTROLS -->
    <div class="controls-sticky" role="search">
      <div class="search-wrapper">
        <span class="search-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="search"
          id="searchInput"
          inputmode="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="Search product # (e.g. 24) or name…"
          aria-label="Search products by number or name"
        />
        <button class="clear-btn" id="clearBtn" aria-label="Clear search">✕</button>
      </div>
      <div class="pills-scroll" id="pillsContainer" role="tablist" aria-label="Category filters"></div>
    </div>

    <!-- FEATURED BANNER (hidden by default) -->
    <div id="featuredBanner" class="featured-banner" style="display:none" role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span>Featured from your link — tap the card below to get it!</span>
    </div>

    <!-- RESULTS BAR -->
    <div class="results-bar" role="status" aria-live="polite">
      <span id="resultsCount"></span>
    </div>

    <!-- PRODUCT GRID -->
    <main id="productGrid" class="product-grid" aria-label="Product listings"></main>

    <!-- FOOTER -->
    <footer class="site-footer" role="contentinfo">
      <p class="footer-disclosure">
        Find Aura participates in the AliExpress Affiliate Program and other affiliate programs.
        We may earn a commission on qualifying purchases made through links on this site
        at no extra cost to you.
      </p>
      <nav class="footer-links" aria-label="Legal">
        <button class="footer-link" onclick="showLegalModal('privacy')" type="button">Privacy Policy</button>
        <button class="footer-link" onclick="showLegalModal('terms')" type="button">Terms &amp; Disclosure</button>
        <a href="mailto:hello@findaura.org" class="footer-link">Contact</a>
      </nav>
      <p class="footer-brand">© 2026 Find Aura · findaura.org</p>
    </footer>

    <!-- LEGAL MODAL CONTAINER -->
    <div id="legalModalContainer"></div>

    <!-- ADMIN MODAL CONTAINER -->
    <div id="adminContainer"></div>
  `;

  buildCategoryPills();
  attachSearchListeners();
}

/* ============================================================
   CATEGORY PILLS
   ============================================================ */
function buildCategoryPills() {
  const container = document.getElementById('pillsContainer');
  container.innerHTML = CATEGORIES.map(cat => `
    <button
      class="pill ${cat.id === 'all' ? 'active' : ''}"
      data-cat="${cat.id}"
      role="tab"
      aria-selected="${cat.id === 'all'}"
      type="button"
    >${cat.label}</button>
  `).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    setActiveCategory(btn.dataset.cat);
  });
}

function setActiveCategory(catId) {
  state.activeCategory = catId;
  document.querySelectorAll('.pill').forEach(p => {
    const isActive = p.dataset.cat === catId;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-selected', isActive);
  });
  renderProducts();
}

/* ============================================================
   SEARCH LISTENERS
   ============================================================ */
function attachSearchListeners() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');

  // Pre-fill from URL param
  if (state.searchQuery) {
    input.value = `#${state.searchQuery}`;
    clearBtn.classList.add('visible');
  }

  input.addEventListener('input', () => {
    state.searchQuery = input.value.trim();
    clearBtn.classList.toggle('visible', state.searchQuery.length > 0);
    renderProducts();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    state.searchQuery = '';
    state.urlPinnedId = null;
    clearBtn.classList.remove('visible');
    document.getElementById('featuredBanner').style.display = 'none';
    renderProducts();
    input.focus();
  });
}

/* ============================================================
   LOAD PRODUCTS
   ============================================================ */
async function loadProducts() {
  try {
    const res = await fetch('/data/products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Sort: highest numeric ID first (newest first)
    state.products = data.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
    state.filtered = [...state.products];

    renderProducts();
  } catch (err) {
    console.error('[FindAura] Failed to load products:', err);
    showErrorState();
  }
}

/* ============================================================
   FILTER LOGIC
   ============================================================ */
function filterProducts() {
  const rawQuery = state.searchQuery;
  const catId    = state.activeCategory;

  let results = [...state.products];

  // Category filter
  if (catId !== 'all') {
    if (catId === 'viral') {
      results = results.filter(p => Array.isArray(p.tags) && p.tags.includes('viral'));
    } else {
      const catLabel = CATEGORY_MAP[catId];
      results = results.filter(p => p.category === catLabel);
    }
  }

  // Search filter
  if (rawQuery) {
    const q = rawQuery.replace(/^#/, '').trim().toLowerCase();
    const qNum = parseInt(q, 10); // NaN if not numeric
    const isNumericQuery = !isNaN(qNum) && q !== '';

    if (isNumericQuery) {
      // Number search: match if numeric id equals qNum OR title includes query
      results = results.filter(p => {
        const pNum = parseInt(p.id, 10);
        return pNum === qNum || p.title.toLowerCase().includes(q);
      });
      // Exact match first
      results.sort((a, b) => {
        const aExact = parseInt(a.id, 10) === qNum ? -1 : 0;
        const bExact = parseInt(b.id, 10) === qNum ? -1 : 0;
        return aExact - bExact;
      });
    } else {
      // Keyword search
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }
  }

  return results;
}

/* ============================================================
   RENDER PRODUCTS
   ============================================================ */
function renderProducts() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('resultsCount');
  const banner = document.getElementById('featuredBanner');

  const results = filterProducts();
  state.filtered = results;

  // Results count
  countEl.textContent = results.length > 0
    ? `${results.length} product${results.length !== 1 ? 's' : ''}`
    : '';

  // Featured banner
  if (state.urlPinnedId && results.length > 0) {
    const first = results[0];
    if (numericId(first.id) === state.urlPinnedId) {
      banner.style.display = 'flex';
    }
  } else if (!state.searchQuery) {
    banner.style.display = 'none';
  }

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different number or browse all categories.</p>
      </div>`;
    return;
  }

  // Determine exact match id for highlight
  const rawQ = state.searchQuery.replace(/^#/, '').trim();
  const qNum = parseInt(rawQ, 10);
  const hasNumericQuery = !isNaN(qNum) && rawQ !== '';

  grid.innerHTML = results.map((product, i) => {
    const isExact = hasNumericQuery && parseInt(product.id, 10) === qNum;
    return renderCard(product, i, isExact);
  }).join('');

  // Animate cards in with stagger
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${Math.min(i * 40, 300)}ms`;
    card.classList.add('card-animate-in');
  });

  // Image error handling
  grid.querySelectorAll('.card-img').forEach(img => {
    img.addEventListener('error', handleImgError, { once: true });
  });
}

/* ============================================================
   CARD RENDERER
   ============================================================ */
function renderCard(product, index, isExact) {
  const idDisplay = `#${product.id.padStart(2, '0')}`;
  const badgeHtml = product.badge
    ? `<span class="badge-tag" aria-label="Tag: ${product.badge}">${escapeHtml(product.badge)}</span>`
    : '';

  return `
    <a
      href="${escapeHtml(product.affiliateUrl)}"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="product-card${isExact ? ' exact-match' : ''}"
      aria-label="${escapeHtml(product.title)} — ${idDisplay}"
      data-id="${escapeHtml(product.id)}"
    >
      <div class="card-image-wrap">
        <img
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.title)}"
          class="card-img"
          loading="lazy"
          decoding="async"
        />
        <div class="img-placeholder" aria-hidden="true" style="display:none">
          ${PLACEHOLDER_SVG}
          <span>Image unavailable</span>
        </div>
        <span class="badge-number" aria-hidden="true">${escapeHtml(idDisplay)}</span>
        ${badgeHtml}
      </div>
      <div class="card-body">
        <div>
          <p class="card-title">${escapeHtml(product.title)}</p>
          <p class="card-category">${escapeHtml(product.category)}</p>
        </div>
        <span class="cta-btn" aria-hidden="true">Get Link →</span>
      </div>
    </a>`;
}

/* ============================================================
   IMAGE ERROR HANDLER
   ============================================================ */
function handleImgError(e) {
  const img = e.target;
  const placeholder = img.nextElementSibling;
  img.style.display = 'none';
  if (placeholder && placeholder.classList.contains('img-placeholder')) {
    placeholder.style.display = 'flex';
  }
}

/* ============================================================
   SKELETON LOADERS
   ============================================================ */
function renderSkeletons(count) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>`).join('');
}

/* ============================================================
   ERROR STATE
   ============================================================ */
function showErrorState() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚡</div>
      <h3>Couldn't load products</h3>
      <p>Check your connection and <button onclick="location.reload()" style="color:#A78BFA;background:none;border:none;cursor:pointer;font-size:inherit;padding:0;">refresh the page</button>.</p>
    </div>`;
}

/* ============================================================
   ADMIN HELPER MODE
   ============================================================ */
function showAdminMode() {
  const container = document.getElementById('adminContainer');

  // FAB button
  const fab = document.createElement('button');
  fab.className = 'admin-fab';
  fab.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
    New Product`;
  fab.addEventListener('click', () => openAdminModal());
  document.body.appendChild(fab);
}

function openAdminModal() {
  const existing = document.getElementById('adminModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'adminModal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Add new product');

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-handle"></div>
      <h2 class="modal-title gradient-text">➕ Add New Product</h2>
      <p class="modal-subtitle">Fill in the fields — copy the JSON output into <code>data/products.json</code></p>

      <div class="form-group">
        <label class="form-label" for="adm-id">Product Number *</label>
        <input id="adm-id" class="form-input" type="text" placeholder="e.g. 09" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-title">Title *</label>
        <input id="adm-title" class="form-input" type="text" placeholder="Short, descriptive product title" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-cat">Category *</label>
        <select id="adm-cat" class="form-select">
          <option value="Desk &amp; Tech">Desk &amp; Tech</option>
          <option value="Gadgets">Gadgets</option>
          <option value="Room Aura">Room Aura</option>
          <option value="Car &amp; EDC">Car &amp; EDC</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-img">Image URL *</label>
        <input id="adm-img" class="form-input" type="url" placeholder="https://images.unsplash.com/photo-...?w=600" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-url">Affiliate URL *</label>
        <input id="adm-url" class="form-input" type="url" placeholder="https://s.click.aliexpress.com/e/_..." autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-badge">Badge <span style="font-weight:400;text-transform:none">(optional)</span></label>
        <input id="adm-badge" class="form-input" type="text" placeholder="Viral 🔥  or  Best Seller" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label" for="adm-tags">Tags <span style="font-weight:400;text-transform:none">(comma-separated, optional)</span></label>
        <input id="adm-tags" class="form-input" type="text" placeholder="viral" autocomplete="off"/>
      </div>

      <button class="btn-primary" id="adm-generate" type="button">Generate JSON</button>

      <div id="adm-output-wrap" style="display:none; margin-top:14px">
        <label class="form-label">JSON Output — paste into products.json</label>
        <pre class="output-box" id="adm-output" aria-live="polite"></pre>
        <button class="btn-primary" id="adm-copy" type="button" style="margin-top:10px">Copy JSON</button>
        <p class="copy-feedback" id="adm-copy-feedback" aria-live="polite">✓ Copied to clipboard!</p>
      </div>

      <button class="btn-secondary" id="adm-close" type="button">Close</button>
    </div>`;

  document.body.appendChild(overlay);

  // Close on overlay background click
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAdminModal(); });

  // Close button
  document.getElementById('adm-close').addEventListener('click', closeAdminModal);

  // Generate
  document.getElementById('adm-generate').addEventListener('click', () => {
    const id    = document.getElementById('adm-id').value.trim();
    const title = document.getElementById('adm-title').value.trim();
    const cat   = document.getElementById('adm-cat').value;
    const img   = document.getElementById('adm-img').value.trim();
    const url   = document.getElementById('adm-url').value.trim();
    const badge = document.getElementById('adm-badge').value.trim();
    const tagsRaw = document.getElementById('adm-tags').value.trim();

    if (!id || !title || !img || !url) {
      alert('Please fill in all required fields (Number, Title, Image URL, Affiliate URL).');
      return;
    }

    const paddedId = id.replace(/^0+/, '').padStart(2, '0');
    const tags = tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const today = new Date().toISOString().split('T')[0];

    const obj = {
      id:           paddedId,
      title:        title,
      category:     cat,
      image:        img,
      affiliateUrl: url,
      badge:        badge || null,
      tags:         tags,
      dateAdded:    today,
    };

    const json = JSON.stringify(obj, null, 2);
    document.getElementById('adm-output').textContent = json;
    document.getElementById('adm-output-wrap').style.display = 'block';
  });

  // Copy
  document.getElementById('adm-copy').addEventListener('click', () => {
    const text = document.getElementById('adm-output').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const fb = document.getElementById('adm-copy-feedback');
      fb.classList.add('visible');
      setTimeout(() => fb.classList.remove('visible'), 2500);
    });
  });

  // ESC key
  const onEsc = e => { if (e.key === 'Escape') { closeAdminModal(); document.removeEventListener('keydown', onEsc); } };
  document.addEventListener('keydown', onEsc);

  // Focus first input
  setTimeout(() => document.getElementById('adm-id')?.focus(), 100);
}

function closeAdminModal() {
  document.getElementById('adminModal')?.remove();
}

/* ============================================================
   LEGAL MODALS
   ============================================================ */
const LEGAL_CONTENT = {
  privacy: {
    title: '🔒 Privacy Policy',
    body: `
      <h3>Last updated: November 2026</h3>
      <p>Find Aura ("we", "our", "us") operates findaura.org. This page informs you of our policies regarding the collection, use, and disclosure of information when you use our website.</p>
      <h3>Information We Collect</h3>
      <p>We do not directly collect personal data. Our website is a static site with no backend, login, or account system.</p>
      <h3>Third-Party Services</h3>
      <p>When you click affiliate links, you are redirected to third-party platforms (AliExpress, Amazon, etc.) that have their own privacy policies and may set cookies. We are not responsible for the data practices of these third parties.</p>
      <h3>Analytics</h3>
      <p>We may use privacy-respecting analytics (e.g. Vercel Analytics) to understand general traffic patterns. No personal data is sold or shared with advertisers.</p>
      <h3>Contact</h3>
      <p>For privacy questions: <a href="mailto:hello@findaura.org" style="color:#A78BFA">hello@findaura.org</a></p>
    `,
  },
  terms: {
    title: '📋 Terms & Affiliate Disclosure',
    body: `
      <h3>Affiliate Disclosure</h3>
      <p>Find Aura participates in the AliExpress Affiliate Program, the Amazon Associates Program, and similar affiliate advertising programs. When you click a link on this site and make a purchase, we may earn a commission at <strong>no extra cost to you</strong>.</p>
      <h3>Product Accuracy</h3>
      <p>Prices, availability, and specifications are subject to change at any time. Always verify information on the retailer's website before purchasing. We make no warranties regarding product quality or seller reliability.</p>
      <h3>No Endorsement</h3>
      <p>Inclusion of a product does not constitute an endorsement or guarantee. We curate products we believe offer good value, but results may vary.</p>
      <h3>Limitation of Liability</h3>
      <p>Find Aura is not liable for any direct or indirect damages arising from the use of this site or purchases made through affiliate links.</p>
      <h3>Governing Law</h3>
      <p>These terms are governed by applicable law. By using this site, you agree to these terms.</p>
      <h3>Contact</h3>
      <p>Questions? Email <a href="mailto:hello@findaura.org" style="color:#A78BFA">hello@findaura.org</a></p>
    `,
  },
};

function showLegalModal(type) {
  const data = LEGAL_CONTENT[type];
  if (!data) return;

  const container = document.getElementById('legalModalContainer');
  container.innerHTML = `
    <div class="legal-modal-overlay" id="legalOverlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(data.title)}">
      <div class="legal-modal-box">
        <h2>
          <span>${escapeHtml(data.title)}</span>
          <button class="close-btn" onclick="closeLegalModal()" aria-label="Close">✕</button>
        </h2>
        ${data.body}
      </div>
    </div>`;

  document.getElementById('legalOverlay').addEventListener('click', e => {
    if (e.target.id === 'legalOverlay') closeLegalModal();
  });

  const onEsc = e => { if (e.key === 'Escape') { closeLegalModal(); document.removeEventListener('keydown', onEsc); } };
  document.addEventListener('keydown', onEsc);
}

function closeLegalModal() {
  document.getElementById('legalModalContainer').innerHTML = '';
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Expose legal modal functions globally (used in inline onclick attributes)
window.showLegalModal = showLegalModal;
window.closeLegalModal = closeLegalModal;

