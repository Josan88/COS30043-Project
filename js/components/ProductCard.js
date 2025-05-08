/**
 * ProductCard Component
 * Reusable component for displaying food item information in a card format
 */
window.app.component('product-card', {
  props: {
    product: {
      type: Object,
      required: true
    },
    showAddButton: {
      type: Boolean,
      default: true
    }
  },
  template: `
    <div class="card h-100 product-card shadow-sm border-0 position-relative hover-rise">
      <div class="position-relative">
        <router-link :to="'/product/' + product.id">
          <img :src="product.image" :alt="product.name" class="card-img-top food-image">
          <div v-if="product.discount" class="ribbon">
            <span class="bg-danger text-white">{{ product.discount }}% OFF</span>
          </div>
        </router-link>
        
        <div class="position-absolute top-0 end-0 m-2">
          <button class="btn btn-sm btn-light rounded-circle shadow-sm favorite-btn" 
                 @click.stop.prevent="toggleFavorite" 
                 :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'">
            <i class="fas fa-heart" :class="{'text-danger': isFavorite, 'text-muted': !isFavorite}"></i>
          </button>
        </div>
        
        <div v-if="product.dietaryOptions && product.dietaryOptions.length > 0" class="position-absolute bottom-0 start-0 m-2">
          <span v-for="option in product.dietaryOptions" :key="option" class="badge dietary-badge me-1 mb-1">
            <i v-if="option === 'Vegetarian'" class="fas fa-leaf me-1"></i>
            <i v-else-if="option === 'Vegan'" class="fas fa-seedling me-1"></i>
            <i v-else-if="option === 'Gluten-free'" class="fas fa-bread-slice me-1"></i>
            <i v-else-if="option === 'Halal'" class="fas fa-moon me-1"></i>
            {{ option }}
          </span>
        </div>
      </div>
      
      <div class="card-body d-flex flex-column p-3">
        <div class="d-flex justify-content-between align-items-start">
          <router-link :to="'/product/' + product.id" class="text-decoration-none">
            <h5 class="card-title mb-1 text-dark">{{ product.name }}</h5>
          </router-link>
          <div class="ms-2">
            <span class="badge bg-light text-dark">
              <i class="far fa-clock me-1"></i>{{ product.preparationTime }} min
            </span>
          </div>
        </div>
        
        <div class="mb-2">
          <div class="ratings">
            <i v-for="i in 5" :key="i" class="fas" 
               :class="{ 
                 'fa-star text-warning': i <= Math.floor(product.rating), 
                 'fa-star-half-alt text-warning': i === Math.ceil(product.rating) && product.rating % 1 !== 0,
                 'fa-star text-muted': i > Math.ceil(product.rating)
               }"></i>
            <span class="ms-1 small text-muted">({{ product.reviewCount }})</span>
          </div>
        </div>
        
        <div class="mb-2 d-flex flex-wrap">
          <span v-if="product.discount" class="text-decoration-line-through text-muted me-2">RM{{ product.price.toFixed(2) }}</span>
          <span :class="{'text-danger fw-bold': product.discount, 'fw-bold': !product.discount}">
            RM{{ discountedPrice }}
          </span>
        </div>
        
        <p class="card-text flex-grow-1 mb-3 small text-muted">{{ truncatedDescription }}</p>
        
        <div class="mt-auto d-flex align-items-center justify-content-between">
          <div>
            <span class="small text-muted">
              <i class="fas fa-fire-alt me-1"></i>{{ product.calories }} cal
            </span>
          </div>
          
          <div class="btn-group">
            <router-link :to="'/product/' + product.id" class="btn btn-sm btn-outline-secondary">
              Details
            </router-link>
            <button v-if="showAddButton" 
                   @click.stop.prevent="addToCart" 
                   class="btn btn-sm btn-primary">
              <i class="fas fa-cart-plus me-1"></i>Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isFavorite: false
    };
  },
  computed: {
    discountedPrice() {
      if (!this.product.discount) return this.product.price.toFixed(2);
      const discountAmount = this.product.price * (this.product.discount / 100);
      return (this.product.price - discountAmount).toFixed(2);
    },
    truncatedDescription() {
      return this.product.description.length > 70 
        ? this.product.description.substring(0, 70) + '...' 
        : this.product.description;
    }
  },
  methods: {
    addToCart(event) {
      // Stop event propagation to prevent navigation when clicking add to cart
      event.stopPropagation();
      
      // Add product to cart using the CartService
      window.CartService.addItem({
        id: this.product.id,
        name: this.product.name,
        price: this.discountedPrice,
        image: this.product.image,
        quantity: 1
      }).then(() => {
        // Show toast notification or feedback
        this.$root.$emit('show-toast', {
          message: `${this.product.name} added to cart!`,
          type: 'success'
        });
      }).catch(error => {
        console.error('Error adding to cart:', error);
        this.$root.$emit('show-toast', {
          message: 'Could not add to cart. Please try again.',
          type: 'error'
        });
      });
    },
    
    toggleFavorite(event) {
      event.stopPropagation();
      this.isFavorite = !this.isFavorite;
      
      // In a real app, you'd persist this to the user's favorites list
      const action = this.isFavorite ? 'added to' : 'removed from';
      this.$root.$emit('show-toast', {
        message: `${this.product.name} ${action} favorites!`,
        type: 'info'
      });
    }
  }
});