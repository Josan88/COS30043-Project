/**
 * TechWorld E-Commerce Store - Router Configuration
 * 
 * This file configures the Vue Router with all application routes.
 * It sets up the 7 main pages and any additional sub-routes.
 */

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: window.HomePage,
    meta: {
      title: 'TechWorld - Your Technology Destination'
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: window.ProductPage,
    meta: {
      title: 'Products - TechWorld'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetails',
    component: window.ProductPage,
    props: true,
    meta: {
      title: 'Product Details - TechWorld'
    }
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: window.ShoppingCart,
    meta: {
      title: 'Your Cart - TechWorld'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: window.RegisterPage,
    meta: {
      title: 'Create Account - TechWorld',
      guest: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: window.LoginPage,
    meta: {
      title: 'Sign In - TechWorld',
      guest: true
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: window.AccountPage,
    meta: {
      title: 'My Account - TechWorld',
      requiresAuth: true
    }
  },
  {
    path: '/purchases',
    name: 'Purchases',
    component: window.PurchasesPage,
    meta: {
      title: 'My Purchases - TechWorld',
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
      title: 'Page Not Found - TechWorld'
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
  document.title = to.meta.title || 'TechWorld';
  
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