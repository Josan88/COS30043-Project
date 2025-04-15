/**
 * AccountPage Component
 * Displays user information and allows for profile editing
 */
const AccountPage = {
  template: `
    <div class="account-page">
      <div class="container py-5">
        <div class="row">
          <!-- Account Sidebar -->
          <div class="col-lg-3 mb-4 mb-lg-0">
            <div class="card shadow-sm">
              <div class="card-body text-center py-4">
                <div class="account-avatar mb-3">
                  <div class="avatar-circle">
                    <span class="avatar-initials">{{ userInitials }}</span>
                  </div>
                </div>
                <h5 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h5>
                <p class="text-muted small mb-3">{{ user.email }}</p>
                <div class="d-grid">
                  <button class="btn btn-outline-danger" @click="confirmLogout">
                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                  </button>
                </div>
              </div>
              <div class="list-group list-group-flush">
                <button 
                  v-for="(tab, index) in tabs" 
                  :key="index"
                  class="list-group-item list-group-item-action" 
                  :class="{ 'active': activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  <i :class="'fas fa-' + tab.icon + ' me-2'"></i> {{ tab.name }}
                </button>
              </div>
              <div class="card-footer text-center py-3">
                <small class="text-muted">Member since {{ formattedDate }}</small>
              </div>
            </div>
          </div>
          
          <!-- Account Content -->
          <div class="col-lg-9">
            <div class="card shadow-sm">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0">{{ activeTabTitle }}</h4>
              </div>
              <div class="card-body">
                <!-- Profile Information Tab -->
                <div v-if="activeTab === 'profile'" class="profile-tab">
                  <!-- Success Alert -->
                  <div v-if="profileSuccess" class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle me-2"></i> {{ profileSuccess }}
                  </div>
                  
                  <!-- Error Alert -->
                  <div v-if="profileError" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ profileError }}
                  </div>
                  
                  <form @submit.prevent="updateProfile">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label for="firstName" class="form-label">First Name</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="firstName" 
                          v-model.trim="profileForm.firstName"
                          :class="{ 'is-invalid': profileSubmitted && profileValidationErrors.firstName }"
                          required
                        >
                        <div v-if="profileSubmitted && profileValidationErrors.firstName" class="invalid-feedback">
                          {{ profileValidationErrors.firstName }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label for="lastName" class="form-label">Last Name</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="lastName" 
                          v-model.trim="profileForm.lastName"
                          :class="{ 'is-invalid': profileSubmitted && profileValidationErrors.lastName }"
                          required
                        >
                        <div v-if="profileSubmitted && profileValidationErrors.lastName" class="invalid-feedback">
                          {{ profileValidationErrors.lastName }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="email" class="form-label">Email Address</label>
                      <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        v-model="user.email"
                        disabled
                      >
                      <div class="form-text">Email address cannot be changed.</div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="phone" class="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        class="form-control" 
                        id="phone" 
                        v-model.trim="profileForm.phone"
                        :class="{ 'is-invalid': profileSubmitted && profileValidationErrors.phone }"
                      >
                      <div v-if="profileSubmitted && profileValidationErrors.phone" class="invalid-feedback">
                        {{ profileValidationErrors.phone }}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label for="address" class="form-label">Shipping Address</label>
                      <textarea 
                        class="form-control" 
                        id="address" 
                        v-model.trim="profileForm.address"
                        rows="3"
                        :class="{ 'is-invalid': profileSubmitted && profileValidationErrors.address }"
                      ></textarea>
                      <div v-if="profileSubmitted && profileValidationErrors.address" class="invalid-feedback">
                        {{ profileValidationErrors.address }}
                      </div>
                    </div>
                    
                    <div class="d-flex justify-content-end">
                      <button type="submit" class="btn btn-primary" :disabled="isProfileSubmitting">
                        <span v-if="isProfileSubmitting">
                          <i class="fas fa-spinner fa-spin me-2"></i> Saving...
                        </span>
                        <span v-else>
                          <i class="fas fa-save me-2"></i> Save Changes
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
                
                <!-- Security Tab -->
                <div v-if="activeTab === 'security'" class="security-tab">
                  <!-- Success Alert -->
                  <div v-if="securitySuccess" class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle me-2"></i> {{ securitySuccess }}
                  </div>
                  
                  <!-- Error Alert -->
                  <div v-if="securityError" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ securityError }}
                  </div>
                  
                  <form @submit.prevent="updatePassword">
                    <div class="mb-3">
                      <label for="currentPassword" class="form-label">Current Password</label>
                      <div class="input-group">
                        <input 
                          :type="showCurrentPassword ? 'text' : 'password'" 
                          class="form-control" 
                          id="currentPassword" 
                          v-model="passwordForm.currentPassword"
                          :class="{ 'is-invalid': passwordSubmitted && passwordValidationErrors.currentPassword }"
                          required
                        >
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary" 
                          @click="togglePasswordVisibility('current')"
                        >
                          <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <div v-if="passwordSubmitted && passwordValidationErrors.currentPassword" class="invalid-feedback">
                          {{ passwordValidationErrors.currentPassword }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="newPassword" class="form-label">New Password</label>
                      <div class="input-group">
                        <input 
                          :type="showNewPassword ? 'text' : 'password'" 
                          class="form-control" 
                          id="newPassword" 
                          v-model="passwordForm.newPassword"
                          :class="{ 'is-invalid': passwordSubmitted && passwordValidationErrors.newPassword }"
                          required
                        >
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary" 
                          @click="togglePasswordVisibility('new')"
                        >
                          <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <div v-if="passwordSubmitted && passwordValidationErrors.newPassword" class="invalid-feedback">
                          {{ passwordValidationErrors.newPassword }}
                        </div>
                      </div>
                      <div class="form-text">Password must be at least 8 characters with uppercase, lowercase and numbers.</div>
                    </div>
                    
                    <div class="mb-4">
                      <label for="confirmPassword" class="form-label">Confirm New Password</label>
                      <div class="input-group">
                        <input 
                          :type="showConfirmPassword ? 'text' : 'password'" 
                          class="form-control" 
                          id="confirmPassword" 
                          v-model="passwordForm.confirmPassword"
                          :class="{ 'is-invalid': passwordSubmitted && passwordValidationErrors.confirmPassword }"
                          required
                        >
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary" 
                          @click="togglePasswordVisibility('confirm')"
                        >
                          <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <div v-if="passwordSubmitted && passwordValidationErrors.confirmPassword" class="invalid-feedback">
                          {{ passwordValidationErrors.confirmPassword }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="d-flex justify-content-end">
                      <button type="submit" class="btn btn-primary" :disabled="isPasswordSubmitting">
                        <span v-if="isPasswordSubmitting">
                          <i class="fas fa-spinner fa-spin me-2"></i> Updating...
                        </span>
                        <span v-else>
                          <i class="fas fa-lock me-2"></i> Update Password
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
                
                <!-- Order History Tab -->
                <div v-if="activeTab === 'orders'" class="orders-tab">
                  <div v-if="userOrders.length === 0" class="text-center py-5">
                    <div class="mb-3">
                      <i class="fas fa-shopping-bag fa-3x text-muted"></i>
                    </div>
                    <h5>No purchases yet</h5>
                    <p class="text-muted">You haven't made any purchases yet.</p>
                    <router-link to="/products" class="btn btn-primary mt-2">
                      <i class="fas fa-shopping-cart me-2"></i> Start Shopping
                    </router-link>
                  </div>
                  <div v-else>
                    <div class="list-group">
                      <div v-for="order in userOrders" :key="order.id" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                          <div>
                            <h6 class="mb-1">Order #{{ order.id.toString().slice(-8) }}</h6>
                            <p class="small text-muted mb-0">
                              {{ new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                            </p>
                          </div>
                          <div class="d-flex align-items-center">
                            <span class="badge me-2" :class="getStatusBadgeClass(order.status)">
                              {{ order.status }}
                            </span>
                            <router-link :to="'/purchases'" class="btn btn-sm btn-outline-primary">
                              View Details
                            </router-link>
                          </div>
                        </div>
                        <div class="mt-2">
                          <span class="text-muted">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }} | Total: </span>
                          <span class="fw-bold">{{ $filters.currency(order.totals.total) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="mt-3 text-center">
                      <router-link to="/purchases" class="btn btn-primary">
                        <i class="fas fa-history me-2"></i> View All Purchase History
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Logout Confirmation Modal -->
      <div v-if="showLogoutModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm Logout</h5>
              <button type="button" class="btn-close" @click="showLogoutModal = false"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showLogoutModal = false">Cancel</button>
              <button type="button" class="btn btn-danger" @click="logout">
                <i class="fas fa-sign-out-alt me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Backdrop -->
      <div v-if="showLogoutModal" class="modal-backdrop fade show"></div>
    </div>
  `,
  data() {
    return {
      user: {},
      activeTab: 'profile',
      tabs: [
        { id: 'profile', name: 'Profile Information', icon: 'user' },
        { id: 'security', name: 'Security Settings', icon: 'lock' },
        { id: 'orders', name: 'Purchase History', icon: 'shopping-bag' }
      ],
      
      // Profile form
      profileForm: {
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      },
      profileValidationErrors: {},
      profileSubmitted: false,
      isProfileSubmitting: false,
      profileSuccess: null,
      profileError: null,
      
      // Password form
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordValidationErrors: {},
      passwordSubmitted: false,
      isPasswordSubmitting: false,
      securitySuccess: null,
      securityError: null,
      
      // Password visibility toggles
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      
      // Logout modal
      showLogoutModal: false,

      // User orders
      userOrders: []
    };
  },
  computed: {
    // Get user initials for avatar
    userInitials() {
      if (!this.user.firstName || !this.user.lastName) return '?';
      return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`;
    },
    
    // Get title of active tab
    activeTabTitle() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.name : '';
    },
    
    // Get formatted date for account creation
    formattedDate() {
      if (!this.user.createdAt) return 'Unknown';
      const date = new Date(this.user.createdAt);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  created() {
    // Load user data when component is created
    this.loadUserData();
    this.loadUserOrders();
  },
  methods: {
    // Load user data from AuthService
    loadUserData() {
      const user = AuthService.getCurrentUser();
      
      if (!user) {
        // Redirect to login if not logged in
        this.$router.push('/login?redirect=/account');
        return;
      }
      
      this.user = user;
      
      // Initialize profile form with user data
      this.profileForm = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || ''
      };
    },

    // Load user orders from CartService
    async loadUserOrders() {
      try {
        const orders = await CartService.getUserOrders();
        this.userOrders = orders || [];
      } catch (error) {
        console.error('Failed to load user orders:', error);
      }
    },
    
    // Validate profile form
    validateProfileForm() {
      const errors = {};
      this.profileSubmitted = true;
      
      // First name validation
      if (!this.profileForm.firstName) {
        errors.firstName = 'First name is required';
      } else if (this.profileForm.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      }
      
      // Last name validation
      if (!this.profileForm.lastName) {
        errors.lastName = 'Last name is required';
      } else if (this.profileForm.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      }
      
      // Phone validation (optional)
      if (this.profileForm.phone && !/^[0-9+\-\s()]{8,20}$/.test(this.profileForm.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      this.profileValidationErrors = errors;
      return Object.keys(errors).length === 0;
    },
    
    // Update profile information
    async updateProfile() {
      // Clear previous messages
      this.profileSuccess = null;
      this.profileError = null;
      
      // Validate form
      if (!this.validateProfileForm()) return;
      
      // Set submitting state
      this.isProfileSubmitting = true;
      
      try {
        // Call AuthService to update profile
        const response = await AuthService.updateProfile(this.profileForm);
        
        if (response.success) {
          // Update local user data
          this.user = response.user;
          this.profileSuccess = 'Your profile has been updated successfully.';
          
          // Reset form state but keep form values
          this.profileSubmitted = false;
        } else {
          this.profileError = response.message || 'Failed to update profile. Please try again.';
        }
      } catch (error) {
        console.error('Profile update error:', error);
        this.profileError = 'An unexpected error occurred. Please try again.';
      } finally {
        this.isProfileSubmitting = false;
      }
    },
    
    // Validate password form
    validatePasswordForm() {
      const errors = {};
      this.passwordSubmitted = true;
      
      // Current password validation
      if (!this.passwordForm.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      
      // New password validation
      if (!this.passwordForm.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (this.passwordForm.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.passwordForm.newPassword)) {
        errors.newPassword = 'Password must include uppercase, lowercase, and numbers';
      }
      
      // Confirm password validation
      if (!this.passwordForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      this.passwordValidationErrors = errors;
      return Object.keys(errors).length === 0;
    },
    
    // Update password
    async updatePassword() {
      // Clear previous messages
      this.securitySuccess = null;
      this.securityError = null;
      
      // Validate form
      if (!this.validatePasswordForm()) return;
      
      // Set submitting state
      this.isPasswordSubmitting = true;
      
      try {
        // Call AuthService to update password
        const response = await AuthService.updatePassword(
          this.passwordForm.currentPassword,
          this.passwordForm.newPassword
        );
        
        if (response.success) {
          this.securitySuccess = 'Your password has been updated successfully.';
          
          // Reset form
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.passwordSubmitted = false;
        } else {
          this.securityError = response.message || 'Failed to update password. Please try again.';
        }
      } catch (error) {
        console.error('Password update error:', error);
        this.securityError = 'An unexpected error occurred. Please try again.';
      } finally {
        this.isPasswordSubmitting = false;
      }
    },
    
    // Toggle password visibility
    togglePasswordVisibility(field) {
      if (field === 'current') {
        this.showCurrentPassword = !this.showCurrentPassword;
      } else if (field === 'new') {
        this.showNewPassword = !this.showNewPassword;
      } else if (field === 'confirm') {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    
    // Show logout confirmation modal
    confirmLogout() {
      this.showLogoutModal = true;
    },
    
    // Logout user
    logout() {
      AuthService.logout();
      this.showLogoutModal = false;
      this.$router.push('/login');
    },

    // Get badge class for order status
    getStatusBadgeClass(status) {
      switch (status) {
        case 'Pending':
          return 'bg-warning text-dark';
        case 'Completed':
          return 'bg-success';
        case 'Cancelled':
          return 'bg-danger';
        default:
          return 'bg-secondary';
      }
    }
  }
};

// Make the component globally available
window.AccountPage = AccountPage;