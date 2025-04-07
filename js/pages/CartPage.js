// Cart Page Component
const CartPage = {
  template: `
    <div class="cart-page" id="content">
      <div class="container">
        <h1>Your Shopping Cart</h1>
        
        <div v-if="!$root.store.cart.length" class="empty-cart">
          <p>Your cart is empty.</p>
          <router-link to="/products" class="btn btn-primary">Continue Shopping</router-link>
        </div>
        
        <div v-else>
          <div class="cart-table-wrapper">
            <table class="cart-table" aria-label="Shopping Cart Items">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col" class="sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in $root.store.cart" :key="item.id">
                  <td class="product-info">
                    <img :src="item.image" :alt="item.name" class="product-thumbnail">
                    <div class="product-details">
                      <h3>{{ item.name }}</h3>
                    </div>
                  </td>
                  <td class="product-price">{{ formatPrice(item.price) }}</td>
                  <td class="product-quantity">
                    <div class="quantity-control" role="group" :aria-label="'Quantity controls for ' + item.name">
                      <button 
                        @click="decrementQuantity(item)"
                        class="quantity-btn"
                        aria-label="Decrease quantity"
                      >-</button>
                      <input 
                        type="number" 
                        min="1" 
                        :max="10"
                        v-model.number="item.quantity"
                        @change="updateQuantity(item)"
                        :aria-label="'Quantity for ' + item.name"
                      >
                      <button 
                        @click="incrementQuantity(item)"
                        class="quantity-btn"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </td>
                  <td class="product-subtotal">{{ formatPrice(item.price * item.quantity) }}</td>
                  <td class="product-remove">
                    <button 
                      @click="removeFromCart(item.id)"
                      class="remove-btn"
                      aria-label="Remove item from cart"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="row">
            <div class="col-12 col-md-6">
              <div class="cart-promo">
                <h3>Promo Code</h3>
                <div class="form-group">
                  <label for="promo-code" class="sr-only">Enter promo code</label>
                  <div class="promo-input">
                    <input type="text" id="promo-code" v-model="promoCode" class="form-control" placeholder="Enter promo code">
                    <button @click="applyPromoCode" class="btn btn-secondary">Apply</button>
                  </div>
                </div>
                <p v-if="promoMessage" class="promo-message" :class="{'promo-success': promoValid, 'promo-error': !promoValid}">
                  {{ promoMessage }}
                </p>
              </div>
            </div>
            
            <div class="col-12 col-md-6">
              <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-item">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(cartSubtotal) }}</span>
                </div>
                <div v-if="discountAmount > 0" class="summary-item discount">
                  <span>Discount</span>
                  <span>-{{ formatPrice(discountAmount) }}</span>
                </div>
                <div class="summary-item">
                  <span>Shipping</span>
                  <span>{{ formatPrice(shippingCost) }}</span>
                </div>
                <div class="summary-total">
                  <span>Total</span>
                  <span>{{ formatPrice(cartTotal) }}</span>
                </div>
                <div class="checkout-actions">
                  <button 
                    v-if="$root.store.isAuthenticated"
                    @click="checkout" 
                    class="btn btn-primary checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                  <div v-else class="login-prompt">
                    <p>Please login to complete your purchase</p>
                    <router-link to="/login" class="btn btn-primary">Login</router-link>
                    <router-link to="/register" class="btn btn-secondary">Register</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="cart-actions">
            <router-link to="/products" class="btn btn-secondary">Continue Shopping</router-link>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      promoCode: '',
      promoMessage: '',
      promoValid: false,
      discount: 0,
      shippingCost: 5.99,
      // Valid promo codes for demo
      validPromoCodes: {
        'SAVE10': 0.1,
        'SAVE20': 0.2
      }
    };
  },
  
  computed: {
    cartSubtotal() {
      return this.$root.store.cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    
    discountAmount() {
      return this.cartSubtotal * this.discount;
    },
    
    cartTotal() {
      return this.cartSubtotal - this.discountAmount + this.shippingCost;
    }
  },
  
  methods: {
    formatPrice(price) {
      return '$' + price.toFixed(2);
    },
    
    incrementQuantity(item) {
      if (item.quantity < 10) { // Limit to 10 items maximum
        item.quantity++;
        this.updateQuantity(item);
      }
    },
    
    decrementQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateQuantity(item);
      }
    },
    
    updateQuantity(item) {
      // Ensure quantity is at least 1
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      this.$root.updateQuantity(item.id, item.quantity);
    },
    
    removeFromCart(itemId) {
      this.$root.removeFromCart(itemId);
    },
    
    applyPromoCode() {
      this.promoValid = false;
      
      if (!this.promoCode) {
        this.promoMessage = 'Please enter a promo code';
        return;
      }
      
      const code = this.promoCode.trim().toUpperCase();
      const discountRate = this.validPromoCodes[code];
      
      if (discountRate) {
        this.discount = discountRate;
        this.promoValid = true;
        this.promoMessage = `Promo code applied! ${discountRate * 100}% discount`;
      } else {
        this.discount = 0;
        this.promoMessage = 'Invalid promo code';
      }
    },
    
    checkout() {
      if (this.$root.completePurchase()) {
        this.$router.push('/purchases');
      }
    }
  }
};