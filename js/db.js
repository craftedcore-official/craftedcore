// CraftedCore — js/db.js v4
// ============================================================

const DB_CONFIG = {
  supabase: {
    url: 'https://zlqiyxhesmrfszmjazsr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscWl5eGhlc21yZnN6bWphenNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDMxNjYsImV4cCI6MjEwMTkxOTE2Nn0.fQel-qiQSpJqe4ed_eb_HVYVi7VtJht7d_TxND_gq9g'
  },
  cloudinary: {
    cloudName: 'q93whfml',
    uploadPreset: 'craftedcore_unsigned'
  },
  admin: { password: 'craftedcore2024' }
};

// ── Key Getters (localStorage override → hardcoded fallback) ──
function getSupabaseUrl() {
  let s = null;
  try { s = localStorage.getItem('cc_cfg_url'); } catch(e) {}
  let u = (s && s.trim().length > 10) ? s.trim() : DB_CONFIG.supabase.url;
  return u.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
}
function getSupabaseKey() {
  let s = null;
  try { s = localStorage.getItem('cc_cfg_key'); } catch(e) {}
  return (s && s.trim().length > 20) ? s.trim() : DB_CONFIG.supabase.anonKey;
}
function getCloudName() {
  let s = null;
  try { s = localStorage.getItem('cc_cfg_cloud'); } catch(e) {}
  return (s && s.trim().length > 2) ? s.trim() : DB_CONFIG.cloudinary.cloudName;
}
function getUploadPreset() {
  let s = null;
  try { s = localStorage.getItem('cc_cfg_preset'); } catch(e) {}
  return (s && s.trim().length > 2) ? s.trim() : DB_CONFIG.cloudinary.uploadPreset;
}

// ── Core DB Fetch ─────────────────────────────────────────────
async function dbFetch(endpoint, opts = {}) {
  const BASE = getSupabaseUrl();
  const KEY  = getSupabaseKey();
  const method = opts.method || 'GET';
  const prefer = opts.prefer || (method === 'DELETE' ? '' : 'return=representation');
  const hdrs = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  if (prefer) hdrs['Prefer'] = prefer;
  const fetchOpts = { method, headers: hdrs };
  if (opts.body) fetchOpts.body = opts.body;
  const res = await fetch(`${BASE}/rest/v1/${endpoint}`, fetchOpts);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  if (method === 'DELETE' || res.status === 204) return null;
  return res.json();
}

// ── Cache ─────────────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000;
function cacheSet(k, d) { try { localStorage.setItem(k, JSON.stringify({ d, t: Date.now() })); } catch(e) {} }
function cacheGet(k) {
  try {
    const r = localStorage.getItem(k); if (!r) return null;
    const { d, t } = JSON.parse(r);
    if (Date.now() - t > CACHE_TTL) { localStorage.removeItem(k); return null; }
    return d;
  } catch(e) { return null; }
}
function cacheClear() {
  ['cc_products', 'cc_categories', 'cc_settings'].forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
}

// ── Products API ──────────────────────────────────────────────
const Products = {
  async getAll() {
    const c = cacheGet('cc_products'); if (c) return c;
    const d = await dbFetch('products?select=*&order=created_at.desc');
    cacheSet('cc_products', d); return d || [];
  },
  async getFeatured()  { return (await this.getAll()).filter(p => p.is_featured); },
  async create(p)      { cacheClear(); return dbFetch('products',              { method: 'POST',  body: JSON.stringify(p) }); },
  async update(id, u)  { cacheClear(); return dbFetch(`products?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(u) }); },
  async delete(id)     { cacheClear(); return dbFetch(`products?id=eq.${id}`, { method: 'DELETE' }); }
};

// ── Categories API ────────────────────────────────────────────
const Categories = {
  async getAll() {
    const c = cacheGet('cc_categories'); if (c) return c;
    const d = await dbFetch('categories?select=*&order=sort_order.asc,name.asc');
    cacheSet('cc_categories', d); return d || [];
  },
  async create(c)      { cacheClear(); return dbFetch('categories',              { method: 'POST',  body: JSON.stringify(c) }); },
  async update(id, u)  { cacheClear(); return dbFetch(`categories?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(u) }); },
  async delete(id)     { cacheClear(); return dbFetch(`categories?id=eq.${id}`, { method: 'DELETE' }); }
};

// ── Orders API ────────────────────────────────────────────────
const Orders = {
  async getAll() {
    try {
      const d = await dbFetch('orders?select=*&order=created_at.desc');
      return d || [];
    } catch(e) { return []; }
  },
  async create(o)     { return dbFetch('orders', { method: 'POST', body: JSON.stringify(o) }); },
  async updateStatus(id, status) { return dbFetch(`orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); },
  async delete(id)    { return dbFetch(`orders?id=eq.${id}`, { method: 'DELETE' }); }
};

// ── Reviews API ───────────────────────────────────────────────
const Reviews = {
  async getAll() {
    try {
      const d = await dbFetch('reviews?select=*&order=created_at.desc');
      return d || [];
    } catch(e) { return []; }
  },
  async create(r)     { return dbFetch('reviews', { method: 'POST', body: JSON.stringify(r) }); },
  async update(id, u) { return dbFetch(`reviews?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(u) }); },
  async delete(id)    { return dbFetch(`reviews?id=eq.${id}`, { method: 'DELETE' }); }
};

