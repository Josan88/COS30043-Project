/**
 * CartItem Component
 * Component for displaying items in the shopping cart
 */
window.app.component('cart-item', {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="cart-item">
      <div class="row align-items-center">
        <div class="col-3 col-md-2">
          <img :src="item.image" :alt="item.name" class="img-fluid rounded">
        </div>
        <div class="col-9 col-md-4">
          <h5>{{ item.name }}</h5>
          <p class="text-muted mb-0">RM {{ item.price.toFixed(2) }} each</p>
        </div>
        <div class="col-6 col-md-3 mt-3 mt-md-0">
          <div class="d-flex align-items-center quantity-controls">
            <button 
              @click="decreaseQuantity" 
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
              @change="updateQuantity"
              :aria-label="'Quantity for ' + item.name"
            >
            <button 
              @click="increaseQuantity" 
              class="btn btn-sm btn-outline"
              aria-label="Increase quantity"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="col-4 col-md-2 mt-3 mt-md-0">
          <p class="price mb-0">RM{{ totalPrice }}</p>
        </div>
        <div class="col-2 col-md-1 mt-3 mt-md-0 text-end">
          <button 
            @click="removeItem" 
            class="btn btn-sm btn-danger"
            aria-label="Remove item from cart"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  computed: {
    totalPrice() {
      return (this.item.price * this.item.quantity).toFixed(2);
    }
  },
  methods: {
    increaseQuantity() {
      this.item.quantity++;
      this.updateCart();
    },
    decreaseQuantity() {
      if (this.item.quantity > 1) {
        this.item.quantity--;
        this.updateCart();
      }
    },
    updateQuantity() {
      // Ensure quantity is at least 1
      this.item.quantity = Math.max(1, this.item.quantity);
      this.updateCart();
    },
    removeItem() {
      this.$emit('remove-item', this.item.id);
    },
    updateCart() {
      this.$emit('update-cart', {
        id: this.item.id,
        quantity: this.item.quantity
      });
    }
  }
});