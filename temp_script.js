
// ─── AUTH ────────────────────────────────────────────────────
function getAdmPass() { 
  try { return localStorage.getItem('cc_admin_pass') || DB_CONFIG.admin.password; }
  catch(e) { return DB_CONFIG.admin.password; }
}
function doLogin() {
  const v = document.getElementById('passIn').value.trim();
  if (v === getAdmPass()) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    initAdmin();
  } else {
    const e = document.getElementById('loginErr'); e.style.display = 'block';
    setTimeout(() => e.style.display = 'none', 3000);
  }
}
function doLogout() {
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('passIn').value = '';
}

// ─── NAV ─────────────────────────────────────────────────────
const PG_TITLES = { dashboard:'Dashboard', orders:'Orders', products:'Products', categories:'Categories', coupons:'Coupons', reviews:'Reviews', editor:'Website Editor', settings:'Settings' };
function showPage(n, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + n).classList.add('active');
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('topTitle').textContent = PG_TITLES[n] || n;
  closeSB();
  if (n === 'orders')     loadOrders();
  if (n === 'products')   loadProds();
  if (n === 'categories') loadCats();
  if (n === 'coupons')    loadCoupons();
  if (n === 'reviews')    loadReviews();
  if (n === 'editor')     loadEditor();
  if (n === 'settings')   loadSettings();
}
function showEdTab(n, btn) {
  document.querySelectorAll('#page-editor .tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#page-editor .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('etab-' + n).classList.add('active');
  if (btn) btn.classList.add('active');
}
function showStTab(n, btn) {
  document.querySelectorAll('#page-settings .tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#page-settings .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('stab-' + n).classList.add('active');
  if (btn) btn.classList.add('active');
}
function openSB()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('mobOverlay').classList.add('open'); }
function closeSB() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobOverlay').classList.remove('open'); }

// ─── INIT ────────────────────────────────────────────────────
async function initAdmin() {
  await loadDash();
  await loadCatDropdown();
}

// ─── DASHBOARD ───────────────────────────────────────────────
async function loadDash() {
  const box = document.getElementById('connBox');
  const dot = document.getElementById('connDot');
  box.className = 'conn-box loading';
  box.innerHTML = '<div class="spinner"></div>&nbsp; Connecting to Store Database...';
  try {
    const [ps, cs, os] = await Promise.all([Products.getAll(), Categories.getAll(), Orders.getAll()]);
    document.getElementById('sO').textContent = os.length;
    document.getElementById('sP').textContent = ps.length;
    document.getElementById('sF').textContent = ps.filter(p => p.is_featured).length;
    document.getElementById('sC').textContent = cs.length;
    box.className = 'conn-box ok';
    box.innerHTML = `<span style="color:var(--green);font-weight:700;">✅ Connected!</span>&nbsp;<span style="color:var(--text2);font-size:.8rem;">${os.length} orders · ${ps.length} products · ${cs.length} categories</span>`;
    dot.style.background = 'var(--green)';
  } catch(e) {
    box.className = 'conn-box err';
    box.innerHTML = `<span style="color:var(--red);font-weight:700;">❌ Database Not Connected</span>&nbsp;<span style="font-size:.8rem;color:var(--text2);">${e.message}</span>`;
    dot.style.background = 'var(--red)';
  }
}

// ─── ORDERS ──────────────────────────────────────────────────
let _orders = [];
async function loadOrders() {
  document.getElementById('ordersTbl').innerHTML = '<div class="loading-ov"><div class="spinner"></div></div>';
  try {
    _orders = await Orders.getAll();
    renderOrders(_orders);
  } catch(e) {
    document.getElementById('ordersTbl').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div>Could not load orders. Make sure orders table exists in Supabase.</div>`;
  }
}

function renderOrders(os) {
  if (!os.length) {
    document.getElementById('ordersTbl').innerHTML = `<div class="empty"><div class="empty-icon">🛒</div>No orders recorded yet.<br/><br/><button class="btn btn-primary" onclick="openOrderModal()">➕ Create First Order</button></div>`;
    return;
  }
  const rows = os.map(o => {
    const stBdg = o.status==='completed'?'bdg-done':o.status==='processing'?'bdg-proc':o.status==='cancelled'?'bdg-canc':'bdg-pend';
    return `
    <tr>
      <td><b>#${o.id}</b></td>
      <td><div class="prod-n">${o.customer_name}</div><div style="font-size:.76rem;color:var(--text3);">${o.customer_phone||'No phone'}</div></td>
      <td>${o.product_name||'Custom Order'}</td>
      <td style="font-weight:700;color:var(--gold);">₹${o.amount||0}</td>
      <td>
        <div style="display:flex; gap:5px; align-items:center;">
          <select class="fctl btn-sm" id="osel_${o.id}" style="width:110px;padding:.2rem .4rem;">
            <option value="pending" ${o.status==='pending'?'selected':''}>🟡 Pending</option>
            <option value="processing" ${o.status==='processing'?'selected':''}>🔵 Processing</option>
            <option value="completed" ${o.status==='completed'?'selected':''}>🟢 Completed</option>
            <option value="cancelled" ${o.status==='cancelled'?'selected':''}>🔴 Cancelled</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="updOrderStatus(${o.id})" style="padding:.2rem .4rem;">Update</button>
        </div>
      </td>
      <td class="act-cell">
        <button class="btn btn-danger btn-icon btn-sm" onclick="delOrderConfirm(${o.id})">🗑️</button>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('ordersTbl').innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function srchOrders(q) { renderOrders(_orders.filter(o => o.customer_name.toLowerCase().includes(q.toLowerCase()) || (o.product_name||'').toLowerCase().includes(q.toLowerCase()))); }
function filOrders(s)  { renderOrders(s ? _orders.filter(o => o.status === s) : _orders); }

async function updOrderStatus(id) {
  const status = document.getElementById('osel_' + id).value;
  if (!confirm(`Are you sure you want to update Order #${id} status to ${status}?`)) return;
  try {
    await Orders.updateStatus(id, status);
    toast(`✅ Order #${id} status updated to ${status}!`, 'success');
    loadOrders();
    loadDash();
  } catch(e) { toast('❌ Error updating status', 'error'); }
}

async function delOrderConfirm(id) {
  if (!confirm(`Are you sure you want to delete Order #${id}?`)) return;
  try {
    await Orders.delete(id);
    toast('🗑️ Deleted!', 'success');
    loadOrders();
    loadDash();
  } catch(e) { toast('❌ Error deleting', 'error'); }
}

function openOrderModal() {
  ['omId','omCust','omPhone','omProd','omAmt','omNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('omStatus').value = 'pending';
  openM('orderModal');
}

async function saveOrder() {
  const cust = document.getElementById('omCust').value.trim();
  if (!cust) { toast('❌ Customer name required!', 'error'); return; }
  const data = {
    customer_name: cust,
    customer_phone: document.getElementById('omPhone').value.trim(),
    product_name: document.getElementById('omProd').value.trim(),
    amount: parseFloat(document.getElementById('omAmt').value) || 0,
    status: document.getElementById('omStatus').value,
    notes: document.getElementById('omNotes').value.trim()
  };
  try {
    await Orders.create(data);
    toast('✅ Order recorded!', 'success');
    closeM('orderModal');
    loadOrders();
    loadDash();
  } catch(e) { toast('❌ Error saving order: ' + e.message, 'error'); }
}

// ─── PRODUCTS ────────────────────────────────────────────────
let _prods = [], _cats = [];
async function loadProds() {
  document.getElementById('prodTbl').innerHTML = '<div class="loading-ov"><div class="spinner"></div></div>';
  try {
    [_prods, _cats] = await Promise.all([Products.getAll(), Categories.getAll()]);
    renderProds(_prods);
  } catch(e) {
    document.getElementById('prodTbl').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div>Database connection issue.</div>`;
  }
}

function renderProds(ps) {
  if (!ps.length) {
    document.getElementById('prodTbl').innerHTML = `<div class="empty"><div class="empty-icon">📦</div>No products yet.<br/><br/><button class="btn btn-primary" onclick="openProdModal()">➕ Add First Product</button></div>`;
    return;
  }
  const rows = ps.map(p => `
    <tr>
      <td><img class="thumb" src="${p.image_url||''}" alt="" onerror="this.style.background='var(--bg4)';this.src=''" /></td>
      <td><div class="prod-n">${p.name}</div><div class="prod-p">₹${p.price}${p.badge?` &nbsp;<span class="bdg bdg-cat">${p.badge}</span>`:''}</div></td>
      <td><span class="bdg bdg-cat">${p.category_name||p.category_slug||'—'}</span></td>
      <td>
        <label class="tog">
          <input type="checkbox" ${p.is_featured?'checked':''} onchange="togFeat(${p.id},this.checked)" />
          <span class="tog-sl"></span>
        </label>
      </td>
      <td class="act-cell">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editProd(${p.id})">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="confDel('product',${p.id},${JSON.stringify(p.name)})">🗑️</button>
      </td>
    </tr>`).join('');
  document.getElementById('prodTbl').innerHTML = `
    <table>
      <thead><tr><th>Image</th><th>Name / Badge</th><th>Category</th><th>Featured</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function srchProds(q) { renderProds(_prods.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))); }
function filProds(s)  { renderProds(s ? _prods.filter(p => p.category_slug === s) : _prods); }

async function togFeat(id, val) {
  try {
    await Products.update(id, { is_featured: val });
    toast(`⭐ ${val ? 'Featured' : 'Unfeatured'}!`, 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

function openProdModal() {
  ['pmId','pName','pPrice','pBadge','pDesc','pWA','pImgUrl'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pCat').value = '';
  document.getElementById('pFeat').checked = false;
  document.getElementById('pPre').style.display = 'none';
  document.getElementById('pmTitle').textContent = 'Add Product';
  openM('prodModal');
}

function editProd(id) {
  const p = _prods.find(x => x.id === id); if (!p) return;
  document.getElementById('pmId').value = p.id;
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pPrice').value = p.price || '';
  document.getElementById('pCat').value = p.category_slug || '';
  document.getElementById('pBadge').value = p.badge || '';
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pWA').value = p.wa_message || '';
  document.getElementById('pImgUrl').value = p.image_url || '';
  document.getElementById('pFeat').checked = !!p.is_featured;
  if (p.image_url) { const img = document.getElementById('pPre'); img.src = p.image_url; img.style.display = 'block'; }
  document.getElementById('pmTitle').textContent = 'Edit Product';
  openM('prodModal');
}

async function saveProd() {
  const name  = document.getElementById('pName').value.trim();
  const price = parseFloat(document.getElementById('pPrice').value);
  const cat   = document.getElementById('pCat').value;
  if (!name || !price || !cat) { toast('❌ Name, price & category are required!', 'error'); return; }
  const catObj = _cats.find(c => c.slug === cat);
  const data = {
    name, price, category_slug: cat, category_name: catObj?.name || cat,
    badge: document.getElementById('pBadge').value.trim() || null,
    description: document.getElementById('pDesc').value.trim(),
    wa_message: document.getElementById('pWA').value.trim() || `Hi CraftedCore! I want to order: ${name}`,
    is_featured: document.getElementById('pFeat').checked,
    image_url: document.getElementById('pImgUrl').value.trim() || null
  };
  try {
    const id = document.getElementById('pmId').value;
    if (id) await Products.update(id, data);
    else    await Products.create(data);
    toast(id ? '✅ Product updated!' : '✅ Product added!', 'success');
    closeM('prodModal');
    loadProds();
    loadDash();
  } catch(e) { toast('❌ Error: ' + e.message, 'error'); }
}

function setBdg(el, val) { document.getElementById('pBadge').value = val; }

// ─── CATEGORIES ──────────────────────────────────────────────
async function loadCats() {
  document.getElementById('catGrid').innerHTML = '<div class="loading-ov"><div class="spinner"></div></div>';
  try {
    _cats = await Categories.getAll();
    if (!_cats.length) {
      document.getElementById('catGrid').innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🗂️</div>No categories yet.<br/><br/><button class="btn btn-primary" onclick="openCatModal()">➕ Add First Category</button></div>`;
      return;
    }
    document.getElementById('catGrid').innerHTML = _cats.map(c => `
      <div class="cat-card">
        <div class="cat-emoji" style="width:48px;height:48px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.6rem;">
          <img src="${c.emoji||''}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='🗂️'" />
        </div>
        <div class="cat-info"><div class="cat-name">${c.name}</div><div class="cat-slug">${c.slug}</div></div>
        <div class="cat-acts">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editCat(${c.id})">✏️</button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="confDel('category',${c.id},${JSON.stringify(c.name)})">🗑️</button>
        </div>
      </div>`).join('');
  } catch(e) { document.getElementById('catGrid').innerHTML = `<div class="empty" style="grid-column:1/-1">Connection error.</div>`; }
}

async function loadCatDropdown() {
  try {
    _cats = await Categories.getAll();
    const sel = document.getElementById('pCat');
    sel.innerHTML = '<option value="">-- Select Category --</option>' + _cats.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
    const fil = document.getElementById('catFil');
    if (fil) fil.innerHTML = '<option value="">All Categories</option>' + _cats.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
  } catch(e) {}
}

function openCatModal() {
  ['cmId','cmEmoji','cmName','cmSlug','cmOrd','cUrlIn'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cPre').style.display = 'none';
  document.getElementById('cmTitle').textContent = 'Add Category';
  openM('catModal');
}

function editCat(id) {
  const c = _cats.find(x => x.id === id); if (!c) return;
  document.getElementById('cmId').value = c.id;
  document.getElementById('cmEmoji').value = c.emoji || '';
  document.getElementById('cmName').value = c.name;
  document.getElementById('cmSlug').value = c.slug;
  document.getElementById('cmOrd').value = c.sort_order || '';
  
  if (c.emoji && c.emoji.startsWith('http')) {
    const img = document.getElementById('cPre');
    img.src = c.emoji;
    img.style.display = 'block';
  } else {
    document.getElementById('cPre').style.display = 'none';
  }
  
  openM('catModal');
}

function autoSlug(v) {
  if (!document.getElementById('cmId').value)
    document.getElementById('cmSlug').value = v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function saveCat() {
  const name = document.getElementById('cmName').value.trim();
  const slug = document.getElementById('cmSlug').value.trim();
  if (!name || !slug) { toast('❌ Name and Slug are required!', 'error'); return; }
  const data = { name, slug, emoji: document.getElementById('cmEmoji').value.trim() || null, sort_order: parseInt(document.getElementById('cmOrd').value) || 0 };
  try {
    const id = document.getElementById('cmId').value;
    if (id) await Categories.update(id, data);
    else    await Categories.create(data);
    toast('✅ Category saved!', 'success');
    closeM('catModal');
    loadCats();
    loadCatDropdown();
  } catch(e) { toast('❌ Error: ' + e.message, 'error'); }
}

// ─── COUPONS ─────────────────────────────────────────────────
async function loadCoupons() {
  document.getElementById('couponsTbl').innerHTML = '<div class="loading-ov"><div class="spinner"></div></div>';
  try {
    const cps = await Coupons.getAll();
    if (!cps.length) {
      document.getElementById('couponsTbl').innerHTML = `<div class="empty"><div class="empty-icon">🎟️</div>No coupons created.<br/><br/><button class="btn btn-primary" onclick="openCouponModal()">➕ Add First Coupon</button></div>`;
      return;
    }
    const rows = cps.map(c => `
      <tr>
        <td><b style="color:var(--gold);">${c.code}</b></td>
        <td><b>${c.discount_percent}% OFF</b></td>
        <td><span class="bdg ${c.is_active?'bdg-done':'bdg-canc'}">${c.is_active?'ACTIVE':'INACTIVE'}</span></td>
        <td class="act-cell"><button class="btn btn-danger btn-icon btn-sm" onclick="confDel('coupon',${c.id},${JSON.stringify(c.code)})">🗑️</button></td>
      </tr>`).join('');
    document.getElementById('couponsTbl').innerHTML = `<table><thead><tr><th>Code</th><th>Discount</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`;
  } catch(e) { document.getElementById('couponsTbl').innerHTML = `<div class="empty">Error loading coupons.</div>`; }
}

function openCouponModal() {
  document.getElementById('cpCode').value = '';
  document.getElementById('cpPct').value = '10';
  openM('couponModal');
}

async function saveCoupon() {
  const code = document.getElementById('cpCode').value.trim().toUpperCase();
  const pct  = parseInt(document.getElementById('cpPct').value) || 10;
  if (!code) { toast('❌ Code required!', 'error'); return; }
  try {
    await Coupons.create({ code, discount_percent: pct, is_active: true });
    toast('✅ Coupon created!', 'success');
    closeM('couponModal');
    loadCoupons();
  } catch(e) { toast('❌ Error: ' + e.message, 'error'); }
}

// ─── REVIEWS ─────────────────────────────────────────────────
async function loadReviews() {
  document.getElementById('reviewsTbl').innerHTML = '<div class="loading-ov"><div class="spinner"></div></div>';
  try {
    const rvs = await Reviews.getAll();
    if (!rvs.length) {
      document.getElementById('reviewsTbl').innerHTML = `<div class="empty"><div class="empty-icon">⭐</div>No customer reviews yet.<br/><br/><button class="btn btn-primary" onclick="openReviewModal()">➕ Add Review</button></div>`;
      return;
    }
    const rows = rvs.map(r => `
      <tr>
        <td><b>${r.author_name}</b><div style="font-size:.74rem;color:var(--text3);">${r.location||''}</div></td>
        <td style="color:var(--gold);">${'★'.repeat(r.rating||5)}</td>
        <td style="font-size:.82rem;color:var(--text2);">${r.review_text||''}</td>
        <td class="act-cell"><button class="btn btn-danger btn-icon btn-sm" onclick="confDel('review',${r.id},${JSON.stringify(r.author_name)})">🗑️</button></td>
      </tr>`).join('');
    document.getElementById('reviewsTbl').innerHTML = `<table><thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`;
  } catch(e) { document.getElementById('reviewsTbl').innerHTML = `<div class="empty">Error loading reviews.</div>`; }
}

function openReviewModal() {
  ['rvAuthor','rvLoc','rvTxt'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('rvRating').value = '5';
  openM('reviewModal');
}

async function saveReview() {
  const name = document.getElementById('rvAuthor').value.trim();
  if (!name) { toast('❌ Customer name required!', 'error'); return; }
  try {
    await Reviews.create({
      author_name: name,
      location: document.getElementById('rvLoc').value.trim(),
      rating: parseInt(document.getElementById('rvRating').value) || 5,
      review_text: document.getElementById('rvTxt').value.trim(),
      is_active: true
    });
    toast('✅ Review added!', 'success');
    closeM('reviewModal');
    loadReviews();
  } catch(e) { toast('❌ Error saving review', 'error'); }
}

// ─── EDITOR ──────────────────────────────────────────────────
async function loadEditor() {
  try {
    const s = await SiteSettings.getAll();
    if (s.site_logo_url) { document.getElementById('logoImgUrl').value = s.site_logo_url; document.getElementById('logoUrlIn').value = s.site_logo_url; const img=document.getElementById('logoPre'); img.src=s.site_logo_url; img.style.display='block'; }
    if (s.brand_name)    document.getElementById('brandName').value  = s.brand_name;
    if (s.nav_cta_text)  document.getElementById('navCtaTxt').value = s.nav_cta_text;

    if (s.hero_image_url) { document.getElementById('heroImgUrl').value = s.hero_image_url; document.getElementById('heroUrlIn').value = s.hero_image_url; const img=document.getElementById('heroPre'); img.src=s.hero_image_url; img.style.display='block'; }
    if (s.hero_title)    document.getElementById('heroTitle').value = s.hero_title;
    if (s.hero_subtitle) document.getElementById('heroSub').value   = s.hero_subtitle;
    if (s.hero_cta1)     document.getElementById('heroCta1').value  = s.hero_cta1;
    if (s.hero_cta2)     document.getElementById('heroCta2').value  = s.hero_cta2;
    if (s.stat_1_num)    document.getElementById('s1n').value = s.stat_1_num;
    if (s.stat_1_lbl)    document.getElementById('s1l').value = s.stat_1_lbl;
    if (s.stat_2_num)    document.getElementById('s2n').value = s.stat_2_num;
    if (s.stat_2_lbl)    document.getElementById('s2l').value = s.stat_2_lbl;
    if (s.stat_3_num)    document.getElementById('s3n').value = s.stat_3_num;
    if (s.stat_3_lbl)    document.getElementById('s3l').value = s.stat_3_lbl;

    for (let i = 1; i <= 4; i++) {
      if (s[`usp_${i}_icon`])  document.getElementById(`u${i}i`).value = s[`usp_${i}_icon`];
      if (s[`usp_${i}_title`]) document.getElementById(`u${i}t`).value = s[`usp_${i}_title`];
      if (s[`usp_${i}_desc`])  document.getElementById(`u${i}d`).value = s[`usp_${i}_desc`];
    }

    if (s.promo_title)    document.getElementById('promoTitle').value = s.promo_title;
    if (s.promo_subtitle) document.getElementById('promoSub').value   = s.promo_subtitle;

    document.getElementById('annEn').checked = s.announcement_enabled === 'true';
    if (s.announcement_text)  document.getElementById('annTxt').value  = s.announcement_text;
    if (s.announcement_color) document.getElementById('annCol').value  = s.announcement_color;
    if (s.announcement_link)  document.getElementById('annLink').value = s.announcement_link;
    if (s.whatsapp_number)    document.getElementById('waNum').value  = s.whatsapp_number;
    if (s.footer_about)       document.getElementById('ftAbout').value = s.footer_about;
    if (s.biz_insta)          document.getElementById('bInstaVal').value = s.biz_insta;
    if (s.biz_tagline)        document.getElementById('ftTagline').value = s.biz_tagline;
    updAnnLbl();
  } catch(e) {}
}

function updAnnLbl() { document.getElementById('annLbl').textContent = document.getElementById('annEn').checked ? 'Enabled ✅' : 'Disabled'; }

async function saveHeaderBranding() {
  try {
    await SiteSettings.setMultiple({
      site_logo_url: document.getElementById('logoImgUrl').value.trim() || document.getElementById('logoUrlIn').value.trim(),
      brand_name: document.getElementById('brandName').value.trim(),
      nav_cta_text: document.getElementById('navCtaTxt').value.trim()
    });
    toast('✅ Step 1: Header & Branding Saved!', 'success');
  } catch(e) { toast('❌ Error: ' + e.message, 'error'); }
}

async function saveHero() {
  try {
    await SiteSettings.setMultiple({
      hero_title: document.getElementById('heroTitle').value.trim(),
      hero_subtitle: document.getElementById('heroSub').value.trim(),
      hero_cta1: document.getElementById('heroCta1').value.trim(),
      hero_cta2: document.getElementById('heroCta2').value.trim(),
      hero_image_url: document.getElementById('heroImgUrl').value.trim() || document.getElementById('heroUrlIn').value.trim()
    });
    toast('✅ Step 2: Hero Banner Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

async function saveStats() {
  try {
    await SiteSettings.setMultiple({ stat_1_num:document.getElementById('s1n').value.trim(), stat_1_lbl:document.getElementById('s1l').value.trim(), stat_2_num:document.getElementById('s2n').value.trim(), stat_2_lbl:document.getElementById('s2l').value.trim(), stat_3_num:document.getElementById('s3n').value.trim(), stat_3_lbl:document.getElementById('s3l').value.trim() });
    toast('✅ Step 3: Stats Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

async function saveUSPs() {
  try {
    const data = {};
    for (let i = 1; i <= 4; i++) {
      data[`usp_${i}_icon`]  = document.getElementById(`u${i}i`).value.trim();
      data[`usp_${i}_title`] = document.getElementById(`u${i}t`).value.trim();
      data[`usp_${i}_desc`]  = document.getElementById(`u${i}d`).value.trim();
    }
    await SiteSettings.setMultiple(data);
    toast('✅ Step 4: Feature Cards Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

async function savePromo() {
  try {
    await SiteSettings.setMultiple({
      promo_title: document.getElementById('promoTitle').value.trim(),
      promo_subtitle: document.getElementById('promoSub').value.trim()
    });
    toast('✅ Step 5: Promo Banner Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

async function saveAnn() {
  try {
    await SiteSettings.setMultiple({ announcement_enabled:document.getElementById('annEn').checked?'true':'false', announcement_text:document.getElementById('annTxt').value.trim(), announcement_color:document.getElementById('annCol').value, announcement_link:document.getElementById('annLink').value.trim() });
    toast('✅ Announcement saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

async function saveWAFooter() {
  const n = document.getElementById('waNum').value.trim().replace(/[^\d+]/g, '');
  if (!n) { toast('❌ Valid WhatsApp number required!', 'error'); return; }
  try {
    await SiteSettings.setMultiple({
      whatsapp_number: n,
      footer_about: document.getElementById('ftAbout').value.trim(),
      biz_insta: document.getElementById('bInstaVal').value.trim(),
      biz_tagline: document.getElementById('ftTagline').value.trim()
    });
    toast('✅ Step 7: WhatsApp & Footer Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

function testWA() {
  const n = document.getElementById('waNum').value.trim().replace(/[^\d+]/g, '');
  if (!n) return;
  window.open(`https://wa.me/${n}?text=Test+from+Admin`, '_blank');
}

// ─── SETTINGS ────────────────────────────────────────────────
async function loadSettings() {
  document.getElementById('cfgUrl').value   = getSupabaseUrl();
  document.getElementById('cfgKey').value   = getSupabaseKey();
  document.getElementById('cfgCloud').value  = getCloudName();
  document.getElementById('cfgPreset').value = getUploadPreset();
  document.getElementById('geminiKey').value = localStorage.getItem('cc_gemini_key') || '';
  testConn();
}

function copyFullSql() {
  navigator.clipboard.writeText(document.getElementById('fullSql').textContent)
    .then(() => toast('📋 SQL Script copied!', 'success'))
    .catch(() => toast('Select text manually', 'info'));
}

function saveDbCfg() {
  try {
    localStorage.setItem('cc_cfg_url',    document.getElementById('cfgUrl').value.trim());
    localStorage.setItem('cc_cfg_key',    document.getElementById('cfgKey').value.trim());
    localStorage.setItem('cc_cfg_cloud',  document.getElementById('cfgCloud').value.trim());
    localStorage.setItem('cc_cfg_preset', document.getElementById('cfgPreset').value.trim());
  } catch(e) {}
  cacheClear();
  toast('✅ Database Keys Saved!', 'success');
  setTimeout(loadSettings, 300);
}

async function testConn() {
  const box = document.getElementById('dbConnBox');
  box.className = 'conn-box loading'; box.textContent = 'Testing connection...';
  try {
    await Products.getAll();
    box.className = 'conn-box ok'; box.innerHTML = '<span style="color:var(--green);font-weight:700;">✅ Supabase Store DB Connected!</span>';
  } catch(e) {
    box.className = 'conn-box err'; box.innerHTML = `<span style="color:var(--red);font-weight:700;">❌ Connection Failed</span>`;
  }
}

async function saveBiz() {
  try {
    await SiteSettings.setMultiple({ biz_name:document.getElementById('bName').value.trim(), biz_email:document.getElementById('bEmail').value.trim(), biz_insta:document.getElementById('bInsta').value.trim(), biz_tagline:document.getElementById('bTagline').value.trim() });
    toast('✅ Business Info Saved!', 'success');
  } catch(e) { toast('❌ Error', 'error'); }
}

function saveAIKey() {
  const k = document.getElementById('geminiKey').value.trim();
  if (k) localStorage.setItem('cc_gemini_key', k);
  else localStorage.removeItem('cc_gemini_key');
  toast('✅ AI Key Saved!', 'success');
}

function changePw() {
  const np = document.getElementById('newPw').value.trim();
  const cp = document.getElementById('confPw').value.trim();
  if (np && np === cp && np.length >= 6) {
    try { localStorage.setItem('cc_admin_pass', np); } catch(e) { toast('❌ Cookies disabled', 'error'); return; }
    toast('✅ Password updated!', 'success');
  } else { toast('❌ Passwords mismatch or too short', 'error'); }
}

// ─── UPLOADS ─────────────────────────────────────────────────
function onDrag(e, id)  { e.preventDefault(); document.getElementById(id).classList.add('drag'); }
function offDrag(id)    { document.getElementById(id).classList.remove('drag'); }
function onDropProd(e)  { e.preventDefault(); offDrag('pUA'); const f=e.dataTransfer.files[0]; if(f) prodUpload(f); }
function onDropHero(e)  { e.preventDefault(); offDrag('heroUA'); const f=e.dataTransfer.files[0]; if(f) heroUpload(f); }
function onDropLogo(e)  { e.preventDefault(); offDrag('logoUA'); const f=e.dataTransfer.files[0]; if(f) logoUpload(f); }
function onDropCat(e)   { e.preventDefault(); offDrag('cUA'); const f=e.dataTransfer.files[0]; if(f) catUpload(f); }
function toggleEl(id)   { const el=document.getElementById(id); el.style.display = el.style.display==='none'?'block':'none'; }
function previewProdUrl(url) { document.getElementById('pImgUrl').value = url; const img=document.getElementById('pPre'); img.src=url; img.style.display=url?'block':'none'; }
function previewHeroUrl(url) { document.getElementById('heroImgUrl').value = url; const img=document.getElementById('heroPre'); img.src=url; img.style.display=url?'block':'none'; }
function previewLogoUrl(url) { document.getElementById('logoImgUrl').value = url; const img=document.getElementById('logoPre'); img.src=url; img.style.display=url?'block':'none'; }
function previewCatUrl(url) { document.getElementById('cmEmoji').value = url; const img=document.getElementById('cPre'); img.src=url; img.style.display=url?'block':'none'; }

async function catUpload(file) {
  if (!file) return;
  const preview = document.getElementById('cPre');
  const fr = new FileReader(); fr.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; }; fr.readAsDataURL(file);
  document.getElementById('cPW').style.display = 'block';
  try {
    const url = await uploadImage(file, pct => { document.getElementById('cPB').style.width = pct + '%'; });
    document.getElementById('cmEmoji').value = url;
    document.getElementById('cPW').style.display = 'none';
    toast('✅ Image uploaded!', 'success');
  } catch(e) { toast('❌ Upload failed', 'error'); }
}

async function prodUpload(file) {
  if (!file) return;
  const preview = document.getElementById('pPre');
  const fr = new FileReader(); fr.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; }; fr.readAsDataURL(file);
  document.getElementById('pPW').style.display = 'block';
  try {
    const url = await uploadImage(file, pct => { document.getElementById('pPB').style.width = pct + '%'; });
    document.getElementById('pImgUrl').value = url;
    document.getElementById('pPW').style.display = 'none';
    toast('✅ Image uploaded!', 'success');
  } catch(e) { toast('❌ Upload failed', 'error'); }
}

async function heroUpload(file) {
  if (!file) return;
  const preview = document.getElementById('heroPre');
  const fr = new FileReader(); fr.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; }; fr.readAsDataURL(file);
  document.getElementById('heroPW').style.display = 'block';
  try {
    const url = await uploadImage(file, pct => { document.getElementById('heroPB').style.width = pct + '%'; });
    document.getElementById('heroImgUrl').value = url;
    document.getElementById('heroPW').style.display = 'none';
    toast('✅ Hero image uploaded!', 'success');
  } catch(e) { toast('❌ Upload failed', 'error'); }
}

async function logoUpload(file) {
  if (!file) return;
  const preview = document.getElementById('logoPre');
  const fr = new FileReader(); fr.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; }; fr.readAsDataURL(file);
  document.getElementById('logoPW').style.display = 'block';
  try {
    const url = await uploadImage(file, pct => { document.getElementById('logoPB').style.width = pct + '%'; });
    document.getElementById('logoImgUrl').value = url;
    document.getElementById('logoPW').style.display = 'none';
    toast('✅ Logo uploaded!', 'success');
  } catch(e) { toast('❌ Upload failed', 'error'); }
}

// ─── CONFIRM DELETE ──────────────────────────────────────────
function confDel(type, id, name) {
  document.getElementById('confMsg').innerHTML = `Delete <b>"${name}"</b>?`;
  document.getElementById('confDelBtn').onclick = async () => {
    try {
      if (type === 'product')  await Products.delete(id);
      if (type === 'category') await Categories.delete(id);
      if (type === 'order')    await Orders.delete(id);
      if (type === 'coupon')   await Coupons.delete(id);
      if (type === 'review')   await Reviews.delete(id);
      toast('🗑️ Deleted!', 'success');
      closeM('confModal');
      if (type === 'product')  loadProds();
      if (type === 'category') loadCats();
      if (type === 'order')    loadOrders();
      if (type === 'coupon')   loadCoupons();
      if (type === 'review')   loadReviews();
      loadDash();
    } catch(e) { toast('❌ Error deleting', 'error'); }
  };
  openM('confModal');
}

// ─── MODALS & TOAST ──────────────────────────────────────────
function openM(id)  { document.getElementById(id).classList.add('open'); }
function closeM(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-bd').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toastWrap').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

async function autoGenerateAI(btn) {
  const key = localStorage.getItem('cc_gemini_key');
  if (!key) {
    toast('❌ Please add your Gemini API Key in AI Settings first!', 'error');
    const aiBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('AI Settings'));
    showStTab('ai', aiBtn);
    const setBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('Settings'));
    showTab('settings', setBtn);
    return;
  }
  const name = document.getElementById('pName').value.trim();
  if (!name) { toast('❌ Please enter Product Name first', 'error'); return; }
  
  const originalTxt = btn.innerHTML;
  btn.innerHTML = '⏳ Generating...';
  btn.disabled = true;
  
  try {
    const prompt = `You are an expert e-commerce copywriter and SEO specialist. Write a highly engaging, SEO-optimized product description (2-3 sentences max) for a product named "${name}". Use relevant search keywords naturally (like custom, personalized, buy online, etc.). Also generate a polite, engaging predefined WhatsApp order message for this product. Return ONLY a valid JSON object in this exact format: {"description": "...", "wa_message": "..."}. Do not wrap in markdown blocks, just the raw JSON text.`;
    
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const jsonStr = rawText.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const result = JSON.parse(jsonStr);
    
    document.getElementById('pDesc').value = result.description || '';
    document.getElementById('pWA').value = result.wa_message || '';
    toast('✨ AI Generation Complete!', 'success');
  } catch (e) {
    console.error(e);
    toast('❌ AI Generation failed. Check API Key.', 'error');
  } finally {
    btn.innerHTML = originalTxt;
    btn.disabled = false;
  }
}

