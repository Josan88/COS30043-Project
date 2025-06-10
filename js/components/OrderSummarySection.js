/**
 * Order Summary Section Component
 *
 * Displays order totals, promo codes, payment methods, and checkout button.
 */

const OrderSummarySection = {
  props: {
    cartSummary: {
      type: Object,
      required: true,
    },
    discountCalculations: {
      type: Object,
      required: true,
    },
    estimatedTime: {
      type: String,
      required: true,
    },
    promoCode: {
      type: String,
      default: "",
    },
    promoError: {
      type: String,
      default: null,
    },
    promoCodeApplied: {
      type: Boolean,
      default: false,
    },
    activePromoCode: {
      type: Object,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    isOrderValid: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },

  template: `
    <div class="order-summary-sticky">
      <div class="card cart-summary">
        <div class="card-header bg-white">
          <h3 class="section-title">
            <i class="fas fa-receipt me-2"></i>
            Order Summary
          </h3>
        </div>
        <div class="card-body">
          
          <!-- Order Totals -->
          <div class="order-totals">
            <div class="totals-table">
              <div class="total-row">
                <span class="total-label">
                  Subtotal ({{ cartSummary.itemCount }} {{ cartSummary.itemCount === 1 ? 'item' : 'items' }})
                </span>
                <span class="total-value">{{ formatCurrency(cartSummary.subtotal) }}</span>
              </div>
              
              <div v-if="discountCalculations.bulkDiscountApplied" class="total-row discount-row">
                <span class="total-label text-success">
                  <i class="fas fa-tag me-1"></i>
                  Group Order Discount
                </span>
                <span class="total-value text-success">-{{ formatCurrency(discountCalculations.bulkDiscountAmount) }}</span>
              </div>
              
              <div class="total-row">
                <span class="total-label">
                  Service Charge (5%)
                </span>
                <span class="total-value">{{ formatCurrency(cartSummary.serviceCharge) }}</span>
              </div>
              
              <div class="total-row">
                <span class="total-label">
                  Tax (6%)
                </span>
                <span class="total-value">{{ formatCurrency(cartSummary.tax) }}</span>
              </div>
              
              <div v-if="cartSummary.deliveryFee > 0" class="total-row">
                <span class="total-label">
                  Delivery Fee
                </span>
                <span class="total-value">{{ formatCurrency(cartSummary.deliveryFee) }}</span>
              </div>
              
              <div v-if="promoCodeApplied" class="total-row discount-row">
                <span class="total-label text-success">
                  <i class="fas fa-ticket-alt me-1"></i>
                  Promo ({{ activePromoCode.code }})
                </span>
                <span class="total-value text-success">-{{ formatCurrency(discountCalculations.promoDiscountAmount) }}</span>
              </div>
              
              <div class="total-row final-total">
                <span class="total-label">Total</span>
                <span class="total-value">{{ formatCurrency(cartSummary.total) }}</span>
              </div>
            </div>
          </div>
        
          <!-- Estimated Time -->
          <div class="estimated-time-section">
            <div class="time-info-card">
              <div class="row align-items-center">
                <div class="col-3 col-sm-2 text-center">
                  <i class="far fa-clock time-icon"></i>
                </div>
                <div class="col-9 col-sm-10">
                  <div class="time-label">Estimated Preparation Time</div>
                  <div class="time-value">{{ estimatedTime }}</div>
                </div>
              </div>
            </div>
          </div>
        
          <!-- Savings Summary -->
          <div v-if="discountCalculations.totalSavings > 0" class="savings-summary-section">
            <div class="savings-card">
              <div class="savings-header">
                <i class="fas fa-piggy-bank me-2"></i>
                Your Savings: {{ formatCurrency(discountCalculations.totalSavings) }}
              </div>
              <div class="savings-breakdown">
                <div v-if="discountCalculations.bulkDiscountApplied" class="saving-item">
                  <span class="saving-type">Group order discount</span>
                  <span class="saving-amount">{{ formatCurrency(discountCalculations.bulkDiscountAmount) }}</span>
                </div>
                <div v-if="promoCodeApplied" class="saving-item">
                  <span class="saving-type">Promo code</span>
                  <span class="saving-amount">{{ formatCurrency(discountCalculations.promoDiscountAmount) }}</span>
                </div>
              </div>
            </div>
          </div>
        
          <!-- Promo Code Section -->
          <div class="promo-code-section">
            <label for="promo-code" class="form-label fw-bold">
              <i class="fas fa-ticket-alt me-2"></i>
              Promo Code
            </label>
            
            <div class="promo-input-group">
              <div class="row g-2">
                <div class="col-12 col-sm-8">                  <input 
                    type="text" 
                    id="promo-code" 
                    class="form-control form-control-lg" 
                    :value="promoCode"
                    @input="updatePromoCode($event.target.value)"
                    placeholder="Enter promo code"
                    :disabled="promoCodeApplied"
                  >
                </div>
                <div class="col-12 col-sm-4">
                  <button 
                    class="btn w-100"
                    :class="promoCodeApplied ? 'btn-danger' : 'btn-outline-primary'" 
                    type="button"
                    @click="promoCodeApplied ? $emit('remove-promo-code') : $emit('apply-promo-code')"
                  >
                    {{ promoCodeApplied ? 'Remove' : 'Apply' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="promoError" class="promo-feedback error">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ promoError }}
            </div>
            <div v-if="promoCodeApplied" class="promo-feedback success">
              <i class="fas fa-check-circle me-1"></i>
              {{ activePromoCode.description }}
            </div>
          </div>
        
          <!-- Payment Method Selection -->
          <div class="payment-method-section">
            <label class="form-label fw-bold">
              <i class="fas fa-credit-card me-2"></i>
              Payment Method
            </label>
            
            <div class="payment-options">
              <!-- Credit/Debit Card -->
              <div class="payment-option" :class="{'active': paymentMethod === 'card'}" @click="$emit('update-payment-method', 'card')">
                <div class="payment-option-content">
                  <div class="row align-items-center">
                    <div class="col-1">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="payment-method" 
                        id="payment-card" 
                        value="card" 
                        :checked="paymentMethod === 'card'"
                        @change="$emit('update-payment-method', 'card')"
                      >
                    </div>
                    <div class="col-8 col-sm-9">
                      <label class="payment-label" for="payment-card">
                        Credit/Debit Card
                      </label>
                    </div>
                    <div class="col-3 col-sm-2 text-end">
                      <div class="payment-icons">
                        <i class="fab fa-cc-visa"></i>
                        <i class="fab fa-cc-mastercard"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mobile Payment -->
              <div class="payment-option" :class="{'active': paymentMethod === 'online'}" @click="$emit('update-payment-method', 'online')">
                <div class="payment-option-content">
                  <div class="row align-items-center">
                    <div class="col-1">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="payment-method" 
                        id="payment-online" 
                        value="online" 
                        :checked="paymentMethod === 'online'"
                        @change="$emit('update-payment-method', 'online')"
                      >
                    </div>
                    <div class="col-8 col-sm-9">
                      <label class="payment-label" for="payment-online">
                        Mobile Payment
                      </label>
                    </div>
                    <div class="col-3 col-sm-2 text-end">
                      <div class="payment-icons">
                        <i class="fab fa-paypal"></i>
                        <i class="fas fa-mobile-alt"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Cash Payment -->
              <div class="payment-option" :class="{'active': paymentMethod === 'cash'}" @click="$emit('update-payment-method', 'cash')">
                <div class="payment-option-content">
                  <div class="row align-items-center">
                    <div class="col-1">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="payment-method" 
                        id="payment-cash" 
                        value="cash" 
                        :checked="paymentMethod === 'cash'"
                        @change="$emit('update-payment-method', 'cash')"
                      >
                    </div>
                    <div class="col-8 col-sm-9">
                      <label class="payment-label" for="payment-cash">
                        Cash at Table
                      </label>
                    </div>
                    <div class="col-3 col-sm-2 text-end">
                      <div class="payment-icons">
                        <i class="fas fa-money-bill-wave"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          <!-- Checkout Button Section -->
          <div class="checkout-section">
            <button 
              @click="$emit('place-order')" 
              class="btn btn-primary btn-lg btn-checkout w-100" 
              :disabled="!isOrderValid || isSubmitting"
            >
              <div class="checkout-button-content">
                <div class="row align-items-center">
                  <div class="col-8 text-start">
                    <div class="checkout-text">
                      <i class="fas fa-utensils me-2"></i>
                      {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
                    </div>
                    <div class="checkout-subtext">
                      {{ cartSummary.itemCount }} items
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="checkout-total">
                      {{ formatCurrency(cartSummary.total) }}
                    </div>
                  </div>
                </div>
              </div>
            </button>
            
            <!-- Security Notice -->
            <div class="security-notice">
              <i class="fas fa-shield-alt me-1"></i>
              <small>Secure checkout with SSL encryption</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    formatCurrency(amount) {
      if (this.$currency) {
        return this.$currency(amount);
      }
      return `RM ${amount.toFixed(2)}`;
    },

    updatePromoCode(value) {
      this.$emit("update-promo-code", value);
    },
  },
};

// Register component
if (typeof window !== "undefined") {
  window.OrderSummarySection = OrderSummarySection;

  // Auto-register with app instance when available
  if (window.app && window.app.component) {
    window.app.component("order-summary-section", OrderSummarySection);
  }
}
