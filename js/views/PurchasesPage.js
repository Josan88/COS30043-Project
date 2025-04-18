/**
 * PurchasesPage Component
 * Displays user purchase history and allows user to manage purchases
 */
const PurchasesPage = {
  template: `
    <div class="purchases-page">
      <div class="container">
        <h1 class="mb-4">Your Purchase History</h1>
        
        <!-- Empty State -->
        <div v-if="orders.length === 0" class="text-center py-5">
          <i class="fas fa-shopping-bag fa-4x mb-3 text-muted"></i>
          <h3>No purchases yet</h3>
          <p>You haven't made any purchases yet.</p>
          <router-link to="/product" class="btn btn-primary mt-3">
            <i class="fas fa-shopping-cart"></i> Shop Now
          </router-link>
        </div>
        
        <div v-else>
          <!-- Action Buttons -->
          <div class="d-flex justify-content-between mb-4">
            <button class="btn btn-primary" @click="openAddPurchaseModal">
              <i class="fas fa-plus"></i> Add New Purchase
            </button>
            <div class="d-flex gap-2">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search purchases..." 
                  v-model="searchQuery"
                  @input="filterOrders"
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="searchQuery = ''; filterOrders()"
                  v-if="searchQuery"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <select class="form-select" v-model="statusFilter" @change="filterOrders">
                <option value="">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        
          <!-- Orders List -->
          <div class="card mb-4" v-for="order in filteredOrders" :key="order.id">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">Order #{{ order.id.toString().slice(-8) }}</h5>
                <p class="text-muted mb-0 small">
                  {{ new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <span class="badge" :class="getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Actions
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item" @click="editOrder(order)"><i class="fas fa-edit me-2"></i>Edit</button></li>
                    <li><button class="dropdown-item" @click="toggleOrderDetails(order.id)">
                      <i class="fas" :class="expandedOrders.includes(order.id) ? 'fa-chevron-up' : 'fa-chevron-down'" me-2></i>
                      {{ expandedOrders.includes(order.id) ? 'Hide Details' : 'View Details' }}
                    </button></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" @click="deleteOrder(order.id)"><i class="fas fa-trash me-2"></i>Delete</button></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Order Details (expandable) -->
            <div class="card-body" v-if="expandedOrders.includes(order.id)">
              <!-- Order Items -->
              <h6 class="mb-3">Items</h6>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" width="80">Image</th>
                      <th scope="col">Product</th>
                      <th scope="col" width="100">Price</th>
                      <th scope="col" width="80">Quantity</th>
                      <th scope="col" width="100">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.id">
                      <td>
                        <img :src="item.image" :alt="item.name" width="50" class="img-thumbnail">
                      </td>
                      <td>{{ item.name }}</td>
                      <td>{{ $filters.currency(item.price) }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td>{{ $filters.currency(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
                      <td>{{ $filters.currency(order.totals.subtotal) }}</td>
                    </tr>
                    <tr v-if="order.bulkDiscount">
                      <td colspan="4" class="text-end text-success"><strong>Bulk Discount:</strong></td>
                      <td class="text-success">-{{ $filters.currency(order.bulkDiscount.amount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Shipping:</strong></td>
                      <td>
                        <span v-if="order.totals.shipping > 0">{{ $filters.currency(order.totals.shipping) }}</span>
                        <span v-else class="text-success">FREE</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Tax:</strong></td>
                      <td>{{ $filters.currency(order.totals.tax) }}</td>
                    </tr>
                    <tr v-if="order.promoCode">
                      <td colspan="4" class="text-end text-success"><strong>Promo ({{ order.promoCode.code }}):</strong></td>
                      <td class="text-success">
                        <span v-if="order.promoCode.type === 'percentage'">-{{ order.promoCode.value }}%</span>
                        <span v-else-if="order.promoCode.type === 'fixed'">-{{ $filters.currency(order.promoCode.value) }}</span>
                        <span v-else>Free Shipping</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total:</strong></td>
                      <td><strong>{{ $filters.currency(order.totals.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Shipping Information -->
              <div class="row mt-4">
                <div class="col-md-6">
                  <h6 class="mb-3">Shipping Information</h6>
                  <div class="card">
                    <div class="card-body">
                      <p class="mb-1"><strong>Method:</strong> {{ order.shipping.name }}</p>
                      <p class="mb-1" v-if="order.shippingAddress">
                        <strong>Address:</strong><br>
                        {{ order.shippingAddress.street }}<br>
                        {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}<br>
                        {{ order.shippingAddress.country }}
                      </p>
                      <p class="mb-0" v-if="order.trackingNumber">
                        <strong>Tracking:</strong> {{ order.trackingNumber }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <h6 class="mb-3">Order Timeline</h6>
                  <div class="card">
                    <div class="card-body">
                      <ul class="list-unstyled">
                        <li class="mb-2">
                          <i class="fas fa-check-circle text-success me-2"></i>
                          <strong>Order Placed:</strong> {{ new Date(order.date).toLocaleString() }}
                        </li>
                        <li v-if="order.shippedDate" class="mb-2">
                          <i class="fas fa-truck text-primary me-2"></i>
                          <strong>Shipped:</strong> {{ new Date(order.shippedDate).toLocaleString() }}
                        </li>
                        <li v-if="order.deliveredDate">
                          <i class="fas fa-box-open text-success me-2"></i>
                          <strong>Delivered:</strong> {{ new Date(order.deliveredDate).toLocaleString() }}
                        </li>
                        <li v-if="order.cancelledDate">
                          <i class="fas fa-times-circle text-danger me-2"></i>
                          <strong>Cancelled:</strong> {{ new Date(order.cancelledDate).toLocaleString() }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-footer bg-white d-flex justify-content-between" v-if="!expandedOrders.includes(order.id)">
              <div>
                <span class="text-muted">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }} | Total: </span>
                <span class="fw-bold">{{ $filters.currency(order.totals.total) }}</span>
              </div>
              <button class="btn btn-sm btn-outline" @click="toggleOrderDetails(order.id)">
                View Details <i class="fas fa-chevron-down ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit Order Modal -->
      <div class="modal fade" id="editOrderModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isNewOrder ? 'Add New Purchase' : 'Edit Purchase' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="editedOrder">
              <form @submit.prevent="saveOrder">
                <!-- Status -->
                <div class="mb-3">
                  <label for="orderStatus" class="form-label">Order Status</label>
                  <select class="form-select" id="orderStatus" v-model="editedOrder.status" required>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <!-- Tracking Number -->
                <div class="mb-3">
                  <label for="trackingNumber" class="form-label">Tracking Number</label>
                  <input type="text" class="form-control" id="trackingNumber" v-model="editedOrder.trackingNumber">
                </div>
                
                <!-- Shipping Address -->
                <div class="mb-4">
                  <h6>Shipping Address</h6>
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="addressStreet" class="form-label">Street</label>
                      <input type="text" class="form-control" id="addressStreet" 
                        v-model="editedOrder.shippingAddress.street" required>
                    </div>
                    <div class="col-md-6">
                      <label for="addressCity" class="form-label">City</label>
                      <input type="text" class="form-control" id="addressCity" 
                        v-model="editedOrder.shippingAddress.city" required>
                    </div>
                    <div class="col-md-4">
                      <label for="addressState" class="form-label">State</label>
                      <input type="text" class="form-control" id="addressState" 
                        v-model="editedOrder.shippingAddress.state" required>
                    </div>
                    <div class="col-md-2">
                      <label for="addressZip" class="form-label">ZIP</label>
                      <input type="text" class="form-control" id="addressZip" 
                        v-model="editedOrder.shippingAddress.zip" required>
                    </div>
                    <div class="col-12">
                      <label for="addressCountry" class="form-label">Country</label>
                      <input type="text" class="form-control" id="addressCountry" 
                        v-model="editedOrder.shippingAddress.country" required>
                    </div>
                  </div>
                </div>
                
                <!-- Date Information -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label for="orderDate" class="form-label">Order Date</label>
                    <input type="date" class="form-control" id="orderDate" 
                      v-model="orderDate" required>
                  </div>
                  <div class="col-md-6" v-if="editedOrder.status === 'Shipped' || editedOrder.status === 'Delivered'">
                    <label for="shippedDate" class="form-label">Shipped Date</label>
                    <input type="date" class="form-control" id="shippedDate" 
                      v-model="shippedDate">
                  </div>
                  <div class="col-md-6" v-if="editedOrder.status === 'Delivered'">
                    <label for="deliveredDate" class="form-label">Delivered Date</label>
                    <input type="date" class="form-control" id="deliveredDate" 
                      v-model="deliveredDate">
                  </div>
                  <div class="col-md-6" v-if="editedOrder.status === 'Cancelled'">
                    <label for="cancelledDate" class="form-label">Cancelled Date</label>
                    <input type="date" class="form-control" id="cancelledDate" 
                      v-model="cancelledDate">
                  </div>
                </div>
                
                <!-- Order Items (only for new orders) -->
                <div v-if="isNewOrder" class="mb-3">
                  <h6 class="mb-3">Order Items</h6>
                  <div v-for="(item, index) in editedOrder.items" :key="index" class="card mb-2">
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label :for="'itemProduct-' + index" class="form-label">Product</label>
                          <select class="form-select" :id="'itemProduct-' + index" 
                                v-model="item.id" required @change="updateProductInfo(index)">
                            <option value="" disabled>Select a product</option>
                            <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                              {{ product.name }}
                            </option>
                          </select>
                        </div>
                        <div class="col-md-2">
                          <label :for="'itemPrice-' + index" class="form-label">Price</label>
                          <div class="input-group">
                            <span class="input-group-text">RM</span>
                            <input type="number" class="form-control" :id="'itemPrice-' + index" 
                                  v-model.number="item.price" min="0" step="0.01" required>
                          </div>
                        </div>
                        <div class="col-md-2">
                          <label :for="'itemQuantity-' + index" class="form-label">Quantity</label>
                          <input type="number" class="form-control" :id="'itemQuantity-' + index" 
                                v-model.number="item.quantity" min="1" required>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                          <button type="button" class="btn btn-danger mb-0 w-100" 
                                  @click="removeOrderItem(index)" 
                                  :disabled="editedOrder.items.length <= 1">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline mt-2" @click="addOrderItem">
                    <i class="fas fa-plus"></i> Add Item
                  </button>
                </div>
                
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
            <div class="modal-body" v-else>
              <p>Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Confirm Delete Modal -->
      <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm Delete</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to delete this purchase? This action cannot be undone.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      orders: [],
      expandedOrders: [],
      editedOrder: null,
      orderToDelete: null,
      isNewOrder: false,
      searchQuery: '',
      statusFilter: '',
      filteredOrders: [],
      availableProducts: [],
      // Date inputs
      orderDate: '',
      shippedDate: '',
      deliveredDate: '',
      cancelledDate: '',
    };
  },
  created() {
    this.loadOrders();
    this.loadProducts();
  },
  methods: {
    loadOrders() {
      // Get orders from CartService
      this.orders = CartService.getUserOrders();
      this.filterOrders();
    },
    
    loadProducts() {
      // Get available products for adding new orders
      this.availableProducts = ProductService.getAllProducts();
    },
    
    filterOrders() {
      let filtered = [...this.orders];
      
      // Apply status filter if selected
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      // Apply search query if entered
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order => {
          // Search by order ID
          if (order.id.toString().includes(query)) return true;
          
          // Search by product names
          if (order.items.some(item => item.name.toLowerCase().includes(query))) return true;
          
          // Search by tracking number if it exists
          if (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query)) return true;
          
          return false;
        });
      }
      
      this.filteredOrders = filtered;
    },
    
    toggleOrderDetails(orderId) {
      if (this.expandedOrders.includes(orderId)) {
        this.expandedOrders = this.expandedOrders.filter(id => id !== orderId);
      } else {
        this.expandedOrders.push(orderId);
      }
    },
    
    editOrder(order) {
      this.isNewOrder = false;
      this.editedOrder = JSON.parse(JSON.stringify(order)); // Deep copy
      
      // Set date inputs
      this.orderDate = this.formatDateForInput(order.date);
      this.shippedDate = order.shippedDate ? this.formatDateForInput(order.shippedDate) : '';
      this.deliveredDate = order.deliveredDate ? this.formatDateForInput(order.deliveredDate) : '';
      this.cancelledDate = order.cancelledDate ? this.formatDateForInput(order.cancelledDate) : '';
      
      // Open modal
      new bootstrap.Modal(document.getElementById('editOrderModal')).show();
    },
    
    openAddPurchaseModal() {
      this.isNewOrder = true;
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!currentUser) {
        alert('You must be logged in to add a purchase.');
        return;
      }
      
      // Initialize a new order
      this.editedOrder = {
        id: Date.now(),
        userId: currentUser.id,
        items: [{ id: '', name: '', price: 0, quantity: 1, image: '' }],
        totals: { subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 1 },
        shipping: { id: 'standard', name: 'Standard Shipping', price: 5.99 },
        status: 'Processing',
        date: new Date().toISOString(),
        shippingAddress: { ...currentUser.address } || { 
          street: '', city: '', state: '', zip: '', country: '' 
        }
      };
      
      // Set date input to today
      this.orderDate = this.formatDateForInput(new Date().toISOString());
      this.shippedDate = '';
      this.deliveredDate = '';
      this.cancelledDate = '';
      
      // Open modal
      new bootstrap.Modal(document.getElementById('editOrderModal')).show();
    },
    
    updateProductInfo(index) {
      const productId = this.editedOrder.items[index].id;
      const product = this.availableProducts.find(p => p.id === productId);
      
      if (product) {
        this.editedOrder.items[index].name = product.name;
        this.editedOrder.items[index].price = product.discount 
          ? product.price * (1 - product.discount / 100) 
          : product.price;
        this.editedOrder.items[index].image = product.image;
      }
    },
    
    addOrderItem() {
      this.editedOrder.items.push({ id: '', name: '', price: 0, quantity: 1, image: '' });
    },
    
    removeOrderItem(index) {
      if (this.editedOrder.items.length > 1) {
        this.editedOrder.items.splice(index, 1);
      }
    },
    
    saveOrder() {
      // Update dates based on inputs
      this.editedOrder.date = new Date(this.orderDate).toISOString();
      
      if (this.shippedDate) {
        this.editedOrder.shippedDate = new Date(this.shippedDate).toISOString();
      }
      
      if (this.deliveredDate) {
        this.editedOrder.deliveredDate = new Date(this.deliveredDate).toISOString();
      }
      
      if (this.cancelledDate) {
        this.editedOrder.cancelledDate = new Date(this.cancelledDate).toISOString();
      }
      
      // For new orders, calculate totals
      if (this.isNewOrder) {
        // Calculate subtotal and item count
        const subtotal = this.editedOrder.items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        
        const itemCount = this.editedOrder.items.reduce((count, item) => {
          return count + item.quantity;
        }, 0);
        
        // Calculate tax (7%)
        const tax = subtotal * 0.07;
        
        // Calculate total
        const total = subtotal + this.editedOrder.shipping.price + tax;
        
        // Update totals
        this.editedOrder.totals = {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(this.editedOrder.shipping.price.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount
        };
      }
      
      // Get existing orders
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      if (this.isNewOrder) {
        // Add new order
        existingOrders.push(this.editedOrder);
      } else {
        // Update existing order
        const orderIndex = existingOrders.findIndex(order => order.id === this.editedOrder.id);
        if (orderIndex >= 0) {
          existingOrders[orderIndex] = this.editedOrder;
        }
      }
      
      // Save updated orders
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Close modal
      const modalElement = document.getElementById('editOrderModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      
      // Reload orders
      this.loadOrders();
      
      // Show success message
      alert(this.isNewOrder ? 'Purchase created successfully!' : 'Purchase updated successfully!');
    },
    
    deleteOrder(orderId) {
      this.orderToDelete = orderId;
      new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
    },
    
    confirmDelete() {
      if (!this.orderToDelete) return;
      
      // Get existing orders
      let existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Remove the order to delete
      existingOrders = existingOrders.filter(order => order.id !== this.orderToDelete);
      
      // Save updated orders
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Close modal
      const modalElement = document.getElementById('deleteConfirmModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      
      // Reset orderToDelete
      this.orderToDelete = null;
      
      // Reload orders
      this.loadOrders();
      
      // Show success message
      alert('Purchase deleted successfully!');
    },
    
    getStatusBadgeClass(status) {
      switch (status) {
        case 'Processing': return 'bg-warning text-dark';
        case 'Shipped': return 'bg-primary';
        case 'Delivered': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        default: return 'bg-secondary';
      }
    },
    
    formatDateForInput(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  }
};

// Make the component globally available
window.PurchasesPage = PurchasesPage;