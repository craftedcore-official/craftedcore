// CraftedCore Analytics Tracker v2.0
// Tracks: pageviews, referrers, UTM campaigns, device, location, live visitors
// Syncs to Supabase ('analytics', 'analytics_live') + Local Fallback Buffer
// ============================================================

(function() {
  'use strict';

  // Supabase config
  function getSupabaseUrl() {
    let s = null;
    try { s = localStorage.getItem('cc_cfg_url'); } catch(e) {}
    return (s && s.trim().length > 10) ? s.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim() : 'https://zlqiyxhesmrfszmjazsr.supabase.co';
  }
  function getSupabaseKey() {
    let s = null;
    try { s = localStorage.getItem('cc_cfg_key'); } catch(e) {}
    return (s && s.trim().length > 20) ? s.trim() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscWl5eGhlc21yZnN6bWphenNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDMxNjYsImV4cCI6MjEwMTkxOTE2Nn0.fQel-qiQSpJqe4ed_eb_HVYVi7VtJht7d_TxND_gq9g';
  }

  // Unique visitor ID
  function getVisitorId() {
    let vid = null;
    try { vid = localStorage.getItem('cc_visitor_id'); } catch(e) {}
    if (!vid) {
      vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 7);
      try { localStorage.setItem('cc_visitor_id', vid); } catch(e) {}
    }
    return vid;
  }

  // Session ID (resets after 30 min inactivity)
  function getSessionId() {
    let sid = null, lastAct = null;
    try { 
      sid = sessionStorage.getItem('cc_session_id'); 
      lastAct = sessionStorage.getItem('cc_last_activity');
    } catch(e) {}
    
    const now = Date.now();
    const thirtyMin = 30 * 60 * 1000;
    
    if (!sid || !lastAct || (now - parseInt(lastAct)) > thirtyMin) {
      sid = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      try { sessionStorage.setItem('cc_session_id', sid); } catch(e) {}
    }
    try { sessionStorage.setItem('cc_last_activity', now.toString()); } catch(e) {}
    return sid;
  }

  // Device detection
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Tablet|iPad|PlayBook/i.test(ua)) return 'tablet';
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // Browser detection
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  }

  // OS detection
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other';
  }

  // Traffic Source & UTM detection
  function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || urlParams.get('source');
    if (utmSource) return utmSource.toLowerCase();

    const ref = document.referrer;
    if (!ref) return 'direct';
    try {
      const url = new URL(ref);
      const host = url.hostname.toLowerCase();
      if (host.includes(window.location.hostname)) return 'internal';
      if (host.includes('google')) return 'google';
      if (host.includes('instagram')) return 'instagram';
      if (host.includes('facebook') || host.includes('fb.com')) return 'facebook';
      if (host.includes('whatsapp') || host.includes('wa.me')) return 'whatsapp';
      if (host.includes('youtube')) return 'youtube';
      if (host.includes('bing')) return 'bing';
      if (host.includes('yahoo')) return 'yahoo';
      if (host.includes('twitter') || host.includes('x.com')) return 'twitter';
      if (host.includes('pinterest')) return 'pinterest';
      if (host.includes('t.me') || host.includes('telegram')) return 'telegram';
      if (host.includes('reddit')) return 'reddit';
      return host;
    } catch(e) { return 'direct'; }
  }

  // Clean page path
  function getPagePath() {
    let path = window.location.pathname;
    if (path === '/' || path.endsWith('/index.html') || path === '') return '/';
    return path.replace(/^\//, '').replace(/\.html$/, '');
  }

  // Page readable name
  function getPageName() {
    const path = getPagePath();
    const names = {
      '/': 'Home',
      'products': 'All Products',
      'product': 'Product Detail',
      'category': 'Category View',
      'about': 'About Us',
      'contact': 'Contact Us',
      'faq': 'FAQ',
      'customize-yours-now': 'Customizer Studio',
      'privacy': 'Privacy Policy',
      'terms': 'Terms & Conditions',
      'shipping': 'Shipping Policy',
      'refund': 'Refund Policy'
    };
    if (names[path]) return names[path];
    if (path.startsWith('product')) {
      const pName = document.querySelector('h1, .prod-title');
      if (pName && pName.innerText) return pName.innerText.trim();
    }
    return path;
  }

  // IP Geo Location lookup with cached result
  async function getLocation() {
    try {
      let cached = null;
      try { cached = localStorage.getItem('cc_geo_loc'); } catch(e) {}
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.time && (Date.now() - parsed.time < 24 * 3600 * 1000)) {
          return parsed.data;
        }
      }
      
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(2500) });
      const data = await res.json();
      const loc = {
        country: data.country_name || 'India',
        city: data.city || 'Delhi',
        region: data.region || ''
      };
      try { localStorage.setItem('cc_geo_loc', JSON.stringify({ time: Date.now(), data: loc })); } catch(e) {}
      return loc;
    } catch(e) {
      return { country: 'India', city: '', region: '' };
    }
  }

  // Fallback Local Storage Buffer (Last 150 events)
  function recordLocalEvent(event) {
    try {
      let list = [];
      try { list = JSON.parse(localStorage.getItem('cc_local_analytics') || '[]'); } catch(e) {}
      list.unshift(event);
      if (list.length > 150) list = list.slice(0, 150);
      localStorage.setItem('cc_local_analytics', JSON.stringify(list));
      
      // Update local live heartbeat
      let live = {};
      try { live = JSON.parse(localStorage.getItem('cc_local_live') || '{}'); } catch(e) {}
      live[event.visitor_id] = {
        visitor_id: event.visitor_id,
        page_path: event.page_path,
        page_name: event.page_name,
        device_type: event.device_type,
        traffic_source: event.traffic_source,
        city: event.city,
        country: event.country,
        last_seen: Date.now()
      };
      // Clean older than 3 minutes
      const threeMinAgo = Date.now() - (3 * 60 * 1000);
      Object.keys(live).forEach(k => {
        if (live[k].last_seen < threeMinAgo) delete live[k];
      });
      localStorage.setItem('cc_local_live', JSON.stringify(live));
    } catch(e) {}
  }

  // Main Pageview Tracking
  async function trackPageView() {
    if (window.location.pathname.includes('admin')) return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const loc = await getLocation();

    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: getPagePath(),
      page_name: getPageName(),
      referrer: (document.referrer || '').substring(0, 255),
      traffic_source: getTrafficSource(),
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      country: loc.country,
      city: loc.city,
      region: loc.region,
      timestamp: new Date().toISOString()
    };

    // Save locally
    recordLocalEvent(payload);

    // Send to Supabase
    const BASE = getSupabaseUrl();
    const KEY = getSupabaseKey();
    
    try {
      fetch(`${BASE}/rest/v1/analytics`, {
        method: 'POST',
        headers: {
          'apikey': KEY,
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch(e) {}
  }

  // Real-time Heartbeat (every 25 seconds)
  function startHeartbeat() {
    if (window.location.pathname.includes('admin')) return;
    
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const BASE = getSupabaseUrl();
    const KEY = getSupabaseKey();

    async function beat() {
      const loc = await getLocation();
      const heartbeatPayload = {
        visitor_id: visitorId,
        session_id: sessionId,
        page_path: getPagePath(),
        page_name: getPageName(),
        device_type: getDeviceType(),
        traffic_source: getTrafficSource(),
        country: loc.country,
        city: loc.city,
        last_seen: new Date().toISOString()
      };

      // Update local storage
      try {
        let live = {};
        try { live = JSON.parse(localStorage.getItem('cc_local_live') || '{}'); } catch(e) {}
        live[visitorId] = { ...heartbeatPayload, last_seen: Date.now() };
        localStorage.setItem('cc_local_live', JSON.stringify(live));
      } catch(e) {}

      // Send to Supabase
      try {
        fetch(`${BASE}/rest/v1/analytics_live`, {
          method: 'POST',
          headers: {
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(heartbeatPayload)
        }).catch(() => {});
      } catch(e) {}
    }

    beat();
    setInterval(beat, 25000);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      trackPageView();
      startHeartbeat();
    });
  } else {
    trackPageView();
    startHeartbeat();
  }
})();
