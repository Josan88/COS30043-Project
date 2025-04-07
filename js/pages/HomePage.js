// HomePage.js - Main landing page for the e-commerce application
// COS30043 Interface Design and Development

const HomePage = {
  template: `
    <div class="home-page" id="content">
      <section class="hero" aria-labelledby="hero-heading">
        <div class="container">
          <div class="hero-content">
            <h1 id="hero-heading">Welcome to SwiftShop</h1>
            <p class="hero-subtitle">Discover the latest products at unbeatable prices.</p>
            <a href="#featured-products" class="btn btn-primary" 
              v-a11y-click="scrollToFeatured"
              role="button">
              Shop Now
            </a>
          </div>
        </div>
      </section>
      
      <section id="featured-products" class="featured-products" aria-labelledby="featured-heading">
        <div class="container">
          <h2 id="featured-heading" class="section-title">Featured Products</h2>
          
          <div class="loading-indicator" v-if="loading">
            <div class="spinner"></div>
            <p>Loading products...</p>
          </div>
          
          <div v-else class="products-grid">
            <div v-for="product in featuredProducts" :key="product.id" 
                class="product-card" 
                :class="{ 'sale': product.onSale }">
              <div class="product-image">
                <img v-lazy-load="product.image" :alt="product.name" width="300" height="300">
                <span v-if="product.onSale" class="sale-badge" aria-label="On Sale">Sale!</span>
              </div>
              <div class="product-info">
                <h3 class="product-title">
                  <router-link :to="'/product/' + product.id">{{ product.name }}</router-link>
                </h3>
                <div class="product-price">
                  <span v-if="product.onSale" class="original-price">{{ product.originalPrice | currency }}</span>
                  <span class="current-price">{{ product.price | currency }}</span>
                </div>
                <div class="product-rating">
                  <span>{{ product.rating | stars }}</span>
                  <span class="rating-count">({{ product.reviewCount }})</span>
                </div>
                <button @click="addToCart(product)" 
                  class="btn btn-add-to-cart"
                  aria-label="Add product to cart">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!loading && featuredProducts.length === 0" class="no-products">
            <p>No products available at the moment.</p>
          </div>
        </div>
      </section>
      
      <section class="categories" aria-labelledby="categories-heading">
        <div class="container">
          <h2 id="categories-heading" class="section-title">Shop by Category</h2>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <router-link :to="'/category/' + category.id" class="category-link">
                <div class="category-image">
                  <img v-lazy-load="category.image" :alt="category.name" width="200" height="200">
                </div>
                <h3 class="category-title">{{ category.name }}</h3>
              </router-link>
            </div>
          </div>
        </div>
      </section>
      
      <section class="promotions" aria-labelledby="promotions-heading">
        <div class="container">
          <h2 id="promotions-heading" class="section-title">Special Offers</h2>
          <div class="promotions-grid">
            <div class="promotion-card">
              <div class="promotion-content">
                <h3>Free Shipping</h3>
                <p>On orders over $50</p>
              </div>
            </div>
            <div class="promotion-card">
              <div class="promotion-content">
                <h3>10% Off</h3>
                <p>For new customers</p>
              </div>
            </div>
            <div class="promotion-card">
              <div class="promotion-content">
                <h3>Flash Sale</h3>
                <p>24 hours only - Up to 50% off</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section class="newsletter" aria-labelledby="newsletter-heading">
        <div class="container">
          <h2 id="newsletter-heading" class="section-title">Subscribe to Our Newsletter</h2>
          <div class="newsletter-container">
            <p>Get the latest updates on new products and upcoming sales.</p>
            <form class="newsletter-form" @submit.prevent="subscribeToNewsletter">
              <div class="form-group">
                <label for="newsletter-email" class="visually-hidden">Email Address</label>
                <input 
                  type="email" 
                  id="newsletter-email" 
                  v-model="newsletterEmail" 
                  placeholder="Your email address"
                  required
                  aria-required="true"
                >
                <button type="submit" class="btn btn-primary">Subscribe</button>
              </div>
              <div v-if="newsletterSuccess" class="success-message" aria-live="polite">
                Thank you for subscribing!
              </div>
              <div v-if="newsletterError" class="error-message" aria-live="polite">
                {{ newsletterError }}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  `,
  
  data() {
    return {
      loading: true,
      featuredProducts: [],
      categories: [],
      newsletterEmail: '',
      newsletterSuccess: false,
      newsletterError: null
    };
  },
  
  created() {
    this.fetchFeaturedProducts();
    this.fetchCategories();
  },
  
  methods: {
    // Simulated API calls
    fetchFeaturedProducts() {
      // Simulate loading delay
      setTimeout(() => {
        // Sample product data
        this.featuredProducts = [
          {
            id: 1,
            name: "Premium Bluetooth Headphones",
            price: 129.99,
            originalPrice: 159.99,
            image: "https://via.placeholder.com/300x300?text=Headphones",
            onSale: true,
            rating: 4.5,
            reviewCount: 124
          },
          {
            id: 2,
            name: "Smartwatch Pro",
            price: 199.99,
            originalPrice: 199.99,
            image: "https://via.placeholder.com/300x300?text=Smartwatch",
            onSale: false,
            rating: 4.0,
            reviewCount: 86
          },
          {
            id: 3,
            name: "Laptop Backpack",
            price: 49.99,
            originalPrice: 69.99,
            image: "https://via.placeholder.com/300x300?text=Backpack",
            onSale: true,
            rating: 4.7,
            reviewCount: 213
          },
          {
            id: 4,
            name: "Wireless Charging Pad",
            price: 29.99,
            originalPrice: 29.99,
            image: "https://via.placeholder.com/300x300?text=Charger",
            onSale: false,
            rating: 3.5,
            reviewCount: 42
          },
          {
            id: 5,
            name: "Coffee Maker Pro",
            price: 89.99,
            originalPrice: 119.99,
            image: "https://via.placeholder.com/300x300?text=Coffee+Maker",
            onSale: true,
            rating: 4.9,
            reviewCount: 176
          },
          {
            id: 6,
            name: "Fitness Tracker",
            price: 79.99,
            originalPrice: 79.99,
            image: "https://via.placeholder.com/300x300?text=Fitness+Tracker",
            onSale: false,
            rating: 4.2,
            reviewCount: 108
          }
        ];
        this.loading = false;
      }, 1000);
    },
    
    fetchCategories() {
      // Sample category data
      this.categories = [
        {
          id: 1,
          name: "Electronics",
          image: "https://via.placeholder.com/200x200?text=Electronics"
        },
        {
          id: 2,
          name: "Clothing",
          image: "https://via.placeholder.com/200x200?text=Clothing"
        },
        {
          id: 3,
          name: "Home & Kitchen",
          image: "https://via.placeholder.com/200x200?text=Home"
        },
        {
          id: 4,
          name: "Sports & Outdoors",
          image: "https://via.placeholder.com/200x200?text=Sports"
        }
      ];
    },
    
    addToCart(product) {
      Store.mutations.addToCart(product);
      
      // Show confirmation message using a custom event
      this.$root.$emit('show-notification', {
        message: `${product.name} added to cart!`,
        type: 'success'
      });
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
    }
  }
};