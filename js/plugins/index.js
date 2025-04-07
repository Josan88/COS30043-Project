// ShopEase - Plugin Registration
// This file centralizes the registration of filters and directives for Vue 3 compatibility

// Import filters and directives
import { registerFilters } from '../filters/Filters.js';
import { registerDirectives } from '../directives/Directives.js';

// Plugin installer
export default {
  install(app) {
    // Register all filters as global properties
    registerFilters(app);
    
    // Register all directives
    registerDirectives(app);
  }
};
