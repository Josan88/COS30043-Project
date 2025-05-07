/**
 * CartService
 * Manages shopping cart functionality for food ordering
 */
class CartService {
  constructor() {
    this.cart = [];
    this.loadCart();
    this.eventListeners = {};
  }

  /**
   * Load cart data from localStorage
   */
  loadCart() {
    try {
      const savedCart = localStorage.getItem('foodCart');
      if (savedCart) {
        this.cart = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cart = [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem('foodCart', JSON.stringify(this.cart));
      this.notifyListeners('update', this.cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Get all items in the cart
   */
  getCart() {
    return this.cart;
  }

  /**
   * Add a food item to the cart
   * @param {Object} item - The food item to add
   * @param {Number} quantity - Quantity to add (default: 1)
   * @param {Object} options - Special instructions and customization options
   */
  addToCart(item, quantity = 1, options = {}) {
    // Check if item already exists in cart with same options
    const existingItemIndex = this.findItemInCart(item.id, options);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      this.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: quantity,
        specialInstructions: options.specialInstructions || '',
        customizations: options.customizations || [],
        options: options.options || {},
        subTotal: item.price * quantity
      });
    }
    
    this.updateCartTotals();
    this.saveCart();
    
    return this.cart;
  }

  /**
   * Update quantity of an item in the cart
   */
  updateCartItemQuantity(index, quantity) {
    if (index >= 0 && index < this.cart.length) {
      if (quantity > 0) {
        this.cart[index].quantity = quantity;
        this.cart[index].subTotal = this.cart[index].price * quantity;
      } else {
        // Remove item if quantity is zero or negative
        this.removeFromCart(index);
        return this.cart;
      }
      
      this.updateCartTotals();
      this.saveCart();
    }
    
    return this.cart;
  }

  /**
   * Remove an item from the cart
   */
  removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.updateCartTotals();
      this.saveCart();
    }
    
    return this.cart;
  }

  /**
   * Update special instructions for a cart item
   */
  updateSpecialInstructions(index, instructions) {
    if (index >= 0 && index < this.cart.length) {
      this.cart[index].specialInstructions = instructions;
      this.saveCart();
    }
    
    return this.cart;
  }

  /**
   * Update customizations for a food item in the cart
   */
  updateItemCustomizations(index, customizations) {
    if (index >= 0 && index < this.cart.length) {
      this.cart[index].customizations = customizations;
      
      // Recalculate price with customizations
      let basePrice = this.cart[index].price;
      
      // Add cost of customizations if they have a price
      customizations.forEach(custom => {
        if (custom.price) {
          basePrice += custom.price;
        }
      });
      
      this.cart[index].price = basePrice;
      this.cart[index].subTotal = basePrice * this.cart[index].quantity;
      
      this.updateCartTotals();
      this.saveCart();
    }
    
    return this.cart;
  }

