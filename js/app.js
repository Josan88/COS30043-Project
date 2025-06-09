/**
 * FoodNow Food Ordering Website - Main Application
 *
 * This is the main entry point for the Vue 3 application.
 * It initializes the Vue app, registers components, and mounts the app to the DOM.
 */

// Initialize AuthService
AuthService.init()
  .then(() => {
    console.log("AuthService initialized");
  })
  .catch((error) => {
    console.error("Error initializing AuthService:", error);
  });

// Wait for all services to be loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Services Status:", {
    AuthService: typeof window.AuthService !== "undefined",
    CartService: typeof window.CartService !== "undefined",
    ProductService: typeof window.ProductService !== "undefined",
    DatabaseService: typeof window.DatabaseService !== "undefined",
    ErrorHandler: typeof window.ErrorHandler !== "undefined",
  });
});

// Create the Vue application instance and make it globally available
window.app = Vue.createApp({
  data() {
    return {
      // Global app state can go here if needed
      appName: "FoodNow",
      isLoading: false,
    };
  },
  // Global app methods can go here
  methods: {
    showLoader() {
      this.isLoading = true;
    },
    hideLoader() {
      this.isLoading = false;
    },
  },
});

// Register global custom directives
window.app.directive("focus", {
  mounted(el) {
    el.focus();
  },
});

// Function to register filters as global properties
function registerFilters() {
  if (window.Filters) {
    // Register filters as global properties for Vue 3
    window.app.config.globalProperties.$filters = window.Filters;

    // Make individual filters available directly
    Object.keys(window.Filters).forEach((filterName) => {
      window.app.config.globalProperties[`$${filterName}`] =
        window.Filters[filterName];
    });

    console.log(
      "Filters registered successfully:",
      Object.keys(window.Filters)
    );

    // Verify the currency filter specifically
    if (window.app.config.globalProperties.$currency) {
      console.log(
        "Currency filter test:",
        window.app.config.globalProperties.$currency(25.5)
      );
    }

    return true;
  } else {
    console.warn("Filters not loaded yet, retrying...");
    return false;
  }
}

// Register filters immediately if they're already available
if (window.Filters) {
  registerFilters();
}

// Wait for DOM content to be loaded before registering filters
document.addEventListener("DOMContentLoaded", () => {
  // Try to register filters immediately, and retry if needed
  if (!registerFilters()) {
    // If filters aren't loaded yet, wait for them
    let retryCount = 0;
    const maxRetries = 50; // Increased retries
    const filterCheckInterval = setInterval(() => {
      if (registerFilters() || retryCount >= maxRetries) {
        clearInterval(filterCheckInterval);
        if (retryCount >= maxRetries) {
          console.error("Failed to load filters after maximum retries");
        } else {
          console.log(
            "Filters loaded successfully after",
            retryCount,
            "retries"
          );
        }
      }
      retryCount++;
    }, 50); // Reduced interval for faster checking
  }
});

// The router will be used once it's loaded
// The app is mounted in router.js after the router is fully configured
