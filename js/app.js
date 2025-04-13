/**
 * TechWorld E-Commerce Store - Main Application
 * 
 * This is the main entry point for the Vue 3 application.
 * It initializes the Vue app, registers components, and mounts the app to the DOM.
 */

// Create the Vue application instance and make it globally available
window.app = Vue.createApp({
  data() {
    return {
      // Global app state can go here if needed
      appName: 'TechWorld',
      isLoading: false
    };
  },
  // Global app methods can go here
  methods: {
    showLoader() {
      this.isLoading = true;
    },
    hideLoader() {
      this.isLoading = false;
    }
  }
});

// Register global custom directives
window.app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// Register global filters
window.app.config.globalProperties.$filters = {
  // Format price to currency
  currency(value) {
    if (typeof value !== 'number') {
      return value;
    }
    return 'RM' + value.toFixed(2);
  },
  
  // Truncate text if it's too long
  truncate(text, length, suffix) {
    if (text.length <= length) {
      return text;
    }
    return text.substring(0, length) + (suffix || '...');
  }
};

// The router will be used once it's loaded
// The app is mounted in router.js after the router is fully configured