// Purchases Page Component
const PurchasesPage = {
  template: `
    <div class="purchases-page" id="content">
      <div class="container">
        <h1>My Purchases</h1>
        
        <div v-if="!$root.store.isAuthenticated" class="alert alert-warning">
          <p>Please log in to view your purchases.</p>
          <router-link to="/login" class="btn btn-primary">Login</router-link>
        </div>
        
        <div v-else-if="purchases.length === 0" class="empty-purchases">
          <div class="card">
            <div class="card-body text-center">
              <i class="fas fa-shopping-bag empty-icon"></i>
              <h2>No Purchases Yet</h2>
              <p>You haven't made any purchases yet. Start shopping to see your purchase history here.</p>
              <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
            </div>
          </div>
        </div>
        
        <div v-else>
          <!-- Filter and Search Options -->
          <div class="purchase-filters">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="purchase-sort" class="form-label">Sort By</label>
                  <select 
                    id="purchase-sort" 
                    v-model="sortOption" 
                    class="form-control"
                    @change="sortPurchases"
                    aria-label="Sort purchases by"
                  >
                    <option value="date-desc">Date (Newest First)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="price-desc">Price (Highest First)</option>
                    <option value="price-asc">Price (Lowest First)</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="purchase-search" class="form-label">Search Orders</label>
                  <input 
                    type="text" 
                    id="purchase-search" 
                    v-model="searchQuery" 
                    class="form-control"
                    placeholder="Search by product name or order ID"
                    aria-label="Search orders"
                  >
                </div>
              </div>
            </div>
          </div>
          
          <!-- Purchase List -->
          <div class="purchase-list">
            <div v-for="purchase in filteredPurchases" :key="purchase.id" class="purchase-item">
              <div class="card">
                <div class="card-header">
                  <div class="purchase-header">
                    <div class="purchase-id">
                      <strong>Order ID:</strong> {{ purchase.id }}
                    </div>
                    <div class="purchase-date">
                      <strong>Date:</strong> {{ formatDate(purchase.date) }}
                    </div>
                    <div class="purchase-total">
                      <strong>Total:</strong> {{ formatPrice(purchase.total) }}
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <h3 class="sr-only">Items in Order {{ purchase.id }}</h3>
                  <div class="purchase-items">
                    <div v-for="item in purchase.items" :key="item.id" class="purchase-item-row">
                      <div class="row align-items-center">
                        <div class="col-3 col-md-2">
                          <img :src="item.image" :alt="item.name" class="item-image">
                        </div>
                        <div class="col-9 col-md-4">
                          <div class="item-name">{{ item.name }}</div>
                          <div class="item-meta" v-if="item.meta">{{ item.meta }}</div>
                        </div>
                        <div class="col-4 col-md-2">
                          <div class="item-price">{{ formatPrice(item.price) }}</div>
                        </div>
                        <div class="col-4 col-md-2">
                          <div class="item-quantity">x {{ item.quantity }}</div>
                        </div>
                        <div class="col-4 col-md-2">
                          <div class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Purchase Actions -->
                  <div class="purchase-actions">
                    <button @click="buyAgain(purchase)" class="btn btn-primary">Buy Again</button>
                    
                    <!-- Toggle for Additional Details -->
                    <button 
                      @click="toggleDetails(purchase.id)" 
                      class="btn btn-secondary"
                      :aria-expanded="expandedPurchaseId === purchase.id"
                      :aria-controls="'details-' + purchase.id"
                    >
                      {{ expandedPurchaseId === purchase.id ? 'Hide Details' : 'Show Details' }}
                    </button>
                  </div>
                  
                  <!-- Additional Purchase Details (Expandable) -->
                  <div v-if="expandedPurchaseId === purchase.id" :id="'details-' + purchase.id" class="purchase-details">
                    <div class="details-section">
                      <h4>Shipping Information</h4>
                      <address>
                        Demo User<br>
                        123 Shipping Address St<br>
                        City, State 12345<br>
                        Country
                      </address>
                    </div>
                    
                    <div class="details-section">
                      <h4>Payment Information</h4>
                      <p>
                        <strong>Method:</strong> Credit Card (ending in 1234)<br>
                        <strong>Status:</strong> <span class="payment-status paid">Paid</span><br>
                      </p>
                    </div>
                    
                    <div class="details-section">
                      <h4>Order Summary</h4>
                      <table class="order-summary" aria-label="Order summary">
                        <tbody>
                          <tr>
                            <th scope="row">Subtotal</th>
                            <td>{{ formatPrice(purchase.subtotal || purchase.total) }}</td>
                          </tr>
                          <tr v-if="purchase.discount">
                            <th scope="row">Discount</th>
                            <td>-{{ formatPrice(purchase.discount) }}</td>
                          </tr>
                          <tr v-if="purchase.shipping">
                            <th scope="row">Shipping</th>
                            <td>{{ formatPrice(purchase.shipping) }}</td>
                          </tr>
                          <tr v-if="purchase.tax">
                            <th scope="row">Tax</th>
                            <td>{{ formatPrice(purchase.tax) }}</td>
                          </tr>
                          <tr class="order-total">
                            <th scope="row">Total</th>
                            <td>{{ formatPrice(purchase.total) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Results Message -->
          <div v-if="purchases.length > 0 && filteredPurchases.length === 0" class="no-results">
            <p>No purchases match your search criteria. Try adjusting your filters or search query.</p>
            <button @click="resetFilters" class="btn btn-secondary">Reset Filters</button>
          </div>
          
          <!-- Pagination if needed -->
          <div v-if="totalPages > 1" class="pagination-container">
            <ul class="pagination" role="navigation" aria-label="Purchases pagination">
              <li class="pagination-item">
                <button 
                  @click="changePage(currentPage - 1)" 
                  class="pagination-link" 
                  :disabled="currentPage === 1"
                  aria-label="Previous page"
                >
                  &laquo;
                </button>
              </li>
              <li v-for="page in paginationItems" :key="page" class="pagination-item">
                <button 
                  v-if="page === '...'" 
                  class="pagination-link ellipsis" 
                  disabled
                  aria-hidden="true"
                >...</button>
                <button 
                  v-else 
                  @click="changePage(page)" 
                  class="pagination-link" 
                  :class="{ active: currentPage === page }"
                  :aria-current="currentPage === page ? 'page' : null"
                >{{ page }}</button>
              </li>
              <li class="pagination-item">
                <button 
                  @click="changePage(currentPage + 1)" 
                  class="pagination-link" 
                  :disabled="currentPage === totalPages"
                  aria-label="Next page"
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      purchases: [],
      expandedPurchaseId: null,
      sortOption: 'date-desc',
      searchQuery: '',
      currentPage: 1,
      perPage: 5,
      isLoading: false
    };
  },
  
  computed: {
    // Filter and search purchases
    filteredPurchases() {
      let result = [...this.purchases];
      
      // Apply search filter if query exists
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(purchase => {
          // Search in purchase ID
          if (purchase.id.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search in product names
          const hasMatchingItem = purchase.items.some(item => 
            item.name.toLowerCase().includes(query)
          );
          
          return hasMatchingItem;
        });
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      
      return result.slice(startIndex, endIndex);
    },
    
    // Calculate total number of pages
    totalPages() {
      let filteredCount = this.purchases.length;
      
      // Apply search filter if query exists
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredCount = this.purchases.filter(purchase => {
          // Search in purchase ID
          if (purchase.id.toLowerCase().includes(query)) {
            return true;
          }
          
          // Search in product names
          const hasMatchingItem = purchase.items.some(item => 
            item.name.toLowerCase().includes(query)
          );
          
          return hasMatchingItem;
        }).length;
      }
      
      return Math.ceil(filteredCount / this.perPage);
    },
    
    // Generate pagination items with ellipsis for large page counts
    paginationItems() {
      const items = [];
      const maxVisible = 5; // Maximum number of page links to show
      
      if (this.totalPages <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= this.totalPages; i++) {
          items.push(i);
        }
      } else {
        // Always show first page
        items.push(1);
        
        let startPage = Math.max(2, this.currentPage - 1);
        let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
        
        // Add ellipsis if needed between page 1 and startPage
        if (startPage > 2) {
          items.push('...');
        }
        
        // Add pages around current page
        for (let i = startPage; i <= endPage; i++) {
          items.push(i);
        }
        
        // Add ellipsis if needed between endPage and last page
        if (endPage < this.totalPages - 1) {
          items.push('...');
        }
        
        // Always show last page
        if (this.totalPages > 1) {
          items.push(this.totalPages);
        }
      }
      
      return items;
    }
  },
  
  mounted() {
    // Redirect if not authenticated
    if (!this.$root.store.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    
    this.loadPurchases();
  },
  
  methods: {
    loadPurchases() {
      this.isLoading = true;
      
      // Simulate API call to load purchases
      setTimeout(() => {
        // Mock purchase data for demonstration
        this.purchases = [
          {
            id: 'ORD-10021',
            date: '2025-03-28T14:35:22',
            subtotal: 899.98,
            shipping: 0,
            discount: 0,
            tax: 72.0,
            total: 971.98,
            items: [
              {
                id: 1,
                name: 'Smartphone X1',
                price: 799.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80?text=Smartphone'
              },
              {
                id: 6,
                name: 'Bluetooth Speaker',
                price: 99.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80?text=Speaker'
              }
            ]
          },
          {
            id: 'ORD-10015',
            date: '2025-02-14T09:23:11',
            subtotal: 1499.98,
            shipping: 0,
            discount: 100,
            tax: 112.0,
            total: 1511.98,
            items: [
              {
                id: 2,
                name: 'Laptop Pro',
                price: 1299.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80?text=Laptop'
              },
              {
                id: 5,
                name: 'Smart Watch',
                price: 199.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80?text=Watch'
              }
            ]
          },
          {
            id: 'ORD-9987',
            date: '2025-01-05T16:42:18',
            subtotal: 199.99,
            shipping: 5.99,
            discount: 0,
            tax: 16.48,
            total: 222.46,
            items: [
              {
                id: 3,
                name: 'Wireless Headphones',
                price: 199.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80?text=Headphones'
              }
            ]
          }
        ];
        
        this.sortPurchases();
        this.isLoading = false;
      }, 800);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatPrice(price) {
      return '$' + price.toFixed(2);
    },
    
    toggleDetails(purchaseId) {
      if (this.expandedPurchaseId === purchaseId) {
        this.expandedPurchaseId = null;
      } else {
        this.expandedPurchaseId = purchaseId;
      }
    },
    
    sortPurchases() {
      switch (this.sortOption) {
        case 'date-desc':
          this.purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'date-asc':
          this.purchases.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'price-desc':
          this.purchases.sort((a, b) => b.total - a.total);
          break;
        case 'price-asc':
          this.purchases.sort((a, b) => a.total - b.total);
          break;
      }
      
      // Reset to first page when sorting
      this.currentPage = 1;
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.sortOption = 'date-desc';
      this.currentPage = 1;
      this.sortPurchases();
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    buyAgain(purchase) {
      // Add all items from the purchase to the cart
      purchase.items.forEach(item => {
        const product = {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          inStock: true // Assuming items are in stock for this demo
        };
        this.$root.addToCart(product);
      });
      
      // Navigate to cart
      this.$router.push('/cart');
    }
  }
};