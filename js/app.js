/**
 * FoodNow Food Ordering Website - Main Application
 * 
 * This is the main entry point for the Vue 3 application.
 * It initializes the Vue app, registers components, and mounts the app to the DOM.
 */

// Initialize AuthService
AuthService.init().then(() => {
  console.log('AuthService initialized');
}).catch(error => {
  console.error('Error initializing AuthService:', error);
});

// Create the Vue application instance and make it globally available
window.app = Vue.createApp({
  data() {
    return {
      // Global app state can go here if needed
      appName: 'FoodNow',
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

// The router will be used once it's loaded
// The app is mounted in router.js after the router is fully configured