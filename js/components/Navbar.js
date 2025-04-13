// Navigation Component
const Navbar = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link class="navbar-brand" to="/">ShopEase</router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" 
          aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/" exact>Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/products">Products</router-link>
            </li>
          </ul>
          
          <div class="navbar-nav ms-auto">
            <div class="nav-item dropdown" v-if="$root.store.isAuthenticated">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                {{ $root.store.user ? $root.store.user.name : 'Account' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li>
                  <router-link class="dropdown-item" to="/account">My Account</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/purchases">My Purchases</router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout">Logout</a>
                </li>
              </ul>
            </div>
            <template v-else>
              <div class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </div>
              <div class="nav-item">
                <router-link class="nav-link" to="/register">Register</router-link>
              </div>
            </template>
            <div class="nav-item">
              <router-link class="nav-link cart-link" to="/cart">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" v-if="cartCount > 0">
                  {{ cartCount }}
                </span>
                <span class="sr-only">Cart</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  
  computed: {
    cartCount() {
      return this.$root.store && this.$root.store.cart 
        ? this.$root.store.cart.reduce((total, item) => total + item.quantity, 0)
        : 0;
    }
  },

  methods: {
    logout() {
      this.$root.logout();
    }
  }
};