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

    /**
     * Navigate to category products page
     */
    navigateToCategory(category) {
      this.$router.push({
        path: "/product",
        query: { category: category.id },
      });
    },
  },
  template: `
    <div class="categories-section">
      <div class="category-grid">
        <div 
          v-for="(category, index) in categories" 
          :key="category.id" 
          class="category-card"
          v-scroll-reveal="{ delay: index * 100, threshold: 0.3 }"
          @click="navigateToCategory(category)"
        >
          <div class="category-icon">
            <i :class="category.icon"></i>
          </div>
          <h3 class="category-name">{{ category.name }}</h3>
          <span class="category-count" v-if="category.count">
            {{ pluralize(category.count, 'item') }}
          </span>
        </div>
      </div>
    </div>
  `,
};

// Register component globally
window.CategoriesSection = CategoriesSection;
