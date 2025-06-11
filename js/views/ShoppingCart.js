/**
 * Shopping Cart Component - Improved Version
 *
 * A comprehensive shopping cart component for the food ordering system.
 * Features include cart management, service options, pricing calculations,
 * promo codes, payment methods, and order placement.
 * * Key Features:
 * - Responsive design for mobile and desktop
 * - Multiple service methods (dine-in, pickup, delivery)
 * - Dynamic pricing with discounts and taxes
 * - Promo code system
 * - Form validation
 * - Error handling with retry logic
 *
 * @version 2.0.0 (Improved Readability)
 */

// =====================================================
// CONSTANTS AND CONFIGURATION
// =====================================================

const PRICING_CONFIG = {
  SERVICE_CHARGE_RATE: 0.05, // 5%
  TAX_RATE: 0.06, // 6%
  BULK_DISCOUNT_RATE: 0.05, // 5%
  BULK_DISCOUNT_THRESHOLD: 3, // items
  FREE_DELIVERY_THRESHOLD: 50, // RM
  DELIVERY_FEE: 5, // RM
  MIN_ORDER_AMOUNT: 5, // RM
};

const VALIDATION_PATTERNS = {
  TABLE_NUMBER: /^[1-9]\d*$/,
  PHONE: /^[\+]?[0-9\-\s\(\)]{8,}$/,
  MIN_ADDRESS_LENGTH: 10,
};

const UI_CONFIG = {
  DEBOUNCE_DELAY: 300, // ms
  RETRY_ATTEMPTS: 3,
  TOAST_DURATION: 5000, // ms
};

const DEFAULT_PROMO_CODES = [
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
];

// =====================================================
// SHOPPING CART COMPONENT
// =====================================================

