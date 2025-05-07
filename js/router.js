/**
 * FoodNow - In-Restaurant Food Ordering Platform - Router Configuration
 * 
 * This file configures the Vue Router with all application routes.
 * It sets up the main pages for the digital menu and ordering system.
 */

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: window.HomePage,
    meta: {
      title: 'FoodNow - Digital Restaurant Menu'
    }
  },
  {
    path: '/product',
    name: 'Menu',
    component: window.ProductPage,
    meta: {
      title: 'Our Menu - FoodNow'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetails',
    component: window.ProductPage,
    props: true,
    meta: {
      title: 'Menu Item Details - FoodNow'
    }
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: window.ShoppingCart,
    meta: {
      title: 'Your Order - FoodNow'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: window.RegisterPage,
    meta: {
      title: 'Create Account - FoodNow',
      guest: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: window.LoginPage,
    meta: {
      title: 'Sign In - FoodNow',
      guest: true
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: window.AccountPage,
    meta: {
      title: 'My Account - FoodNow',
      requiresAuth: true
    }
  },
  {
    path: '/purchases',
    name: 'Purchases',
    component: window.PurchasesPage,
    meta: {
      title: 'My Order History - FoodNow',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: `
        <div class="text-center my-5">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        </div>
      `
    },
    meta: {
      title: 'Page Not Found - FoodNow'
    }
  }
];

// Create router instance
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when navigating
    return { top: 0 };
  }
});

// Navigation guards for authentication and title updates
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'FoodNow - Digital Restaurant Menu';
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This is a simple check - in a real app, use a proper auth service
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } 
  // Check if route is for guests only (like login/register)
  else if (to.matched.some(record => record.meta.guest)) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      next({ path: '/account' });
    } else {
      next();
    }
  } 
  else {
    next();
  }
});

// Make the router globally accessible
window.router = router;

// Use the router and mount the app
window.app.use(router);
window.app.mount('#app');