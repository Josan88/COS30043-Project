/**
 * NavBar Component
 * Main navigation bar for the in-restaurant food ordering application
 * Enhanced with better structure, constants, and error handling
 */
window.app.component("nav-bar", {
  template: `
    <nav class="navbar navbar-expand-md">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="fas fa-utensils"></i> {{ brandName }}
        </router-link>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          @click="toggleNav" 
          :aria-expanded="isNavOpen"
          aria-label="Toggle navigation"
        >
          <i class="fas fa-bars"></i>
        </button>
        
        <div class="collapse navbar-collapse" :class="{ 'd-block': isNavOpen }">
          <ul class="navbar-nav ms-auto">            <li class="nav-item" v-for="item in filteredNavigationItems" :key="item.name">
              <router-link 
                v-if="!item.isAction"
                :to="item.path" 
                class="nav-link" 
                :aria-label="item.ariaLabel"
                @click="handleNavClick(item)"
              >
                <i :class="item.icon"></i> {{ item.name }}
                <span v-if="item.badge && item.badgeValue" class="badge bg-danger ms-1">
                  {{ item.badgeValue }}
                </span>
              </router-link>
              <a 
                v-else
                href="#" 
                class="nav-link" 
                :aria-label="item.ariaLabel"
                @click.prevent="handleNavAction(item)"
              >
                <i :class="item.icon"></i> {{ item.name }}
              </a>
            </li>
              <!-- User dropdown for authenticated users -->
            <li class="nav-item dropdown" v-if="showUserDropdown">
              <a 
                class="nav-link dropdown-toggle" 
                href="#" 
                id="userDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                data-bs-auto-close="true"
                :aria-expanded="isUserDropdownOpen"
                @click="toggleUserDropdown"
              >
                <i class="fas fa-user-circle"></i> {{ userDisplayName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li v-for="menuItem in userMenuItems" :key="menuItem.name">
                  <router-link 
                    v-if="!menuItem.isAction" 
                    :to="menuItem.path" 
                    class="dropdown-item"
                    @click="handleDropdownItemClick"
                  >
                    <i :class="menuItem.icon"></i> {{ menuItem.name }}
                  </router-link>
                  <a 
                    v-else 
                    class="dropdown-item" 
                    href="#" 
                    @click.prevent="handleDropdownAction(menuItem)"
                  >
                    <i :class="menuItem.icon"></i> {{ menuItem.name }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      // UI State
      isNavOpen: false,
      isUserDropdownOpen: false,
      isInitialized: false,

      // Authentication State
      isLoggedIn: false,
      userDisplayName: "My Account",

      // Cart State
      cartItemCount: 0, // Data for mobile detection
      windowWidth: window.innerWidth,

      // Configuration
      brandName: window.APP_CONSTANTS?.UI?.BRAND_NAME || "FoodNow",

      // Navigation items configuration
      navigationItems: [
        {
          name: "Menu",
          path: "/product",
          icon: "fas fa-book-open",
          ariaLabel: "Browse Menu",
          shouldShow: true,
          badge: false,
        },
        {
          name: "Cart",
          path: "/cart",
          icon: "fas fa-shopping-cart",
          ariaLabel: "View Cart",
          shouldShow: true,
          badge: true,
          badgeValue: 0,
        },
        {
          name: "Account",
          path: "/account",
          icon: "fas fa-user",
          ariaLabel: "My Account",
          shouldShow: false, // Will be shown only for mobile when logged in
          badge: false,
          mobileOnly: true,
        },
        {
          name: "Orders",
          path: "/purchases",
          icon: "fas fa-history",
          ariaLabel: "Order History",
          shouldShow: false, // Will be shown only for mobile when logged in
          badge: false,
          mobileOnly: true,
        },
        {
          name: "Sign Out",
          path: "#",
          icon: "fas fa-sign-out-alt",
          ariaLabel: "Sign Out",
          shouldShow: false, // Will be shown only for mobile when logged in
          badge: false,
          mobileOnly: true,
          isAction: true,
          action: () => this.logout(),
        },
        {
          name: "Sign In",
          path: "/login",
          icon: "fas fa-sign-in-alt",
          ariaLabel: "Sign In",
          shouldShow: true,
          badge: false,
        },
        {
          name: "Register",
          path: "/register",
          icon: "fas fa-user-plus",
          ariaLabel: "Create Account",
          shouldShow: true,
          badge: false,
        },
      ],

      // User menu configuration
      userMenuItems: [
        {
          name: "Profile",
          path: "/account",
          icon: "fas fa-user",
          isAction: false,
        },
        {
          name: "Order History",
          path: "/purchases",
          icon: "fas fa-history",
          isAction: false,
        },
        {
          name: "Sign Out",
          icon: "fas fa-sign-out-alt",
          isAction: true,
          action: () => this.logout(),
        },
      ],
    };
  },
  computed: {
    /**
     * Filter navigation items based on authentication state and device type
     */
    filteredNavigationItems() {
      return this.navigationItems.filter((item) => {
        // Handle mobile-only items
        if (item.mobileOnly) {
          return this.isLoggedIn && this.isMobileDevice();
        }

        // Hide sign in/register when logged in
        if (
          this.isLoggedIn &&
          (item.name === "Sign In" || item.name === "Register")
        ) {
          return false;
        }

        // Show sign in/register when not logged in
        if (
          !this.isLoggedIn &&
          (item.name === "Sign In" || item.name === "Register")
        ) {
          return true;
        }

        return item.shouldShow;
      });
    },

    /**
     * Determine if user dropdown should be shown (desktop/tablet only)
     */
    showUserDropdown() {
      return this.isLoggedIn && !this.isMobileDevice();
    },
  },
  watch: {
    /**
     * Update cart badge when cart count changes
     */
    cartItemCount(newCount) {
      const cartItem = this.navigationItems.find(
        (item) => item.name === "Cart"
      );
      if (cartItem) {
        cartItem.badgeValue = newCount;
      }
    },

    /**
     * Update navigation visibility when authentication state changes
     */
    isLoggedIn(newValue) {
      this.updateNavigationVisibility();
      if (newValue) {
        this.loadUserInfo();
      }
    },
  },

  mounted() {
    try {
      // Initialize component state
      this.initializeComponent();

      // Set up event listeners
      this.setupEventListeners();

      console.log("NavBar component mounted successfully");
    } catch (error) {
      console.error("Error mounting NavBar component:", error);
      window.ErrorHandler?.logError(error, {
        component: "NavBar",
        method: "mounted",
      });
    }
  },

  beforeUnmount() {
    try {
      // Clean up event listeners
      this.cleanupEventListeners();
    } catch (error) {
      console.error("Error cleaning up NavBar component:", error);
    }
  },
  methods: {
    /**
     * Initialize component state and configuration
     */
    initializeComponent() {
      try {
        // Load user authentication state
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};
        this.isLoggedIn =
          localStorage.getItem(storageKeys.IS_LOGGED_IN || "isLoggedIn") ===
          "true";

        // Load user info if logged in
        if (this.isLoggedIn) {
          this.loadUserInfo();
        } // Initialize cart count
        this.updateCartCount();

        // Initialize Bootstrap dropdown if user is logged in
        if (this.isLoggedIn) {
          this.initializeBootstrapDropdown();
        }

        // Mark component as initialized
        this.isInitialized = true;
        console.log("NavBar component initialized successfully");
      } catch (error) {
        console.error("Error initializing NavBar component:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "initializeComponent",
        });
      }
    },
    /**
     * Toggle mobile navigation menu
     */ toggleNav() {
      this.isNavOpen = !this.isNavOpen;

      // Close user dropdown when opening nav
      if (this.isNavOpen) {
        this.isUserDropdownOpen = false;
      }
    }
    /**
     * Detect if current device is mobile
     */,
    isMobileDevice() {
      // Check for mobile user agent
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Check for small screen size (mobile breakpoint) - use reactive windowWidth
      const isMobileScreen = this.windowWidth < 768;

      // Check for touch device
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      return isMobileUserAgent || (isMobileScreen && isTouchDevice);
    },

    /**
     * Handle dropdown item clicks (for navigation items)
     */
    handleDropdownItemClick() {
      // Close dropdown after navigation
      this.isUserDropdownOpen = false;
      this.isNavOpen = false;
    },

    /**
     * Handle dropdown action clicks (for non-navigation items like logout)
     */
    handleDropdownAction(menuItem) {
      // Execute the action
      if (menuItem.action) {
        menuItem.action();
      }

      // Close dropdown
      this.isUserDropdownOpen = false;
      this.isNavOpen = false;
    },

    /**
     * Initialize Bootstrap dropdown manually for better control
     */
    initializeBootstrapDropdown() {
      try {
        this.$nextTick(() => {
          const dropdownElement = document.getElementById("userDropdown");
          if (dropdownElement && window.bootstrap) {
            // Initialize Bootstrap dropdown
            this.bootstrapDropdown = new window.bootstrap.Dropdown(
              dropdownElement,
              {
                autoClose: true,
                boundary: "viewport",
              }
            );

            // Add event listeners for Bootstrap dropdown events
            dropdownElement.addEventListener("show.bs.dropdown", () => {
              this.isUserDropdownOpen = true;
            });

            dropdownElement.addEventListener("hide.bs.dropdown", () => {
              this.isUserDropdownOpen = false;
            });
          }
        });
      } catch (error) {
        console.warn("Bootstrap dropdown initialization failed:", error);
        // Fallback to manual toggle
      }
    }
    /**
     * Toggle user dropdown menu
     */,
    toggleUserDropdown(event) {
      event?.preventDefault();

      // Try to use Bootstrap dropdown if available
      if (this.bootstrapDropdown) {
        this.bootstrapDropdown.toggle();
      } else {
        // Fallback to manual toggle
        this.isUserDropdownOpen = !this.isUserDropdownOpen;
      }

      // Close mobile nav when opening user dropdown
      if (this.isUserDropdownOpen) {
        this.isNavOpen = false;
      }
    }
    /**
     * Handle navigation action clicks (for action items like logout)
     */,
    handleNavAction(item) {
      try {
        // Close mobile navigation after click
        this.isNavOpen = false;

        // Execute the action
        if (item.action) {
          item.action();
        }

        console.log("Navigation action executed:", item.name);
      } catch (error) {
        console.error("Error handling navigation action:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "handleNavAction",
          item: item.name,
        });
      }
    },

    /**
     * Handle navigation item clicks
     */
    handleNavClick(item) {
      try {
        // Close mobile navigation after click
        this.isNavOpen = false;

        // Close user dropdown
        this.isUserDropdownOpen = false;

        // Handle special navigation items
        if (item.name === "Cart") {
          // Update cart count before navigating to cart
          this.updateCartCount();
        }

        console.log("Navigation item clicked:", item.name);
      } catch (error) {
        console.error("Error handling navigation click:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "handleNavClick",
          item: item.name,
        });
      }
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
      // Storage events for cross-tab synchronization
      window.addEventListener("storage", this.handleStorageEvent);

      // Custom cart update events
      window.addEventListener("cart-updated", this.updateCartCount);

      // Custom authentication events
      window.addEventListener("auth-updated", () => {
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};
        this.isLoggedIn =
          localStorage.getItem(storageKeys.IS_LOGGED_IN || "isLoggedIn") ===
          "true";
        if (this.isLoggedIn) {
          this.loadUserInfo();
        }
      });

      // Global click handler for closing dropdowns
      document.addEventListener("click", this.handleGlobalClick);

      // Keyboard navigation
      document.addEventListener("keydown", this.handleKeydown);

      // Window resize for mobile detection
      window.addEventListener("resize", this.handleResize);
    },

    /**
     * Clean up event listeners
     */
    cleanupEventListeners() {
      window.removeEventListener("storage", this.handleStorageEvent);
      window.removeEventListener("cart-updated", this.updateCartCount);
      document.removeEventListener("click", this.handleGlobalClick);
      document.removeEventListener("keydown", this.handleKeydown);
      window.removeEventListener("resize", this.handleResize);
    },

    /**
     * Handle global clicks for dropdown management
     */
    handleGlobalClick(event) {
      // Close user dropdown if clicking outside
      if (!event.target.closest("#userDropdown") && this.isUserDropdownOpen) {
        this.isUserDropdownOpen = false;
      }

      // Close mobile nav if clicking outside
      if (!event.target.closest(".navbar") && this.isNavOpen) {
        this.isNavOpen = false;
      }
    }
    /**
     * Handle window resize events
     */,
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    /**
     * Handle keyboard navigation
     */
    handleKeydown(event) {
      // ESC key closes dropdowns and mobile nav
      if (event.key === "Escape") {
        this.isUserDropdownOpen = false;
        this.isNavOpen = false;
      }
    },
    /**
     * Update cart item count from CartService
     */ updateCartCount() {
      try {
        // Use CartService to get the current cart count
        if (window.CartService) {
          this.cartItemCount = window.CartService.getCartCount();
        } else {
          // Fallback: try to get count from CartService global instance
          this.cartItemCount = 0;
          console.warn("CartService not available for cart count update");
        }

        // Update navigation badge
        const cartItem = this.navigationItems.find(
          (item) => item.name === "Cart"
        );
        if (cartItem) {
          cartItem.badgeValue = this.cartItemCount;
        }

        console.log("Cart count updated:", this.cartItemCount);
      } catch (error) {
        console.error("Error updating cart count:", error);
        this.cartItemCount = 0;
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "updateCartCount",
        });
      }
    },

    /**
     * Load user information from localStorage
     */
    loadUserInfo() {
      try {
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};
        const userKey = storageKeys.USER_DATA || "userData";
        const userData = localStorage.getItem(userKey);

        if (userData) {
          const user = JSON.parse(userData);
          // Set display name with fallback hierarchy
          this.userDisplayName = user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.username || user.email || "My Account";
        } else {
          // Fallback to basic account info
          const email = localStorage.getItem(
            storageKeys.USER_EMAIL || "userEmail"
          );
          this.userDisplayName = email ? email.split("@")[0] : "My Account";
        }

        console.log("User info loaded:", this.userDisplayName);

        // Initialize Bootstrap dropdown after user info is loaded
        this.initializeBootstrapDropdown();
      } catch (error) {
        console.error("Error loading user info:", error);
        this.userDisplayName = "My Account";
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "loadUserInfo",
        });
      }
    },

    /**
     * Update navigation visibility based on authentication state
     */
    updateNavigationVisibility() {
      try {
        // Force reactivity update by modifying navigationItems
        this.navigationItems.forEach((item) => {
          if (item.name === "Sign In" || item.name === "Register") {
            item.shouldShow = !this.isLoggedIn;
          }
        });

        console.log(
          "Navigation visibility updated for auth state:",
          this.isLoggedIn
        );
      } catch (error) {
        console.error("Error updating navigation visibility:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "updateNavigationVisibility",
        });
      }
    },

    /**
     * Handle storage events for cross-tab synchronization
     */
    handleStorageEvent(event) {
      try {
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};

        // Handle authentication changes
        if (event.key === (storageKeys.IS_LOGGED_IN || "isLoggedIn")) {
          this.isLoggedIn = event.newValue === "true";
          if (this.isLoggedIn) {
            this.loadUserInfo();
          } else {
            this.userDisplayName = "My Account";
          }
        }

        // Handle cart changes
        if (event.key === (storageKeys.CART || "cart")) {
          this.updateCartCount();
        }

        // Handle user data changes
        if (event.key === (storageKeys.USER_DATA || "userData")) {
          if (this.isLoggedIn) {
            this.loadUserInfo();
          }
        }
      } catch (error) {
        console.error("Error handling storage event:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "handleStorageEvent",
        });
      }
    },

    /**
     * Handle user logout
     */
    async logout() {
      try {
        // Show confirmation if ToastService is available
        if (window.ToastService) {
          window.ToastService.info("Signing out...", { timeout: 2000 });
        }

        // Clear authentication data
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};
        localStorage.removeItem(storageKeys.IS_LOGGED_IN || "isLoggedIn");
        localStorage.removeItem(storageKeys.USER_DATA || "userData");
        localStorage.removeItem(storageKeys.USER_EMAIL || "userEmail");
        localStorage.removeItem(storageKeys.AUTH_TOKEN || "authToken");

        // Update component state
        this.isLoggedIn = false;
        this.userDisplayName = "My Account";
        this.isUserDropdownOpen = false;

        // Update navigation visibility
        this.updateNavigationVisibility();

        // Emit custom event for other components
        window.dispatchEvent(
          new CustomEvent("auth-updated", {
            detail: { isLoggedIn: false },
          })
        );

        // Track logout for analytics
        if (window.Analytics) {
          window.Analytics.track("user_logout", {
            timestamp: new Date().toISOString(),
          });
        }

        // Show success message
        if (window.ToastService) {
          window.ToastService.success("Successfully signed out");
        }

        // Redirect to home page
        if (this.$router && this.$route.path !== "/") {
          this.$router.push("/");
        }

        console.log("User logged out successfully");
      } catch (error) {
        console.error("Error during logout:", error);
        window.ErrorHandler?.logError(error, {
          component: "NavBar",
          method: "logout",
        });

        if (window.ToastService) {
          window.ToastService.error("Error signing out. Please try again.");
        }
      }
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
      // Storage events for cross-tab synchronization
      window.addEventListener("storage", this.handleStorageEvent);

      // Custom cart update events
      window.addEventListener("cart-updated", this.updateCartCount);

      // Custom authentication events
      window.addEventListener("auth-updated", () => {
        const storageKeys = window.APP_CONSTANTS?.STORAGE_KEYS || {};
        this.isLoggedIn =
          localStorage.getItem(storageKeys.IS_LOGGED_IN || "isLoggedIn") ===
          "true";
        if (this.isLoggedIn) {
          this.loadUserInfo();
        }
      });

      // Global click handler for closing dropdowns
      document.addEventListener("click", this.handleGlobalClick);

      // Keyboard navigation
      document.addEventListener("keydown", this.handleKeydown);

      // Window resize for mobile detection
      window.addEventListener("resize", this.handleResize);
    },

    /**
     * Clean up event listeners
     */
    cleanupEventListeners() {
      window.removeEventListener("storage", this.handleStorageEvent);
      window.removeEventListener("cart-updated", this.updateCartCount);
      document.removeEventListener("click", this.handleGlobalClick);
      document.removeEventListener("keydown", this.handleKeydown);
      window.removeEventListener("resize", this.handleResize);
    },

    /**
     * Handle global clicks for dropdown management
     */
    handleGlobalClick(event) {
      // Close user dropdown if clicking outside
      if (!event.target.closest("#userDropdown") && this.isUserDropdownOpen) {
        this.isUserDropdownOpen = false;
      }

      // Close mobile nav if clicking outside
      if (!event.target.closest(".navbar") && this.isNavOpen) {
        this.isNavOpen = false;
      }
    },
  },

  mounted() {
    try {
      // Initialize component state
      this.initializeComponent();

      // Set up event listeners
      this.setupEventListeners();

      console.log("NavBar component mounted successfully");
    } catch (error) {
      console.error("Error mounting NavBar component:", error);
      window.ErrorHandler?.logError(error, {
        component: "NavBar",
        method: "mounted",
      });
    }
  },

  beforeUnmount() {
    try {
      // Clean up event listeners
      this.cleanupEventListeners();
    } catch (error) {
      console.error("Error cleaning up NavBar component:", error);
    }
  },
});
