/**
 * CartItem Component
 * Component for displaying food items in the order cart
 */
window.app.component('cart-item', {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showInstructions: false,
      specialInstructions: this.item.specialInstructions || ''
    };
  },
  template: `
    <div class="cart-item">
      <div class="row align-items-center">
        <div class="col-3 col-md-2">
          <div class="position-relative">
            <img :src="item.image" :alt="item.name" class="thumbnail-image rounded">
            <span v-if="item.quantity > 1" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
              {{ item.quantity }}
            </span>
          </div>
        </div>
        <div class="col-9 col-md-4">
          <h5>{{ item.name }}</h5>
          <p class="text-muted mb-0">{{ $filters.currency(item.price) }} each</p>
          <div v-if="item.dietaryOptions && item.dietaryOptions.length > 0" class="mt-1">
            <span v-for="option in item.dietaryOptions" :key="option" class="badge bg-success me-1 dietary-badge">
              {{ option }}
            </span>
          </div>
          <div class="text-muted small mt-1">
            <i class="far fa-clock me-1"></i>{{ item.preparationTime || 15 }} min
          </div>
          <div v-if="specialInstructions" class="mt-2">
            <div class="special-instruction-tag">
              <i class="fas fa-info-circle me-1 text-primary"></i>
              <small>{{ specialInstructions }}</small>
            </div>
          </div>
          <div class="mt-2">
            <button @click="showInstructions = !showInstructions" class="btn btn-sm btn-outline-secondary">
              <i class="fas" :class="showInstructions ? 'fa-times' : 'fa-pencil-alt'"></i>
              <span class="ms-1">{{ showInstructions ? 'Cancel' : 'Special Instructions' }}</span>
            </button>
          </div>
        </div>
        <div class="col-6 col-md-3 mt-3 mt-md-0">
          <div class="quantity-controls">
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
        <div class="col-4 col-md-2 mt-3 mt-md-0 text-end">
          <p class="price mb-0">{{ $filters.currency(totalPrice) }}</p>
          <small v-if="item.quantity > 1" class="text-muted d-block">
            {{ $filters.currency(item.price) }} each
          </small>
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
      <div v-if="showInstructions" class="mt-3 special-instructions-area">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-comment-alt"></i></span>
          <textarea 
            v-model="specialInstructions" 
            class="form-control" 
            placeholder="Any special requests? (e.g., no onions, extra spicy)"
            @change="updateInstructions"
          ></textarea>
          <button @click="updateInstructions" class="btn btn-outline">Save</button>
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
        quantity: this.item.quantity,
        specialInstructions: this.specialInstructions
      });
    },
    updateInstructions() {
      this.item.specialInstructions = this.specialInstructions;
      this.showInstructions = false;
      this.updateCart();
    }
  }
});