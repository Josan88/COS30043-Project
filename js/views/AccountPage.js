const AccountPage = {
  template: `
    <div class="account-page">
      <div class="container py-5">
        <div class="row">
          <!-- Enhanced Account Sidebar with Accessibility -->
          <div class="col-lg-3 mb-4 mb-lg-0">
            <div class="card shadow-sm" v-scroll-reveal="{ delay: 100 }">
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
              <div class="list-group list-group-flush" role="tablist">
                <button 
                  v-for="(tab, index) in tabs" 
                  :key="index"
                  class="list-group-item list-group-item-action" 
                  :class="{ 'active': activeTab === tab.id }"
                  @click="activeTab = tab.id"
                  role="tab"
                  :aria-selected="activeTab === tab.id"
                  :aria-controls="tab.id + '-panel'"
                >
                  <i :class="'fas fa-' + tab.icon + ' me-2'"></i> {{ tab.name }}
                </button>
              </div>
              <div class="card-footer text-center py-3">
                <small class="text-muted">Member since {{ formattedDate | formatRelativeTime }}</small>
              </div>
            </div>
          </div>
          
          <!-- Enhanced Account Content with Focus Management -->
          <div class="col-lg-9">
            <div class="card shadow-sm" v-scroll-reveal="{ delay: 200 }">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0">{{ activeTabTitle }}</h4>
              </div>
              <div class="card-body" v-focus-trap>
                <!-- Enhanced Profile Information Tab -->
                <div v-if="activeTab === 'profile'" class="profile-tab" role="tabpanel" id="profile-panel">
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
                          v-validate="{ 
                            rules: { required: true, minLength: 2, maxLength: 50, alphabetic: true }, 
                            message: 'First name must be 2-50 alphabetic characters'
                          }"
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
                          v-validate="{ 
                            rules: { required: true, minLength: 2, maxLength: 50, alphabetic: true }, 
                            message: 'Last name must be 2-50 alphabetic characters'
                          }"
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
                    <router-link to="/product" class="btn btn-primary mt-2">
                      <i class="fas fa-shopping-cart me-2"></i> Start Shopping
                    </router-link>
                  </div>
                  <div v-else>
                    <div class="list-group">
                      <div v-for="order in userOrders" :key="order.id" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between align-items-center">                          <div>
                            <h6 class="mb-1">Order #{{ order.id.toString().slice(-8) }}</h6>
                            <p class="small text-muted mb-0">
                              {{ new Date(order.orderDate || order.date || order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
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
                        </div>                        <div class="mt-2">
                          <span class="text-muted">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }} | Total: </span>
                          <span class="fw-bold">{{ $currency(order.totals?.total || order.total || 0) }}</span>
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
      // Component Configuration
      config: {
        maxRetries: window.APP_CONSTANTS?.API?.MAX_RETRIES || 3,
        debounceDelay: window.APP_CONSTANTS?.UI?.DEBOUNCE_DELAY || 300,
        autoSaveDelay: window.APP_CONSTANTS?.UI?.AUTO_SAVE_DELAY || 2000,
        validationMessages: window.APP_CONSTANTS?.VALIDATION?.MESSAGES || {},
      },

      // User Data
      user: {},
      originalUserData: {}, // UI State
      uiState: {
        activeTab: "profile",
        isLoading: false,
        hasUnsavedChanges: false,
        lastSaveTime: null,
      },

      // Tab Configuration
      tabs: [
        {
          id: "profile",
          name: "Profile Information",
          icon: "user",
          description: "Manage your personal information",
        },
        {
          id: "security",
          name: "Security Settings",
          icon: "lock",
          description: "Update your password and security settings",
        },
        {
          id: "orders",
          name: "Purchase History",
          icon: "shopping-bag",
          description: "View your order history and track purchases",
        },
      ],

      // Profile Form Data
      profileForm: {
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        email: "",
      },

      // Profile Form State
      profileState: {
        validation: {
          errors: {},
          touched: {},
        },
        isSubmitting: false,
        submitted: false,
        isDirty: false,
      },

      // Password Form Data
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },

      // Password Form State
      passwordState: {
        validation: {
          errors: {},
          touched: {},
        },
        isSubmitting: false,
        submitted: false,
        showPasswords: {
          current: false,
          new: false,
          confirm: false,
        },
        strength: {
          score: 0,
          feedback: "",
        },
      },

      // Error and Success States
      feedback: {
        profile: {
          success: null,
          error: null,
        },
        security: {
          success: null,
          error: null,
        },
        orders: {
          error: null,
        },
      },

      // Orders Data and State
      ordersData: {
        orders: [],
        filteredOrders: [],
        filters: {
          status: "all",
          dateRange: "all",
          searchQuery: "",
        },
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
        },
        isLoading: false,
      }, // Modal States
      modals: {
        logout: false,
        orderDetails: false,
        selectedOrder: null,
      },

      // Component State
      componentState: {
        isMounted: false,
        hasInitialized: false,
        loadError: null,
        validator: null,
      },
    };
  },

  filters: {
    formatRelativeTime(date) {
      if (window.Filters && window.Filters.formatRelativeTime) {
        return window.Filters.formatRelativeTime(date);
      }
      // Fallback implementation
      if (!date) return "Unknown";
      const now = new Date();
      const target = new Date(date);
      const diffMs = now - target;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    },
  },

  computed: {
    // Alias for template compatibility
    activeTab: {
      get() {
        return this.uiState.activeTab;
      },
      set(value) {
        this.uiState.activeTab = value;
      },
    },

    // Alias for template compatibility
    showLogoutModal: {
      get() {
        return this.modals.logout;
      },
      set(value) {
        this.modals.logout = value;
      },
    },
    // Get user initials for avatar
    userInitials() {
      if (!this.user.firstName || !this.user.lastName) return "?";
      return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`;
    },

    // Get title of active tab
    activeTabTitle() {
      const tab = this.tabs.find((t) => t.id === this.uiState.activeTab);
      return tab ? tab.name : "";
    },

    // Get description of active tab
    activeTabDescription() {
      const tab = this.tabs.find((t) => t.id === this.uiState.activeTab);
      return tab ? tab.description : "";
    },

    // Get formatted date for account creation
    formattedDate() {
      if (!this.user.createdAt) return "Unknown";
      const date = new Date(this.user.createdAt);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    // Check if profile form is valid
    isProfileFormValid() {
      return (
        Object.keys(this.profileState.validation.errors).length === 0 &&
        this.profileForm.firstName &&
        this.profileForm.lastName
      );
    },

    // Check if password form is valid
    isPasswordFormValid() {
      return (
        Object.keys(this.passwordState.validation.errors).length === 0 &&
        this.passwordForm.currentPassword &&
        this.passwordForm.newPassword &&
        this.passwordForm.confirmPassword
      );
    },

    // Check if profile can be submitted
    canSubmitProfile() {
      return (
        this.isProfileFormValid &&
        !this.profileState.isSubmitting &&
        this.profileState.isDirty
      );
    },

    // Check if password can be submitted
    canSubmitPassword() {
      return this.isPasswordFormValid && !this.passwordState.isSubmitting;
    },

    // Get filtered orders based on current filters
    filteredOrders() {
      let filtered = [...this.ordersData.orders];

      // Filter by status
      if (this.ordersData.filters.status !== "all") {
        filtered = filtered.filter(
          (order) =>
            order.status.toLowerCase() ===
            this.ordersData.filters.status.toLowerCase()
        );
      }

      // Filter by search query
      if (this.ordersData.filters.searchQuery) {
        const query = this.ordersData.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            order.id.toString().includes(query) ||
            order.items.some((item) => item.name.toLowerCase().includes(query))
        );
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      this.ordersData.pagination.totalItems = filtered.length;
      return filtered;
    },

    // Get paginated orders
    paginatedOrders() {
      const start =
        (this.ordersData.pagination.currentPage - 1) *
        this.ordersData.pagination.itemsPerPage;
      const end = start + this.ordersData.pagination.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },

    // Get total pages for pagination
    totalPages() {
      return Math.ceil(
        this.ordersData.pagination.totalItems /
          this.ordersData.pagination.itemsPerPage
      );
    },

    // Check if component is ready
    isReady() {
      return (
        this.componentState.isMounted &&
        this.componentState.hasInitialized &&
        !this.componentState.loadError
      );
    },

    // Get password strength indicator
    passwordStrengthClass() {
      const score = this.passwordState.strength.score;
      if (score < 2) return "weak";
      if (score < 4) return "medium";
      return "strong";
    }, // Check if there are unsaved changes
    hasUnsavedChanges() {
      return this.profileState.isDirty && !this.profileState.isSubmitting;
    },

    // Template helper for showLogoutModal
    showLogoutModal() {
      return this.modals.logout;
    },

    // Template aliases for feedback properties
    profileSuccess() {
      return this.feedback.profile.success;
    },

    profileError() {
      return this.feedback.profile.error;
    },

    profileSubmitted() {
      return this.profileState.submitted;
    },

    isProfileSubmitting() {
      return this.profileState.isSubmitting;
    },

    securitySuccess() {
      return this.feedback.security.success;
    },

    securityError() {
      return this.feedback.security.error;
    },

    passwordSubmitted() {
      return this.passwordState.submitted;
    },

    isPasswordSubmitting() {
      return this.passwordState.isSubmitting;
    },

    // Template aliases for validation errors
    profileFirstNameError() {
      return this.profileState.validation.errors.firstName;
    },

    profileLastNameError() {
      return this.profileState.validation.errors.lastName;
    },

    profileEmailError() {
      return this.profileState.validation.errors.email;
    },

    passwordCurrentError() {
      return this.passwordState.validation.errors.currentPassword;
    },

    passwordNewError() {
      return this.passwordState.validation.errors.newPassword;
    },
    passwordConfirmError() {
      return this.passwordState.validation.errors.confirmPassword;
    },

    // Password visibility computed properties
    showCurrentPassword() {
      return this.passwordState.showPasswords.current;
    },

    showNewPassword() {
      return this.passwordState.showPasswords.new;
    },
    showConfirmPassword() {
      return this.passwordState.showPasswords.confirm;
    },
    // Password validation errors alias
    passwordValidationErrors() {
      return this.passwordState.validation.errors;
    },

    // User orders alias
    userOrders() {
      return this.ordersData.orders || [];
    },
  },

  watch: {
    // Watch for profile form changes
    profileForm: {
      handler(newData, oldData) {
        if (oldData && this.componentState.hasInitialized) {
          this.profileState.isDirty = this.checkIfProfileChanged();
          this.uiState.hasUnsavedChanges = this.profileState.isDirty;
        }
      },
      deep: true,
    },

    // Watch for password form changes
    "passwordForm.newPassword"(newPassword) {
      if (newPassword) {
        this.checkPasswordStrength(newPassword);
        this.validatePasswordField("newPassword");
      }
    },

    // Watch for password confirmation changes
    "passwordForm.confirmPassword"() {
      if (this.passwordForm.confirmPassword) {
        this.validatePasswordField("confirmPassword");
      }
    }, // Watch for active tab changes
    "uiState.activeTab"(newTab, oldTab) {
      // Load orders when switching to orders tab
      if (newTab === "orders") {
        this.loadUserOrders();
      }
    },

    // Watch for unsaved changes
    hasUnsavedChanges(hasChanges) {
      if (hasChanges) {
        window.addEventListener("beforeunload", this.handleBeforeUnload);
      } else {
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
      }
    },
  },

  created() {
    try {
      // Initialize validation service
      if (window.ValidationService) {
        this.componentState.validator = window.ValidationService;
      }

      // Set up debounced validation methods
      this.validateProfileField = window.helpers?.debounce(
        this._validateProfileField.bind(this),
        this.config.debounceDelay
      );
      this.validatePasswordField = window.helpers?.debounce(
        this._validatePasswordField.bind(this),
        this.config.debounceDelay
      );
    } catch (error) {
      console.error("Error in AccountPage created hook:", error);
      this.handleComponentError(error, "created");
    }
  },

  mounted() {
    try {
      this.initializeComponent();
      this.componentState.isMounted = true;
      console.log("AccountPage component mounted successfully");
    } catch (error) {
      console.error("Error mounting AccountPage component:", error);
      this.handleComponentError(error, "mount");
    }
  },

  beforeUnmount() {
    try {
      this.cleanupComponent();
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    } catch (error) {
      console.error("Error cleaning up AccountPage component:", error);
    }
  },
  methods: {
    /**
     * Initialize component with data loading and setup
     */
    async initializeComponent() {
      try {
        this.uiState.isLoading = true; // Load user data and orders
        await Promise.all([this.loadUserData(), this.loadUserOrders()]);

        this.componentState.hasInitialized = true;
      } catch (error) {
        console.error("Error initializing AccountPage:", error);
        this.componentState.loadError =
          "Failed to load account data. Please refresh the page.";
        window.ErrorHandler?.logError(error, {
          component: "AccountPage",
          method: "initializeComponent",
        });
      } finally {
        this.uiState.isLoading = false;
      }
    },

    /**
     * Load user data from AuthService with error handling
     */
    async loadUserData() {
      try {
        const user = window.AuthService?.getCurrentUser();

        if (!user) {
          // Redirect to login if not logged in
          window.ToastService?.error("Please log in to access your account");
          this.$router?.push("/login?redirect=/account");
          return;
        }

        this.user = { ...user };
        this.originalUserData = { ...user };

        // Initialize profile form with user data
        this.profileForm = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          address: user.address || "",
          email: user.email || "",
        };

        // Mark as clean after initial load
        this.$nextTick(() => {
          this.profileState.isDirty = false;
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        window.ToastService?.error("Failed to load user data");
        throw error;
      }
    },
    /**
     * Load user orders with enhanced error handling and database integration
     */ async loadUserOrders() {
      try {
        this.ordersData.isLoading = true;
        this.feedback.orders.error = null;

        const user = window.AuthService?.getCurrentUser();
        if (user?.id) {
          let orders = [];

          try {
            // Primary: Get orders from DatabaseService
            if (window.DatabaseService) {
              orders = await window.DatabaseService.getUserOrders(user.id);
              console.log("Orders loaded from database:", orders.length);
            }

            // Fallback: If no orders from database or service unavailable, try CartService
            if (orders.length === 0 && window.CartService) {
              console.log("Falling back to CartService for orders");
              orders = (await window.CartService.getUserOrders(user.id)) || [];
              // If we found orders in CartService but not in database, sync them
              if (orders.length > 0 && window.DatabaseService) {
                console.log("Syncing orders from CartService to database");
                for (const order of orders) {
                  try {
                    // Use addOrder to save to database
                    await window.DatabaseService.addOrder(order);
                  } catch (syncError) {
                    console.warn(
                      "Failed to sync order to database:",
                      syncError
                    );
                  }
                }
              }
            }
          } catch (dbError) {
            console.warn(
              "Database service error, falling back to CartService:",
              dbError
            );
            // Final fallback to CartService
            if (window.CartService) {
              orders = (await window.CartService.getUserOrders(user.id)) || [];
            }
          }

          this.ordersData.orders = orders;

          // Reset pagination
          this.ordersData.pagination.currentPage = 1;
        } else {
          this.ordersData.orders = [];
        }
      } catch (error) {
        console.error("Failed to load user orders:", error);
        this.feedback.orders.error =
          "Failed to load order history. Please try again.";
        window.ErrorHandler?.logError(error, {
          component: "AccountPage",
          method: "loadUserOrders",
        });
      } finally {
        this.ordersData.isLoading = false;
      }
    },

    /**
     * Check if profile form has changed from original data
     */
    checkIfProfileChanged() {
      return (
        JSON.stringify(this.profileForm) !==
        JSON.stringify({
          firstName: this.originalUserData.firstName || "",
          lastName: this.originalUserData.lastName || "",
          phone: this.originalUserData.phone || "",
          address: this.originalUserData.address || "",
          email: this.originalUserData.email || "",
        })
      );
    },

    /**
     * Enhanced profile field validation
     */
    _validateProfileField(fieldName, showErrors = false) {
      try {
        if (
          showErrors ||
          this.profileState.validation.touched[fieldName] ||
          this.profileState.submitted
        ) {
          this.profileState.validation.touched[fieldName] = true;

          const value = this.profileForm[fieldName];
          let error = null;

          switch (fieldName) {
            case "firstName":
            case "lastName":
              if (!value) {
                error = `${
                  fieldName === "firstName" ? "First" : "Last"
                } name is required`;
              } else if (this.componentState.validator) {
                const result =
                  this.componentState.validator.validateName(value);
                if (!result.isValid) {
                  error = result.message;
                }
              } else {
                // Fallback validation
                const minLength =
                  window.APP_CONSTANTS?.VALIDATION?.MIN_NAME_LENGTH || 2;
                const maxLength =
                  window.APP_CONSTANTS?.VALIDATION?.MAX_NAME_LENGTH || 50;
                if (value.length < minLength) {
                  error = `Name must be at least ${minLength} characters`;
                } else if (value.length > maxLength) {
                  error = `Name must be less than ${maxLength} characters`;
                }
              }
              break;

            case "email":
              if (value && this.componentState.validator) {
                const result =
                  this.componentState.validator.validateEmail(value);
                if (!result.isValid) {
                  error = result.message;
                }
              } else if (value) {
                // Fallback validation
                const emailPattern =
                  window.APP_CONSTANTS?.VALIDATION?.EMAIL_PATTERN ||
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                  error = "Please enter a valid email address";
                }
              }
              break;

            case "phone":
              if (value && this.componentState.validator) {
                const result =
                  this.componentState.validator.validatePhone(value);
                if (!result.isValid) {
                  error = result.message;
                }
              } else if (value) {
                // Fallback validation
                const phonePattern =
                  window.APP_CONSTANTS?.VALIDATION?.PHONE_PATTERN ||
                  /^[0-9+\-\s()]{8,20}$/;
                if (!phonePattern.test(value)) {
                  error = "Please enter a valid phone number";
                }
              }
              break;
          }
          if (error) {
            this.profileState.validation.errors[fieldName] = error;
          } else {
            delete this.profileState.validation.errors[fieldName];
          }
        }
      } catch (error) {
        console.error(`Error validating profile field ${fieldName}:`, error);
      }
    },

    /**
     * Enhanced password field validation
     */
    _validatePasswordField(fieldName, showErrors = false) {
      try {
        if (
          showErrors ||
          this.passwordState.validation.touched[fieldName] ||
          this.passwordState.submitted
        ) {
          this.passwordState.validation.touched[fieldName] = true;

          const value = this.passwordForm[fieldName];
          let error = null;

          switch (fieldName) {
            case "currentPassword":
              if (!value) {
                error = "Current password is required";
              }
              break;

            case "newPassword":
              if (!value) {
                error = "New password is required";
              } else if (this.componentState.validator) {
                const result =
                  this.componentState.validator.validatePassword(value);
                if (!result.isValid) {
                  error = result.message;
                }
              } else {
                // Fallback validation
                const minLength =
                  window.APP_CONSTANTS?.VALIDATION?.MIN_PASSWORD_LENGTH || 8;
                if (value.length < minLength) {
                  error = `Password must be at least ${minLength} characters`;
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                  error =
                    "Password must include uppercase, lowercase, and numbers";
                }
              }
              break;

            case "confirmPassword":
              if (!value) {
                error = "Please confirm your new password";
              } else if (value !== this.passwordForm.newPassword) {
                error = "Passwords do not match";
              }
              break;
          }
          if (error) {
            this.passwordState.validation.errors[fieldName] = error;
          } else {
            delete this.passwordState.validation.errors[fieldName];
          }
        }
      } catch (error) {
        console.error(`Error validating password field ${fieldName}:`, error);
      }
    },

    /**
     * Check password strength and provide feedback
     */
    checkPasswordStrength(password) {
      try {
        let score = 0;
        let feedback = "";

        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;

        switch (score) {
          case 0:
          case 1:
            feedback = "Very weak password";
            break;
          case 2:
            feedback = "Weak password";
            break;
          case 3:
            feedback = "Medium password";
            break;
          case 4:
            feedback = "Strong password";
            break;
          case 5:
            feedback = "Very strong password";
            break;
        }

        this.passwordState.strength = { score, feedback };
      } catch (error) {
        console.error("Error checking password strength:", error);
      }
    },

    /**
     * Enhanced profile update with comprehensive validation
     */
    async updateProfile() {
      try {
        // Clear previous feedback
        this.feedback.profile.success = null;
        this.feedback.profile.error = null;

        // Validate all fields
        this.profileState.submitted = true;
        ["firstName", "lastName", "email", "phone"].forEach((field) => {
          this._validateProfileField(field, true);
        });

        if (!this.isProfileFormValid) {
          this.focusFirstError("profile");
          return;
        }
        this.profileState.isSubmitting = true;

        // Call AuthService to update profile
        const response = await window.AuthService?.updateProfile(
          this.profileForm
        );

        if (response?.success) {
          // Update local user data
          this.user = { ...response.user };
          this.originalUserData = { ...response.user };
          this.profileState.isDirty = false;
          this.uiState.hasUnsavedChanges = false;
          this.uiState.lastSaveTime = Date.now();

          // Show success message          this.feedback.profile.success = window.APP_CONSTANTS?.MESSAGES?.SUCCESS?.PROFILE_UPDATED ||
          ("Your profile has been updated successfully.");

          window.ToastService?.success(this.feedback.profile.success); // Reset form state
          this.profileState.submitted = false;
        } else {
          this.feedback.profile.error =
            response?.message || "Failed to update profile. Please try again.";
          window.ToastService?.error(this.feedback.profile.error);
        }
      } catch (error) {
        console.error("Profile update error:", error);
        this.feedback.profile.error =
          "An unexpected error occurred. Please try again.";
        window.ToastService?.error(this.feedback.profile.error);

        window.ErrorHandler?.logError(error, {
          component: "AccountPage",
          method: "updateProfile",
        });
      } finally {
        this.profileState.isSubmitting = false;
      }
    },

    /**
     * Enhanced password update with comprehensive validation
     */
    async updatePassword() {
      try {
        // Clear previous feedback
        this.feedback.security.success = null;
        this.feedback.security.error = null;

        // Validate all fields
        this.passwordState.submitted = true;
        ["currentPassword", "newPassword", "confirmPassword"].forEach(
          (field) => {
            this._validatePasswordField(field, true);
          }
        );

        if (!this.isPasswordFormValid) {
          this.focusFirstError("password");
          return;
        }
        this.passwordState.isSubmitting = true;

        // Call AuthService to update password
        const response = await window.AuthService?.updatePassword(
          this.passwordForm.currentPassword,
          this.passwordForm.newPassword
        );

        if (response?.success) {
          this.feedback.security.success =
            window.APP_CONSTANTS?.MESSAGES?.SUCCESS?.PASSWORD_UPDATED ||
            "Your password has been updated successfully.";

          window.ToastService?.success(this.feedback.security.success);

          // Reset form
          this.passwordForm = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          };
          this.passwordState.submitted = false;
          this.passwordState.validation.errors = {};
          this.passwordState.strength = { score: 0, feedback: "" };
        } else {
          this.feedback.security.error =
            response?.message || "Failed to update password. Please try again.";
          window.ToastService?.error(this.feedback.security.error);
        }
      } catch (error) {
        console.error("Password update error:", error);
        this.feedback.security.error =
          "An unexpected error occurred. Please try again.";
        window.ToastService?.error(this.feedback.security.error);

        window.ErrorHandler?.logError(error, {
          component: "AccountPage",
          method: "updatePassword",
        });
      } finally {
        this.passwordState.isSubmitting = false;
      }
    },

    /**
     * Switch to a different tab
     */
    switchTab(tabId) {
      try {
        if (this.hasUnsavedChanges) {
          const confirmSwitch = confirm(
            "You have unsaved changes. Do you want to continue without saving?"
          );
          if (!confirmSwitch) {
            return;
          }
        }

        this.uiState.activeTab = tabId;

        // Clear any existing feedback when switching tabs
        Object.keys(this.feedback).forEach((key) => {
          this.feedback[key].success = null;
          this.feedback[key].error = null;
        });
      } catch (error) {
        console.error("Error switching tab:", error);
      }
    },
    /**
     * Toggle password visibility
     */ togglePasswordVisibility(field) {
      try {
        this.passwordState.showPasswords[field] =
          !this.passwordState.showPasswords[field];
      } catch (error) {
        console.error("Error toggling password visibility:", error);
      }
    },

    /**
     * Focus on first error field
     */
    focusFirstError(formType) {
      this.$nextTick(() => {
        const selector =
          formType === "profile"
            ? ".profile-form .is-invalid"
            : ".password-form .is-invalid";

        const firstErrorField = document.querySelector(selector);
        if (firstErrorField) {
          firstErrorField.focus();
        }
      });
    },

    /**
     * Handle before unload event
     */
    handleBeforeUnload(event) {
      if (this.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return event.returnValue;
      }
    },

    /**
     * Show logout confirmation modal
     */
    confirmLogout() {
      this.modals.logout = true;
    },
    /**
     * Logout user
     */ async logout() {
      try {
        window.AuthService?.logout();
        this.modals.logout = false;

        window.ToastService?.success("You have been logged out successfully");
        this.$router?.push("/login");
      } catch (error) {
        console.error("Error during logout:", error);
        window.ToastService?.error("Error during logout. Please try again.");
      }
    },
    /**
     * Filter orders by status
     */ filterOrdersByStatus(status) {
      this.ordersData.filters.status = status;
      this.ordersData.pagination.currentPage = 1;
    },

    /**
     * Search orders
     */
    searchOrders(query) {
      this.ordersData.filters.searchQuery = query;
      this.ordersData.pagination.currentPage = 1;
    },

    /**
     * Change pagination
     */
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.ordersData.pagination.currentPage = page;
      }
    },

    /**
     * Get badge class for order status
     */
    getStatusBadgeClass(status) {
      const statusMap = window.APP_CONSTANTS?.ORDER_STATUS_CLASSES || {
        pending: "bg-warning text-dark",
        completed: "bg-success",
        cancelled: "bg-danger",
        processing: "bg-info",
        shipped: "bg-primary",
      };

      return statusMap[status.toLowerCase()] || "bg-secondary";
    },
    /**
     * Handle component errors
     */ handleComponentError(error, context = "unknown") {
      try {
        console.error(`AccountPage component error in ${context}:`, error);

        // Report to error handler
        window.ErrorHandler?.logError(error, {
          component: "AccountPage",
          context,
          timestamp: Date.now(),
        });
      } catch (trackingError) {
        console.error("Error handling component error:", trackingError);
      }
    },

    /**
     * Cleanup component resources
     */
    cleanupComponent() {
      try {
        // No specific cleanup needed currently
      } catch (error) {
        console.error("Error cleaning up component:", error);
      }
    },

    /**
     * Format relative time for display
     */
    formatRelativeTime(date) {
      if (window.Filters && window.Filters.formatRelativeTime) {
        return window.Filters.formatRelativeTime(date);
      }
      // Fallback implementation
      if (!date) return "Unknown";
      const now = new Date();
      const target = new Date(date);
      const diffMs = now - target;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    },
  },
};

// Make the component globally available
window.AccountPage = AccountPage;
