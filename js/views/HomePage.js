// =====================================================
// HomePage Component - Refactored for Better Maintainability
// =====================================================

// Configuration factory function
const createHomePageConfig = () => ({
  // App Constants Integration
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
  content: window.APP_CONSTANTS?.CONTENT || {
    featuredProductsCount: 3,
    reviewsPerPage: 4,
  },
  // UI Text Configuration
  text: {
    featuredSectionTitle: "Today's Special",
    featuredSectionSubtitle: "Most Popular Dishes",
    viewAllMenuText: "View All Menu",
    viewAllMenuAriaLabel: "View complete menu with all available dishes",
    loadingMessage: "Loading delicious options for you...",
    locationPlaceholder: "Enter your delivery address",
    searchPlaceholder: "Search for food or restaurants",
  },
});

// Static data factory functions
const createLatestNewsData = () => [
  {
    id: 1,
    title: "New Chef Special - Seafood Paella",
    date: "May 5 2025",
    excerpt: "Try our new chef special with fresh seafood caught daily.",
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
];

const createReviewsData = () => [
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
];

// =====================================================
// Main Component Definition
// =====================================================
const HomePage = {
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <div class="hero-content">
                <h1>FoodNow</h1>
                <p>Order with just a few clicks</p>
                <div class="hero-cta">
                  <router-link to="/product" class="btn-primary-custom">
                    <i class="fas fa-utensils"></i> Order Now
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="content-section bg-light">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">{{ config.text.featuredSectionTitle }}</h2>
            <p class="section-subtitle">{{ config.text.featuredSectionSubtitle }}</p>
          </div>
          <div class="row">
            <div class="col-12">
              <featured-products-section 
                :products="featuredProducts"
                :is-loading="isLoading"
                :load-error="loadError"
                :config="config"
                @retry-load="retryLoad"
                @product-feedback="handleProductCardFeedback"
              />
            </div>
          </div>
          
          <!-- View All Menu Button -->
          <div class="row mt-4">
            <div class="col-12 text-center">
              <router-link 
                to="/product" 
                class="btn-primary-custom"
                :aria-label="config.text.viewAllMenuAriaLabel"
              >
                {{ config.text.viewAllMenuText }}
                <i class="fas fa-arrow-right ms-2"></i>
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="content-section">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <how-it-works-section />
            </div>
          </div>
        </div>
      </section>

      <!-- News and Reviews Section -->
      <section class="content-section bg-light">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <news-reviews-section 
                :latest-news="latestNews"
                :current-review="currentReview"
                @prev-review="prevReview"
                @next-review="nextReview"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  // =====================================================
  // Component Registration
  // =====================================================
  components: {
    "featured-products-section": window.FeaturedProductsSection,
    "how-it-works-section": window.HowItWorksSection,
    "news-reviews-section": window.NewsReviewsSection,
  },
  // =====================================================
  // Component Data - Simplified and Organized
  // =====================================================
  data() {
    console.log("HomePage: Initializing data...");
    return {
      // Core component state
      isLoading: true,
      loadError: null,
      retryCount: 0,

      // Configuration
      config: createHomePageConfig(),

      // Search functionality
      searchQuery: "",
      searchResults: [],
      searchTimeout: null, // Content data
      featuredProducts: [],
      currentReviewIndex: 0,
      reviewInterval: null,
      userLocation: null,
      restaurantLocation: null, // Added to store restaurant location when user is at restaurant

      // Static content
      latestNews: createLatestNewsData(),
      reviews: createReviewsData(),
    };
  },

  // =====================================================
  // Computed Properties - Clean and Focused
  // =====================================================
  computed: {
    /**
     * Current review for display
     */
    currentReview() {
      return this.reviews[this.currentReviewIndex] || this.reviews[0];
    },

    /**
     * Component health status
     */
    isHealthy() {
      return !this.loadError && this.featuredProducts.length > 0;
    },

    /**
     * Loading states for UI
     */
    loadingStates() {
      return {
        hasProducts: this.featuredProducts.length > 0,
        isFullyLoaded: !this.isLoading && this.isHealthy,
      };
    },
  },

  // =====================================================
  // Lifecycle Hooks
  // =====================================================
  async mounted() {
    await this.initializeComponent();
  },

  beforeUnmount() {
    this.cleanup();
  },

  // =====================================================
  // Methods - Organized by Concern
  // =====================================================
  methods: {
    // === INITIALIZATION METHODS ===

    /**
     * Initialize component with all required data
     */
    async initializeComponent() {
      this.isLoading = true;

      try {
        await this.loadData();
        this.setupPageEffects();
        this.startReviewCarousel();
        this.detectLocation();
      } catch (error) {
        this.handleError("Component initialization failed", error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load all required data
     */
    async loadData() {
      if (!window.ProductService) {
        throw new Error("ProductService not available");
      }
      await window.ProductService.ensureInitialized();

      const featured = await window.ProductService.getPopularProducts(3);

      // Set the available property based on stock levels
      this.featuredProducts = featured.map((product) => ({
        ...product,
        available: product.stock > 0,
      }));
      this.loadError = null;
      this.retryCount = 0;
    },

    // === SEARCH METHODS ===

    /**
     * Handle search input with debouncing
     */
    handleSearch() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Debounce search to avoid excessive API calls
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, this.config.search.debounceDelay);
    },

    /**
     * Perform actual search operation
     */
    async performSearch() {
      const query = this.searchQuery.trim();

      if (query.length < this.config.search.minQueryLength) {
        this.searchResults = [];
        return;
      }

      try {
        // Navigate to products page with search query
        this.$router.push({
          path: "/product",
          query: { search: query },
        });
      } catch (error) {
        console.error("Search navigation failed:", error);
      }
    },

    // === REVIEW CAROUSEL METHODS ===

    /**
     * Start automatic review carousel
     */
    startReviewCarousel() {
      if (!this.reviews || this.reviews.length === 0) {
        console.log("No reviews available for carousel");
        return;
      }

      this.reviewInterval = setInterval(() => {
        this.nextReview();
      }, 5000);
    },

    /**
     * Navigate to next review
     */
    nextReview() {
      if (this.reviews.length === 0) return;
      this.currentReviewIndex =
        (this.currentReviewIndex + 1) % this.reviews.length;
    },

    /**
     * Navigate to previous review
     */
    prevReview() {
      if (this.reviews.length === 0) return;
      this.currentReviewIndex =
        (this.currentReviewIndex - 1 + this.reviews.length) %
        this.reviews.length;
    },

    // === UTILITY METHODS ===

    /**
     * Generate stars HTML for rating display
     */
    generateStarsHTML(rating) {
      let html = "";
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      // Full stars
      for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
      }

      // Half star
      if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
      }

      // Empty stars
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
      }

      return html;
    },

    /**
     * Pluralize text based on count
     */
    pluralize(count, singular, plural) {
      if (window.Filters?.pluralize) {
        return window.Filters.pluralize(count, singular, plural);
      }

      const word = count === 1 ? singular : plural || singular + "s";
      return `${count} ${word}`;
    }, // === LOCATION METHODS ===

    /**
     * Detect user location - assuming user is at the restaurant location
     * Uses LocationService to manage shared location data
     */
    async detectLocation() {
      try {
        await window.LocationService.detectLocation();

        // Update local data from the service
        this.userLocation = window.LocationService.getUserLocation();
        this.restaurantLocation =
          window.LocationService.getRestaurantLocation();

        console.log("Location updated from LocationService");
      } catch (error) {
        console.warn("Location detection failed, using defaults");
        this.userLocation = null;
        this.restaurantLocation =
          window.LocationService.getRestaurantLocation();
      }
    },

    /**
     * Promisified getCurrentPosition
     */
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 600000, // 10 minutes
        });
      });
    },

    // === PAGE EFFECTS METHODS ===

    /**
     * Setup page effects and animations
     */
    setupPageEffects() {
      if (!("IntersectionObserver" in window)) {
        console.warn("IntersectionObserver not supported");
        return;
      }

      try {
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

        // Observe elements for animation (removed category-card)
        document
          .querySelectorAll(".process-card, .featured-product-card")
          .forEach((el) => observer.observe(el));

        console.log("HomePage effects initialized successfully");
      } catch (error) {
        console.warn("Error setting up page effects:", error);
      }
    },

    // === ERROR HANDLING METHODS ===

    /**
     * Handle component errors with proper logging
     */
    handleError(message, error) {
      console.error(message, error);

      // Use ErrorHandler service if available
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          component: "HomePage",
          action: "initialization",
          severity: window.ErrorHandler.SEVERITY.HIGH,
        });
      }

      // Show user-friendly error message
      if (window.ToastService) {
        const errorMessage =
          window.APP_CONSTANTS?.MESSAGES?.ERROR?.COMPONENT_LOAD ||
          "Failed to load page content";
        window.ToastService.show(errorMessage, "error");
      }
    },

    /**
     * Handle load errors with retry logic
     */
    handleLoadError(error) {
      console.error("Error loading product data:", error);

      if (this.retryCount < this.config.ui.maxRetries) {
        this.loadError = `Loading failed. Retrying... (${this.retryCount + 1}/${
          this.config.ui.maxRetries
        })`;
        this.retryCount++;

        setTimeout(() => {
          this.loadData();
        }, this.config.ui.retryDelay * this.retryCount);
      } else {
        this.loadError =
          window.APP_CONSTANTS?.MESSAGES?.ERROR?.LOAD_FAILED ||
          "Failed to load content. Please refresh the page.";
        this.featuredProducts = [];
      }
    },

    // === EVENT HANDLERS ===

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
        await this.loadData();
      } catch (error) {
        this.handleLoadError(error);
      } finally {
        this.isLoading = false;
      }
    },

    // === CLEANUP METHODS ===

    /**
     * Clean up intervals and event listeners
     */
    cleanup() {
      if (this.reviewInterval) {
        clearInterval(this.reviewInterval);
        this.reviewInterval = null;
      }
    },
  },
};

// Make the component globally available
window.HomePage = HomePage;
