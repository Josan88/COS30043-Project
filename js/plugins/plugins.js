// ShopEase - Plugin Registration
// This file centralizes the registration of filters and directives for Vue 3 compatibility

// Plugin installer for Vue
const ShopEasePlugins = {
  install(app) {
    // Register all filters as global properties
    registerFilters(app);
    
    // Register all directives
    registerDirectives(app);
  }
};

// Make ShopEasePlugins available globally
window.ShopEasePlugins = ShopEasePlugins;