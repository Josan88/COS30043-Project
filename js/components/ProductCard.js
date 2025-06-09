/**
 * ProductCard Component
 * Reusable component for displaying food item information in a card format
 * Enhanced with better validation, constants, and error handling
 */
window.app.component("product-card", {
  props: {
    product: {
      type: Object,
      required: true,
      validator(value) {
        // Enhanced validation for product object
        if (!value || typeof value !== "object") return false;

        const requiredFields = ["id", "name", "price", "description"];
        const hasRequired = requiredFields.every(
          (field) =>
            value.hasOwnProperty(field) &&
            value[field] !== null &&
            value[field] !== undefined
        );

        if (!hasRequired) {
          console.warn("ProductCard: Missing required product fields", {
            product: value,
            requiredFields,
          });
          return false;
        }

        // Validate data types
        if (typeof value.price !== "number" || value.price < 0) {
          console.warn("ProductCard: Invalid price value", value.price);
          return false;
        }

        return true;
      },
    },
    showAddButton: {
      type: Boolean,
      default: true,
    },
    showFavoriteButton: {
      type: Boolean,
      default: true,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  template: `
    <div 
      class="card h-100 product-card shadow-sm border-0 position-relative"
      :class="{ 'compact-card': compactMode, 'hover-rise': !compactMode }"
      role="article"
      :aria-label="productAriaLabel"
    >
      <!-- Product Image Section -->
      <div class="position-relative card-image-container">
        <router-link 
          :to="productDetailPath" 
          :aria-label="viewDetailsAriaLabel"
          class="d-block"
        >
          <img 
            :src="displayImage" 
            :alt="imageAltText" 
            class="card-img-top food-image"
            :class="{ 'compact-image': compactMode }"
            loading="lazy"
            @error="handleImageError"
          >
          
          <!-- Discount Ribbon -->
          <div v-if="hasDiscount" class="ribbon">
            <span class="bg-danger text-white px-2 py-1 small fw-bold">
              {{ formatDiscount }} OFF
            </span>
          </div>
        </router-link>
        
        <!-- Favorite Button -->
        <div 
          v-if="showFavoriteButton" 
          class="position-absolute top-0 end-0 m-2"
        >
          <button 
            class="btn btn-sm btn-light rounded-circle shadow-sm favorite-btn" 
            @click.stop.prevent="toggleFavorite" 
            :aria-label="favoriteAriaLabel"
            :disabled="isProcessingFavorite"
          >
            <i class="fas fa-heart" :class="favoriteIconClass"></i>
          </button>
        </div>
        
        <!-- Dietary Options Badges -->
        <div 
          v-if="displayDietaryOptions.length > 0" 
          class="position-absolute bottom-0 start-0 m-2"
        >
          <span 
            v-for="option in displayDietaryOptions" 
            :key="option.name" 
            class="badge dietary-badge me-1 mb-1"
            :class="option.badgeClass"
            :title="option.description"
          >
            <i :class="option.icon" class="me-1"></i>
            {{ option.name }}
          </span>
        </div>
      </div>
      
      <!-- Card Body -->
      <div class="card-body d-flex flex-column p-3">
        <!-- Title and Prep Time Row -->
        <div class="d-flex justify-content-between align-items-start mb-2">
          <router-link 
            :to="productDetailPath" 
            class="text-decoration-none flex-grow-1"
          >
            <h5 class="card-title mb-1 text-dark" :class="{ 'h6': compactMode }">
              {{ product.name }}
            </h5>
          </router-link>
          
          <div v-if="preparationTime" class="ms-2 flex-shrink-0">
            <span class="badge bg-light text-dark small">
              <i class="far fa-clock me-1"></i>{{ preparationTime }}
            </span>
          </div>
        </div>
        
        <!-- Rating Section -->
        <div v-if="hasRating" class="mb-2">
          <div class="ratings d-flex align-items-center">
            <div class="star-rating me-2" :aria-label="ratingAriaLabel">
              <i 
                v-for="i in maxStars" 
                :key="i" 
                class="fas"
                :class="getStarClass(i)"
              ></i>
            </div>
            <span class="small text-muted">({{ formattedReviewCount }})</span>
          </div>
        </div>
        
        <!-- Price Section -->
        <div class="mb-2">
          <div class="price-display d-flex align-items-center">
            <span 
              v-if="hasDiscount" 
              class="text-decoration-line-through text-muted me-2 small"
            >
              {{ formatPrice(product.price) }}
            </span>
            <span 
              class="fw-bold"
              :class="{ 'text-danger': hasDiscount, 'text-dark': !hasDiscount }"
            >
              {{ formatPrice(effectivePrice) }}
            </span>
            <span v-if="hasDiscount" class="badge bg-success ms-2 small">
              Save {{ formatPrice(savingsAmount) }}
            </span>
          </div>
        </div>
        
        <!-- Description -->
        <p 
          v-if="!compactMode"
          class="card-text flex-grow-1 mb-3 small text-muted"
        >
          {{ truncatedDescription }}
        </p>
        
        <!-- Footer Actions -->
        <div class="mt-auto">
          <!-- Nutritional Info -->
          <div v-if="nutritionalInfo" class="mb-2 d-flex flex-wrap">
            <span class="small text-muted me-3">
              <i class="fas fa-fire-alt me-1 text-orange"></i>{{ nutritionalInfo.calories }} cal
            </span>
            <span v-if="nutritionalInfo.protein" class="small text-muted me-3">
              <i class="fas fa-dumbbell me-1"></i>{{ nutritionalInfo.protein }}g protein
            </span>
          </div>
          
          <!-- Action Buttons -->
          <div class="d-flex align-items-center justify-content-between">
            <router-link 
              :to="productDetailPath" 
              class="btn btn-sm btn-outline-secondary"
              :class="{ 'btn-xs': compactMode }"
            >
              <i class="fas fa-info-circle me-1"></i>Details
            </router-link>
            
            <button 
              v-if="showAddButton" 
              @click.stop.prevent="addToCart" 
              class="btn btn-sm btn-primary"
              :class="{ 'btn-xs': compactMode }"
              :disabled="isAddingToCart"
              :aria-label="addToCartAriaLabel"
            >
              <i v-if="!isAddingToCart" class="fas fa-cart-plus me-1"></i>
              <i v-else class="fas fa-spinner fa-spin me-1"></i>
              {{ addToCartButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      // UI State
      isFavorite: false,
      isAddingToCart: false,
      isProcessingFavorite: false,
      imageError: false,

      // Configuration from constants
      maxStars: window.APP_CONSTANTS?.UI?.MAX_RATING_STARS || 5,
      descriptionMaxLength:
        window.APP_CONSTANTS?.UI?.CARD_DESCRIPTION_LENGTH || 70,

      // Fallback image
      fallbackImage:
        window.APP_CONSTANTS?.UI?.FALLBACK_PRODUCT_IMAGE ||
        "assets/images/placeholder-food.jpg",
    };
  },

  computed: {
    /**
     * Calculate effective price after discount
     */
    effectivePrice() {
      if (!this.hasDiscount) return this.product.price;
      const discountAmount = this.product.price * (this.product.discount / 100);
      return this.product.price - discountAmount;
    },

    /**
     * Check if product has discount
     */
    hasDiscount() {
      return this.product.discount && this.product.discount > 0;
    },

    /**
     * Calculate savings amount
     */
    savingsAmount() {
      return this.hasDiscount ? this.product.price - this.effectivePrice : 0;
    },

    /**
     * Format discount percentage
     */
    formatDiscount() {
      return this.hasDiscount ? `${this.product.discount}%` : "";
    },

    /**
     * Get truncated description
     */
    truncatedDescription() {
      if (!this.product.description) return "";

      return this.product.description.length > this.descriptionMaxLength
        ? this.product.description.substring(0, this.descriptionMaxLength) +
            "..."
        : this.product.description;
    },

    /**
     * Get product detail page path
     */
    productDetailPath() {
      return `/product/${this.product.id}`;
    },

    /**
     * Get display image with fallback
     */
    displayImage() {
      return this.imageError
        ? this.fallbackImage
        : this.product.image || this.fallbackImage;
    },

    /**
     * Get image alt text
     */
    imageAltText() {
      return `${this.product.name} - Food item image`;
    },

    /**
     * Check if product has rating
     */
    hasRating() {
      return this.product.rating && this.product.rating > 0;
    },

    /**
     * Format review count
     */
    formattedReviewCount() {
      const count = this.product.reviewCount || 0;
      return count > 999 ? `${Math.floor(count / 1000)}k+` : count.toString();
    },

    /**
     * Get preparation time display
     */
    preparationTime() {
      return this.product.preparationTime
        ? `${this.product.preparationTime} min`
        : null;
    },

    /**
     * Get nutritional information
     */
    nutritionalInfo() {
      return (
        this.product.nutritionalInfo ||
        (this.product.calories ? { calories: this.product.calories } : null)
      );
    },

    /**
     * Process dietary options for display
     */
    displayDietaryOptions() {
      if (
        !this.product.dietaryOptions ||
        !Array.isArray(this.product.dietaryOptions)
      ) {
        return [];
      }

      const dietaryMap = window.APP_CONSTANTS?.DIETARY_OPTIONS || {};

      return this.product.dietaryOptions.map((option) => {
        const mapping = dietaryMap[option] || {};
        return {
          name: option,
          icon: mapping.icon || "fas fa-check",
          badgeClass: mapping.badgeClass || "bg-success",
          description: mapping.description || option,
        };
      });
    },

    /**
     * Favorite button icon classes
     */
    favoriteIconClass() {
      return {
        "text-danger": this.isFavorite,
        "text-muted": !this.isFavorite,
        "fa-spin": this.isProcessingFavorite,
      };
    },

    /**
     * Add to cart button text
     */
    addToCartButtonText() {
      return this.isAddingToCart ? "Adding..." : "Add";
    },

    // Accessibility computed properties
    productAriaLabel() {
      return `${this.product.name} - ${this.formatPrice(this.effectivePrice)}${
        this.hasRating
          ? `, rated ${this.product.rating} out of ${this.maxStars} stars`
          : ""
      }`;
    },

    favoriteAriaLabel() {
      return this.isFavorite ? "Remove from favorites" : "Add to favorites";
    },

    addToCartAriaLabel() {
      return `Add ${this.product.name} to cart for ${this.formatPrice(
        this.effectivePrice
      )}`;
    },

    viewDetailsAriaLabel() {
      return `View details for ${this.product.name}`;
    },

    ratingAriaLabel() {
      return `Rated ${this.product.rating} out of ${this.maxStars} stars with ${this.product.reviewCount} reviews`;
    },
  },
  methods: {
    /**
     * Add product to cart with enhanced error handling
     */
    async addToCart(event) {
      event?.stopPropagation();

      if (this.isAddingToCart) return; // Prevent double-clicks

      this.isAddingToCart = true;

      try {
        // Validate product before adding
        if (!this.validateProductForCart()) {
          throw new Error("Product validation failed");
        }

        // Prepare cart item
        const cartItem = {
          id: this.product.id,
          name: this.product.name,
          price: this.effectivePrice,
          originalPrice: this.product.price,
          image: this.displayImage,
          quantity: 1,
          discount: this.hasDiscount ? this.product.discount : 0,
        };

        // Add to cart using service
        if (
          window.CartService &&
          typeof window.CartService.addItem === "function"
        ) {
          await window.CartService.addItem(cartItem);
        } else {
          throw new Error(
            "CartService is not available or addItem method is missing"
          );
        }

        // Show success feedback
        this.showFeedback(`${this.product.name} added to cart!`, "success");

        // Track analytics
        this.trackAddToCart(cartItem);
      } catch (error) {
        console.error("Error adding product to cart:", error);
        window.ErrorHandler?.logError(error, {
          component: "ProductCard",
          method: "addToCart",
          productId: this.product.id,
        });

        this.showFeedback("Could not add to cart. Please try again.", "error");
      } finally {
        this.isAddingToCart = false;
      }
    },

    /**
     * Toggle favorite status with persistence
     */
    async toggleFavorite(event) {
      event?.stopPropagation();

      if (this.isProcessingFavorite) return;

      this.isProcessingFavorite = true;

      try {
        const previousState = this.isFavorite;
        this.isFavorite = !this.isFavorite;

        // Persist to favorites service/storage
        await this.updateFavoriteStatus(this.isFavorite);

        const action = this.isFavorite ? "added to" : "removed from";
        this.showFeedback(`${this.product.name} ${action} favorites!`, "info");

        // Track analytics
        this.trackFavoriteToggle(this.isFavorite);
      } catch (error) {
        // Revert state on error
        this.isFavorite = !this.isFavorite;

        console.error("Error updating favorite status:", error);
        window.ErrorHandler?.logError(error, {
          component: "ProductCard",
          method: "toggleFavorite",
          productId: this.product.id,
        });

        this.showFeedback(
          "Could not update favorites. Please try again.",
          "error"
        );
      } finally {
        this.isProcessingFavorite = false;
      }
    },

    /**
     * Handle image loading errors
     */
    handleImageError() {
      this.imageError = true;
      console.warn(
        `Failed to load image for product ${this.product.id}: ${this.product.image}`
      );
    },

    /**
     * Get star class for rating display
     */
    getStarClass(starIndex) {
      const rating = this.product.rating || 0;

      if (starIndex <= Math.floor(rating)) {
        return "fa-star text-warning";
      } else if (starIndex === Math.ceil(rating) && rating % 1 !== 0) {
        return "fa-star-half-alt text-warning";
      } else {
        return "fa-star text-muted";
      }
    },

    /**
     * Format price with currency
     */
    formatPrice(price) {
      const currency = window.APP_CONSTANTS?.CURRENCY || "RM";
      return `${currency}${price.toFixed(2)}`;
    },

    /**
     * Validate product data before cart operations
     */
    validateProductForCart() {
      if (!this.product.id) {
        console.error("Product missing ID");
        return false;
      }

      if (!this.product.name || this.product.name.trim() === "") {
        console.error("Product missing name");
        return false;
      }

      if (typeof this.product.price !== "number" || this.product.price <= 0) {
        console.error("Product has invalid price");
        return false;
      }

      return true;
    },

    /**
     * Update favorite status in storage/service
     */
    async updateFavoriteStatus(isFavorite) {
      // This would integrate with a favorites service
      if (window.FavoritesService) {
        if (isFavorite) {
          await window.FavoritesService.addFavorite(this.product.id);
        } else {
          await window.FavoritesService.removeFavorite(this.product.id);
        }
      } else {
        // Fallback to localStorage
        const storageKey =
          window.APP_CONSTANTS?.STORAGE_KEYS?.FAVORITES || "favorites";
        const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");

        if (isFavorite) {
          if (!favorites.includes(this.product.id)) {
            favorites.push(this.product.id);
          }
        } else {
          const index = favorites.indexOf(this.product.id);
          if (index > -1) {
            favorites.splice(index, 1);
          }
        }

        localStorage.setItem(storageKey, JSON.stringify(favorites));
      }
    },

    /**
     * Load favorite status from storage/service
     */
    async loadFavoriteStatus() {
      try {
        if (window.FavoritesService) {
          this.isFavorite = await window.FavoritesService.isFavorite(
            this.product.id
          );
        } else {
          // Fallback to localStorage
          const storageKey =
            window.APP_CONSTANTS?.STORAGE_KEYS?.FAVORITES || "favorites";
          const favorites = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
          );
          this.isFavorite = favorites.includes(this.product.id);
        }
      } catch (error) {
        console.error("Error loading favorite status:", error);
        this.isFavorite = false;
      }
    },

    /**
     * Show user feedback
     */
    showFeedback(message, type = "info") {
      // Try toast service first
      if (window.ToastService) {
        window.ToastService.show(message, type);
        return;
      }

      // Emit to parent component
      this.$emit("show-feedback", { message, type });

      // Fallback to root event bus
      this.$root.$emit("show-toast", { message, type });
    },

    /**
     * Track add to cart analytics
     */
    trackAddToCart(cartItem) {
      if (window.analytics && typeof window.analytics.track === "function") {
        window.analytics.track("Add to Cart", {
          productId: cartItem.id,
          productName: cartItem.name,
          price: cartItem.price,
          discount: cartItem.discount,
          source: "product-card",
        });
      }
    },

    /**
     * Track favorite toggle analytics
     */
    trackFavoriteToggle(isFavorite) {
      if (window.analytics && typeof window.analytics.track === "function") {
        window.analytics.track(
          isFavorite ? "Add to Favorites" : "Remove from Favorites",
          {
            productId: this.product.id,
            productName: this.product.name,
            source: "product-card",
          }
        );
      }
    },
  },

  /**
   * Component lifecycle - load favorite status
   */
  async mounted() {
    try {
      await this.loadFavoriteStatus();
    } catch (error) {
      console.error("Error mounting ProductCard:", error);
    }
  },
});