// ── Coupons API ───────────────────────────────────────────────
const Coupons = {
  async getAll() {
    try {
      const d = await dbFetch('coupons?select=*&order=created_at.desc');
      return d || [];
    } catch(e) { return []; }
  },
  async create(c)     { return dbFetch('coupons', { method: 'POST', body: JSON.stringify(c) }); },
  async update(id, u) { return dbFetch(`coupons?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(u) }); },
  async delete(id)    { return dbFetch(`coupons?id=eq.${id}`, { method: 'DELETE' }); }
};

// ── Site Settings API ─────────────────────────────────────────
const SiteSettings = {
  _ok: null,
  async tableExists() {
    if (this._ok !== null) return this._ok;
    try { await dbFetch('site_settings?select=key&limit=1'); this._ok = true; }
    catch(e) { this._ok = false; }
    return this._ok;
  },
  async getAll() {
    const c = cacheGet('cc_settings'); if (c) return c;
    try {
      const d = await dbFetch('site_settings?select=*');
      const o = {}; (d || []).forEach(r => { o[r.key] = r.value; });
      cacheSet('cc_settings', o); return o;
    } catch(e) { return {}; }
  },
  async get(key) {
    const all = await this.getAll();
    return all[key];
  },
  async set(key, value) {
    await dbFetch('site_settings', { method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: JSON.stringify({ key, value }) });
    cacheClear();
  },
  async setMultiple(settings) {
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await dbFetch('site_settings', { method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: JSON.stringify(rows) });
    cacheClear();
  }
};

// ── Image Upload (Cloudinary) ─────────────────────────────────
async function uploadImage(file, onProgress) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', getUploadPreset());
  fd.append('folder', 'craftedcore');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${getCloudName()}/image/upload`);
    xhr.upload.onprogress = e => { if (onProgress && e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        xhr.status === 200 ? resolve(r.secure_url) : reject(new Error(r.error?.message || 'Upload failed'));
      } catch(e) { reject(new Error('Parse error')); }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(fd);
  });
}

// ── Product Card HTML Generator ───────────────────────────────
function productCardHTML(p) {
  const safeName = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  return `
  <div class="product-card" data-category="${p.category_slug || 'all'}" id="prod-${p.id}">
    <div class="product-image-wrap">
      ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      <a href="product.html?id=${p.id}">
        <img src="${p.image_url ? p.image_url.split(',')[0] : 'images/product_mug.jpg'}" alt="${p.name}" loading="lazy"/>
      </a>
      <div class="product-overlay">
        <a href="product.html?id=${p.id}" class="btn btn-whatsapp" style="width:100%;justify-content:center;border:none;text-decoration:none;display:flex;">🛍️ View Options</a>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category_name || ''}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.description || ''}</div>
      <div class="product-footer">
        <div class="product-price"><span class="from">From </span>₹${p.price}</div>
        <button onclick="addToCart(${p.id}, '${safeName}', ${p.price||0}, '${p.image_url ? p.image_url.split(',')[0] : ''}')" class="order-btn" style="border:none;background:none;cursor:pointer;">🛒 Add</button>
      </div>
    </div>
  </div>`;
}

