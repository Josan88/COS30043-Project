// Account Page Component
const AccountPage = {
  template: `
    <div class="account-page" id="content">
      <div class="container">
        <h1>My Account</h1>
        
        <div v-if="!$root.store.isAuthenticated" class="alert alert-warning">
          <p>Please log in to view your account details.</p>
          <router-link to="/login" class="btn btn-primary">Login</router-link>
        </div>
        
        <div v-else class="row">
          <!-- Account Menu Sidebar -->
          <div class="col-12 col-md-3">
            <div class="account-menu">
              <h2 class="menu-heading">Account Menu</h2>
              <ul class="list-unstyled">
                <li class="menu-item" :class="{ active: activeSection === 'profile' }">
                  <a href="#" @click.prevent="setActiveSection('profile')" aria-current="activeSection === 'profile'">
                    <i class="fas fa-user"></i> Profile Information
                  </a>
                </li>
                <li class="menu-item" :class="{ active: activeSection === 'addresses' }">
                  <a href="#" @click.prevent="setActiveSection('addresses')" aria-current="activeSection === 'addresses'">
                    <i class="fas fa-map-marker-alt"></i> Addresses
                  </a>
                </li>
                <li class="menu-item" :class="{ active: activeSection === 'orders' }">
                  <a href="#" @click.prevent="setActiveSection('orders')" aria-current="activeSection === 'orders'">
                    <i class="fas fa-shopping-bag"></i> Order History
                  </a>
                </li>
                <li class="menu-item" :class="{ active: activeSection === 'wishlist' }">
                  <a href="#" @click.prevent="setActiveSection('wishlist')" aria-current="activeSection === 'wishlist'">
                    <i class="fas fa-heart"></i> Wishlist
                  </a>
                </li>
                <li class="menu-item" :class="{ active: activeSection === 'security' }">
                  <a href="#" @click.prevent="setActiveSection('security')" aria-current="activeSection === 'security'">
                    <i class="fas fa-shield-alt"></i> Security
                  </a>
                </li>
              </ul>
              
              <div class="logout-section">
                <button @click="logout" class="btn btn-danger">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
          
          <!-- Main Account Content -->
          <div class="col-12 col-md-9">
            <!-- Profile Information Section -->
            <div v-if="activeSection === 'profile'" class="account-section">
              <h2>Profile Information</h2>
              <div class="card">
                <div class="card-body">
                  <form @submit.prevent="updateProfile">
                    <div class="form-group">
                      <label for="profile-name">Name</label>
                      <input type="text" id="profile-name" v-model="profile.name" class="form-control">
                    </div>
                    
                    <div class="form-group">
                      <label for="profile-email">Email Address</label>
                      <input type="email" id="profile-email" v-model="profile.email" class="form-control" disabled>
                      <small class="form-text text-muted">Email address cannot be changed.</small>
                    </div>
                    
                    <div class="form-group">
                      <label for="profile-phone">Phone Number</label>
                      <input type="tel" id="profile-phone" v-model="profile.phone" class="form-control" placeholder="e.g. 123-456-7890">
                    </div>
                    
                    <div class="form-group">
                      <label>Profile Created</label>
                      <p class="form-control-static">{{ formatDate(profile.createdAt) }}</p>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" :disabled="isSaving">
                      <i v-if="isSaving" class="fas fa-spinner fa-spin"></i> Save Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <!-- Addresses Section -->
            <div v-if="activeSection === 'addresses'" class="account-section">
              <h2>Addresses</h2>
              
              <div v-if="addresses.length === 0" class="empty-state">
                <p>You haven't added any addresses yet.</p>
                <button @click="showAddressForm = true" class="btn btn-primary">Add an Address</button>
              </div>
              
              <div v-else>
                <div class="row">
                  <div v-for="(address, index) in addresses" :key="index" class="col-12 col-md-6">
                    <div class="card address-card">
                      <div class="card-body">
                        <h3>{{ address.type }} Address</h3>
                        <address>
                          <strong>{{ address.name }}</strong><br>
                          {{ address.street }}<br>
                          {{ address.city }}, {{ address.state }} {{ address.zip }}<br>
                          {{ address.country }}
                        </address>
                        <div class="address-actions">
                          <button @click="editAddress(index)" class="btn btn-sm btn-secondary">Edit</button>
                          <button @click="removeAddress(index)" class="btn btn-sm btn-danger">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button @click="showAddressForm = true" class="btn btn-primary mt-3">Add Another Address</button>
              </div>
              
              <div v-if="showAddressForm" class="address-form mt-4">
                <div class="card">
                  <div class="card-header">
                    <h3>{{ editingAddressIndex >= 0 ? 'Edit' : 'Add' }} Address</h3>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="saveAddress">
                      <div class="form-group">
                        <label for="address-type">Address Type</label>
                        <select id="address-type" v-model="currentAddress.type" class="form-control" required>
                          <option value="Shipping">Shipping</option>
                          <option value="Billing">Billing</option>
                        </select>
                      </div>
                      
                      <div class="form-group">
                        <label for="address-name">Full Name</label>
                        <input type="text" id="address-name" v-model="currentAddress.name" class="form-control" required>
                      </div>
                      
                      <div class="form-group">
                        <label for="address-street">Street Address</label>
                        <input type="text" id="address-street" v-model="currentAddress.street" class="form-control" required>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="address-city">City</label>
                            <input type="text" id="address-city" v-model="currentAddress.city" class="form-control" required>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="form-group">
                            <label for="address-state">State/Province</label>
                            <input type="text" id="address-state" v-model="currentAddress.state" class="form-control" required>
                          </div>
                        </div>
                        <div class="col-md-2">
                          <div class="form-group">
                            <label for="address-zip">ZIP/Postal Code</label>
                            <input type="text" id="address-zip" v-model="currentAddress.zip" class="form-control" required>
                          </div>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label for="address-country">Country</label>
                        <select id="address-country" v-model="currentAddress.country" class="form-control" required>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="Mexico">Mexico</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                      
                      <div class="form-group">
                        <div class="form-check">
                          <input type="checkbox" id="address-default" v-model="currentAddress.isDefault" class="form-check-input">
                          <label for="address-default" class="form-check-label">Set as default address</label>
                        </div>
                      </div>
                      
                      <div class="form-actions">
                        <button type="submit" class="btn btn-primary" :disabled="isSaving">Save Address</button>
                        <button type="button" @click="cancelAddressEdit" class="btn btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Order History Section -->
            <div v-if="activeSection === 'orders'" class="account-section">
              <h2>Order History</h2>
              
              <div v-if="orders.length === 0" class="empty-state">
                <p>You haven't placed any orders yet.</p>
                <router-link to="/products" class="btn btn-primary">Start Shopping</router-link>
              </div>
              
              <div v-else>
                <div class="order-list">
                  <div v-for="order in orders" :key="order.id" class="order-item">
                    <div class="card">
                      <div class="card-header">
                        <div class="order-header">
                          <div class="order-number">Order #{{ order.id }}</div>
                          <div class="order-date">{{ formatDate(order.date) }}</div>
                          <div class="order-status" :class="order.status.toLowerCase()">{{ order.status }}</div>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="order-products">
                          <div v-for="item in order.items" :key="item.id" class="order-product">
                            <div class="product-image">
                              <img :src="item.image" :alt="item.name" width="80" height="80">
                            </div>
                            <div class="product-details">
                              <div class="product-name">{{ item.name }}</div>
                              <div class="product-price">{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="order-summary">
                          <div class="order-total">Total: {{ formatPrice(order.total) }}</div>
                          <div class="order-actions">
                            <button @click="viewOrderDetails(order.id)" class="btn btn-sm btn-secondary">View Details</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Wishlist Section -->
            <div v-if="activeSection === 'wishlist'" class="account-section">
              <h2>Wishlist</h2>
              
              <div v-if="wishlist.length === 0" class="empty-state">
                <p>Your wishlist is empty.</p>
                <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
              </div>
              
              <div v-else class="product-grid">
                <div v-for="product in wishlist" :key="product.id" class="product-card">
                  <img :src="product.image" :alt="product.name" class="product-image">
                  <div class="product-details">
                    <h3>{{ product.name }}</h3>
                    <p class="product-price">{{ formatPrice(product.price) }}</p>
                    <div class="product-actions">
                      <button @click="addToCart(product)" class="btn btn-primary" :disabled="!product.inStock">
                        {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
                      </button>
                      <button @click="removeFromWishlist(product.id)" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Security Section -->
            <div v-if="activeSection === 'security'" class="account-section">
              <h2>Security Settings</h2>
              
              <div class="card">
                <div class="card-header">
                  <h3>Change Password</h3>
                </div>
                <div class="card-body">
                  <form @submit.prevent="changePassword">
                    <div class="form-group">
                      <label for="current-password">Current Password</label>
                      <input type="password" id="current-password" v-model="passwordForm.currentPassword" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="new-password">New Password</label>
                      <input type="password" id="new-password" v-model="passwordForm.newPassword" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="confirm-password">Confirm New Password</label>
                      <input type="password" id="confirm-password" v-model="passwordForm.confirmPassword" class="form-control" required>
                    </div>
                    
                    <div v-if="passwordError" class="alert alert-danger">{{ passwordError }}</div>
                    
                    <div v-if="passwordSuccess" class="alert alert-success">{{ passwordSuccess }}</div>
                    
                    <button type="submit" class="btn btn-primary" :disabled="isSaving">
                      <i v-if="isSaving" class="fas fa-spinner fa-spin"></i> Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      activeSection: 'profile',
      isSaving: false,
      profile: {
        name: '',
        email: '',
        phone: '',
        createdAt: null
      },
      addresses: [],
      orders: [],
      wishlist: [],
      showAddressForm: false,
      editingAddressIndex: -1,
      currentAddress: {
        type: 'Shipping',
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        isDefault: false
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordSuccess: ''
    };
  },
  
  methods: {
    setActiveSection(section) {
      this.activeSection = section;
    },
    
    logout() {
      this.$root.logout();
      this.$router.push('/login');
    },
    
    updateProfile() {
      this.isSaving = true;
      
      // Simulate API call
      setTimeout(() => {
        // In a real app, this would call an API to update the profile
        this.isSaving = false;
        alert('Profile updated successfully!');
      }, 1000);
    },
    
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    
    formatPrice(price) {
      return '$' + price.toFixed(2);
    },
    
    editAddress(index) {
      this.editingAddressIndex = index;
      this.currentAddress = { ...this.addresses[index] };
      this.showAddressForm = true;
    },
    
    removeAddress(index) {
      if (confirm('Are you sure you want to remove this address?')) {
        this.addresses.splice(index, 1);
      }
    },
    
    saveAddress() {
      this.isSaving = true;
      
      // Simulate API call
      setTimeout(() => {
        if (this.editingAddressIndex >= 0) {
          // Update existing address
          this.addresses[this.editingAddressIndex] = { ...this.currentAddress };
        } else {
          // Add new address
          this.addresses.push({ ...this.currentAddress });
        }
        
        this.resetAddressForm();
        this.isSaving = false;
      }, 800);
    },
    
    cancelAddressEdit() {
      this.resetAddressForm();
    },
    
    resetAddressForm() {
      this.currentAddress = {
        type: 'Shipping',
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        isDefault: false
      };
      this.editingAddressIndex = -1;
      this.showAddressForm = false;
    },
    
    addToCart(product) {
      this.$root.addToCart(product);
    },
    
    removeFromWishlist(productId) {
      this.wishlist = this.wishlist.filter(item => item.id !== productId);
    },
    
    viewOrderDetails(orderId) {
      alert(`View details for order #${orderId} - This would open a detailed order view in a real application`);
    },
    
    changePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';
      
      // Validate passwords
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'The new passwords do not match';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'New password must be at least 6 characters long';
        return;
      }
      
      this.isSaving = true;
      
      // Simulate API call
      setTimeout(() => {
        // In a real app, this would call an API to update the password
        this.isSaving = false;
        this.passwordSuccess = 'Password has been changed successfully';
        
        // Reset form
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      }, 1000);
    },
    
    loadUserData() {
      // Normally this would come from an API
      const userData = this.$root.store.user || {};
      
      this.profile = {
        name: userData.name || 'Demo User',
        email: userData.email || 'user@example.com',
        phone: userData.phone || '',
        createdAt: new Date().toISOString()
      };
      
      // Sample addresses
      this.addresses = [
        {
          type: 'Shipping',
          name: 'Demo User',
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'United States',
          isDefault: true
        }
      ];
      
      // Sample orders
      this.orders = [
        {
          id: 'ORD12345',
          date: new Date().toISOString(),
          status: 'Delivered',
          items: [
            {
              id: 1,
              name: 'Smartphone X1',
              price: 799.99,
              quantity: 1,
              image: 'https://via.placeholder.com/80x80?text=Smartphone'
            },
            {
              id: 3,
              name: 'Wireless Headphones',
              price: 199.99,
              quantity: 1,
              image: 'https://via.placeholder.com/80x80?text=Headphones'
            }
          ],
          total: 999.98
        }
      ];
      
      // Sample wishlist
      this.wishlist = [
        {
          id: 2,
          name: 'Laptop Pro',
          price: 1299.99,
          image: 'https://via.placeholder.com/200x200?text=Laptop',
          inStock: true
        },
        {
          id: 5,
          name: 'Smart Watch',
          price: 249.99,
          image: 'https://via.placeholder.com/200x200?text=Watch',
          inStock: true
        }
      ];
    }
  },
  
  mounted() {
    // Check authentication status
    if (!this.$root.store.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    
    // Load user data
    this.loadUserData();
  }
};