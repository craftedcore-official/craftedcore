// ===== CraftedCore - Main JavaScript =====

// ===== Image Protection (Anti-Download) =====
(function() {
  // Block right-click on images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.product-image-wrap, .prod-img-wrap, .hero-image-wrap')) {
      e.preventDefault();
      return false;
    }
  });

  // Block drag on images
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // Block Ctrl+S (save page) and Ctrl+U (view source) on product pages
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  });

  // Block long-press on mobile (prevents "Save Image" popup)
  let longPressTimer;
  document.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.product-image-wrap, .prod-img-wrap')) {
      longPressTimer = setTimeout(function() {
        e.preventDefault();
      }, 500);
    }
  }, { passive: false });

  document.addEventListener('touchend', function() {
    clearTimeout(longPressTimer);
  });

  document.addEventListener('touchmove', function() {
    clearTimeout(longPressTimer);
  });
})();

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ===== Mobile Menu Toggle =====
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navLinks) return;

  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');

  // Lock body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';

  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
}

function closeMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (navLinks) navLinks.classList.remove('open');
  document.body.style.overflow = '';
  if (hamburger) {
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
}

// Close menu when clicking a link inside it
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
});

// ===== Scroll Animations =====
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

// ===== Product Filter (with Sub-categories) =====
function filterProducts(category) {
  const cards = document.querySelectorAll('.product-card[data-category]');
  const buttons = document.querySelectorAll('#filterTabs .filter-btn');

  // Update active button
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === category) {
      btn.classList.add('active');
    }
  });

  let uniqueTags = new Set();

  // Filter cards
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.4s ease forwards';
      card.dataset.visible = 'true';
      // Extract tags
      const tags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(t => t);
      tags.forEach(t => { if (t) uniqueTags.add(t); });
    } else {
      card.style.display = 'none';
      card.dataset.visible = 'false';
    }
  });

  // Render Sub-filters (Tags)
  let subFilterCont = document.getElementById('subFilterTabs');
  if (!subFilterCont) {
    subFilterCont = document.createElement('div');
    subFilterCont.id = 'subFilterTabs';
    subFilterCont.className = 'filter-tabs sub-filter-tabs';
    subFilterCont.style.marginTop = '1rem';
    const mainTabs = document.getElementById('filterTabs');
    if (mainTabs) mainTabs.parentNode.insertBefore(subFilterCont, mainTabs.nextSibling);
  }

  if (uniqueTags.size > 0 && category !== 'all') {
    let subHtml = `<button class="filter-btn active" data-subfilter="all" onclick="filterSubProducts('all')">🌟 All in this category</button>`;
    Array.from(uniqueTags).forEach(tag => {
      // capitalize first letter
      const capTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      subHtml += `<button class="filter-btn" data-subfilter="${tag}" onclick="filterSubProducts('${tag}')">✨ ${capTag}</button>`;
    });
    subFilterCont.innerHTML = subHtml;
    subFilterCont.style.display = 'flex';
  } else {
    if (subFilterCont) {
      subFilterCont.style.display = 'none';
      subFilterCont.innerHTML = '';
    }
  }

  // Scroll to product grid
  const grid = document.getElementById('productGrid') || document.getElementById('all-products');
  if (grid) {
    setTimeout(() => {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function filterSubProducts(tag) {
  const cards = document.querySelectorAll('.product-card[data-visible="true"]');
  const subBtns = document.querySelectorAll('#subFilterTabs .filter-btn');

  subBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.subfilter === tag) btn.classList.add('active');
  });

  cards.forEach(card => {
    if (tag === 'all') {
      card.style.display = 'block';
      card.style.animation = 'none'; // reset
      setTimeout(() => card.style.animation = 'fadeInUp 0.4s ease forwards', 10);
    } else {
      const pTags = (card.dataset.tags || '').split(',').map(t => t.trim().toLowerCase());
      if (pTags.includes(tag.toLowerCase())) {
        card.style.display = 'block';
        card.style.animation = 'none';
        setTimeout(() => card.style.animation = 'fadeInUp 0.4s ease forwards', 10);
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// ===== Typing Effect for Hero =====
function initTypingEffect() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  // Add initial animation
  heroTitle.style.opacity = '0';
  heroTitle.style.transform = 'translateY(20px)';
  setTimeout(() => {
    heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    heroTitle.style.opacity = '1';
    heroTitle.style.transform = 'translateY(0)';
  }, 300);
}

// ===== Counter Animation for Stats =====
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target + (el.dataset.suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    }
  }, 16);
}

function initCounters() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        el.dataset.suffix = suffix;
        // Slow down the counter to 3000ms (3 seconds) instead of 1500ms
        animateCounter(el, number, 3500);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
}