  /**
   * Find an item in the cart by ID and options
   */
  findItemInCart(itemId, options = {}) {
    return this.cart.findIndex(cartItem => {
      if (cartItem.id !== itemId) {
        return false;
      }
      
      // Check if special instructions match
      if ((cartItem.specialInstructions || '') !== (options.specialInstructions || '')) {
        return false;
      }
      
      // Check if customizations match
      const cartCustomizations = cartItem.customizations || [];
      const newCustomizations = options.customizations || [];
      
      if (cartCustomizations.length !== newCustomizations.length) {
        return false;
      }
      
      // Compare customizations
      for (let i = 0; i < cartCustomizations.length; i++) {
        if (cartCustomizations[i].id !== newCustomizations[i].id) {
          return false;
        }
      }
      
      // Check if other options match
      const cartOptions = cartItem.options || {};
      const newOptions = options.options || {};
      
      // Compare option keys
      const cartOptKeys = Object.keys(cartOptions);
      const newOptKeys = Object.keys(newOptions);
      
      if (cartOptKeys.length !== newOptKeys.length) {
        return false;
      }
      
      for (const key of cartOptKeys) {
        if (cartOptions[key] !== newOptions[key]) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Clear all items from the cart
   */
  clearCart() {
    this.cart = [];
    this.updateCartTotals();
    this.saveCart();
    return this.cart;
  }

  /**
   * Calculate cart totals, taxes, and delivery fees
   */
  updateCartTotals() {
    // Calculate subtotal
    const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate tax (assume 10%)
    const tax = subtotal * 0.1;
    
    // Calculate delivery fee (assume $2.99 for orders under $15, free otherwise)
    const deliveryFee = subtotal < 15 ? 2.99 : 0;
    
    // Total with tax and delivery fee
    const total = subtotal + tax + deliveryFee;
    
    // Save totals
    this.totals = {
      subtotal,
      tax,
      deliveryFee,
      total
    };
    
    return this.totals;
  }

  /**
   * Get cart totals
   */
  getCartTotals() {
    this.updateCartTotals();
    return this.totals;
  }

  /**
   * Get number of items in cart
   */
  getCartCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Check if cart has specific item
   */
  hasItem(itemId) {
    return this.cart.some(item => item.id === itemId);
  }

  /**
   * Get estimated delivery time
   */
  getEstimatedDeliveryTime() {
    // Calculate random delivery time between 20-40 minutes
    const minTime = 20;
    const maxTime = 40;
    const deliveryTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    // Create delivery time date object
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + deliveryTime * 60000);
    
    return {
      minutes: deliveryTime,
      estimatedTime: deliveryDate
    };
  }

  /**
   * Get available delivery options
   */
  getDeliveryOptions() {
    return [
      { 
        id: 'standard', 
        name: 'Standard Delivery', 
        price: this.totals.subtotal < 15 ? 2.99 : 0,
        estimatedTime: '30-45 min'
      },
      { 
        id: 'express', 
        name: 'Express Delivery', 
        price: 4.99,
        estimatedTime: '15-25 min'
      },
      { 
        id: 'pickup', 
        name: 'Self Pickup', 
        price: 0,
        estimatedTime: '15 min'
      }
    ];
  }

  /**
   * Submit the food order
   */
  async submitOrder(orderDetails) {
    try {
      // Add cart items to the order
      orderDetails.items = this.cart;
      orderDetails.totals = this.totals;
      orderDetails.orderDate = new Date().toISOString();
      orderDetails.orderNumber = this.generateOrderNumber();
      
      // Generate estimated delivery/pickup time
      const deliveryInfo = this.getEstimatedDeliveryTime();
      orderDetails.estimatedDelivery = deliveryInfo.estimatedTime;
      orderDetails.estimatedMinutes = deliveryInfo.minutes;
      
      // Submit order to database service
      const savedOrder = await DatabaseService.saveOrder(orderDetails);
      
      // Clear cart after successful order
      this.clearCart();
      
      // Notify listeners about successful order
      this.notifyListeners('orderPlaced', savedOrder);
      
      return savedOrder;
    } catch (error) {
      console.error('Error submitting order:', error);
      // Save order to local storage as fallback
      const savedOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      
      const localOrder = {
        ...orderDetails,
        items: this.cart,
        totals: this.totals,
        orderDate: new Date().toISOString(),
        orderNumber: this.generateOrderNumber(),
        id: Date.now().toString()
      };
      
      savedOrders.push(localOrder);
      localStorage.setItem('foodOrders', JSON.stringify(savedOrders));
      
      // Clear cart after successful local order
      this.clearCart();
      
      // Notify listeners
      this.notifyListeners('orderPlaced', localOrder);
      
      return localOrder;
    }
  }

  /**
   * Generate a random order number
   */
  generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FO-${timestamp}-${random}`;
  }

  /**
   * Get all orders for a specific user
   * @param {String|Number} userId - ID of the user to get orders for
   * @return {Array} Array of user's orders
   */
  getUserOrders(userId) {
    try {
      // Try to load orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      
      // Filter orders by userId
      return allOrders.filter(order => order.userId === userId || order.user?.id === userId);
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Get a specific order by ID
   * @param {String|Number} orderId - ID of the order to retrieve
   * @return {Object|null} Order object or null if not found
   */
  getOrder(orderId) {
    try {
      // Try to load orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      
      // Find the specific order
      return allOrders.find(order => order.id.toString() === orderId.toString() || 
                                     order.orderNumber === orderId.toString());
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  /**
   * Cancel an existing order
   * @param {String|Number} orderId - ID of the order to cancel
   * @return {Object} Result of the cancellation
   */
  cancelOrder(orderId) {
    try {
      // Load all orders
      const allOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      
      // Find the order
      const orderIndex = allOrders.findIndex(order => 
        order.id.toString() === orderId.toString() || 
        order.orderNumber === orderId.toString()
      );
      
      if (orderIndex === -1) {
        return { success: false, message: 'Order not found' };
      }
      
      // Check if order is in a state that can be cancelled
      const order = allOrders[orderIndex];
      if (!['pending', 'confirmed'].includes(order.status)) {
        return { 
          success: false, 
          message: 'Cannot cancel order in current status: ' + order.status 
        };
      }
      
      // Update order status to cancelled
      order.status = 'cancelled';
      order.statusUpdates = order.statusUpdates || {};
      order.statusUpdates.cancelled = new Date().toISOString();
      order.cancellationReason = 'Cancelled by customer';
      
      // Save updated orders list
      localStorage.setItem('foodOrders', JSON.stringify(allOrders));
      
      // Notify listeners
      this.notifyListeners('orderCancelled', order);
      
      return { success: true, order };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, message: 'An error occurred while cancelling the order' };
    }
  }

  /**
   * Update a specific user order in storage
   * @param {Object} updatedOrder - The order object with updated information
   * @return {Boolean} Success status of the update operation
   */
  updateUserOrder(updatedOrder) {
    try {
      // Load all orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      
      // Find the order index
      const orderIndex = allOrders.findIndex(order => 
        order.id.toString() === updatedOrder.id.toString() || 
        order.orderNumber === updatedOrder.orderNumber
      );
      
      if (orderIndex === -1) {
        console.error('Order not found for update:', updatedOrder.id);
        return false;
      }
      
      // Update the order
      allOrders[orderIndex] = updatedOrder;
      
      // Save back to localStorage
      localStorage.setItem('foodOrders', JSON.stringify(allOrders));
      
      // Notify listeners about the updated order
      this.notifyListeners('orderUpdated', updatedOrder);
      
      return true;
    } catch (error) {
      console.error('Error updating user order:', error);
      return false;
    }
  }

  /**
   * Add event listener for cart changes
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify event listeners
   */
  notifyListeners(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cart event listener (${event}):`, error);
        }
      });
    }
  }

  /**
   * Get cart items with product details
   * This enhances the cart items with full product details from ProductService
   */
  getCartWithDetails() {
    // First get the current cart
    const cartItems = this.getCart();
    
    // If cart is empty, return empty array
    if (!cartItems.length) return [];
    
    // For each cart item, fetch full product details from ProductService
    return cartItems.map(item => {
      try {
        // Get full product details from ProductService using the correct method name
        const productDetails = window.ProductService.getProductById(item.id);
        
        // Return a promise since getProductById is async
        return Promise.resolve(productDetails)
          .then(details => {
            // If product details found, merge with cart item
            if (details) {
              return {
                ...details,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions || '',
                subTotal: item.price * item.quantity
              };
            }
            // If product not found, return original cart item
            return item;
          })
          .catch(error => {
            console.error(`Error resolving product details for ${item.id}:`, error);
            return item;
          });
      } catch (error) {
        console.error(`Error getting details for product ${item.id}:`, error);
        return item;
      }
    });
  }
}

// Create and expose singleton instance as global variable
window.CartService = new CartService();