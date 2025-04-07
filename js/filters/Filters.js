// Custom Vue Filters
// These filters help format data consistently across the application

// Global function to register all filters
function registerFilters(app) {
  // Currency Filter - Format numbers as currency with $ symbol
  app.config.globalProperties.$filters = {
    // Currency Filter
    currency: function(value) {
      if (typeof value !== 'number') {
        return value;
      }
      return '$' + value.toFixed(2);
    },

    // Date Filter - Format date in a readable way
    formatDate: function(value) {
      if (!value) return '';
      
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    // Short Date Filter - Format date in a compact way (MM/DD/YYYY)
    shortDate: function(value) {
      if (!value) return '';
      
      const date = new Date(value);
      return date.toLocaleDateString('en-US');
    },

    // Time Filter - Extract time from a date
    formatTime: function(value) {
      if (!value) return '';
      
      const date = new Date(value);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Stars Rating Filter - Convert a numeric rating to stars
    stars: function(value) {
      if (typeof value !== 'number') {
        return '';
      }
      
      // Round to nearest half
      const rounded = Math.round(value * 2) / 2;
      let stars = '';
      
      // Add full stars
      for (let i = 1; i <= Math.floor(rounded); i++) {
        stars += '★';
      }
      
      // Add half star if needed
      if (rounded % 1 !== 0) {
        stars += '½';
      }
      
      // Add empty stars
      const emptyStars = 5 - Math.ceil(rounded);
      for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
      }
      
      return stars;
    },

    // Truncate Filter - Limit text length with ellipsis
    truncate: function(text, length, suffix) {
      if (text === null || text === undefined) return '';
      if (typeof text !== 'string') text = text.toString();
      
      if (text.length <= length) return text;
      
      return text.substring(0, length) + (suffix || '...');
    },

    // Capitalize Filter - Capitalize first letter
    capitalize: function(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },

    // Title Case Filter - Capitalize each word in a string
    titleCase: function(value) {
      if (!value) return '';
      value = value.toString();
      return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },

    // Phone Number Filter - Format US phone numbers
    phoneFormat: function(phone) {
      if (!phone) return '';
      
      // Strip any non-numeric characters
      const cleaned = ('' + phone).replace(/\D/g, '');
      
      // Check if it's a valid US phone number
      if (cleaned.length !== 10) return phone;
      
      // Format as (XXX) XXX-XXXX
      return '(' + cleaned.substring(0, 3) + ') ' + cleaned.substring(3, 6) + '-' + cleaned.substring(6, 10);
    },

    // Status Filter - Convert status codes to readable text
    status: function(value) {
      const statuses = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded'
      };
      
      return statuses[value.toLowerCase()] || value;
    },

    // Pluralize Filter - Add appropriate plural suffix
    pluralize: function(count, singular, plural) {
      return count === 1 ? `${count} ${singular}` : `${count} ${plural || singular + 's'}`;
    }
  };
}