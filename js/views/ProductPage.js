/**
 * ProductPage Component
 * Demonstrates use of arrays, directives, filters, pagination, and JSON data
 */
const ProductPage = {
  props: {
    id: {
      type: [Number, String],
      required: false
    }
  },
  template: `
    <div class="product-page">
      <!-- Product Listing View -->
      <div v-if="!currentProduct" class="product-listing">
        <div class="container">
          <h1 class="mb-4">Products</h1>
          
          <!-- Filters and Search -->
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search products..." 
                  v-model="searchQuery"
                  @keyup.enter="searchProducts"
                  aria-label="Search products"
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
                <option v-for="(label, value) in categoryMap" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <select 
                class="form-select" 
                v-model="sortOption"
                @change="sortProducts"
                aria-label="Sort products"
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
                Category: {{ categoryMap[selectedCategory] }}
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
              <span v-if="priceRange.min > 0 || priceRange.max < 3000" class="badge bg-primary">
                Price: RM{{ priceRange.min }} - RM{{ priceRange.max }}
                <button class="btn-close btn-close-white ms-2" @click="clearPriceFilter" aria-label="Clear price filter"></button>
              </span>
            </div>
          </div>
          
          <!-- Category Title & Count -->
          <div v-if="filteredProducts.length > 0" class="mb-4 d-flex justify-content-between align-items-center">
            <h2 v-if="selectedCategory">{{ categoryMap[selectedCategory] }}</h2>
            <h2 v-else>All Products</h2>
            <p class="text-muted mb-0">{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product' : 'products' }} found</p>
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
                          max="2999" 
                          step="100"
                          @change="applyFilters"
                        >
                        <span>to</span>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="priceRange.max" 
                          min="1" 
                          max="3000" 
                          step="100"
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
                    
                    <!-- Discount Filter -->
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="onlyDiscount" v-model="onlyDiscount" @change="applyFilters">
                        <label class="form-check-label" for="onlyDiscount">
                          Show only products on sale
                        </label>
                      </div>
                    </div>
                    
                    <!-- In Stock Filter -->
                    <div class="col-md-6 mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="onlyInStock" v-model="onlyInStock" @change="applyFilters">
                        <label class="form-check-label" for="onlyInStock">
                          Show only in-stock products
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Product Grid with v-for directive -->
          <div v-if="paginatedProducts.length > 0" class="row">
            <div 
              v-for="product in paginatedProducts" 
              :key="product.id" 
              class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"
            >
              <div class="card product-card h-100">
                <div class="position-relative">
                  <img :src="product.image" :alt="product.name" class="card-img-top">
                  <span 
                    v-if="product.discount" 
                    class="badge bg-danger position-absolute top-0 end-0 m-2"
                  >
                    {{ product.discount }}% OFF
                  </span>
                  <span 
                    v-if="product.stock <= 5 && product.stock > 0" 
                    class="badge bg-warning position-absolute top-0 start-0 m-2"
                  >
                    Only {{ product.stock }} left
                  </span>
                  <span 
                    v-if="product.stock === 0" 
                    class="badge bg-secondary position-absolute top-0 start-0 m-2"
                  >
                    Out of Stock
                  </span>
                </div>
                
                <div class="card-body d-flex flex-column">
                  <div class="mb-1">
                    <span class="badge bg-info">{{ categoryMap[product.category] }}</span>
                  </div>
                  <h3 class="card-title h5">{{ $filters.truncate(product.name, 30) }}</h3>
                  
                  <div class="mb-2">
                    <div class="ratings">
                      <i 
                        v-for="star in 5" 
                        :key="star" 
                        class="fas fa-star" 
                        :class="{ 'text-warning': star <= product.rating, 'text-muted': star > product.rating }"
                      ></i>
                      <span class="ms-1 text-muted">({{ product.reviewCount }})</span>
                    </div>
                  </div>
                  
                  <p class="card-text text-muted">{{ $filters.truncate(product.description, 80) }}</p>
                  
                  <div class="mt-auto">
                    <!-- Consolidated price display -->
                    <div class="mb-3">
                      <span v-if="product.discount > 0">
                        <span class="text-muted text-decoration-line-through me-2">
                          {{ $filters.currency(product.price) }}
                        </span>
                        <span class="price text-danger fw-bold h4">
                          {{ $filters.currency(calculateDiscountedPrice(product)) }}
                        </span>
                        <span class="badge bg-danger ms-2">{{ product.discount }}% OFF</span>
                      </span>
                      <span v-else>
                        <span class="price fw-bold h4">{{ $filters.currency(product.price) }}</span>
                      </span>
                    </div>
                    
                    <div class="d-grid gap-2">
                      <router-link 
                        :to="'/product/' + product.id" 
                        class="btn btn-outline-primary"
                      >
                        View Details
                      </router-link>
                      <button 
                        class="btn btn-primary" 
                        @click="quickAddToCart(product)"
                        :disabled="product.stock === 0"
                      >
                        <i class="fas fa-cart-plus me-1"></i> 
                        {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                      </button>
                    </div>
                  </div>
                </div>
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
              <label for="pageSize" class="me-2">Products per page:</label>
              <select 
                id="pageSize" 
                v-model.number="pageSize" 
                class="form-select form-select-sm d-inline-block" 
                style="width: auto;"
                @change="resetPagination"
              >
                <option>4</option>
                <option>8</option>
                <option>12</option>
                <option>16</option>
              </select>
            </div>
          </div>
          
          <!-- No Products Found -->
          <div v-if="filteredProducts.length === 0" class="text-center py-5">
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
            <button class="btn btn-primary" @click="resetFilters">Reset Filters</button>
          </div>
        </div>
      </div>
      
      <!-- Individual Product Detail View -->
      <div v-else class="product-detail">
        <div class="container">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
              <li class="breadcrumb-item"><router-link to="/products">Products</router-link></li>
              <li class="breadcrumb-item"><router-link :to="'/products?category=' + currentProduct.category">{{ categoryName }}</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">{{ currentProduct.name }}</li>
            </ol>
          </nav>
          
          <div class="row">
            <!-- Product Image -->
            <div class="col-md-6 mb-4">
              <div class="product-image-container">
                <img :src="currentProduct.image" :alt="currentProduct.name" class="product-image img-fluid rounded">
                <div v-if="currentProduct.discount" class="discount-badge">
                  {{ currentProduct.discount }}% OFF
                </div>
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="col-md-6 product-info">
              <h1 class="mb-2">{{ currentProduct.name }}</h1>
              
              <!-- Rating -->
              <div class="mb-3">
                <div class="ratings">
                  <i v-for="i in 5" :key="i" class="fas fa-star" :class="{ 'text-warning': i <= currentProduct.rating, 'text-muted': i > currentProduct.rating }"></i>
                  <span class="ms-2 text-muted">{{ currentProduct.reviewCount }} reviews</span>
                </div>
              </div>
              
              <!-- Price -->
              <div class="mb-3">
                <template v-if="currentProduct.discount">
                  <p class="text-decoration-line-through text-muted h5">RM{{ currentProduct.price.toFixed(2) }}</p>
                  <p class="price h3">RM{{ discountedPrice }}</p>
                  <p class="text-success">You save: RM{{ savedAmount }}</p>
                </template>
                <template v-else>
                  <p class="price h3">RM{{ currentProduct.price.toFixed(2) }}</p>
                </template>
              </div>
              
              <!-- Availability -->
              <p class="mb-3">
                <span v-if="currentProduct.stock > 0" class="text-success">
                  <i class="fas fa-check-circle"></i> In Stock ({{ currentProduct.stock }} available)
                </span>
                <span v-else class="text-danger">
                  <i class="fas fa-times-circle"></i> Out of Stock
                </span>
              </p>
              
              <!-- Description -->
              <div class="mb-4">
                <h4>Description</h4>
                <p>{{ currentProduct.description }}</p>
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
                  <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-outline btn-lg">
                  <i class="far fa-heart"></i> Add to Wishlist
                </button>
              </div>
              
              <!-- Features -->
              <div class="mt-4">
                <h4>Features</h4>
                <ul>
                  <li v-for="(feature, index) in currentProduct.features" :key="index">
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Related Products -->
          <div class="related-products mt-5">
            <h3 class="mb-4">You May Also Like</h3>
            <div class="row">
              <div v-for="product in relatedProducts" :key="product.id" class="col-6 col-md-3 mb-4">
                <product-card :product="product"></product-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      products: [],
      currentProduct: null,
      relatedProducts: [],
      searchQuery: '',
      selectedCategory: '',
      sortOption: 'default',
      currentPage: 1,
      pageSize: 8,
      priceRange: {
        min: 0,
        max: 3000
      },
      minRating: 0,
      onlyDiscount: false,
      onlyInStock: false,
      showAdvancedFilters: false,
      quantity: 1,
      categoryMap: {
        'pc': 'PCs',
        'phones': 'Phones',
        'tablets': 'Tablets',
        'watches': 'Watches',
        'audio': 'Audio',
        'accessories': 'Accessories'
      },
      sortOptions: {
        'default': 'Featured',
        'price-asc': 'Price: Low to High',
        'price-desc': 'Price: High to Low',
        'rating-desc': 'Highest Rated',
        'name-asc': 'Name: A to Z',
        'name-desc': 'Name: Z to A'
      }
    };
  },
  computed: {
    // Filter products based on all filter criteria
    filteredProducts() {
      if (!this.products.length) return [];
      
      return this.products.filter(product => {
        // Category filter
        const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
        
        // Search query filter
        const matchesSearch = !this.searchQuery || 
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          product.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Price range filter
        const matchesPrice = product.price >= this.priceRange.min && product.price <= this.priceRange.max;
        
        // Rating filter
        const matchesRating = product.rating >= this.minRating;
        
        // Discount filter
        const matchesDiscount = !this.onlyDiscount || product.discount > 0;
        
        // Stock filter
        const matchesStock = !this.onlyInStock || product.stock > 0;
        
        return matchesCategory && matchesSearch && matchesPrice && 
               matchesRating && matchesDiscount && matchesStock;
      }).sort((a, b) => {
        // Apply sorting
        switch(this.sortOption) {
          case 'price-asc':
            return this.getEffectivePrice(a) - this.getEffectivePrice(b);
          case 'price-desc':
            return this.getEffectivePrice(b) - this.getEffectivePrice(a);
          case 'rating-desc':
            return b.rating - a.rating;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default:
            // For 'default', we'll sort by featured status (which we'll just use rating for demo)
            return b.rating - a.rating;
        }
      });
    },
    
    // Get products for current page only
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredProducts.slice(startIndex, endIndex);
    },
    
    // Calculate total number of pages
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.pageSize);
    },
    
    // Generate page numbers for pagination
    displayedPageNumbers() {
      const pages = [];
      const maxPagesToShow = 5; // Maximum number of page links to show
      
      if (this.totalPages <= maxPagesToShow) {
        // Show all page numbers
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show limited page numbers with ellipsis
        const leftLimit = Math.max(1, this.currentPage - 1);
        const rightLimit = Math.min(this.totalPages, this.currentPage + 1);
        
        // Always show first page
        pages.push(1);
        
        // Add ellipsis if needed
        if (leftLimit > 2) {
          pages.push('...');
        }
        
        // Add pages around current page
        for (let i = leftLimit; i <= rightLimit; i++) {
          if (i !== 1 && i !== this.totalPages) {
            pages.push(i);
          }
        }
        
        // Add ellipsis if needed
        if (rightLimit < this.totalPages - 1) {
          pages.push('...');
        }
        
        // Always show last page
        if (this.totalPages > 1) {
          pages.push(this.totalPages);
        }
      }
      
      return pages;
    },
    
    // Check if any filter is active
    hasActiveFilters() {
      return this.selectedCategory !== '' || 
             this.searchQuery !== '' || 
             this.sortOption !== 'default' ||
             this.priceRange.min > 0 ||
             this.priceRange.max < 3000 ||
             this.minRating > 0 ||
             this.onlyDiscount ||
             this.onlyInStock;
    },
    
    // Calculate the discounted price for the current product
    discountedPrice() {
      if (!this.currentProduct) return 0;
      if (!this.currentProduct.discount) return this.currentProduct.price.toFixed(2);
      
      return (this.currentProduct.price - (this.currentProduct.price * this.currentProduct.discount / 100)).toFixed(2);
    },
    
    // Calculate how much the user saves with the discount
    savedAmount() {
      if (!this.currentProduct || !this.currentProduct.discount) return 0;
      
      return (this.currentProduct.price * this.currentProduct.discount / 100).toFixed(2);
    },
    
    // Get the category name for breadcrumb navigation
    categoryName() {
      if (!this.currentProduct || !this.currentProduct.category) return '';
      
      return this.categoryMap[this.currentProduct.category] || this.currentProduct.category;
    }
  },
  watch: {
    // Watch for route changes
    $route(to, from) {
      this.loadData();
    }
  },
  created() {
    this.loadData();
    
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
  methods: {
    loadData() {
      // Get all products (using the ProductService to fetch JSON data)
      this.products = ProductService.getAllProducts();
      
      // If id is provided in route, load specific product
      if (this.id || this.$route.params.id) {
        const productId = this.id || this.$route.params.id;
        this.loadProductDetails(productId);
      } else {
        this.currentProduct = null;
      }
    },
    
    loadProductDetails(productId) {
      // Get product by ID
      this.currentProduct = ProductService.getProduct(productId);
      
      if (this.currentProduct) {
        // Reset quantity to 1
        this.quantity = 1;
        
        // Get related products (same category, excluding current product)
        this.relatedProducts = ProductService.getProductsByCategory(this.currentProduct.category)
          .filter(product => product.id !== this.currentProduct.id)
          .slice(0, 4);
      }
    },
    
    // Filter methods
    searchProducts() {
      // Update URL and reset pagination
      this.$router.push({
        path: '/products',
        query: {
          ...this.$route.query,
          search: this.searchQuery || undefined,
          page: 1
        }
      });
      this.currentPage = 1;
    },
    
    filterByCategory() {
      // Update URL and reset pagination
      this.$router.push({
        path: '/products',
        query: {
          ...this.$route.query,
          category: this.selectedCategory || undefined,
          page: 1
        }
      });
      this.currentPage = 1;
    },
    
    sortProducts() {
      this.currentPage = 1;
    },
    
    applyFilters() {
      // Reset to first page when filters change
      this.currentPage = 1;
    },
    
    setMinRating(rating) {
      this.minRating = this.minRating === rating ? 0 : rating;
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
      this.priceRange.max = 3000;
      this.applyFilters();
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.selectedCategory = '';
      this.sortOption = 'default';
      this.currentPage = 1;
      this.priceRange.min = 0;
      this.priceRange.max = 3000;
      this.minRating = 0;
      this.onlyDiscount = false;
      this.onlyInStock = false;
      
      // Reset URL
      this.$router.push('/products');
    },
    
    // Pagination methods
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      
      this.currentPage = page;
      
      // Update URL with new page number
      this.$router.push({
        path: '/products',
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
      if (!product.discount) return product.price;
      return product.price - (product.price * product.discount / 100);
    },
    
    getEffectivePrice(product) {
      return this.calculateDiscountedPrice(product);
    },
    
    getSortLabel(sortOption) {
      return this.sortOptions[sortOption] || 'Featured';
    },
    
    // Quick add to cart from listing page
    quickAddToCart(product) {
      if (product.stock === 0) return;
      
      // Add to cart with quantity of 1
      CartService.addToCart(product, 1);
      
      // Show success notification
      alert(`${product.name} added to cart!`);
    },
    
    // Product detail methods (handled by existing code)
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
    addToCart() {
      if (!this.currentProduct) return;
      
      // Add to cart with specified quantity
      CartService.addToCart(this.currentProduct, this.quantity);
      
      // Show success message
      alert(`${this.quantity} ${this.quantity > 1 ? 'items' : 'item'} added to cart!`);
    }
  }
};

// Make the component globally available
window.ProductPage = ProductPage;