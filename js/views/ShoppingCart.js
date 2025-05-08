/**
 * ShoppingCart Component
 * Handles in-restaurant food ordering cart functionality and checkout process
 */
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
                      <span class="text-danger">-{{ $filters.currency(discountAmount) }}</span>
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
                          <td>{{ $filters.currency(cartTotals.subtotal) }}</td>
                        </tr>
                        
                        <tr v-if="bulkDiscountApplied" class="text-success">
                          <th>Group Order Discount:</th>
                          <td>-{{ $filters.currency(discountAmount) }}</td>
                        </tr>
                        
                        <tr>
                          <th>Service Charge ({{ serviceChargeRate * 100 }}%):</th>
                          <td>{{ $filters.currency(cartTotals.serviceCharge) }}</td>
                        </tr>
                        
                        <tr>
                          <th>Tax ({{ taxRate * 100 }}%):</th>
                          <td>{{ $filters.currency(cartTotals.tax) }}</td>
                        </tr>
                        
                        <tr v-if="promoCodeApplied" class="text-success">
                          <th>Promo Code ({{ activePromoCode.code }}):</th>
                          <td>-{{ $filters.currency(promoDiscount) }}</td>
                        </tr>
                        
                        <tr class="total">
                          <th>Total:</th>
                          <td>{{ $filters.currency(cartTotals.total) }}</td>
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
                    <div class="fw-bold"><i class="fas fa-piggy-bank me-2"></i> Your Savings: {{ $filters.currency(totalSavings) }}</div>
                    <ul class="mb-0 ps-3 mt-1">
                      <li v-if="bulkDiscountApplied">Group order discount: {{ $filters.currency(discountAmount) }}</li>
                      <li v-if="promoCodeApplied">Promo code: {{ $filters.currency(promoDiscount) }}</li>
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
      tableNumber: '',
      specialRequests: '',
      promoCode: '',
      promoError: null,
      promoCodeApplied: false,
      activePromoCode: null,
      paymentMethod: 'card',
      serviceMethod: 'dine-in', // Default to dine-in
      deliveryAddress: '',
      phoneNumber: '',
      serviceChargeRate: 0.05, // 5% service charge
      taxRate: 0.06, // 6% tax rate
      promoCodes: [
        {
          code: 'WELCOME10',
          description: '10% off your entire order',
          type: 'percentage',
          value: 10,
          minOrder: 0
        },
        {
          code: 'SAVE15',
          description: 'RM15 off orders over RM80',
          type: 'fixed',
          value: 15,
          minOrder: 80
        },
        {
          code: 'HAPPY5',
          description: 'RM5 off any order',
          type: 'fixed',
          value: 5,
          minOrder: 0
        }
      ],
      bulkDiscountRate: 0.05, // 5% bulk discount
      bulkDiscountThreshold: 3, // Apply to items with quantity >= 3
      recommendedProducts: [],
      cartTotals: {
        subtotal: 0,
        serviceCharge: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      },
      isLoading: false
    };
  },
  computed: {
    bulkDiscountApplied() {
      return this.cartItems.some(item => item.quantity >= this.bulkDiscountThreshold);
    },
    discountAmount() {
      if (!this.bulkDiscountApplied) return 0;
      return this.cartItems.reduce((total, item) => {
        if (item.quantity >= this.bulkDiscountThreshold) {
          return total + (item.price * item.quantity * this.bulkDiscountRate);
        }
        return total;
      }, 0);
    },
    promoDiscount() {
      if (!this.promoCodeApplied || !this.activePromoCode) return 0;
      const subtotalAfterBulkDiscount = this.cartTotals.subtotal - this.discountAmount;
      switch (this.activePromoCode.type) {
        case 'percentage':
          return subtotalAfterBulkDiscount * (this.activePromoCode.value / 100);
        case 'fixed':
          return this.activePromoCode.value;
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
      const itemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
      if (itemCount > 6) {
        prepTime += 5;
      }
      now.setMinutes(now.getMinutes() + prepTime);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes} (approximately ${prepTime} minutes)`;
    },
    isOrderValid() {
      if (this.cartItems.length === 0) return false;
      if (this.serviceMethod === 'dine-in' && !this.tableNumber.trim()) return false;
      if (this.serviceMethod === 'delivery' && !this.deliveryAddress.trim()) return false;
      if ((this.serviceMethod === 'pickup' || this.serviceMethod === 'delivery') && !this.phoneNumber.trim()) return false;
      return true;
    }
  },
  created() {
    this.loadCart();
    this.loadRecommendedProducts();
    window.addEventListener('cart-updated', this.loadCart);
  },
  beforeDestroy() {
    window.removeEventListener('cart-updated', this.loadCart);
  },
  methods: {
    updateServiceDetails() {
      // Reset fields when service method changes to avoid carrying over irrelevant data
      if (this.serviceMethod !== 'dine-in') {
        this.tableNumber = '';
      }
      if (this.serviceMethod !== 'delivery') {
        this.deliveryAddress = '';
      }
      if (this.serviceMethod === 'dine-in') { // Clear phone for dine-in if not needed
        this.phoneNumber = '';
      }
      this.recalculateCart(); // Recalculate totals, delivery fees might change
    },
    async loadCart() {
      try {
        this.isLoading = true;
        const cartDetails = await window.CartService.getCartWithDetails();
        if (Array.isArray(cartDetails)) {
          this.cartItems = await Promise.all(cartDetails);
        } else {
          this.cartItems = [];
        }
        this.recalculateCart();
      } catch (error) {
        console.error('Error loading cart details:', error);
        this.cartItems = window.CartService.getCart();
      } finally {
        this.isLoading = false;
      }
    },
    handleCartUpdate(data) {
      window.CartService.updateQuantity(data.id, data.quantity);
      if (data.specialInstructions !== undefined) {
        const itemIndex = this.cartItems.findIndex(item => item.id === data.id);
        if (itemIndex !== -1) {
          this.cartItems[itemIndex].specialInstructions = data.specialInstructions;
          window.CartService.updateCart(this.cartItems);
        }
      }
      this.loadCart();
    },
    async loadRecommendedProducts() {
      try {
        const cartCategories = this.cartItems.map(item => item.category).filter(Boolean);
        const cartIds = this.cartItems.map(item => item.id);
        if (cartCategories.length > 0) {
          const mainCategory = cartCategories[0];
          const categoryProducts = await window.ProductService.getProductsByCategory(mainCategory);
          this.recommendedProducts = categoryProducts
            .filter(product => !cartIds.includes(product.id))
            .slice(0, 4);
          if (this.recommendedProducts.length < 4) {
            const popularProducts = await window.ProductService.getPopularProducts(8);
            const additionalProducts = popularProducts.filter(product =>
              !cartIds.includes(product.id) &&
              !this.recommendedProducts.some(p => p.id === product.id)
            );
            const neededCount = 4 - this.recommendedProducts.length;
            this.recommendedProducts = [
              ...this.recommendedProducts,
              ...additionalProducts.slice(0, neededCount)
            ];
          }
        } else {
          this.recommendedProducts = await window.ProductService.getPopularProducts(4);
        }
      } catch (error) {
        console.error('Error loading recommended products:', error);
        this.recommendedProducts = [];
      }
    },
    recalculateCart() {
      const subtotal = this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      const itemCount = this.cartItems.reduce((count, item) => {
        return count + item.quantity;
      }, 0);
      const bulkDiscountAmount = this.bulkDiscountApplied ? this.discountAmount : 0;
      const promoDiscountAmount = this.promoCodeApplied ? this.promoDiscount : 0;
      const discountedSubtotal = subtotal - bulkDiscountAmount - promoDiscountAmount;
      const serviceCharge = discountedSubtotal * this.serviceChargeRate;
      const tax = (discountedSubtotal + serviceCharge) * this.taxRate;
      const total = discountedSubtotal + serviceCharge + tax;
      this.cartTotals = {
        subtotal: parseFloat(subtotal.toFixed(2)),
        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount
      };
    },
    getItemTotal(item) {
      return item.price * item.quantity;
    },
    getMaxQuantity(productId) {
      const product = window.ProductService.getProduct(productId);
      return product ? product.stock : 50;
    },
    removeFromCart(productId) {
      window.CartService.removeFromCart(productId);
      this.loadCart();
      this.loadRecommendedProducts();
    },
    clearCart() {
      if (confirm('Are you sure you want to clear your order?')) {
        window.CartService.clearCart();
        this.loadCart();
      }
    },
    applyPromoCode() {
      this.promoError = null;
      const code = this.promoCode.trim().toUpperCase();
      if (!code) {
        this.promoError = 'Please enter a promo code';
        return;
      }
      const promoCode = this.promoCodes.find(promo => promo.code === code);
      if (!promoCode) {
        this.promoError = 'Invalid promo code';
        return;
      }
      if (promoCode.minOrder > 0 && this.cartTotals.subtotal < promoCode.minOrder) {
        this.promoError = `This code requires a minimum order of ${this.$filters.currency(promoCode.minOrder)}`;
        return;
      }
      this.promoCodeApplied = true;
      this.activePromoCode = promoCode;
      this.recalculateCart();
    },
    removePromoCode() {
      this.promoCodeApplied = false;
      this.activePromoCode = null;
      this.promoCode = '';
      this.promoError = null;
      this.recalculateCart();
    },
    async placeOrder() {
      if (!window.AuthService.isLoggedIn()) {
        localStorage.setItem('checkoutRedirect', true);
        this.$router.push('/login');
        return;
      }
      if (!this.isOrderValid) {
        let message = 'Please complete all required fields for your selected service method.';
        if (this.serviceMethod === 'dine-in' && !this.tableNumber.trim()) {
          message = 'Please enter your table number for dine-in orders.';
        } else if (this.serviceMethod === 'delivery' && !this.deliveryAddress.trim()) {
          message = 'Please enter your delivery address.';
        } else if ((this.serviceMethod === 'pickup' || this.serviceMethod === 'delivery') && !this.phoneNumber.trim()) {
          message = 'Please enter your phone number for pickup/delivery.';
        }
        alert(message);
        return;
      }
      const orderData = {
        items: this.cartItems,
        totals: this.cartTotals,
        serviceMethod: this.serviceMethod,
        tableNumber: this.serviceMethod === 'dine-in' ? this.tableNumber : null,
        deliveryAddress: this.serviceMethod === 'delivery' ? this.deliveryAddress : null,
        phoneNumber: (this.serviceMethod === 'pickup' || this.serviceMethod === 'delivery') ? this.phoneNumber : null,
        specialRequests: this.specialRequests,
        payment: {
          method: this.paymentMethod
        },
        promoCode: this.promoCodeApplied ? this.activePromoCode : null,
        bulkDiscount: this.bulkDiscountApplied ? {
          rate: this.bulkDiscountRate,
          amount: this.discountAmount
        } : null,
        orderTime: new Date().toISOString(),
        estimatedDeliveryTime: this.estimatedTime,
        status: 'pending',
        userId: window.AuthService.getCurrentUser().id
      };

      try {
        const result = await window.CartService.submitOrder(orderData);
        alert('Order placed successfully! Your food will be prepared shortly.');
        this.$router.push('/purchases');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Error: ' + (error.message || 'Failed to place order'));
      }
    }
  }
};

// Make the component globally available
window.ShoppingCart = ShoppingCart;