/**
 * HomePage Component
 * Modern, visually engaging landing page for the food ordering platform
 */
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Hero Section with Video Background -->
      <div class="hero-section position-relative">
        <div class="video-overlay"></div>
        <video autoplay muted loop class="hero-video">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-preparing-a-delicious-meal-in-a-restaurant-kitchen-2359-large.mp4" type="video/mp4">
        </video>
        <div class="container position-relative hero-content">
          <div class="row">
            <div class="col-lg-8 col-md-10 mx-auto text-center py-5">
              <h1 class="display-3 fw-bold text-white mb-3 animated-text">Delicious Food <span class="text-primary">Delivered</span></h1>
              <p class="lead text-white mb-4 fs-4">Experience authentic flavors directly to your table</p>
              
              <!-- Enhanced Search Experience -->
              <div class="search-container bg-white p-4 rounded-lg shadow-lg">
                <form class="row g-3" @submit.prevent="searchFood">
                  <div class="col-md-5">
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-transparent border-0"><i class="fas fa-map-marker-alt text-primary"></i></span>
                      <input type="text" class="form-control border-0 shadow-none" placeholder="Your location" v-model="userLocation">
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-transparent border-0"><i class="fas fa-search text-primary"></i></span>
                      <input type="text" class="form-control border-0 shadow-none" placeholder="Search for food..." v-model="searchQuery">
                    </div>
                  </div>
                  <div class="col-md-2">
                    <button type="submit" class="btn btn-primary btn-lg w-100 pulsate-btn">
                      <i class="fas fa-utensils me-2"></i> Find
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content Container -->
      <div class="container-fluid px-0">
        <!-- Today's Special Carousel - Full Width -->
        <div class="special-offers py-5 bg-light">
          <div class="container">
            <div class="row mb-4">
              <div class="col-12 d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-primary fw-bold text-uppercase"><i class="fas fa-fire me-2"></i> Today's Specials</h6>
                  <h2 class="display-6 fw-bold mb-0">Featured Dishes</h2>
                </div>
                <router-link to="/product" class="btn btn-outline-primary">View All Menu</router-link>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading && featuredProducts.length === 0" class="text-center py-5">
              <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Discovering delicious dishes for you...</p>
            </div>
            
            <!-- Featured Products Cards with Hover Effects -->
            <div v-else class="position-relative featured-carousel">
              <div class="row">
                <div v-for="product in featuredProducts" :key="product.id" class="col-12 col-md-6 col-lg-3 mb-4">
                  <product-card :product="product" class="featured-product-card"></product-card>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Popular Categories with Modern Visual Style -->
        <div class="container my-5">
          <div class="row mb-4">
            <div class="col-12">
              <h6 class="text-primary fw-bold text-uppercase"><i class="fas fa-th-large me-2"></i> Browse By Category</h6>
              <h2 class="display-6 fw-bold mb-0">Explore Our Menu</h2>
              <p class="text-muted mt-2">Find your perfect meal from our diverse range of options</p>
            </div>
          </div>
          
          <div class="row g-4">
            <div v-for="category in categories" :key="category.id" class="col-6 col-sm-4 col-lg-2">
              <router-link :to="'/product?category=' + category.id" class="text-decoration-none">
                <div class="category-card rounded-circle text-center shadow-hover position-relative overflow-hidden">
                  <div class="category-image-container">
                    <i :class="[category.icon, 'category-icon fa-2x text-white']"></i>
                  </div>
                  <div class="category-info p-2">
                    <h5 class="mb-0 category-title">{{ category.name }}</h5>
                    <span class="badge rounded-pill bg-light text-dark">{{ category.count }} items</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Promotional Banner - Parallax Effect -->
        <div class="promo-banner parallax-section my-5">
          <div class="container">
            <div class="row">
              <div class="col-lg-6 col-md-8 py-5">
                <div class="promo-content bg-white bg-opacity-90 p-5 rounded-lg shadow-lg">
                  <span class="badge bg-danger fs-6 mb-3">Limited Time Offer</span>
                  <h2 class="display-5 fw-bold mb-3">Free Delivery on Your First Order</h2>
                  <p class="lead mb-4">Use code <span class="bg-primary text-white px-2 py-1 rounded">WELCOME</span> at checkout for free delivery on orders over RM50!</p>
                  <router-link to="/product" class="btn btn-lg btn-primary">
                    <i class="fas fa-shopping-basket me-2"></i> Order Now
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- How It Works - Modern Process Flow -->
        <div class="container my-5 py-5">
          <div class="row text-center mb-5">
            <div class="col-lg-8 mx-auto">
              <h6 class="text-primary fw-bold text-uppercase"><i class="fas fa-question-circle me-2"></i> Simple Process</h6>
              <h2 class="display-5 fw-bold mb-3">How FoodNow Works</h2>
              <p class="text-muted">We've made ordering your favorite meals quicker and easier than ever</p>
            </div>
          </div>
          
          <div class="row g-5">
            <div class="col-md-4">
              <div class="process-card border-0 h-100 position-relative text-center">
                <div class="process-icon-container">
                  <div class="process-icon-outer">
                    <div class="process-icon-inner">
                      <i class="fas fa-utensils fa-2x text-primary"></i>
                    </div>
                  </div>
                  <div class="process-step">1</div>
                </div>
                <h3 class="h4 my-4">Choose Your Meal</h3>
                <p class="text-muted mb-0">Browse our extensive menu featuring dishes from top local restaurants and select your favorites.</p>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="process-card border-0 h-100 position-relative text-center">
                <div class="process-icon-container">
                  <div class="process-icon-outer">
                    <div class="process-icon-inner">
                      <i class="fas fa-shopping-cart fa-2x text-primary"></i>
                    </div>
                  </div>
                  <div class="process-step">2</div>
                </div>
                <h3 class="h4 my-4">Complete Your Order</h3>
                <p class="text-muted mb-0">Customize your meal, add it to your cart, and check out with our secure payment options.</p>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="process-card border-0 h-100 position-relative text-center">
                <div class="process-icon-container">
                  <div class="process-icon-outer">
                    <div class="process-icon-inner">
                      <i class="fas fa-hand-holding-heart fa-2x text-primary"></i>
                    </div>
                  </div>
                  <div class="process-step">3</div>
                </div>
                <h3 class="h4 my-4">Enjoy Your Food</h3>
                <p class="text-muted mb-0">Receive your food delivered to your doorstep, pick it up, or enjoy it at our restaurant.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Two-Column Latest Updates & Customer Reviews Section -->
        <div class="container my-5">
          <div class="row g-4">
            <!-- Latest Updates -->
            <div class="col-lg-6 mb-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-header bg-white border-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <h2 class="h4 mb-0"><i class="far fa-newspaper text-primary me-2"></i> Latest Updates</h2>
                    <a href="#" class="btn btn-sm btn-outline text-primary">View All</a>
                  </div>
                </div>
                <div class="card-body p-0">
                  <ul class="list-group list-group-flush news-feed">
                    <li v-for="(news, index) in latestNews" :key="index" class="list-group-item border-start-0 border-end-0 px-4 py-3">
                      <div class="d-flex">
                        <div class="news-date me-3 text-center">
                          <span class="d-block fw-bold text-primary">{{ news.date.split(' ')[1] }}</span>
                          <small>{{ news.date.split(' ')[0] }}</small>
                        </div>
                        <div>
                          <h6 class="mb-1">{{ news.title }}</h6>
                          <small class="text-muted">{{ news.excerpt || 'Click to read more about this update...' }}</small>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Customer Reviews Carousel -->
            <div class="col-lg-6 mb-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-header bg-white border-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <h2 class="h4 mb-0"><i class="far fa-comments text-primary me-2"></i> Customer Feedback</h2>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-light" @click="prevReview">
                        <i class="fas fa-chevron-left"></i>
                      </button>
                      <button class="btn btn-sm btn-light" @click="nextReview">
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="card-body p-4">
                  <div class="testimonial-cards">
                    <div class="testimonial-card active">
                      <div class="d-flex mb-3">
                        <div class="text-warning">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="ms-auto">
                          <small class="text-muted">2 days ago</small>
                        </div>
                      </div>
                      <p class="testimonial-text">"The food arrived hot and fresh. Ordering was super easy and the delivery was faster than expected! Will definitely order again."</p>
                      <div class="d-flex align-items-center mt-4">
                        <img src="https://randomuser.me/api/portraits/women/32.jpg" class="rounded-circle me-3" width="50" height="50" alt="Customer">
                        <div>
                          <h6 class="mb-0">Sarah L.</h6>
                          <small class="badge bg-primary-subtle text-primary">Regular Customer</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile App Section with QR Code -->
        <div class="app-download-section bg-gradient py-5 mb-0">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-lg-6 mb-4 mb-lg-0">
                <h6 class="text-white text-uppercase fw-bold">Download Now</h6>
                <h2 class="display-5 fw-bold text-white mb-4">Get the FoodNow Mobile App</h2>
                <p class="lead text-white-75 mb-4">Enjoy a seamless food ordering experience with our mobile app. Get exclusive deals, track orders in real-time, and earn rewards with every purchase!</p>
                <div class="d-flex flex-wrap gap-3 mb-4">
                  <a href="#" class="btn btn-light btn-lg d-flex align-items-center">
                    <i class="fab fa-apple fa-2x me-3"></i>
                    <div class="text-start">
                      <small class="d-block">Download on the</small>
                      <strong>App Store</strong>
                    </div>
                  </a>
                  <a href="#" class="btn btn-light btn-lg d-flex align-items-center">
                    <i class="fab fa-google-play fa-2x me-3"></i>
                    <div class="text-start">
                      <small class="d-block">Get it on</small>
                      <strong>Google Play</strong>
                    </div>
                  </a>
                </div>
                <div class="download-qr d-flex align-items-center">
                  <div class="qr-code me-3 p-2 bg-white rounded">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://foodnow.example.com/app" width="80" height="80" alt="App QR Code">
                  </div>
                  <p class="text-white mb-0">Scan to download<br>the FoodNow App</p>
                </div>
              </div>
              <div class="col-lg-6 text-center">
                <img src="https://www.pngmart.com/files/21/iPhone-App-PNG-Pic.png" alt="FoodNow Mobile App" class="img-fluid app-mockup" style="max-height: 500px;">
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
      searchQuery: '',
      userLocation: '',
      currentReviewIndex: 0,
      latestNews: [
        { 
          title: 'New Chef Special - Seafood Paella', 
          date: 'May 5 2025',
          excerpt: 'Try our new chef special with fresh seafood caught daily.'
        },
        { 
          title: 'Introducing Our Plant-Based Menu', 
          date: 'May 2 2025',
          excerpt: 'Enjoy delicious plant-based alternatives to your favorite dishes.'
        },
        { 
          title: 'Extended Delivery Hours on Weekends', 
          date: 'Apr 28 2025',
          excerpt: 'We now deliver until 2 AM on Fridays and Saturdays!'
        },
        { 
          title: 'Join Our Loyalty Program for Exclusive Offers', 
          date: 'Apr 25 2025',
          excerpt: 'Earn points with every order and redeem for free food.'
        }
      ],
      reviews: [
        {
          name: "Sarah L.",
          type: "Regular Customer",
          image: "https://randomuser.me/api/portraits/women/32.jpg",
          rating: 5,
          date: "2 days ago",
          text: "The food arrived hot and fresh. Ordering was super easy and the delivery was faster than expected! Will definitely order again."
        },
        {
          name: "Michael T.",
          type: "Food Enthusiast",
          image: "https://randomuser.me/api/portraits/men/71.jpg",
          rating: 5,
          date: "1 week ago",
          text: "Great selection of restaurants and the app is so easy to use. Customer service is also top notch when I had questions!"
        },
        {
          name: "Jessica K.",
          type: "Loyal Customer",
          image: "https://randomuser.me/api/portraits/women/45.jpg",
          rating: 4.5,
          date: "3 days ago",
          text: "I love that I can track my order in real-time. The food is always as described and delicious! Just wish there were more dessert options."
        }
      ]
    };
  },
  async created() {
    this.isLoading = true;
    try {
      await window.ProductService.ensureInitialized(); 
      await this.loadProducts();
      this.setupPageEffects(); // Initialize special effects after page loads
    } catch (error) {
      console.error('Error initializing HomePage:', error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async loadProducts() {
      try {
        const [featured, categoriesData] = await Promise.all([
          window.ProductService.getPopularProducts(4),
          window.ProductService.getAllCategories()
        ]);

        this.featuredProducts = featured;

        // Enhanced category mapping with modern icons
        const iconMap = {
          'mains': 'fas fa-utensils',
          'appetizers': 'fas fa-cheese',
          'sides': 'fas fa-french-fries',
          'desserts': 'fas fa-ice-cream',
          'drinks': 'fas fa-cocktail',
          'specials': 'fas fa-star',
          'burgers': 'fas fa-hamburger',
          'pizza': 'fas fa-pizza-slice',
          'salads': 'fas fa-seedling',
          'breakfast': 'fas fa-egg',
          'seafood': 'fas fa-fish',
          'international': 'fas fa-globe-americas',
          'vegetarian': 'fas fa-leaf'
        };
        
        this.categories = categoriesData.map(category => {
          return {
            ...category,
            icon: iconMap[category.id.toLowerCase()] || 'fas fa-utensils'
          };
        });

      } catch (error) {
        console.error('Error loading product data for HomePage:', error);
        this.featuredProducts = [];
        this.categories = [];
      }
    },
    
    searchFood() {
      this.$router.push({ 
        path: '/product', 
        query: { 
          search: this.searchQuery,
          location: this.userLocation 
        } 
      });
    },
    
    nextReview() {
      const reviewCards = document.querySelectorAll('.testimonial-card');
      if (reviewCards.length > 0) {
        reviewCards[0].classList.remove('active');
        setTimeout(() => {
          this.currentReviewIndex = (this.currentReviewIndex + 1) % this.reviews.length;
          const nextReview = this.reviews[this.currentReviewIndex];
          
          const card = reviewCards[0];
          const starsHTML = this.getStarsHTML(nextReview.rating);
          
          card.querySelector('.text-warning').innerHTML = starsHTML;
          card.querySelector('small.text-muted').textContent = nextReview.date;
          card.querySelector('.testimonial-text').textContent = nextReview.text;
          card.querySelector('img').src = nextReview.image;
          card.querySelector('h6').textContent = nextReview.name;
          card.querySelector('small.badge').textContent = nextReview.type;
          
          card.classList.add('active');
        }, 300);
      }
    },
    
    prevReview() {
      const reviewCards = document.querySelectorAll('.testimonial-card');
      if (reviewCards.length > 0) {
        reviewCards[0].classList.remove('active');
        setTimeout(() => {
          this.currentReviewIndex = (this.currentReviewIndex - 1 + this.reviews.length) % this.reviews.length;
          const prevReview = this.reviews[this.currentReviewIndex];
          
          const card = reviewCards[0];
          const starsHTML = this.getStarsHTML(prevReview.rating);
          
          card.querySelector('.text-warning').innerHTML = starsHTML;
          card.querySelector('small.text-muted').textContent = prevReview.date;
          card.querySelector('.testimonial-text').textContent = prevReview.text;
          card.querySelector('img').src = prevReview.image;
          card.querySelector('h6').textContent = prevReview.name;
          card.querySelector('small.badge').textContent = prevReview.type;
          
          card.classList.add('active');
        }, 300);
      }
    },
    
    getStarsHTML(rating) {
      let html = '';
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
      }
      
      if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
      }
      
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
      }
      
      return html;
    },
    
    setupPageEffects() {
      // This would typically be done with native JS or added CSS
      // For the demo purposes, we're simulating the implementation
      console.log('Setting up homepage special effects');
      
      // In a real implementation, you would add:
      // 1. Parallax scrolling for the promo section
      // 2. Intersection Observer for fade-in animations
      // 3. Video background setup and fallbacks
    },
    
    truncateDescription(text) {
      return this.$filters.truncate(text, 80);
    }
  }
};

// Make the component globally available
window.HomePage = HomePage;