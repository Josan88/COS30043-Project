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
      relatedProducts: []
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
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock data for demonstration purposes
        const productData = this.getMockProduct(this.productId);
        
        if (productData) {
          this.product = productData;
          this.fetchReviews();
          this.fetchRelatedProducts();
          this.checkWishlist();
        } else {
          this.error = "Product not found. It may have been removed or is no longer available.";
        }
        
        this.loading = false;
      }, 1000);
    },
    
    getMockProduct(id) {
      // Mock product data
      const products = {
        1: {
          id: 1,
          name: "Premium Bluetooth Headphones",
          price: 129.99,
          originalPrice: 159.99,
          onSale: true,
          image: "https://via.placeholder.com/500x500?text=Headphones",
          additionalImages: [
            "https://via.placeholder.com/500x500?text=Headphones+Side",
            "https://via.placeholder.com/500x500?text=Headphones+Back"
          ],
          category: "Electronics",
          categoryId: 1,
          rating: 4.5,
          reviewCount: 124,
          sku: "BT-HP-001",
          availability: true,
          description: "Experience premium sound quality with these wireless Bluetooth headphones. Features include active noise cancellation, 30-hour battery life, and comfortable over-ear design.",
          details: {
            "Brand": "AudioTech",
            "Model": "BT-5000",
            "Color": "Black/Silver",
            "Connectivity": "Bluetooth 5.0",
            "Battery Life": "30 hours",
            "Charging Time": "2 hours",
            "Weight": "280g"
          },
          options: {
            "Color": ["Black", "Silver", "Blue"],
            "Warranty": ["Standard 1-Year", "Extended 2-Year (+$19.99)"]
          },
          maxQuantity: 5
        },
        2: {
          id: 2,
          name: "Smartwatch Pro",
          price: 199.99,
          originalPrice: 199.99,
          onSale: false,
          image: "https://via.placeholder.com/500x500?text=Smartwatch",
          additionalImages: [
            "https://via.placeholder.com/500x500?text=Smartwatch+Side",
            "https://via.placeholder.com/500x500?text=Smartwatch+Band"
          ],
          category: "Electronics",
          categoryId: 1,
          rating: 4.0,
          reviewCount: 86,
          sku: "SW-PRO-002",
          availability: true,
          description: "Stay connected with the Smartwatch Pro. Track your fitness goals, receive notifications, and more with this sleek and stylish smartwatch.",
          details: {
            "Brand": "TechWear",
            "Model": "Pro X2",
            "Display": "1.4 inch AMOLED",
            "Water Resistance": "5 ATM",
            "Battery Life": "Up to 7 days",
            "Sensors": "Heart rate, Accelerometer, Gyroscope",
            "Compatibility": "iOS 12+ / Android 6.0+"
          },
          options: {
            "Band Color": ["Black", "Blue", "Red"],
            "Size": ["Standard", "Large"]
          },
          maxQuantity: 3
        }
      };
      
      return products[id] || null;
    },
    
    fetchReviews() {
      // Mock review data
      const allReviews = [
        {
          id: 1,
          productId: this.productId,
          author: "John D.",
          date: "2025-03-15",
          rating: 5,
          title: "Excellent product!",
          content: "I've been using this product for a month now and I'm very impressed with the quality. The sound is crystal clear and the battery lasts forever. Highly recommend!"
        },
        {
          id: 2,
          productId: this.productId,
          author: "Sarah M.",
          date: "2025-02-28",
          rating: 4,
          title: "Great value for money",
          content: "Good quality product for the price. Comfortable to wear for long periods. The only downside is that the controls can be a bit finnicky."
        },
        {
          id: 3,
          productId: this.productId,
          author: "Michael T.",
          date: "2025-02-10",
          rating: 5,
          title: "Perfect!",
          content: "Exactly what I was looking for. Fast delivery and the product exceeds my expectations."
        },
        {
          id: 4,
          productId: this.productId,
          author: "Emma L.",
          date: "2025-01-22",
          rating: 3,
          title: "Good but could be better",
          content: "The product itself is good quality but I expected more features for the price. Customer service was helpful when I had questions."
        },
        {
          id: 5,
          productId: this.productId,
          author: "Robert K.",
          date: "2025-01-05",
          rating: 4,
          title: "Solid purchase",
          content: "Very happy with this product. It's durable and performs well. I would buy from this brand again."
        }
      ];
      
      this.reviews = allReviews.slice(0, this.reviewsPerPage);
      this.hasMoreReviews = allReviews.length > this.reviewsPerPage;
      
      // Build the ratings distribution (for mock data)
      this.product.ratingCounts = {
        5: 45,
        4: 38,
        3: 20,
        2: 12,
        1: 9
      };
    },
    
    fetchRelatedProducts() {
      // Mock related products
      this.relatedProducts = [
        {
          id: 3,
          name: "Wireless Earbuds",
          price: 79.99,
          originalPrice: 99.99,
          onSale: true,
          image: "https://via.placeholder.com/200x200?text=Earbuds"
        },
        {
          id: 4,
          name: "Bluetooth Speaker",
          price: 49.99,
          originalPrice: 49.99,
          onSale: false,
          image: "https://via.placeholder.com/200x200?text=Speaker"
        },
        {
          id: 5,
          name: "Noise Cancelling Earphones",
          price: 149.99,
          originalPrice: 179.99,
          onSale: true,
          image: "https://via.placeholder.com/200x200?text=Earphones"
        },
        {
          id: 6,
          name: "Audio Adapter",
          price: 19.99,
          originalPrice: 19.99,
          onSale: false,
          image: "https://via.placeholder.com/200x200?text=Adapter"
        }
      ];
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
      // Simulating loading more reviews
      const allReviews = [
        {
          id: 1,
          productId: this.productId,
          author: "John D.",
          date: "2025-03-15",
          rating: 5,
          title: "Excellent product!",
          content: "I've been using this product for a month now and I'm very impressed with the quality. The sound is crystal clear and the battery lasts forever. Highly recommend!"
        },
        {
          id: 2,
          productId: this.productId,
          author: "Sarah M.",
          date: "2025-02-28",
          rating: 4,
          title: "Great value for money",
          content: "Good quality product for the price. Comfortable to wear for long periods. The only downside is that the controls can be a bit finnicky."
        },
        {
          id: 3,
          productId: this.productId,
          author: "Michael T.",
          date: "2025-02-10",
          rating: 5,
          title: "Perfect!",
          content: "Exactly what I was looking for. Fast delivery and the product exceeds my expectations."
        },
        {
          id: 4,
          productId: this.productId,
          author: "Emma L.",
          date: "2025-01-22",
          rating: 3,
          title: "Good but could be better",
          content: "The product itself is good quality but I expected more features for the price. Customer service was helpful when I had questions."
        },
        {
          id: 5,
          productId: this.productId,
          author: "Robert K.",
          date: "2025-01-05",
          rating: 4,
          title: "Solid purchase",
          content: "Very happy with this product. It's durable and performs well. I would buy from this brand again."
        },
        {
          id: 6,
          productId: this.productId,
          author: "Lisa J.",
          date: "2024-12-18",
          rating: 2,
          title: "Disappointed",
          content: "Not as described. The quality doesn't match what I expected based on the description and price."
        },
        {
          id: 7,
          productId: this.productId,
          author: "David H.",
          date: "2024-12-05",
          rating: 5,
          title: "Excellent purchase",
          content: "One of the best purchases I've made. Works flawlessly and great customer service when I had a question about setup."
        }
      ];
      
      this.reviewPage++;
      const newReviews = allReviews.slice(
        (this.reviewPage - 1) * this.reviewsPerPage,
        this.reviewPage * this.reviewsPerPage
      );
      
      this.reviews = [...this.reviews, ...newReviews];
      this.hasMoreReviews = this.reviews.length < allReviews.length;
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