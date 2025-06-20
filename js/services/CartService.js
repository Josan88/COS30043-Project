/**
 * CartService
 * Manages shopping cart functionality for food ordering
 * Improved structure with better error handling and constants
 */
class CartService {
  constructor() {
    this.cart = [];
    this.totals = {
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
    };
    this.eventListeners = {}; // Configuration constants
    this.config = {
      TAX_RATE: 0.1,
      FREE_DELIVERY_THRESHOLD: 15,
      DELIVERY_FEE: 2.99,
      STORAGE_KEY: "foodCart",
      ORDERS_STORAGE_KEY: "foodOrders",
    };

    this.loadCart();
  }

  /**
   * Get user-specific storage key for cart data
   * @returns {string} User-specific storage key
   */
  getUserStorageKey() {
    try {
      // Check if AuthService is available and user is logged in
      if (typeof AuthService !== "undefined" && AuthService.isLoggedIn()) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.email) {
          return `${this.config.STORAGE_KEY}_${currentUser.email}`;
        }
      }
      // Fallback to generic key for anonymous users
      return `${this.config.STORAGE_KEY}_anonymous`;
    } catch (error) {
      console.error("Error getting user storage key:", error);
      return `${this.config.STORAGE_KEY}_anonymous`;
    }
  }

  /**
   * Get user-specific storage key for orders data
   * @returns {string} User-specific orders storage key
   */
  getUserOrdersStorageKey() {
    try {
      // Check if AuthService is available and user is logged in
      if (typeof AuthService !== "undefined" && AuthService.isLoggedIn()) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.email) {
          return `${this.config.ORDERS_STORAGE_KEY}_${currentUser.email}`;
        }
      }
      // Fallback to generic key for anonymous users
      return `${this.config.ORDERS_STORAGE_KEY}_anonymous`;
    } catch (error) {
      console.error("Error getting user orders storage key:", error);
      return `${this.config.ORDERS_STORAGE_KEY}_anonymous`;
    }
  }
  /**
   * Load cart data from localStorage with error handling
   */
  loadCart() {
    try {
      const userStorageKey = this.getUserStorageKey();
      const savedCart = localStorage.getItem(userStorageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        this.cart = Array.isArray(parsedCart) ? parsedCart : [];
        this.updateCartTotals();
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      this.cart = [];
      this.clearCorruptedStorage();
    }
  }
  /**
   * Clear corrupted storage data
   * @private
   */
  clearCorruptedStorage() {
    try {
      const userStorageKey = this.getUserStorageKey();
      localStorage.removeItem(userStorageKey);
      console.log("Corrupted cart data cleared for current user");
    } catch (error) {
      console.error("Error clearing corrupted storage:", error);
    }
  }
  /**
   * Save cart to localStorage with error handling
   */
  saveCart() {
    try {
      const userStorageKey = this.getUserStorageKey();
      const cartData = JSON.stringify(this.cart);
      localStorage.setItem(userStorageKey, cartData);
      this.notifyListeners("update", this.cart);
    } catch (error) {
      console.error("Error saving cart:", error);
      this.handleStorageError(error);
    }
  }

  /**
   * Handle storage errors gracefully
   * @private
   * @param {Error} error - Storage error
   */
  handleStorageError(error) {
    // Check if storage quota exceeded
    if (error.name === "QuotaExceededError") {
      console.warn("Storage quota exceeded. Consider clearing old data.");
      this.notifyListeners("storage-error", { type: "quota-exceeded" });
    } else {
      console.error("Storage error:", error);
      this.notifyListeners("storage-error", { type: "general", error });
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
   */ /**
   * Validate stock availability for an item
   * @param {Object} item - The product item
   * @param {Number} quantity - Requested quantity
   * @returns {Boolean} - True if stock is sufficient
   */ validateStock(item, quantity) {
    // Check if item has stock property
    if (typeof item.stock !== "number") {
      // Try to get stock from ProductService if available
      if (window.ProductService && item.id) {
        try {
          const productWithStock = window.ProductService.getProductById(
            item.id
          );
          if (productWithStock && typeof productWithStock.stock === "number") {
            item.stock = productWithStock.stock; // Update the item with stock info
            return productWithStock.stock >= quantity;
          }
        } catch (error) {
          console.warn(`Could not fetch stock for product ${item.id}:`, error);
        }
      }

      // Only log warning in development environment to reduce console noise
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        console.warn(
          `Product ${item.name || "Unknown"} (ID: ${
            item.id
          }) missing stock information, allowing add to cart`
        );
      }
      return true; // Allow if stock info is missing (backward compatibility)
    }

    // Check if stock is sufficient
    return item.stock >= quantity;
  }

  /**
   * Get product details with stock information
   * @param {Number} productId - The product ID
   * @returns {Object|null} - Product with stock info or null if not found
   */
  async getProductWithStock(productId) {
    try {
      if (window.ProductService) {
        const product = await window.ProductService.getProductById(productId);
        return product;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  }

  addItem(item, quantity = 1, options = {}) {
    return this.addToCart(item, quantity, options);
  }
  /**
   * Add a food item to the cart
   * @param {Object} item - The food item to add
   * @param {Number} quantity - Quantity to add (default: 1)
   * @param {Object} options - Special instructions and customization options
   */
  addToCart(item, quantity = 1, options = {}) {
    // Validate input parameters
    if (!item || typeof item !== "object") {
      const error = new Error("Invalid item: item must be a valid object");
      error.code = "INVALID_ITEM";
      throw error;
    }

    if (!item.id) {
      const error = new Error(
        `Invalid item: missing required ID. Item: ${JSON.stringify(item)}`
      );
      error.code = "MISSING_ITEM_ID";
      throw error;
    }

    if (!item.name) {
      const error = new Error(
        `Invalid item: missing required name for item ID ${item.id}`
      );
      error.code = "MISSING_ITEM_NAME";
      throw error;
    }

    if (typeof item.price !== "number" || item.price < 0) {
      const error = new Error(
        `Invalid item: invalid price for item ${item.name} (ID: ${item.id})`
      );
      error.code = "INVALID_ITEM_PRICE";
      throw error;
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      const error = new Error(
        `Invalid quantity: must be a positive number, got ${quantity}`
      );
      error.code = "INVALID_QUANTITY";
      throw error;
    }

    // Check stock availability
    if (!this.validateStock(item, quantity)) {
      const error = new Error(
        `Insufficient stock for ${item.name}. Available: ${item.stock || 0}`
      );
      error.code = "INSUFFICIENT_STOCK";
      error.available = item.stock || 0;
      error.requested = quantity;
      throw error;
    }

    // Check if item already exists in cart with same options
    const existingItemIndex = this.findItemInCart(item.id, options);

    if (existingItemIndex !== -1) {
      // Check if total quantity (existing + new) exceeds stock
      const totalQuantity = this.cart[existingItemIndex].quantity + quantity;
      if (!this.validateStock(item, totalQuantity)) {
        const error = new Error(
          `Cannot add ${quantity} items. Available: ${
            item.stock || 0
          }, In cart: ${this.cart[existingItemIndex].quantity}`
        );
        error.code = "INSUFFICIENT_STOCK";
        error.available = item.stock || 0;
        error.inCart = this.cart[existingItemIndex].quantity;
        error.requested = quantity;
        throw error;
      }

      // Update quantity if item already exists
      this.cart[existingItemIndex].quantity += quantity;
      this.cart[existingItemIndex].subTotal =
        this.cart[existingItemIndex].price *
        this.cart[existingItemIndex].quantity;
    } else {
      // Add new item to cart
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || "",
        quantity: quantity,
        specialInstructions: options.specialInstructions || "",
        customizations: options.customizations || [],
        options: options.options || {},
        subTotal: item.price * quantity,
      });
    }

    this.updateCartTotals();
    this.saveCart();

    return this.cart;
  }
  /**
   * Update quantity of an item in the cart
   */
  async updateCartItemQuantity(index, quantity) {
    if (index >= 0 && index < this.cart.length) {
      if (quantity > 0) {
        // Get current cart item
        const cartItem = this.cart[index];

        // Get fresh product data with stock info
        const productWithStock = await this.getProductWithStock(cartItem.id);

        if (productWithStock) {
          // Validate stock availability
          if (!this.validateStock(productWithStock, quantity)) {
            const error = new Error(
              `Cannot update quantity to ${quantity}. Available: ${
                productWithStock.stock || 0
              }`
            );
            error.code = "INSUFFICIENT_STOCK";
            error.available = productWithStock.stock || 0;
            error.requested = quantity;
            error.currentQuantity = cartItem.quantity;
            throw error;
          }
        }

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
   * Update quantity of an item in the cart by ID
   */
  async updateQuantity(itemId, quantity) {
    const itemIndex = this.cart.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      return await this.updateCartItemQuantity(itemIndex, quantity);
    }

    return this.cart;
  }

  /**
   * Update the entire cart with new cart items
   */
  updateCart(cartItems) {
    this.cart = Array.isArray(cartItems) ? cartItems : [];
    this.updateCartTotals();
    this.saveCart();
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
      customizations.forEach((custom) => {
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
   * Update customizations for a food item in the cart by ID
   */
  updateItemCustomization(itemId, customizedItem) {
    const itemIndex = this.cart.findIndex((item) => item.id === itemId);
    if (itemIndex >= 0) {
      // Store the original base price if not already stored
      if (!this.cart[itemIndex].basePrice) {
        this.cart[itemIndex].basePrice = this.cart[itemIndex].price;
      }

      // Update the item with new customizations
      this.cart[itemIndex] = { ...this.cart[itemIndex], ...customizedItem };

      // Recalculate price with customizations
      let basePrice =
        this.cart[itemIndex].basePrice ||
        customizedItem.basePrice ||
        customizedItem.price;

      // Handle new customization format (from CustomizationModal)
      if (
        customizedItem.customization &&
        customizedItem.customization.extraPrice
      ) {
        basePrice += customizedItem.customization.extraPrice;
      }
      // Handle legacy customizations format
      else if (customizedItem.customizations) {
        customizedItem.customizations.forEach((custom) => {
          if (custom.price) {
            basePrice += custom.price;
          }
        });
      }

      this.cart[itemIndex].price = basePrice;
      this.cart[itemIndex].subTotal = basePrice * this.cart[itemIndex].quantity;
      this.updateCartTotals();
      this.saveCart();
      this.notifyListeners("update", this.cart);
    }

    return this.cart;
  }

  /**
   * Find an item in the cart by ID and options
   */
  findItemInCart(itemId, options = {}) {
    return this.cart.findIndex((cartItem) => {
      if (cartItem.id !== itemId) {
        return false;
      }

      // Check if special instructions match
      if (
        (cartItem.specialInstructions || "") !==
        (options.specialInstructions || "")
      ) {
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
   * Handle user login - load user-specific cart
   * This should be called when a user logs in
   */
  onUserLogin() {
    try {
      // Clear current cart
      this.cart = [];
      this.totals = { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };

      // Load user-specific cart
      this.loadCart();

      // Notify listeners about cart change
      this.notifyListeners("update", this.cart);

      // Trigger global cart-updated event for navbar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart-updated", { detail: this.cart })
        );
      }

      console.log("Cart loaded for logged-in user");
    } catch (error) {
      console.error("Error handling user login:", error);
    }
  }

  /**
   * Handle user logout - clear current cart and switch to anonymous cart
   * This should be called when a user logs out
   */
  onUserLogout() {
    try {
      // Clear current user's cart from memory
      this.cart = [];
      this.totals = { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };

      // Load anonymous cart if any
      this.loadCart();

      // Notify listeners about cart change
      this.notifyListeners("update", this.cart);

      // Trigger global cart-updated event for navbar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart-updated", { detail: this.cart })
        );
      }

      console.log("Switched to anonymous cart");
    } catch (error) {
      console.error("Error handling user logout:", error);
    }
  }

  /**
   * Update cart totals with configurable tax and delivery fees
   */
  updateCartTotals() {
    try {
      // Calculate subtotal
      const subtotal = this.cart.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 0;
        return total + itemPrice * itemQuantity;
      }, 0);

      // Calculate tax using configured rate
      const tax = subtotal * this.config.TAX_RATE;

      // Calculate delivery fee with free threshold
      const deliveryFee =
        subtotal < this.config.FREE_DELIVERY_THRESHOLD
          ? this.config.DELIVERY_FEE
          : 0;

      // Calculate total
      const total = subtotal + tax + deliveryFee;

      // Update totals object
      this.totals = {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        total: Math.round(total * 100) / 100,
      };

      return this.totals;
    } catch (error) {
      console.error("Error calculating cart totals:", error);
      // Return safe default totals
      this.totals = { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };
      return this.totals;
    }
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
    return this.cart.some((item) => item.id === itemId);
  }

  /**
   * Get estimated delivery time
   */
  getEstimatedDeliveryTime() {
    // Calculate random delivery time between 20-40 minutes
    const minTime = 20;
    const maxTime = 40;
    const deliveryTime =
      Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

    // Create delivery time date object
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + deliveryTime * 60000);

    return {
      minutes: deliveryTime,
      estimatedTime: deliveryDate,
    };
  }

  /**
   * Get available delivery options
   */
  getDeliveryOptions() {
    return [
      {
        id: "dine-in",
        name: "Dine-in",
        price: 0, // Or calculate if there's a specific dine-in service charge
        estimatedTime: "N/A", // Or link to preparation time
      },
      {
        id: "pickup",
        name: "Pick-up",
        price: 0,
        estimatedTime: "15-20 min", // Or dynamically calculate
      },
      {
        id: "standard_delivery",
        name: "Standard Delivery",
        price: this.totals.subtotal < 15 ? 2.99 : 0, // Example fee
        estimatedTime: "30-45 min",
      },
      {
        id: "express_delivery",
        name: "Express Delivery",
        price: 4.99, // Example fee
        estimatedTime: "15-25 min",
      },
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
      orderDetails.estimatedMinutes = deliveryInfo.minutes; // Submit order to database service - using correct method name addOrder
      const sanitizedOrderDetails = this.sanitizeOrderData(orderDetails);
      console.log(
        "Submitting order with sanitized data:",
        sanitizedOrderDetails
      );
      const orderId = await DatabaseService.addOrder(sanitizedOrderDetails);
      orderDetails.id = orderId; // Add the ID to the order details

      // Clear cart after successful order
      this.clearCart();

      // Notify listeners about successful order
      this.notifyListeners("orderPlaced", orderDetails);

      return { success: true, order: orderDetails };
    } catch (error) {
      console.error("Error submitting order:", error);
      // Save order to local storage as fallback
      const userOrdersKey = this.getUserOrdersStorageKey();
      const savedOrders = JSON.parse(
        localStorage.getItem(userOrdersKey) || "[]"
      );

      const localOrder = {
        ...orderDetails,
        items: this.cart,
        totals: this.totals,
        orderDate: new Date().toISOString(),
        orderNumber: this.generateOrderNumber(),
        id: Date.now().toString(),
      };

      savedOrders.push(localOrder);
      localStorage.setItem(userOrdersKey, JSON.stringify(savedOrders));

      // Clear cart after successful local order
      this.clearCart();

      // Notify listeners
      this.notifyListeners("orderPlaced", localOrder);

      return { success: true, order: localOrder };
    }
  }

  /**
   * Generate a random order number
   */
  generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `FO-${timestamp}-${random}`;
  }

  /**
   * Get all orders for a specific user
   * @param {String|Number} userId - ID of the user to get orders for
   * @return {Array} Array of user's orders
   */
  getUserOrders(userId) {
    try {
      // Try to load orders from localStorage using user-specific key
      const userOrdersKey = this.getUserOrdersStorageKey();
      const allOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");

      // Filter orders by userId
      return allOrders.filter(
        (order) => order.userId === userId || order.user?.id === userId
      );
    } catch (error) {
      console.error("Error getting user orders:", error);
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
      // Try to load orders from localStorage using user-specific key
      const userOrdersKey = this.getUserOrdersStorageKey();
      const allOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");

      // Find the specific order
      return allOrders.find(
        (order) =>
          order.id.toString() === orderId.toString() ||
          order.orderNumber === orderId.toString()
      );
    } catch (error) {
      console.error("Error getting order:", error);
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
      // Load all orders using user-specific key
      const userOrdersKey = this.getUserOrdersStorageKey();
      const allOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");

      // Find the order
      const orderIndex = allOrders.findIndex(
        (order) =>
          order.id.toString() === orderId.toString() ||
          order.orderNumber === orderId.toString()
      );

      if (orderIndex === -1) {
        return { success: false, message: "Order not found" };
      }

      // Check if order is in a state that can be cancelled
      const order = allOrders[orderIndex];
      if (!["pending", "confirmed"].includes(order.status)) {
        return {
          success: false,
          message: "Cannot cancel order in current status: " + order.status,
        };
      }

      // Update order status to cancelled
      order.status = "cancelled";
      order.statusUpdates = order.statusUpdates || {};
      order.statusUpdates.cancelled = new Date().toISOString();
      order.cancellationReason = "Cancelled by customer"; // Save updated orders list
      localStorage.setItem(userOrdersKey, JSON.stringify(allOrders));

      // Notify listeners
      this.notifyListeners("orderCancelled", order);

      return { success: true, order };
    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        message: "An error occurred while cancelling the order",
      };
    }
  }

  /**
   * Update a specific user order in storage
   * @param {Object} updatedOrder - The order object with updated information
   * @return {Boolean} Success status of the update operation
   */
  updateUserOrder(updatedOrder) {
    try {
      // Load all orders from localStorage using user-specific key
      const userOrdersKey = this.getUserOrdersStorageKey();
      const allOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");

      // Find the order index
      const orderIndex = allOrders.findIndex(
        (order) =>
          order.id.toString() === updatedOrder.id.toString() ||
          order.orderNumber === updatedOrder.orderNumber
      );

      if (orderIndex === -1) {
        console.error("Order not found for update:", updatedOrder.id);
        return false;
      }

      // Update the order
      allOrders[orderIndex] = updatedOrder; // Save back to localStorage
      localStorage.setItem(userOrdersKey, JSON.stringify(allOrders));

      // Notify listeners about the updated order
      this.notifyListeners("orderUpdated", updatedOrder);

      return true;
    } catch (error) {
      console.error("Error updating user order:", error);
      return false;
    }
  }

  /**
   * Sanitize order data for database storage
   * Removes Vue reactivity proxies and functions that can't be cloned
   */
  sanitizeOrderData(orderDetails) {
    try {
      // Deep clone to remove Vue reactivity and convert to plain objects
      const sanitized = JSON.parse(JSON.stringify(orderDetails));

      // Ensure items array is properly sanitized
      if (sanitized.items && Array.isArray(sanitized.items)) {
        sanitized.items = sanitized.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          finalPrice: item.finalPrice || item.price,
          subtotal: (item.finalPrice || item.price) * item.quantity,
          image: item.image || "",
          category: item.category || "",
          specialInstructions: item.specialInstructions || "",
          customizations: Array.isArray(item.customizations)
            ? item.customizations
            : [],
          options: typeof item.options === "object" ? item.options : {},
        }));
      }

      return sanitized;
    } catch (error) {
      console.error("Error sanitizing order data:", error);
      // Fallback: create a minimal order object
      return {
        items: (orderDetails.items || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity || 1,
          finalPrice: item.finalPrice || item.price || 0,
          subtotal: (item.finalPrice || item.price || 0) * (item.quantity || 1),
        })),
        totals: orderDetails.totals || {},
        orderDate: orderDetails.orderDate || new Date().toISOString(),
        orderNumber: orderDetails.orderNumber || this.generateOrderNumber(),
        status: orderDetails.status || "pending",
      };
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
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  /**
   * Notify event listeners
   */
  notifyListeners(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
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
    return cartItems.map((item) => {
      try {
        // Get full product details from ProductService using the correct method name
        const productDetails = window.ProductService.getProductById(item.id); // Return a promise since getProductById is async
        return Promise.resolve(productDetails)
          .then((details) => {
            // If product details found, merge with cart item while preserving customization data
            if (details) {
              return {
                ...details,
                // Preserve cart-specific data
                quantity: item.quantity,
                specialInstructions: item.specialInstructions || "",

                // Preserve customization data (both new and legacy formats)
                customization: item.customization || details.customization,
                customizations:
                  item.customizations || details.customizations || [],

                // Preserve price information (use cart price if customized, otherwise product price)
                price: item.price !== undefined ? item.price : details.price,
                basePrice: item.basePrice || details.price, // Store original price for future calculations

                // Calculate subTotal based on current price and quantity
                subTotal:
                  (item.price !== undefined ? item.price : details.price) *
                  item.quantity,

                // Preserve any other cart-specific options
                options: item.options || {},
              };
            }
            // If product not found, return null to filter out later
            console.warn(
              `Product ${item.id} not found in catalog, removing from cart`
            );
            return null;
          })
          .catch((error) => {
            console.error(
              `Error resolving product details for ${item.id}:`,
              error
            );
            return null; // Return null to filter out problematic items
          });
      } catch (error) {
        console.error(`Error getting details for product ${item.id}:`, error);
        return null; // Return null to filter out problematic items
      }
    });
  }

  /**
   * Validate that a cart item has all required properties and correct data types
   * @param {Object} item - The item to validate
   * @returns {boolean} True if item is valid, false otherwise
   */
  isValidCartItem(item) {
    // Check if item exists and is an object
    if (!item || typeof item !== "object") {
      return false;
    }

    // Check for required properties
    const requiredProps = ["id", "name", "price", "quantity"];
    const missingProps = requiredProps.filter((prop) => !(prop in item));

    if (missingProps.length > 0) {
      return false;
    }

    // Check data types
    if (
      typeof item.price !== "number" ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      return false;
    }

    return true;
  }
}

// Create and expose singleton instance as global variable
window.CartService = new CartService();

// Debug logging
console.log("CartService initialized:", {
  hasAddItem: typeof window.CartService.addItem === "function",
  hasAddToCart: typeof window.CartService.addToCart === "function",
  methods: Object.getOwnPropertyNames(CartService.prototype).filter(
    (name) => name !== "constructor"
  ),
});
