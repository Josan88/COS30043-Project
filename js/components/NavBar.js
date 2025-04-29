/**
 * NavBar Component
 * Main navigation bar for the application
 */
window.app.component('nav-bar', {
  template: `
    <nav class="navbar navbar-expand-md">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="fas fa-laptop"></i> TechWorld
        </router-link>
        
        <button class="navbar-toggler" type="button" @click="toggleNav" aria-label="Toggle navigation">
          <i class="fas fa-bars"></i>
        </button>
        
        <div class="collapse navbar-collapse" :class="{ 'd-block': isNavOpen }">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/product" class="nav-link" aria-label="Products">
                <i class="fas fa-shopping-bag"></i> Products
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/cart" class="nav-link" aria-label="Shopping Cart">
                <i class="fas fa-shopping-cart"></i> Cart <span v-if="cartItemCount" class="badge bg-danger">{{ cartItemCount }}</span>
              </router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/login" class="nav-link" aria-label="Sign In">
                <i class="fas fa-sign-in-alt"></i> Sign In
              </router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/register" class="nav-link" aria-label="Create Account">
                <i class="fas fa-user-plus"></i> Register
              </router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link to="/account" class="nav-link" aria-label="My Account">
                <i class="fas fa-user-circle"></i> My Account
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      isNavOpen: false,
      isLoggedIn: false,
      cartItemCount: 0
    };
  },
  methods: {
    toggleNav() {
      this.isNavOpen = !this.isNavOpen;
    },
    logout() {
      // Clear authentication state
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      this.$router.push('/login');
    },
    updateCartCount() {
      // Get cart from local storage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    }
  },
  mounted() {
    // Check if user is logged in
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Initial cart count
    this.updateCartCount();
    
    // Listen for storage events
    window.addEventListener('storage', (event) => {
      if (event.key === 'cart') {
        this.updateCartCount();
      }
      // Check for login/logout events
      if (event.key === 'isLoggedIn') {
        this.isLoggedIn = event.newValue === 'true';
      }
    });
    
    // Custom event for cart changes
    window.addEventListener('cart-updated', () => {
      this.updateCartCount();
    });

    // Custom event for auth changes (for same-window updates)
    window.addEventListener('auth-updated', () => {
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    });
  }
});