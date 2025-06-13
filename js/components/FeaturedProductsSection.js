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
          v-scroll-reveal="{ delay: index * 150, threshold: 0.2 }"        >          <div class="card-image-container">
            <router-link 
              :to="'/product/' + product.id" 
              :aria-label="'View details for ' + product.name"
              class="d-block image-link"
            >
              <img 
                v-if="product.image" 
                :src="product.image" 
                :alt="product.name"
                class="food-image responsive-image"
                loading="lazy"
              />
              <div v-else class="image-placeholder">
                <i class="fas fa-utensils"></i>
                <span>{{ product.name }}</span>
              </div>
              <div class="image-overlay">
                <span>View Details</span>
              </div>
            </router-link>
          </div>
            <div class="card-content">
            <router-link 
              :to="'/product/' + product.id" 
              class="text-decoration-none"
            >
              <h3 class="card-title">{{ product.name }}</h3>
            </router-link>
            
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
      if (!product.available) {
        // Show specific message for out-of-stock items
        if (window.ToastService) {
          window.ToastService.show(
            `${product.name} is currently out of stock`,
            "warning"
          );
        }
        return;
      }

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

        let errorMessage = "Failed to add item to cart";

        // Handle stock validation errors specifically
        if (error.code === "INSUFFICIENT_STOCK") {
          if (error.available === 0) {
            errorMessage = `${product.name} is currently out of stock`;
          } else if (error.inCart) {
            errorMessage = `Cannot add more ${product.name}. Only ${error.available} available (${error.inCart} already in cart)`;
          } else {
            errorMessage = `Only ${error.available} ${product.name} available`;
          }
        }

        // Show error feedback
        if (window.ToastService) {
          window.ToastService.show(errorMessage, "error");
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
