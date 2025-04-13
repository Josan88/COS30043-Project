// Store.js - Central data store for the e-commerce application
// Using a simple store pattern (not Vuex)

const Store = {
  state: {
    cart: [],
    wishlist: [],
    isAuthenticated: false,
    user: null,
    notifications: []
  },
  
  getters: {
    cartCount() {
      return Store.state.cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    cartTotal() {
      return Store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    isInWishlist(productId) {
      return Store.state.wishlist.some(item => item.id === productId);
    }
  },
  
  mutations: {
    addToCart(product) {
      const cartItem = Store.state.cart.find(item => item.id === product.id);
      
      if (cartItem) {
        // Product exists, increment quantity
        cartItem.quantity += product.quantity || 1;
      } else {
        // Add new product to cart
        Store.state.cart.push({
          ...product,
          quantity: product.quantity || 1
        });
      }
    },
    
    updateCartItemQuantity(productId, quantity) {
      const cartItem = Store.state.cart.find(item => item.id === productId);
      
      if (cartItem) {
        cartItem.quantity = quantity;
      }
    },
    
    removeFromCart(productId) {
      const index = Store.state.cart.findIndex(item => item.id === productId);
      
      if (index !== -1) {
        Store.state.cart.splice(index, 1);
      }
    },
    
    clearCart() {
      Store.state.cart = [];
    },
    
    addToWishlist(product) {
      if (!Store.getters.isInWishlist(product.id)) {
        Store.state.wishlist.push(product);
      }
    },
    
    removeFromWishlist(productId) {
      const index = Store.state.wishlist.findIndex(item => item.id === productId);
      
      if (index !== -1) {
        Store.state.wishlist.splice(index, 1);
      }
    },
    
    login(userData) {
      console.log('Store: login mutation called with user:', userData.name);
      Store.state.isAuthenticated = true;
      Store.state.user = userData;
      console.log('Authentication state updated:', Store.state.isAuthenticated);
    },
    
    logout() {
      console.log('Store: logout mutation called');
      Store.state.isAuthenticated = false;
      Store.state.user = null;
      console.log('Authentication state updated:', Store.state.isAuthenticated);
    },
    
    addNotification(message) {
      const id = Date.now();
      Store.state.notifications.push({
        id,
        message,
        timestamp: new Date()
      });
      
      // Auto-remove notification after delay
      setTimeout(() => {
        Store.mutations.removeNotification(id);
      }, 5000);
    },
    
    removeNotification(id) {
      const index = Store.state.notifications.findIndex(n => n.id === id);
      
      if (index !== -1) {
        Store.state.notifications.splice(index, 1);
      }
    }
  }
};

// Add a global reference instead of exporting
window.Store = Store;