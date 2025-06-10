/**
 * Cart Items Section Component
 *
 * Displays the list of cart items with actions for updating and removing items.
 */

const CartItemsSection = {
  props: {
    cartItems: {
      type: Array,
      required: true,
    },
    cartSummary: {
      type: Object,
      required: true,
    },
    bulkDiscountApplied: {
      type: Boolean,
      default: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },

  template: `
    <article class="cart-items-section">
      <div class="card mb-3 mb-lg-4">
        <div class="card-header bg-white">
          <div class="row align-items-center">
            <div class="col-12 col-sm-6">
              <h2 class="section-title">
                <i class="fas fa-list-ul me-2"></i>
                Your Food Items
              </h2>
            </div>
            <div class="col-12 col-sm-6 text-sm-end mt-2 mt-sm-0">
              <span class="badge bg-primary fs-6">
                {{ cartSummary.itemCount }} {{ cartSummary.itemCount === 1 ? 'item' : 'items' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0">
          <!-- Cart Items Grid -->
          <div class="cart-items-grid">
            <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item-wrapper">
              <cart-item 
                :item="item" 
                @remove-item="$emit('remove-item', $event)" 
                @update-cart="$emit('update-cart', $event)"
                class="cart-item-component"
              ></cart-item>
              <hr v-if="index < cartItems.length - 1" class="cart-item-divider">
            </div>
          </div>
          
          <!-- Bulk Discount Alert -->
          <div v-if="bulkDiscountApplied" class="bulk-discount-alert">
            <div class="container-fluid">
              <div class="row align-items-center">
                <div class="col-12 col-sm-8">
                  <span class="discount-text">
                    <i class="fas fa-tag me-2"></i>
                    Group order discount applied
                  </span>
                </div>
                <div class="col-12 col-sm-4 text-sm-end mt-2 mt-sm-0">
                  <span class="discount-amount">-{{ formatCurrency(discountAmount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cart Actions -->
        <div class="card-footer bg-white">
          <div class="cart-actions">
            <div class="row g-2">
              <div class="col-12 col-sm-6 col-lg-auto">
                <router-link to="/product" class="btn btn-outline w-100">
                  <i class="fas fa-arrow-left me-2"></i>
                  <span class="d-none d-sm-inline">Add More Items</span>
                  <span class="d-sm-none">Add More</span>
                </router-link>
              </div>
              <div class="col-12 col-sm-6 col-lg-auto">
                <button @click="$emit('clear-cart')" class="btn btn-danger w-100">
                  <i class="fas fa-trash me-2"></i>
                  <span class="d-none d-sm-inline">Clear Order</span>
                  <span class="d-sm-none">Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `,

  methods: {
    formatCurrency(amount) {
      if (this.$currency) {
        return this.$currency(amount);
      }
      return `RM ${amount.toFixed(2)}`;
    },
  },
};

// Register component
if (typeof window !== "undefined") {
  window.CartItemsSection = CartItemsSection;

  // Auto-register with app instance when available
  if (window.app && window.app.component) {
    window.app.component("cart-items-section", CartItemsSection);
  }
}
