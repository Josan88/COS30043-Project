/**
 * Recommended Items Section Component
 *
 * Displays recommended products based on cart contents or popular items.
 */

const RecommendedItemsSection = {
  props: {
    recommendedProducts: {
      type: Array,
      required: true,
    },
  },

  template: `
    <section class="recommendations-section mt-4 mt-lg-5">
      <div class="section-header">
        <h3 class="recommendations-title">
          <i class="fas fa-heart me-2"></i>
          You Might Also Like
        </h3>
      </div>
      
      <!-- Responsive Product Grid -->
      <div class="recommendations-grid">
        <div class="row g-3">
          <div 
            v-for="product in recommendedProducts" 
            :key="product.id" 
            class="col-6 col-md-4 col-lg-3"
          >
            <product-card 
              :product="product" 
              class="h-100 recommendation-card"
            ></product-card>
          </div>
        </div>
      </div>
    </section>
  `,
};

// Register component
if (typeof window !== "undefined") {
  window.RecommendedItemsSection = RecommendedItemsSection;

  // Auto-register with app instance when available
  if (window.app && window.app.component) {
    window.app.component("recommended-items-section", RecommendedItemsSection);
  }
}
