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
    <router-link :to="'/product/' + product.id" class="text-decoration-none">
      <div class="card h-100 product-card-clickable">
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
          <div class="mt-auto text-center">
            <span class="btn btn-outline-primary w-100">View Details</span>
          </div>
        </div>
      </div>
    </router-link>
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
  }
});