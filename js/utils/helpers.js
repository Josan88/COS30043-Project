/**
 * Utility Functions v2.0.0 - Enhanced Edition
 * Common helper functions for improved code reusability and maintainability
 * 
 * FEATURES:
 * - ✅ Performance Optimized: Debounce and throttle functions for optimal performance
 * - ✅ Data Validation: Comprehensive validation utilities for forms and inputs
 * - ✅ Formatting Utilities: Price, date, and text formatting functions
 * - ✅ Object Manipulation: Deep cloning and nested property access
 * - ✅ UI Helpers: Responsive image handling and display utilities
 * - ✅ Browser Compatibility: No ES6 modules for maximum browser support
 */

// Global Helpers object to contain all utility functions
window.Helpers = window.Helpers || {};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
 * @returns {Function} Debounced function
 */
window.Helpers.debounce = function(func, wait, immediate = false) {  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
window.Helpers.throttle = function(func, limit) {  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
window.Helpers.deepClone = function(obj) {  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => window.Helpers.deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = window.Helpers.deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
window.Helpers.isEmpty = function(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
window.Helpers.generateId = function(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
window.Helpers.isValidEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
window.Helpers.isValidPhone = function(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Format price with currency
 * @param {number} price - Price to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted price
 */
window.Helpers.formatPrice = function(price, currency = 'MYR', locale = 'en-MY') {
  if (typeof price !== 'number' || isNaN(price)) return '0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
window.Helpers.formatDate = function(date, options = {}) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Calculate estimated delivery time
 * @param {number} minTime - Minimum delivery time in minutes
 * @param {number} maxTime - Maximum delivery time in minutes
 * @returns {Object} Delivery time information
 */
window.Helpers.calculateDeliveryTime = function(minTime = 20, maxTime = 40) {
  const deliveryTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  const deliveryDate = new Date(Date.now() + deliveryTime * 60000);
  
  return {
    minutes: deliveryTime,
    estimatedTime: deliveryDate,
    displayTime: formatDate(deliveryDate, { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated text
 */
window.Helpers.truncateText = function(text, maxLength = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
window.Helpers.capitalizeWords = function(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\b\w/g, letter => letter.toUpperCase());
}

/**
 * Calculate discount price
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discounted price
 */
window.Helpers.calculateDiscountPrice = function(originalPrice, discountPercent) {
  if (typeof originalPrice !== 'number' || typeof discountPercent !== 'number') {
    return originalPrice;
  }
  
  const discountAmount = originalPrice * (discountPercent / 100);
  return Math.max(0, originalPrice - discountAmount);
}

/**
 * Get responsive image URL based on screen size
 * @param {string} baseUrl - Base image URL
 * @param {number} screenWidth - Screen width
 * @returns {string} Responsive image URL
 */
window.Helpers.getResponsiveImageUrl = function(baseUrl, screenWidth) {
  if (!baseUrl) return '';
  
  let size = 'sm';
  if (screenWidth >= 1200) size = 'xl';
  else if (screenWidth >= 992) size = 'lg';
  else if (screenWidth >= 768) size = 'md';
  
  return baseUrl.replace(/\.(jpg|jpeg|png|webp)$/i, `_${size}.$1`);
}

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value
 * @returns {any} Parsed object or fallback
 */
window.Helpers.safeJsonParse = function(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Create a promise that resolves after specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
window.Helpers.delay = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get nested object property safely
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Property value or default
 */
window.Helpers.getNestedProperty = function(obj, path, defaultValue = undefined) {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Set nested object property safely
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-separated path
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
window.Helpers.setNestedProperty = function(obj, path, value) {
  if (!obj || !path) return obj;
  
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
};

// Log successful initialization
console.log('✅ Helpers v2.0.0 - Enhanced Edition loaded successfully');

// Also provide backward compatibility for existing code that might expect individual functions
if (typeof window !== 'undefined') {
  // Export individual functions to global scope for backward compatibility
  window.debounce = window.Helpers.debounce;
  window.throttle = window.Helpers.throttle;
  window.deepClone = window.Helpers.deepClone;
  window.isEmpty = window.Helpers.isEmpty;
  window.generateId = window.Helpers.generateId;
  window.isValidEmail = window.Helpers.isValidEmail;
  window.isValidPhone = window.Helpers.isValidPhone;
  window.formatPrice = window.Helpers.formatPrice;
  window.formatDate = window.Helpers.formatDate;
  window.calculateDeliveryTime = window.Helpers.calculateDeliveryTime;
  window.truncateText = window.Helpers.truncateText;
  window.capitalizeWords = window.Helpers.capitalizeWords;
  window.calculateDiscountPrice = window.Helpers.calculateDiscountPrice;
  window.getResponsiveImageUrl = window.Helpers.getResponsiveImageUrl;
  window.safeJsonParse = window.Helpers.safeJsonParse;
  window.delay = window.Helpers.delay;
  window.getNestedProperty = window.Helpers.getNestedProperty;
  window.setNestedProperty = window.Helpers.setNestedProperty;
}
