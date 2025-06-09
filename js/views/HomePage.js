const HomePage = {
  template: `
    <div class="home-page">
      <!-- Main Content Container -->
      <div class="container-fluid px-0">
        <!-- Today's Special Carousel - Full Width -->
        <div class="special-offers py-5 bg-light">
          <div class="container">
            <div class="row mb-4">
              <div class="col-12 d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-primary fw-bold text-uppercase">
                    <i class="fas fa-fire me-2"></i> {{ config.featuredSectionTitle }}
                  </h6>
                  <h2 class="display-6 fw-bold mb-0">{{ config.featuredSectionSubtitle }}</h2>
                </div>
                <router-link 
                  to="/product" 
                  class="btn btn-outline-primary"
                  :aria-label="config.viewAllMenuAriaLabel"
                >
                  {{ config.viewAllMenuText }}
                </router-link>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading && featuredProducts.length === 0" class="text-center py-5">
              <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">{{ config.loadingMessage }}</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="loadError" class="text-center py-5">
              <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ loadError }}
                <button 
                  @click="retryLoad" 
                  class="btn btn-sm btn-outline-warning ms-2"
                >
                  <i class="fas fa-redo me-1"></i>Retry
                </button>
              </div>
            </div>
            
            <!-- Enhanced Featured Products Cards with Scroll Animation -->
            <div v-else class="position-relative featured-carousel">
              <div class="row">
                <div 
                  v-for="(product, index) in featuredProducts" 
                  :key="product.id" 
                  class="col-12 col-md-6 col-lg-3 mb-4"
                  v-scroll-reveal="{ delay: index * 150, threshold: 0.2 }"
                >
                  <product-card 
                    :product="product" 
                    class="featured-product-card"
                    @show-feedback="handleProductCardFeedback"
                  ></product-card>
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
            <!-- Enhanced Categories with Animation and Better Filters -->
          <div class="row g-4">
            <div 
              v-for="(category, index) in categories" 
              :key="category.id" 
              class="col-6 col-sm-4 col-lg-2"
              v-scroll-reveal="{ delay: index * 100, threshold: 0.3 }"
            >
              <router-link :to="'/product?category=' + category.id" class="text-decoration-none">
                <div class="category-card rounded-circle text-center shadow-hover position-relative overflow-hidden">
                  <div class="category-image-container">
                    <i :class="[category.icon, 'category-icon fa-2x text-white']"></i>
                  </div>
                  <div class="category-info p-2">
                    <h5 class="mb-0 category-title">{{ category.name }}</h5>
                    <span class="badge rounded-pill bg-light text-dark">{{ pluralize(category.count, 'item') }}</span>
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
    </div>  `,

  data() {
    return {
      // === APP CONSTANTS INTEGRATION ===
      config: {
        // Get configuration from global constants with fallbacks
        ui: window.APP_CONSTANTS?.UI || {
          maxRetries: 3,
          retryDelay: 1000,
          debounceDelay: 300,
          animationDelay: 150,
          toastDuration: 3000,
          loadingTimeout: 10000,
        },
        search: window.APP_CONSTANTS?.SEARCH || {
          minQueryLength: 2,
          maxSuggestions: 10,
          debounceDelay: 300,
        },
        analytics: window.APP_CONSTANTS?.ANALYTICS || {
          enabled: true,
          sessionTimeout: 1800000, // 30 minutes
        },
        content: window.APP_CONSTANTS?.CONTENT || {
          featuredProductsCount: 8,
          maxCategoriesDisplay: 12,
          reviewsPerPage: 4,
        }, // Hero section configuration        // Search form configuration (kept for compatibility but not displayed)
        locationPlaceholder: "Enter your delivery address",
        searchPlaceholder: "Search for food or restaurants",
        searchButtonLabel: "Search for food",
        searchButtonText: "Find Food",
        searchingText: "Searching...",

        // Featured section configuration
        featuredSectionTitle: "Today's Special",
        featuredSectionSubtitle: "Most Popular Dishes",
        viewAllMenuText: "View All Menu",
        viewAllMenuAriaLabel: "View complete menu with all available dishes",
        loadingMessage: "Loading delicious options for you...",
      },

      // === COMPONENT STATE MANAGEMENT ===
      componentState: {
        isInitialized: false,
        isMounted: false,
        isLoading: true,
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        lastLoadTime: null,
        performanceMetrics: {
          loadStartTime: Date.now(),
          loadEndTime: null,
          renderTime: null,
          initialDataLoadTime: null,
        },
        debugMode: false,
      },

      // === CONTENT STATE ===
      content: {
        featuredProducts: [],
        categories: [],
        promotionalBanners: [],
        testimonials: [],
        latestNews: [
          {
            id: 1,
            title: "New Chef Special - Seafood Paella",
            date: "May 5 2025",
            excerpt:
              "Try our new chef special with fresh seafood caught daily.",
            category: "special-offers",
            priority: "high",
          },
          {
            id: 2,
            title: "Introducing Our Plant-Based Menu",
            date: "May 2 2025",
            excerpt:
              "Enjoy delicious plant-based alternatives to your favorite dishes.",
            category: "menu-updates",
            priority: "medium",
          },
          {
            id: 3,
            title: "Extended Delivery Hours on Weekends",
            date: "Apr 28 2025",
            excerpt: "We now deliver until 2 AM on Fridays and Saturdays!",
            category: "service-updates",
            priority: "high",
          },
          {
            id: 4,
            title: "Join Our Loyalty Program for Exclusive Offers",
            date: "Apr 25 2025",
            excerpt: "Earn points with every order and redeem for free food.",
            category: "loyalty",
            priority: "medium",
          },
        ],
        reviews: [
          {
            id: 1,
            name: "Sarah L.",
            type: "Regular Customer",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5,
            date: "2 days ago",
            text: "Amazing food quality and fast delivery! The spicy noodles were perfect.",
            verified: true,
            helpful: 24,
          },
          {
            id: 2,
            name: "Mike Chen",
            type: "Food Blogger",
            image: "https://randomuser.me/api/portraits/men/22.jpg",
            rating: 5,
            date: "1 week ago",
            text: "Best food delivery service in town. Great variety and excellent customer service.",
            verified: true,
            helpful: 18,
          },
          {
            id: 3,
            name: "Emma K.",
            type: "First-time Customer",
            image: "https://randomuser.me/api/portraits/women/45.jpg",
            rating: 4,
            date: "3 days ago",
            text: "Really impressed with the quality and packaging. Will definitely order again!",
            verified: true,
            helpful: 12,
          },
          {
            id: 4,
            name: "David R.",
            type: "Regular Customer",
            image: "https://randomuser.me/api/portraits/men/35.jpg",
            rating: 5,
            date: "5 days ago",
            text: "Consistent quality and always on time. My go-to food delivery app!",
            verified: true,
            helpful: 31,
          },
          {
            id: 5,
            name: "Michael T.",
            type: "Food Enthusiast",
            image: "https://randomuser.me/api/portraits/men/71.jpg",
            rating: 5,
            date: "1 week ago",
            text: "Great selection of restaurants and the app is so easy to use. Customer service is also top notch when I had questions!",
          },
          {
            id: 6,
            name: "Jessica K.",
            type: "Loyal Customer",
            image: "https://randomuser.me/api/portraits/women/45.jpg",
            rating: 4.5,
            date: "3 days ago",
            text: "I love that I can track my order in real-time. The food is always as described and delicious! Just wish there were more dessert options.",
          },
        ],
      },

      // === UI STATE MANAGEMENT ===
      ui: {
        isMobile: false,
        screenSize: "desktop",
        loadingStates: {
          featuredProducts: true,
          categories: true,
          testimonials: true,
          promotionalBanners: true,
        },
        modalStates: {
          videoModal: false,
          newsletterModal: false,
          feedbackModal: false,
        },
        carouselStates: {
          currentReviewIndex: 0,
          reviewInterval: null,
          autoPlay: true,
          reviewsPerPage: 1,
        },
        animationStates: {
          heroAnimated: false,
          categoriesAnimated: false,
          featuredAnimated: false,
        },
        scrollStates: {
          lastScrollPosition: 0,
          scrollDirection: "down",
          isScrollingToSection: false,
        },
      },

      // === SEARCH STATE ===
      search: {
        form: {
          location: "",
          query: "",
          category: "",
          priceRange: "all",
        },
        suggestions: {
          locations: [],
          queries: [],
          restaurants: [],
        },
        history: {
          recentSearches: [],
          popularSearches: [],
        },
        isSearching: false,
        hasSearched: false,
        lastSearchTime: null,
        results: {
          restaurants: [],
          dishes: [],
          categories: [],
        },
      },

      // === VALIDATION STATE ===
      validation: {
        search: {
          location: { isValid: true, message: "" },
          query: { isValid: true, message: "" },
        },
        newsletter: {
          email: { isValid: true, message: "" },
        },
        feedback: {
          rating: { isValid: true, message: "" },
          comment: { isValid: true, message: "" },
        },
      }, // === ANALYTICS STATE ===
      analytics: {
        pageLoadTime: Date.now(),
        sessionId:
          "session_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substr(2, 9),
        userInteractions: [],
        searchAnalytics: {
          queriesPerformed: 0,
          categoriesViewed: [],
          productsViewed: [],
          conversionEvents: [],
        },
        performanceMetrics: {
          timeToFirstByte: null,
          domContentLoaded: null,
          windowLoaded: null,
          featuredProductsLoadTime: null,
        },
        userBehavior: {
          timeOnPage: 0,
          scrollDepth: 0,
          maxScrollDepth: 0,
          clickPatterns: [],
          hoverDuration: {},
        },
      }, // === ERROR STATE ===
      errors: {
        featuredProducts: null,
        categories: null,
        search: null,
        general: null,
        lastErrorTime: null,
        errorHistory: [],
      }, // === FEATURE FLAGS ===
      features: {
        enableVideoBackground: false,
        enableAutoPlayCarousel: true,
        enableLazyLoading: true,
        enableAnalytics: true,
        enablePushNotifications: false,
        enableVoiceSearch: false,
        enableGeolocation: false,
        enableOfflineMode: false,
      },

      // === PERFORMANCE STATE ===
      performance: {
        componentMountTime: null,
        firstContentfulPaint: null,
        largestContentfulPaint: null,
        cumulativeLayoutShift: null,
        dataFetchTimes: {
          featuredProducts: null,
          categories: null,
          reviews: null,
        },
        renderMetrics: {
          heroSectionRender: null,
          categoriesRender: null,
          featuredProductsRender: null,
        },
      },

      // === ACCESSIBILITY STATE ===
      accessibility: {
        isHighContrast: false,
        isReducedMotion: false,
        isScreenReaderActive: false,
        keyboardNavigationEnabled: true,
        focusVisible: false,
        announcements: [],
      },

      // === CACHE STATE ===
      cache: {
        featuredProducts: {
          data: null,
          timestamp: null,
          ttl: 300000, // 5 minutes
        },
        categories: {
          data: null,
          timestamp: null,
          ttl: 600000, // 10 minutes
        },
        userPreferences: {
          data: null,
          timestamp: null,
          ttl: 86400000, // 24 hours
        },
      },

      // === DEBOUNCED METHODS ===
      debouncedMethods: {}, // Legacy compatibility (for backward compatibility)
      featuredProducts: [],
      categories: [],
      isLoading: true,
      isSearching: false,
      loadError: null,
      retryCount: 0,

      currentReviewIndex: 0,
      reviewInterval: null,
      latestNews: [],
      reviews: [],
      userLocation: null,
    };
  },
  computed: {
    /**
     * Get current review for display
     */
    currentReview() {
      return this.reviews[this.currentReviewIndex] || this.reviews[0];
    },

    /**
     * Get analytics data object for tracking
     */
    analyticsData() {
      return {
        pageLoadTime: Date.now() - this.analytics.pageLoadTime,
        sessionId: this.analytics.sessionId,
        userInteractions: this.analytics.userInteractions.length,
        searchesPerformed: this.analytics.searchAnalytics.queriesPerformed,
        categoriesViewed:
          this.analytics.searchAnalytics.categoriesViewed.length,
        productsViewed: this.analytics.searchAnalytics.productsViewed.length,
        scrollDepth: this.analytics.userBehavior.maxScrollDepth,
        timeOnPage: this.analytics.userBehavior.timeOnPage,
        hasVideoError: this.errors.video,
        hasLoadError:
          !!this.errors.featuredProducts || !!this.errors.categories,
        retryCount: this.componentState.retryCount,
        featureFlags: this.features,
        performanceMetrics: this.performance.dataFetchTimes,
      };
    },

    /**
     * Get component health status
     */
    componentHealth() {
      return {
        isHealthy: !this.componentState.hasError && !this.errors.general,
        hasDataErrors: !!(
          this.errors.featuredProducts || this.errors.categories
        ),
        hasVideoFallback: this.errors.video,
        isFullyLoaded:
          !this.componentState.isLoading && this.componentState.isInitialized,
        errorCount: this.errors.errorHistory.length,
        retryCount: this.componentState.retryCount,
        lastLoadTime: this.componentState.lastLoadTime,
        performanceScore: this.calculatePerformanceScore(),
      };
    },

    /**
     * Get responsive UI settings
     */
    responsiveSettings() {
      return {
        isMobile: this.ui.isMobile,
        screenSize: this.ui.screenSize,
        shouldShowMobileNav: this.ui.screenSize === "mobile",
        cardsPerRow:
          this.ui.screenSize === "mobile"
            ? 1
            : this.ui.screenSize === "tablet"
            ? 2
            : 4,
        shouldUseParallax:
          this.ui.screenSize !== "mobile" &&
          !this.accessibility.isReducedMotion,
        shouldAutoPlayCarousel:
          this.features.enableAutoPlayCarousel &&
          !this.accessibility.isReducedMotion,
      };
    },

    /**
     * Get search suggestions based on current input
     */
    searchSuggestions() {
      const query = this.search.form.query.toLowerCase();
      const location = this.search.form.location.toLowerCase();

      return {
        queries: this.search.suggestions.queries
          .filter((s) => s.toLowerCase().includes(query))
          .slice(0, this.config.search.maxSuggestions),
        locations: this.search.suggestions.locations
          .filter((s) => s.toLowerCase().includes(location))
          .slice(0, this.config.search.maxSuggestions),
        restaurants: this.search.suggestions.restaurants
          .filter(
            (s) =>
              s.name.toLowerCase().includes(query) ||
              s.cuisine.toLowerCase().includes(query)
          )
          .slice(0, this.config.search.maxSuggestions),
      };
    },

    /**
     * Get validation status for all forms
     */
    validationStatus() {
      return {
        search: {
          isValid:
            this.validation.search.location.isValid &&
            this.validation.search.query.isValid,
          errors: [
            ...(!this.validation.search.location.isValid
              ? [this.validation.search.location.message]
              : []),
            ...(!this.validation.search.query.isValid
              ? [this.validation.search.query.message]
              : []),
          ],
        },
        newsletter: {
          isValid: this.validation.newsletter.email.isValid,
          errors: !this.validation.newsletter.email.isValid
            ? [this.validation.newsletter.email.message]
            : [],
        },
        feedback: {
          isValid:
            this.validation.feedback.rating.isValid &&
            this.validation.feedback.comment.isValid,
          errors: [
            ...(!this.validation.feedback.rating.isValid
              ? [this.validation.feedback.rating.message]
              : []),
            ...(!this.validation.feedback.comment.isValid
              ? [this.validation.feedback.comment.message]
              : []),
          ],
        },
      };
    },

    /**
     * Get cache status for all cached data
     */
    cacheStatus() {
      const now = Date.now();
      return {
        featuredProducts: {
          isValid:
            this.cache.featuredProducts.timestamp &&
            now - this.cache.featuredProducts.timestamp <
              this.cache.featuredProducts.ttl,
          age: this.cache.featuredProducts.timestamp
            ? now - this.cache.featuredProducts.timestamp
            : 0,
          needsRefresh:
            !this.cache.featuredProducts.timestamp ||
            now - this.cache.featuredProducts.timestamp >=
              this.cache.featuredProducts.ttl,
        },
        categories: {
          isValid:
            this.cache.categories.timestamp &&
            now - this.cache.categories.timestamp < this.cache.categories.ttl,
          age: this.cache.categories.timestamp
            ? now - this.cache.categories.timestamp
            : 0,
          needsRefresh:
            !this.cache.categories.timestamp ||
            now - this.cache.categories.timestamp >= this.cache.categories.ttl,
        },
        userPreferences: {
          isValid:
            this.cache.userPreferences.timestamp &&
            now - this.cache.userPreferences.timestamp <
              this.cache.userPreferences.ttl,
          age: this.cache.userPreferences.timestamp
            ? now - this.cache.userPreferences.timestamp
            : 0,
          needsRefresh:
            !this.cache.userPreferences.timestamp ||
            now - this.cache.userPreferences.timestamp >=
              this.cache.userPreferences.ttl,
        },
      };
    },
  },
  created() {
    // Component initialization
    this.componentState.isInitialized = true;
  },
  async mounted() {
    this.isLoading = true;
    try {
      await this.initializeComponent();
      this.setupPageEffects();

      // Only start review carousel if reviews are available
      if (this.reviews && this.reviews.length > 0) {
        this.startReviewCarousel();
      }

      // Automatically detect location on mount
      this.detectLocation();
    } catch (error) {
      this.handleComponentError("Error initializing HomePage", error);
    } finally {
      this.isLoading = false;
    }
  },

  beforeUnmount() {
    // Clean up intervals and event listeners
    if (this.reviewInterval) {
      clearInterval(this.reviewInterval);
    }
  },

  methods: {
    /**
     * Initialize component with required data
     */
    async initializeComponent() {
      try {
        if (window.ProductService) {
          await window.ProductService.ensureInitialized();
          await this.loadProducts();
        } else {
          throw new Error("ProductService not available");
        }
      } catch (error) {
        throw new Error(`Component initialization failed: ${error.message}`);
      }
    },

    /**
     * Load products and categories with retry logic
     */
    async loadProducts() {
      try {
        const [featured, categoriesData] = await Promise.all([
          window.ProductService.getPopularProducts(4),
          window.ProductService.getAllCategories(),
        ]);

        this.featuredProducts = featured;
        this.categories = this.processCategoriesData(categoriesData);
        this.loadError = null;
        this.retryCount = 0;
      } catch (error) {
        this.handleLoadError(error);
      }
    },

    /**
     * Process categories data with enhanced icons
     */
    processCategoriesData(categoriesData) {
      const iconMap = {
        mains: "fas fa-utensils",
        appetizers: "fas fa-cheese",
        sides: "fas fa-bread-slice",
        desserts: "fas fa-ice-cream",
        drinks: "fas fa-cocktail",
        specials: "fas fa-star",
        burgers: "fas fa-hamburger",
        pizza: "fas fa-pizza-slice",
        salads: "fas fa-seedling",
        breakfast: "fas fa-egg",
        seafood: "fas fa-fish",
        international: "fas fa-globe-americas",
        vegetarian: "fas fa-leaf",
      };

      return categoriesData.map((category) => ({
        ...category,
        icon: iconMap[category.id.toLowerCase()] || "fas fa-utensils",
      }));
    }
    /**
     * Detect user location for personalized content
     */,
    async detectLocation() {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              console.log("Location detected:", this.userLocation);
            },
            (error) => {
              console.warn("Location detection failed:", error);
              // Set a default location or continue without location
              this.userLocation = null;
            },
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 600000, // 10 minutes
            }
          );
        } else {
          console.warn("Geolocation is not supported by this browser");
          this.userLocation = null;
        }
      } catch (error) {
        console.error("Error in detectLocation:", error);
        this.userLocation = null;
      }
    }
    /**
     * Handle component errors with proper logging
     */,
    handleComponentError(message, error) {
      console.error(message, error);

      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          component: "HomePage",
          action: "initialization",
          severity: window.ErrorHandler.SEVERITY.HIGH,
        });
      }

      if (window.ToastService) {
        window.ToastService.show(
          window.APP_CONSTANTS?.MESSAGES?.ERROR?.COMPONENT_LOAD ||
            "Failed to load page content",
          "error"
        );
      }
    },

    /**
     * Handle load errors with retry logic
     */
    handleLoadError(error) {
      console.error("Error loading product data for HomePage:", error);

      if (this.retryCount < this.config.maxRetries) {
        this.loadError = `Loading failed. Retrying... (${this.retryCount + 1}/${
          this.config.maxRetries
        })`;
        this.retryCount++;

        setTimeout(() => {
          this.loadProducts();
        }, this.config.retryDelay * this.retryCount);
      } else {
        this.loadError =
          window.APP_CONSTANTS?.MESSAGES?.ERROR?.LOAD_FAILED ||
          "Failed to load content. Please refresh the page.";
        this.featuredProducts = [];
        this.categories = [];
      }
    },

    /**
     * Handle product card feedback
     */
    handleProductCardFeedback(event) {
      if (window.ToastService) {
        window.ToastService.show(event.message, event.type);
      }
    },

    /**
     * Retry loading products
     */
    async retryLoad() {
      this.loadError = null;
      this.retryCount = 0;
      this.isLoading = true;

      try {
        await this.loadProducts();
      } finally {
        this.isLoading = false;
      }
    }
    /**
     * Navigate to next review with smooth transition
     */,
    nextReview() {
      const reviewCards = document.querySelectorAll(".testimonial-card");
      if (reviewCards.length > 0) {
        this.transitionReview(1);
      }
    },

    /**
     * Navigate to previous review with smooth transition
     */
    prevReview() {
      const reviewCards = document.querySelectorAll(".testimonial-card");
      if (reviewCards.length > 0) {
        this.transitionReview(-1);
      }
    }
    /**
     * Handle review transition with direction
     */,
    transitionReview(direction) {
      const reviewCards = document.querySelectorAll(".testimonial-card");
      if (reviewCards.length === 0) return;

      // Check if reviews array is empty to prevent errors
      if (!this.reviews || this.reviews.length === 0) {
        console.warn("transitionReview called but no reviews available");
        return;
      }

      reviewCards[0].classList.remove("active");

      setTimeout(() => {
        if (direction > 0) {
          this.currentReviewIndex =
            (this.currentReviewIndex + 1) % this.reviews.length;
        } else {
          this.currentReviewIndex =
            (this.currentReviewIndex - 1 + this.reviews.length) %
            this.reviews.length;
        }

        const review = this.reviews[this.currentReviewIndex];
        this.updateReviewCard(reviewCards[0], review);
        reviewCards[0].classList.add("active");
      }, 300);
    }
    /**
     * Update review card content
     */,
    updateReviewCard(card, review) {
      // Check if review is defined to prevent errors when reviews array is empty
      if (!review) {
        console.warn("updateReviewCard called with undefined review");
        return;
      }

      const starsHTML = this.getStarsHTML(review.rating);

      card.querySelector(".text-warning").innerHTML = starsHTML;
      card.querySelector("small.text-muted").textContent = review.date;
      card.querySelector(".testimonial-text").textContent = review.text;
      card.querySelector("img").src = review.image;
      card.querySelector("h6").textContent = review.name;
      card.querySelector("small.badge").textContent = review.type;
    },
    /**
     * Start automatic review carousel
     */ startReviewCarousel() {
      // Check if reviews are available before starting carousel
      if (!this.reviews || this.reviews.length === 0) {
        console.log("startReviewCarousel called but no reviews available");
        return;
      }

      // Auto-rotate reviews every 5 seconds
      this.reviewInterval = setInterval(() => {
        this.nextReview();
      }, 5000);
    },

    /**
     * Generate stars HTML for rating display
     */
    getStarsHTML(rating) {
      let html = "";
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

    /**
     * Setup page effects and animations
     */
    setupPageEffects() {
      try {
        // Setup intersection observer for scroll animations
        if ("IntersectionObserver" in window) {
          const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
          };

          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("animate-in");
              }
            });
          }, observerOptions);

          // Observe elements for animation
          document
            .querySelectorAll(
              ".category-card, .process-card, .featured-product-card"
            )
            .forEach((el) => {
              observer.observe(el);
            });
        }

        // Setup parallax effect for promo banner
        this.setupParallaxEffect();

        console.log("HomePage effects initialized successfully");
      } catch (error) {
        console.warn("Error setting up page effects:", error);
      }
    },

    /**
     * Setup parallax scrolling effect
     */
    setupParallaxEffect() {
      const promoBanner = document.querySelector(".promo-banner");
      if (!promoBanner) return;

      const handleScroll =
        window.Helpers?.throttle(() => {
          const scrolled = window.pageYOffset;
          const parallaxElement = promoBanner.querySelector(".promo-content");

          if (parallaxElement) {
            const speed = scrolled * 0.5;
            parallaxElement.style.transform = `translateY(${speed}px)`;
          }
        }, 16) || (() => {}); // 60fps throttling

      window.addEventListener("scroll", handleScroll, { passive: true });
    },

    /**
     * Truncate description text
     */
    truncateDescription(text) {
      if (this.$truncate) {
        return this.$truncate(text, 80);
      }
      // Fallback implementation
      return text && text.length > 80 ? text.substring(0, 80) + "..." : text;
    },
    /**
     * Pluralize text based on count
     */
    pluralize(count, singular, plural) {
      if (window.Filters && window.Filters.pluralize) {
        return window.Filters.pluralize(count, singular, plural);
      }
      // Fallback implementation
      const word = count === 1 ? singular : plural || singular + "s";
      return `${count} ${word}`;
    },

    /**
     * Calculate performance score based on metrics
     */
    calculatePerformanceScore() {
      try {
        const metrics = this.performance.dataFetchTimes;
        const componentLoad =
          this.componentState.performanceMetrics.loadEndTime -
          this.componentState.performanceMetrics.loadStartTime;

        let score = 100;

        // Deduct points for slow data loading
        if (metrics.featuredProducts > 2000) score -= 20;
        else if (metrics.featuredProducts > 1000) score -= 10;

        if (metrics.categories > 1000) score -= 10;
        else if (metrics.categories > 500) score -= 5;

        // Deduct points for slow component loading
        if (componentLoad > 3000) score -= 30;
        else if (componentLoad > 1500) score -= 15;

        // Deduct points for errors
        score -= this.componentState.retryCount * 10;

        return Math.max(0, Math.min(100, score));
      } catch (error) {
        console.warn("Error calculating performance score:", error);
        return 50; // Default score
      }
    }
    /**
     * Track analytics events
     */,
    trackEvent(eventName, eventData = {}) {
      try {
        // Store event in local analytics
        const event = {
          name: eventName,
          data: eventData,
          timestamp: new Date().toISOString(),
          sessionId: this.analytics.sessionId,
        };

        this.analytics.userInteractions.push(event);

        // Send to external analytics if available
        if (window.analytics && typeof window.analytics.track === "function") {
          window.analytics.track(eventName, eventData);
        }

        // Log for debugging
        console.log("Analytics event tracked:", eventName, eventData);
      } catch (error) {
        console.warn("Error tracking analytics event:", error);
      }
    },

    /**
     * Generate unique session ID for analytics
     */
    generateSessionId() {
      return (
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    },
  },
};

// Make the component globally available
window.HomePage = HomePage;
