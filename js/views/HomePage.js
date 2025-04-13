/**
 * HomePage Component
 * Main landing page for the application with context view grouping
 */
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Hero Section - Full Width Context -->
      <section class="hero mb-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-10 text-center py-5">
              <h1 class="display-4">Welcome to TechWorld</h1>
              <p class="lead">Your one-stop destination for the latest and greatest technology products.</p>
              <router-link to="/products" class="btn btn-secondary btn-lg">Shop Now</router-link>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Content Grid System - Main Container -->
      <div class="container mb-5">
        <!-- Context Group 1: Featured Products and Categories -->
        <div class="row mb-5">
          <!-- Left Column: Featured Products -->
          <div class="col-lg-8">
            <div class="card h-100">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Featured Products</h2>
              </div>
              <div class="card-body">
                <div class="row">
                  <div v-for="product in featuredProducts" :key="product.id" class="col-12 col-md-6 mb-4">
                    <product-card :product="product"></product-card>
                  </div>
                </div>
                <div class="text-center mt-3">
                  <router-link to="/products" class="btn btn-outline">View All Products</router-link>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Categories -->
          <div class="col-lg-4">
            <div class="card h-100">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Shop by Category</h2>
              </div>
              <div class="card-body">
                <div class="row">
                  <div v-for="category in categories" :key="category.id" class="col-6 mb-3">
                    <router-link :to="'/products?category=' + category.id" class="category-card text-decoration-none">
                      <div class="card h-100 text-center border-0 shadow-sm">
                        <div class="card-body d-flex flex-column justify-content-center py-3">
                          <i :class="category.icon + ' fa-2x mb-2'"></i>
                          <h5 class="card-title h6">{{ category.name }}</h5>
                        </div>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Context Group 2: Special Offers and Shipping Banner -->
        <div class="row mb-5">
          <!-- Special Offers - Full Width -->
          <div class="col-12 mb-4">
            <div class="card">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h2 class="h4 mb-0">Special Offers</h2>
                <span class="badge bg-danger">Limited Time</span>
              </div>
              <div class="card-body">
                <div class="row">
                  <div v-for="product in saleProducts" :key="product.id" class="col-12 col-sm-6 col-md-3 mb-4">
                    <product-card :product="product"></product-card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Context Group 3: Banner and Latest News -->
        <div class="row">
          <!-- Banner - 2/3 Width -->
          <div class="col-md-8 mb-4">
            <div class="card h-100">
              <div class="card-body p-0">
                <div class="row g-0">
                  <div class="col-md-6 d-flex flex-column justify-content-center p-4">
                    <h2>Free Shipping on Orders Over RM50</h2>
                    <p class="lead">Get your tech delivered to your doorstep for free! Conditions apply.</p>
                    <div>
                      <router-link to="/products" class="btn btn-primary">Shop Now</router-link>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80" 
                        alt="Shipping illustration" 
                        class="img-fluid h-100 object-fit-cover">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Latest Tech News - 1/3 Width -->
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Latest Tech News</h2>
              </div>
              <div class="card-body">
                <ul class="list-group list-group-flush">
                  <li v-for="(news, index) in latestNews" :key="index" class="list-group-item px-0">
                    <h5 class="h6">{{ news.title }}</h5>
                    <p class="small text-muted mb-0">{{ news.date }}</p>
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-white text-center">
                <a href="#" class="btn btn-sm btn-outline">Read More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      featuredProducts: [],
      saleProducts: [],
      categories: [
        { id: 'laptops', name: 'Laptops', icon: 'fas fa-laptop' },
        { id: 'smartphones', name: 'Smartphones', icon: 'fas fa-mobile-alt' },
        { id: 'accessories', name: 'Accessories', icon: 'fas fa-headphones' },
        { id: 'audio', name: 'Audio', icon: 'fas fa-volume-up' },
        { id: 'wearables', name: 'Wearables', icon: 'fas fa-watch' },
        { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' }
      ],
      latestNews: [
        { title: 'New iPhone 16 Pro Rumored Features', date: 'April 8, 2025' },
        { title: 'AMD Launches Next-Gen Processors', date: 'April 5, 2025' },
        { title: 'Best Budget Laptops for 2025', date: 'April 2, 2025' },
        { title: 'Future of AR Technology in Retail', date: 'March 28, 2025' }
      ]
    };
  },
  created() {
    // Initial attempt to load products
    this.loadProducts();
    
    // Listen for when products are loaded
    window.addEventListener('products-loaded', this.loadProducts);
  },
  beforeDestroy() {
    // Clean up event listener
    window.removeEventListener('products-loaded', this.loadProducts);
  },
  methods: {
    loadProducts() {
      // Get featured products
      this.featuredProducts = ProductService.getFeaturedProducts(4);
      
      // Get products on sale
      this.saleProducts = ProductService.getProductsOnSale().slice(0, 4);
    },
    truncateDescription(text) {
      return this.$filters.truncate(text, 80);
    }
  }
};

// Make the component globally available
window.HomePage = HomePage;