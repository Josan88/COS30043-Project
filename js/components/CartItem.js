/**
 * CartItem Component
 * Component for displaying food items in the order cart
 * Enhanced with better prop validation and error handling
 */
window.app.component("cart-item", {
  props: {
    item: {
      type: Object,
      required: true,
      validator(item) {
        // Validate that item has required properties
        const requiredProps = ["id", "name", "price", "quantity"];
        return (
          requiredProps.every((prop) => prop in item) &&
          typeof item.price === "number" &&
          typeof item.quantity === "number" &&
          item.quantity > 0
        );
      },
    },
    index: {
      type: Number,
      default: 0,
      validator(index) {
        return index >= 0;
      },
    },
  },
  data() {
    return {
      // UI State
      showInstructions: false,
      showOptions: false,
      showCustomizations: false,
      isEditing: false,
      isRemoving: false,

      // Data
      specialInstructions: this.getInitialInstructions(),
      originalQuantity: this.item.quantity,

      // Constants
      MAX_INSTRUCTIONS_LENGTH: 200,
      MIN_QUANTITY: 1,

      // Dietary option mappings
      DIETARY_BADGE_CLASSES: {
        Vegetarian: "bg-success",
        Vegan: "bg-success",
        "Gluten-free": "bg-info",
        Halal: "bg-secondary",
        Keto: "bg-primary",
        Spicy: "bg-danger",
      },

      DIETARY_ICONS: {
        Vegetarian: "fas fa-leaf",
        Vegan: "fas fa-seedling",
        "Gluten-free": "fas fa-bread-slice",
        Halal: "fas fa-moon",
        Keto: "fas fa-bacon",
        Spicy: "fas fa-pepper-hot",
      },
    };
  },
  template: `
    <div class="cart-item" :class="{ 'fade-out': isRemoving }">
      <div class="row align-items-center g-3">
        <!-- Item Image -->
        <div class="col-3 col-md-2">
          <div class="position-relative">
            <img :src="item.image" :alt="item.name" class="thumbnail-image rounded shadow-sm">
            <span v-if="item.quantity > 1" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
              {{ item.quantity }}
            </span>
          </div>
        </div>
        
        <!-- Item Details -->
        <div class="col-9 col-md-4">
          <div class="d-flex flex-column">
            <div class="d-flex align-items-center">
              <h5 class="mb-1">{{ item.name }}</h5>
              <span v-if="hasCustomization" class="ms-2 badge bg-info">Customized</span>
            </div>
            
            <div v-if="item.dietaryOptions && item.dietaryOptions.length > 0" class="mb-1">
              <span v-for="option in item.dietaryOptions" :key="option" class="badge me-1 mb-1" 
                    :class="getDietaryBadgeClass(option)">
                <i :class="getDietaryIcon(option)" class="me-1"></i>
                {{ option }}
              </span>
            </div>
            
            <div class="d-flex flex-wrap align-items-center mt-1">
              <div class="me-3 small">
                <i class="far fa-clock text-muted me-1"></i>
                <span class="text-muted">{{ item.preparationTime || 15 }} min</span>
              </div>
              
              <div v-if="item.calories" class="me-3 small">
                <i class="fas fa-fire-alt text-muted me-1"></i>
                <span class="text-muted">{{ item.calories }} cal</span>
              </div>
            </div>
            
            <!-- Customizations Summary -->
            <div v-if="hasCustomization" class="mt-2">
              <button 
                @click="showCustomizations = !showCustomizations" 
                class="btn btn-sm btn-link text-decoration-none p-0 text-start"
              >
                <i class="fas" :class="showCustomizations ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                <span class="ms-1">{{ showCustomizations ? 'Hide' : 'Show' }} customizations</span>
              </button>
              
              <div v-show="showCustomizations" class="customizations-details mt-2 p-2 bg-light rounded">
                <!-- Removed Ingredients -->
                <div v-if="hasRemovedIngredients" class="customization-section mb-2">
                  <div class="small text-danger">
                    <i class="fas fa-minus-circle me-1"></i><strong>Removed:</strong>
                    <span class="ingredient-tag">{{ item.customization.removedIngredients.join(', ') }}</span>
                  </div>
                </div>
                
                <!-- Added Ingredients -->
                <div v-if="hasAddedIngredients" class="customization-section mb-2">
                  <div class="small text-success">
                    <i class="fas fa-plus-circle me-1"></i><strong>Added:</strong>
                    <span class="ingredient-tag" v-for="(ing, i) in item.customization.addedIngredients" :key="i">
                      {{ ing.name }}{{ i < item.customization.addedIngredients.length - 1 ? ', ' : '' }}
                    </span>
                    <span v-if="hasExtraCharge" class="extra-price-info">
                      (+RM{{ item.customization.extraPrice.toFixed(2) }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="specialInstructions" class="mt-2 special-instruction-tag p-2">
              <i class="fas fa-info-circle me-1 text-primary"></i>
              <small>{{ specialInstructions }}</small>
            </div>
            
            <div class="mt-2 d-flex">
              <button @click="toggleInstructions" class="btn btn-sm btn-outline-secondary me-2">
                <i class="fas" :class="showInstructions ? 'fa-times' : 'fa-utensils'"></i>
                <span class="ms-1 d-none d-sm-inline">{{ showInstructions ? 'Cancel' : 'Special Instructions' }}</span>
              </button>
              
              <div class="dropdown d-inline-block">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                        @click.stop="showOptions = !showOptions"
                        :aria-expanded="showOptions">
                  Options
                </button>
                <ul class="dropdown-menu" :class="{'show': showOptions}">
                  <li><a class="dropdown-item" href="#" @click.prevent="removeItem">
                    <i class="fas fa-trash me-2 text-danger"></i> Remove
                  </a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="saveForLater">
                    <i class="fas fa-bookmark me-2 text-primary"></i> Save for later
                  </a></li>
                  <li v-if="isCustomizable"><a class="dropdown-item" href="#" @click.prevent="customizeItem">
                    <i class="fas fa-sliders-h me-2"></i> Customize
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quantity Controls -->
        <div class="col-6 col-md-3 mt-3 mt-md-0">
          <div class="quantity-controls d-flex align-items-center">
            <button 
              @click="decreaseQuantity" 
              class="btn btn-sm btn-outline-secondary rounded-circle" 
              :disabled="item.quantity <= 1 || isEditing"
              aria-label="Decrease quantity"
            >
              <i class="fas fa-minus"></i>
            </button>
            <input 
              type="number" 
              class="form-control form-control-sm text-center mx-2" 
              v-model.number="item.quantity" 
              min="1" 
              :disabled="isEditing"
              @change="updateQuantity"
              @focus="startEditing"
              @blur="finishEditing"
              :aria-label="'Quantity for ' + item.name"
            >
            <button 
              @click="increaseQuantity" 
              class="btn btn-sm btn-outline-secondary rounded-circle"
              :disabled="isEditing"
              aria-label="Increase quantity"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
          <!-- Item Price -->
        <div class="col-4 col-md-2 mt-3 mt-md-0 text-end">
          <p class="price fw-bold mb-0">{{ $currency(totalPrice) }}</p>
          <small v-if="item.quantity > 1" class="text-muted d-block">
            {{ $currency(itemUnitPrice) }} each
          </small>
          <small v-if="item.discount" class="text-success d-block">
            <i class="fas fa-tag me-1"></i>{{ item.discount }}% off
          </small>
        </div>
        
        <!-- Remove Button -->
        <div class="col-2 col-md-1 mt-3 mt-md-0 text-end">
          <button 
            @click="confirmRemove" 
            class="btn btn-sm btn-outline-danger rounded-circle"
            aria-label="Remove item from cart"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <!-- Special Instructions Area -->
      <div v-if="showInstructions" class="mt-3 special-instructions-area p-3 bg-light rounded">
        <div class="form-group">
          <label for="special-instructions" class="form-label">
            <i class="fas fa-utensils me-1"></i> Special Instructions
          </label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="fas fa-comment-alt"></i></span>
            <textarea 
              v-model="specialInstructions" 
              id="special-instructions"
              class="form-control" 
              rows="2"
              placeholder="Any special requests? (e.g., no onions, extra spicy, allergies)"
              @input="characterCount"
            ></textarea>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <small class="text-muted" :class="{'text-danger': remainingChars < 0}">
              {{ remainingChars }} characters remaining
            </small>
            <div>
              <button @click="clearInstructions" class="btn btn-sm btn-outline-secondary me-2">
                Clear
              </button>
              <button @click="updateInstructions" class="btn btn-sm btn-primary" :disabled="remainingChars < 0">
                <i class="fas fa-check me-1"></i> Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  computed: {
    // Calculate total price for this line item
    totalPrice() {
      const unitPrice = this.itemUnitPrice;
      return (unitPrice * this.item.quantity).toFixed(2);
    },

    // Get unit price, accounting for customizations and discounts
    itemUnitPrice() {
      let price = this.item.finalPrice || this.item.price;

      // Add custom ingredient costs if not already included in finalPrice
      if (
        !this.item.finalPrice &&
        this.hasCustomization &&
        this.item.customization.extraPrice
      ) {
        price += this.item.customization.extraPrice;
      }

      // Apply discount if not already included in finalPrice
      if (!this.item.finalPrice && this.item.discount) {
        price = price - (price * this.item.discount) / 100;
      }

      return price;
    },
    // Character count for special instructions
    remainingChars() {
      return this.MAX_INSTRUCTIONS_LENGTH - this.specialInstructions.length;
    },

    // Check if item has customization options
    isCustomizable() {
      return (
        (this.item.ingredients && this.item.ingredients.length > 0) ||
        (this.item.availableExtras && this.item.availableExtras.length > 0)
      );
    },

    // Check if item has customizations applied
    hasCustomization() {
      return (
        this.item.customization &&
        (this.hasRemovedIngredients || this.hasAddedIngredients)
      );
    },

    // Check if item has removed ingredients
    hasRemovedIngredients() {
      return (
        this.item.customization &&
        this.item.customization.removedIngredients &&
        this.item.customization.removedIngredients.length > 0
      );
    },

    // Check if item has added ingredients
    hasAddedIngredients() {
      return (
        this.item.customization &&
        this.item.customization.addedIngredients &&
        this.item.customization.addedIngredients.length > 0
      );
    },

    // Check if added ingredients have an extra charge
    hasExtraCharge() {
      return (
        this.item.customization &&
        this.item.customization.extraPrice &&
        this.item.customization.extraPrice > 0
      );
    },
  },
  watch: {
    showOptions(newValue) {
      if (newValue) {
        document.addEventListener("click", this.closeDropdown);
      } else {
        document.removeEventListener("click", this.closeDropdown);
      }
    },
  },
  beforeDestroy() {
    document.removeEventListener("click", this.closeDropdown);
  },
  methods: {
    closeDropdown(event) {
      if (!event.target.closest(".dropdown")) {
        this.showOptions = false;
      }
    },
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
    startEditing() {
      this.isEditing = true;
      this.originalQuantity = this.item.quantity;
    },
    finishEditing() {
      this.isEditing = false;
      // If user cleared the field or entered invalid value, restore original
      if (
        !this.item.quantity ||
        isNaN(this.item.quantity) ||
        this.item.quantity < 1
      ) {
        this.item.quantity = this.originalQuantity;
      }
    },
    updateQuantity() {
      // Ensure quantity is at least 1 and is a number
      this.item.quantity = Math.max(1, parseInt(this.item.quantity) || 1);
      this.updateCart();
    },
    confirmRemove() {
      this.isRemoving = true;
      setTimeout(() => {
        this.removeItem();
      }, 300); // Matches animation duration
    },
    removeItem() {
      this.$emit("remove-item", this.item.id);
    },
    updateCart() {
      const updateData = {
        id: this.item.id,
        quantity: this.item.quantity,
      };

      // Include customization if exists
      if (this.item.customization) {
        updateData.customization = this.item.customization;
      }

      // Include special instructions
      if (this.specialInstructions) {
        updateData.specialInstructions = this.specialInstructions;

        // Update in customization if it exists
        if (updateData.customization) {
          updateData.customization.specialInstructions =
            this.specialInstructions;
        }
      }

      this.$emit("update-cart", updateData);
    },
    toggleInstructions() {
      this.showInstructions = !this.showInstructions;
      if (
        !this.showInstructions &&
        this.specialInstructions !== this.item.specialInstructions
      ) {
        // If closing without saving, revert to original
        this.specialInstructions =
          this.item.specialInstructions ||
          (this.item.customization
            ? this.item.customization.specialInstructions
            : "") ||
          "";
      }
    },
    updateInstructions() {
      if (this.remainingChars >= 0) {
        // Update both places where instructions might be stored
        this.item.specialInstructions = this.specialInstructions;

        if (this.item.customization) {
          this.item.customization.specialInstructions =
            this.specialInstructions;
        }

        this.showInstructions = false;
        this.updateCart();
      }
    },
    clearInstructions() {
      this.specialInstructions = "";
    },
    characterCount() {
      // Just to trigger the computed property
    },
    saveForLater() {
      this.showOptions = false;
      // In a real app, you'd save this to a wishlist
      this.$root.$emit("show-toast", {
        message: `${this.item.name} saved for later!`,
        type: "info",
      });
    },
    customizeItem() {
      this.showOptions = false;
      // In a real app, open customization modal with current customizations
      this.$root.$emit("open-customization-modal", this.item);
    }
    /**
     * Get CSS class for dietary option badge
     * @param {string} option - Dietary option
     * @returns {string} CSS class
     */,
    getDietaryBadgeClass(option) {
      return this.DIETARY_BADGE_CLASSES[option] || "bg-secondary";
    },

    /**
     * Get icon for dietary option
     * @param {string} option - Dietary option
     * @returns {string} Icon class
     */
    getDietaryIcon(option) {
      return this.DIETARY_ICONS[option] || "fas fa-check";
    },

    /**
     * Initialize special instructions from item data
     * @returns {string} Initial instructions
     */
    getInitialInstructions() {
      return (
        this.item.specialInstructions ||
        (this.item.customization
          ? this.item.customization.specialInstructions
          : "") ||
        ""
      );
    },

    /**
     * Validate quantity input
     * @param {number} quantity - Quantity to validate
     * @returns {number} Valid quantity
     */
    validateQuantity(quantity) {
      const num = parseInt(quantity) || this.MIN_QUANTITY;
      return Math.max(this.MIN_QUANTITY, num);
    },

    /**
     * Handle quantity changes with validation
     * @param {number} newQuantity - New quantity value
     */
    handleQuantityChange(newQuantity) {
      const validQuantity = this.validateQuantity(newQuantity);
      if (this.item.quantity !== validQuantity) {
        this.item.quantity = validQuantity;
        this.updateCart();
      }
    },
  },
});
