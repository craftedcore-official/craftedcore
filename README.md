# CraftedCore — React Application

CraftedCore is a luxury personalized gifts and custom merchandise e-commerce platform rewritten from dynamic multi-page HTML into a modern, high-performance React (TypeScript) + Vite single-page application.

## Key Features Ported

1. **Storefront & Navigation**
   - Dark Gold / Copper luxury aesthetic with Outfit and Playfair Display typography.
   - Interactive hero section with animated floating product visuals, trust badges, and live customer stats.
   - Draggable & auto-scrolling infinite product category marquee.
   - Best sellers / featured products grid with hover secondary preview images.
   - Category filter tabs and subcategory tags.
   - Live product search modal with search queries and direct navigation.
   - Help & Support modal with WhatsApp & Instagram integration.

2. **Customization & Product Experience**
   - Detailed product view with multi-image gallery carousel and thumbnail strip.
   - Interactive color selector that dynamically updates the preview image based on product color mappings.
   - Size selector with an interactive Size Guide modal for apparel.
   - Dynamic personalization options (e.g. Laser Name Engraving, Photo Engraving, UVDTF printing, Velvet box gift packaging) with live price recalculation.
   - Custom engraving text input and photo attachment preview.
   - Pincode-based delivery fee and delivery timeline estimator (Gujarat 2 days, MH/MP/Rajasthan 4 days, Rest of India 7 days; Free shipping above ₹1,999).
   - Customer reviews section with star breakdowns and "Write a Review" form modal.

3. **Shopping Bag & Fast Checkout**
   - Slide-over shopping bag drawer with free shipping progress bar.
   - Item quantity controls, option badges, and item removal.
   - Promo code / coupon system with real-time discount validation and single-use safeguards.
   - Fast checkout modal with delivery zone calculation by pincode.
   - Seamless UPI payment modal with dynamic QR code generation, direct UPI app deep-linking (PhonePe, GPay, Paytm), and one-click WhatsApp order confirmation with pre-formatted receipts and screenshot proof.

4. **Administration Portal (`#admin`)**
   - Password-protected merchant management panel (`craftedcore2024`).
   - Revenue and order status tracking dashboard.
   - Order management with live status toggling (pending, confirmed, dispatched, delivered, cancelled) and direct WhatsApp customer link.
   - Complete Product CRUD with pricing, categories, badge management, color mappings, and image URLs.
   - Categories and subcategories management.
   - Coupon management (create promo codes, set % discounts, toggle active state).
   - Review moderation and approval.
   - Website content and branding editor.
   - Supabase REST API connection with local fallback caching.

## Development

- Start development server: `npm run dev` (starts on port 3000)
- Production build: `npm run build`
