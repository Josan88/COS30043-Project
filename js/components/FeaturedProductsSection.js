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
    <div class="special-offers py-5 bg-light">
      <div class="container">
        <div class="row mb-4">
          <div class="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-primary fw-bold text-uppercase">
                <i class="fas fa-fire me-2"></i> {{ config.text.featuredSectionTitle }}
              </h6>
              <h2 class="display-6 fw-bold mb-0">{{ config.text.featuredSectionSubtitle }}</h2>
            </div>
            <router-link 
              to="/product" 
              class="btn btn-outline-primary"
              :aria-label="config.text.viewAllMenuAriaLabel"
            >
              {{ config.text.viewAllMenuText }}
            </router-link>
          </div>
        </div>
        
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
        
        <!-- Featured Products Grid -->
        <div v-else class="position-relative featured-carousel">
          <div class="row">
            <div 
              v-for="(product, index) in products" 
              :key="product.id" 
              class="col-12 col-md-6 col-lg-3 mb-4"
              v-scroll-reveal="{ delay: index * 150, threshold: 0.2 }"
            >
              <product-card 
                :product="product" 
                class="featured-product-card"
                @show-feedback="(event) => $emit('product-feedback', event)"
              ></product-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

// Register component globally
window.FeaturedProductsSection = FeaturedProductsSection;