const ShoppingCart = {
  template: `
    <div class="shopping-cart-page">
      <!-- Cart Header Section -->
      <section class="cart-header">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-12 col-md-6">
              <h1 class="cart-title">
                <i class="fas fa-shopping-cart me-2"></i>
                Your Order
              </h1>
              <p class="cart-subtitle" v-if="hasCartItems">
                Review your items before checkout
              </p>
            </div>
            <div class="col-12 col-md-6 text-md-end mt-2 mt-md-0">
              <div class="cart-status-badge" v-if="hasCartItems">
                <span class="item-count">{{ cartSummary.itemCount }}</span>
                <span class="item-text">{{ cartSummary.itemCount === 1 ? 'item' : 'items' }}</span>
                <span class="total-amount">{{ formatCurrency(cartSummary.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
        
      <!-- Empty Cart State -->
      <section v-if="!hasCartItems" class="empty-cart-section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8 col-lg-6 text-center">
              <div class="empty-cart-container">
                <i class="fas fa-shopping-cart empty-cart-icon"></i>
                <h2 class="empty-cart-title">Your order is empty</h2>
                <p class="empty-cart-description">
                  Looks like you haven't added any food items to your order yet.
                </p>
                <div class="empty-cart-cta">
                  <router-link to="/product" class="btn btn-primary btn-lg">
                    <i class="fas fa-utensils me-2"></i>
                    Browse Our Menu
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        
      <!-- Main Cart Content -->
      <main v-else class="cart-main-content">
        <div class="container">
          <div class="row g-3 g-lg-4">
            <!-- Cart Items Section (Left Column) -->
            <div class="col-12 col-lg-8 order-2 order-lg-1">
                <!-- Cart Items List -->
              <cart-items-section 
                v-if="!isLoading && cartItems.length > 0"
                :cart-items="cartItems"
                :cart-summary="cartSummary"
                :bulk-discount-applied="discountCalculations.bulkDiscountApplied"
                :discount-amount="discountCalculations.bulkDiscountAmount"
                @remove-item="handleRemoveItem"
                @update-cart="handleCartUpdate"
                @clear-cart="handleClearCart"
              />
              
              <!-- Loading State -->
              <div v-else-if="isLoading" class="cart-loading">
                <div class="text-center py-4">
                  <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                  <p>Loading your cart...</p>
                </div>
              </div>
              
              <!-- Service Options Section -->
              <service-options-section
                :service-method="serviceMethod"
                :table-number="tableNumber"
                :delivery-address="deliveryAddress"
                :phone-number="phoneNumber"
                :special-requests="specialRequests"
                :validation-errors="validationErrors"
                @update-service-method="handleServiceMethodUpdate"
                @update-table-number="handleTableNumberUpdate"
                @update-delivery-address="handleDeliveryAddressUpdate"
                @update-phone-number="handlePhoneNumberUpdate"
                @update-special-requests="handleSpecialRequestsUpdate"
              />
              
            </div>
            
            </div>
            <!-- Order Summary Section (Right Column) -->
            <aside class="col-12 col-lg-4 order-1 order-lg-2">              
              <order-summary-section
                :cart-summary="cartSummary"
                :discount-calculations="discountCalculations"
                :estimated-time="estimatedTime"
                :promo-code="promoCode"
                :promo-error="promoError"
                :promo-code-applied="promoCodeApplied"
                :active-promo-code="activePromoCode"
                :payment-method="paymentMethod"
                :is-order-valid="canPlaceOrder"
                :is-submitting="isSubmitting"
                @update-promo-code="handleUpdatePromoCode"
                @apply-promo-code="handleApplyPromoCode"
                @remove-promo-code="handleRemovePromoCode"
                @update-payment-method="handlePaymentMethodUpdate"
                @place-order="handlePlaceOrder"
              />
            </aside>
            <!-- Recommended Items Section -->
          <recommended-items-section
            v-if="recommendedProducts.length > 0"
            :recommended-products="recommendedProducts"
          />
          
        </div>
      </main>
        
      <!-- Customization Modal -->
      <customization-modal
        v-if="showCustomizationModal"
        :item="currentItemToCustomize"
        @close="handleCloseCustomizationModal"
        @customize="handleCustomizeItem"
      />
    </div>
  `,

  // =====================================================
  // COMPONENT DATA
  // =====================================================
  data() {
    return {
      // Core cart data
      cartItems: [],
      cartSummary: {
        subtotal: 0,
        serviceCharge: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
      },

      // Service options
      serviceMethod: "dine-in",
      tableNumber: "",
      deliveryAddress: "",
      phoneNumber: "",
      specialRequests: "",

      // Promo code system
      promoCode: "",
      promoError: null,
      promoCodeApplied: false,
      activePromoCode: null,
      availablePromoCodes: [...DEFAULT_PROMO_CODES],

      // Payment
      paymentMethod: "card", // UI state
      isLoading: false,
      isSubmitting: false,
      validationErrors: {},

      // Customization modal
      showCustomizationModal: false,
      currentItemToCustomize: null,

      // Recommendations
      recommendedProducts: [],

      // Configuration
      config: {
        pricing: {
          serviceChargeRate:
            window.APP_CONSTANTS?.PRICING?.SERVICE_CHARGE_RATE ||
            PRICING_CONFIG.SERVICE_CHARGE_RATE,
          taxRate:
            window.APP_CONSTANTS?.PRICING?.TAX_RATE || PRICING_CONFIG.TAX_RATE,
          bulkDiscountRate:
            window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_RATE ||
            PRICING_CONFIG.BULK_DISCOUNT_RATE,
          bulkDiscountThreshold:
            window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_THRESHOLD ||
            PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD,
          freeDeliveryThreshold:
            window.APP_CONSTANTS?.PRICING?.FREE_DELIVERY_THRESHOLD ||
            PRICING_CONFIG.FREE_DELIVERY_THRESHOLD,
          deliveryFee:
            window.APP_CONSTANTS?.PRICING?.DELIVERY_FEE ||
            PRICING_CONFIG.DELIVERY_FEE,
          minOrderAmount:
            window.APP_CONSTANTS?.PRICING?.MIN_ORDER_AMOUNT ||
            PRICING_CONFIG.MIN_ORDER_AMOUNT,
        },
        ui: {
          debounceDelay:
            window.APP_CONSTANTS?.UI_CONFIG?.DEBOUNCE_DELAY ||
            UI_CONFIG.DEBOUNCE_DELAY,
          retryAttempts:
            window.APP_CONSTANTS?.VALIDATION?.MAX_RETRY_ATTEMPTS ||
            UI_CONFIG.RETRY_ATTEMPTS,
        },
      },
      errorState: {
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        canRetry: true,
      },

      // Validation
      validation: {
        debounceTimeouts: new Map(),
      },
    };
  },

  // =====================================================
  // COMPUTED PROPERTIES
  // =====================================================

  computed: {
    /**
     * Check if cart has any items
     */
    hasCartItems() {
      return this.cartItems.length > 0;
    },

    /**
     * Calculate all discount-related values
     */
    discountCalculations() {
      const bulkDiscountApplied = this.cartItems.some(
        (item) => item.quantity >= this.config.pricing.bulkDiscountThreshold
      );

      const bulkDiscountAmount = bulkDiscountApplied
        ? this.calculateBulkDiscountAmount()
        : 0;

      const promoDiscountAmount = this.promoCodeApplied
        ? this.calculatePromoDiscountAmount()
        : 0;

      const totalSavings = bulkDiscountAmount + promoDiscountAmount;

      return {
        bulkDiscountApplied,
        bulkDiscountAmount,
        promoDiscountAmount,
        totalSavings,
      };
    },

    /**
     * Calculate estimated preparation time
     */
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

      // Add extra time for large orders
      if (itemCount > 6) {
        prepTime += 5;
      }

      now.setMinutes(now.getMinutes() + prepTime);
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      return `${hours}:${minutes} (approximately ${prepTime} minutes)`;
    },

    /**
     * Check if order can be placed
     */
    canPlaceOrder() {
      return (
        this.hasCartItems &&
        this.isFormValid &&
        !this.isSubmitting &&
        !this.errorState.hasError &&
        this.cartSummary.total >= this.config.pricing.minOrderAmount
      );
    },

    /**
     * Validate form based on service method
     */
    isFormValid() {
      const errors = this.getValidationErrors();
      this.validationErrors = errors;
      return Object.keys(errors).length === 0;
    },

    /**
     * Calculate delivery fee
     */
    deliveryFee() {
      if (this.serviceMethod !== "delivery") return 0;

      return this.cartSummary.subtotal >=
        this.config.pricing.freeDeliveryThreshold
        ? 0
        : this.config.pricing.deliveryFee;
    },
  },

  // =====================================================
  // WATCHERS
  // =====================================================
  watch: {
    // Form field watchers with debounced validation
    tableNumber: {
      handler(newVal) {
        this.debouncedValidateField("tableNumber", newVal);
      },
    },

    phoneNumber: {
      handler(newVal) {
        this.debouncedValidateField("phoneNumber", newVal);
      },
    },

    deliveryAddress: {
      handler(newVal) {
        this.debouncedValidateField("deliveryAddress", newVal);
      },
    },

    serviceMethod: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          this.clearErrorState();
          this.recalculateCart();
        }
      },
    },

    cartItems: {
      handler() {
        this.recalculateCart();
      },
      deep: true,
    },
  },

  // =====================================================
  // LIFECYCLE HOOKS
  // =====================================================

  created() {
    this.initializeComponent();
  },

  mounted() {
    this.setupAccessibilityFeatures();
  },

  beforeUnmount() {
    this.cleanup();
  },

  // =====================================================
  // METHODS
  // =====================================================

  methods: {
    // ---------------------------------------------
    // INITIALIZATION METHODS
    // ---------------------------------------------

    /**
     * Initialize the component
     */ async initializeComponent() {
      try {
        this.setupEventListeners();
        await this.loadCart();
        await this.loadRecommendedProducts();
      } catch (error) {
        this.handleError(error, "Failed to initialize shopping cart");
      }
    },

    /**
     * Setup event listeners
     */ setupEventListeners() {
      window.addEventListener("cart-updated", this.loadCart);
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);

      // Listen for customize item events from CartItem components using EventBus
      window.EventBus.on(
        "open-customization-modal",
        this.handleOpenCustomizationModal
      );

      // Listen for toast notifications from other components
      window.EventBus.on("show-toast", this.handleShowToast);
    },

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
      const cartSummary = document.querySelector(".cart-summary");
      if (cartSummary) {
        cartSummary.setAttribute("aria-live", "polite");
        cartSummary.setAttribute("role", "region");
        cartSummary.setAttribute("aria-label", "Order summary");
      }
    },

    /**
     * Cleanup on component destruction
     */ cleanup() {
      this.cleanupEventListeners();
      this.clearAllTimeouts();
    },

    /**
     * Remove event listeners
     */ cleanupEventListeners() {
      window.removeEventListener("cart-updated", this.loadCart);
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);

      // Remove customize item event listener from EventBus
      window.EventBus.off(
        "open-customization-modal",
        this.handleOpenCustomizationModal
      );

      // Remove toast notification listener
      window.EventBus.off("show-toast", this.handleShowToast);
    },

    // ---------------------------------------------
    // CART MANAGEMENT METHODS
    // ---------------------------------------------

    /**
     * Load cart items and details
     */
    async loadCart(retryCount = 0) {
      try {
        this.isLoading = true;
        this.clearErrorState();

        // Check if CartService is available
        if (
          !window.CartService ||
          typeof window.CartService.getCartWithDetails !== "function"
        ) {
          console.warn("CartService not available, initializing empty cart");
          this.cartItems = [];
          this.recalculateCart();
          return;
        }

        // Get cart items with details (returns array of promises)
        const cartDetailsPromises = window.CartService.getCartWithDetails();

        // Wait for all promises to resolve if we have promises
        let cartDetails = [];
        if (Array.isArray(cartDetailsPromises)) {
          // Check if first item is a promise
          if (
            cartDetailsPromises.length > 0 &&
            cartDetailsPromises[0] &&
            typeof cartDetailsPromises[0].then === "function"
          ) {
            cartDetails = await Promise.all(cartDetailsPromises);
          } else {
            // Already resolved items
            cartDetails = cartDetailsPromises;
          }
        } // Ensure we have valid cart items
        this.cartItems = cartDetails.filter(
          (item) => item && typeof item === "object"
        );

        this.recalculateCart();
      } catch (error) {
        console.error("Error loading cart details:", error);

        if (retryCount < this.config.ui.retryAttempts) {
          setTimeout(() => {
            this.loadCart(retryCount + 1);
          }, 1000 * (retryCount + 1));
        } else {
          this.handleError(error, "Failed to load cart details");
        }
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Recalculate cart totals
     */ recalculateCart() {
      try {
        // Validate cart items before calculation
        const validCartItems = this.cartItems.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.price === "number" &&
            typeof item.quantity === "number" &&
            !isNaN(item.price) &&
            !isNaN(item.quantity) &&
            item.quantity > 0
        );

        const subtotal = validCartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        const itemCount = validCartItems.reduce(
          (count, item) => count + item.quantity,
          0
        );

        // Ensure discount calculations don't return NaN
        const bulkDiscountAmount =
          this.discountCalculations.bulkDiscountAmount || 0;
        const promoDiscountAmount =
          this.discountCalculations.promoDiscountAmount || 0;

        const discountedSubtotal = Math.max(
          0,
          subtotal - bulkDiscountAmount - promoDiscountAmount
        );
        const serviceCharge =
          discountedSubtotal * this.config.pricing.serviceChargeRate;
        const tax =
          (discountedSubtotal + serviceCharge) * this.config.pricing.taxRate;
        const deliveryFee = this.deliveryFee || 0;
        const total = discountedSubtotal + serviceCharge + tax + deliveryFee;

        this.cartSummary = {
          subtotal: this.roundToTwoDecimals(subtotal),
          serviceCharge: this.roundToTwoDecimals(serviceCharge),
          tax: this.roundToTwoDecimals(tax),
          deliveryFee: this.roundToTwoDecimals(deliveryFee),
          total: this.roundToTwoDecimals(total),
          itemCount,
        };
      } catch (error) {
        // Reset to safe defaults on error
        this.cartSummary = {
          subtotal: 0,
          serviceCharge: 0,
          tax: 0,
          deliveryFee: 0,
          total: 0,
          itemCount: 0,
        };
        this.handleError(error, "Failed to calculate cart totals");
      }
    },

    // ---------------------------------------------
    // DISCOUNT CALCULATION METHODS
    // ---------------------------------------------

    /**
     * Calculate bulk discount amount
     */
    calculateBulkDiscountAmount() {
      return this.cartItems.reduce((total, item) => {
        if (item.quantity >= this.config.pricing.bulkDiscountThreshold) {
          return (
            total +
            item.price * item.quantity * this.config.pricing.bulkDiscountRate
          );
        }
        return total;
      }, 0);
    },

    /**
     * Calculate promo code discount amount
     */
    calculatePromoDiscountAmount() {
      if (!this.promoCodeApplied || !this.activePromoCode) return 0;

      const subtotalAfterBulkDiscount =
        this.cartSummary.subtotal -
        this.discountCalculations.bulkDiscountAmount;

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
    }, // ---------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------

    /**
     * Handle cart item removal
     */
    async handleRemoveItem(productId) {
      try {
        const item = this.cartItems.find((item) => item.id === productId);
        const itemName = item ? item.name : "Item";
        if (confirm(`Remove ${itemName} from your order?`)) {
          window.CartService.removeFromCart(productId);
          await this.loadCart();
          await this.loadRecommendedProducts();

          this.showToast("success", `${itemName} removed from cart`);
        }
      } catch (error) {
        this.handleError(error, "Failed to remove item from cart");
      }
    },

    /**
     * Handle opening customization modal
     */ handleOpenCustomizationModal(item) {
      try {
        this.currentItemToCustomize = item;
        this.showCustomizationModal = true;
      } catch (error) {
        this.handleError(error, "Failed to open customization modal");
      }
    },

    /**
     * Handle closing customization modal
     */
    handleCloseCustomizationModal() {
      this.showCustomizationModal = false;
      this.currentItemToCustomize = null;
    },

    /**
     * Handle item customization
     */
    async handleCustomizeItem(customizedItem) {
      try {
        // Update the item in the cart with new customizations
        window.CartService.updateItemCustomization(
          customizedItem.id,
          customizedItem
        );

        // Reload cart to reflect changes
        await this.loadCart(); // Close the modal
        this.handleCloseCustomizationModal();

        this.showToast(
          "success",
          `${customizedItem.name} customization updated`
        );
      } catch (error) {
        this.handleError(error, "Failed to update item customization");
      }
    },

    /**
     * Handle toast notifications from other components
     */
    handleShowToast(toastData) {
      const { message, type } = toastData;
      this.showToast(type, message);
    },
    /**
     * Handle cart update (quantity, special instructions)
     */ async handleCartUpdate(data) {
      try {
        // Handle quantity updates with stock validation
        if (data.quantity !== undefined) {
          await window.CartService.updateQuantity(data.id, data.quantity);
        }

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

        await this.loadCart();
        this.showToast("success", "Cart updated successfully");
      } catch (error) {
        console.error("Cart update error:", error);

        let errorMessage = "Failed to update cart";

        // Handle stock validation errors specifically
        if (error.code === "INSUFFICIENT_STOCK") {
          if (error.available === 0) {
            errorMessage = "This item is currently out of stock";
          } else {
            errorMessage = `Only ${error.available} items available. Quantity reset to ${error.currentQuantity}`;
          }

          // Reload cart to reset quantities to valid values
          await this.loadCart();
        }

        this.handleError(error, errorMessage);
      }
    },

    /**
     * Handle clear cart
     */
    async handleClearCart() {
      try {
        const itemCount = this.cartSummary.itemCount;
        const cartValue = this.cartSummary.total;

        if (
          confirm(
            `Are you sure you want to clear your entire order? This will remove ${itemCount} items worth ${this.formatCurrency(
              cartValue
            )}.`
          )
        ) {
          window.CartService.clearCart();
          await this.loadCart();

          this.showToast("info", "Your order has been cleared");
        }
      } catch (error) {
        this.handleError(error, "Failed to clear cart");
      }
    },

    /**
     * Handle service method update
     */
    handleServiceMethodUpdate(newMethod) {
      this.serviceMethod = newMethod;
      this.clearFieldsForServiceMethod();
      this.showServiceMethodMessage();
    },

    /**
     * Handle table number update
     */
    handleTableNumberUpdate(value) {
      this.tableNumber = value;
    },

    /**
     * Handle delivery address update
     */
    handleDeliveryAddressUpdate(value) {
      this.deliveryAddress = value;
    },

    /**
     * Handle phone number update
     */
    handlePhoneNumberUpdate(value) {
      this.phoneNumber = value;
    },

    /**
     * Handle special requests update
     */
    handleSpecialRequestsUpdate(value) {
      this.specialRequests = value;
    },

    /**
     * Handle promo code application
     */ handleApplyPromoCode() {
      try {
        this.promoError = null;

        const code = this.promoCode.trim().toUpperCase();
        if (!code) {
          this.promoError = "Please enter a promo code";
          return;
        }

        const validationResult = this.validatePromoCode(code);
        if (!validationResult.isValid) {
          this.promoError = validationResult.message;
          return;
        }

        const promoCode = this.availablePromoCodes.find(
          (promo) => promo.code === code
        );
        this.promoCodeApplied = true;
        this.activePromoCode = promoCode;
        this.recalculateCart();

        this.showToast(
          "success",
          `Promo code applied! You saved ${this.formatCurrency(
            this.discountCalculations.promoDiscountAmount
          )}`
        );
      } catch (error) {
        this.handleError(error, "Failed to apply promo code");
      }
    },

    /**
     * Handle promo code removal
     */ handleRemovePromoCode() {
      try {
        const savedAmount = this.discountCalculations.promoDiscountAmount;
        const promoCode = this.activePromoCode?.code;

        this.promoCodeApplied = false;
        this.activePromoCode = null;
        this.promoCode = "";
        this.promoError = null;
        this.recalculateCart();

        this.showToast("info", "Promo code removed");
      } catch (error) {
        this.handleError(error, "Failed to remove promo code");
      }
    },

    /**
     * Handle payment method update
     */ handlePaymentMethodUpdate(method) {
      this.paymentMethod = method;
    },

    /**
     * Handle promo code update
     */
    handleUpdatePromoCode(value) {
      this.promoCode = value;
    },

    /**
     * Handle order placement
     */
    async handlePlaceOrder() {
      try {
        // Check authentication
        if (!window.AuthService.isLoggedIn()) {
          localStorage.setItem("checkoutRedirect", true);
          this.$router.push("/login");
          return;
        }

        // Validate order
        if (!this.canPlaceOrder) {
          this.showValidationErrors();
          return;
        }

        this.isSubmitting = true;
        this.clearErrorState(); // Build order data
        const orderData = this.buildOrderData();

        // Submit order
        const result = await this.submitOrderWithRetry(orderData);

        // Clear cart and navigate
        window.CartService.clearCart();
        this.showToast(
          "success",
          "Order placed successfully! Your food will be prepared shortly."
        );
        this.$router.push("/purchases");
      } catch (error) {
        this.handleError(error, "Failed to place order");
      } finally {
        this.isSubmitting = false;
      }
    },

    // ---------------------------------------------
    // VALIDATION METHODS
    // ---------------------------------------------

    /**
     * Get validation errors for current form state
     */
    getValidationErrors() {
      const errors = {};

      if (this.serviceMethod === "dine-in" && !this.tableNumber.trim()) {
        errors.tableNumber = "Table number is required for dine-in orders";
      } else if (
        this.serviceMethod === "dine-in" &&
        !VALIDATION_PATTERNS.TABLE_NUMBER.test(this.tableNumber.trim())
      ) {
        errors.tableNumber = "Please enter a valid table number";
      }

      if (
        (this.serviceMethod === "pickup" ||
          this.serviceMethod === "delivery") &&
        !this.phoneNumber.trim()
      ) {
        errors.phoneNumber = "Phone number is required";
      } else if (
        (this.serviceMethod === "pickup" ||
          this.serviceMethod === "delivery") &&
        !VALIDATION_PATTERNS.PHONE.test(this.phoneNumber.trim())
      ) {
        errors.phoneNumber = "Please enter a valid phone number";
      }

      if (this.serviceMethod === "delivery" && !this.deliveryAddress.trim()) {
        errors.deliveryAddress = "Delivery address is required";
      } else if (
        this.serviceMethod === "delivery" &&
        this.deliveryAddress.trim().length <
          VALIDATION_PATTERNS.MIN_ADDRESS_LENGTH
      ) {
        errors.deliveryAddress = `Address must be at least ${VALIDATION_PATTERNS.MIN_ADDRESS_LENGTH} characters`;
      }

      return errors;
    },

    /**
     * Validate promo code
     */
    validatePromoCode(code) {
      if (!code || !code.trim()) {
        return { isValid: true, message: "" };
      }

      const promoCode = this.availablePromoCodes.find(
        (promo) => promo.code === code
      );
      if (!promoCode) {
        return { isValid: false, message: "Invalid promo code" };
      }

      if (
        promoCode.minOrder > 0 &&
        this.cartSummary.subtotal < promoCode.minOrder
      ) {
        return {
          isValid: false,
          message: `This code requires a minimum order of ${this.formatCurrency(
            promoCode.minOrder
          )}`,
        };
      }

      return { isValid: true, message: "" };
    },

    /**
     * Debounced field validation
     */
    debouncedValidateField(field, value) {
      if (this.validation.debounceTimeouts.has(field)) {
        clearTimeout(this.validation.debounceTimeouts.get(field));
      }

      const timeoutId = setTimeout(() => {
        this.validateField(field, value);
        this.validation.debounceTimeouts.delete(field);
      }, UI_CONFIG.DEBOUNCE_DELAY);

      this.validation.debounceTimeouts.set(field, timeoutId);
    },

    /**
     * Validate individual field
     */ validateField(field, value) {
      const errors = this.getValidationErrors();
      this.validationErrors = errors;
    },

    // ---------------------------------------------
    // UTILITY METHODS
    // ---------------------------------------------

    /**
     * Create empty cart summary object
     */
    createEmptyCartSummary() {
      return {
        subtotal: 0,
        serviceCharge: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
      };
    },

    /**
     * Create configuration object
     */
    createConfigObject() {
      return {
        pricing: {
          serviceChargeRate:
            window.APP_CONSTANTS?.PRICING?.SERVICE_CHARGE_RATE ||
            PRICING_CONFIG.SERVICE_CHARGE_RATE,
          taxRate:
            window.APP_CONSTANTS?.PRICING?.TAX_RATE || PRICING_CONFIG.TAX_RATE,
          bulkDiscountRate:
            window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_RATE ||
            PRICING_CONFIG.BULK_DISCOUNT_RATE,
          bulkDiscountThreshold:
            window.APP_CONSTANTS?.PRICING?.BULK_DISCOUNT_THRESHOLD ||
            PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD,
          freeDeliveryThreshold:
            window.APP_CONSTANTS?.PRICING?.FREE_DELIVERY_THRESHOLD ||
            PRICING_CONFIG.FREE_DELIVERY_THRESHOLD,
          deliveryFee:
            window.APP_CONSTANTS?.PRICING?.DELIVERY_FEE ||
            PRICING_CONFIG.DELIVERY_FEE,
          minOrderAmount:
            window.APP_CONSTANTS?.PRICING?.MIN_ORDER_AMOUNT ||
            PRICING_CONFIG.MIN_ORDER_AMOUNT,
        },
        ui: {
          debounceDelay:
            window.APP_CONSTANTS?.UI_CONFIG?.DEBOUNCE_DELAY ||
            UI_CONFIG.DEBOUNCE_DELAY,
          retryAttempts:
            window.APP_CONSTANTS?.VALIDATION?.MAX_RETRY_ATTEMPTS ||
            UI_CONFIG.RETRY_ATTEMPTS,
        },
      };
    }
    /**
     * Create error state object
     */,
    createErrorState() {
      return {
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        canRetry: true,
      };
    },
    /**
     * Format currency value
     */ formatCurrency(amount) {
      // Handle invalid amounts
      if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount)) {
        amount = 0;
      }

      if (this.$currency) {
        return this.$currency(amount);
      }
      return `RM ${amount.toFixed(2)}`;
    },
    /**
     * Round number to two decimal places
     */ roundToTwoDecimals(num) {
      if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
        return 0;
      }
      return parseFloat(num.toFixed(2));
    },

    /**
     * Clear fields when service method changes
     */
    clearFieldsForServiceMethod() {
      if (this.serviceMethod !== "dine-in") {
        this.tableNumber = "";
      }
      if (this.serviceMethod !== "delivery") {
        this.deliveryAddress = "";
      }
      if (this.serviceMethod === "dine-in") {
        this.phoneNumber = "";
      }
    },

    /**
     * Show message for service method
     */
    showServiceMethodMessage() {
      const messages = {
        "dine-in": "Please enter your table number",
        pickup: "Please provide your phone number for pickup coordination",
        delivery: "Please enter your delivery address and phone number",
      };

      if (messages[this.serviceMethod]) {
        this.showToast("info", messages[this.serviceMethod]);
      }
    },

    /**
     * Show validation errors
     */
    showValidationErrors() {
      const errors = this.getValidationErrors();

      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        this.showToast("warning", firstError);
      } else if (!this.hasCartItems) {
        this.showToast(
          "warning",
          "Your cart is empty. Please add some items before placing an order."
        );
      } else if (this.cartSummary.total < this.config.pricing.minOrderAmount) {
        this.showToast(
          "warning",
          `Minimum order amount is ${this.formatCurrency(
            this.config.pricing.minOrderAmount
          )}`
        );
      }
    },

    /**
     * Build order data object
     */
    buildOrderData() {
      return {
        items: this.cartItems.map((item) => ({
          ...item,
          finalPrice: item.price,
          subtotal: item.price * item.quantity,
        })),
        totals: {
          ...this.cartSummary,
          finalTotal: this.cartSummary.total,
          savings: this.discountCalculations.totalSavings,
        },
        serviceMethod: this.serviceMethod,
        tableNumber: this.serviceMethod === "dine-in" ? this.tableNumber : null,
        deliveryAddress:
          this.serviceMethod === "delivery" ? this.deliveryAddress : null,
        phoneNumber:
          this.serviceMethod === "pickup" || this.serviceMethod === "delivery"
            ? this.phoneNumber
            : null,
        specialRequests: this.specialRequests || null,
        payment: {
          method: this.paymentMethod,
          amount: this.cartSummary.total,
          currency: "MYR",
        },
        discounts: {
          promoCode: this.promoCodeApplied
            ? {
                code: this.activePromoCode.code,
                type: this.activePromoCode.type,
                value: this.activePromoCode.value,
                discount: this.discountCalculations.promoDiscountAmount,
              }
            : null,
          bulkDiscount: this.discountCalculations.bulkDiscountApplied
            ? {
                rate: this.config.pricing.bulkDiscountRate,
                threshold: this.config.pricing.bulkDiscountThreshold,
                amount: this.discountCalculations.bulkDiscountAmount,
              }
            : null,
        },
        orderTime: new Date().toISOString(),
        estimatedDeliveryTime: this.estimatedTime,
        status: "pending",
        userId: window.AuthService.getCurrentUser().id,
      };
    },

    /**
     * Submit order with retry mechanism
     */
    async submitOrderWithRetry(orderData, attempt = 1) {
      try {
        return await window.CartService.submitOrder(orderData);
      } catch (error) {
        if (attempt < this.config.ui.retryAttempts) {
          this.showToast(
            "warning",
            `Retrying order submission... (attempt ${attempt + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          return this.submitOrderWithRetry(orderData, attempt + 1);
        } else {
          throw error;
        }
      }
    },

    /**
     * Load recommended products
     */
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

          // Fill remaining slots with popular products if needed
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
    }, // ---------------------------------------------
    // ERROR HANDLING METHODS
    // ---------------------------------------------

    /**
     * Handle errors
     */ handleError(error, context = "An error occurred") {
      console.error(`ShoppingCart Error - ${context}:`, error);

      this.errorState = {
        hasError: true,
        errorMessage: error.message || context,
        retryCount: this.errorState.retryCount + 1,
        canRetry: this.errorState.retryCount < this.config.ui.retryAttempts,
      };

      this.showToast("error", this.errorState.errorMessage);
    },
    /**
     * Clear error state
     */ clearErrorState() {
      this.errorState = this.createErrorState();
    },

    /**
     * Show toast notification
     */
    showToast(type, message, duration = UI_CONFIG.TOAST_DURATION) {
      try {
        if (window.ToastService) {
          window.ToastService.show(message, type, { duration });
        } else if (type === "error") {
          alert(`Error: ${message}`);
        }
      } catch (error) {
        console.warn("Toast notification error:", error);
      }
    },

    /**
     * Clear all timeouts
     */
    clearAllTimeouts() {
      this.validation.debounceTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      this.validation.debounceTimeouts.clear();
    }, // Event handlers for window events
    handleResize() {
      // Handle window resize events
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
    },
  },
};

// =====================================================
// COMPONENT REGISTRATION
// =====================================================

if (typeof window !== "undefined") {
  window.ShoppingCart = ShoppingCart;

  try {
    // Register with Vue 3 app instance
    if (window.app && window.app.component) {
      window.app.component("shopping-cart", ShoppingCart);
    }

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log(
        "✅ ShoppingCart Component v2.0.0 (Improved Readability) registered successfully"
      );
      console.log(
        "   📦 Features: Modular structure, clear naming, comprehensive documentation"
      );
      console.log(
        "   🔧 Improvements: Better organization, readable methods, clear separation of concerns"
      );
      console.log(
        "   🎯 Code Quality: Consistent formatting, descriptive comments, logical grouping"
      );
    }
  } catch (error) {
    console.error("❌ ShoppingCart Component Registration Error:", error);
  }
}
