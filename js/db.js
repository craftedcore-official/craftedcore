// ============================================================
// CraftedCore — Database Config (Supabase + Cloudinary)
// Fill in YOUR keys below after setup
// ============================================================

const DB_CONFIG = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',         // e.g. https://xxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // from Supabase dashboard
  },
  cloudinary: {
    cloudName: 'YOUR_CLOUD_NAME',     // e.g. craftedcore
    uploadPreset: 'craftedcore_unsigned' // unsigned upload preset
  },
  admin: {
    password: 'craftedcore2024'       // change this to your password
  }
};

// ============================================================
// Supabase & Cloudinary Dynamic Key Loaders
// ============================================================
function getSupabaseUrl() {
  const saved = localStorage.getItem('cc_cfg_url');
  if (saved && saved !== 'YOUR_SUPABASE_URL') return saved.trim();
  return DB_CONFIG.supabase.url;
}

function getSupabaseKey() {
  const saved = localStorage.getItem('cc_cfg_key');
  if (saved && saved !== 'YOUR_SUPABASE_ANON_KEY') return saved.trim();
  return DB_CONFIG.supabase.anonKey;
}

function getCloudName() {
  const saved = localStorage.getItem('cc_cfg_cloud');
  if (saved && saved !== 'YOUR_CLOUD_NAME') return saved.trim();
  return DB_CONFIG.cloudinary.cloudName;
}

function getUploadPreset() {
  const saved = localStorage.getItem('cc_cfg_preset');
  if (saved && saved !== 'craftedcore_unsigned') return saved.trim();
  return DB_CONFIG.cloudinary.uploadPreset;
}

async function dbFetch(endpoint, options = {}) {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || url === 'YOUR_SUPABASE_URL' || !key || key === 'YOUR_SUPABASE_ANON_KEY') {
    throw new Error('Supabase keys not configured');
  }

  const res = await fetch(`${url}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers
    },
    ...options
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ============================================================
// CACHE — Reduces Firebase reads (30 min cache)
// ============================================================
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function cacheSet(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
}

function cacheGet(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const { data, ts } = JSON.parse(raw);
  if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
  return data;
}

function cacheClear() {
  ['cc_products', 'cc_categories'].forEach(k => localStorage.removeItem(k));
}

// ============================================================
// PRODUCTS API
// ============================================================
const Products = {
  async getAll() {
    const cached = cacheGet('cc_products');
    if (cached) return cached;
    const data = await dbFetch('products?select=*&order=created_at.desc');
    cacheSet('cc_products', data);
    return data;
  },

  async getFeatured() {
    const all = await this.getAll();
    return all.filter(p => p.is_featured);
  },

  async getByCategory(categorySlug) {
    const all = await this.getAll();
    if (categorySlug === 'all') return all;
    return all.filter(p => p.category_slug === categorySlug);
  },

  async create(product) {
    const data = await dbFetch('products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    cacheClear();
    return data;
  },

  async update(id, updates) {
    const data = await dbFetch(`products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    cacheClear();
    return data;
  },

  async delete(id) {
    await dbFetch(`products?id=eq.${id}`, { method: 'DELETE' });
    cacheClear();
  }
};

// ============================================================
// CATEGORIES API
// ============================================================
const Categories = {
  async getAll() {
    const cached = cacheGet('cc_categories');
    if (cached) return cached;
    const data = await dbFetch('categories?select=*&order=sort_order.asc');
    cacheSet('cc_categories', data);
    return data;
  },

  async create(cat) {
    const data = await dbFetch('categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    });
    cacheClear();
    return data;
  },

  async update(id, updates) {
    const data = await dbFetch(`categories?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    cacheClear();
    return data;
  },

  async delete(id) {
    await dbFetch(`categories?id=eq.${id}`, { method: 'DELETE' });
    cacheClear();
  }
};

// ============================================================
// IMAGE UPLOAD — Cloudinary
// ============================================================
async function uploadImage(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', getUploadPreset());
  formData.append('folder', 'craftedcore');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${getCloudName()}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status === 200) resolve(res.secure_url);
      else reject(new Error(res.error?.message || 'Upload failed'));
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// ============================================================
// PRODUCT CARD HTML Generator (shared by site + admin)
// ============================================================
function productCardHTML(p, waNumber = '919913846454') {
  const waMsg = encodeURIComponent(`Hi CraftedCore! I want to order: ${p.name}`);
  const badge = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
  const img = p.image_url || 'images/product_mug.jpg';

  return `
  <div class="product-card" data-category="${p.category_slug || 'all'}" id="prod-${p.id}">
    <div class="product-image-wrap">
      ${badge}
      <img src="${img}" alt="${p.name}" loading="lazy" />
      <div class="product-overlay">
        <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="btn btn-whatsapp" style="width:100%;justify-content:center;">💬 Order Now</a>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category_name || p.category_slug || ''}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.description || ''}</div>
      <div class="product-footer">
        <div class="product-price"><span class="from">From </span>₹${p.price}</div>
        <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="order-btn">💬 Order</a>
      </div>
    </div>
  </div>`;
}
