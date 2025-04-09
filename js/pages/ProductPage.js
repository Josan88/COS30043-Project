// Product Page Component
const ProductPage = {
  template: `
    <div class="product-page">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumbs">
          <ol>
            <li><router-link to="/">Home</router-link></li>
            <li v-if="product && product.category">
              <router-link :to="'/category/' + product.categoryId">{{ product.category }}</router-link>
            </li>
            <li v-if="product" aria-current="page">{{ product.name }}</li>
          </ol>
        </nav>
        
        <div class="loading-indicator" v-if="loading">
          <div class="spinner"></div>
          <p>Loading product details...</p>
        </div>
        
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
          <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        </div>
        
        <div v-else-if="product" class="product-details">
          <div class="product-gallery">
            <div class="main-image">
              <img 
                :src="selectedImage || product.image" 
                :alt="product.name"
                width="500" height="500"
              >
            </div>
            <div v-if="product.additionalImages && product.additionalImages.length" class="thumbnail-list">
              <button 
                v-for="(image, index) in allImages" 
                :key="index"
                @click="selectImage(image)"
                class="thumbnail-item"
                :class="{ active: selectedImage === image }"
                :aria-label="'View image ' + (index + 1) + ' of product'"
              >
                <img :src="image" :alt="'Thumbnail ' + (index + 1)" width="100" height="100">
              </button>
            </div>
          </div>
          
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-meta">
              <div class="product-rating">
                <span>{{ product.rating | stars }}</span>
                <span class="rating-count">{{ product.reviewCount }} reviews</span>
              </div>
              <div class="product-sku">SKU: {{ product.sku }}</div>
              <div v-if="product.availability" class="product-availability in-stock">
                <span class="availability-icon">✓</span> In Stock
              </div>
              <div v-else class="product-availability out-of-stock">
                <span class="availability-icon">✗</span> Out of Stock
              </div>
            </div>
            
            <div class="product-price">
              <span v-if="product.onSale" class="original-price">{{ product.originalPrice | currency }}</span>
              <span class="current-price" :class="{ 'sale-price': product.onSale }">
                {{ product.price | currency }}
              </span>
              <span v-if="product.onSale" class="discount-badge">
                {{ calculateDiscount(product.price, product.originalPrice) }}% Off
              </span>
            </div>
            
            <div class="product-description" v-html="product.description"></div>
            
            <div v-if="product.options" class="product-options">
              <div v-for="(option, optionName) in product.options" :key="optionName" class="product-option">
                <label :for="'option-' + optionName">{{ optionName }}</label>
                <select 
                  :id="'option-' + optionName" 
                  v-model="selectedOptions[optionName]"
                  class="form-control"
                >
                  <option v-for="value in option" :key="value" :value="value">{{ value }}</option>
                </select>
              </div>
            </div>
            
            <div class="product-actions">
              <div class="quantity-selector">
                <label for="quantity">Quantity</label>
                <div class="quantity-controls">
                  <button 
                    @click="decrementQuantity" 
                    class="quantity-btn" 
                    aria-label="Decrease quantity"
                    :disabled="quantity <= 1"
                  >-</button>
                  <input 
                    type="number" 
                    id="quantity" 
                    v-model.number="quantity" 
                    min="1" 
                    :max="product.maxQuantity || 10"
                    aria-label="Product quantity"
                  >
                  <button 
                    @click="incrementQuantity" 
                    class="quantity-btn" 
                    aria-label="Increase quantity"
                    :disabled="quantity >= (product.maxQuantity || 10)"
                  >+</button>
                </div>
              </div>
              
              <button 
                @click="addToCart" 
                class="btn btn-primary btn-add-to-cart"
                :disabled="!product.availability"
                aria-label="Add product to cart"
              >
                <span class="btn-icon">🛒</span> Add to Cart
              </button>
              
              <button 
                @click="toggleWishlist" 
                class="btn btn-wishlist"
                :class="{ 'in-wishlist': isInWishlist }"
                aria-label="Add product to wishlist"
              >
                <span class="btn-icon">❤</span>
                <span v-if="isInWishlist">Remove from Wishlist</span>
                <span v-else>Add to Wishlist</span>
              </button>
            </div>
            
            <div class="product-attributes">
              <div class="accordion">
                <div class="accordion-item">
                  <button 
                    @click="toggleAccordion('details')" 
                    class="accordion-header"
                    :aria-expanded="openSection === 'details'"
                    aria-controls="section-details"
                  >
                    <span>Product Details</span>
                    <span class="accordion-icon">{{ openSection === 'details' ? '−' : '+' }}</span>
                  </button>
                  <div 
                    id="section-details" 
                    class="accordion-content"
                    :class="{ active: openSection === 'details' }"
                  >
                    <table class="details-table">
                      <tbody>
                        <tr v-for="(value, key) in product.details" :key="key">
                          <th>{{ key }}</th>
                          <td>{{ value }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div class="accordion-item">
                  <button 
                    @click="toggleAccordion('shipping')" 
                    class="accordion-header"
                    :aria-expanded="openSection === 'shipping'"
                    aria-controls="section-shipping"
                  >
                    <span>Shipping & Returns</span>
                    <span class="accordion-icon">{{ openSection === 'shipping' ? '−' : '+' }}</span>
                  </button>
                  <div 
                    id="section-shipping" 
                    class="accordion-content"
                    :class="{ active: openSection === 'shipping' }"
                  >
                    <p>Free standard shipping on orders over $50. Delivery within 3-5 business days.</p>
                    <p>Express shipping available at checkout for $9.99. Delivery within 1-2 business days.</p>
                    <p>30-day return policy for unused items in original packaging.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="product && !loading" class="product-reviews" id="reviews">
          <h2 class="section-title">Customer Reviews</h2>
          
          <div class="review-summary">
            <div class="average-rating">
              <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
              <span class="rating-stars">{{ product.rating | stars }}</span>
              <span class="review-count">Based on {{ product.reviewCount }} reviews</span>
            </div>
            
            <div class="rating-distribution">
              <div v-for="star in 5" :key="star" class="rating-bar">
                <span class="star-label">{{ star }} Star</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getRatingPercentage(star) + '%' }"
                  ></div>
                </div>
                <span class="count">{{ getRatingCount(star) }}</span>
              </div>
            </div>
          </div>
          
          <div class="review-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="review-author">{{ review.author }}</span>
                <span class="review-date">{{ review.date | formatDate }}</span>
                <div class="review-rating">{{ review.rating | stars }}</div>
              </div>
              <div class="review-title">{{ review.title }}</div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
          
          <div class="load-more" v-if="hasMoreReviews">
            <button @click="loadMoreReviews" class="btn btn-secondary">Load More Reviews</button>
          </div>
        </div>
        
        <div v-if="product && !loading" class="related-products">
          <h2 class="section-title">You May Also Like</h2>
          <div class="products-grid">
            <div v-for="product in relatedProducts" :key="product.id" class="product-card">
              <div class="product-image">
                <img v-lazy-load="product.image" :alt="product.name" width="200" height="200">
                <span v-if="product.onSale" class="sale-badge">Sale!</span>
              </div>
              <div class="product-info">
                <h3 class="product-title">
                  <router-link :to="'/product/' + product.id">{{ product.name }}</router-link>
                </h3>
                <div class="product-price">
                  <span v-if="product.onSale" class="original-price">{{ product.originalPrice | currency }}</span>
                  <span class="current-price">{{ product.price | currency }}</span>
                </div>
                <button @click="addRelatedToCart(product)" class="btn btn-sm btn-add-to-cart">
                  Add to Cart
                </button>
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
      error: null,
      product: null,
      selectedImage: null,
      quantity: 1,
      selectedOptions: {},
      isInWishlist: false,
      openSection: 'details',
      reviews: [],
      reviewPage: 1,
      reviewsPerPage: 3,
      hasMoreReviews: false,
      relatedProducts: [],
      allProductReviews: []
    };
  },
  
  computed: {
    allImages() {
      if (!this.product) return [];
      return [this.product.image, ...(this.product.additionalImages || [])];
    },
    
    productId() {
      return parseInt(this.$route.params.id);
    }
  },
  
  created() {
    this.fetchProduct();
  },
  
  watch: {
    // Re-fetch when route changes
    '$route.params.id'() {
      this.fetchProduct();
    }
  },
  
  methods: {
    fetchProduct() {
      this.loading = true;
      this.error = null;
      this.product = null;
      this.selectedImage = null;
      this.quantity = 1;
      this.selectedOptions = {};
      
      // Fetch product data from JSON file
      fetch('./data/products.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Find the product with matching ID
          const product = data.find(p => p.id === this.productId);
          
          if (product) {
            // Enhance product with additional details needed for display
            this.product = {
              ...product,
              originalPrice: product.price * 1.2, // Simulate original price
              onSale: Math.random() > 0.5, // Randomly set sale status
              reviewCount: Math.floor(Math.random() * 200) + 10, // Simulate review count
              // Add additional fields that might not be in the JSON
              additionalImages: [
                product.image, // Use main image as first additional image
                `https://via.placeholder.com/500x500?text=${product.name}+Side`,
                `https://via.placeholder.com/500x500?text=${product.name}+Back`
              ],
              categoryId: 1, // Default category ID
              sku: `SKU-${product.id.toString().padStart(4, '0')}`,
              availability: product.inStock || false,
              // Add more detailed product information
              details: {
                "Brand": "TechBrand",
                "Model": `Model-${product.id}`,
                "Color": "Black/Silver",
                "Weight": `${Math.floor(Math.random() * 500) + 100}g`,
                "Dimensions": `${Math.floor(Math.random() * 10) + 10} x ${Math.floor(Math.random() * 5) + 5} x ${Math.floor(Math.random() * 2) + 1} cm`
              },
              options: {
                "Color": ["Black", "Silver", "White"],
                "Size": ["Standard", "Large"]
              },
              maxQuantity: Math.floor(Math.random() * 10) + 1
            };
            
            // Apply actual sale discount for products on sale
            if (this.product.onSale) {
              this.product.originalPrice = this.product.price;
              this.product.price = parseFloat((this.product.price * 0.85).toFixed(2)); // 15% discount
            }
            
            // After product is set, fetch reviews and related products
            this.fetchReviews();
            this.fetchRelatedProducts();
            this.checkWishlist();
          } else {
            this.error = "Product not found. It may have been removed or is no longer available.";
          }
          
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching product data:', error);
          this.error = "Failed to load product data. Please try again later.";
          this.loading = false;
        });
    },
    
    fetchRelatedProducts() {
      // Fetch related products from the same JSON file
      fetch('./data/products.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Find products in the same category
          const relatedProducts = data
            .filter(p => p.id !== this.productId && p.category === this.product.category)
            .slice(0, 4); // Limit to 4 related products
            
          // If not enough products in the same category, add some random ones
          if (relatedProducts.length < 4) {
            const randomProducts = data
              .filter(p => p.id !== this.productId && !relatedProducts.find(rp => rp.id === p.id))
              .slice(0, 4 - relatedProducts.length);
              
            relatedProducts.push(...randomProducts);
          }
          
          // Add sales information to related products
          this.relatedProducts = relatedProducts.map(p => ({
            ...p,
            originalPrice: Math.random() > 0.5 ? p.price * 1.2 : p.price,
            onSale: Math.random() > 0.5
          })).map(p => {
            // Apply actual sale discount for products on sale
            if (p.onSale) {
              p.originalPrice = p.price;
              p.price = parseFloat((p.price * 0.85).toFixed(2));
            }
            return p;
          });
        })
        .catch(error => {
          console.error('Error fetching related products:', error);
        });
    },
    
    fetchReviews() {
      // Fetch reviews from the reviews.json file
      fetch('./data/reviews.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(allReviews => {
          // Filter reviews for the current product
          const productReviews = allReviews.filter(review => review.productId === this.productId);
          
          // Display the first page of reviews
          this.reviews = productReviews.slice(0, this.reviewsPerPage);
          this.hasMoreReviews = productReviews.length > this.reviewsPerPage;
          
          // Store all reviews for this product for pagination
          this.allProductReviews = productReviews;
          
          // Build the ratings distribution
          this.buildRatingsDistribution(productReviews);
        })
        .catch(error => {
          console.error('Error fetching reviews:', error);
        });
    },
    
    buildRatingsDistribution(reviews) {
      // Initialize rating counts
      const ratingCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };
      
      // Count reviews for each rating
      reviews.forEach(review => {
        if (ratingCounts[review.rating] !== undefined) {
          ratingCounts[review.rating]++;
        }
      });
      
      // Set rating counts
      this.product.ratingCounts = ratingCounts;
    },
    
    selectImage(image) {
      this.selectedImage = image;
    },
    
    incrementQuantity() {
      if (this.quantity < (this.product.maxQuantity || 10)) {
        this.quantity++;
      }
    },
    
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    addToCart() {
      if (!this.product.availability) return;
      
      const productToAdd = {
        ...this.product,
        quantity: this.quantity,
        selectedOptions: { ...this.selectedOptions }
      };
      
      Store.mutations.addToCart(productToAdd);
      
      // Show confirmation message
      this.$root.$emit('show-notification', {
        message: `${this.product.name} added to cart!`,
        type: 'success'
      });
    },
    
    addRelatedToCart(product) {
      const productToAdd = {
        ...product,
        quantity: 1
      };
      
      Store.mutations.addToCart(productToAdd);
      
      // Show confirmation message
      this.$root.$emit('show-notification', {
        message: `${product.name} added to cart!`,
        type: 'success'
      });
    },
    
    toggleWishlist() {
      if (this.isInWishlist) {
        Store.mutations.removeFromWishlist(this.product.id);
        this.isInWishlist = false;
        
        // Show confirmation message
        this.$root.$emit('show-notification', {
          message: `${this.product.name} removed from wishlist`,
          type: 'info'
        });
      } else {
        Store.mutations.addToWishlist(this.product);
        this.isInWishlist = true;
        
        // Show confirmation message
        this.$root.$emit('show-notification', {
          message: `${this.product.name} added to wishlist!`,
          type: 'success'
        });
      }
    },
    
    checkWishlist() {
      // Check if product is in wishlist
      this.isInWishlist = Store.getters.isInWishlist(this.product.id);
    },
    
    toggleAccordion(section) {
      this.openSection = this.openSection === section ? null : section;
    },
    
    loadMoreReviews() {
      // Load next page of reviews from the stored allProductReviews array
      const newReviews = this.allProductReviews.slice(
        this.reviews.length,
        this.reviews.length + this.reviewsPerPage
      );
      
      this.reviews = [...this.reviews, ...newReviews];
      this.hasMoreReviews = this.reviews.length < this.allProductReviews.length;
    },
    
    getRatingPercentage(star) {
      if (!this.product || !this.product.ratingCounts) return 0;
      return (this.product.ratingCounts[star] / this.product.reviewCount) * 100;
    },
    
    getRatingCount(star) {
      if (!this.product || !this.product.ratingCounts) return 0;
      return this.product.ratingCounts[star] || 0;
    },
    
    calculateDiscount(currentPrice, originalPrice) {
      if (!originalPrice || originalPrice <= currentPrice) return 0;
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
  }
};