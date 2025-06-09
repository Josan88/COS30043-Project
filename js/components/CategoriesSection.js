// =====================================================
// CategoriesSection Component
// =====================================================

const CategoriesSection = {
  props: {
    categories: { type: Array, default: () => [] },
  },

  methods: {
    pluralize(count, singular, plural) {
      if (window.Filters?.pluralize) {
        return window.Filters.pluralize(count, singular, plural);
      }
      const word = count === 1 ? singular : plural || singular + "s";
      return `${count} ${word}`;
    },
  },

  template: `
    <div class="container my-5">
      <div class="row mb-4">
        <div class="col-12">
          <h6 class="text-primary fw-bold text-uppercase">
            <i class="fas fa-th-large me-2"></i> Browse By Category
          </h6>
          <h2 class="display-6 fw-bold mb-0">Explore Our Menu</h2>
          <p class="text-muted mt-2">Find your perfect meal from our diverse range of options</p>
        </div>
      </div>
      
      <div class="row g-4">
        <div 
          v-for="(category, index) in categories" 
          :key="category.id" 
          class="col-6 col-sm-4 col-lg-2"
          v-scroll-reveal="{ delay: index * 100, threshold: 0.3 }"
        >
          <router-link 
            :to="'/product?category=' + category.id" 
            class="text-decoration-none"
          >
            <div class="category-card rounded-circle text-center shadow-hover position-relative overflow-hidden">
              <div class="category-image-container">
                <i :class="[category.icon, 'category-icon fa-2x text-white']"></i>
              </div>
              <div class="category-info p-2">
                <h5 class="mb-0 category-title">{{ category.name }}</h5>
                <span class="badge rounded-pill bg-light text-dark">
                  {{ pluralize(category.count, 'item') }}
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  `,
};

// Register component globally
window.CategoriesSection = CategoriesSection;
