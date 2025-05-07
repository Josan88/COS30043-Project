/**
 * HomePage Component
 * Landing page for the food ordering website
 */
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Hero Banner -->
      <div class="hero food-hero">
        <div class="container">
          <h1>Delicious Food Delivered</h1>
          <p>Order your favorite meals from the best local restaurants</p>
          <router-link to="/product" class="btn btn-primary">Order Now</router-link>
        </div>
      </div>
      
      <!-- Content Grid System - Main Container -->
      <div class="container mb-5">
        <!-- Quick Categories Section -->
        <div class="row mb-5 mt-4">
          <div class="col-12">
            <h2 class="text-center mb-4">Explore Our Menu</h2>
            <div class="row justify-content-center">
              <div v-for="category in categories" :key="category.id" class="col-6 col-md-4 col-lg-2 mb-4 text-center">
                <router-link :to="'/product?category=' + category.id" class="text-decoration-none">
                  <div class="category-card p-3 rounded">
                    <div class="category-icon mb-2">
                      <i :class="category.icon" class="fa-2x"></i>
                    </div>
                    <h3 class="h6 mb-0">{{ category.name }}</h3>
                    <small class="text-muted">({{ category.count }} items)</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Context Group 1: Featured Dishes -->
        <div class="row mb-5">
          <!-- Featured Dishes - Full Width -->
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Most Popular Dishes</h2>
              </div>
              <div class="card-body">
                <!-- Loading state for featured products -->
                <div v-if="isLoading && featuredProducts.length === 0" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading popular dishes...</p>
                </div>
                
                <div class="row">
                  <div v-for="product in featuredProducts" :key="product.id" class="col-12 col-sm-6 col-md-3 mb-4">
                    <product-card :product="product"></product-card>
                  </div>
                </div>
                <div class="text-center mt-3">
                  <router-link to="/product" class="btn btn-outline">View Full Menu</router-link>
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
                    <h2>Free Delivery on Orders Over RM50</h2>
                    <p class="lead">Get your favorite meals delivered to your doorstep for free! Order now.</p>
                    <div>
                      <router-link to="/product" class="btn btn-primary">Order Now</router-link>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <img src="https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80" 
                        alt="Food delivery illustration" 
                        class="banner-image">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Restaurant News - 1/3 Width -->
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">Food News</h2>
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

        <!-- How It Works Section -->
        <div class="row mb-5">
          <div class="col-12">
            <h2 class="text-center mb-4">How It Works</h2>
            <div class="row">
              <div class="col-md-4 text-center mb-3 mb-md-0">
                <div class="p-3">
                  <div class="process-icon mb-3">
                    <i class="fas fa-utensils fa-2x"></i>
                  </div>
                  <h3 class="h5">1. Choose Your Food</h3>
                  <p>Browse our menu and select your favorite dishes</p>
                </div>
              </div>
              <div class="col-md-4 text-center mb-3 mb-md-0">
                <div class="p-3">
                  <div class="process-icon mb-3">
                    <i class="fas fa-shopping-cart fa-2x"></i>
                  </div>
                  <h3 class="h5">2. Place Your Order</h3>
                  <p>Add to cart and securely checkout online</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="p-3">
                  <div class="process-icon mb-3">
                    <i class="fas fa-motorcycle fa-2x"></i>
                  </div>
                  <h3 class="h5">3. Receive Your Food</h3>
                  <p>Get your food delivered or pick it up at your convenience</p>
                </div>
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
      categories: [],
      isLoading: true,
      latestNews: [
        { title: 'New Chef Special - Seafood Paella', date: 'April 28, 2025' },
        { title: 'Introducing Our Plant-Based Menu', date: 'April 25, 2025' },
        { title: 'Extended Delivery Hours on Weekends', date: 'April 22, 2025' },
        { title: 'Join Our Loyalty Program for Exclusive Offers', date: 'April 18, 2025' }
      ]
    };
  },
  async created() { // Make created hook async
    this.isLoading = true;
    try {
      // Ensure ProductService is initialized before loading data
      await window.ProductService.ensureInitialized(); 
      // Load product data asynchronously
      await this.loadProducts(); 
    } catch (error) {
      console.error('Error initializing HomePage:', error);
      // Optionally set an error state for the UI
    } finally {
      this.isLoading = false;
    }
  },
  beforeDestroy() {
    // Remove event listener cleanup if listener is removed
  },
  methods: {
    async loadProducts() { // Make loadProducts async
      try {
        // Fetch data concurrently using Promise.all
        const [featured, categoriesData] = await Promise.all([
          window.ProductService.getPopularProducts(4), // Await async call
          window.ProductService.getAllCategories()     // Await async call
        ]);

        this.featuredProducts = featured;

        // Map categories (this part is synchronous)
        this.categories = categoriesData.map(category => {
          const iconMap = {
            'mains': 'fas fa-hamburger',
            'appetizers': 'fas fa-cheese',
            'sides': 'fas fa-french-fries',
            'desserts': 'fas fa-ice-cream',
            'drinks': 'fas fa-cocktail',
            'specials': 'fas fa-star',
            'burgers': 'fas fa-hamburger',
            'pizza': 'fas fa-pizza-slice',
            'salads': 'fas fa-seedling'
          };
          
          return {
            ...category,
            icon: iconMap[category.id] || ProductService.getCategoryIcon(category.name) || 'fas fa-utensils'
          };
        });

      } catch (error) {
        console.error('Error loading product data for HomePage:', error);
        // Handle error state in UI if necessary
        this.featuredProducts = [];
        this.categories = [];
      }
    },
    
    truncateDescription(text) {
      return this.$filters.truncate(text, 80);
    }
  }
};

// Make the component globally available
window.HomePage = HomePage;