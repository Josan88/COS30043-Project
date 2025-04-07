// Import Store from store/Store.js
import Store from './store/Store.js';

// Wait for both Vue and Vue Router to be available
document.addEventListener('DOMContentLoaded', () => {
  // Make sure Vue is fully loaded before using plugins
  if (typeof Vue === 'undefined') {
    console.error('Vue is not loaded!');
    return;
  }

  // Explicitly install Vue Router
  if (typeof VueRouter !== 'undefined') {
    Vue.use(VueRouter);
  } else {
    console.error('Vue Router is not loaded!');
  }

  // Create router instance
  const router = new VueRouter({
    routes: [
      // Define your routes here
      // Example:
      // { path: '/', component: Home },
      // { path: '/products', component: Products },
    ]
  });

  // Create and mount the Vue application
  new Vue({
    el: '#app', // Mount to element with id="app"
    router,     // Use the router
    data: {
      store: Store // Make store accessible in components
    }
  });
});
