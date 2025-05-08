/**
 * CustomizationModal Component
 * Modal for customizing food item ingredients (add/remove ingredients)
 */
window.app.component('customization-modal', {
  props: {
    product: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  template: `
    <div class="customization-modal" v-if="show">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Customize Your Order</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="product-info-header d-flex align-items-center mb-3">
            <img :src="product.image" :alt="product.name" class="product-thumbnail me-3">
            <div>
              <h6 class="mb-1">{{ product.name }}</h6>
              <p class="mb-0 text-muted small">{{ product.description }}</p>
            </div>
          </div>

          <!-- Base Ingredients Section -->
          <div class="ingredients-section mb-4">
            <h6 class="section-title">Base Ingredients</h6>
            <p class="text-muted small mb-2">Uncheck any ingredients you'd like to remove</p>
            
            <div v-if="product.ingredients && product.ingredients.length > 0" class="base-ingredients">
              <div v-for="(ingredient, index) in baseIngredients" :key="'base-' + index" class="ingredient-item">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="'ingredient-' + ingredient.id" 
                    v-model="ingredient.included"
                    :disabled="ingredient.required"
                  >
                  <label class="form-check-label d-flex justify-content-between align-items-center w-100" :for="'ingredient-' + ingredient.id">
                    <span>{{ ingredient.name }}</span>
                    <span v-if="ingredient.required" class="badge bg-secondary">Required</span>
                  </label>
                </div>
              </div>
            </div>
            <div v-else class="alert alert-info">
              No customizable base ingredients available for this item.
            </div>
          </div>

          <!-- Extra Ingredients Section -->
          <div class="extra-ingredients-section mb-4">
            <h6 class="section-title">Extra Ingredients</h6>
            <p class="text-muted small mb-2">Select additional ingredients (may affect price)</p>
            
            <div v-if="availableExtras && availableExtras.length > 0" class="extra-ingredients">
              <div v-for="(extra, index) in availableExtras" :key="'extra-' + index" class="ingredient-item">
                <div class="form-check d-flex justify-content-between align-items-center">
                  <div>
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="'extra-' + extra.id" 
                      v-model="extra.selected"
                    >
                    <label class="form-check-label" :for="'extra-' + extra.id">
                      {{ extra.name }}
                    </label>
                  </div>
                  <div class="extra-price" v-if="extra.price > 0">
                    +RM{{ extra.price.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="alert alert-info">
              No additional ingredients available for this item.
            </div>
          </div>

          <!-- Special Instructions -->
          <div class="special-instructions mb-4">
            <h6 class="section-title">Special Instructions</h6>
            <textarea 
              class="form-control" 
              v-model="specialInstructions" 
              rows="2" 
              placeholder="Any other special requests? (e.g., extra spicy, no salt)"
            ></textarea>
          </div>

          <!-- Price Summary -->
          <div class="price-summary mb-3 p-3 bg-light rounded">
            <div class="d-flex justify-content-between">
              <span>Base Price:</span>
              <span>RM{{ basePrice.toFixed(2) }}</span>
            </div>
            <div v-if="extraPrice > 0" class="d-flex justify-content-between">
              <span>Extra Ingredients:</span>
              <span>+RM{{ extraPrice.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-content-between fw-bold mt-2">
              <span>Total Price:</span>
              <span>RM{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveCustomization">
            <i class="fas fa-check"></i> Apply Changes
          </button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      baseIngredients: [],
      availableExtras: [],
      specialInstructions: '',
      basePrice: 0
    };
  },
  computed: {
    extraPrice() {
      if (!this.availableExtras) return 0;
      return this.availableExtras.reduce((total, extra) => {
        return extra.selected ? total + extra.price : total;
      }, 0);
    },
    totalPrice() {
      return this.basePrice + this.extraPrice;
    },
    customization() {
      return {
        removedIngredients: this.baseIngredients
          .filter(item => !item.included)
          .map(item => item.name),
        addedIngredients: this.availableExtras
          .filter(item => item.selected)
          .map(item => ({
            name: item.name,
            price: item.price
          })),
        specialInstructions: this.specialInstructions,
        extraPrice: this.extraPrice
      };
    }
  },
  watch: {
    product: {
      immediate: true,
      handler(newProduct) {
        if (newProduct) {
          this.initializeIngredients();
          this.initializeExtras();
          this.specialInstructions = newProduct.specialInstructions || '';
          this.basePrice = newProduct.price || 0;
        }
      }
    },
    show(newVal) {
      if (newVal) {
        // Reset form when modal is opened
        this.initializeIngredients();
        this.initializeExtras();
        this.specialInstructions = this.product.specialInstructions || '';
      }
    }
  },
  methods: {
    initializeIngredients() {
      if (!this.product) return;
      
      // Initialize base ingredients from product
      if (this.product.ingredients && Array.isArray(this.product.ingredients)) {
        this.baseIngredients = this.product.ingredients.map((ing, index) => {
          // If the ingredient is already an object with inclusion state, use it
          if (typeof ing === 'object') {
            return {
              id: ing.id || index,
              name: ing.name,
              included: ing.included !== false, // Default to true if not specified
              required: ing.required || false
            };
          } 
          // If it's just a string, create a new object
          else {
            return {
              id: index,
              name: ing,
              included: true, // Default to included
              required: false // Default to not required
            };
          }
        });
      } else {
        this.baseIngredients = [];
      }

      // If product already has customization, restore removed ingredients
      if (this.product.customization && this.product.customization.removedIngredients) {
        const removedNames = this.product.customization.removedIngredients;
        this.baseIngredients.forEach(ing => {
          if (removedNames.includes(ing.name)) {
            ing.included = false;
          }
        });
      }
    },
    
    initializeExtras() {
      if (!this.product) return;
      
      // Initialize extra ingredients that can be added
      if (this.product.availableExtras && Array.isArray(this.product.availableExtras)) {
        this.availableExtras = this.product.availableExtras.map((extra, index) => {
          return {
            id: extra.id || index,
            name: extra.name,
            price: extra.price || 0,
            selected: false
          };
        });
      } else {
        this.availableExtras = [];
      }

      // If product already has customization, restore added ingredients
      if (this.product.customization && this.product.customization.addedIngredients) {
        const addedNames = this.product.customization.addedIngredients.map(item => item.name);
        this.availableExtras.forEach(extra => {
          if (addedNames.includes(extra.name)) {
            extra.selected = true;
          }
        });
      }
    },
    
    saveCustomization() {
      // Emit event with customization details
      this.$emit('save', this.customization);
      this.$emit('close');
    }
  }
});

// Add these styles to the document to ensure proper modal display
const style = document.createElement('style');
style.textContent = `
  .customization-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .customization-modal .modal-content {
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    animation: modal-slide-in 0.3s ease;
  }

  .customization-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--medium-gray);
    padding: 1rem 1.5rem;
  }

  .customization-modal .modal-body {
    padding: 1.5rem;
  }

  .customization-modal .modal-footer {
    border-top: 1px solid var(--medium-gray);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: var(--border-radius);
  }

  .section-title {
    position: relative;
    font-weight: 600;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--light-gray);
  }

  .ingredient-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--light-gray);
  }

  .ingredient-item:last-child {
    border-bottom: none;
  }

  @keyframes modal-slide-in {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);