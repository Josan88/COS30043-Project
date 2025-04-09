// HomePage.js - Main landing page for the e-commerce application
// COS30043 Interface Design and Development

const HomePage = {
  template: `
    <div class="home-page" id="content">
      <!-- Hero Section -->
      <section class="hero" aria-labelledby="hero-heading">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <div class="hero-content text-center">
                <h1 id="hero-heading">Welcome to ShopEase</h1>
                <p class="hero-subtitle">Discover the latest products at unbeatable prices.</p>
                <div class="hero-actions">
                  <a href="#featured-products" class="btn btn-primary" 
                    v-a11y-click="scrollToFeatured"
                    role="button">
                    Shop Now
                  </a>
                  <router-link to="/products" class="btn btn-secondary">
                    View All Products
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Context View Group: Product Discovery Section -->
      <div class="context-group product-discovery bg-light">
        <div class="container">
          <!-- Group Header with Context Navigation -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="context-group-header d-flex justify-content-between align-items-center">
                <h2 class="group-title">Product Discovery</h2>
                <div class="context-navigation">
                  <button class="btn btn-sm btn-outline-primary mx-1" @click="scrollToElement('featured-products')">Featured</button>
                  <button class="btn btn-sm btn-outline-primary mx-1" @click="scrollToElement('trending-products')">Trending</button>
                  <button class="btn btn-sm btn-outline-primary mx-1" @click="scrollToElement('categories')">Categories</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Filter Controls Row -->
          <div class="row" v-if="!loading && featuredProducts.length > 0">
            <div class="col-12">
              <div class="card mb-4">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="filter-group">
                        <label for="product-sort">Sort by:</label>
                        <select id="product-sort" v-model="sortOption" @change="applyFilters" class="form-select ms-2">
                          <option value="popularity">Most Popular</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                      <div class="filter-group">
                        <button 
                          class="btn btn-filter" 
                          :class="{ 'btn-primary': showOnSale, 'btn-outline-primary': !showOnSale }" 
                          @click="toggleOnSale">
                          <i class="fas fa-tag me-2"></i>Show Sale Items Only
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Featured Products Section -->
          <section id="featured-products" class="featured-products mb-5" aria-labelledby="featured-heading">
            <div class="row">
              <div class="col-12">
                <h2 id="featured-heading" class="section-title with-line">Featured Products</h2>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <div class="loading-indicator text-center py-5" v-if="loading">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading products...</span>
                  </div>
                  <p>Loading products...</p>
                </div>
                
                <!-- Grid Row for Products -->
                <div v-else-if="filteredProducts.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                  <div v-for="product in filteredProducts" :key="product.id" class="col">
                    <div class="card product-card h-100" :class="{ 'border-danger': product.onSale }">
                      <div class="position-relative">
                        <img v-lazy-load="product.image" class="card-img-top" :alt="product.name" width="300" height="300">
                        <span v-if="product.onSale" class="sale-badge position-absolute top-0 end-0 bg-danger text-white p-2" aria-label="On Sale">Sale!</span>
                        <div class="product-actions position-absolute bottom-0 end-0 p-2">
                          <button 
                            @click="toggleWishlist(product)" 
                            class="btn btn-light btn-sm rounded-circle me-2"
                            :class="{ 'active text-danger': isInWishlist(product.id) }"
                            :aria-label="isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                            <i :class="isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                          </button>
                          <button 
                            @click="quickView(product)" 
                            class="btn btn-light btn-sm rounded-circle"
                            aria-label="Quick view product">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                      <div class="card-body product-info">
                        <h3 class="card-title product-title h5">
                          <router-link :to="'/product/' + product.id">{{ product.name }}</router-link>
                        </h3>
                        <div class="product-price my-2">
                          <span v-if="product.onSale" class="original-price text-muted text-decoration-line-through me-2">{{ formatPrice(product.originalPrice) }}</span>
                          <span class="current-price fw-bold">{{ formatPrice(product.price) }}</span>
                        </div>
                        <div class="product-rating text-warning mb-2">
                          <span class="stars">{{ renderStars(product.rating) }}</span>
                          <span class="rating-count text-muted ms-2">({{ product.reviewCount }})</span>
                        </div>
                        <div class="product-stock small" v-if="product.stock <= 5 && product.stock > 0">
                          <span class="text-danger fw-bold">Only {{ product.stock }} left!</span>
                        </div>
                      </div>
                      <div class="card-footer bg-white border-top-0">
                        <button @click="addToCart(product)" 
                          class="btn btn-primary w-100"
                          :disabled="product.stock === 0"
                          aria-label="Add product to cart">
                          <i class="fas fa-shopping-cart me-2"></i>{{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else-if="!loading && featuredProducts.length > 0 && filteredProducts.length === 0" class="no-products text-center py-5">
                  <p>No products match the selected filters.</p>
                  <button @click="resetFilters" class="btn btn-secondary">Reset Filters</button>
                </div>
                
                <div v-else-if="!loading && featuredProducts.length === 0" class="no-products text-center py-5">
                  <p>No products available at the moment.</p>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Trending Products Section -->
          <section id="trending-products" class="trending-products mb-5" aria-labelledby="trending-heading">
            <div class="row">
              <div class="col-12">
                <h2 id="trending-heading" class="section-title with-line">Trending Now</h2>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <div v-if="!loading && trendingProducts.length > 0" class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
                      <div v-for="product in trendingProducts" :key="product.id" class="col">
                        <div class="product-card-compact text-center h-100">
                          <img v-lazy-load="product.image" :alt="product.name" class="img-fluid mb-2" width="150" height="150">
                          <h3 class="product-title-compact h6">{{ product.name }}</h3>
                          <div class="product-price-compact my-2">{{ formatPrice(product.price) }}</div>
                          <button @click="addToCart(product)" class="btn btn-sm btn-outline-primary">Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Categories Section -->
          <section id="categories" class="categories mb-5" aria-labelledby="categories-heading">
            <div class="row">
              <div class="col-12">
                <h2 id="categories-heading" class="section-title with-line">Shop by Category</h2>
              </div>
            </div>
            
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              <div v-for="category in categories" :key="category.id" class="col">
                <router-link :to="'/category/' + category.id" class="category-link text-decoration-none">
                  <div class="card category-card h-100">
                    <div class="card-img-top category-image">
                      <img v-lazy-load="category.image" :alt="category.name" class="img-fluid" width="200" height="200">
                    </div>
                    <div class="card-body text-center">
                      <h3 class="category-title h5 mb-2">{{ category.name }}</h3>
                      <span class="category-count badge bg-secondary" v-if="category.productCount">{{ category.productCount }} Products</span>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <!-- Context View Group: Brands and Offers Section -->
      <div class="context-group brands-and-offers">
        <div class="container">
          <div class="row mb-4">
            <div class="col-12">
              <div class="context-group-header">
                <h2 class="group-title">Brands and Special Offers</h2>
              </div>
            </div>
          </div>
          
          <!-- Featured Brands Section -->
          <section class="featured-brands mb-5" aria-labelledby="brands-heading">
            <div class="row">
              <div class="col-12">
                <h2 id="brands-heading" class="section-title with-line">Featured Brands</h2>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <div class="card">
                  <div class="card-body py-4">
                    <div class="row row-cols-3 row-cols-md-6 g-4 justify-content-center">
                      <div v-for="brand in featuredBrands" :key="brand.id" class="col text-center">
                        <a :href="brand.url" class="brand-link">
                          <img v-lazy-load="brand.logo" :alt="brand.name + ' logo'" class="img-fluid" width="120" height="80">
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Promotions Section -->
          <section class="promotions mb-5" aria-labelledby="promotions-heading">
            <div class="row">
              <div class="col-12">
                <h2 id="promotions-heading" class="section-title with-line">Special Offers</h2>
              </div>
            </div>
            
            <div class="row row-cols-1 row-cols-md-3 g-4">
              <div class="col">
                <div class="card promotion-card h-100 bg-primary text-white">
                  <div class="card-body promotion-content text-center p-4">
                    <h3 class="card-title h4">Free Shipping</h3>
                    <p class="card-text">On all orders over $50</p>
                    <i class="fas fa-shipping-fast fa-3x my-3"></i>
                    <router-link to="/shipping" class="btn btn-outline-light mt-2">Learn More</router-link>
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="card promotion-card h-100 bg-success text-white">
                  <div class="card-body promotion-content text-center p-4">
                    <h3 class="card-title h4">10% Off</h3>
                    <p class="card-text">For all new customers</p>
                    <i class="fas fa-tag fa-3x my-3"></i>
                    <router-link to="/new-customers" class="btn btn-outline-light mt-2">Get Discount</router-link>
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="card promotion-card h-100 bg-danger text-white">
                  <div class="card-body promotion-content text-center p-4">
                    <h3 class="card-title h4">Flash Sale</h3>
                    <p class="card-text">24 hours only - Up to 50% off</p>
                    <i class="fas fa-bolt fa-3x my-3"></i>
                    <router-link to="/flash-sale" class="btn btn-outline-light mt-2">Shop Sale</router-link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <!-- Newsletter Section - Separate section outside context groups -->
      <section class="newsletter py-5 bg-light" aria-labelledby="newsletter-heading">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
              <div class="card">
                <div class="card-body p-4">
                  <h2 id="newsletter-heading" class="section-title text-center">Subscribe to Our Newsletter</h2>
                  <p class="text-center mb-4">Get the latest updates on new products and upcoming sales.</p>
                  <form class="newsletter-form" @submit.prevent="subscribeToNewsletter">
                    <div class="input-group mb-3">
                      <input 
                        type="email" 
                        id="newsletter-email" 
                        class="form-control" 
                        v-model="newsletterEmail" 
                        placeholder="Your email address"
                        required
                        aria-required="true"
                      >
                      <button type="submit" class="btn btn-primary">Subscribe</button>
                    </div>
                    <div v-if="newsletterSuccess" class="alert alert-success mt-3" role="alert" aria-live="polite">
                      Thank you for subscribing!
                    </div>
                    <div v-if="newsletterError" class="alert alert-danger mt-3" role="alert" aria-live="polite">
                      {{ newsletterError }}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Quick View Modal -->
      <div v-if="quickViewProduct" class="quick-view-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
        <div class="quick-view-content bg-white p-4 rounded shadow-lg" style="max-width: 800px; width: 90%;">
          <button @click="closeQuickView" class="btn-close position-absolute top-0 end-0 m-3" aria-label="Close quick view"></button>
          <div class="row">
            <div class="col-12 col-md-6">
              <div class="quick-view-image">
                <img :src="quickViewProduct.image" :alt="quickViewProduct.name" class="img-fluid">
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="quick-view-details p-3">
                <h3 class="mb-3">{{ quickViewProduct.name }}</h3>
                <div class="product-price mb-3">
                  <span v-if="quickViewProduct.onSale" class="original-price text-muted text-decoration-line-through me-2">{{ formatPrice(quickViewProduct.originalPrice) }}</span>
                  <span class="current-price fs-4 fw-bold">{{ formatPrice(quickViewProduct.price) }}</span>
                </div>
                <div class="product-rating text-warning mb-3">
                  <span class="stars">{{ renderStars(quickViewProduct.rating) }}</span>
                  <span class="rating-count text-muted ms-2">({{ quickViewProduct.reviewCount }})</span>
                </div>
                <p class="product-description mb-4">{{ quickViewProduct.description || 'No description available' }}</p>
                <div class="product-actions">
                  <div class="quantity-selector d-flex align-items-center mb-3">
                    <label for="product-quantity" class="me-3">Quantity:</label>
                    <div class="input-group" style="width: 120px;">
                      <button @click="decrementQuantity" class="btn btn-outline-secondary" type="button" aria-label="Decrease quantity">-</button>
                      <input id="product-quantity" type="number" class="form-control text-center" v-model.number="quickViewQuantity" min="1" :max="quickViewProduct.stock">
                      <button @click="incrementQuantity" class="btn btn-outline-secondary" type="button" aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <button 
                    @click="addToCartFromQuickView" 
                    class="btn btn-primary w-100"
                    :disabled="quickViewProduct.stock === 0">
                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                  </button>
                </div>
                <div class="product-meta mt-4">
                  <p><strong>Availability:</strong> 
                    <span :class="quickViewProduct.stock > 0 ? 'text-success' : 'text-danger'">
                      {{ quickViewProduct.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                    </span>
                  </p>
                  <p v-if="quickViewProduct.category"><strong>Category:</strong> {{ quickViewProduct.category }}</p>
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
      loading: true,
      featuredProducts: [],
      trendingProducts: [],
      categories: [],
      featuredBrands: [
        { id: 1, name: 'Apple', logo: 'https://via.placeholder.com/120x80?text=Apple', url: '#' },
        { id: 2, name: 'Samsung', logo: 'https://via.placeholder.com/120x80?text=Samsung', url: '#' },
        { id: 3, name: 'Sony', logo: 'https://via.placeholder.com/120x80?text=Sony', url: '#' },
        { id: 4, name: 'Microsoft', logo: 'https://via.placeholder.com/120x80?text=Microsoft', url: '#' },
        { id: 5, name: 'Google', logo: 'https://via.placeholder.com/120x80?text=Google', url: '#' },
        { id: 6, name: 'LG', logo: 'https://via.placeholder.com/120x80?text=LG', url: '#' }
      ],
      newsletterEmail: '',
      newsletterSuccess: false,
      newsletterError: null,
      sortOption: 'popularity',
      showOnSale: false,
      quickViewProduct: null,
      quickViewQuantity: 1
    };
  },
  
  computed: {
    filteredProducts() {
      if (!this.featuredProducts.length) return [];
      
      let result = [...this.featuredProducts];
      
      // Apply sale filter if needed
      if (this.showOnSale) {
        result = result.filter(product => product.onSale);
      }
      
      // Apply sorting
      switch (this.sortOption) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'popularity':
        default:
          // Assuming reviewCount is a proxy for popularity
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
      
      return result;
    }
  },
  
  created() {
    this.fetchFeaturedProducts();
    this.fetchCategories();
  },
  
  methods: {
    // Fetch products from JSON file
    fetchFeaturedProducts() {
      this.loading = true;
      
      // Fetch products from the JSON file
      fetch('./data/products.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Process the data and select featured products (those with higher ratings)
          // Add additional properties needed for display
          const processedProducts = data.map(product => ({
            ...product,
            originalPrice: product.price * 1.2, // Simulate original price for some products
            onSale: Math.random() > 0.5, // Randomly set some products on sale
            reviewCount: Math.floor(Math.random() * 200) + 10, // Simulate review count
            stock: Math.floor(Math.random() * 20) // Simulate stock level
          }))
          .map(product => {
            // Apply actual sale discount for products on sale
            if (product.onSale) {
              product.originalPrice = product.price;
              product.price = parseFloat((product.price * 0.85).toFixed(2)); // 15% discount
            }
            return product;
          });
          
          // Featured products (high rating)
          this.featuredProducts = processedProducts
            .filter(product => product.rating >= 4.0) // Only show products with high ratings
            .slice(0, 8); // Limit to 8 products
          
          // Trending products (high review count)
          this.trendingProducts = processedProducts
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 6); // Top 6 products by review count
            
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          this.loading = false;
        });
    },
    
    fetchCategories() {
      // Define categories based on products.json categories
      // In a real app, you would fetch this from a categories.json file
      fetch('./data/products.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Extract unique categories from product data
          const categoryCount = data.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
          }, {});
          
          const uniqueCategories = Object.keys(categoryCount);
          
          // Create category objects with images and product counts
          this.categories = uniqueCategories.map((category, index) => ({
            id: index + 1,
            name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
            image: `https://via.placeholder.com/200x200?text=${category}`,
            productCount: categoryCount[category]
          }));
        })
        .catch(error => {
          console.error('Error processing categories:', error);
        });
    },
    
    scrollToElement(elementId) {
      document.getElementById(elementId).scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    },
    
    // ... existing methods ...
    addToCart(product) {
      if (product.stock === 0) {
        Store.mutations.addNotification(`Sorry, ${product.name} is out of stock`);
        return;
      }
      
      Store.mutations.addToCart(product);
      Store.mutations.addNotification(`${product.name} added to cart!`);
    },
    
    toggleWishlist(product) {
      if (Store.getters.isInWishlist(product.id)) {
        Store.mutations.removeFromWishlist(product.id);
        Store.mutations.addNotification(`${product.name} removed from wishlist`);
      } else {
        Store.mutations.addToWishlist(product);
        Store.mutations.addNotification(`${product.name} added to wishlist`);
      }
    },
    
    isInWishlist(productId) {
      return Store.getters.isInWishlist(productId);
    },
    
    subscribeToNewsletter() {
      // Reset status
      this.newsletterSuccess = false;
      this.newsletterError = null;
      
      // Basic validation
      if (!this.newsletterEmail || !this.newsletterEmail.includes('@')) {
        this.newsletterError = 'Please enter a valid email address';
        return;
      }
      
      // Simulate API call
      setTimeout(() => {
        // Simulated success
        this.newsletterSuccess = true;
        this.newsletterEmail = '';
        
        // Add notification
        Store.mutations.addNotification('Successfully subscribed to newsletter!');
        
        // Reset success message after a delay
        setTimeout(() => {
          this.newsletterSuccess = false;
        }, 5000);
      }, 800);
    },
    
    scrollToFeatured() {
      document.getElementById('featured-products').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    },
    
    formatPrice(price) {
      return '$' + parseFloat(price).toFixed(2);
    },
    
    renderStars(rating) {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
      let stars = '';
      
      // Full stars
      for (let i = 0; i < fullStars; i++) {
        stars += '★';
      }
      
      // Half star
      if (halfStar) {
        stars += '½';
      }
      
      // Empty stars
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
      }
      
      return stars;
    },
    
    toggleOnSale() {
      this.showOnSale = !this.showOnSale;
    },
    
    applyFilters() {
      // The computed property will handle the filtering
    },
    
    resetFilters() {
      this.sortOption = 'popularity';
      this.showOnSale = false;
    },
    
    quickView(product) {
      this.quickViewProduct = { ...product };
      this.quickViewQuantity = 1;
      // In a real app, we might fetch additional details here
      
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    },
    
    closeQuickView() {
      this.quickViewProduct = null;
      
      // Re-enable body scrolling
      document.body.style.overflow = 'auto';
    },
    
    incrementQuantity() {
      if (this.quickViewQuantity < this.quickViewProduct.stock) {
        this.quickViewQuantity++;
      }
    },
    
    decrementQuantity() {
      if (this.quickViewQuantity > 1) {
        this.quickViewQuantity--;
      }
    },
    
    addToCartFromQuickView() {
      if (this.quickViewProduct.stock === 0) {
        Store.mutations.addNotification(`Sorry, ${this.quickViewProduct.name} is out of stock`);
        return;
      }
      
      const productToAdd = {
        ...this.quickViewProduct,
        quantity: this.quickViewQuantity
      };
      
      Store.mutations.addToCart(productToAdd);
      Store.mutations.addNotification(`${this.quickViewProduct.name} added to cart!`);
      this.closeQuickView();
    }
  }
};