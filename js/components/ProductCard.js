/**
 * ProductCard Component
 * Reusable component for displaying product information in a card format
 */
window.app.component('product-card', {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="card h-100">
      <div class="position-relative">
        <img :src="product.image" :alt="product.name" class="card-img-top">
        <span v-if="product.discount" class="badge bg-danger position-absolute top-0 end-0 m-2">
          {{ product.discount }}% OFF
        </span>
      </div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ product.name }}</h5>
        <div class="mb-2">
          <template v-if="product.discount">
              <span class="text-decoration-line-through text-muted me-2">RM{{ product.price.toFixed(2) }}</span>
              <span class="price">RM{{ discountedPrice }}</span>
          </template>
          <template v-else>
            <span class="price">RM{{ product.price.toFixed(2) }}</span>
          </template>
        </div>
        <div class="mb-2">
          <div class="ratings">
            <i v-for="i in 5" :key="i" class="fas fa-star" :class="{ 'text-warning': i <= product.rating, 'text-muted': i > product.rating }"></i>
            <span class="ms-1 text-muted">({{ product.reviewCount }})</span>
          </div>
        </div>
        <p class="card-text flex-grow-1">{{ truncatedDescription }}</p>
        <div class="d-flex justify-content-between mt-auto">
          <router-link :to="'/product/' + product.id" class="btn btn-outline" aria-label="View details of this product">
            Details
          </router-link>
          <button 
            @click="addToCart" 
            class="btn btn-primary"
            aria-label="Add to cart"
          >
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `,
  computed: {
    discountedPrice() {
      if (!this.product.discount) return this.product.price.toFixed(2);
      const discountAmount = this.product.price * (this.product.discount / 100);
      return (this.product.price - discountAmount).toFixed(2);
    },
    truncatedDescription() {
      return this.product.description.length > 90 
        ? this.product.description.substring(0, 90) + '...' 
        : this.product.description;
    }
  },
  methods: {
    addToCart() {
      // Get current cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product is already in cart
      const existingProduct = cart.find(item => item.id === this.product.id);
      
      if (existingProduct) {
        // Increment quantity if product already exists
        existingProduct.quantity += 1;
      } else {
        // Add new product to cart
        cart.push({
          id: this.product.id,
          name: this.product.name,
          price: this.product.discount 
            ? this.product.price * (1 - this.product.discount / 100) 
            : this.product.price,
          image: this.product.image,
          quantity: 1
        });
      }
      
      // Save updated cart back to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Dispatch event to notify components of cart update
      window.dispatchEvent(new Event('cart-updated'));
      
      // Show feedback to user
      alert(`${this.product.name} added to cart!`);
    }
  }
});