// ── Apply Dynamic Settings To Current Page ────────────────────
async function applyDynamicSettings() {
  try {
    const s = await SiteSettings.getAll();
    window._siteSettings = s;
    if (!s || Object.keys(s).length === 0) return;

    // 1. Logo & Branding
    if (s.site_logo_url) {
      document.querySelectorAll('.logo-img').forEach(img => { img.src = s.site_logo_url; });
    }
    if (s.brand_name) {
      document.querySelectorAll('.logo-img').forEach(img => { img.alt = s.brand_name; });
    }
    if (s.nav_cta_text) {
      const el = document.getElementById('nav-whatsapp-btn');
      if (el) el.innerHTML = `<svg class="social-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.176-1.348a9.982 9.982 0 004.836 1.251h.004c5.506 0 9.989-4.478 9.989-9.984 0-2.668-1.039-5.176-2.927-7.063C17.189 3.039 14.68 2 12.012 2zm.004 16.326h-.003a8.31 8.31 0 01-4.238-1.163l-.304-.18-3.149.821.838-3.067-.198-.314a8.275 8.275 0 01-1.272-4.437c0-4.577 3.724-8.301 8.306-8.301 2.217 0 4.301.865 5.869 2.434a8.261 8.261 0 012.43 5.867c0 4.578-3.725 8.302-8.279 8.302zm4.551-6.216c-.249-.125-1.477-.729-1.706-.812-.228-.083-.395-.125-.561.125-.166.249-.644.812-.789.978-.145.166-.291.187-.54.062a6.837 6.837 0 01-2.008-1.238 7.55 7.55 0 01-1.39-1.73c-.145-.249-.016-.384.109-.508.113-.112.249-.291.374-.436.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.436-.062-.125-.561-1.352-.769-1.85-.202-.486-.407-.42-.561-.428l-.478-.009c-.166 0-.436.062-.664.312-.228.249-.873.852-.873 2.079 0 1.226.893 2.41 1.018 2.577.125.166 1.757 2.684 4.257 3.764.595.257 1.06.41 1.422.525.597.19 1.14.163 1.57.099.479-.071 1.477-.603 1.684-1.184.208-.582.208-1.08.145-1.184-.063-.104-.229-.166-.478-.291z"/></svg> ${s.nav_cta_text}`;
    }

    // 2. WhatsApp Number
    if (s.whatsapp_number) {
      const n = s.whatsapp_number.replace(/\D/g, '');
      document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${n}`);
      });
    }

    // 3. Hero Section
    if (s.hero_title)     { const el = document.querySelector('.hero-title');      if (el) el.innerHTML = s.hero_title; }
    if (s.hero_subtitle)  { const el = document.querySelector('.hero-desc');       if (el) el.textContent = s.hero_subtitle; }
    if (s.hero_image_url) { const el = document.querySelector('.hero-image-wrap img'); if (el) el.src = s.hero_image_url; }
    if (s.hero_cta1)      { const el = document.getElementById('hero-explore-btn'); if (el) el.innerHTML = s.hero_cta1; }
    if (s.hero_cta2)      { const el = document.getElementById('hero-chat-btn'); if (el) el.innerHTML = s.hero_cta2; }

    // 4. Stats Counter
    const sns = document.querySelectorAll('.stat-number');
    const sls = document.querySelectorAll('.stat-label');
    if (s.stat_1_num && sns[0]) sns[0].textContent = s.stat_1_num;
    if (s.stat_2_num && sns[1]) sns[1].textContent = s.stat_2_num;
    if (s.stat_3_num && sns[2]) sns[2].textContent = s.stat_3_num;
    if (s.stat_1_lbl && sls[0]) sls[0].textContent = s.stat_1_lbl;
    if (s.stat_2_lbl && sls[1]) sls[1].textContent = s.stat_2_lbl;
    if (s.stat_3_lbl && sls[2]) sls[2].textContent = s.stat_3_lbl;

    // 5. Feature / USP Cards
    const uspCards = document.querySelectorAll('.usp-card');
    for (let i = 1; i <= 6; i++) {
      const card = uspCards[i - 1];
      if (!card) continue;
      const icon = s[`usp_${i}_icon`];
      const title = s[`usp_${i}_title`];
      const desc = s[`usp_${i}_desc`];
      if (icon)  { const el = card.querySelector('.usp-icon');  if (el) el.textContent = icon; }
      if (title) { const el = card.querySelector('.usp-title'); if (el) el.textContent = title; }
      if (desc)  { const el = card.querySelector('.usp-desc');  if (el) el.textContent = desc; }
    }

    // 6. Special Promo Banner
    if (s.promo_title) {
      const el = document.querySelector('.cta-title');
      if (el) el.innerHTML = s.promo_title;
    }
    if (s.promo_subtitle) {
      const el = document.querySelector('.cta-desc');
      if (el) el.textContent = s.promo_subtitle;
    }

    // 7. Footer & Social Links
    if (s.footer_about) {
      const el = document.querySelector('.footer-brand p');
      if (el) el.textContent = s.footer_about;
    }
    if (s.biz_tagline) {
      const el = document.querySelector('.footer-bottom p:last-child');
      if (el) el.textContent = s.biz_tagline;
    }
    if (s.biz_insta) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { a.href = s.biz_insta; });
    }

    // 8. Announcement Bar
    if (s.announcement_enabled === 'true' && s.announcement_text && !document.getElementById('annBar')) {
      const bar = document.createElement('div');
      bar.id = 'annBar';
      bar.style.cssText = `background:${s.announcement_color || '#C88A58'};color:#fff;text-align:center;padding:8px 44px;font-size:.85rem;font-weight:600;position:relative;z-index:9999;`;
      bar.innerHTML = (s.announcement_link
        ? `<a href="${s.announcement_link}" style="color:#fff;text-decoration:underline">${s.announcement_text}</a>`
        : s.announcement_text)
        + `<button onclick="this.parentElement.remove()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer">×</button>`;
      document.body.prepend(bar);
    }
  } catch(e) { /* Silently use static fallback */ }
}
