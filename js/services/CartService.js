/**
 * CartService
 * Service for managing shopping cart functionality
 */
const CartService = {
  // Get cart items from localStorage
  getCart() {
    const cartItems = localStorage.getItem('cart');
    return cartItems ? JSON.parse(cartItems) : [];
  },
  
  // Get cart items with full product details
  getCartWithDetails() {
    const cart = this.getCart();
    
    // Return if cart is empty
    if (!cart.length) return [];
    
    // For each cart item, fetch full product details
    return cart.map(item => {
      // Get the full product details
      const productDetails = ProductService.getProduct(item.id);
      
      if (productDetails) {
        // Preserve the original price before discount
        const originalPrice = productDetails.discount ? productDetails.price : null;
        
        // Return cart item with additional product details
        return {
          ...item,
          category: productDetails.category,
          discount: productDetails.discount,
          originalPrice: originalPrice,
          stock: productDetails.stock
        };
      }
      
      // Return original item if product details not found
      return item;
    });
  },
  
  // Add item to cart
  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Update quantity if product already in cart
      cart[existingProductIndex].quantity += quantity;
    } else {
      // Add new product to cart
      const discountedPrice = product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
        
      cart.push({
        id: product.id,
        name: product.name,
        price: discountedPrice,
        image: product.image,
        quantity: quantity
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Notify other components of cart update
    window.dispatchEvent(new Event('cart-updated'));
    
    return cart;
  },
  
  // Update item quantity
  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    
    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex >= 0) {
      // Ensure quantity is at least 1
      cart[productIndex].quantity = Math.max(1, quantity);
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Notify other components of cart update
      window.dispatchEvent(new Event('cart-updated'));
    }
    
    return cart;
  },
  
  // Remove item from cart
  removeFromCart(productId) {
    let cart = this.getCart();
    
    // Filter out the product to remove
    cart = cart.filter(item => item.id !== productId);
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Notify other components of cart update
    window.dispatchEvent(new Event('cart-updated'));
    
    return cart;
  },
  
  // Clear the entire cart
  clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Notify other components of cart update
    window.dispatchEvent(new Event('cart-updated'));
    
    return [];
  },
  
  // Calculate cart totals
  getCartTotals() {
    const cart = this.getCart();
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    // Calculate shipping cost (free shipping over RM50)
    const shipping = subtotal > 50 ? 0 : 5.99;
    
    // Calculate tax (assuming 7% tax rate)
    const tax = subtotal * 0.07;
    
    // Calculate grand total
    const total = subtotal + shipping + tax;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount
    };
  },
  
  // Save order to purchase history
  saveOrder(orderData = null) {
    // Get current cart and totals
    const cart = this.getCart();
    const totals = orderData?.totals || this.getCartTotals();
    
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      return { success: false, message: 'User not logged in' };
    }
    
    // Create order object
    const order = {
      id: Date.now(), // Simple unique ID based on timestamp
      userId: currentUser.id,
      items: [...cart],
      totals: totals,
      shipping: orderData?.shipping || {
        id: 'standard',
        name: 'Standard Shipping',
        price: totals.shipping
      },
      promoCode: orderData?.promoCode || null,
      bulkDiscount: orderData?.bulkDiscount || null,
      status: 'Processing',
      date: new Date().toISOString(),
      shippingAddress: currentUser.address
    };
    
    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Add new order
    existingOrders.push(order);
    
    // Save updated orders
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    // Clear cart after successful order
    this.clearCart();
    
    return { success: true, order };
  },
  
  // Get orders for current user
  getUserOrders() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      return [];
    }
    
    // Get all orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Filter orders for current user
    return orders.filter(order => order.userId === currentUser.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
  }
};