// ===== Smooth Hover on Product Cards =====
function initProductCardEffects() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
    });
    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '';
    });
  });
}

// ===== Gold Particle Effect on Hero =====
function createGoldParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const colors = ['rgba(212, 175, 55,', 'rgba(200, 138, 88,', 'rgba(170, 135, 41,'];

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${color} ${Math.random() * 0.5 + 0.3});
      box-shadow: 0 0 10px ${color} 0.8);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 4 + 3}s ease-in-out infinite;
      animation-delay: ${Math.random() * 3}s;
      pointer-events: none;
      z-index: 0;
    `;
    hero.appendChild(particle);
  }
}

// ===== WhatsApp Button Pulse =====
function initWhatsAppPulse() {
  const waBtns = document.querySelectorAll('.btn-whatsapp');
  waBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ===== Dynamic Database Integration =====
async function loadDynamicProducts() {
  if (typeof Products === 'undefined') return;
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  try {
    const products = await Products.getAll();
    if (!products || !products.length) return; // keep static fallback if DB empty
    const html = products.map(p => productCardHTML(p)).join('');
    productGrid.innerHTML = html;
    initProductCardEffects();
    injectSEOData(products);
    
    // Re-apply filter after dynamic load so sub-categories show up correctly
    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const cat = urlParams.get('category');
      const currentActive = document.querySelector('#filterTabs .filter-btn.active');
      const activeFilter = cat || (currentActive ? currentActive.dataset.filter : 'all');
      if (typeof filterProducts === 'function') filterProducts(activeFilter);
    }, 100);
    
  } catch (e) {
    console.log('Using static fallback products');
  }
}

function injectSEOData(products) {
  const schemaList = products.map(p => ({
    "@type": "Product",
    "name": p.name,
    "image": p.image_url ? p.image_url.split(',')[0] : "https://craftedcore-official.github.io/craftedcore/images/logo.png",
    "description": p.description || p.name,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": p.price,
      "availability": "https://schema.org/InStock"
    }
  }));

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": schemaList.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": s
    }))
  });
  document.head.appendChild(script);
}

async function loadDynamicFeatured() {
  if (typeof Products === 'undefined') return;
  const featuredGrid = document.querySelector('#featured .product-grid');
  if (!featuredGrid) return;

  try {
    const products = await Products.getFeatured();
    if (!products || !products.length) return; // keep static fallback if DB empty
    const html = products.map(p => productCardHTML(p)).join('');
    featuredGrid.innerHTML = html;
    initProductCardEffects();
  } catch (e) {
    console.log('Using static fallback featured');
  }
}

async function loadDynamicCategories() {
  if (typeof Categories === 'undefined') return;
  try {
    const cats = await Categories.getAll();
    if (!cats || !cats.length) return;

    const filterTabs = document.getElementById('filterTabs');
    if (filterTabs) {
      let scs = [];
      try {
        const s = await SiteSettings.get('cc_subcats_list');
        if (s) scs = JSON.parse(s);
      } catch(e) {}
      
      const html = `<a href="products.html" class="filter-btn active">All</a>` 
        + cats.map(c => {
            let icon = c.emoji || '📦';
            if (icon.startsWith('http')) {
              icon = `<img src="${icon}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:middle;display:inline-block;" />`;
            }
            return `<a href="category.html?slug=${c.slug}" class="filter-btn">${icon} ${c.name}</a>`;
          }).join('')
        + scs.map(c => `<a href="category.html?slug=${c.slug}" class="filter-btn">🏷️ ${c.name}</a>`).join('');
      filterTabs.innerHTML = html;
    }

    const catSlider = document.getElementById('categorySlider');
    if (catSlider) {
      let html = cats.map(c => `
        <a href="category.html?slug=${c.slug}" class="cat-circle-card fade-in">
          <div class="cat-circle-img">
            ${(c.emoji && c.emoji.startsWith('http')) 
              ? `<img src="${c.emoji}" alt="${c.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;\\'>📦</div>'" />` 
              : `<div style="background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;">${c.emoji||'📦'}</div>`}
          </div>
          <div class="cat-circle-name">${c.name}</div>
        </a>`).join('');
      
      html += `
        <a href="products.html" class="cat-circle-card fade-in">
          <div class="cat-circle-img" style="background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:1px solid var(--gold);box-shadow: 0 0 20px rgba(212,175,55,0.2);">✨</div>
          <div class="cat-circle-name">View All</div>
        </a>`;
      catSlider.innerHTML = html;
      
      // Auto-slide functionality
      const sliderWrapper = catSlider.parentElement;
      if (sliderWrapper) {
        let slideInterval;
        
        const startAutoSlide = () => {
          if (slideInterval) clearInterval(slideInterval);
          slideInterval = setInterval(() => {
            const maxScroll = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;
            if (sliderWrapper.scrollLeft >= maxScroll - 5 && maxScroll > 0) {
               // smoothly scroll back to start if at the end
               sliderWrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (maxScroll > 0) {
               sliderWrapper.scrollLeft += 1;
            }
          }, 30); // Speed of auto scroll
        };

        const stopAutoSlide = () => clearInterval(slideInterval);

        // Wait a little for images to load, then start
        setTimeout(startAutoSlide, 1500);

        // Stop on touch/hover
        sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
        sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        sliderWrapper.addEventListener('touchstart', stopAutoSlide, { passive: true });
        sliderWrapper.addEventListener('touchend', startAutoSlide, { passive: true });
      }
    }
  } catch(e) { console.log('Static fallback categories'); }
}

async function loadDynamicReviews() {
  if (typeof Reviews === 'undefined') return;
  const reviewGrid = document.querySelector('.testimonial-grid');
  if (!reviewGrid) return;
  try {
    const rvs = await Reviews.getAll();
    if (!rvs || !rvs.length) return;
    const activeRvs = rvs.filter(r => r.is_active);
    if (!activeRvs.length) return;

    const html = activeRvs.map(r => `
        <div class="testimonial-card">
          <div class="stars">${'★'.repeat(r.rating||5)}</div>
          <p class="testimonial-text">"${r.review_text}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${r.author_name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="author-name">${r.author_name}</div>
              <div class="author-location">${r.location||''}</div>
            </div>
          </div>
        </div>`).join('');
    reviewGrid.innerHTML = html;
  } catch(e) {}
}

// ===== Delivery Zones (Pincode-based) =====
const DELIVERY_ZONES = [
  { label: 'Gujarat', prefixes: ['36','37','38','39'], charge: 40, days: 2 },
  { label: 'Rajasthan', prefixes: ['30','31','32','33','34'], charge: 80, days: 4 },
  { label: 'Madhya Pradesh', prefixes: ['45','46','47','48'], charge: 80, days: 4 },
  { label: 'Maharashtra', prefixes: ['40','41','42','43','44'], charge: 80, days: 4 },
];
const DEFAULT_DELIVERY = { label: 'Rest of India', charge: 120, days: 7 };
const UPI_ID = '8320979383@ibl';
const UPI_NAME = 'CraftedCore';

function getDeliveryInfo(pincode) {
  const prefix = (pincode || '').trim().substring(0, 2);
  if (!prefix || prefix.length < 2 || !/^\d{6}$/.test((pincode||'').trim())) return null;
  for (const zone of DELIVERY_ZONES) {
    if (zone.prefixes.includes(prefix)) return zone;
  }
  return DEFAULT_DELIVERY;
}

// Store current draft order info
let currentDraftOrderId = null;
let currentDraftWaMsg = '';
let currentDraftDelivery = null;

// ===== Shopping Cart Logic =====
let shoppingCart = JSON.parse(localStorage.getItem('cc_cart')) || [];

function saveCart() {
  localStorage.setItem('cc_cart', JSON.stringify(shoppingCart));
  updateCartUI();
}

let currentQVProduct = null;

async function openQuickView(id) {
  if (typeof Products === 'undefined') return;
  const prods = await Products.getAll();
  const p = prods.find(x => x.id === id);
  if (!p) return;
  
  currentQVProduct = p;
  document.getElementById('qvTitle').textContent = p.category_name || 'Options';
  document.getElementById('qvImg').src = p.image_url ? p.image_url.split(',')[0] : 'images/product_mug.jpg';
  document.getElementById('qvName').textContent = p.name;
  document.getElementById('qvDesc').textContent = p.description || '';
  document.getElementById('qvPrice').textContent = `₹${p.price}`;
  
  const colorWrap = document.getElementById('qvColorWrap');
  const colorsDiv = document.getElementById('qvColors');
  colorsDiv.innerHTML = '';
  if (p.colors && p.colors.trim() !== '') {
    const colors = p.colors.split(',').map(c => c.trim()).filter(c => c);
    if (colors.length > 0) {
      colors.forEach((c, i) => {
        colorsDiv.innerHTML += `<button class="color-btn ${i===0?'active':''}" onclick="selColor(this)">${c}</button>`;
      });
      colorWrap.style.display = 'block';
    } else colorWrap.style.display = 'none';
  } else {
    colorWrap.style.display = 'none';
  }

  const custWrap = document.getElementById('qvCustWrap');
  const custsDiv = document.getElementById('qvCusts');
  custsDiv.innerHTML = '';
  let hasCust = false;
  if (p.customizations) {
    try {
      let opts = [];
      const c = JSON.parse(p.customizations);
      if (c.options) opts = opts.concat(c.options.split(',').map(x=>x.trim()).filter(x=>x));
      if (c.name_engrave) opts.push('Name Engrave');
      if (c.photo_engrave) opts.push('Photo Engrave');
      if (c.uvdtf_name) opts.push('UVDTF Name');
      if (c.uvdtf_photo) opts.push('UVDTF Photo');
      
      window.qvBasePrice = parseFloat(p.price) || 0;
      if (opts.length > 0) {
        hasCust = true;
        opts.forEach(o => {
          let extra = 0;
          const match = o.match(/\(\+\s*(\d+(\.\d+)?)\)/);
          if (match) extra = parseFloat(match[1]);
          custsDiv.innerHTML += `<label class="cust-label"><input type="checkbox" value="${o}" data-price="${extra}" onchange="updateQvPrice()" /> ${o}</label>`;
        });
      }
    } catch(e) {}
  }
  custWrap.style.display = hasCust ? 'block' : 'none';

  document.getElementById('qvBtn').onclick = () => confirmAddToCart();
  document.getElementById('qvModal').classList.add('open');
}

function updateQvPrice() {
  let total = window.qvBasePrice || 0;
  document.querySelectorAll('#qvCusts input:checked').forEach(cb => {
    total += parseFloat(cb.getAttribute('data-price')) || 0;
  });
  document.getElementById('qvPrice').textContent = `₹${total}`;
}

function selColor(btn) {
  document.querySelectorAll('#qvColors .color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  const c = btn.textContent;
  if (currentQVProduct) {
    let cust = {};
    try { if (currentQVProduct.customizations) cust = JSON.parse(currentQVProduct.customizations); } catch(e){}
    const cmap = cust.image_colors || {};
    let urls = currentQVProduct.image_url ? currentQVProduct.image_url.split(',').map(u=>u.trim()).filter(u=>u) : [];
    for (let i = 0; i < urls.length; i++) {
      if (cmap[urls[i]] === c) {
        document.getElementById('qvImg').src = urls[i];
        break;
      }
    }
  }
}

function closeQV() {
  document.getElementById('qvModal').classList.remove('open');
}

function confirmAddToCart() {
  if (!currentQVProduct) return;
  const p = currentQVProduct;
  
  let color = '';
  const activeColor = document.querySelector('#qvColors .color-btn.active');
  if (activeColor) color = activeColor.textContent;
  
  let custs = [];
  let extraPrice = 0;
  document.querySelectorAll('#qvCusts input:checked').forEach(cb => {
    custs.push(cb.value);
    extraPrice += parseFloat(cb.getAttribute('data-price')) || 0;
  });
  
  const finalPrice = (parseFloat(p.price) || 0) + extraPrice;
  
  let custObj = {};
  try { if (p.customizations) custObj = JSON.parse(p.customizations); } catch(e){}
  const cmap = custObj.image_colors || {};
  let urls = p.image_url ? p.image_url.split(',').map(u=>u.trim()).filter(u=>u) : [];
  let cartImg = urls.length > 0 ? urls[0] : '';
  if (color) {
    for (let i = 0; i < urls.length; i++) {
      if (cmap[urls[i]] === color) {
        cartImg = urls[i];
        break;
      }
    }
  }
  
  const cartItemId = `${p.id}-${color}-${custs.join('-')}`;
  const existing = shoppingCart.find(item => item.cartItemId === cartItemId);
  if (existing) {
    existing.qty += 1;
  } else {
    shoppingCart.push({ 
      id: p.id, 
      cartItemId,
      name: p.name, 
      price: finalPrice, 
      img: cartImg, 
      qty: 1,
      color,
      custs
    });
  }
  saveCart();
  closeQV();
  showToast('🛒 Added to Cart!');
}

function removeFromCart(index) {
  shoppingCart.splice(index, 1);
  saveCart();
}

function changeQty(index, delta) {
  if (shoppingCart[index]) {
    shoppingCart[index].qty += delta;
    if (shoppingCart[index].qty <= 0) {
      shoppingCart.splice(index, 1);
    }
    saveCart();
  }
}

function toggleCartDrawer(show) {
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (!overlay || !drawer) return;
  
  if (show) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    updateCartUI();
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const body = document.getElementById('cartBody');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  
  if (!badge || !body) return;
  
  const totalItems = shoppingCart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';
  
  if (shoppingCart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty.</p>
        <button class="btn btn-primary" style="margin-top:1rem;" onclick="toggleCartDrawer(false)">Continue Shopping</button>
      </div>`;
    if (totalEl) totalEl.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }
  
  if (checkoutBtn) checkoutBtn.disabled = false;
  
  let html = '';
  let total = 0;
  
  shoppingCart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    
    let optionsHtml = '';
    if (item.size) optionsHtml += `<div style="font-size:0.8rem;color:var(--copper-light);">Size: ${item.size}</div>`;
    if (item.color) optionsHtml += `<div style="font-size:0.8rem;color:var(--gold);">Color: ${item.color}</div>`;
    if (item.custs && item.custs.length > 0) optionsHtml += `<div style="font-size:0.8rem;color:var(--text2);">${item.custs.join(', ')}</div>`;

    html += `
      <div class="cart-item">
        <img src="${item.img || 'images/product_mug.jpg'}" class="cart-item-img" alt="${item.name}" />
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          ${optionsHtml}
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-actions">
            <div class="qty-ctrl">
              <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
              <div class="qty-val">${item.qty}</div>
              <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
          </div>
        </div>
      </div>
    `;
  });
  
  body.innerHTML = html;
  if (totalEl) totalEl.textContent = '₹' + total;
}

