/**
 * ProductPage Component v2.0.0 - Enhanced Edition
 * 
 * FEATURES:
 * - ✅ Product Catalog: Browse menu items with advanced filtering and search
 * - ✅ Advanced Filtering: Category, price range, rating, dietary options, and more
 * - ✅ Product Details: Individual product view with customization options
 * - ✅ Cart Integration: Add items to cart with customizations and special instructions
 * - ✅ Search & Sort: Real-time search with multiple sorting options
 * - ✅ Pagination: Efficient navigation through large product catalogs
 * - ✅ Analytics: User behavior tracking and product interaction analytics
 * - ✅ Error Handling: Comprehensive error handling with retry mechanisms
 * - ✅ Accessibility: ARIA labels, keyboard navigation, screen reader support
 * - ✅ Performance: Optimized filtering and efficient state management
 * 
 * ENHANCED FEATURES:
 * - Constants integration via window.APP_CONSTANTS
 * - ValidationService integration with fallback validation
 * - Comprehensive error handling with ErrorHandler
 * - Analytics tracking with search and filter analytics
 * - Toast notifications for user feedback
 * - Retry mechanisms for failed operations
 * - Debounced search and filtering for better UX
 * - Accessibility improvements (ARIA, focus management)
 * - Mobile-responsive design considerations
 * - URL state management for bookmarkable filters
 * - Advanced product statistics and insights
 * - Customization modal integration
 * - Related products suggestions
 */
