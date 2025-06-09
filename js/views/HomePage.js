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
  analytics: window.APP_CONSTANTS?.ANALYTICS || {
    enabled: true,
    sessionTimeout: 1800000,
  },
  content: window.APP_CONSTANTS?.CONTENT || {
    featuredProductsCount: 8,
    maxCategoriesDisplay: 12,
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

// Category icon mapping
const getCategoryIconMap = () => ({
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
});

// =====================================================
// Main Component Definition
// =====================================================
const HomePage = {
  template: `
    <div class="home-page">
      <div class="container-fluid px-0">
        <!-- Featured Products Section -->
        <featured-products-section 
          :products="featuredProducts"
          :is-loading="isLoading"
          :load-error="loadError"
          :config="config"
          @retry-load="retryLoad"
          @product-feedback="handleProductCardFeedback"
        />

        <!-- Categories Section -->
        <categories-section 
          :categories="categories"
        />

        <!-- How It Works Section -->
        <how-it-works-section />        <!-- News and Reviews Section -->
        <news-reviews-section 
          :latest-news="latestNews"
          :current-review="currentReview"
          @prev-review="prevReview"
          @next-review="nextReview"
        />
      </div>
    </div>
  `, // =====================================================
  // Component Registration
  // =====================================================
  components: {
    "featured-products-section": window.FeaturedProductsSection,
    "categories-section": window.CategoriesSection,
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

      // Content data
      featuredProducts: [],
      categories: [],
      currentReviewIndex: 0,
      reviewInterval: null,
      userLocation: null,

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
        hasCategories: this.categories.length > 0,
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

      const [featured, categoriesData] = await Promise.all([
        window.ProductService.getPopularProducts(4),
        window.ProductService.getAllCategories(),
      ]);

      this.featuredProducts = featured;
      this.categories = this.processCategoriesData(categoriesData);
      this.loadError = null;
      this.retryCount = 0;
    },

    // === DATA PROCESSING METHODS ===

    /**
     * Process categories data with enhanced icons
     */
    processCategoriesData(categoriesData) {
      const iconMap = getCategoryIconMap();

      return categoriesData.map((category) => ({
        ...category,
        icon: iconMap[category.id.toLowerCase()] || "fas fa-utensils",
      }));
    }, // === REVIEW CAROUSEL METHODS ===

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
    },

    // === LOCATION METHODS ===

    /**
     * Detect user location for personalized content
     */
    async detectLocation() {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser");
        return;
      }

      try {
        const position = await this.getCurrentPosition();
        this.userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("Location detected:", this.userLocation);
      } catch (error) {
        console.warn("Location detection failed:", error);
        this.userLocation = null;
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

        // Observe elements for animation
        document
          .querySelectorAll(
            ".category-card, .process-card, .featured-product-card"
          )
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
        this.categories = [];
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