function showToast(msg) {
  let toast = document.getElementById('ccToast');
  if (!toast) {
    document.body.insertAdjacentHTML('beforeend', `<div id="ccToast" class="toast"></div>`);
    toast = document.getElementById('ccToast');
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function injectCartUI() {
  const html = `
  <!-- Floating Cart Button -->
  <div class="cart-float-btn" onclick="toggleCartDrawer(true)">
    🛒
    <div class="cart-badge" id="cartBadge" style="display:none;">0</div>
  </div>

  <!-- Cart Drawer -->
  <div class="cart-drawer-overlay" id="cartOverlay" onclick="if(event.target===this) toggleCartDrawer(false)"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="close-cart-btn" onclick="toggleCartDrawer(false)">&times;</button>
    </div>
    <div class="cart-body" id="cartBody"></div>
    <div class="cart-footer">
      <div class="cart-total-row">
        <span>Total:</span>
        <span id="cartTotal" style="color:var(--gold);">₹0</span>
      </div>
      <button class="btn btn-primary checkout-btn" id="cartCheckoutBtn" onclick="openCheckoutFromCart()">Proceed to Checkout</button>
    </div>
  </div>

  <!-- Checkout Modal -->
  <div class="modal-bd" id="frontOrderModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; padding:1rem; overflow-y:auto;">
    <div class="modal" style="background:var(--bg-secondary); border:1px solid rgba(212,175,55,0.3); border-radius:12px; width:100%; max-width:600px; padding:2rem; position:relative; box-shadow:0 15px 50px rgba(0,0,0,0.7); margin:auto;">
      <button onclick="document.getElementById('frontOrderModal').style.display='none'" style="position:absolute; top:1.2rem; right:1.5rem; background:none; border:none; color:#aaa; font-size:1.8rem; cursor:pointer; transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#aaa'">&times;</button>
      <h2 style="margin-bottom:1.5rem; color:var(--gold); font-size:1.6rem; text-align:center; font-weight:600;">Checkout Details</h2>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Full Name *</label>
          <input type="text" id="foName" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="John Doe" />
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">WhatsApp Number *</label>
          <input type="text" id="foPhone" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="+91 0000000000" />
        </div>
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Email Address *</label>
        <input type="email" id="foEmail" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="johndoe@example.com" />
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Delivery Address *</label>
        <textarea id="foAddress" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; min-height:80px; resize:vertical; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="House No, Street, Landmark, City, State"></textarea>
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Pincode *</label>
        <input type="text" id="foPincode" maxlength="6" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="e.g. 380001" oninput="updateDeliveryPreview()" />
      </div>

      <!-- Delivery Info Preview -->
      <div id="foDeliveryPreview" style="display:none; margin-bottom:1.5rem; background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:1rem 1.2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="color:var(--text2); font-size:0.9rem;">📍 <span id="foDeliveryZone">—</span></span>
          <span style="color:var(--gold); font-weight:700; font-size:0.95rem;">🚚 <span id="foDeliveryDays">—</span></span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--text2); font-size:0.9rem;">Delivery Charge:</span>
          <span style="color:white; font-weight:700;">₹<span id="foDeliveryCharge">0</span></span>
        </div>
        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:0.7rem 0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:white; font-weight:700; font-size:1.05rem;">Grand Total:</span>
          <span style="color:var(--gold); font-weight:800; font-size:1.15rem;">₹<span id="foGrandTotal">0</span></span>
        </div>
      </div>
      
      <div style="margin-bottom:1.5rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Customization Notes (Optional)</label>
        <textarea id="foNotes" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; min-height:60px; resize:vertical; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="Any special instructions..."></textarea>
      </div>
      
      <button onclick="submitCartCheckout()" class="btn btn-primary" style="width:100%; justify-content:center; padding:1rem; font-size:1.1rem; font-weight:bold; letter-spacing:0.5px; border-radius:8px;" id="foSubmitBtn">💳 Proceed to Payment</button>
      <div id="foError" style="color:#ff5555; font-size:0.9rem; margin-top:1rem; text-align:center; display:none; font-weight:500;"></div>
    </div>
  </div>

  <!-- UPI Payment Modal -->
  <div class="modal-bd" id="upiPayModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:10000; align-items:center; justify-content:center; padding:1rem; overflow-y:auto;">
    <div class="modal" style="background:var(--bg-secondary); border:1px solid rgba(212,175,55,0.3); border-radius:16px; width:100%; max-width:440px; padding:2rem; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.8); margin:auto; text-align:center;">
      <button onclick="closeUpiModal()" style="position:absolute; top:1rem; right:1.2rem; background:none; border:none; color:#aaa; font-size:1.8rem; cursor:pointer;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#aaa'">&times;</button>
      
      <div style="font-size:1.5rem; margin-bottom:0.3rem;">💳</div>
      <h2 style="color:var(--gold); font-size:1.4rem; font-weight:700; margin-bottom:0.3rem;">Complete Payment</h2>
      <p style="color:var(--text2); font-size:0.85rem; margin-bottom:1.5rem;">Order <span id="upiOrderId" style="color:var(--gold);">#—</span></p>
      
      <!-- Amount Display -->
      <div style="background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:1.2rem; margin-bottom:1.5rem;">
        <div id="upiAmountBreakdown" style="font-size:0.85rem; color:var(--text2); margin-bottom:0.5rem;"></div>
        <div style="font-size:2rem; font-weight:900; color:var(--gold);">₹<span id="upiAmount">0</span></div>
        <div style="font-size:0.8rem; color:var(--text3); margin-top:0.3rem;">Total Amount to Pay</div>
      </div>

      <!-- UPI Pay Button (Mobile deep link) -->
      <a id="upiDeepLink" href="#" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:0.6rem; width:100%; padding:1rem; background:linear-gradient(135deg, #5F259F, #7B42B8); color:white; font-size:1.05rem; font-weight:700; border-radius:10px; text-decoration:none; margin-bottom:0.8rem; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        📱 Pay with PhonePe / GPay / UPI
      </a>

      <!-- QR Code for Desktop -->
      <div style="margin-bottom:1rem;">
        <p style="font-size:0.8rem; color:var(--text3); margin-bottom:0.8rem;">Or scan this QR code with any UPI app</p>
        <img id="upiQrImg" src="" alt="UPI QR Code" style="width:200px; height:200px; border-radius:10px; background:white; padding:8px; object-fit:contain;" />
      </div>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:1rem 0;">

      <p style="color:var(--text2); font-size:0.85rem; margin-bottom:1rem;">✅ After payment, take a <strong style="color:white;">screenshot</strong> and send it on WhatsApp to confirm your order.</p>
      
      <button id="upiWaSendBtn" onclick="confirmOrderViaWhatsApp()" class="btn btn-whatsapp" style="width:100%; justify-content:center; font-size:1rem; padding:0.9rem; border-radius:10px;">📸 Send Screenshot on WhatsApp</button>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  updateCartUI();
}

// Delivery preview updater (called on pincode input)
function updateDeliveryPreview() {
  const pincode = document.getElementById('foPincode').value.trim();
  const preview = document.getElementById('foDeliveryPreview');
  const info = getDeliveryInfo(pincode);
  
  if (!info) {
    preview.style.display = 'none';
    return;
  }
  
  const itemsTotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const grandTotal = itemsTotal + info.charge;
  
  document.getElementById('foDeliveryZone').textContent = info.label;
  document.getElementById('foDeliveryDays').textContent = `${info.days} days`;
  document.getElementById('foDeliveryCharge').textContent = info.charge;
  document.getElementById('foGrandTotal').textContent = grandTotal;
  preview.style.display = 'block';
}

function openCheckoutFromCart() {
  if (shoppingCart.length === 0) return;
  toggleCartDrawer(false);
  
  document.getElementById('foName').value = '';
  document.getElementById('foPhone').value = '';
  document.getElementById('foEmail').value = '';
  document.getElementById('foAddress').value = '';
  document.getElementById('foPincode').value = '';
  document.getElementById('foNotes').value = '';
  document.getElementById('foError').style.display = 'none';
  
  const m = document.getElementById('frontOrderModal');
  m.style.display = 'flex';
  m.style.opacity = '0';
  setTimeout(() => { m.style.transition='opacity 0.2s'; m.style.opacity='1'; }, 10);
}

async function submitCartCheckout() {
  if (shoppingCart.length === 0) return;
  
  const name = document.getElementById('foName').value.trim();
  const phone = document.getElementById('foPhone').value.trim();
  const email = document.getElementById('foEmail').value.trim();
  const address = document.getElementById('foAddress').value.trim();
  const pincode = document.getElementById('foPincode').value.trim();
  const notes = document.getElementById('foNotes').value.trim();
  const err = document.getElementById('foError');
  const btn = document.getElementById('foSubmitBtn');
  
  if (!name || !phone || !email || !address || !pincode) {
    err.textContent = 'Please fill in all the required details (Name, Phone, Email, Address, Pincode).';
    err.style.display = 'block';
    return;
  }
  
  if (!/^\d{6}$/.test(pincode)) {
    err.textContent = 'Please enter a valid 6-digit pincode.';
    err.style.display = 'block';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  const itemsTotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryInfo = getDeliveryInfo(pincode) || DEFAULT_DELIVERY;
  const grandTotal = itemsTotal + deliveryInfo.charge;
  const combinedProductName = shoppingCart.map(item => `${item.name} (x${item.qty})`).join(', ');
  
  // Combine all details into the DB notes field
  const dbNotes = `Email: ${email}\nPincode: ${pincode}\nAddress: ${address}\nDelivery Zone: ${deliveryInfo.label}\nDelivery Charge: ₹${deliveryInfo.charge}\nEstimated: ${deliveryInfo.days} days\nNotes: ${notes}`;
  
  try {
    // Save order as DRAFT — will become 'pending' only after WhatsApp confirmation
    const res = await Orders.create({
      customer_name: name,
      customer_phone: phone,
      product_name: combinedProductName,
      amount: grandTotal,
      status: 'draft',
      notes: dbNotes
    });
    
    const orderId = (res && res.length > 0) ? res[0].id : 'NEW';
    currentDraftOrderId = orderId;
    currentDraftDelivery = deliveryInfo;
    
    // Build WhatsApp message (stored for later when user confirms)
    const E_WAVE = decodeURIComponent("%F0%9F%91%8B");
    const E_BOX = decodeURIComponent("%F0%9F%93%A6");
    const E_ID = decodeURIComponent("%F0%9F%86%94");
    const E_BAG = decodeURIComponent("%F0%9F%9B%8D%EF%B8%8F");
    const waNum = ((window._siteSettings || {}).whatsapp_number || '918320979383').replace(/\D/g, '');
    let msg = `Hi Crafted Core! ${E_WAVE}\n\nA new order has been placed + payment screenshot attached.\n\n${E_BOX} *ORDER DETAILS*\n━━━━━━━━━━━━━━━━━━\n${E_ID} *Order ID:* #${orderId}\n\n${E_BAG} *Items*\n`;
    shoppingCart.forEach(item => {
      msg += `• ${item.qty} × ${item.name}\n`;
      if (item.size) msg += `  Size: ${item.size}\n`;
      if (item.color) msg += `  Color: ${item.color}\n`;
      if (item.custs && item.custs.length > 0) msg += `  Cust: ${item.custs.join(', ')}\n`;
      const siteBase = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
      const E_LINK = decodeURIComponent("%F0%9F%94%97");
      msg += `  ${E_LINK} Product: ${siteBase}product.html?id=${item.id}\n`;
      msg += `  Item Total: ₹${item.price * item.qty}\n\n`;
    });
    
    const E_USER = decodeURIComponent("%F0%9F%91%A4");
    const E_PIN = decodeURIComponent("%F0%9F%93%8D");
    const E_TRUCK = decodeURIComponent("%F0%9F%9A%9A");
    const E_NOTE = decodeURIComponent("%F0%9F%93%9D");
    
    msg += `${E_USER} *CUSTOMER DETAILS*\n`;
    msg += `Name: ${name}\n`;
    msg += `Phone: ${phone}\n`;
    msg += `Email: ${email}\n\n`;
    msg += `${E_PIN} *DELIVERY ADDRESS*\n${address}\nPincode: ${pincode}\n`;
    msg += `\n${E_TRUCK} *DELIVERY*\n`;
    msg += `Zone: ${deliveryInfo.label}\n`;
    msg += `Charge: ₹${deliveryInfo.charge}\n`;
    msg += `Estimated: ${deliveryInfo.days} days\n`;
    
    if (notes) msg += `\n${E_NOTE} *Notes:* ${notes}\n`;
    
    const E_MONEY = decodeURIComponent("%F0%9F%92%B0");
    const E_CAM = decodeURIComponent("%F0%9F%93%B8");
    const E_CHECK = decodeURIComponent("%E2%9C%85");
    
    msg += `\n${E_MONEY} *BILL SUMMARY*\n`;
    msg += `Items Total: ₹${itemsTotal}\n`;
    msg += `Delivery: ₹${deliveryInfo.charge}\n`;
    msg += `*GRAND TOTAL: ₹${grandTotal}*\n`;
    msg += `\n━━━━━━━━━━━━━━━━━━\n${E_CAM} Payment screenshot attached.\n${E_CHECK} Please review and process.`;
    
    currentDraftWaMsg = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(msg)}`;
    
    // Close checkout modal, open UPI payment modal
    document.getElementById('frontOrderModal').style.display = 'none';
    openUpiPayModal(orderId, itemsTotal, deliveryInfo.charge, grandTotal);
    
    btn.disabled = false;
    btn.textContent = '💳 Proceed to Payment';
    
  } catch(e) {
    err.textContent = 'Something went wrong. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '💳 Proceed to Payment';
  }
}

// Open UPI Payment Modal with dynamic amount
function openUpiPayModal(orderId, itemsTotal, deliveryCharge, grandTotal) {
  document.getElementById('upiOrderId').textContent = '#' + orderId;
  document.getElementById('upiAmount').textContent = grandTotal;
  document.getElementById('upiAmountBreakdown').innerHTML = `Items: ₹${itemsTotal} + Delivery: ₹${deliveryCharge}`;
  
  // UPI deep link
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Order #' + orderId)}`;
  document.getElementById('upiDeepLink').href = upiUrl;
  
  // Dynamic QR code via free API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
  document.getElementById('upiQrImg').src = qrApiUrl;
  
  const modal = document.getElementById('upiPayModal');
  modal.style.display = 'flex';
  modal.style.opacity = '0';
  setTimeout(() => { modal.style.transition = 'opacity 0.25s'; modal.style.opacity = '1'; }, 10);
}

function closeUpiModal() {
  document.getElementById('upiPayModal').style.display = 'none';
}

// Confirm order via WhatsApp — updates draft to pending
async function confirmOrderViaWhatsApp() {
  try {
    // Update order status from 'draft' to 'pending'
    if (currentDraftOrderId && currentDraftOrderId !== 'NEW') {
      await Orders.updateStatus(currentDraftOrderId, 'pending');
    }
  } catch(e) {
    console.log('Could not update order status:', e);
  }
  
  // Clear cart now that order is confirmed
  shoppingCart = [];
  saveCart();
  
  // Close payment modal and open WhatsApp
  closeUpiModal();
  if (currentDraftWaMsg) {
    window.open(currentDraftWaMsg, '_blank');
  }
  
  // Reset draft state
  currentDraftOrderId = null;
  currentDraftWaMsg = '';
  currentDraftDelivery = null;
}

// ===== Intercept Static WhatsApp Order Clicks to add Image URL & Format =====
document.addEventListener('click', (e) => {
  const waBtn = e.target.closest('a[href*="wa.me"]');
  if (waBtn) {
    const card = waBtn.closest('.product-card');
    if (card) {
      e.preventDefault();
      let hrefUrl;
      try { hrefUrl = new URL(waBtn.href); } catch(err) { return window.open(waBtn.href, '_blank'); }
      
      let text = hrefUrl.searchParams.get('text') || '';
      let img = card.querySelector('img');
      let imgUrl = img ? img.src : '';
      
      if (imgUrl && !text.includes(imgUrl) && !text.includes('Product Image:')) {
         text += `\n\n*Product Image:* ${imgUrl}`;
      }
      
      const waNum = ((window._siteSettings || {}).whatsapp_number || '918320979383').replace(/\D/g, '');
      openQR(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`);
    }
  }
});

// ===== QR Code Modal Logic (Legacy — kept for non-cart flows) =====
let currentWaLink = '';

window.openQR = function(waLink) {
  currentWaLink = waLink;
  // For cart checkout, the UPI modal handles everything
  // This is only used for static WhatsApp order clicks now
  const modal = document.getElementById('qrModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.transition='opacity 0.2s'; modal.style.opacity='1'; }, 10);
  } else {
    // Fallback if modal not present
    window.location.href = waLink;
  }
};

window.closeQR = function() {
  const modal = document.getElementById('qrModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const qrWaBtn = document.getElementById('qrWaBtn');
  if (qrWaBtn) {
    qrWaBtn.onclick = () => {
      closeQR();
      if (currentWaLink) {
        window.open(currentWaLink, '_blank');
      }
    };
  }
});

// ===== Page Load Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initTypingEffect();
  initCounters();
  initProductCardEffects();
  createGoldParticles();
  initWhatsAppPulse();

  // Load dynamic data from DB if available
  loadDynamicProducts();
  loadDynamicFeatured();
  loadDynamicCategories();
  loadDynamicReviews();
  injectCartUI();
  
  if (typeof applyDynamicSettings === 'function') {
    applyDynamicSettings();
  }

  // Animate hero content on load
  const heroContent = document.querySelector('.hero-text');
  if (heroContent) {
    const children = heroContent.children;
    Array.from(children).forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(25px)';
      setTimeout(() => {
        child.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, 200 + i * 150);
    });
  }
});
