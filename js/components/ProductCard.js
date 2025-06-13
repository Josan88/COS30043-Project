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
    listMode: {
      type: Boolean,
      default: false,
    },
  },
  template: `    <div 
      class="card h-100 product-card modern-card shadow-elevated border-0 position-relative"
      :class="{ 
        'compact-card': compactMode, 
        'hover-rise-enhanced': !compactMode,
        'out-of-stock': isOutOfStock,
        'list-mode-card': listMode,
        'card-trending': product.trending,
        'card-featured': product.featured,
        'card-new': product.isNew
      }"
      role="article"
      :aria-label="productAriaLabel"
    >
      <!-- Modern Status Indicators -->
      <div v-if="product.trending || product.featured || product.isNew" class="status-badges">
        <span v-if="product.trending" class="status-badge trending-badge">
          <i class="fas fa-fire"></i> Trending
        </span>
        <span v-if="product.featured" class="status-badge featured-badge">
          <i class="fas fa-star"></i> Featured
        </span>
        <span v-if="product.isNew" class="status-badge new-badge">
          <i class="fas fa-sparkles"></i> New
        </span>
      </div>

      <!-- List Mode Layout -->
      <div v-if="listMode" class="d-flex flex-row modern-list-layout">
        <!-- Product Image Section - Left Side -->
        <div class="position-relative list-image-container flex-shrink-0 modern-image-container">
          <router-link 
            :to="productDetailPath" 
            :aria-label="viewDetailsAriaLabel"
            class="d-block image-link"
          >
            <!-- Modern Image with Gradient Overlay -->
            <div class="image-wrapper">
              <img 
                :src="displayImage" 
                :alt="imageAltText" 
                class="list-image responsive-image modern-image"
                :class="{ 
                  'lazy-loading': isImageLoading,
                  'image-error': imageError 
                }"
                loading="lazy"
                decoding="async"
                @load="handleImageLoad"
                @error="handleImageError"
              >
              
              <!-- Subtle gradient overlay for better text readability -->
              <div class="image-gradient-overlay"></div>
            </div>
            
            <!-- Enhanced Discount Ribbon -->
            <div v-if="hasDiscount" class="modern-ribbon">
              <span class="ribbon-content">
                <i class="fas fa-tag"></i>
                {{ formatDiscount }} OFF
              </span>
            </div>
            
            <!-- Modern Stock Status Overlay -->
            <div v-if="isOutOfStock" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modern-stock-overlay">
              <div class="stock-status-card">
                <i class="fas fa-times-circle"></i>
                <span>OUT OF STOCK</span>
              </div>
            </div>
          </router-link>
          
          <!-- Enhanced Favorite Button -->
          <div 
            v-if="showFavoriteButton" 
            class="position-absolute top-0 end-0 m-2"
          >
            <button 
              class="btn modern-favorite-btn" 
              @click.stop.prevent="toggleFavorite" 
              :aria-label="favoriteAriaLabel"
              :disabled="isProcessingFavorite"
            >
              <i class="fas fa-heart" :class="favoriteIconClass"></i>
              <div class="button-ripple"></div>
            </button>
          </div>
          
          <!-- Modern Dietary Options Badges -->
          <div 
            v-if="displayDietaryOptions.length > 0" 
            class="position-absolute bottom-0 start-0 m-2"
          >
            <div class="dietary-badges-container">
              <span 
                v-for="option in displayDietaryOptions" 
                :key="option.name" 
                class="modern-dietary-badge"
                :class="option.badgeClass"
                :title="option.description"
              >
                <i :class="option.icon"></i>
                <span class="badge-text">{{ option.name }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Enhanced Product Info Section -->
        <div class="card-body d-flex flex-column flex-grow-1 p-3 modern-card-body">
          <!-- Title and Prep Time Row -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <router-link 
              :to="productDetailPath" 
              class="text-decoration-none flex-grow-1 title-link"
            >
              <h5 class="card-title mb-1 modern-title">
                {{ product.name }}
                <span v-if="product.spicyLevel" class="spicy-indicator">
                  <i v-for="i in product.spicyLevel" :key="i" class="fas fa-pepper-hot text-danger"></i>
                </span>
              </h5>
            </router-link>
            
            <div v-if="preparationTime" class="ms-2 flex-shrink-0">
              <span class="modern-time-badge">
                <i class="far fa-clock"></i>
                <span>{{ preparationTime }}</span>
              </span>
            </div>
          </div>
          
          <!-- Enhanced Rating Section -->
          <div v-if="hasRating" class="mb-2">
            <div class="modern-ratings d-flex align-items-center">
              <div class="star-rating-modern me-2" :aria-label="ratingAriaLabel">
                <div class="stars-background">
                  <i v-for="i in maxStars" :key="'bg-' + i" class="fas fa-star"></i>
                </div>
                <div class="stars-foreground" :style="{ width: (product.rating / maxStars) * 100 + '%' }">
                  <i v-for="i in maxStars" :key="'fg-' + i" class="fas fa-star"></i>
                </div>
              </div>
              <span class="rating-text">{{ product.rating }}</span>
              <span class="reviews-count">({{ formattedReviewCount }})</span>
            </div>
          </div>
          
          <!-- Enhanced Description -->
          <p class="card-text flex-grow-1 mb-2 modern-description">
            {{ truncatedDescription }}
          </p>
          
          <!-- Modern Price and Actions Row -->
          <div class="d-flex justify-content-between align-items-end modern-footer">
            <!-- Enhanced Price Section -->
            <div class="price-section">
              <div class="price-display d-flex align-items-center mb-1">
                <span 
                  v-if="hasDiscount" 
                  class="original-price"
                >
                  {{ formatPrice(product.price) }}
                </span>
                <span 
                  class="current-price"
                  :class="{ 'discounted-price': hasDiscount, 'regular-price': !hasDiscount }"
                >
                  {{ formatPrice(effectivePrice) }}
                </span>
                <span v-if="hasDiscount" class="savings-badge">
                  Save {{ formatPrice(savingsAmount) }}
                </span>
              </div>
              
              <!-- Enhanced Stock Status -->
              <div v-if="stockStatusText" class="stock-status">
                <span 
                  class="modern-stock-badge"
                  :class="{
                    'out-of-stock': isOutOfStock,
                    'low-stock': isLowStock,
                    'in-stock': !isOutOfStock && !isLowStock
                  }"
                >
                  <i class="fas" :class="{
                    'fa-times-circle': isOutOfStock,
                    'fa-exclamation-triangle': isLowStock,
                    'fa-check-circle': !isOutOfStock && !isLowStock
                  }"></i>
                  {{ stockStatusText }}
                </span>
              </div>
              
              <!-- Enhanced Nutritional Info -->
              <div v-if="nutritionalInfo" class="nutritional-info">
                <span class="nutrition-item calories">
                  <i class="fas fa-fire-alt"></i>
                  <span>{{ nutritionalInfo.calories }} cal</span>
                </span>
                <span v-if="nutritionalInfo.protein" class="nutrition-item protein">
                  <i class="fas fa-dumbbell"></i>
                  <span>{{ nutritionalInfo.protein }}g protein</span>
                </span>
              </div>
            </div>
            
            <!-- Enhanced Action Buttons -->
            <div class="action-buttons d-flex flex-column gap-2">
              <button 
                v-if="showAddButton" 
                @click.stop.prevent="addToCart" 
                class="btn modern-add-btn"
                :class="{
                  'btn-success': !isOutOfStock && !isLowStock,
                  'btn-warning': isLowStock && !isOutOfStock,
                  'btn-disabled': isOutOfStock
                }"
                :disabled="isAddingToCart || isOutOfStock"
                :aria-label="addToCartAriaLabel"
              >
                <div class="button-content">
                  <i v-if="!isAddingToCart && !isOutOfStock" class="fas fa-cart-plus"></i>
                  <i v-else-if="!isAddingToCart && isOutOfStock" class="fas fa-ban"></i>
                  <i v-else class="fas fa-spinner fa-spin"></i>
                  <span>{{ addToCartButtonText }}</span>
                </div>
                <div class="button-background"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Default Grid Mode Layout -->
      <div v-else class="modern-grid-layout">
        <!-- Enhanced Product Image Section -->
        <div class="position-relative card-image-container modern-image-container">
          <router-link 
            :to="productDetailPath" 
            :aria-label="viewDetailsAriaLabel"
            class="d-block image-link"
          >
            <div class="image-wrapper">
              <img 
                :src="displayImage" 
                :alt="imageAltText" 
                class="card-img-top food-image responsive-image modern-image"
                :class="{ 
                  'compact-image': compactMode, 
                  'lazy-loading': isImageLoading,
                  'image-error': imageError 
                }"
                loading="lazy"
                decoding="async"
                @load="handleImageLoad"
                @error="handleImageError"
              >            
              <!-- Enhanced Image overlay for hover effects -->
              <div class="modern-image-overlay">
                <div class="overlay-content">
                  <i class="fas fa-eye"></i>
                  <span>View Details</span>
                </div>
              </div>
            </div>
              
            <!-- Enhanced Discount Ribbon -->
            <div v-if="hasDiscount" class="modern-ribbon">
              <span class="ribbon-content">
                <i class="fas fa-tag"></i>
                {{ formatDiscount }} OFF
              </span>
            </div>
            
            <!-- Enhanced Stock Status Overlay -->
            <div v-if="isOutOfStock" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modern-stock-overlay">
              <div class="stock-status-card">
                <i class="fas fa-times-circle"></i>
                <span>OUT OF STOCK</span>
              </div>
            </div>
          </router-link>
          
          <!-- Enhanced Favorite Button -->
          <div 
            v-if="showFavoriteButton" 
            class="position-absolute top-0 end-0 m-2"
          >
            <button 
              class="btn modern-favorite-btn" 
              @click.stop.prevent="toggleFavorite" 
              :aria-label="favoriteAriaLabel"
              :disabled="isProcessingFavorite"
            >
              <i class="fas fa-heart" :class="favoriteIconClass"></i>
              <div class="button-ripple"></div>
            </button>
          </div>
          
          <!-- Enhanced Dietary Options Badges -->
          <div 
            v-if="displayDietaryOptions.length > 0" 
            class="position-absolute bottom-0 start-0 m-2"
          >
            <div class="dietary-badges-container">
              <span 
                v-for="option in displayDietaryOptions" 
                :key="option.name" 
                class="modern-dietary-badge"
                :class="option.badgeClass"
                :title="option.description"
              >
                <i :class="option.icon"></i>
                <span class="badge-text">{{ option.name }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Enhanced Card Body -->
        <div class="card-body modern-card-body">
          <!-- Title and Prep Time -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <router-link 
              :to="productDetailPath" 
              class="text-decoration-none flex-grow-1 title-link"
            >
              <h5 class="card-title modern-title">
                {{ product.name }}
                <span v-if="product.spicyLevel" class="spicy-indicator">
                  <i v-for="i in product.spicyLevel" :key="i" class="fas fa-pepper-hot text-danger"></i>
                </span>
              </h5>
            </router-link>
            
            <div v-if="preparationTime" class="ms-2 flex-shrink-0">
              <span class="modern-time-badge">
                <i class="far fa-clock"></i>
                <span>{{ preparationTime }}</span>
              </span>
            </div>
          </div>
          
          <!-- Enhanced Rating Section -->
          <div v-if="hasRating" class="mb-2">
            <div class="modern-ratings d-flex align-items-center">
              <div class="star-rating-modern me-2" :aria-label="ratingAriaLabel">
                <div class="stars-background">
                  <i v-for="i in maxStars" :key="'bg-' + i" class="fas fa-star"></i>
                </div>
                <div class="stars-foreground" :style="{ width: (product.rating / maxStars) * 100 + '%' }">
                  <i v-for="i in maxStars" :key="'fg-' + i" class="fas fa-star"></i>
                </div>
              </div>
              <span class="rating-text">{{ product.rating }}</span>
              <span class="reviews-count">({{ formattedReviewCount }})</span>
            </div>
          </div>
          
          <!-- Enhanced Description -->
          <p class="card-text modern-description mb-3">
            {{ truncatedDescription }}
          </p>
          
          <!-- Enhanced Nutritional Info -->
          <div v-if="nutritionalInfo" class="nutritional-info mb-3">
            <span class="nutrition-item calories">
              <i class="fas fa-fire-alt"></i>
              <span>{{ nutritionalInfo.calories }} cal</span>
            </span>
            <span v-if="nutritionalInfo.protein" class="nutrition-item protein">
              <i class="fas fa-dumbbell"></i>
              <span>{{ nutritionalInfo.protein }}g protein</span>
            </span>
          </div>
          
          <!-- Enhanced Footer with Price and Action -->
          <div class="mt-auto">
            <!-- Enhanced Price Display -->
            <div class="price-section mb-3">
              <div class="price-display">
                <span 
                  v-if="hasDiscount" 
                  class="original-price"
                >
                  {{ formatPrice(product.price) }}
                </span>
                <span 
                  class="current-price"
                  :class="{ 'discounted-price': hasDiscount, 'regular-price': !hasDiscount }"
                >
                  {{ formatPrice(effectivePrice) }}
                </span>
                <span v-if="hasDiscount" class="savings-badge">
                  Save {{ formatPrice(savingsAmount) }}
                </span>
              </div>
              
              <!-- Enhanced Stock Status -->
              <div v-if="stockStatusText" class="stock-status mt-1">
                <span 
                  class="modern-stock-badge"
                  :class="{
                    'out-of-stock': isOutOfStock,
                    'low-stock': isLowStock,
                    'in-stock': !isOutOfStock && !isLowStock
                  }"
                >
                  <i class="fas" :class="{
                    'fa-times-circle': isOutOfStock,
                    'fa-exclamation-triangle': isLowStock,
                    'fa-check-circle': !isOutOfStock && !isLowStock
                  }"></i>
                  {{ stockStatusText }}
                </span>
              </div>
            </div>
            
            <!-- Enhanced Add to Cart Button -->
            <button 
              v-if="showAddButton" 
              @click.stop.prevent="addToCart" 
              class="btn modern-add-btn w-100"
              :class="{
                'btn-success': !isOutOfStock && !isLowStock,
                'btn-warning': isLowStock && !isOutOfStock,
                'btn-disabled': isOutOfStock
              }"
              :disabled="isAddingToCart || isOutOfStock"
              :aria-label="addToCartAriaLabel"
            >
              <div class="button-content">
                <i v-if="!isAddingToCart && !isOutOfStock" class="fas fa-cart-plus"></i>
                <i v-else-if="!isAddingToCart && isOutOfStock" class="fas fa-ban"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ addToCartButtonText }}</span>
              </div>
              <div class="button-background"></div>
            </button>
          </div>
        </div>
      </div>
    </div>`,
  data() {
    return {
      // UI State
      isFavorite: false,
      isAddingToCart: false,
      isProcessingFavorite: false,
      imageError: false,
      isImageLoading: true,

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
     */ formatDiscount() {
      return this.hasDiscount ? `${this.product.discount}%` : "";
    },

    /**
     * Check if product is out of stock
     */
    isOutOfStock() {
      return this.product.stock !== undefined && this.product.stock === 0;
    },

    /**
     * Check if product has low stock (less than 5 items)
     */
    isLowStock() {
      return (
        this.product.stock !== undefined &&
        this.product.stock > 0 &&
        this.product.stock < 5
      );
    },

    /**
     * Get stock status text
     */
    stockStatusText() {
      if (this.isOutOfStock) return "OUT OF STOCK";
      if (this.isLowStock) return `Only ${this.product.stock} left`;
      return "";
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
     * Get display image with fallback and optimization
     */ displayImage() {
      const baseImage = this.imageError
        ? this.fallbackImage
        : this.product.image || this.fallbackImage;

      // Use image optimization service if available
      if (window.ImageOptimizationService) {
        return window.ImageOptimizationService.optimizeImageUrl(baseImage, {
          width: this.compactMode ? 300 : 400,
          height: this.compactMode ? 200 : 300,
          quality: "auto",
          format: "auto",
        });
      }

      return baseImage;
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
     */ addToCartButtonText() {
      if (this.isAddingToCart) return "Adding...";
      if (this.isOutOfStock) return "Out of Stock";
      if (this.isLowStock) return `Add (${this.product.stock} left)`;
      return "Add";
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
        } // Prepare cart item with all necessary product information
        const cartItem = {
          id: this.product.id,
          name: this.product.name,
          price: this.effectivePrice,
          originalPrice: this.product.price,
          image: this.displayImage,
          quantity: 1,
          discount: this.hasDiscount ? this.product.discount : 0,
          stock: this.product.stock || 0, // Include stock information for validation
          category: this.product.category,
          rating: this.product.rating,
          reviewCount: this.product.reviewCount,
          preparationTime: this.product.preparationTime,
          calories: this.product.calories,
          dietaryOptions: this.product.dietaryOptions || [],
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
        } // Show success feedback
        this.showFeedback(`${this.product.name} added to cart!`, "success");
      } catch (error) {
        console.error("Error adding product to cart:", error);

        // Handle specific stock validation errors
        if (error.code === "INSUFFICIENT_STOCK") {
          if (error.available === 0) {
            this.showFeedback(
              `${this.product.name} is currently out of stock.`,
              "error"
            );
          } else {
            const inCartText =
              error.inCart > 0 ? ` (${error.inCart} already in cart)` : "";
            this.showFeedback(
              `Only ${error.available} ${this.product.name} available${inCartText}.`,
              "error"
            );
          }
        } else {
          this.showFeedback(
            "Could not add to cart. Please try again.",
            "error"
          );
        }

        window.ErrorHandler?.logError(error, {
          component: "ProductCard",
          method: "addToCart",
          productId: this.product.id,
        });
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
     */ formatPrice(price) {
      const currency = window.APP_CONSTANTS?.PRICING?.CURRENCY || "RM";
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
      } // Emit to parent component
      this.$emit("show-feedback", { message, type });

      // Fallback to EventBus
      window.EventBus.emit("show-toast", { message, type });
    },

    /**
     * Handle successful image load
     */
    handleImageLoad() {
      this.isImageLoading = false;
      this.imageError = false;
    },

    /**
     * Handle image load error - Enhanced for mobile optimization
     */
    handleImageError() {
      this.imageError = true;
      this.isImageLoading = false;

      // Try to load a lower quality fallback image for mobile
      if (window.innerWidth <= 575) {
        const fallbackUrl = this.generateMobileFallback();
        if (fallbackUrl !== this.displayImage) {
          // Attempt to load mobile-optimized fallback
          this.$nextTick(() => {
            const img = this.$el.querySelector(".food-image");
            if (img && fallbackUrl) {
              img.src = fallbackUrl;
            }
          });
        }
      }

      console.warn(`Image failed to load for product: ${this.product.name}`, {
        originalUrl: this.product.image,
        fallbackUrl: this.fallbackImage,
        isMobile: window.innerWidth <= 575,
      });
    },
    /**
     * Generate mobile-optimized fallback image URL
     */ generateMobileFallback() {
      // Check if original image has different resolutions available
      const originalUrl = this.product.image;
      if (originalUrl && typeof originalUrl === "string") {
        // Try to find mobile-optimized version
        const mobileUrl = originalUrl
          .replace(/\.(jpg|jpeg|png)$/i, "_mobile.$1")
          .replace(/large/gi, "small")
          .replace(/high/gi, "low");

        if (mobileUrl !== originalUrl) {
          return mobileUrl;
        }
      }

      return this.fallbackImage;
    },

    /**
     * Check if image is below the fold for lazy loading
     */
    isImageBelowFold(imgElement) {
      const rect = imgElement.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      return rect.top > viewportHeight + 100; // 100px buffer
    },
  },
  /**
   * Component lifecycle - load favorite status and setup image optimization
   */ async mounted() {
    try {
      await this.loadFavoriteStatus();

      // Setup image optimization and lazy loading
      this.$nextTick(() => {
        const imgElement = this.$el.querySelector(".food-image");
        if (imgElement && window.ImageOptimizationService) {
          // Store original source for optimization service
          imgElement.dataset.originalSrc = this.product.image;
          imgElement.dataset.width = this.compactMode ? "300" : "400";
          imgElement.dataset.height = this.compactMode ? "200" : "300";

          // Enable lazy loading if image is below the fold
          if (this.isImageBelowFold(imgElement)) {
            window.ImageOptimizationService.enableLazyLoading(imgElement);
          }
        }
      });
    } catch (error) {
      console.error("Error mounting ProductCard:", error);
    }
  },
});
