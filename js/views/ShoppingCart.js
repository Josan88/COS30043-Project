/**
 * ShoppingCart Component
 * Demonstrates the ability to populate cart items and manipulate data
 */
const ShoppingCart = {
  template: `
    <div class="shopping-cart-page">
      <div class="container">
        <h1 class="mb-4">Your Shopping Cart</h1>
        
        <!-- Empty Cart State -->
        <div v-if="cartItems.length === 0" class="text-center py-5">
          <i class="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <router-link to="/products" class="btn btn-primary mt-3">
            <i class="fas fa-shopping-bag"></i> Continue Shopping
          </router-link>
        </div>
        
        <!-- Cart Items -->
        <div v-else>
          <div class="row">
            <div class="col-lg-8">
              <!-- Cart Items List -->
              <div class="card mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Cart Items ({{ cartTotals.itemCount }})</h5>
                  <div class="badge bg-primary">{{ cartTotals.itemCount }} {{ cartTotals.itemCount === 1 ? 'item' : 'items' }}</div>
                </div>
                <div class="card-body p-0">
                  <!-- Table for larger screens -->
                  <div class="table-responsive d-none d-md-block">
                    <table class="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th scope="col" width="100">Product</th>
                          <th scope="col">Name</th>
                          <th scope="col" width="120">Price</th>
                          <th scope="col" width="140">Quantity</th>
                          <th scope="col" width="120">Total</th>
                          <th scope="col" width="60"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in cartItems" :key="item.id" class="align-middle">
                          <td>
                            <router-link :to="'/products/' + item.id">
                              <img :src="item.image" :alt="item.name" width="60" class="img-thumbnail">
                            </router-link>
                          </td>
                          <td>
                            <router-link :to="'/products/' + item.id" class="text-decoration-none">
                              {{ item.name }}
                            </router-link>
                            <span v-if="item.discount" class="badge bg-danger ms-2">{{ item.discount }}% OFF</span>
                          </td>
                          <td>
                            <div v-if="item.originalPrice && item.originalPrice !== item.price">
                              <span class="text-decoration-line-through text-muted small">
                                {{ item.originalPrice | currency }}
                              </span><br>
                              <span class="text-danger">{{ item.price | currency }}</span>
                            </div>
                            <div v-else>
                              {{ item.price | currency }}
                            </div>
                          </td>
                          <td>
                            <div class="d-flex align-items-center">
                              <button 
                                @click="updateItemQuantity(item.id, item.quantity - 1)" 
                                class="btn btn-sm btn-outline"
                                :disabled="item.quantity <= 1"
                                aria-label="Decrease quantity"
                              >
                                <i class="fas fa-minus"></i>
                              </button>
                              <input 
                                type="number" 
                                class="form-control mx-2" 
                                v-model.number="item.quantity" 
                                min="1" 
                                @change="updateItemQuantity(item.id, item.quantity)"
                                :aria-label="'Quantity for ' + item.name"
                                style="width: 60px"
                              >
                              <button 
                                @click="updateItemQuantity(item.id, item.quantity + 1)" 
                                class="btn btn-sm btn-outline"
                                :disabled="item.quantity >= getMaxQuantity(item.id)"
                                aria-label="Increase quantity"
                              >
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                            <div v-if="getMaxQuantity(item.id) <= 5" class="small text-danger mt-1">
                              Only {{ getMaxQuantity(item.id) }} in stock
                            </div>
                          </td>
                          <td class="fw-bold">{{ getItemTotal(item) | currency }}</td>
                          <td>
                            <button 
                              @click="removeFromCart(item.id)" 
                              class="btn btn-sm btn-danger"
                              aria-label="Remove item"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot v-if="bulkDiscountApplied">
                        <tr class="bg-light">
                          <td colspan="4" class="text-end">
                            <span class="text-success">
                              <i class="fas fa-tag me-1"></i> Bulk discount applied
                            </span>
                          </td>
                          <td class="text-danger">-{{ discountAmount | currency }}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <!-- Mobile-friendly list for small screens -->
                  <div class="d-md-none">
                    <div v-for="item in cartItems" :key="item.id" class="p-3 border-bottom">
                      <div class="d-flex mb-3">
                        <router-link :to="'/products/' + item.id" class="me-3">
                          <img :src="item.image" :alt="item.name" width="80" class="img-thumbnail">
                        </router-link>
                        <div>
                          <h6>
                            <router-link :to="'/products/' + item.id" class="text-decoration-none">
                              {{ item.name }}
                            </router-link>
                          </h6>
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <div v-if="item.originalPrice && item.originalPrice !== item.price">
                                <span class="text-decoration-line-through text-muted small me-2">
                                  {{ item.originalPrice | currency }}
                                </span>
                                <span class="text-danger">{{ item.price | currency }}</span>
                              </div>
                              <div v-else>
                                {{ item.price | currency }}
                              </div>
                            </div>
                            <button 
                              @click="removeFromCart(item.id)" 
                              class="btn btn-sm btn-outline-danger"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                          <div class="d-flex align-items-center">
                            <div class="me-2">Qty:</div>
                            <div class="d-flex align-items-center">
                              <button 
                                @click="updateItemQuantity(item.id, item.quantity - 1)" 
                                class="btn btn-sm btn-outline"
                                :disabled="item.quantity <= 1"
                              >
                                <i class="fas fa-minus"></i>
                              </button>
                              <input 
                                type="number" 
                                class="form-control mx-2" 
                                v-model.number="item.quantity" 
                                min="1" 
                                @change="updateItemQuantity(item.id, item.quantity)"
                                style="width: 50px"
                              >
                              <button 
                                @click="updateItemQuantity(item.id, item.quantity + 1)" 
                                class="btn btn-sm btn-outline"
                                :disabled="item.quantity >= getMaxQuantity(item.id)"
                              >
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                          <div class="mt-2 text-end fw-bold">
                            Total: {{ getItemTotal(item) | currency }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="bulkDiscountApplied" class="p-3 bg-light">
                      <div class="d-flex justify-content-between">
                        <span class="text-success">
                          <i class="fas fa-tag me-1"></i> Bulk discount applied
                        </span>
                        <span class="text-danger">-{{ discountAmount | currency }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white">
                  <div class="d-flex justify-content-between">
                    <router-link to="/products" class="btn btn-outline">
                      <i class="fas fa-arrow-left"></i> Continue Shopping
                    </router-link>
                    <button @click="clearCart" class="btn btn-danger">
                      <i class="fas fa-trash"></i> Clear Cart
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Shipping Options -->
              <div class="card mb-4">
                <div class="card-header bg-white">
                  <h5 class="mb-0">Shipping Options</h5>
                </div>
                <div class="card-body">
                  <div class="shipping-options">
                    <div v-for="(option, index) in shippingOptions" :key="index" class="form-check mb-3">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        :id="'shipping-' + index" 
                        :value="option.id" 
                        v-model="selectedShipping"
                        @change="recalculateCart"
                      >
                      <label class="form-check-label d-flex justify-content-between" :for="'shipping-' + index">
                        <div>
                          <strong>{{ option.name }}</strong>
                          <p class="text-muted mb-0 small">{{ option.description }}</p>
                        </div>
                        <span>
                          <span v-if="option.price === 0 && cartTotals.subtotal >= 50" class="text-success">FREE</span>
                          <span v-else>{{ option.price | currency }}</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="card mb-4">
                <div class="card-header bg-white">
                  <h5 class="mb-0">Order Summary</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal ({{ cartTotals.itemCount }} {{ cartTotals.itemCount === 1 ? 'item' : 'items' }}):</span>
                    <span>{{ cartTotals.subtotal | currency }}</span>
                  </div>
                  
                  <div v-if="bulkDiscountApplied" class="d-flex justify-content-between mb-2 text-success">
                    <span>Bulk Discount:</span>
                    <span>-{{ discountAmount | currency }}</span>
                  </div>
                  
                  <div class="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span v-if="cartTotals.shipping > 0">{{ cartTotals.shipping | currency }}</span>
                    <span v-else class="text-success">FREE</span>
                  </div>
                  
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tax ({{ taxRate * 100 }}%):</span>
                    <span>{{ cartTotals.tax | currency }}</span>
                  </div>
                  
                  <div v-if="promoCodeApplied" class="d-flex justify-content-between mb-2 text-success">
                    <span>Promo Code ({{ activePromoCode.code }}):</span>
                    <span>-{{ promoDiscount | currency }}</span>
                  </div>
                  
                  <hr>
                  <div class="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong class="text-primary h4">{{ cartTotals.total | currency }}</strong>
                  </div>
                  
                  <!-- Savings Summary -->
                  <div v-if="totalSavings > 0" class="alert alert-success small mb-3">
                    <div class="fw-bold">Your Savings: {{ totalSavings | currency }}</div>
                    <ul class="mb-0 ps-3">
                      <li v-if="bulkDiscountApplied">Bulk discount: {{ discountAmount | currency }}</li>
                      <li v-if="cartTotals.shipping === 0 && getSelectedShipping().standardPrice > 0">Free shipping: {{ getSelectedShipping().standardPrice | currency }}</li>
                      <li v-if="promoCodeApplied">Promo code: {{ promoDiscount | currency }}</li>
                    </ul>
                  </div>
                  
                  <!-- Promo Code -->
                  <div class="mb-3">
                    <label for="promo-code" class="form-label">Promo Code</label>
                    <div class="input-group">
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
                      {{ promoError }}
                    </div>
                    <div v-if="promoCodeApplied" class="text-success small mt-1">
                      {{ activePromoCode.description }}
                    </div>
                  </div>
                  
                  <!-- Checkout Button -->
                  <button @click="checkout" class="btn btn-primary btn-lg w-100">
                    <i class="fas fa-lock"></i> Secure Checkout
                  </button>
                  
                  <!-- Payment Icons -->
                  <div class="text-center mt-3">
                    <i class="fab fa-cc-visa fa-2x mx-1"></i>
                    <i class="fab fa-cc-mastercard fa-2x mx-1"></i>
                    <i class="fab fa-cc-amex fa-2x mx-1"></i>
                    <i class="fab fa-cc-paypal fa-2x mx-1"></i>
                  </div>
                </div>
              </div>
              
              <!-- Shopping Policies Information -->
              <div class="accordion" id="shoppingPolicies">
                <div class="accordion-item">
                  <h2 class="accordion-header" id="headingShipping">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseShipping" aria-expanded="false" aria-controls="collapseShipping">
                      <i class="fas fa-truck me-2"></i> Shipping Policy
                    </button>
                  </h2>
                  <div id="collapseShipping" class="accordion-collapse collapse" aria-labelledby="headingShipping" data-bs-parent="#shoppingPolicies">
                    <div class="accordion-body">
                      <p class="small mb-1">Free standard shipping on orders over RM50.</p>
                      <p class="small mb-1">Standard delivery: 3-5 business days.</p>
                      <p class="small mb-0">Express delivery: 1-2 business days (additional charges apply).</p>
                    </div>
                  </div>
                </div>
                <div class="accordion-item">
                  <h2 class="accordion-header" id="headingReturns">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReturns" aria-expanded="false" aria-controls="collapseReturns">
                      <i class="fas fa-undo me-2"></i> Returns & Refunds
                    </button>
                  </h2>
                  <div id="collapseReturns" class="accordion-collapse collapse" aria-labelledby="headingReturns" data-bs-parent="#shoppingPolicies">
                    <div class="accordion-body">
                      <p class="small mb-0">Easy returns within 30 days of purchase. See our <a href="#">return policy</a> for details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Product Recommendations -->
          <div class="recommendations mt-4">
            <h3 class="mb-3">You Might Also Like</h3>
            <div class="row">
              <div v-for="product in recommendedProducts" :key="product.id" class="col-6 col-md-3 mb-4">
                <product-card :product="product"></product-card>
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
      promoCode: '',
      promoError: null,
      promoCodeApplied: false,
      activePromoCode: null,
      selectedShipping: 'standard',
      taxRate: 0.07, // 7% tax rate
      shippingOptions: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Delivery in 3-5 business days',
          price: 5.99,
          standardPrice: 5.99 // The regular price before any discounts
        },
        {
          id: 'express',
          name: 'Express Shipping',
          description: 'Delivery in 1-2 business days',
          price: 12.99,
          standardPrice: 12.99
        },
        {
          id: 'pickup',
          name: 'Store Pickup',
          description: 'Pick up at our local store',
          price: 0,
          standardPrice: 0
        }
      ],
      promoCodes: [
        {
          code: 'WELCOME10',
          description: '10% off your entire order',
          type: 'percentage',
          value: 10,
          minOrder: 0
        },
        {
          code: 'SAVE20',
          description: 'RM20 off orders over RM100',
          type: 'fixed',
          value: 20,
          minOrder: 100
        },
        {
          code: 'FREESHIP',
          description: 'Free shipping on your order',
          type: 'shipping',
          value: 100, // 100% off shipping
          minOrder: 0
        }
      ],
      bulkDiscountRate: 0.05, // 5% bulk discount
      bulkDiscountThreshold: 3, // Apply to items with quantity >= 3
      recommendedProducts: [],
      cartTotals: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      }
    };
  },
  computed: {
    // Calculate if bulk discount should be applied
    bulkDiscountApplied() {
      return this.cartItems.some(item => item.quantity >= this.bulkDiscountThreshold);
    },
    
    // Calculate bulk discount amount
    discountAmount() {
      if (!this.bulkDiscountApplied) return 0;
      
      // Apply discount only to items with quantity >= threshold
      return this.cartItems.reduce((total, item) => {
        if (item.quantity >= this.bulkDiscountThreshold) {
          return total + (item.price * item.quantity * this.bulkDiscountRate);
        }
        return total;
      }, 0);
    },
    
    // Calculate promo code discount
    promoDiscount() {
      if (!this.promoCodeApplied || !this.activePromoCode) return 0;
      
      const subtotalAfterBulkDiscount = this.cartTotals.subtotal - this.discountAmount;
      
      switch (this.activePromoCode.type) {
        case 'percentage':
          return subtotalAfterBulkDiscount * (this.activePromoCode.value / 100);
        case 'fixed':
          return this.activePromoCode.value;
        case 'shipping':
          return this.getSelectedShipping().price; // Free shipping
        default:
          return 0;
      }
    },
    
    // Calculate total savings from all discounts
    totalSavings() {
      let savings = 0;
      
      // Bulk discount savings
      if (this.bulkDiscountApplied) {
        savings += this.discountAmount;
      }
      
      // Shipping discount savings
      if (this.cartTotals.shipping === 0 && this.getSelectedShipping().standardPrice > 0) {
        savings += this.getSelectedShipping().standardPrice;
      }
      
      // Promo code savings
      if (this.promoCodeApplied) {
        savings += this.promoDiscount;
      }
      
      return savings;
    }
  },
  created() {
    this.loadCart();
    this.loadRecommendedProducts();
    
    // Listen for cart updates from other components
    window.addEventListener('cart-updated', this.loadCart);
  },
  beforeDestroy() {
    // Clean up event listener
    window.removeEventListener('cart-updated', this.loadCart);
  },
  methods: {
    loadCart() {
      // Get cart items with detailed information
      this.cartItems = CartService.getCartWithDetails();
      
      // Calculate totals
      this.recalculateCart();
    },
    
    // Load recommended products based on cart items
    loadRecommendedProducts() {
      // Get product categories in the cart
      const cartCategories = this.cartItems.map(item => item.category);
      
      // Get recommended products from similar categories, excluding those already in cart
      this.recommendedProducts = ProductService.getRecommendedProducts(cartCategories, 4);
    },
    
    // Calculate cart totals manually to demonstrate data manipulation
    recalculateCart() {
      // Calculate subtotal (sum of all items)
      const subtotal = this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      
      // Calculate total items count
      const itemCount = this.cartItems.reduce((count, item) => {
        return count + item.quantity;
      }, 0);
      
      // Get selected shipping option
      const selectedShippingOption = this.getSelectedShipping();
      
      // Calculate shipping cost (free shipping over RM50, unless choosing express)
      let shipping = selectedShippingOption.price;
      
      // Apply free shipping for standard shipping on orders over RM50
      if (selectedShippingOption.id === 'standard' && subtotal >= 50) {
        shipping = 0;
      }
      
      // Apply promo code for free shipping if applicable
      if (this.promoCodeApplied && this.activePromoCode.type === 'shipping') {
        shipping = 0;
      }
      
      // Apply bulk discount if applicable
      const bulkDiscountAmount = this.bulkDiscountApplied ? this.discountAmount : 0;
      
      // Apply promo code discount if applicable
      const promoDiscountAmount = this.promoCodeApplied ? this.promoDiscount : 0;
      
      // Calculate subtotal after all discounts except tax
      const discountedSubtotal = subtotal - bulkDiscountAmount - promoDiscountAmount;
      
      // Calculate tax (assuming 7% tax rate)
      const tax = discountedSubtotal * this.taxRate;
      
      // Calculate grand total
      const total = discountedSubtotal + shipping + tax;
      
      // Update cart totals
      this.cartTotals = {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount
      };
    },
    
    // Calculate total for a single item
    getItemTotal(item) {
      return item.price * item.quantity;
    },
    
    // Get the currently selected shipping option
    getSelectedShipping() {
      return this.shippingOptions.find(option => option.id === this.selectedShipping) || this.shippingOptions[0];
    },
    
    // Get maximum available quantity for a product
    getMaxQuantity(productId) {
      const product = ProductService.getProduct(productId);
      return product ? product.stock : 10; // Default to 10 if product not found
    },
    
    // Update item quantity
    updateItemQuantity(productId, quantity) {
      // Ensure quantity is valid
      quantity = Math.max(1, quantity);
      
      // Get maximum available quantity
      const maxQuantity = this.getMaxQuantity(productId);
      quantity = Math.min(quantity, maxQuantity);
      
      // Update quantity in cart
      CartService.updateQuantity(productId, quantity);
      
      // Reload cart data
      this.loadCart();
    },
    
    // Remove item from cart
    removeFromCart(productId) {
      // Remove item from cart
      CartService.removeFromCart(productId);
      
      // Reload cart data
      this.loadCart();
      
      // Update recommended products
      this.loadRecommendedProducts();
    },
    
    // Clear entire cart
    clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
        // Clear cart
        CartService.clearCart();
        
        // Reload cart data
        this.loadCart();
      }
    },
    
    // Apply promo code
    applyPromoCode() {
      // Reset error
      this.promoError = null;
      
      // Trim promo code
      const code = this.promoCode.trim().toUpperCase();
      
      // Validate promo code exists
      if (!code) {
        this.promoError = 'Please enter a promo code';
        return;
      }
      
      // Find promo code in available codes
      const promoCode = this.promoCodes.find(promo => promo.code === code);
      
      // Check if promo code exists
      if (!promoCode) {
        this.promoError = 'Invalid promo code';
        return;
      }
      
      // Check minimum order requirement
      if (promoCode.minOrder > 0 && this.cartTotals.subtotal < promoCode.minOrder) {
        this.promoError = `This code requires a minimum order of ${this.$filters.currency(promoCode.minOrder)}`;
        return;
      }
      
      // Apply promo code
      this.promoCodeApplied = true;
      this.activePromoCode = promoCode;
      
      // Recalculate cart with promo code
      this.recalculateCart();
    },
    
    // Remove promo code
    removePromoCode() {
      this.promoCodeApplied = false;
      this.activePromoCode = null;
      this.promoCode = '';
      this.promoError = null;
      
      // Recalculate cart without promo code
      this.recalculateCart();
    },
    
    // Proceed to checkout
    checkout() {
      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        // Save redirect path
        localStorage.setItem('checkoutRedirect', true);
        
        // Redirect to login page
        this.$router.push('/login');
        return;
      }
      
      // Create order data
      const orderData = {
        items: this.cartItems,
        totals: this.cartTotals,
        shipping: this.getSelectedShipping(),
        promoCode: this.promoCodeApplied ? this.activePromoCode : null,
        bulkDiscount: this.bulkDiscountApplied ? {
          rate: this.bulkDiscountRate,
          amount: this.discountAmount
        } : null
      };
      
      // Process checkout
      const result = CartService.saveOrder(orderData);
      
      if (result.success) {
        alert('Order placed successfully!');
        this.$router.push('/purchases');
      } else {
        alert('Error: ' + result.message);
      }
    }
  }
};

// Make the component globally available
window.ShoppingCart = ShoppingCart;