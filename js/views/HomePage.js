/**
 * HomePage Component
 * Demonstrates use of template functionality and Vue features
 */
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Hero Banner -->
      <div class="hero">
        <div class="container">
          <h1>Welcome to TechWorld</h1>
          <p>Your one-stop shop for the latest tech products</p>
          <router-link to="/product" class="btn btn-secondary">Shop Now</router-link>
        </div>
      </div>
      
      <!-- Content Grid System - Main Container -->
      <div class="container mb-5">
        <!-- Context Group 1: Featured Products -->
        <div class="row mb-5">
          <!-- Featured Products - Full Width -->
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Featured Products</h2>
              </div>
              <div class="card-body">
                <!-- Loading state for featured products -->
                <div v-if="isLoading && featuredProducts.length === 0" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading featured products...</p>
                </div>
                
                <div class="row">
                  <div v-for="product in featuredProducts" :key="product.id" class="col-12 col-sm-6 col-md-3 mb-4">
                    <product-card :product="product"></product-card>
                  </div>
                </div>
                <div class="text-center mt-3">
                  <router-link to="/product" class="btn btn-outline">View All Products</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Context Group 2: Special Offers -->
        <div class="row mb-5">
          <!-- Special Offers - Full Width -->
          <div class="col-12 mb-4">
            <div class="card">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h2 class="h4 mb-0">Special Offers</h2>
                <span class="badge bg-danger">Limited Time</span>
              </div>
              <div class="card-body">
                <!-- Loading state for sale products -->
                <div v-if="isLoading && saleProducts.length === 0" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading special offers...</p>
                </div>
                
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
        <div class="row mb-5">
          <!-- Banner - 2/3 Width -->
          <div class="col-md-8 mb-4">
            <div class="card h-100">
              <div class="card-body p-0">
                <div class="row g-0">
                  <div class="col-md-6 d-flex flex-column justify-content-center p-4">
                    <h2>Free Shipping on Orders Over RM50</h2>
                    <p class="lead">Get your tech delivered to your doorstep for free! Conditions apply.</p>
                    <div>
                      <router-link to="/product" class="btn btn-primary">Shop Now</router-link>
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
          
          <!-- Latest News - 1/3 Width -->
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Latest News</h2>
              </div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li v-for="(news, index) in latestNews" :key="index" class="list-group-item">
                    <a href="#" class="text-decoration-none">{{ news.title }}</a>
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
      categories: [],
      isLoading: true,
      latestNews: [
        { title: 'New iPhone 16 Pro Rumored Features', date: 'April 8, 2025' },
        { title: 'AMD Launches Next-Gen Processors', date: 'April 5, 2025' },
        { title: 'Best Budget Laptops for 2025', date: 'April 2, 2025' },
        { title: 'Future of AR Technology in Retail', date: 'March 28, 2025' }
      ]
    };
  },
  created() {
    // Check if products are already loaded
    if (ProductService.isReady()) {
      this.loadProducts();
      this.isLoading = false;
    } else {
      // Initialize the product service if needed
      ProductService.init()
        .then(() => {
          this.loadProducts();
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        });
    }

    // Listen for when products are loaded (in case we missed the initial load)
    window.addEventListener('products-loaded', this.handleProductsLoaded);
  },
  beforeDestroy() {
    // Clean up event listener
    window.removeEventListener('products-loaded', this.handleProductsLoaded);
  },
  methods: {
    loadProducts() {
      // Get featured products
      this.featuredProducts = ProductService.getFeaturedProducts(4);

      // Get products on sale
      this.saleProducts = ProductService.getProductsOnSale().slice(0, 4);

      // Get categories and add icons
      this.categories = ProductService.getCategories().map(category => {
        // Add appropriate Font Awesome icons based on category id
        const iconMap = {
          'pc': 'fas fa-laptop',
          'phones': 'fas fa-mobile-alt',
          'tablets': 'fas fa-tablet-alt',
          'watches': 'fas fa-clock',
          'audio': 'fas fa-headphones',
          'accessories': 'fas fa-keyboard'
        };
        
        return {
          ...category,
          icon: iconMap[category.id] || 'fas fa-box'
        };
      });
    },
    
    handleProductsLoaded() {
      this.loadProducts();
      this.isLoading = false;
    },
    
    truncateDescription(text) {
      return this.$filters.truncate(text, 80);
    }
  }
};

// Make the component globally available
window.HomePage = HomePage;