const ProductPage = {
  props: {
    id: {
      type: [Number, String],
      required: false,
      validator: function (value) {
        return value === null || value === undefined || !isNaN(Number(value));
      }
    }
  },
  template: `
    <div class="product-page">
      <!-- Loading State -->
      <div v-if="isLoading" class="container text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading menu items...</p>
      </div>

      <!-- Menu Listing View -->
      <div v-else-if="!currentProduct" class="product-listing">
        <div class="container">
          <h1 class="mb-4">Our Menu</h1>
            <!-- Enhanced Search with Custom Validation -->
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search menu..." 
                  v-model="searchQuery"
                  @keyup.enter="searchProducts"
                  aria-label="Search menu"
                  v-validate="{ 
                    rules: { minLength: 2, maxLength: 50 }, 
                    message: 'Search must be between 2-50 characters',
                    showSuccess: false
                  }"
                >
                <button class="btn btn-primary" type="button" @click="searchProducts">
                  <i class="fas fa-search"></i> Search
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select 
                class="form-select" 
                v-model="selectedCategory"
                @change="filterByCategory"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }} ({{ formatNumber(category.count) }})
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <select 
                class="form-select" 
                v-model="sortOption"
                @change="sortProducts"
                aria-label="Sort menu items"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline w-100" @click="resetFilters">
                <i class="fas fa-sync-alt"></i> Reset
              </button>
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="active-filters mb-4">
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="text-muted">Active filters:</span>
              <span v-if="selectedCategory" class="badge bg-primary">
                Category: {{ getCategoryLabel(selectedCategory) }}
                <button class="btn-close btn-close-white ms-2" @click="clearCategoryFilter" aria-label="Clear category filter"></button>
              </span>
              <span v-if="searchQuery" class="badge bg-primary">
                Search: "{{ searchQuery }}"
                <button class="btn-close btn-close-white ms-2" @click="clearSearchFilter" aria-label="Clear search filter"></button>
              </span>
              <span v-if="sortOption !== 'default'" class="badge bg-primary">
                Sort: {{ getSortLabel(sortOption) }}
                <button class="btn-close btn-close-white ms-2" @click="clearSortFilter" aria-label="Clear sort filter"></button>
              </span>
              <span v-if="priceRange.min > 0 || priceRange.max < 50" class="badge bg-primary">
                Price: RM{{ priceRange.min }} - RM{{ priceRange.max }}
                <button class="btn-close btn-close-white ms-2" @click="clearPriceFilter" aria-label="Clear price filter"></button>
              </span>
              <span v-for="diet in activeDietaryFilters" :key="diet" class="badge bg-success">
                {{ diet }}
                <button class="btn-close btn-close-white ms-2" @click="removeDietaryFilter(diet)" aria-label="Clear dietary filter"></button>
              </span>
            </div>
          </div>
            <!-- Enhanced Category Title & Statistics -->
          <div v-if="filteredProducts.length > 0" class="mb-4 d-flex justify-content-between align-items-center">
            <h2 v-if="selectedCategory">{{ getCategoryLabel(selectedCategory) }}</h2>
            <h2 v-else>All Menu Items</h2>
            <div class="text-muted mb-0">              {{ pluralize(filteredProducts.length, 'item') }} found
              <span v-if="productStats" class="ms-2">
                • Avg Price: RM{{ formatCurrency(productStats.averagePrice) }}
                • Avg Rating: <span v-html="formatStars(productStats.averageRating)"></span>
              </span>
            </div>
          </div>
          
          <!-- Additional Filters Section -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h3 class="h5 mb-0">Advanced Filters</h3>
                  <button class="btn btn-sm btn-link" @click="toggleAdvancedFilters">
                    {{ showAdvancedFilters ? 'Hide' : 'Show' }} Filters
                  </button>
                </div>
                <div class="card-body" v-show="showAdvancedFilters">
                  <div class="row">
                    <!-- Price Range Filter -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label d-flex justify-content-between">
                        <span>Price Range: RM{{ priceRange.min }} - RM{{ priceRange.max }}</span>
                      </label>
                      <div class="d-flex gap-2 align-items-center">
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="priceRange.min" 
                          min="0" 
                          max="49" 
                          step="5"
                          @change="applyFilters"
                        >
                        <span>to</span>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="priceRange.max" 
                          min="1" 
                          max="50" 
                          step="5"
                          @change="applyFilters"
                        >
                      </div>
                    </div>
                    
                    <!-- Rating Filter -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Minimum Rating</label>
                      <div class="rating-filter d-flex align-items-center">
                        <div class="d-flex">
                          <i 
                            v-for="star in 5" 
                            :key="star" 
                            class="fas fa-star me-1" 
                            :class="{ 'text-warning': star <= minRating, 'text-muted': star > minRating }"
                            @click="setMinRating(star)"
                            style="cursor: pointer;"
                          ></i>
                        </div>
                        <span class="ms-2">({{ minRating }}+ stars)</span>
                      </div>
                    </div>
                    
                    <!-- Dietary Options Filter -->
                    <div class="col-md-12 mb-3">
                      <label class="form-label">Dietary Preferences</label>
                      <div class="d-flex flex-wrap gap-2">                        <div v-for="option in dietaryOptions" :key="option.id" class="form-check form-check-inline">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="'diet-' + option.id" 
                            :value="option.id" 
                            v-model="selectedDietaryOptions"
                            @change="applyFilters"
                          >
                          <label class="form-check-label" :for="'diet-' + option.id">
                            {{ option.name }}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Preparation Time Filter -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Max Preparation Time: {{ maxPrepTime }} minutes</label>
                      <input 
                        type="range" 
                        class="form-range" 
                        v-model.number="maxPrepTime" 
                        min="5" 
                        max="40" 
                        step="5"
                        @change="applyFilters"
                      >
                    </div>
                    
                    <!-- Calories Filter -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Max Calories: {{ maxCalories }} cal</label>
                      <input 
                        type="range" 
                        class="form-range" 
                        v-model.number="maxCalories" 
                        min="200" 
                        max="1000" 
                        step="100"
                        @change="applyFilters"
                      >
                    </div>
                    
                    <!-- Discount Filter -->
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="onlyDiscount" v-model="onlyDiscount" @change="applyFilters">
                        <label class="form-check-label" for="onlyDiscount">
                          Show only special offers
                        </label>
                      </div>
                    </div>
                    
                    <!-- In Stock Filter -->
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="onlyInStock" v-model="onlyInStock" @change="applyFilters">
                        <label class="form-check-label" for="onlyInStock">
                          Show only available items
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <!-- Product Grid with enhanced v-for directive and custom directives -->
          <div v-if="paginatedProducts.length > 0" class="context-group">
            <h3 class="sr-only">Product Listing</h3>
            <div class="context-cards row-custom">
              <div 
                v-for="(product, index) in paginatedProducts" 
                :key="product.id" 
                class="col-custom col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"
                v-scroll-reveal="{ delay: index * 100, threshold: 0.1 }"
              >                <product-card 
                  :product="product"
                ></product-card>
              </div>
            </div>
          </div>
          
          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="pagination-container mt-4 mb-5">
            <nav aria-label="Product pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a 
                    class="page-link" 
                    href="#" 
                    @click.prevent="changePage(currentPage - 1)"
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                
                <li 
                  v-for="page in displayedPageNumbers" 
                  :key="page" 
                  class="page-item"
                  :class="{ active: currentPage === page, 'disabled': page === '...' }"
                >
                  <a 
                    class="page-link" 
                    href="#" 
                    @click.prevent="page === '...' ? null : changePage(page)"
                  >
                    {{ page }}
                  </a>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a 
                    class="page-link" 
                    href="#" 
                    @click.prevent="changePage(currentPage + 1)"
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="text-center mt-2">
              <label for="pageSize" class="me-2">Items per page:</label>
              <select 
                id="pageSize" 
                v-model.number="pageSize" 
                class="form-select form-select-sm d-inline-block" 
                style="width: auto;"
                @change="resetPagination"
              >
                <option>4</option>
                <option>6</option>
                <option>8</option>
                <option>12</option>
                <option>16</option>
              </select>
            </div>
          </div>
          
          <!-- No Products Found -->
          <div v-if="filteredProducts.length === 0 && !isLoading" class="text-center py-5">
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h3>No menu items found</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
            <button class="btn btn-primary" @click="resetFilters">Reset Filters</button>
          </div>
        </div>
      </div>
      
      <!-- Individual Food Item Detail View -->
      <div v-else class="product-detail">
        <div class="container">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
              <li class="breadcrumb-item"><router-link to="/product">Menu</router-link></li>
              <li class="breadcrumb-item"><router-link :to="'/product?category=' + currentProduct.category">{{ categoryName }}</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">{{ currentProduct.name }}</li>
            </ol>
          </nav>
          
          <div class="row">            <!-- Enhanced Food Image with Accessibility -->
            <div class="col-md-6 mb-4">              <div class="product-image-container">
                <img 
                  :src="currentProduct.image" 
                  :alt="currentProduct.name + ' - ' + currentProduct.description.substring(0, 100)"
                  class="product-image rounded"
                  v-accessible-image="{ 
                    src: currentProduct.image, 
                    alt: currentProduct.name + ' - ' + currentProduct.description.substring(0, 100),
                    fallback: '/images/placeholder-food.jpg',
                    loading: 'lazy'
                  }"
                >
                <div v-if="currentProduct.discount" class="discount-badge">
                  {{ formatPercentage(currentProduct.discount) }}% OFF
                </div>
              </div>
            </div>
            
            <!-- Food Info -->
            <div class="col-md-6 product-info">
              <h1 class="mb-2">{{ currentProduct.name }}</h1>
              
              <!-- Dietary Tags -->
              <div v-if="currentProduct.dietaryOptions && currentProduct.dietaryOptions.length > 0" class="mb-3">
                <span v-for="option in currentProduct.dietaryOptions" :key="option" class="badge bg-success me-1">
                  {{ option }}
                </span>
              </div>
                <!-- Enhanced Rating with Custom Filter -->              <div class="mb-3">
                <div class="ratings">
                  <span class="star-rating" v-html="formatStars(currentProduct.rating)"></span>
                  <span class="ms-2 text-muted">
                    {{ pluralize(currentProduct.reviewCount, 'review') }} 
                    ({{ formatPercentage(currentProduct.rating / 5 * 100) }}% satisfaction)
                  </span>
                </div>
              </div>
                <!-- Enhanced Price with Formatting -->              <div class="mb-3">
                <template v-if="currentProduct.discount">
                  <p class="text-decoration-line-through text-muted h5">{{ formatCurrency(currentProduct.price) }}</p>
                  <p class="price h3">{{ formatCurrency(discountedPrice) }}</p>
                  <p class="text-success">You save: {{ formatCurrency(savedAmount) }}</p>
                </template>
                <template v-else>
                  <p class="price h3">{{ formatCurrency(currentProduct.price + (currentProduct.customization?.extraPrice || 0)) }}</p>
                </template>
              </div>
                <!-- Enhanced Preparation Time & Calories -->              <div class="d-flex mb-3 text-muted">
                <div class="me-4">
                  <i class="far fa-clock me-1"></i> {{ formatRelativeTime(currentProduct.preparationTime) }}
                </div>
                <div>
                  <i class="fas fa-fire-alt me-1"></i> {{ formatNumber(currentProduct.calories) }} calories
                </div>
              </div>
              
              <!-- Availability -->
              <p class="mb-3">
                <span v-if="currentProduct.stock > 0" class="text-success">
                  <i class="fas fa-check-circle"></i> Available Now
                </span>
                <span v-else class="text-danger">
                  <i class="fas fa-times-circle"></i> Currently Unavailable
                </span>
              </p>
              
              <!-- Description -->
              <div class="mb-4">
                <h4>Description</h4>
                <p>{{ currentProduct.description }}</p>
              </div>
              
              <!-- Ingredients with Customization -->
              <div v-if="currentProduct.ingredients && currentProduct.ingredients.length > 0" class="mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <h4>Ingredients</h4>
                  <button @click="showCustomizationModal = true" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-utensils me-1"></i> Customize
                  </button>
                </div>
                
                <div class="ingredients-display p-3 bg-light rounded mt-2">
                  <!-- Base Ingredients -->
                  <div>
                    <p class="fw-medium mb-1">Base Ingredients:</p>
                    <ul class="ingredient-list">
                      <template v-for="(ing, i) in displayedIngredients" :key="i">
                        <li v-if="!isRemovedIngredient(ing)" class="ingredient-item">{{ getIngredientName(ing) }}</li>
                      </template>
                    </ul>
                  </div>
                  
                  <!-- Removed Ingredients -->
                  <div v-if="hasRemovedIngredients" class="mt-2">
                    <p class="fw-medium mb-1 text-danger">Removed:</p>
                    <ul class="ingredient-list removed">
                      <li v-for="(ing, i) in currentProduct.customization.removedIngredients" :key="'removed-'+i" 
                          class="ingredient-item removed">
                        <s>{{ ing }}</s>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Added Ingredients -->
                  <div v-if="hasAddedIngredients" class="mt-2">
                    <p class="fw-medium mb-1 text-success">Added:</p>
                    <ul class="ingredient-list added">
                      <li v-for="(ing, i) in currentProduct.customization.addedIngredients" :key="'added-'+i" 
                          class="ingredient-item added">
                        {{ ing.name }} <span v-if="ing.price > 0" class="extra-price">(+RM{{ ing.price.toFixed(2) }})</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Special Instructions -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <label for="special-instructions" class="form-label">Special Instructions</label>
                  <span v-if="hasCustomization" class="text-primary small cursor-pointer" @click="showCustomizationModal = true">
                    <i class="fas fa-edit me-1"></i>Edit
                  </span>
                </div>
                <textarea 
                  id="special-instructions" 
                  class="form-control" 
                  v-model="specialInstructions"
                  rows="2"
                  placeholder="Any special requests? (e.g., no onions, extra spicy)"
                ></textarea>
              </div>
              
              <!-- Quantity -->
              <div class="mb-4">
                <label for="quantity" class="form-label">Quantity</label>
                <div class="input-group" style="max-width: 150px;">
                  <button class="btn btn-outline" type="button" @click="decrementQuantity" :disabled="quantity <= 1">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" id="quantity" class="form-control text-center" v-model.number="quantity" min="1" :max="currentProduct.stock">
                  <button class="btn btn-outline" type="button" @click="incrementQuantity" :disabled="quantity >= currentProduct.stock">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="d-grid gap-2 d-md-flex">
                <button 
                  class="btn btn-primary btn-lg" 
                  @click="addToCart"
                  :disabled="currentProduct.stock === 0"
                >
                  <i class="fas fa-cart-plus"></i> Add to Order
                </button>
                <button class="btn btn-outline btn-lg" @click="showCustomizationModal = true">
                  <i class="fas fa-sliders-h"></i> Customize
                </button>
              </div>
            </div>
          </div>
          
          <!-- Related Items -->
          <div class="related-products mt-5">
            <h3 class="mb-4">You May Also Like</h3>
            <div class="row">
              <div v-for="product in relatedProducts" :key="product.id" class="col-6 col-md-3 mb-4">
                <product-card :product="product"></product-card>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Customization Modal -->
        <customization-modal 
          :product="currentProduct" 
          :show="showCustomizationModal"
          @close="showCustomizationModal = false"
          @save="applyCustomization"
        ></customization-modal>
      </div>
    </div>
  `,  data() {
    return {
      // Enhanced configuration with APP_CONSTANTS integration
      config: {
        // UI Configuration
        pageTitle: window.APP_CONSTANTS?.UI_LABELS?.MENU_TITLE || 'Our Menu',
        loadingMessage: window.APP_CONSTANTS?.UI_LABELS?.LOADING_MENU || 'Loading menu items...',
        searchPlaceholder: window.APP_CONSTANTS?.UI_LABELS?.SEARCH_PLACEHOLDER || 'Search menu...',
        noResultsTitle: window.APP_CONSTANTS?.UI_LABELS?.NO_RESULTS || 'No menu items found',
        noResultsMessage: window.APP_CONSTANTS?.UI_LABELS?.NO_RESULTS_MESSAGE || 'Try adjusting your search or filter to find what you\'re looking for.',
        
        // Pagination Configuration
        defaultPageSize: window.APP_CONSTANTS?.PAGINATION?.DEFAULT_SIZE || 6,
        maxPageLinksToShow: window.APP_CONSTANTS?.PAGINATION?.MAX_LINKS || 5,
        
        // Search and Validation Configuration
        searchMinLength: window.APP_CONSTANTS?.VALIDATION?.MIN_SEARCH_LENGTH || 2,
        searchMaxLength: window.APP_CONSTANTS?.VALIDATION?.MAX_SEARCH_LENGTH || 50,
        debounceDelay: window.APP_CONSTANTS?.UI_CONFIG?.DEBOUNCE_DELAY || 300,
        maxRetries: window.APP_CONSTANTS?.API?.MAX_RETRIES || 3,
        
        // Cart and Analytics Configuration
        addToCartSuccessMessage: window.APP_CONSTANTS?.MESSAGES?.CART_ADDED || 'Added to your order!',
        customizedItemSuffix: window.APP_CONSTANTS?.UI_LABELS?.CUSTOMIZED_SUFFIX || ' (Customized)',
        enableAnalytics: window.APP_CONSTANTS?.FEATURES?.ENABLE_ANALYTICS || true,
        
        // Performance Configuration
        scrollBehavior: window.APP_CONSTANTS?.UI_CONFIG?.SCROLL_BEHAVIOR || 'smooth',
        scrollOffset: window.APP_CONSTANTS?.UI_CONFIG?.SCROLL_OFFSET || 100,
        
        // Filter Configuration
        maxPriceRange: window.APP_CONSTANTS?.FILTERS?.MAX_PRICE || 50,
        maxPrepTime: window.APP_CONSTANTS?.FILTERS?.MAX_PREP_TIME || 40,
        maxCalories: window.APP_CONSTANTS?.FILTERS?.MAX_CALORIES || 1000
      },

      // Component State Management
      componentState: {
        isInitialized: false,
        hasError: false,
        errorMessage: null,
        retryCount: 0
      },

      // Data State
      products: [],
      isLoading: true,
      loadError: null,
      currentProduct: null,
      relatedProducts: [],

      // Search and Filtering State
      searchQuery: '',
      selectedCategory: '',
      sortOption: 'default',
      showAdvancedFilters: false,

      // Pagination State
      currentPage: 1,
      pageSize: 6,

      // Advanced Filter State
      priceRange: {
        min: 0,
        max: 50
      },
      minRating: 0,
      onlyDiscount: false,
      onlyInStock: false,
      selectedDietaryOptions: [],
      maxPrepTime: 40,
      maxCalories: 1000,

      // Product Detail State
      quantity: 1,
      specialInstructions: '',
      showCustomizationModal: false,

      // Data Collections
      categories: [],
      dietaryOptions: [
        { id: 'vegetarian', name: 'Vegetarian', icon: 'fas fa-leaf' },
        { id: 'vegan', name: 'Vegan', icon: 'fas fa-seedling' },
        { id: 'gluten-free', name: 'Gluten Free', icon: 'fas fa-wheat' },
        { id: 'dairy-free', name: 'Dairy Free', icon: 'fas fa-glass-milk' },
        { id: 'keto', name: 'Keto', icon: 'fas fa-bacon' },
        { id: 'halal', name: 'Halal', icon: 'fas fa-moon' },
        { id: 'spicy', name: 'Spicy', icon: 'fas fa-pepper-hot' }
      ],

      // Sort Options Configuration
      sortOptions: {
        'default': 'Featured',
        'price-asc': 'Price: Low to High',
        'price-desc': 'Price: High to Low',
        'rating-desc': 'Highest Rated',
        'name-asc': 'Name: A to Z',
        'name-desc': 'Name: Z to A',
        'prep-time-asc': 'Fastest First',
        'calories-asc': 'Lowest Calories'
      },

      // Error State Management
      errorState: {
        hasError: false,
        errorMessage: '',
        retryCount: 0,
        canRetry: true,
        lastErrorTime: null
      },

      // Validation State
      validation: {
        errors: {},
        debounceTimeouts: new Map(),
        isValidating: false
      },

      // Analytics State
      analytics: {
        sessionStart: Date.now(),
        searchCount: 0,
        filterUsage: {},
        productViews: [],
        cartAdditions: 0,
        pageViews: 0,
        timeOnPage: 0
      },

      // UI State Management
      uiState: {
        searchFocused: false,
        lastScrollPosition: 0,
        isMobile: false,
        touchStartY: 0,
        showScrollToTop: false
      },

      // Performance Tracking
      performance: {
        searchStartTime: null,
        filterAppliedTime: null,
        loadStartTime: null,
        renderStartTime: null
      }
    };
  },  computed: {
    // Enhanced filter products with performance optimization
    filteredProducts() {
      if (!this.products.length) return [];
      
      const startTime = performance.now();
      
      const filtered = this.products.filter(product => {
        // Category filter
        const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
        
        // Search query filter with enhanced matching
        const matchesSearch = !this.searchQuery || this.matchesSearchQuery(product);
        
        // Price range filter
        const effectivePrice = this.getEffectivePrice(product);
        const matchesPrice = effectivePrice >= this.priceRange.min && effectivePrice <= this.priceRange.max;
        
        // Rating filter
        const matchesRating = (product.rating || 0) >= this.minRating;
        
        // Discount filter
        const matchesDiscount = !this.onlyDiscount || (product.discount && product.discount > 0);
        
        // Stock filter
        const matchesStock = !this.onlyInStock || (product.stock && product.stock > 0);
        
        // Dietary options filter
        const matchesDietary = this.selectedDietaryOptions.length === 0 || 
          this.matchesDietaryOptions(product);
        
        // Preparation time filter
        const matchesPrepTime = !product.preparationTime || product.preparationTime <= this.maxPrepTime;
        
        // Calories filter
        const matchesCalories = !product.calories || product.calories <= this.maxCalories;
        
        return matchesCategory && matchesSearch && matchesPrice && 
               matchesRating && matchesDiscount && matchesStock &&
               matchesDietary && matchesPrepTime && matchesCalories;
      }).sort((a, b) => this.sortProducts(a, b));
      
      // Track filter performance
      const filterTime = performance.now() - startTime;
      if (this.config.enableAnalytics && filterTime > 50) {
        console.log(`Filter operation took ${filterTime.toFixed(2)}ms for ${this.products.length} products`);
      }
      
      return filtered;
    },
    
    // Enhanced pagination with performance considerations
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredProducts.slice(startIndex, endIndex);
    },
    
    // Enhanced pagination metadata
    paginationMeta() {
      return {
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        totalItems: this.filteredProducts.length,
        itemsPerPage: this.pageSize,
        startItem: ((this.currentPage - 1) * this.pageSize) + 1,
        endItem: Math.min(this.currentPage * this.pageSize, this.filteredProducts.length),
        hasPrevious: this.currentPage > 1,
        hasNext: this.currentPage < this.totalPages
      };
    },
    
    // Calculate total number of pages
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.pageSize);
    },
    
    // Enhanced page numbers with better logic
    displayedPageNumbers() {
      const pages = [];
      const maxPagesToShow = this.config.maxPageLinksToShow;
      const current = this.currentPage;
      const total = this.totalPages;
      
      if (total <= maxPagesToShow) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Complex pagination logic for better UX
        if (current <= 3) {
          for (let i = 1; i <= Math.min(maxPagesToShow - 1, total); i++) {
            pages.push(i);
          }
          if (total > maxPagesToShow - 1) {
            pages.push('...');
            pages.push(total);
          }
        } else if (current >= total - 2) {
          pages.push(1);
          if (total > maxPagesToShow - 1) {
            pages.push('...');
          }
          for (let i = Math.max(total - maxPagesToShow + 2, 2); i <= total; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    },
    
    // Enhanced active filters tracking
    hasActiveFilters() {
      return this.selectedCategory !== '' || 
             this.searchQuery !== '' || 
             this.sortOption !== 'default' ||
             this.priceRange.min > 0 ||
             this.priceRange.max < this.config.maxPriceRange ||
             this.minRating > 0 ||
             this.onlyDiscount ||
             this.onlyInStock ||
             this.selectedDietaryOptions.length > 0 ||
             this.maxPrepTime < this.config.maxPrepTime ||
             this.maxCalories < this.config.maxCalories;
    },
    
    // Active filter summary for display
    activeFilterSummary() {
      const filters = [];
      
      if (this.selectedCategory) {
        filters.push({ type: 'category', label: 'Category', value: this.getCategoryLabel(this.selectedCategory) });
      }
      if (this.searchQuery) {
        filters.push({ type: 'search', label: 'Search', value: `"${this.searchQuery}"` });
      }
      if (this.sortOption !== 'default') {
        filters.push({ type: 'sort', label: 'Sort', value: this.getSortLabel(this.sortOption) });
      }
      if (this.minRating > 0) {
        filters.push({ type: 'rating', label: 'Min Rating', value: `${this.minRating}+ stars` });
      }
      if (this.onlyDiscount) {
        filters.push({ type: 'discount', label: 'Filter', value: 'On Sale Only' });
      }
      if (this.onlyInStock) {
        filters.push({ type: 'stock', label: 'Filter', value: 'In Stock Only' });
      }
      if (this.selectedDietaryOptions.length > 0) {
        const options = this.selectedDietaryOptions.map(id => {
          const option = this.dietaryOptions.find(opt => opt.id === id);
          return option ? option.name : id;
        }).join(', ');
        filters.push({ type: 'dietary', label: 'Dietary', value: options });
      }
      
      return filters;
    },
    
    // Enhanced product statistics with error handling
    productStats() {
      if (this.filteredProducts.length === 0) return null;
      
      try {
        const products = this.filteredProducts;
        const prices = products.map(p => this.getEffectivePrice(p)).filter(p => p > 0);
        const ratings = products.map(p => p.rating || 0).filter(r => r > 0);
        
        return {
          totalProducts: products.length,
          averagePrice: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
          averageRating: ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0,
          priceRange: prices.length > 0 ? {
            min: Math.min(...prices).toFixed(2),
            max: Math.max(...prices).toFixed(2)
          } : { min: 0, max: 0 },
          categoryBreakdown: this.getCategoryBreakdown(products),
          dietaryBreakdown: this.getDietaryBreakdown(products),
          discountedItems: products.filter(p => p.discount && p.discount > 0).length,
          availableItems: products.filter(p => p.stock && p.stock > 0).length
        };
      } catch (error) {
        console.warn('Error calculating product statistics:', error);
        return null;
      }
    },
    
    // Validation states for UI feedback
    searchValidationState() {
      if (!this.searchQuery) return { isValid: true, message: null };
      
      const query = this.searchQuery.trim();
      if (query.length < this.config.searchMinLength) {
        return { 
          isValid: false, 
          message: `Search must be at least ${this.config.searchMinLength} characters` 
        };
      }
      if (query.length > this.config.searchMaxLength) {
        return { 
          isValid: false, 
          message: `Search must be less than ${this.config.searchMaxLength} characters` 
        };
      }
      
      return { isValid: true, message: null };
    },
    
    // Component ready state
    isComponentReady() {
      return this.componentState.isInitialized && 
             !this.isLoading && 
             !this.componentState.hasError;
    },
    
    // Error state management
    shouldShowRetry() {
      return this.componentState.hasError && 
             this.errorState.canRetry && 
             this.errorState.retryCount < this.config.maxRetries;
    },
    
    // Enhanced current product calculations
    discountedPrice() {
      if (!this.currentProduct) return 0;
      
      let basePrice = this.currentProduct.price || 0;
      if (this.currentProduct.customization?.extraPrice) {
        basePrice += this.currentProduct.customization.extraPrice;
      }
      
      if (!this.currentProduct.discount) return basePrice.toFixed(2);
      
      const discountAmount = basePrice * (this.currentProduct.discount / 100);
      return (basePrice - discountAmount).toFixed(2);
    },
    
    savedAmount() {
      if (!this.currentProduct?.discount) return 0;
      
      let basePrice = this.currentProduct.price || 0;
      if (this.currentProduct.customization?.extraPrice) {
        basePrice += this.currentProduct.customization.extraPrice;
      }
      
      return (basePrice * (this.currentProduct.discount / 100)).toFixed(2);
    },
    
    // Enhanced customization states
    displayedIngredients() {
      if (!this.currentProduct?.ingredients) return [];
      return this.currentProduct.ingredients;
    },
    
    hasRemovedIngredients() {
      return this.currentProduct?.customization?.removedIngredients?.length > 0;
    },
    
    hasAddedIngredients() {
      return this.currentProduct?.customization?.addedIngredients?.length > 0;
    },
    
    hasCustomization() {
      return this.hasRemovedIngredients || 
             this.hasAddedIngredients || 
             (this.currentProduct?.customization?.specialInstructions?.trim());
    },
    
    // Enhanced category management
    categoryName() {
      if (!this.currentProduct?.category) return '';
      return this.getCategoryLabel(this.currentProduct.category);
    },
    
    // Analytics computed properties
    analyticsData() {
      return {
        sessionDuration: Date.now() - this.analytics.sessionStart,
        searchCount: this.analytics.searchCount,
        filterUsageCount: Object.keys(this.analytics.filterUsage).length,
        productViewCount: this.analytics.productViews.length,
        cartAdditionCount: this.analytics.cartAdditions,
        pageViewCount: this.analytics.pageViews,
        currentFilters: this.activeFilterSummary.length,
        resultsCount: this.filteredProducts.length
      };
    },
    
    // UI state helpers
    isMobileView() {
      return this.uiState.isMobile || (typeof window !== 'undefined' && window.innerWidth < 768);
    },
      shouldShowScrollToTop() {
      return this.uiState.showScrollToTop && this.uiState.lastScrollPosition > 500;
    },
    
    // Active dietary filters for display
    activeDietaryFilters() {
      return this.selectedDietaryOptions.map(id => {
        const option = this.dietaryOptions.find(opt => opt.id === id);
        return option ? option.name : id;
      });
    }
  },
  watch: {
    // Enhanced route watching with analytics
    $route: {
      immediate: true,
      handler(to, from) {
        if (to.path === '/products') {
          this.analytics.pageViews++;
          this.loadData();
          this.updateRouteAnalytics(to, from);
        } else if (to.path.startsWith('/product/') && to.params.id) {
          // Handle individual product detail view
          this.analytics.pageViews++;
          this.loadProductDetails(to.params.id);
          this.updateRouteAnalytics(to, from);
        }
      }
    },
    
    // Enhanced search query watching with debounced validation
    searchQuery: {
      handler(newQuery, oldQuery) {
        // Clear existing timeout
        if (this.validation.debounceTimeouts.has('search')) {
          clearTimeout(this.validation.debounceTimeouts.get('search'));
        }
        
        // Set new debounced validation
        const timeout = setTimeout(() => {
          this.validateSearchQuery(newQuery);
          this.performDebouncedSearch(newQuery);
          this.trackSearchAnalytics(newQuery);
        }, this.config.debounceDelay);
        
        this.validation.debounceTimeouts.set('search', timeout);
        
        // Reset pagination when search changes
        this.currentPage = 1;
      }
    },
    
    // Enhanced filter watching with analytics
    selectedCategory: {
      handler(newCategory, oldCategory) {
        this.trackFilterUsage('category', newCategory);
        this.currentPage = 1;
        this.updateUrlParams();
      }
    },
    
    sortOption: {
      handler(newSort, oldSort) {
        this.trackFilterUsage('sort', newSort);
        this.currentPage = 1;
      }
    },
    
    // Price range watching with debounced validation
    'priceRange.min': {
      handler(newMin) {
        this.debouncedPriceValidation('min', newMin);
      }
    },
    
    'priceRange.max': {
      handler(newMax) {
        this.debouncedPriceValidation('max', newMax);
      }
    },
    
    // Rating filter watching
    minRating: {
      handler(newRating) {
        this.trackFilterUsage('rating', newRating);
        this.currentPage = 1;
      }
    },
    
    // Toggle filters watching
    onlyDiscount: {
      handler(newValue) {
        this.trackFilterUsage('discount', newValue);
        this.currentPage = 1;
      }
    },
    
    onlyInStock: {
      handler(newValue) {
        this.trackFilterUsage('stock', newValue);
        this.currentPage = 1;
      }
    },
    
    // Dietary options watching
    selectedDietaryOptions: {
      deep: true,
      handler(newOptions) {
        this.trackFilterUsage('dietary', newOptions);
        this.currentPage = 1;
      }
    },
    
    // Advanced filters watching
    maxPrepTime: {
      handler(newTime) {
        this.trackFilterUsage('prepTime', newTime);
        this.currentPage = 1;
      }
    },
    
    maxCalories: {
      handler(newCalories) {
        this.trackFilterUsage('calories', newCalories);
        this.currentPage = 1;
      }
    },
    
    // Product detail watching
    currentProduct: {
      immediate: true,
      handler(newProduct, oldProduct) {
        if (newProduct) {
          this.specialInstructions = newProduct.customization?.specialInstructions || '';
          this.quantity = 1;
          this.trackProductView(newProduct);
        }
      }
    },
    
    // Quantity watching with validation
    quantity: {
      handler(newQuantity) {
        if (this.currentProduct) {
          this.validateQuantity(newQuantity);
        }
      }
    },
    
    // Filtered products watching for performance
    filteredProducts: {
      handler(newProducts) {
        if (this.config.enableAnalytics) {
          this.analytics.lastFilterTime = Date.now();
        }
      }
    },
    
    // Component state watching
    'componentState.hasError': {
      handler(hasError) {
        if (hasError) {
          this.handleErrorStateChange();
        }
      }
    },
    
    // Loading state watching
    isLoading: {
      handler(loading) {
        if (!loading && this.performance.loadStartTime) {
          const loadTime = Date.now() - this.performance.loadStartTime;
          if (this.config.enableAnalytics) {
            console.log(`Product page loaded in ${loadTime}ms`);
          }
        }
      }
    }  },

  created() {
    try {
      // Initialize performance tracking
      this.performance.loadStartTime = Date.now();
      
      // Initialize debounced methods with error handling
      this.debouncedSearch = window.Helpers?.debounce(this.performDebouncedSearch, this.config.debounceDelay) || this.performDebouncedSearch;
      this.debouncedFilter = window.Helpers?.debounce(this.applyFiltersInternal, this.config.debounceDelay) || this.applyFiltersInternal;
      this.debouncedPriceValidation = window.Helpers?.debounce(this.validatePriceRange, this.config.debounceDelay) || this.validatePriceRange;
      
      // Initialize mobile detection
      this.detectMobileDevice();
      
      // Initialize analytics session
      this.analytics.sessionStart = Date.now();
      
      if (this.config.enableAnalytics) {
        console.log('ProductPage component created');
      }
    } catch (error) {
      console.error('Error in created lifecycle:', error);
      this.componentState.hasError = true;
      this.componentState.errorMessage = 'Failed to initialize component';
    }
  },

  async mounted() {
    try {
      this.isLoading = true;
      this.componentState.isInitialized = false;
      
      // Initialize core component functionality
      await this.initializeComponent();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup route parameter handling
      this.setupRouteHandling();
      
      // Track initial page view
      this.trackPageView();
      
      // Initialize UI state
      this.initializeUIState();
      
      // Mark component as initialized
      this.componentState.isInitialized = true;
      
      if (this.config.enableAnalytics) {
        const initTime = Date.now() - this.performance.loadStartTime;
        console.log(`ProductPage initialized in ${initTime}ms`);
      }
      
    } catch (error) {
      this.handleComponentError('Error mounting ProductPage', error);
    } finally {
      this.isLoading = false;
    }
  },

  beforeUnmount() {
    try {
      // Clean up event listeners
      this.removeEventListeners();
      
      // Clear debounce timeouts
      this.clearValidationTimeouts();
      
      // Track session end analytics
      if (this.config.enableAnalytics) {
        this.trackSessionEnd();
      }
      
      // Reset component state
      this.componentState.isInitialized = false;
      
      if (this.config.enableAnalytics) {
        console.log('ProductPage component unmounted');
      }
    } catch (error) {
      console.error('Error in beforeUnmount lifecycle:', error);
    }
  },methods: {
    /**
     * Initialize component with required services and data
     */
    async initializeComponent() {
      try {
        if (!window.ProductService) {
          throw new Error('ProductService not available');
        }

        await window.ProductService.ensureInitialized();
        await this.loadData();
        
        // Listen for products loaded event
        if (typeof window !== 'undefined') {
          window.addEventListener('products-loaded', this.handleProductsLoaded);
        }

      } catch (error) {
        throw new Error(`Component initialization failed: ${error.message}`);
      }
    },

    /**
     * Setup route parameter handling
     */
    setupRouteHandling() {
      // Check for query parameters in URL
      if (this.$route.query.category) {
        this.selectedCategory = this.$route.query.category;
      }
      if (this.$route.query.search) {
        this.searchQuery = this.$route.query.search;
      }
      if (this.$route.query.page) {
        this.currentPage = parseInt(this.$route.query.page) || 1;
      }
    },

    /**
     * Track page view for analytics
     */
    trackPageView() {
      if (this.config.enableAnalytics && window.analytics) {
        window.analytics.track('product_page_view', {
          route: this.$route.path,
          query: this.$route.query,
          timestamp: new Date().toISOString()
        });
      }
    },

    /**
     * Handle component errors with proper logging and user feedback
     */
    handleComponentError(message, error) {
      console.error(message, error);
      
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          component: 'ProductPage',
          action: 'initialization',
          severity: 'high'
        });
      }

      if (window.ToastService) {
        window.ToastService.show(
          window.APP_CONSTANTS?.MESSAGES?.ERROR?.COMPONENT_LOAD || 'Failed to load page content',
          'error'
        );
      }

      this.loadError = window.APP_CONSTANTS?.MESSAGES?.ERROR?.LOAD_FAILED || 'Failed to load content. Please refresh the page.';
    },

    /**
     * Load all required data with error handling and retry logic
     */
    async loadData() {
      try {
        const [products, categories] = await Promise.all([
          window.ProductService.getAllProducts(),
          window.ProductService.getAllCategories()
        ]);

        this.products = products;
        this.categories = categories;
        this.loadError = null;
        this.retryCount = 0;

        // If id is provided in route, load specific product
        if (this.id || this.$route.params.id) {
          const productId = this.id || this.$route.params.id;
          await this.loadProductDetails(productId);
        } else {
          this.currentProduct = null;
        }

      } catch (error) {
        this.handleLoadError('Failed to load product data', error);
      }
    },

    /**
     * Handle load errors with retry logic
     */
    handleLoadError(message, error) {
      console.error(message, error);
      
      if (this.retryCount < this.config.maxRetries) {
        this.loadError = `${message}. Retrying... (${this.retryCount + 1}/${this.config.maxRetries})`;
        this.retryCount++;
        
        setTimeout(() => {
          this.loadData();
        }, 1000 * this.retryCount);
      } else {
        this.loadError = window.APP_CONSTANTS?.MESSAGES?.ERROR?.LOAD_FAILED || 'Failed to load content. Please refresh the page.';
        
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, {
            component: 'ProductPage',
            action: 'data_load',
            severity: 'medium'
          });
        }
      }
    },

    /**
     * Retry loading data
     */
    async retryLoad() {
      this.loadError = null;
      this.retryCount = 0;
      this.isLoading = true;
      
      try {
        await this.loadData();
      } finally {
        this.isLoading = false;
      }
    },
      /**
     * Load specific product details with related products
     */
    async loadProductDetails(productId) {
      try {
        this.currentProduct = await window.ProductService.getProductById(productId);
        
        if (this.currentProduct) {
          this.resetProductState();
          await this.loadRelatedProducts();
          this.trackProductView();
        } else {
          throw new Error(`Product with ID ${productId} not found`);
        }

      } catch (error) {
        console.error('Error loading product details:', error);
        this.currentProduct = null;
        
        if (window.ToastService) {
          window.ToastService.show('Product not found', 'error');
        }
        
        // Redirect to product listing
        this.$router.push('/product');
      }
    },

    /**
     * Reset product-specific state
     */
    resetProductState() {
      this.quantity = 1;
      this.specialInstructions = '';
      this.showCustomizationModal = false;
    },

    /**
     * Load related products for the current product
     */
    async loadRelatedProducts() {
      try {
        if (!this.currentProduct?.category) return;

        const categoryProducts = await window.ProductService.getProductsByCategory(this.currentProduct.category);
        this.relatedProducts = categoryProducts
          .filter(product => product.id !== this.currentProduct.id)
          .slice(0, 4);

      } catch (error) {
        console.warn('Error loading related products:', error);
        this.relatedProducts = [];
      }
    },

    /**
     * Track product view for analytics
     */
    trackProductView() {
      if (this.config.enableAnalytics && window.analytics && this.currentProduct) {
        window.analytics.track('product_view', {
          productId: this.currentProduct.id,
          productName: this.currentProduct.name,
          category: this.currentProduct.category,
          price: this.currentProduct.price,
          timestamp: new Date().toISOString()
        });
      }
    },

    /**
     * Handle products loaded event
     */
    handleProductsLoaded() {
      this.loadData();
      this.isLoading = false;
    },

    /**
     * Enhanced search with validation and analytics
     */
    searchProducts() {
      // Validate search query
      if (!this.validateSearchQuery()) {
        return;
      }

      this.searchStartTime = Date.now();
      this.debouncedSearch();
    },

    /**
     * Enhanced debounced search with performance tracking
     */
    performDebouncedSearch(query) {
      if (!query || !query.trim()) {
        this.currentPage = 1;
        return;
      }
      
      const startTime = performance.now();
      
      try {
        // Track search analytics
        this.trackSearchAnalytics(query);
        
        // Update URL parameters
        this.updateUrlParams();
        
        // Reset pagination
        this.currentPage = 1;
        
        // Log search performance
        const searchTime = performance.now() - startTime;
        if (this.config.enableAnalytics && searchTime > 10) {
          console.log(`Search operation took ${searchTime.toFixed(2)}ms`);
        }
        
      } catch (error) {
        console.error('Error in debounced search:', error);
        this.handleSearchError(error);
      }
    },

    /**
     * Handle search errors gracefully
     */
    handleSearchError(error) {
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          component: 'ProductPage',
          action: 'search',
          severity: 'low'
        });
      }
      
      if (window.ToastService) {
        window.ToastService.show('Search encountered an error', 'warning');
      }
    },
    
    /**
     * Validate search query
     */
    validateSearchQuery() {
      const query = this.searchQuery.trim();
      
      // Clear previous validation errors
      this.validationErrors.search = null;

      if (query.length === 0) {
        this.resetFilters();
        return false;
      }

      if (query.length < this.config.searchMinLength) {
        this.validationErrors.search = `Search must be at least ${this.config.searchMinLength} characters`;
        return false;
      }

      if (query.length > this.config.searchMaxLength) {
        this.validationErrors.search = `Search must be less than ${this.config.searchMaxLength} characters`;
        return false;
      }

      return true;
    },
    
    /**
     * Filter products by category
     */
    filterByCategory() {
      this.updateURL({ category: this.selectedCategory || undefined, page: 1 });
      this.currentPage = 1;
      this.trackFilterUsage('category', this.selectedCategory);
    },
    
    /**
     * Sort products
     */
    sortProducts() {
      this.currentPage = 1;
      this.trackFilterUsage('sort', this.sortOption);
    },
    
    /**
     * Apply filters with debouncing
     */
    applyFilters() {
      this.filterAppliedTime = Date.now();
      this.debouncedFilter();
    },

    /**
     * Internal filter application
     */
    applyFiltersInternal() {
      this.currentPage = 1;
      
      // Track filter performance
      if (this.filterAppliedTime) {
        const filterTime = Date.now() - this.filterAppliedTime;
        console.log(`Filters applied in ${filterTime}ms`);
      }

      this.trackAdvancedFilterUsage();
    },

    /**
     * Track advanced filter usage
     */
    trackAdvancedFilterUsage() {
      if (this.config.enableAnalytics && window.analytics) {
        window.analytics.track('advanced_filters_applied', {
          priceRange: this.priceRange,
          minRating: this.minRating,
          dietaryOptions: this.selectedDietaryOptions,
          onlyDiscount: this.onlyDiscount,
          onlyInStock: this.onlyInStock,
          maxPrepTime: this.maxPrepTime,
          maxCalories: this.maxCalories,
          timestamp: new Date().toISOString()
        });
      }
    },

    /**
     * Update URL with current filters and pagination
     */
    updateURL(params = {}) {
      const query = {
        ...this.$route.query,
        ...params
      };

      // Remove undefined values
      Object.keys(query).forEach(key => {
        if (query[key] === undefined) {
          delete query[key];
        }
      });

      this.$router.push({
        path: '/product',
        query
      });
    },
    
    setMinRating(rating) {
      this.minRating = this.minRating === rating ? 0 : rating;
      this.applyFilters();
    },
    
    removeDietaryFilter(dietName) {
      // Find the dietary option ID by name and remove it
      const option = this.dietaryOptions.find(opt => opt.name === dietName);
      if (option) {
        this.selectedDietaryOptions = this.selectedDietaryOptions.filter(id => id !== option.id);
      }
      this.applyFilters();
    },
    
    // Clear individual filters
    clearCategoryFilter() {
      this.selectedCategory = '';
      this.filterByCategory();
    },
    
    clearSearchFilter() {
      this.searchQuery = '';
      this.searchProducts();
    },
    
    clearSortFilter() {
      this.sortOption = 'default';
    },
    
    clearPriceFilter() {
      this.priceRange.min = 0;
      this.priceRange.max = 50;
      this.applyFilters();
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.selectedCategory = '';
      this.sortOption = 'default';
      this.currentPage = 1;
      this.priceRange.min = 0;
      this.priceRange.max = 50;
      this.minRating = 0;
      this.onlyDiscount = false;
      this.onlyInStock = false;
      this.selectedDietaryOptions = [];
      this.maxPrepTime = 40;
      this.maxCalories = 1000;
      
      // Reset URL
      this.$router.push('/product');
    },
    
    // Pagination methods
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      
      this.currentPage = page;
      
      // Update URL with new page number
      this.$router.push({
        path: '/product',
        query: {
          ...this.$route.query,
          page: page === 1 ? undefined : page
        }
      });
      
      // Scroll to top of product listing
      window.scrollTo({
        top: document.querySelector('.product-listing').offsetTop - 100,
        behavior: 'smooth'
      });
    },
    
    resetPagination() {
      this.currentPage = 1;
    },
    
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters;
    },
      // Price calculation
    calculateDiscountedPrice(product) {
      if (!product || !product.price) return 0;
      if (!product.discount) return product.price;
      return product.price - (product.price * product.discount / 100);
    },
    
    getEffectivePrice(product) {
      return this.calculateDiscountedPrice(product);
    },
    
    getSortLabel(sortOption) {
      return this.sortOptions[sortOption] || 'Featured';
    },
    
    getCategoryLabel(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : window.ProductService.getCategoryIcon(categoryId);
    },
    
    // Product detail methods
    incrementQuantity() {
      if (this.currentProduct && this.quantity < this.currentProduct.stock) {
        this.quantity++;
      }
    },
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    // Check if ingredient is in the removed list
    isRemovedIngredient(ingredient) {
      if (!this.currentProduct || !this.currentProduct.customization || !this.currentProduct.customization.removedIngredients) {
        return false;
      }
      
      const name = this.getIngredientName(ingredient);
      return this.currentProduct.customization.removedIngredients.includes(name);
    },
    
    // Get ingredient name whether it's a string or object
    getIngredientName(ingredient) {
      return typeof ingredient === 'string' ? ingredient : ingredient.name;
    },
    
    // Apply customization from modal
    applyCustomization(customization) {
      if (!this.currentProduct) return;
      
      // Update the product with the customization
      this.currentProduct = {
        ...this.currentProduct,
        customization: customization
      };
      
      // Update special instructions field
      this.specialInstructions = customization.specialInstructions;
    },
      /**
     * Enhanced add to cart with validation and feedback
     */
    addToCart() {
      if (!this.currentProduct) {
        console.error('No product selected');
        return;
      }

      if (this.currentProduct.stock === 0) {
        if (window.ToastService) {
          window.ToastService.show('This item is currently unavailable', 'warning');
        }
        return;
      }

      try {
        // Validate quantity
        if (this.quantity < 1 || this.quantity > this.currentProduct.stock) {
          if (window.ToastService) {
            window.ToastService.show('Invalid quantity selected', 'error');
          }
          return;
        }

        // Prepare customization
        const customization = this.prepareCustomization();
        const productToAdd = {
          ...this.currentProduct,
          customization
        };

        // Calculate final price
        const finalPrice = this.calculateFinalPrice(productToAdd);
        const cartItem = {
          ...productToAdd,
          finalPrice
        };

        // Add to cart
        if (window.CartService) {
          window.CartService.addToCart(cartItem, this.quantity);
          this.showAddToCartSuccess();
          this.trackAddToCart(cartItem);
        } else {
          throw new Error('CartService not available');
        }

      } catch (error) {
        console.error('Error adding to cart:', error);
        
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, {
            component: 'ProductPage',
            action: 'add_to_cart',
            severity: 'medium'
          });
        }

        if (window.ToastService) {
          window.ToastService.show('Failed to add item to cart', 'error');
        }
      }
    },

    /**
     * Prepare customization object
     */
    prepareCustomization() {
      const customization = this.currentProduct.customization || {};
      customization.specialInstructions = this.specialInstructions.trim();
      return customization;
    },

    /**
     * Calculate final price with customization and discounts
     */
    calculateFinalPrice(product) {
      let basePrice = product.price;

      // Add customization costs
      if (product.customization?.extraPrice) {
        basePrice += product.customization.extraPrice;
      }

      // Apply discount
      if (product.discount) {
        basePrice = basePrice - (basePrice * product.discount / 100);
      }

      return parseFloat(basePrice.toFixed(2));
    },

    /**
     * Show add to cart success message
     */
    showAddToCartSuccess() {
      const hasCustomization = this.hasCustomization;
      const itemText = this.quantity > 1 ? 'items' : 'item';
      const customizationText = hasCustomization ? this.config.customizedItemSuffix : '';
      
      const message = `${this.quantity} ${itemText}${customizationText} ${this.config.addToCartSuccessMessage}`;
      
      if (window.ToastService) {
        window.ToastService.show(message, 'success');
      } else {
        alert(message); // Fallback
      }
    },

    /**
     * Track add to cart event
     */
    trackAddToCart(cartItem) {
      if (this.config.enableAnalytics && window.analytics) {
        window.analytics.track('add_to_cart', {
          productId: cartItem.id,
          productName: cartItem.name,
          quantity: this.quantity,
          finalPrice: cartItem.finalPrice,
          hasCustomization: this.hasCustomization,
          timestamp: new Date().toISOString()
        });
      }
    },

    /**
     * Formatting methods - Enhanced with fallbacks and error handling
     */
    formatCurrency(value) {
      try {
        if (window.Filters && window.Filters.formatCurrency) {
          return window.Filters.formatCurrency(value);
        }
        // Fallback implementation
        return 'RM ' + (parseFloat(value) || 0).toFixed(2);
      } catch (error) {
        console.warn('Error formatting currency:', error);
        return 'RM 0.00';
      }
    },

    formatNumber(value) {
      try {
        if (window.Filters && window.Filters.formatNumber) {
          return window.Filters.formatNumber(value);
        }
        // Fallback implementation
        return (parseInt(value) || 0).toLocaleString();
      } catch (error) {
        console.warn('Error formatting number:', error);
        return '0';
      }
    },

    pluralize(count, singular, plural) {
      try {
        if (window.Filters && window.Filters.pluralize) {
          return window.Filters.pluralize(count, singular, plural);
        }
        // Fallback implementation
        const word = count === 1 ? singular : (plural || singular + 's');
        return `${count} ${word}`;
      } catch (error) {
        console.warn('Error pluralizing:', error);
        return `${count} ${singular}`;
      }
    },

    formatStars(rating) {
      try {
        if (window.Filters && window.Filters.formatStars) {
          return window.Filters.formatStars(rating);
        }
        
        // Fallback implementation
        let html = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
          html += '<i class="fas fa-star text-warning"></i>';
        }
        
        if (hasHalfStar) {
          html += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
          html += '<i class="far fa-star text-muted"></i>';
        }
        
        return html;
      } catch (error) {
        console.warn('Error formatting stars:', error);
        return '<i class="far fa-star text-muted"></i>'.repeat(5);
      }
    },

    formatPercentage(value) {
      try {
        if (window.Filters && window.Filters.formatPercentage) {
          return window.Filters.formatPercentage(value);
        }
        // Fallback implementation
        return (parseFloat(value) || 0).toFixed(1);
      } catch (error) {
        console.warn('Error formatting percentage:', error);
        return '0.0';
      }
    },

    formatRelativeTime(minutes) {
      try {
        if (window.Filters && window.Filters.formatRelativeTime) {
          return window.Filters.formatRelativeTime(minutes);
        }
        
        // Fallback implementation
        const mins = parseInt(minutes) || 0;
        if (mins < 60) {
          return `${mins} min`;
        }
        const hours = Math.floor(mins / 60);
        const remainingMinutes = mins % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
      } catch (error) {
        console.warn('Error formatting time:', error);
        return '0 min';
      }
    },

    // ===========================================
    // ENHANCED VALIDATION METHODS
    // ===========================================
    
    /**
     * Enhanced search query validation with detailed feedback
     */
    validateSearchQuery(query = this.searchQuery) {
      const trimmedQuery = (query || '').trim();
      this.validation.errors.search = null;
      
      if (!trimmedQuery) return true;
      
      if (trimmedQuery.length < this.config.searchMinLength) {
        this.validation.errors.search = `Search must be at least ${this.config.searchMinLength} characters`;
        return false;
      }
      
      if (trimmedQuery.length > this.config.searchMaxLength) {
        this.validation.errors.search = `Search must be less than ${this.config.searchMaxLength} characters`;
        return false;
      }
      
      return true;
    },
    
    /**
     * Validate quantity with stock checking
     */
    validateQuantity(quantity) {
      this.validation.errors.quantity = null;
      
      if (!this.currentProduct) return false;
      
      const qty = parseInt(quantity) || 0;
      if (qty < 1) {
        this.validation.errors.quantity = 'Quantity must be at least 1';
        return false;
      }
      
      if (qty > this.currentProduct.stock) {
        this.validation.errors.quantity = `Only ${this.currentProduct.stock} items available`;
        return false;
      }
      
      return true;
    },
    
    /**
     * Validate price range with proper bounds checking
     */
    validatePriceRange(type, value) {
      this.validation.errors.priceRange = null;
      
      const numValue = parseFloat(value) || 0;
      
      if (type === 'min') {
        if (numValue < 0) {
          this.validation.errors.priceRange = 'Minimum price cannot be negative';
          return false;
        }
        if (numValue > this.priceRange.max) {
          this.priceRange.max = numValue;
        }
      } else if (type === 'max') {
        if (numValue < this.priceRange.min) {
          this.priceRange.min = numValue;
        }
        if (numValue > this.config.maxPriceRange) {
          this.validation.errors.priceRange = `Maximum price cannot exceed ${this.formatCurrency(this.config.maxPriceRange)}`;
          return false;
        }
      }
      
      this.trackFilterUsage('priceRange', this.priceRange);
      this.currentPage = 1;
      return true;
    },
    
    /**
     * Clear validation timeouts to prevent memory leaks
     */
    clearValidationTimeouts() {
      for (const [key, timeout] of this.validation.debounceTimeouts) {
        clearTimeout(timeout);
      }
      this.validation.debounceTimeouts.clear();
    },
    
    // ===========================================
    // ENHANCED ANALYTICS METHODS
    // ===========================================
    
    /**
     * Track route analytics for navigation patterns
     */
    updateRouteAnalytics(to, from) {
      if (!this.config.enableAnalytics) return;
      
      this.analytics.pageViews++;
      
      if (window.analytics) {
        window.analytics.track('route_change', {
          from: from?.path || 'direct',
          to: to.path,
          query: to.query,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    /**
     * Track search analytics with performance metrics
     */
    trackSearchAnalytics(query) {
      if (!this.config.enableAnalytics || !query.trim()) return;
      
      this.analytics.searchCount++;
      
      if (window.analytics) {
        window.analytics.track('product_search', {
          query: query.trim(),
          resultCount: this.filteredProducts.length,
          searchCount: this.analytics.searchCount,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    /**
     * Track filter usage patterns
     */
    trackFilterUsage(filterType, value) {
      if (!this.config.enableAnalytics) return;
      
      // Update filter usage analytics
      if (!this.analytics.filterUsage[filterType]) {
        this.analytics.filterUsage[filterType] = 0;
      }
      this.analytics.filterUsage[filterType]++;
      
      if (window.analytics) {
        window.analytics.track('filter_applied', {
          filterType,
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          usageCount: this.analytics.filterUsage[filterType],
          timestamp: new Date().toISOString()
        });
      }
    },
    
    /**
     * Track product view with detailed analytics
     */
    trackProductView(product) {
      if (!this.config.enableAnalytics || !product) return;
      
      const viewData = {
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        timestamp: Date.now()
      };
      
      this.analytics.productViews.push(viewData);
      
      if (window.analytics) {
        window.analytics.track('product_view', {
          ...viewData,
          timestamp: new Date().toISOString(),
          sessionViews: this.analytics.productViews.length
        });
      }
    },
    
    /**
     * Track session end with comprehensive metrics
     */
    trackSessionEnd() {
      if (!this.config.enableAnalytics) return;
      
      const sessionData = {
        duration: Date.now() - this.analytics.sessionStart,
        searchCount: this.analytics.searchCount,
        filterUsage: this.analytics.filterUsage,
        productViews: this.analytics.productViews.length,
        cartAdditions: this.analytics.cartAdditions,
        pageViews: this.analytics.pageViews
      };
      
      if (window.analytics) {
        window.analytics.track('session_end', {
          ...sessionData,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    // ===========================================
    // ENHANCED EVENT HANDLING METHODS
    // ===========================================
    
    /**
     * Setup comprehensive event listeners
     */
    setupEventListeners() {
      if (typeof window === 'undefined') return;
      
      // Product service events
      window.addEventListener('products-loaded', this.handleProductsLoaded);
      window.addEventListener('product-updated', this.handleProductUpdated);
      
      // Window events for mobile detection and scroll tracking
      window.addEventListener('resize', this.handleWindowResize);
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('orientationchange', this.handleOrientationChange);
      
      // Performance tracking
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    },
    
    /**
     * Remove all event listeners for cleanup
     */
    removeEventListeners() {
      if (typeof window === 'undefined') return;
      
      window.removeEventListener('products-loaded', this.handleProductsLoaded);
      window.removeEventListener('product-updated', this.handleProductUpdated);
      window.removeEventListener('resize', this.handleWindowResize);
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('orientationchange', this.handleOrientationChange);
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },
    
    /**
     * Handle product updated event
     */
    handleProductUpdated(event) {
      if (event.detail?.productId && this.currentProduct?.id === event.detail.productId) {
        this.loadProductDetails(event.detail.productId);
      } else {
        this.loadData();
      }
    },
    
    /**
     * Handle window resize for mobile detection
     */
    handleWindowResize() {
      this.detectMobileDevice();
    },
    
    /**
     * Handle scroll events for UI enhancements
     */
    handleScroll() {
      const scrollY = window.scrollY;
      this.uiState.lastScrollPosition = scrollY;
      this.uiState.showScrollToTop = scrollY > 500;
    },
    
    /**
     * Handle orientation change for mobile devices
     */
    handleOrientationChange() {
      setTimeout(() => {
        this.detectMobileDevice();
      }, 100);
    },
    
    /**
     * Handle before unload for analytics
     */
    handleBeforeUnload() {
      if (this.config.enableAnalytics) {
        this.trackSessionEnd();
      }
    },
    
    // ===========================================
    // ENHANCED UI MANAGEMENT METHODS
    // ===========================================
    
    /**
     * Initialize UI state with proper detection
     */
    initializeUIState() {
      this.detectMobileDevice();
      this.uiState.lastScrollPosition = window.scrollY || 0;
      this.uiState.showScrollToTop = this.uiState.lastScrollPosition > 500;
    },
    
    /**
     * Detect mobile device with comprehensive checks
     */
    detectMobileDevice() {
      if (typeof window === 'undefined') return;
      
      this.uiState.isMobile = window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Scroll to top functionality
     */
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    /**
     * Handle error state changes
     */
    handleErrorStateChange() {
      if (this.componentState.hasError) {
        this.errorState.lastErrorTime = Date.now();
        
        if (this.errorState.retryCount < this.config.maxRetries) {
          this.errorState.canRetry = true;
        } else {
          this.errorState.canRetry = false;
        }
      }
    },
    
    // ===========================================
    // ENHANCED SEARCH AND FILTER METHODS
    // ===========================================
    
    /**
     * Enhanced search with validation and analytics
     */
    searchProducts() {
      // Validate search query
      if (!this.validateSearchQuery()) {
        return;
      }

      this.searchStartTime = Date.now();
      this.debouncedSearch();
    },
    
    /**
     * Enhanced debounced search with performance tracking
     */
    performDebouncedSearch(query) {
      if (!query || !query.trim()) {
        this.currentPage = 1;
        return;
      }
      
      const startTime = performance.now();
      
      try {
        // Track search analytics
        this.trackSearchAnalytics(query);
        
        // Update URL parameters
        this.updateUrlParams();
        
        // Reset pagination
        this.currentPage = 1;
        
        // Log search performance
        const searchTime = performance.now() - startTime;
        if (this.config.enableAnalytics && searchTime > 10) {
          console.log(`Search operation took ${searchTime.toFixed(2)}ms`);
        }
        
      } catch (error) {
        console.error('Error in debounced search:', error);
        this.handleSearchError(error);
      }
    },
    
    /**
     * Handle search errors gracefully
     */
    handleSearchError(error) {
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, {
          component: 'ProductPage',
          action: 'search',
          severity: 'low'
        });
      }
      
      if (window.ToastService) {
        window.ToastService.show('Search encountered an error', 'warning');
      }
    },
    
    /**
     * Enhanced search matching with multiple criteria
     */
    matchesSearchQuery(product) {
      if (!this.searchQuery || !this.searchQuery.trim()) return true;
      
      const query = this.searchQuery.toLowerCase().trim();
      const searchFields = [
        product.name,
        product.description,
        product.category,
        ...(product.tags || []),
        ...(product.ingredients || []).map(ing => typeof ing === 'string' ? ing : ing.name)
      ].filter(Boolean);
      
      return searchFields.some(field => 
        field.toLowerCase().includes(query)
      );
    },
    
    /**
     * Enhanced dietary options matching
     */
    matchesDietaryOptions(product) {
      if (!this.selectedDietaryOptions.length) return true;
      
      const productOptions = product.dietaryOptions || [];
      return this.selectedDietaryOptions.every(optionId => 
        productOptions.includes(optionId)
      );
    },
    
    /**
     * Enhanced product sorting with multiple criteria
     */
    sortProducts(a, b) {
      switch (this.sortOption) {
        case 'price-asc':
          return this.getEffectivePrice(a) - this.getEffectivePrice(b);
        case 'price-desc':
          return this.getEffectivePrice(b) - this.getEffectivePrice(a);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'prep-time-asc':
          return (a.preparationTime || 0) - (b.preparationTime || 0);
        case 'calories-asc':
          return (a.calories || 0) - (b.calories || 0);
        default:
          // Featured sorting - consider rating, availability, and discount
          const aScore = this.calculateFeaturedScore(a);
          const bScore = this.calculateFeaturedScore(b);
          return bScore - aScore;
      }
    },
    
    /**
     * Calculate featured score for default sorting
     */
    calculateFeaturedScore(product) {
      let score = 0;
      
      // Rating contribution (0-50 points)
      score += (product.rating || 0) * 10;
      
      // Availability bonus (20 points)
      if (product.stock > 0) score += 20;
      
      // Discount bonus (10-20 points based on discount percentage)
      if (product.discount) score += Math.min(product.discount, 20);
      
      // Popular items bonus (calculated from view count if available)
      if (product.viewCount) score += Math.min(product.viewCount / 10, 10);
      
      return score;
    },
    
    /**
     * Update URL parameters with current filter state
     */
    updateUrlParams() {
      const params = {};
      
      if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
      if (this.selectedCategory) params.category = this.selectedCategory;
      if (this.sortOption !== 'default') params.sort = this.sortOption;
      if (this.currentPage > 1) params.page = this.currentPage;
      
      // Only include changed parameters
      const currentQuery = this.$route.query;
      const hasChanges = Object.keys(params).some(key => params[key] !== currentQuery[key]) ||
                        Object.keys(currentQuery).some(key => !params[key] && currentQuery[key]);
      
      if (hasChanges) {
        this.$router.push({
          path: '/products',
          query: params
        }).catch(() => {}); // Ignore navigation errors
      }
    },
    
    // ===========================================
    // ENHANCED HELPER METHODS
    // ===========================================
    
    /**
     * Get category breakdown for statistics
     */
    getCategoryBreakdown(products) {
      const breakdown = {};
      products.forEach(product => {
        const category = product.category || 'Unknown';
        breakdown[category] = (breakdown[category] || 0) + 1;
      });
      return breakdown;
    },
    
    /**
     * Get dietary breakdown for statistics
     */
    getDietaryBreakdown(products) {
      const breakdown = {};
      products.forEach(product => {
        if (product.dietaryOptions) {
          product.dietaryOptions.forEach(option => {
            breakdown[option] = (breakdown[option] || 0) + 1;
          });
        }
      });
      return breakdown;    }
  }
};

// ===========================================
// ENHANCED GLOBAL COMPONENT REGISTRATION
// ===========================================

// Enhanced global registration with health checks and debugging
(function() {
  'use strict';
  
  try {
    // Validate browser environment
    if (typeof window === 'undefined') {
      console.warn('ProductPage: Window object not available');
      return;
    }
    
    // Register component globally with enhanced metadata
    window.ProductPage = ProductPage;
    
    // Add component metadata for debugging and health checks
    window.ProductPage._metadata = {
      name: 'ProductPage',
      version: '2.0.0',
      registeredAt: new Date().toISOString(),
      features: [
        'Advanced Product Catalog',
        'Enhanced Filtering & Search',
        'Analytics Tracking',
        'Mobile Responsiveness',
        'Error Handling & Retry Logic',
        'Performance Optimization',
        'Accessibility Features',
        'Toast Notifications',
        'Debounced Validation',
        'Comprehensive State Management'
      ],
      dependencies: {
        required: [
          'Vue.js',
          'ProductService',
          'APP_CONSTANTS'
        ],
        optional: [
          'CartService',
          'ToastService',
          'ErrorHandler',
          'ValidationService',
          'Analytics'
        ]
      }
    };
    
    // Component health check function
    window.ProductPage.healthCheck = function() {
      const health = {
        component: 'ProductPage',
        version: '2.0.0',
        status: 'unknown',
        timestamp: new Date().toISOString(),
        dependencies: {},
        capabilities: {},
        issues: []
      };
      
      try {
        // Check required dependencies
        health.dependencies.Vue = typeof Vue !== 'undefined' ? 'available' : 'missing';
        health.dependencies.ProductService = typeof window.ProductService !== 'undefined' ? 'available' : 'missing';
        health.dependencies.APP_CONSTANTS = typeof window.APP_CONSTANTS !== 'undefined' ? 'available' : 'missing';
        
        // Check optional dependencies
        health.dependencies.CartService = typeof window.CartService !== 'undefined' ? 'available' : 'optional';
        health.dependencies.ToastService = typeof window.ToastService !== 'undefined' ? 'available' : 'optional';
        health.dependencies.ErrorHandler = typeof window.ErrorHandler !== 'undefined' ? 'available' : 'optional';
        health.dependencies.ValidationService = typeof window.ValidationService !== 'undefined' ? 'available' : 'optional';
        health.dependencies.Analytics = typeof window.analytics !== 'undefined' ? 'available' : 'optional';
        health.dependencies.Helpers = typeof window.Helpers !== 'undefined' ? 'available' : 'optional';
        
        // Check capabilities
        health.capabilities.routing = typeof window.VueRouter !== 'undefined';
        health.capabilities.localStorage = typeof localStorage !== 'undefined';
        health.capabilities.sessionStorage = typeof sessionStorage !== 'undefined';
        health.capabilities.fetch = typeof fetch !== 'undefined';
        health.capabilities.performance = typeof performance !== 'undefined';
        
        // Determine overall status
        const criticalMissing = Object.entries(health.dependencies)
          .filter(([key, status]) => status === 'missing' && ['Vue', 'ProductService', 'APP_CONSTANTS'].includes(key))
          .map(([key]) => key);
        
        if (criticalMissing.length > 0) {
          health.status = 'critical';
          health.issues.push(`Critical dependencies missing: ${criticalMissing.join(', ')}`);
        } else {
          const optionalMissing = Object.entries(health.dependencies)
            .filter(([key, status]) => status === 'optional')
            .map(([key]) => key);
          
          if (optionalMissing.length > 2) {
            health.status = 'degraded';
            health.issues.push(`Multiple optional services unavailable: ${optionalMissing.join(', ')}`);
          } else {
            health.status = 'healthy';
          }
        }
        
      } catch (error) {
        health.status = 'error';
        health.issues.push(`Health check failed: ${error.message}`);
      }
      
      return health;
    };
    
    // Enhanced debugging utilities
    window.ProductPage.debug = {
      // Get component information
      getInfo() {
        return {
          metadata: window.ProductPage._metadata,
          health: window.ProductPage.healthCheck(),
          performance: {
            registrationTime: Date.now(),
            memoryUsage: performance.memory ? {
              used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
              total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
              limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            } : 'Not available'
          }
        };
      },
      
      // Test component instantiation
      testInstantiation() {
        try {
          const testInstance = new Vue({
            ...ProductPage,
            el: document.createElement('div')
          });
          testInstance.$destroy();
          return { success: true, message: 'Component instantiation successful' };
        } catch (error) {
          return { success: false, message: `Instantiation failed: ${error.message}` };
        }
      },
      
      // Validate configuration
      validateConfig() {
        const issues = [];
        
        try {
          // Test configuration access
          const testConfig = ProductPage.data().config;
          
          if (!testConfig.enableAnalytics) {
            issues.push('Analytics disabled - some features may not work');
          }
          
          if (testConfig.debounceDelay < 100) {
            issues.push('Debounce delay very low - may impact performance');
          }
          
          if (testConfig.maxRetries > 5) {
            issues.push('High retry count - may cause poor user experience');
          }
          
        } catch (error) {
          issues.push(`Configuration validation failed: ${error.message}`);
        }
        
        return {
          valid: issues.length === 0,
          issues: issues
        };
      }
    };
    
    // Run initial health check and log results
    const initialHealth = window.ProductPage.healthCheck();
    console.log('ProductPage v2.0.0 registered successfully');
    console.log('Health Status:', initialHealth.status);
    
    if (initialHealth.issues.length > 0) {
      console.warn('ProductPage Health Issues:', initialHealth.issues);
    }
    
    // Log debug information if needed
    if (window.APP_CONSTANTS?.DEBUG?.COMPONENTS) {
      console.log('ProductPage Debug Info:', window.ProductPage.debug.getInfo());
    }
    
  } catch (error) {
    console.error('Failed to register ProductPage component:', error);
    
    // Still make basic component available even if enhanced features fail
    if (typeof window !== 'undefined' && !window.ProductPage) {
      window.ProductPage = ProductPage;
    }
  }
})();