// ShopEase - Main Application Entry Point
// COS30043 Interface Design and Development
// E-commerce Application

// Wait for DOM to be loaded before initializing the app
document.addEventListener('DOMContentLoaded', () => {
  // Initialize database
  ShopEaseDB.init()
    .then(() => console.log('Database ready'))
    .catch(err => console.error('Database initialization error:', err));

  // Declare productData variable at a scope accessible to the Vue app
  let productData = [];

  // Setup Vue Router
  const routes = [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductPage },
    { path: '/cart', component: CartPage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/account', component: AccountPage, meta: { requiresAuth: true } },
    { path: '/purchases', component: PurchasesPage, meta: { requiresAuth: true } }
  ];

  // Create router instance using Vue Router 4 syntax
  const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
  });

  // Navigation guards for protected routes
  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // This route requires auth, check if logged in
      if (!Store.state.isAuthenticated) {
        // Not logged in, redirect to login page with return URL
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  // Create Vue 3 app
  const app = Vue.createApp({
    data() {
      return {
        store: Store // Make Store accessible via $root.store
      }
    },
    computed: {
      isAuthenticated() {
        return Store.state.isAuthenticated;
      },
      notifications() {
        return Store.state.notifications;
      }
    },
    methods: {
      // Cart methods
      addToCart(product) {
        Store.mutations.addToCart(product);
        this.showNotification(`Added ${product.name} to cart`, 'success');
      },

      removeFromCart(productId) {
        const product = this.getProduct(productId);
        Store.mutations.removeFromCart(productId);
        if (product) {
          this.showNotification(`Removed ${product.name} from cart`, 'info');
        }
      },

      updateQuantity(productId, quantity) {
        Store.mutations.updateCartItemQuantity(productId, quantity);
      },

      getProduct(id) {
        return productData.find(p => p.id === id);
      },

      // Authentication methods
      login(email, password) {
        return new Promise((resolve, reject) => {
          console.log('Login attempt with email:', email);
          // Use database authentication
          ShopEaseDB.users.authenticate(email, password)
            .then(user => {
              console.log('Login successful, updating store with user:', user.name);
              Store.mutations.login(user);
              this.showNotification('Login successful', 'success');
              resolve();
            })
            .catch(error => {
              console.error('Login failed:', error);
              this.showNotification('Invalid credentials', 'error');
              reject('Invalid email or password');
            });
        });
      },

      logout() {
        Store.mutations.logout();
        this.showNotification('You have been logged out', 'info');
        router.push('/');
      },

      register(name, email, password) {
        return new Promise((resolve, reject) => {
          const userData = {
            name,
            email,
            password,
            avatar: 'https://via.placeholder.com/64x64',
          };

          ShopEaseDB.users.add(userData)
            .then(newUser => {
              // Login the user after successful registration
              Store.mutations.login(newUser);
              this.showNotification('Registration successful', 'success');
              resolve(newUser);
            })
            .catch(error => {
              this.showNotification(error, 'error');
              reject(error);
            });
        });
      },

      // Purchase methods
      completePurchase() {
        // Ensure we have items in the cart
        if (Store.state.cart.length === 0) {
          this.showNotification('Your cart is empty', 'error');
          return false;
        }

        // Create a purchase record (would be sent to server in real app)
        const purchase = {
          id: 'ORD-' + Date.now().toString().slice(-5),
          date: new Date().toISOString(),
          items: [...Store.state.cart],
          total: Store.getters.cartTotal()
        };

        // Clear the cart
        Store.mutations.clearCart();

        this.showNotification('Purchase completed! Order ID: ' + purchase.id, 'success');
        return true;
      },

      // Notification system
      showNotification(message, type = 'info') {
        const notification = {
          id: Date.now(),
          message,
          type,
          timeout: 3000
        };

        Store.state.notifications.push(notification);

        // Auto-remove notification after timeout
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.timeout);
      },

      removeNotification(id) {
        const index = Store.state.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          Store.state.notifications.splice(index, 1);
        }
      }
    }
  });

  // Define custom directives
  app.directive('lazy-load', {
    mounted(el, binding) {
      // Create a function to handle image loading
      function loadImage() {
        // Set a placeholder or loading image initially
        const originalSrc = binding.value;

        // Create new Image object to load the image
        const img = new Image();

        // When image successfully loads, update the element's src
        img.onload = function () {
          el.src = originalSrc;
          el.classList.add('loaded');
        };

        // Handle image loading errors
        img.onerror = function () {
          // Set a fallback image on error
          el.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
          console.error(`Failed to load image: ${originalSrc}`);
        };

        // Start loading the image
        img.src = originalSrc;
      }

      // Use Intersection Observer API if available to load images only when they come into view
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadImage();
              observer.unobserve(el);
            }
          });
        });

        observer.observe(el);
      } else {
        // Fallback for browsers that don't support Intersection Observer
        loadImage();
      }
    }
  });

  // Register a11y click directive for enhanced keyboard accessibility
  app.directive('a11y-click', {
    mounted(el, binding) {
      el.addEventListener('keydown', (e) => {
        // Trigger click on Enter or Space key
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof binding.value === 'function') {
            binding.value();
          } else {
            el.click();
          }
        }
      });
    }
  });

  // Register components
  app.component('app-navbar', Navbar);
  app.component('app-footer', Footer);

  // Use router
  app.use(router);

  app.mount('#app');
});