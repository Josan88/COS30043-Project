/**
 * Constants Loader
 * Loads and makes application constants available globally
 */

// Since the main constants file uses ES6 modules and we need global access,
// we'll define the constants directly here to make them available to all components

window.APP_CONSTANTS = {
  // UI Configuration
  UI: {
    BRAND_NAME: 'FoodNow',
    ANIMATION_DURATION: 600,
    DEBOUNCE_DELAY: 300,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 200,
    SEARCH_MIN_LENGTH: 2,
    PAGINATION_SIZE: 12,
    CAROUSEL_AUTO_SCROLL_INTERVAL: 5000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    ANIMATION_DELAY: 150
  },

  // Pricing Configuration
  PRICING: {
    TAX_RATE: 0.1,
    FREE_DELIVERY_THRESHOLD: 15,
    DELIVERY_FEE: 2.99,
    EXPRESS_DELIVERY_FEE: 4.99
  },

  // Delivery Configuration
  DELIVERY: {
    MIN_DELIVERY_TIME: 20,
    MAX_DELIVERY_TIME: 40,
    PREPARATION_TIME_BUFFER: 5,
    OPTIONS: {
      DINE_IN: 'dine-in',
      PICKUP: 'pickup',
      STANDARD_DELIVERY: 'standard_delivery',
      EXPRESS_DELIVERY: 'express_delivery'
    }
  },

  // Dietary Options
  DIETARY_OPTIONS: {
    VEGETARIAN: 'Vegetarian',
    VEGAN: 'Vegan',
    GLUTEN_FREE: 'Gluten-free',
    HALAL: 'Halal',
    KETO: 'Keto',
    SPICY: 'Spicy'
  },

  // Badge Classes for Dietary Options
  DIETARY_BADGE_CLASSES: {
    'Vegetarian': 'bg-success',
    'Vegan': 'bg-success',
    'Gluten-free': 'bg-info',
    'Halal': 'bg-secondary',
    'Keto': 'bg-primary',
    'Spicy': 'bg-danger'
  },

  // Icons for Dietary Options
  DIETARY_ICONS: {
    'Vegetarian': 'fas fa-leaf',
    'Vegan': 'fas fa-seedling',
    'Gluten-free': 'fas fa-bread-slice',
    'Halal': 'fas fa-moon',
    'Keto': 'fas fa-bacon',
    'Spicy': 'fas fa-pepper-hot'
  },

  // API Endpoints
  API_ENDPOINTS: {
    PRODUCTS: 'js/data/products.json',
    ORDERS: '/api/orders',
    USERS: '/api/users'
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    CART: 'foodCart',
    ORDERS: 'foodOrders',
    USER_PREFERENCES: 'userPreferences',
    AUTH_TOKEN: 'authToken',
    IS_LOGGED_IN: 'isLoggedIn',
    USER_DATA: 'user'
  },

  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_INPUT: 'Please check your input and try again.',
    ORDER_FAILED: 'Unable to place order. Please try again.',
    LOGIN_REQUIRED: 'Please log in to continue.',
    ITEM_NOT_FOUND: 'Item not found.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    ORDER_PLACED: 'Order placed successfully!',
    ITEM_ADDED: 'Item added to cart',
    ITEM_REMOVED: 'Item removed from cart',
    SETTINGS_SAVED: 'Settings saved successfully'
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_NAME_LENGTH: 50,
    MIN_NAME_LENGTH: 2,
    MIN_PHONE_LENGTH: 10,
    MAX_PHONE_LENGTH: 15,
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 50,
    MESSAGES: {
      REQUIRED: 'This field is required',
      INVALID_EMAIL: 'Please enter a valid email address',
      INVALID_PHONE: 'Please enter a valid phone number',
      PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
      PASSWORD_TOO_LONG: 'Password must be less than 128 characters',
      NAME_TOO_SHORT: 'Name must be at least 2 characters long',
      NAME_TOO_LONG: 'Name must be less than 50 characters',
      PHONE_TOO_SHORT: 'Phone number must be at least 10 digits',
      PHONE_TOO_LONG: 'Phone number must be less than 15 digits'
    }
  },

  // Responsive Breakpoints
  BREAKPOINTS: {
    XS: 576,
    SM: 768,
    MD: 992,
    LG: 1200,
    XL: 1400
  },

  // Theme Configuration
  THEME: {
    DARK_MODE_KEY: 'darkMode',
    DEFAULT_THEME: 'light'
  },

  // Messages
  MESSAGES: {
    ERROR: {
      COMPONENT_LOAD: 'Failed to load page content',
      LOAD_FAILED: 'Failed to load content. Please refresh the page.'
    }
  }
};

console.log('APP_CONSTANTS loaded successfully');
