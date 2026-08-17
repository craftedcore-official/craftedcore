// ===== CraftedCore - Main JavaScript =====

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

// ===== Product Filter =====
function filterProducts(category) {
  const cards = document.querySelectorAll('.product-card[data-category]');
  const buttons = document.querySelectorAll('.filter-btn');

  // Update active button
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === category) {
      btn.classList.add('active');
    }
  });

  // Filter cards
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.4s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });

  // Scroll to product grid
  const grid = document.getElementById('productGrid') || document.getElementById('all-products');
  if (grid) {
    setTimeout(() => {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
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
        animateCounter(el, number);
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

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(212, 175, 55, ${Math.random() * 0.5 + 0.1});
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
  } catch (e) {
    console.log('Using static fallback products');
  }
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
      const html = `<button class="filter-btn active" data-filter="all" id="filter-all" onclick="filterProducts('all')">🌟 All</button>` 
        + cats.map(c => `<button class="filter-btn" data-filter="${c.slug}" id="filter-${c.slug}" onclick="filterProducts('${c.slug}')">${c.emoji||'📦'} ${c.name}</button>`).join('');
      filterTabs.innerHTML = html;
    }

    const catGrid = document.querySelector('.category-grid');
    if (catGrid) {
      const html = cats.map(c => `
        <a href="products.html?category=${c.slug}" class="category-card fade-in">
          <div class="category-icon">${c.emoji||'📦'}</div>
          <div class="category-name">${c.name}</div>
          <div class="category-count">Explore</div>
        </a>`).join('');
      catGrid.innerHTML = html;
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
        <div class="testimonial-card fade-in">
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

// ===== Shopping Cart Logic =====
let shoppingCart = JSON.parse(localStorage.getItem('cc_cart')) || [];

function saveCart() {
  localStorage.setItem('cc_cart', JSON.stringify(shoppingCart));
  updateCartUI();
}

function addToCart(id, name, price, img) {
  const existing = shoppingCart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    shoppingCart.push({ id, name, price: parseFloat(price) || 0, img: img || '', qty: 1 });
  }
  saveCart();
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
    
    html += `
      <div class="cart-item">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
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
  <div class="modal-bd" id="frontOrderModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
    <div class="modal" style="background:var(--bg-secondary); border:1px solid rgba(212,175,55,0.2); border-radius:16px; width:100%; max-width:450px; padding:1.5rem; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
      <button onclick="document.getElementById('frontOrderModal').style.display='none'" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
      <h3 style="margin-bottom:1rem; color:var(--gold);">Complete Your Order</h3>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#aaa;">Your Name *</label>
        <input type="text" id="foName" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.3); border:1px solid #333; border-radius:8px; color:white;" placeholder="Enter your name" />
      </div>
      <div style="margin-bottom:1rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#aaa;">Phone Number *</label>
        <input type="text" id="foPhone" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.3); border:1px solid #333; border-radius:8px; color:white;" placeholder="Enter WhatsApp number" />
      </div>
      <div style="margin-bottom:1.5rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#aaa;">Customization Notes (Optional)</label>
        <textarea id="foNotes" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.3); border:1px solid #333; border-radius:8px; color:white; min-height:80px; resize:vertical;" placeholder="E.g. Name to print, preferred color, etc."></textarea>
      </div>
      <button onclick="submitCartCheckout()" class="btn btn-primary" style="width:100%; justify-content:center; padding:1rem; font-size:1rem;" id="foSubmitBtn">💬 Submit Order</button>
      <div id="foError" style="color:#ff4444; font-size:0.85rem; margin-top:0.8rem; text-align:center; display:none;"></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  updateCartUI();
}

function openCheckoutFromCart() {
  if (shoppingCart.length === 0) return;
  toggleCartDrawer(false);
  
  document.getElementById('foName').value = '';
  document.getElementById('foPhone').value = '';
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
  const notes = document.getElementById('foNotes').value.trim();
  const err = document.getElementById('foError');
  const btn = document.getElementById('foSubmitBtn');
  
  if (!name || !phone) {
    err.textContent = 'Please enter both Name and Phone number.';
    err.style.display = 'block';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  const totalAmount = shoppingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const combinedProductName = shoppingCart.map(item => `${item.name} (x${item.qty})`).join(', ');
  
  try {
    const res = await Orders.create({
      customer_name: name,
      customer_phone: phone,
      product_name: combinedProductName,
      amount: totalAmount,
      status: 'pending',
      notes: notes
    });
    
    const orderId = (res && res.length > 0) ? res[0].id : 'NEW';
    const waNum = ((window._siteSettings || {}).whatsapp_number || '918320979383').replace(/\D/g, '');
    
    let msg = `Hi CraftedCore! 👋\n\nI just placed a new order.\n*Order ID:* #${orderId}\n\n*Items:*\n`;
    shoppingCart.forEach(item => {
      msg += `- ${item.qty}x ${item.name} (₹${item.price * item.qty})\n`;
    });
    msg += `\n*Total:* ₹${totalAmount}\n*Name:* ${name}`;
    if (notes) msg += `\n*Notes:* ${notes}`;
    
    shoppingCart = [];
    saveCart();
    
    document.getElementById('frontOrderModal').style.display = 'none';
    window.location.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    
  } catch(e) {
    err.textContent = 'Something went wrong. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '💬 Submit Order';
  }
}


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
