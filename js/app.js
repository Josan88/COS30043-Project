// ShopEase - Main Application Entry Point
// COS30043 Interface Design and Development
// E-commerce Application

// Wait for DOM to be loaded before initializing the app
document.addEventListener('DOMContentLoaded', () => {
  // Create Sample Products Data
  const productData = [
    {
      id: 1,
      name: 'Smartphone X',
      price: 899.99,
      description: 'The latest smartphone with an amazing camera and long battery life.',
      image: 'https://via.placeholder.com/300x300?text=Smartphone',
      category: 'electronics',
      rating: 4.5,
      inStock: true
    },
    {
      id: 2,
      name: 'Laptop Pro',
      price: 1299.99,
      description: 'Powerful laptop for professionals and gamers with high-end specs.',
      image: 'https://via.placeholder.com/300x300?text=Laptop',
      category: 'electronics',
      rating: 4.8,
      inStock: true
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      price: 159.99,
      description: 'Noise-canceling headphones with crystal clear sound quality.',
      image: 'https://via.placeholder.com/300x300?text=Headphones',
      category: 'electronics',
      rating: 4.3,
      inStock: true
    },
    {
      id: 4,
      name: 'Smart Watch',
      price: 249.99,
      description: 'Track your fitness and stay connected with this elegant smartwatch.',
      image: 'https://via.placeholder.com/300x300?text=SmartWatch',
      category: 'wearables',
      rating: 4.0,
      inStock: true
    },
    {
      id: 5,
      name: 'Wireless Earbuds',
      price: 129.99,
      description: 'True wireless earbuds with amazing sound quality and long battery life.',
      image: 'https://via.placeholder.com/300x300?text=Earbuds',
      category: 'electronics',
      rating: 4.7,
      inStock: true
    },
    {
      id: 6,
      name: 'Gaming Console',
      price: 499.99,
      description: 'Next-generation gaming console for the ultimate gaming experience.',
      image: 'https://via.placeholder.com/300x300?text=GamingConsole',
      category: 'gaming',
      rating: 4.9,
      inStock: false
    },
    {
      id: 7,
      name: 'Fitness Tracker',
      price: 89.99,
      description: 'Track your steps, heart rate, and more with this sleek fitness band.',
      image: 'https://via.placeholder.com/300x300?text=FitnessTracker',
      category: 'wearables',
      rating: 4.2,
      inStock: true
    },
    {
      id: 8,
      name: 'Tablet Ultra',
      price: 649.99,
      description: 'High-resolution tablet perfect for work and entertainment.',
      image: 'https://via.placeholder.com/300x300?text=Tablet',
      category: 'electronics',
      rating: 4.6,
      inStock: true
    }
  ];

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

  const router = new VueRouter({
    routes,
    mode: 'hash' // Use hash mode for better compatibility
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

  // Create Vue app using Vue 3 API
  const app = Vue.createApp({
    components: {
      'app-navbar': Navbar,
      'app-footer': Footer
    },
    data() {
      return {
        store: Store // Add this line to make Store accessible via $root.store
      }
    },
    computed: {
      isAuthenticated() {
        return Store.state.isAuthenticated;
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
        // Simple mock authentication for demo purposes
        if (email === 'demo@example.com' && password === 'password') {
          Store.mutations.login({
            name: 'Demo User',
            email: email,
            avatar: 'https://via.placeholder.com/64x64'
          });
          this.showNotification('Login successful', 'success');
          return true;
        } else {
          this.showNotification('Invalid credentials', 'error');
          return false;
        }
      },

      logout() {
        Store.mutations.logout();
        this.showNotification('You have been logged out', 'info');
        router.push('/');
      },

      register(name, email, password) {
        // Simple mock registration
        Store.mutations.login({
          name: name,
          email: email,
          avatar: 'https://via.placeholder.com/64x64'
        });
        this.showNotification('Registration successful', 'success');
        return true;
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

  // Use the plugins
  ShopEasePlugins.install(app);

  // Use the router
  app.use(router);

  // Mount the app
  app.mount('#app');
});