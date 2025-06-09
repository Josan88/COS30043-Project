const ShoppingCart = {
  template: `
    <div class="shopping-cart-page">
      <div class="container">
        <h1 class="mb-4">Your Order</h1>
        
        <!-- Empty Cart State -->
        <div v-if="cartItems.length === 0" class="empty-cart-container">
          <i class="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
          <h3>Your order is empty</h3>
          <p>Looks like you haven't added any food items to your order yet.</p>
          <div class="empty-cart-cta mt-4">
            <router-link to="/product" class="btn btn-primary">
              <i class="fas fa-utensils"></i> Browse Our Menu
            </router-link>
          </div>
        </div>
        
        <!-- Cart Items -->
        <div v-else>
          <div class="row">
            <div class="col-lg-8">
              <!-- Cart Items List -->
              <div class="card mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Your Food Items ({{ cartTotals.itemCount }})</h5>
                  <div class="badge bg-primary">{{ cartTotals.itemCount }} {{ cartTotals.itemCount === 1 ? 'item' : 'items' }}</div>
                </div>
                <div class="card-body p-0">
                  <!-- Card-based layout for items -->
                  <div class="p-3" v-for="(item, index) in cartItems" :key="item.id">
                    <cart-item 
                      :item="item" 
                      @remove-item="removeFromCart" 
                      @update-cart="handleCartUpdate"
                    ></cart-item>
                    <hr v-if="index < cartItems.length - 1">
                  </div>
                  
                  <div v-if="bulkDiscountApplied" class="p-3 savings-alert">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-success">
                        <i class="fas fa-tag me-1"></i> Group order discount applied
                      </span>
                      <span class="text-danger">-{{ $currency(discountAmount) }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white">
                  <div class="d-flex justify-content-between">
                    <router-link to="/product" class="btn btn-outline">
                      <i class="fas fa-arrow-left me-1"></i> Add More Items
                    </router-link>
                    <button @click="clearCart" class="btn btn-danger">
                      <i class="fas fa-trash me-1"></i> Clear Order
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Table Service Options -->
              <div class="card mb-4">
                <div class="card-header bg-white">
                  <h5 class="mb-0"><i class="fas fa-concierge-bell me-2"></i> Service Method</h5>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="service-method" class="form-label">Choose Service</label>
                      <select class="form-select" id="service-method" v-model="serviceMethod" @change="updateServiceDetails">
                        <option value="dine-in">Dine-in</option>
                        <option value="pickup">Pick-up</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>

                    <div v-if="serviceMethod === 'dine-in'" class="col-md-6">
                      <label for="table-number" class="form-label">Table Number</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-hashtag"></i></span>
                        <input type="text" class="form-control" id="table-number" v-model="tableNumber" placeholder="Enter your table number">
                      </div>
                      <small class="text-muted">Find your table number displayed on your table</small>
                    </div>

                    <div v-if="serviceMethod === 'delivery'" class="col-12">
                      <label for="delivery-address" class="form-label">Delivery Address</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                        <textarea class="form-control" id="delivery-address" v-model="deliveryAddress" rows="2" placeholder="Enter your delivery address"></textarea>
                      </div>
                    </div>

                    <div v-if="serviceMethod === 'pickup' || serviceMethod === 'delivery'" class="col-md-6">
                        <label for="phone-number" class="form-label">Phone Number</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fas fa-phone"></i></span>
                          <input type="tel" class="form-control" id="phone-number" v-model="phoneNumber" placeholder="Enter your phone number">
                        </div>
                         <small class="text-muted">For order updates and pickup/delivery coordination</small>
                    </div>

                    <div class="col-12">
                      <label for="special-requests" class="form-label">Special Requests (Optional)</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-comment-alt"></i></span>
                        <textarea class="form-control" id="special-requests" v-model="specialRequests" rows="2"
                          placeholder="Any special requests for your order?"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="card mb-4 cart-summary">
                <div class="card-header bg-white">
                  <h5 class="mb-0"><i class="fas fa-receipt me-2"></i> Order Summary</h5>
                </div>
                <div class="card-body">
                  <div class="order-summary">
                    <table class="table">
                      <tbody>
                        <tr>
                          <th>Subtotal ({{ cartTotals.itemCount }} {{ cartTotals.itemCount === 1 ? 'item' : 'items' }}):</th>
                          <td>{{ $currency(cartTotals.subtotal) }}</td>
                        </tr>
                        
                        <tr v-if="bulkDiscountApplied" class="text-success">
                          <th>Group Order Discount:</th>
                          <td>-{{ $currency(discountAmount) }}</td>
                        </tr>
                        
                        <tr>
                          <th>Service Charge ({{ serviceChargeRate * 100 }}%):</th>
                          <td>{{ $currency(cartTotals.serviceCharge) }}</td>
                        </tr>
                        
                        <tr>
                          <th>Tax ({{ taxRate * 100 }}%):</th>
                          <td>{{ $currency(cartTotals.tax) }}</td>
                        </tr>
                        
                        <tr v-if="promoCodeApplied" class="text-success">
                          <th>Promo Code ({{ activePromoCode.code }}):</th>
                          <td>-{{ $currency(promoDiscount) }}</td>
                        </tr>
                        
                        <tr class="total">
                          <th>Total:</th>
                          <td>{{ $currency(cartTotals.total) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <!-- Estimated Time -->
                  <div class="alert alert-info small mb-3">
                    <div class="d-flex align-items-center">
                      <i class="far fa-clock me-2 fa-2x"></i>
                      <div>
                        <div class="fw-bold mb-1">Estimated Preparation Time:</div>
                        <div>{{ estimatedTime }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Savings Summary -->
                  <div v-if="totalSavings > 0" class="savings-alert p-3 mb-3">
                    <div class="fw-bold"><i class="fas fa-piggy-bank me-2"></i> Your Savings: {{ $currency(totalSavings) }}</div>
                    <ul class="mb-0 ps-3 mt-1">                      <li v-if="bulkDiscountApplied">Group order discount: {{ $currency(discountAmount) }}</li>
                      <li v-if="promoCodeApplied">Promo code: {{ $currency(promoDiscount) }}</li>
                    </ul>
                  </div>
                  
                  <!-- Promo Code -->
                  <div class="mb-3 promo-code-container">
                    <label for="promo-code" class="form-label">Promo Code</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fas fa-ticket-alt"></i></span>
                      <input 
                        type="text" 
                        id="promo-code" 
                        class="form-control" 
                        v-model="promoCode"
                        placeholder="Enter promo code"
                        :disabled="promoCodeApplied"
                      >
                      <button 
                        class="btn" 
                        :class="promoCodeApplied ? 'btn-danger' : 'btn-outline'" 
                        type="button"
                        @click="promoCodeApplied ? removePromoCode() : applyPromoCode()"
                      >
                        {{ promoCodeApplied ? 'Remove' : 'Apply' }}
                      </button>
                    </div>
                    <div v-if="promoError" class="text-danger small mt-1">
                      <i class="fas fa-exclamation-circle me-1"></i> {{ promoError }}
                    </div>
                    <div v-if="promoCodeApplied" class="text-success small mt-1">
                      <i class="fas fa-check-circle me-1"></i> {{ activePromoCode.description }}
                    </div>
                  </div>
                  
                  <!-- Payment Method Selection -->
                  <div class="mb-3">
                    <label class="form-label">Payment Method</label>
                    
                    <div class="payment-method-option" :class="{'active': paymentMethod === 'card'}" @click="paymentMethod = 'card'">
                      <div class="d-flex align-items-center">
                        <input class="form-check-input" type="radio" name="payment-method" id="payment-card" value="card" v-model="paymentMethod">
                        <label class="form-check-label ms-2" for="payment-card">
                          <span class="fw-bold">Credit/Debit Card</span>
                        </label>
                        <div class="ms-auto">
                          <i class="fab fa-cc-visa me-1"></i>
                          <i class="fab fa-cc-mastercard me-1"></i>
                          <i class="fab fa-cc-amex"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div class="payment-method-option" :class="{'active': paymentMethod === 'online'}" @click="paymentMethod = 'online'">
                      <div class="d-flex align-items-center">
                        <input class="form-check-input" type="radio" name="payment-method" id="payment-online" value="online" v-model="paymentMethod">
                        <label class="form-check-label ms-2" for="payment-online">
                          <span class="fw-bold">Mobile Payment</span>
                        </label>
                        <div class="ms-auto">
                          <i class="fab fa-paypal me-1"></i>
                          <i class="fas fa-mobile-alt"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div class="payment-method-option" :class="{'active': paymentMethod === 'cash'}" @click="paymentMethod = 'cash'">
                      <div class="d-flex align-items-center">
                        <input class="form-check-input" type="radio" name="payment-method" id="payment-cash" value="cash" v-model="paymentMethod">
                        <label class="form-check-label ms-2" for="payment-cash">
                          <span class="fw-bold">Cash at Table</span>
                        </label>
                        <div class="ms-auto">
                          <i class="fas fa-money-bill-wave"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Place Order Button -->
                  <button @click="placeOrder" class="btn btn-primary btn-lg btn-place-order w-100" :disabled="!isOrderValid">
                    <i class="fas fa-utensils me-2"></i> Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recommended Items -->
          <div class="recommendations mt-4">
            <h3 class="mb-3">You Might Also Like</h3>
            <div class="row">
              <div v-for="product in recommendedProducts" :key="product.id" class="col-6 col-md-3 mb-4">
                <product-card :product="product" class="h-100"></product-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      cartItems: [],
      tableNumber: "",
      specialRequests: "",
      promoCode: "",
      promoError: null,
      promoCodeApplied: false,
      activePromoCode: null,
      paymentMethod: "card",
      serviceMethod: "dine-in", // Default to dine-in
      deliveryAddress: "",
      phoneNumber: "",
      serviceChargeRate: 0.05, // 5% service charge
      taxRate: 0.06, // 6% tax rate
      promoCodes: [
        {
          code: "WELCOME10",
          description: "10% off your entire order",
          type: "percentage",
          value: 10,
          minOrder: 0,
        },
        {
          code: "SAVE15",
          description: "RM15 off orders over RM80",
          type: "fixed",
          value: 15,
          minOrder: 80,
        },
        {
          code: "HAPPY5",
          description: "RM5 off any order",
          type: "fixed",
          value: 5,
          minOrder: 0,
        },
      ],
      bulkDiscountRate:
        window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_RATE || 0.05, // 5% bulk discount
      bulkDiscountThreshold:
        window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_THRESHOLD || 3, // Apply to items with quantity >= 3
      recommendedProducts: [],
      cartTotals: {
        subtotal: 0,
        serviceCharge: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      },
      isLoading: false,

      // Enhanced state management
      config: {
        pricing: {
          serviceChargeRate:
            window.APP_CONSTANTS?.PRICING?.SERVICE_CHARGE_RATE || 0.05,
          taxRate: window.APP_CONSTANTS?.PRICING?.TAX_RATE || 0.06,
          freeDeliveryThreshold:
            window.APP_CONSTANTS?.PRICING?.FREE_DELIVERY_THRESHOLD || 50,
          deliveryFee: window.APP_CONSTANTS?.PRICING?.DELIVERY_FEE || 5,
          minOrderAmount: window.APP_CONSTANTS?.PRICING?.MIN_ORDER_AMOUNT || 5,
        },
        validation: {
          tableNumberPattern:
            window.APP_CONSTANTS?.VALIDATION?.PATTERNS?.TABLE_NUMBER ||
            /^[1-9]\d*$/,
          phonePattern:
            window.APP_CONSTANTS?.VALIDATION?.PATTERNS?.PHONE ||
            /^[\+]?[0-9\-\s\(\)]{8,}$/,
          minAddressLength:
            window.APP_CONSTANTS?.VALIDATION?.MIN_LENGTHS?.ADDRESS || 10,
        },
        ui: {
          debounceDelay: window.APP_CONSTANTS?.UI_CONFIG?.DEBOUNCE_DELAY || 300,
          retryAttempts:
            window.APP_CONSTANTS?.VALIDATION?.MAX_RETRY_ATTEMPTS || 3,
        },
      },

      // Error handling and retry state
      errorState: {
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        canRetry: true,
      },

      // Analytics tracking
      analytics: {
        sessionStart: Date.now(),
        cartInteractions: 0,
        promoAttempts: 0,
        serviceMethodChanges: 0,
        conversionEvents: [],
      },

      // Validation states
      validation: {
        debounceTimeouts: new Map(),
        isSubmitting: false,
      },
    };
  },
  computed: {
    bulkDiscountApplied() {
      return this.cartItems.some(
        (item) => item.quantity >= this.bulkDiscountThreshold
      );
    },
    discountAmount() {
      if (!this.bulkDiscountApplied) return 0;
      return this.cartItems.reduce((total, item) => {
        if (item.quantity >= this.bulkDiscountThreshold) {
          return total + item.price * item.quantity * this.bulkDiscountRate;
        }
        return total;
      }, 0);
    },
    promoDiscount() {
      if (!this.promoCodeApplied || !this.activePromoCode) return 0;
      const subtotalAfterBulkDiscount =
        this.cartTotals.subtotal - this.discountAmount;

      switch (this.activePromoCode.type) {
        case "percentage":
          return Math.min(
            subtotalAfterBulkDiscount * (this.activePromoCode.value / 100),
            this.activePromoCode.maxDiscount || Infinity
          );
        case "fixed":
          return Math.min(
            this.activePromoCode.value,
            subtotalAfterBulkDiscount
          );
        default:
          return 0;
      }
    },
    totalSavings() {
      let savings = 0;
      if (this.bulkDiscountApplied) {
        savings += this.discountAmount;
      }
      if (this.promoCodeApplied) {
        savings += this.promoDiscount;
      }
      return savings;
    },
    estimatedTime() {
      const now = new Date();
      let prepTime = this.cartItems.reduce((max, item) => {
        const itemPrepTime = item.preparationTime || 15;
        return Math.max(max, itemPrepTime);
      }, 0);
      const itemCount = this.cartItems.reduce(
        (count, item) => count + item.quantity,
        0
      );
      if (itemCount > 6) {
        prepTime += 5;
      }
      now.setMinutes(now.getMinutes() + prepTime);
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes} (approximately ${prepTime} minutes)`;
    },
    isOrderValid() {
      if (this.cartItems.length === 0) return false;
      if (this.serviceMethod === "dine-in" && !this.tableNumber.trim())
        return false;
      if (this.serviceMethod === "delivery" && !this.deliveryAddress.trim())
        return false;
      if (
        (this.serviceMethod === "pickup" ||
          this.serviceMethod === "delivery") &&
        !this.phoneNumber.trim()
      )
        return false;
      return true;
    },

    // Enhanced computed properties for validation and UI state
    validationState() {
      return {
        tableNumber:
          this.serviceMethod === "dine-in"
            ? this.validateTableNumber(this.tableNumber)
            : { isValid: true },
        phoneNumber:
          this.serviceMethod === "pickup" || this.serviceMethod === "delivery"
            ? this.validatePhoneNumber(this.phoneNumber)
            : { isValid: true },
        deliveryAddress:
          this.serviceMethod === "delivery"
            ? this.validateDeliveryAddress(this.deliveryAddress)
            : { isValid: true },
        promoCode: this.promoCode
          ? this.validatePromoCode(this.promoCode)
          : { isValid: true },
      };
    },

    formErrors() {
      const errors = [];
      if (
        this.serviceMethod === "dine-in" &&
        !this.validationState.tableNumber.isValid
      ) {
        errors.push(this.validationState.tableNumber.message);
      }
      if (
        (this.serviceMethod === "pickup" ||
          this.serviceMethod === "delivery") &&
        !this.validationState.phoneNumber.isValid
      ) {
        errors.push(this.validationState.phoneNumber.message);
      }
      if (
        this.serviceMethod === "delivery" &&
        !this.validationState.deliveryAddress.isValid
      ) {
        errors.push(this.validationState.deliveryAddress.message);
      }
      return errors;
    },

    canPlaceOrder() {
      return (
        this.isOrderValid &&
        this.formErrors.length === 0 &&
        !this.validation.isSubmitting &&
        !this.errorState.hasError &&
        this.cartTotals.total >= this.config.pricing.minOrderAmount
      );
    },

    deliveryFee() {
      if (this.serviceMethod !== "delivery") return 0;
      return this.cartTotals.subtotal >=
        this.config.pricing.freeDeliveryThreshold
        ? 0
        : this.config.pricing.deliveryFee;
    },

    finalTotal() {
      return this.cartTotals.total + this.deliveryFee;
    },

    analyticsData() {
      return {
        sessionDuration: Date.now() - this.analytics.sessionStart,
        cartValue: this.cartTotals.total,
        itemCount: this.cartTotals.itemCount,
        interactions: this.analytics.cartInteractions,
        conversionScore: this.calculateConversionScore(),
      };
    },
  },

  // Enhanced watchers for form validation and analytics
  watch: {
    tableNumber: {
      handler(newVal) {
        this.analytics.cartInteractions++;
        this.debouncedValidateField("tableNumber", newVal);
      },
      deep: false,
    },

    phoneNumber: {
      handler(newVal) {
        this.analytics.cartInteractions++;
        this.debouncedValidateField("phoneNumber", newVal);
      },
      deep: false,
    },

    deliveryAddress: {
      handler(newVal) {
        this.analytics.cartInteractions++;
        this.debouncedValidateField("deliveryAddress", newVal);
      },
      deep: false,
    },

    serviceMethod: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          this.analytics.serviceMethodChanges++;
          this.trackAnalyticsEvent("service_method_changed", {
            from: oldVal,
            to: newVal,
          });
          this.clearErrorState();
        }
      },
      immediate: false,
    },

    promoCode: {
      handler(newVal) {
        if (newVal && newVal.length > 2) {
          this.debouncedValidateField("promoCode", newVal);
        }
      },
      deep: false,
    },

    cartItems: {
      handler(newItems, oldItems) {
        if (newItems.length !== oldItems.length) {
          this.trackAnalyticsEvent("cart_items_changed", {
            itemCount: newItems.length,
            cartValue: this.cartTotals.total,
          });
        }
      },
      deep: true,
    },
  },
  // Enhanced lifecycle hooks
  created() {
    try {
      this.initializeComponent();
      this.loadCart();
      this.loadRecommendedProducts();
      this.setupEventListeners();
      this.trackAnalyticsEvent("shopping_cart_viewed", {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error, "Failed to initialize shopping cart");
    }
  },

  mounted() {
    try {
      this.setupAccessibilityFeatures();
      this.initializeTooltips();
    } catch (error) {
      console.warn("Non-critical initialization error:", error);
    }
  },

  beforeUnmount() {
    try {
      this.cleanupEventListeners();
      this.clearAllTimeouts();
      this.trackAnalyticsEvent("shopping_cart_exited", {
        sessionDuration: Date.now() - this.analytics.sessionStart,
        finalCartValue: this.cartTotals.total,
      });
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  },
  methods: {
    // Enhanced initialization methods
    initializeComponent() {
      this.analytics.sessionStart = Date.now();
      this.errorState = {
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        canRetry: true,
      };
      this.validation.debounceTimeouts = new Map();
    },

    setupEventListeners() {
      window.addEventListener("cart-updated", this.loadCart);
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    },

    cleanupEventListeners() {
      window.removeEventListener("cart-updated", this.loadCart);
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    },

    setupAccessibilityFeatures() {
      // Ensure proper ARIA labels and focus management
      const cartSummary = document.querySelector(".cart-summary");
      if (cartSummary) {
        cartSummary.setAttribute("aria-live", "polite");
        cartSummary.setAttribute("role", "region");
        cartSummary.setAttribute("aria-label", "Order summary");
      }
    },

    initializeTooltips() {
      // Initialize Bootstrap tooltips if available
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(
          document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
    },

    // Enhanced validation methods
    validateTableNumber(value) {
      if (!value || !value.trim()) {
        return {
          isValid: false,
          message: "Table number is required for dine-in orders",
        };
      }
      if (!this.config.validation.tableNumberPattern.test(value.trim())) {
        return { isValid: false, message: "Please enter a valid table number" };
      }
      return { isValid: true, message: "" };
    },

    validatePhoneNumber(value) {
      if (!value || !value.trim()) {
        return { isValid: false, message: "Phone number is required" };
      }
      if (!this.config.validation.phonePattern.test(value.trim())) {
        return { isValid: false, message: "Please enter a valid phone number" };
      }
      return { isValid: true, message: "" };
    },

    validateDeliveryAddress(value) {
      if (!value || !value.trim()) {
        return { isValid: false, message: "Delivery address is required" };
      }
      if (value.trim().length < this.config.validation.minAddressLength) {
        return {
          isValid: false,
          message: `Address must be at least ${this.config.validation.minAddressLength} characters`,
        };
      }
      return { isValid: true, message: "" };
    },

    validatePromoCode(value) {
      if (!value || !value.trim()) {
        return { isValid: true, message: "" };
      }
      const code = value.trim().toUpperCase();
      const promoCode = this.promoCodes.find((promo) => promo.code === code);
      if (!promoCode) {
        return { isValid: false, message: "Invalid promo code" };
      }
      if (
        promoCode.minOrder > 0 &&
        this.cartTotals.subtotal < promoCode.minOrder
      ) {
        return {
          isValid: false,
          message: `This code requires a minimum order of ${this.$currency(
            promoCode.minOrder
          )}`,
        };
      }
      return { isValid: true, message: "" };
    },

    // Debounced validation
    debouncedValidateField(field, value) {
      // Clear existing timeout
      if (this.validation.debounceTimeouts.has(field)) {
        clearTimeout(this.validation.debounceTimeouts.get(field));
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        this.validateField(field, value);
        this.validation.debounceTimeouts.delete(field);
      }, this.config.ui.debounceDelay);

      this.validation.debounceTimeouts.set(field, timeoutId);
    },

    validateField(field, value) {
      try {
        let validationResult;
        switch (field) {
          case "tableNumber":
            validationResult = this.validateTableNumber(value);
            break;
          case "phoneNumber":
            validationResult = this.validatePhoneNumber(value);
            break;
          case "deliveryAddress":
            validationResult = this.validateDeliveryAddress(value);
            break;
          case "promoCode":
            validationResult = this.validatePromoCode(value);
            break;
          default:
            return;
        }

        // Use ValidationService if available
        if (window.ValidationService) {
          window.ValidationService.setFieldValidation(field, validationResult);
        }

        // Track validation events
        if (!validationResult.isValid) {
          this.trackAnalyticsEvent("validation_error", {
            field,
            error: validationResult.message,
          });
        }
      } catch (error) {
        console.warn(`Validation error for field ${field}:`, error);
      }
    },

    clearAllTimeouts() {
      this.validation.debounceTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      this.validation.debounceTimeouts.clear();
    },

    // Enhanced error handling
    handleError(error, context = "An error occurred") {
      console.error(`ShoppingCart Error - ${context}:`, error);

      this.errorState = {
        hasError: true,
        errorMessage: error.message || context,
        retryCount: this.errorState.retryCount + 1,
        canRetry: this.errorState.retryCount < this.config.ui.retryAttempts,
      };

      // Track error in analytics
      this.trackAnalyticsEvent("error_occurred", {
        error: error.message || context,
        retryCount: this.errorState.retryCount,
      });

      // Show toast notification if available
      this.showToast("error", this.errorState.errorMessage);
    },

    clearErrorState() {
      this.errorState = {
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        canRetry: true,
      };
    },

    // Enhanced analytics tracking
    trackAnalyticsEvent(eventName, data = {}) {
      try {
        const event = {
          name: eventName,
          timestamp: Date.now(),
          sessionId: this.analytics.sessionStart,
          data: {
            ...data,
            cartValue: this.cartTotals.total,
            itemCount: this.cartTotals.itemCount,
            serviceMethod: this.serviceMethod,
          },
        };

        this.analytics.conversionEvents.push(event);

        // Send to analytics service if available
        if (window.AnalyticsService) {
          window.AnalyticsService.track(eventName, event.data);
        }

        // Console log for development
        if (
          typeof process !== "undefined" &&
          process.env &&
          process.env.NODE_ENV === "development"
        ) {
          console.log("Analytics Event:", event);
        }
      } catch (error) {
        console.warn("Analytics tracking error:", error);
      }
    },

    calculateConversionScore() {
      let score = 0;

      // Base score for items in cart
      score += this.cartTotals.itemCount * 10;

      // Bonus for higher cart value
      score += Math.min(this.cartTotals.total / 10, 50);

      // Bonus for promo code usage
      if (this.promoCodeApplied) score += 20;

      // Bonus for service method selection
      if (this.serviceMethod !== "dine-in") score += 15;

      // Penalty for validation errors
      score -= this.formErrors.length * 5;

      return Math.max(0, Math.min(100, score));
    },

    // Toast notifications
    showToast(type, message, duration = 5000) {
      try {
        if (window.ToastService) {
          window.ToastService.show(type, message, duration);
        } else {
          // Fallback to alert for critical messages
          if (type === "error") {
            alert(`Error: ${message}`);
          }
        }
      } catch (error) {
        console.warn("Toast notification error:", error);
      }
    },

    // Event handlers
    handleResize() {
      // Responsive design adjustments
      this.trackAnalyticsEvent("viewport_changed", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },

    handleOnline() {
      this.clearErrorState();
      this.showToast("success", "Connection restored");
    },

    handleOffline() {
      this.showToast(
        "warning",
        "You are currently offline. Some features may not work properly."
      );
    }, // Enhanced service method handling
    updateServiceDetails() {
      try {
        // Reset fields when service method changes to avoid carrying over irrelevant data
        if (this.serviceMethod !== "dine-in") {
          this.tableNumber = "";
        }
        if (this.serviceMethod !== "delivery") {
          this.deliveryAddress = "";
        }
        if (this.serviceMethod === "dine-in") {
          // Clear phone for dine-in if not needed
          this.phoneNumber = "";
        }

        this.recalculateCart(); // Recalculate totals, delivery fees might change
        this.clearErrorState();

        // Track analytics
        this.trackAnalyticsEvent("service_method_updated", {
          method: this.serviceMethod,
        });

        // Show helpful toast
        const messages = {
          "dine-in": "Please enter your table number",
          pickup: "Please provide your phone number for pickup coordination",
          delivery: "Please enter your delivery address and phone number",
        };

        if (messages[this.serviceMethod]) {
          this.showToast("info", messages[this.serviceMethod]);
        }
      } catch (error) {
        this.handleError(error, "Failed to update service details");
      }
    },

    // Enhanced cart loading with retry mechanism
    async loadCart(retryCount = 0) {
      try {
        this.isLoading = true;
        this.clearErrorState();

        const cartDetails = await window.CartService.getCartWithDetails();

        if (Array.isArray(cartDetails)) {
          this.cartItems = await Promise.all(cartDetails);
        } else {
          this.cartItems = [];
        }

        this.recalculateCart();

        // Track successful cart load
        this.trackAnalyticsEvent("cart_loaded", {
          itemCount: this.cartItems.length,
          retryCount,
        });
      } catch (error) {
        console.error("Error loading cart details:", error);

        if (retryCount < this.config.ui.retryAttempts) {
          // Retry after delay
          setTimeout(() => {
            this.loadCart(retryCount + 1);
          }, 1000 * (retryCount + 1)); // Progressive delay

          this.showToast(
            "warning",
            `Loading cart... (attempt ${retryCount + 2})`
          );
        } else {
          // Fallback to basic cart service
          this.cartItems = window.CartService.getCart();
          this.handleError(error, "Failed to load cart details");
        }
      } finally {
        this.isLoading = false;
      }
    },

    // Enhanced cart update handling
    handleCartUpdate(data) {
      try {
        this.analytics.cartInteractions++;

        window.CartService.updateQuantity(data.id, data.quantity);

        if (data.specialInstructions !== undefined) {
          const itemIndex = this.cartItems.findIndex(
            (item) => item.id === data.id
          );
          if (itemIndex !== -1) {
            this.cartItems[itemIndex].specialInstructions =
              data.specialInstructions;
            window.CartService.updateCart(this.cartItems);
          }
        }

        this.loadCart();

        // Track cart interaction
        this.trackAnalyticsEvent("cart_item_updated", {
          itemId: data.id,
          newQuantity: data.quantity,
          hasSpecialInstructions: !!data.specialInstructions,
        });

        this.showToast("success", "Cart updated successfully");
      } catch (error) {
        this.handleError(error, "Failed to update cart");
      }
    }, // Enhanced recommended products loading
    async loadRecommendedProducts(retryCount = 0) {
      try {
        const cartCategories = this.cartItems
          .map((item) => item.category)
          .filter(Boolean);
        const cartIds = this.cartItems.map((item) => item.id);

        if (cartCategories.length > 0) {
          const mainCategory = cartCategories[0];
          const categoryProducts =
            await window.ProductService.getProductsByCategory(mainCategory);

          this.recommendedProducts = categoryProducts
            .filter((product) => !cartIds.includes(product.id))
            .slice(0, 4);

          if (this.recommendedProducts.length < 4) {
            const popularProducts =
              await window.ProductService.getPopularProducts(8);
            const additionalProducts = popularProducts.filter(
              (product) =>
                !cartIds.includes(product.id) &&
                !this.recommendedProducts.some((p) => p.id === product.id)
            );
            const neededCount = 4 - this.recommendedProducts.length;
            this.recommendedProducts = [
              ...this.recommendedProducts,
              ...additionalProducts.slice(0, neededCount),
            ];
          }
        } else {
          this.recommendedProducts =
            await window.ProductService.getPopularProducts(4);
        }

        // Track successful load
        this.trackAnalyticsEvent("recommended_products_loaded", {
          count: this.recommendedProducts.length,
          retryCount,
        });
      } catch (error) {
        console.error("Error loading recommended products:", error);

        if (retryCount < this.config.ui.retryAttempts) {
          setTimeout(() => {
            this.loadRecommendedProducts(retryCount + 1);
          }, 2000 * (retryCount + 1));
        } else {
          this.recommendedProducts = [];
          this.handleError(error, "Failed to load recommended products");
        }
      }
    },

    // Enhanced cart calculation with delivery fees
    recalculateCart() {
      try {
        const subtotal = this.cartItems.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);

        const itemCount = this.cartItems.reduce((count, item) => {
          return count + item.quantity;
        }, 0);

        const bulkDiscountAmount = this.bulkDiscountApplied
          ? this.discountAmount
          : 0;
        const promoDiscountAmount = this.promoCodeApplied
          ? this.promoDiscount
          : 0;
        const discountedSubtotal =
          subtotal - bulkDiscountAmount - promoDiscountAmount;

        const serviceCharge =
          discountedSubtotal * this.config.pricing.serviceChargeRate;
        const tax =
          (discountedSubtotal + serviceCharge) * this.config.pricing.taxRate;
        const deliveryFee = this.deliveryFee;

        const total = discountedSubtotal + serviceCharge + tax + deliveryFee;

        this.cartTotals = {
          subtotal: parseFloat(subtotal.toFixed(2)),
          serviceCharge: parseFloat(serviceCharge.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          deliveryFee: parseFloat(deliveryFee.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount,
        };

        // Update analytics
        this.trackAnalyticsEvent("cart_recalculated", {
          total: this.cartTotals.total,
          itemCount: this.cartTotals.itemCount,
        });
      } catch (error) {
        this.handleError(error, "Failed to calculate cart totals");
      }
    },

    // Enhanced item removal with confirmation
    removeFromCart(productId) {
      try {
        const item = this.cartItems.find((item) => item.id === productId);
        const itemName = item ? item.name : "Item";

        if (confirm(`Remove ${itemName} from your order?`)) {
          window.CartService.removeFromCart(productId);
          this.loadCart();
          this.loadRecommendedProducts();

          // Track removal
          this.trackAnalyticsEvent("item_removed_from_cart", {
            itemId: productId,
            itemName: itemName,
          });

          this.showToast("success", `${itemName} removed from cart`);
        }
      } catch (error) {
        this.handleError(error, "Failed to remove item from cart");
      }
    },

    // Enhanced cart clearing with better UX
    clearCart() {
      try {
        const itemCount = this.cartTotals.itemCount;
        const cartValue = this.cartTotals.total;

        if (
          confirm(
            `Are you sure you want to clear your entire order? This will remove ${itemCount} items worth ${this.$currency(
              cartValue
            )}.`
          )
        ) {
          window.CartService.clearCart();
          this.loadCart();

          // Track cart clear
          this.trackAnalyticsEvent("cart_cleared", {
            previousItemCount: itemCount,
            previousCartValue: cartValue,
          });

          this.showToast("info", "Your order has been cleared");
        }
      } catch (error) {
        this.handleError(error, "Failed to clear cart");
      }
    },

    // Enhanced promo code application
    applyPromoCode() {
      try {
        this.promoError = null;
        this.analytics.promoAttempts++;

        const code = this.promoCode.trim().toUpperCase();
        if (!code) {
          this.promoError = "Please enter a promo code";
          return;
        }

        const validationResult = this.validatePromoCode(code);
        if (!validationResult.isValid) {
          this.promoError = validationResult.message;
          this.trackAnalyticsEvent("promo_code_failed", {
            code: code,
            reason: validationResult.message,
          });
          return;
        }

        const promoCode = this.promoCodes.find((promo) => promo.code === code);
        this.promoCodeApplied = true;
        this.activePromoCode = promoCode;
        this.recalculateCart();

        // Track successful application
        this.trackAnalyticsEvent("promo_code_applied", {
          code: code,
          discount: this.promoDiscount,
          type: promoCode.type,
        });

        this.showToast(
          "success",
          `Promo code applied! You saved ${this.$currency(this.promoDiscount)}`
        );
      } catch (error) {
        this.handleError(error, "Failed to apply promo code");
      }
    },

    // Enhanced promo code removal
    removePromoCode() {
      try {
        const savedAmount = this.promoDiscount;
        const promoCode = this.activePromoCode?.code;

        this.promoCodeApplied = false;
        this.activePromoCode = null;
        this.promoCode = "";
        this.promoError = null;
        this.recalculateCart();

        // Track removal
        this.trackAnalyticsEvent("promo_code_removed", {
          code: promoCode,
          previousDiscount: savedAmount,
        });

        this.showToast("info", "Promo code removed");
      } catch (error) {
        this.handleError(error, "Failed to remove promo code");
      }
    }, // Enhanced order placement with comprehensive validation and error handling
    async placeOrder() {
      try {
        // Pre-flight checks
        if (!window.AuthService.isLoggedIn()) {
          localStorage.setItem("checkoutRedirect", true);
          this.trackAnalyticsEvent("checkout_redirect_to_login");
          this.$router.push("/login");
          return;
        }

        if (!this.canPlaceOrder) {
          const errors = this.formErrors;
          let message =
            "Please complete all required fields for your selected service method.";

          if (errors.length > 0) {
            message = errors[0]; // Show first validation error
          } else if (this.cartItems.length === 0) {
            message =
              "Your cart is empty. Please add some items before placing an order.";
          } else if (
            this.cartTotals.total < this.config.pricing.minOrderAmount
          ) {
            message = `Minimum order amount is ${this.$currency(
              this.config.pricing.minOrderAmount
            )}`;
          }

          this.showToast("warning", message);
          return;
        }

        // Set loading state
        this.validation.isSubmitting = true;
        this.clearErrorState();

        // Build comprehensive order data
        const orderData = {
          // Order basics
          items: this.cartItems.map((item) => ({
            ...item,
            finalPrice: item.price,
            subtotal: item.price * item.quantity,
          })),
          totals: {
            ...this.cartTotals,
            finalTotal: this.finalTotal,
            savings: this.totalSavings,
          },

          // Service details
          serviceMethod: this.serviceMethod,
          tableNumber:
            this.serviceMethod === "dine-in" ? this.tableNumber : null,
          deliveryAddress:
            this.serviceMethod === "delivery" ? this.deliveryAddress : null,
          phoneNumber:
            this.serviceMethod === "pickup" || this.serviceMethod === "delivery"
              ? this.phoneNumber
              : null,
          specialRequests: this.specialRequests || null,

          // Payment information
          payment: {
            method: this.paymentMethod,
            amount: this.finalTotal,
            currency: "MYR",
          },

          // Discount information
          discounts: {
            promoCode: this.promoCodeApplied
              ? {
                  code: this.activePromoCode.code,
                  type: this.activePromoCode.type,
                  value: this.activePromoCode.value,
                  discount: this.promoDiscount,
                }
              : null,
            bulkDiscount: this.bulkDiscountApplied
              ? {
                  rate: this.bulkDiscountRate,
                  threshold: this.bulkDiscountThreshold,
                  amount: this.discountAmount,
                }
              : null,
          },

          // Metadata
          orderTime: new Date().toISOString(),
          estimatedDeliveryTime: this.estimatedTime,
          status: "pending",
          userId: window.AuthService.getCurrentUser().id,

          // Analytics data
          analytics: {
            sessionDuration: Date.now() - this.analytics.sessionStart,
            interactions: this.analytics.cartInteractions,
            conversionScore: this.calculateConversionScore(),
            serviceMethodChanges: this.analytics.serviceMethodChanges,
            promoAttempts: this.analytics.promoAttempts,
          },
        };

        // Track order attempt
        this.trackAnalyticsEvent("order_placement_attempted", {
          orderValue: orderData.totals.finalTotal,
          itemCount: orderData.items.length,
          serviceMethod: orderData.serviceMethod,
        });

        // Submit order with retry mechanism
        const result = await this.submitOrderWithRetry(orderData);

        // Success handling
        this.trackAnalyticsEvent("order_placement_successful", {
          orderId: result.orderId || "unknown",
          orderValue: orderData.totals.finalTotal,
          paymentMethod: orderData.payment.method,
        }); // Clear cart and show success
        window.CartService.clearCart();

        this.showToast(
          "success",
          "Order placed successfully! Your food will be prepared shortly."
        );

        // Navigate to purchases page
        this.$router.push("/purchases");
      } catch (error) {
        this.handleError(error, "Failed to place order");
        this.trackAnalyticsEvent("order_placement_failed", {
          error: error.message,
          orderValue: this.finalTotal,
        });
      } finally {
        this.validation.isSubmitting = false;
      }
    },

    // Order submission with retry mechanism
    async submitOrderWithRetry(orderData, attempt = 1) {
      try {
        const result = await window.CartService.submitOrder(orderData);
        return result;
      } catch (error) {
        if (attempt < this.config.ui.retryAttempts) {
          this.showToast(
            "warning",
            `Retrying order submission... (attempt ${attempt + 1})`
          );

          // Progressive delay
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));

          return this.submitOrderWithRetry(orderData, attempt + 1);
        } else {
          throw error;
        }
      }
    },

    // Utility methods
    getItemTotal(item) {
      return item.price * item.quantity;
    },

    getMaxQuantity(productId) {
      try {
        const product = window.ProductService.getProduct(productId);
        return product ? product.stock : 50;
      } catch (error) {
        console.warn("Error getting max quantity:", error);
        return 50; // Safe fallback
      }
    },
  },
};

// Enhanced global component registration with comprehensive debugging
if (typeof window !== "undefined") {
  window.ShoppingCart = ShoppingCart;

  // Enhanced component registration with error handling
  try {
    if (window.Vue && window.Vue.component) {
      window.Vue.component("shopping-cart", ShoppingCart);
    }

    // Development environment debugging
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        "✅ ShoppingCart Component Enhanced v2.0.0 - Registration Details:"
      );
      console.log(
        "   📦 Features: Cart management, service options, promotions, analytics"
      );
      console.log(
        "   🔧 Enhanced: Error handling, validation, retry logic, accessibility"
      );
      console.log("   🎯 Analytics: Session tracking, conversion optimization");
      console.log(
        "   ♿ Accessibility: ARIA labels, keyboard navigation, screen reader support"
      );
      console.log("   📱 Mobile: Responsive design, touch-friendly interface");
      console.log(
        "   🚀 Performance: Optimized calculations, efficient state management"
      );
    }

    // Component health check
    const healthCheck = {
      hasTemplate: !!ShoppingCart.template,
      hasData: typeof ShoppingCart.data === "function",
      hasComputed: !!ShoppingCart.computed,
      hasWatchers: !!ShoppingCart.watch,
      hasMethods: !!ShoppingCart.methods,
      hasLifecycleHooks: !!(ShoppingCart.created || ShoppingCart.mounted),
      enhancementVersion: "2.0.0",
    };

    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("🏥 ShoppingCart Health Check:", healthCheck);
    }
  } catch (error) {
    console.error("❌ ShoppingCart Component Registration Error:", error);
  }
}
