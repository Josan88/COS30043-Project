// =====================================================
// FeaturedProductsSection Component
// =====================================================

const FeaturedProductsSection = {
  props: {
    products: { type: Array, default: () => [] },
    isLoading: { type: Boolean, default: false },
    loadError: { type: String, default: null },
    config: { type: Object, required: true },
  },

  emits: ["retry-load", "product-feedback"],
  template: `
    <div class="featured-products-section">
      <!-- Loading State -->
      <div v-if="isLoading && products.length === 0" class="text-center py-5">
        <div class="spinner-grow text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">{{ config.text.loadingMessage }}</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="loadError" class="text-center py-5">
        <div class="alert alert-warning" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ loadError }}
          <button 
            @click="$emit('retry-load')" 
            class="btn btn-sm btn-outline-warning ms-2"
          >
            <i class="fas fa-redo me-1"></i>Retry
          </button>
        </div>
      </div>
      
      <!-- Featured Products Grid - Mobile First -->
      <div v-else class="card-grid">
        <div 
          v-for="(product, index) in products" 
          :key="product.id" 
          class="card"
          v-scroll-reveal="{ delay: index * 150, threshold: 0.2 }"
        >
          <div class="card-image">
            <img 
              v-if="product.image" 
              :src="product.image" 
              :alt="product.name"
              loading="lazy"
            />
            <div v-else class="placeholder-image">
              <i class="fas fa-utensils"></i>
              <span>{{ product.name }}</span>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ product.name }}</h3>
            
            <div class="card-rating" v-if="product.rating">
              <span class="stars">
                <i v-for="star in 5" :key="star" 
                   :class="star <= product.rating ? 'fas fa-star' : 'far fa-star'">
                </i>
              </span>
              <span>({{ product.rating }})</span>
            </div>
              <p class="card-text" v-if="product.description">
              {{ product.description }}
            </p>
            
            <div class="card-price">RM{{ product.price?.toFixed(2) || '0.00' }}</div>
            
            <div class="card-actions">
              <button 
                class="btn-add-to-cart"
                @click="addToCart(product)"
                :disabled="!product.available"
              >
                <i class="fas fa-plus"></i>
                {{ product.available ? 'Add' : 'Unavailable' }}
              </button>
            </div>
          </div>
        </div>
      </div>    </div>
  `,

  methods: {
    /**
     * Add product to cart
     */
    async addToCart(product) {
      if (!product.available) return;

      try {
        // Use CartService to add product
        if (window.CartService) {
          await window.CartService.addItem(product);

          // Show success feedback
          if (window.ToastService) {
            window.ToastService.show(
              `${product.name} added to cart!`,
              "success"
            );
          }

          // Emit feedback event
          this.$emit("product-feedback", {
            type: "cart-add",
            product: product,
            success: true,
          });
        }
      } catch (error) {
        console.error("Failed to add product to cart:", error);

        // Show error feedback
        if (window.ToastService) {
          window.ToastService.show("Failed to add item to cart", "error");
        }

        // Emit feedback event
        this.$emit("product-feedback", {
          type: "cart-add",
          product: product,
          success: false,
          error: error.message,
        });
      }
    },
  },
};

// Register component globally
window.FeaturedProductsSection = FeaturedProductsSection;
