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

// ===== Frontend Order Modal =====
function injectOrderModal() {
  const modalHTML = `
  <div class="modal-bd" id="frontOrderModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; padding:1rem; overflow-y:auto;">
    <div class="modal" style="background:var(--bg-secondary); border:1px solid rgba(212,175,55,0.3); border-radius:12px; width:100%; max-width:600px; padding:2rem; position:relative; box-shadow:0 15px 50px rgba(0,0,0,0.7); margin:auto;">
      <button onclick="document.getElementById('frontOrderModal').style.display='none'" style="position:absolute; top:1.2rem; right:1.5rem; background:none; border:none; color:#aaa; font-size:1.8rem; cursor:pointer; transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#aaa'">&times;</button>
      <h2 style="margin-bottom:1rem; color:var(--gold); font-size:1.6rem; text-align:center; font-weight:600;">Checkout Details</h2>
      <div id="frontOrderProdName" style="font-weight:bold; margin-bottom:0.3rem; font-size:1.1rem; text-align:center;"></div>
      <div id="frontOrderProdPrice" style="color:var(--gold); margin-bottom:1.5rem; font-size:1.2rem; text-align:center;"></div>
      
      <input type="hidden" id="foProdId" />
      <input type="hidden" id="foProdName" />
      <input type="hidden" id="foPrice" />
      
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
        <input type="text" id="foPincode" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="e.g. 110001" />
      </div>
      
      <div style="margin-bottom:1.5rem;">
        <label style="display:block; font-size:0.85rem; margin-bottom:0.4rem; color:#bbb;">Customization Notes (Optional)</label>
        <textarea id="foNotes" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; color:white; font-size:0.95rem; min-height:60px; resize:vertical; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='#444'" placeholder="Any special instructions..."></textarea>
      </div>
      
      <button onclick="submitFrontendOrder()" class="btn btn-primary" style="width:100%; justify-content:center; padding:1rem; font-size:1.1rem; font-weight:bold; letter-spacing:0.5px; border-radius:8px;" id="foSubmitBtn">🛍️ Place Order & WhatsApp</button>
      <div id="foError" style="color:#ff5555; font-size:0.9rem; margin-top:1rem; text-align:center; display:none; font-weight:500;"></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openFrontendOrderModal(id, name, price) {
  document.getElementById('foProdId').value = id;
  document.getElementById('foProdName').value = name;
  document.getElementById('foPrice').value = price || 0;
  
  document.getElementById('frontOrderProdName').textContent = name;
  document.getElementById('frontOrderProdPrice').textContent = '₹' + (price || 0);
  
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

async function submitFrontendOrder() {
  const name = document.getElementById('foName').value.trim();
  const phone = document.getElementById('foPhone').value.trim();
  const email = document.getElementById('foEmail').value.trim();
  const address = document.getElementById('foAddress').value.trim();
  const pincode = document.getElementById('foPincode').value.trim();
  const notes = document.getElementById('foNotes').value.trim();
  const pName = document.getElementById('foProdName').value;
  const pPrice = parseFloat(document.getElementById('foPrice').value) || 0;
  const err = document.getElementById('foError');
  const btn = document.getElementById('foSubmitBtn');
  
  if (!name || !phone || !email || !address || !pincode) {
    err.textContent = 'Please fill in all the required details (Name, Phone, Email, Address, Pincode).';
    err.style.display = 'block';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  // Combine all details into the DB notes field so it's readable in the admin panel
  const dbNotes = `Email: ${email}\nPincode: ${pincode}\nAddress: ${address}\nNotes: ${notes}`;
  
  try {
    const res = await Orders.create({
      customer_name: name,
      customer_phone: phone,
      product_name: pName,
      amount: pPrice,
      status: 'pending',
      notes: dbNotes
    });
    
    const orderId = (res && res.length > 0) ? res[0].id : 'NEW';
    const waNum = ((window._siteSettings || {}).whatsapp_number || '+918320979383').replace(/[^\d+]/g, '');
    
    // Attempt to get product image if available
    let imgUrl = '';
    const cards = document.querySelectorAll('.product-card');
    for (let c of cards) {
      if (c.querySelector('.product-name')?.textContent?.trim() === pName) {
        let img = c.querySelector('img');
        if (img) imgUrl = img.src;
        break;
      }
    }
    
    let msg = `Hi Crafted Core! 👋\n\nA new order has been successfully placed on your website.\n\n📦 *ORDER DETAILS*\n━━━━━━━━━━━━━━━━━━\n🆔 *Order ID:* #${orderId}\n\n🛍️ *Items*\n• 1 × ${pName}\nItem Total: ₹${pPrice}\n`;
    
    msg += `\n👤 *CUSTOMER DETAILS*\n`;
    msg += `Name: ${name}\n`;
    msg += `Phone: ${phone}\n`;
    msg += `Email: ${email}\n\n`;
    msg += `📍 *DELIVERY ADDRESS*\n${address}\nPincode: ${pincode}\n`;
    
    if (notes) msg += `\n📝 *Notes:* ${notes}\n`;
    
    msg += `\n💰 *TOTAL:* ₹${pPrice}\n\n━━━━━━━━━━━━━━━━━━\n`;
    if (imgUrl) {
      try {
        let absoluteImg = new URL(imgUrl, document.baseURI).href;
        msg += `🖼️ *Product Image:* ${absoluteImg}\n\n`;
      } catch(e) { msg += `🖼️ *Product Image:* ${imgUrl}\n\n`; }
    }
    msg += `✅ Order placed successfully.\n\nPlease review the order details and process it accordingly.`;
    
    document.getElementById('frontOrderModal').style.display = 'none';
    window.location.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    
  } catch(e) {
    err.textContent = 'Something went wrong. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '🛍️ Place Order & WhatsApp';
  }
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
      
      const waNum = ((window._siteSettings || {}).whatsapp_number || '+918320979383').replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, '_blank');
    }
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
  injectOrderModal();
  
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
