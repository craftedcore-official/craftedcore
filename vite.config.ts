import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        admin: 'admin.html',
        category: 'category.html',
        clear: 'clear.html',
        contact: 'contact.html',
        customize: 'customize-yours-now.html',
        faq: 'faq.html',
        privacy: 'privacy.html',
        product: 'product.html',
        products: 'products.html',
        refund: 'refund.html',
        shipping: 'shipping.html',
        terms: 'terms.html',
        test_badge: 'test_badge.html',
      },
    },
  },
});
