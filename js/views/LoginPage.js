const LoginPage = {
  template: `
    <div class="login-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-5">
            <div class="card shadow my-5" v-scroll-reveal="{ delay: 200 }">
              <div class="card-header bg-white text-center py-3">
                <h1 class="h3 mb-0">Sign In</h1>
              </div>
              
              <div class="card-body p-4" v-focus-trap>                <!-- Login Success Message -->
                <div v-if="uiState.loginSuccess" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i> Login successful! Redirecting...
                </div>
                
                <!-- Enhanced Login Form with Custom Validation -->
                <form v-else @submit.prevent="login" class="login-form" novalidate aria-labelledby="form-title">                <!-- Form Instructions -->
                <p class="text-muted mb-3" id="form-title">Please enter your email and password to sign in.</p>
                
                <!-- Admin Login Info -->
                <div class="alert alert-info mb-4" role="alert">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>Admin Access:</strong> Use username <code>admin</code> and password <code>admin</code> for administrative access.
                </div>
                    <!-- Enhanced Email/Username Field -->
                  <div class="mb-3">
                    <label for="email" class="form-label">Email / Username <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="email" 
                      v-model.trim="formData.email"
                      @input="validateEmail"
                      @blur="validateEmail(true)"
                      :class="{ 'is-invalid': validation.errors.email, 'is-valid': formData.email && !validation.errors.email }"
                      v-validate="{ 
                        rules: { required: true }, 
                        message: 'Please enter your email address or username'
                      }"
                      required
                      autocomplete="email"
                      ref="emailInput"
                      aria-describedby="emailFeedback"
                      placeholder="Enter your email or use 'admin' for admin access"
                    ><div v-if="validation.errors.email" class="invalid-feedback" id="emailFeedback">
                      {{ validation.errors.email }}
                    </div>
                    <div v-else-if="formData.email" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Enhanced Password Field -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between">
                      <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                      <a href="#" class="form-text text-decoration-none">Forgot password?</a>
                    </div>
                    <div class="input-group">
                      <input 
                        :type="uiState.showPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="password" 
                        v-model="formData.password"
                        @input="validatePassword"
                        @blur="validatePassword(true)"
                        :class="{ 'is-invalid': validation.errors.password, 'is-valid': formData.password && !validation.errors.password }"
                        v-validate="{ 
                          rules: { required: true, minLength: 6 }, 
                          message: 'Password must be at least 6 characters'
                        }"
                        required
                        autocomplete="current-password"
                        aria-describedby="passwordFeedback passwordStrength"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline" 
                        @click="togglePasswordVisibility()"
                        aria-label="Toggle password visibility"
                      >
                        <i :class="uiState.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>                      <div v-if="validation.errors.password" class="invalid-feedback" id="passwordFeedback">
                        {{ validation.errors.password }}
                      </div>
                      <div v-else-if="formData.password" class="valid-feedback">
                        Looks good!
                      </div>
                    </div>
                  </div>
                  
                  <!-- Remember Me Checkbox -->
                  <div class="mb-4">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="rememberMe"
                        v-model="formData.rememberMe"
                      >
                      <label class="form-check-label" for="rememberMe">
                        Remember me
                      </label>
                    </div>
                  </div>
                    <!-- Error Alert -->
                  <div v-if="errorState.error" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ errorState.error }}
                  </div>
                  
                  <!-- Form Buttons -->
                  <div class="d-grid gap-2">                    <button type="submit" class="btn btn-primary" :disabled="uiState.isSubmitting || !isFormValid">
                      <span v-if="uiState.isSubmitting">
                        <i class="fas fa-spinner fa-spin me-2"></i> Signing In...
                      </span>
                      <span v-else>Sign In</span>
                    </button>
                    <router-link to="/register" class="btn btn-outline">
                      Don't have an account? Create one
                    </router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      // Form Configuration
      config: {
        maxRetries: window.APP_CONSTANTS?.UI?.MAX_RETRIES || 3,
        retryDelay: window.APP_CONSTANTS?.UI?.RETRY_DELAY || 1000,
        debounceDelay: window.APP_CONSTANTS?.UI?.DEBOUNCE_DELAY || 300,
        redirectDelay: window.APP_CONSTANTS?.UI?.REDIRECT_DELAY || 1500,
        validationMessages: window.APP_CONSTANTS?.VALIDATION?.MESSAGES || {},
      },

      // Form Data
      formData: {
        email: "",
        password: "",
        rememberMe: false,
      },

      // UI State
      uiState: {
        submitted: false,
        isSubmitting: false,
        loginSuccess: false,
        showPassword: false,
        isLoading: false,
        retryCount: 0,
      },

      // Validation and Error Handling
      validation: {
        errors: {},
        touched: {
          email: false,
          password: false,
        },
      },

      // Error State
      errorState: {
        error: null,
        hasRetriableError: false,
        lastErrorTime: null,
      },

      // Analytics State
      analytics: {
        formStartTime: null,
        interactionCount: 0,
        validationAttempts: 0,
        loginAttempts: 0,
      },

      // Component State
      componentState: {
        isMounted: false,
        hasInitialized: false,
        loadError: null,
      },
    };
  },

  computed: {
    /**
     * Check if form is valid for submission
     */
    isFormValid() {
      return (
        this.formData.email &&
        this.formData.password &&
        Object.keys(this.validation.errors).length === 0
      );
    },

    /**
     * Check if form can be submitted
     */
    canSubmit() {
      return (
        this.isFormValid &&
        !this.uiState.isSubmitting &&
        !this.uiState.loginSuccess
      );
    },

    /**
     * Get current error message with fallback
     */
    currentError() {
      return this.errorState.error || this.componentState.loadError;
    },

    /**
     * Check if retry is available
     */
    canRetry() {
      return (
        this.errorState.hasRetriableError &&
        this.uiState.retryCount < this.config.maxRetries
      );
    },

    /**
     * Get validation error for email
     */
    emailError() {
      return this.validation.errors.email;
    },

    /**
     * Get validation error for password
     */
    passwordError() {
      return this.validation.errors.password;
    },

    /**
     * Get success message configuration
     */
    successMessage() {
      return (
        window.APP_CONSTANTS?.SUCCESS_MESSAGES?.LOGIN_SUCCESS ||
        "Login successful! Redirecting..."
      );
    },

    /**
     * Check if component is ready for interaction
     */
    isReady() {
      return (
        this.componentState.isMounted &&
        this.componentState.hasInitialized &&
        !this.componentState.loadError
      );
    },
  },

  watch: {
    /**
     * Track form data changes for analytics
     */
    "formData.email"(newValue, oldValue) {
      if (newValue !== oldValue && oldValue !== "") {
        this.trackFieldInteraction("email", "change");
      }
    },

    "formData.password"(newValue, oldValue) {
      if (newValue !== oldValue && oldValue !== "") {
        this.trackFieldInteraction("password", "change");
      }
    },

    /**
     * Clear errors when form data changes
     */
    "formData.email"() {
      if (this.validation.errors.email) {
        this.clearFieldError("email");
      }
    },

    "formData.password"() {
      if (this.validation.errors.password) {
        this.clearFieldError("password");
      }
    },
  },

  mounted() {
    try {
      this.initializeComponent();
      this.componentState.isMounted = true;
      console.log("LoginPage component mounted successfully");
    } catch (error) {
      console.error("Error mounting LoginPage component:", error);
      this.handleComponentError(error, "mount");
    }
  },

  beforeUnmount() {
    try {
      this.cleanupComponent();
    } catch (error) {
      console.error("Error cleaning up LoginPage component:", error);
    }
  },

  methods: {
    /**
     * Initialize component with configuration and state
     */
    initializeComponent() {
      try {
        // Set analytics start time
        this.analytics.formStartTime = Date.now();

        // Load remembered email if available
        this.loadRememberedEmail(); // Initialize validation service if available
        if (window.ValidationService) {
          this.validation.validator = window.ValidationService;
        }

        // Track component load
        this.trackEvent("component_load", {
          component: "LoginPage",
          timestamp: Date.now(),
        });

        this.componentState.hasInitialized = true;
      } catch (error) {
        console.error("Error initializing LoginPage:", error);
        this.componentState.loadError =
          "Failed to initialize login form. Please refresh the page.";
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "initializeComponent",
        });
      }
    },

    /**
     * Load remembered email from localStorage
     */
    loadRememberedEmail() {
      try {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
          this.formData.email = rememberedEmail;
          this.formData.rememberMe = true;
        }
      } catch (error) {
        console.error("Error loading remembered email:", error);
      }
    },
    /**
     * Enhanced email validation with debouncing
     */ validateEmail(showErrors = false) {
      // Use debounced version if available, otherwise call directly
      if (this.validateEmailDebounced && !showErrors) {
        return this.validateEmailDebounced(showErrors);
      } else {
        return this._validateEmail(showErrors);
      }
    },

    /**
     * Enhanced password validation with debouncing
     */
    validatePassword(showErrors = false) {
      // Use debounced version if available, otherwise call directly
      if (this.validatePasswordDebounced && !showErrors) {
        return this.validatePasswordDebounced(showErrors);
      } else {
        return this._validatePassword(showErrors);
      }
    },

    /**
     * Validate email field
     */ _validateEmail(showErrors = false) {
      try {
        this.analytics.validationAttempts++;

        if (
          showErrors ||
          this.validation.touched.email ||
          this.uiState.submitted
        ) {
          this.validation.touched.email = true;

          if (!this.formData.email) {
            this.validation.errors.email = "Email is required";
          } else if (this.formData.email === "admin") {
            // Special case for admin login - always valid
            delete this.validation.errors.email;
          } else if (this.validation.validator) {
            const result = this.validation.validator.validateEmail(
              this.formData.email
            );
            if (!result.isValid) {
              this.validation.errors.email = result.message;
            }
          } else {
            // Fallback validation
            const emailPattern =
              window.APP_CONSTANTS?.VALIDATION?.EMAIL_PATTERN ||
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.formData.email)) {
              this.validation.errors.email =
                "Please enter a valid email address";
            }
          }
        }
      } catch (error) {
        console.error("Error validating email:", error);
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "validateEmail",
        });
      }
    },
    /**
     * Validate password field
     */ _validatePassword(showErrors = false) {
      try {
        this.analytics.validationAttempts++;

        if (
          showErrors ||
          this.validation.touched.password ||
          this.uiState.submitted
        ) {
          this.validation.touched.password = true;

          if (!this.formData.password) {
            this.validation.errors.password = "Password is required";
          } else if (
            this.formData.email === "admin" &&
            this.formData.password === "admin"
          ) {
            // Special case for admin login - always valid
            delete this.validation.errors.password;
          } else if (this.validation.validator) {
            const result = this.validation.validator.validatePassword(
              this.formData.password
            );
            if (!result.isValid) {
              this.validation.errors.password = result.message;
            }
          } else {
            // Fallback validation
            const minLength =
              window.APP_CONSTANTS?.VALIDATION?.MIN_PASSWORD_LENGTH || 8;
            if (this.formData.password.length < minLength) {
              this.validation.errors.password = `Password must be at least ${minLength} characters`;
            }
          }
        }
      } catch (error) {
        console.error("Error validating password:", error);
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "validatePassword",
        });
      }
    },

    /**
     * Validate entire form with enhanced error handling
     */
    validateForm() {
      try {
        this.uiState.submitted = true;
        this.analytics.formSubmissionAttempts++;

        // Clear previous errors
        this.clearAllErrors();

        // Validate all fields
        this._validateEmail(true);
        this._validatePassword(true);

        const isValid = this.isFormValid;

        // Track validation result
        this.trackEvent("form_validation", {
          isValid,
          errors: Object.keys(this.validation.errors),
          attempt: this.analytics.formSubmissionAttempts,
        });

        return isValid;
      } catch (error) {
        console.error("Error validating form:", error);
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "validateForm",
        });
        return false;
      }
    },
    /**
     * Clear field-specific error
     */ clearFieldError(fieldName) {
      if (this.validation.errors[fieldName]) {
        delete this.validation.errors[fieldName];
      }
    },
    /**
     * Clear all validation errors
     */ clearAllErrors() {
      this.validation.errors = {};
      this.errorState.error = null;
    },

    /**
     * Toggle password visibility with analytics tracking
     */
    togglePasswordVisibility() {
      try {
        this.uiState.showPassword = !this.uiState.showPassword;
        this.trackEvent("password_visibility_toggle", {
          visible: this.uiState.showPassword,
        });
      } catch (error) {
        console.error("Error toggling password visibility:", error);
      }
    },

    /**
     * Enhanced login method with comprehensive error handling and analytics
     */
    async login() {
      try {
        // Pre-submission validation
        if (!this.validateForm()) {
          this.focusFirstError();
          return;
        }

        // Set loading state
        this.uiState.isLoading = true;
        this.uiState.isSubmitting = true;
        this.clearAllErrors();

        // Handle remember me functionality
        this.handleRememberMe();

        // Track login attempt
        this.trackEvent("login_attempt", {
          email: this.formData.email,
          rememberMe: this.formData.rememberMe,
          timestamp: Date.now(),
        });

        // Attempt authentication
        const response = await this.authenticateUser();

        if (response.success) {
          await this.handleLoginSuccess(response);
        } else {
          this.handleLoginError(response);
        }
      } catch (error) {
        this.handleLoginError({
          message: "An unexpected error occurred. Please try again.",
          error,
        });
      } finally {
        this.uiState.isLoading = false;
        this.uiState.isSubmitting = false;
      }
    },

    /**
     * Authenticate user with retry logic
     */
    async authenticateUser() {
      const maxRetries = window.APP_CONSTANTS?.API?.MAX_RETRIES || 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Add delay for retry attempts
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }

          const response = await window.AuthService?.login(
            this.formData.email,
            this.formData.password
          );

          if (response) {
            return response;
          }

          throw new Error("No response received from authentication service");
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries) {
            throw error;
          }

          // Track retry attempt
          this.trackEvent("login_retry", {
            attempt,
            error: error.message,
          });
        }
      }

      throw lastError;
    },

    /**
     * Handle successful login
     */
    async handleLoginSuccess(response) {
      try {
        this.uiState.loginSuccess = true;

        // Calculate login time
        const loginTime = Date.now() - this.analytics.formStartTime;

        // Track successful login
        this.trackEvent("login_success", {
          loginTime,
          validationAttempts: this.analytics.validationAttempts,
          formSubmissionAttempts: this.analytics.formSubmissionAttempts,
        }); // Show success message
        window.ToastService?.success(
          window.APP_CONSTANTS?.MESSAGES?.SUCCESS?.LOGIN ||
            "Login successful! Redirecting..."
        );

        // Dispatch auth update event
        window.dispatchEvent(
          new CustomEvent("auth-updated", {
            detail: { user: response.user },
          })
        );

        // Handle redirect
        await this.handleRedirect();
      } catch (error) {
        console.error("Error handling login success:", error);
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "handleLoginSuccess",
        });
      }
    },

    /**
     * Handle login error with retry logic
     */
    handleLoginError(response) {
      try {
        const error = response.error || response;

        // Determine error type and message
        if (error.code === "NETWORK_ERROR" || error.name === "NetworkError") {
          this.errorState.networkError =
            "Network connection failed. Please check your internet connection.";
          this.errorState.canRetry = true;
        } else if (error.code === "INVALID_CREDENTIALS") {
          this.errorState.loginError =
            "Invalid email or password. Please try again.";
          this.errorState.canRetry = false;
        } else {
          this.errorState.loginError =
            response.message || "Login failed. Please try again.";
          this.errorState.canRetry = true;
        }

        // Track login failure
        this.trackEvent("login_failure", {
          error: error.message || "Unknown error",
          errorCode: error.code,
          canRetry: this.errorState.canRetry,
        }); // Show error toast
        window.ToastService?.error(
          this.errorState.loginError || this.errorState.networkError
        );

        // Focus on email input for better UX
        this.$nextTick(() => {
          this.focusEmailInput();
        });
      } catch (error) {
        console.error("Error handling login error:", error);
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          method: "handleLoginError",
        });
      }
    },

    /**
     * Handle remember me functionality
     */
    handleRememberMe() {
      try {
        const storageKey =
          window.APP_CONSTANTS?.STORAGE?.REMEMBERED_EMAIL || "rememberedEmail";

        if (this.formData.rememberMe) {
          localStorage.setItem(storageKey, this.formData.email);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error("Error handling remember me:", error);
      }
    },

    /**
     * Handle redirect after successful login
     */
    async handleRedirect() {
      try {
        const redirectDelay = window.APP_CONSTANTS?.UI?.REDIRECT_DELAY || 1500;
        const defaultRedirect =
          window.APP_CONSTANTS?.ROUTES?.DEFAULT_REDIRECT || "/";
        const redirectPath = this.$route?.query?.redirect || defaultRedirect;

        setTimeout(() => {
          if (this.$router) {
            this.$router.push(redirectPath);
          } else {
            window.location.href = redirectPath;
          }
        }, redirectDelay);
      } catch (error) {
        console.error("Error handling redirect:", error);
        // Fallback redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    },

    /**
     * Focus on first error field
     */
    focusFirstError() {
      this.$nextTick(() => {
        const firstErrorField = document.querySelector(".is-invalid, .error");
        if (firstErrorField) {
          firstErrorField.focus();
        } else if (this.$refs.emailInput) {
          this.$refs.emailInput.focus();
        }
      });
    },

    /**
     * Focus on email input
     */
    focusEmailInput() {
      this.$nextTick(() => {
        if (this.$refs.emailInput) {
          this.$refs.emailInput.focus();
        }
      });
    },

    /**
     * Track form field interactions for analytics
     */
    trackFieldInteraction(fieldName, action) {
      try {
        if (!this.analytics.fieldInteractions[fieldName]) {
          this.analytics.fieldInteractions[fieldName] = {};
        }

        this.analytics.fieldInteractions[fieldName][action] =
          (this.analytics.fieldInteractions[fieldName][action] || 0) + 1;

        this.analytics.lastInteraction = {
          field: fieldName,
          action,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error("Error tracking field interaction:", error);
      }
    },

    /**
     * Generic event tracking method
     */
    trackEvent(eventName, eventData = {}) {
      try {
        const event = {
          event: eventName,
          timestamp: Date.now(),
          component: "LoginPage",
          ...eventData,
        };

        // Log to console in development
        if (window.APP_CONSTANTS?.DEBUG?.ANALYTICS_LOGGING) {
          console.log("Analytics Event:", event);
        }

        // Send to analytics service if available
        if (window.AnalyticsService) {
          window.AnalyticsService.track(event);
        }

        // Store in session for debugging
        if (window.APP_CONSTANTS?.DEBUG?.STORE_ANALYTICS) {
          const events = JSON.parse(
            sessionStorage.getItem("analyticsEvents") || "[]"
          );
          events.push(event);
          sessionStorage.setItem(
            "analyticsEvents",
            JSON.stringify(events.slice(-100))
          ); // Keep last 100 events
        }
      } catch (error) {
        console.error("Error tracking event:", error);
      }
    },

    /**
     * Handle component errors
     */
    handleComponentError(error, context = "unknown") {
      try {
        this.componentState.hasError = true;
        this.componentState.errorMessage = `An error occurred in ${context}. Please refresh the page.`;

        // Log error
        console.error(`LoginPage component error in ${context}:`, error);

        // Report to error handler
        window.ErrorHandler?.logError(error, {
          component: "LoginPage",
          context,
          timestamp: Date.now(),
        });

        // Track error event
        this.trackEvent("component_error", {
          context,
          error: error.message,
          stack: error.stack,
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
        // Clear any pending timeouts
        if (this.componentState.timeouts) {
          this.componentState.timeouts.forEach((timeout) =>
            clearTimeout(timeout)
          );
        }

        // Clear intervals
        if (this.componentState.intervals) {
          this.componentState.intervals.forEach((interval) =>
            clearInterval(interval)
          );
        }

        // Track component cleanup
        this.trackEvent("component_cleanup", {
          sessionDuration: Date.now() - this.analytics.formStartTime,
          interactions: this.analytics.fieldInteractions,
        });
      } catch (error) {
        console.error("Error cleaning up component:", error);
      }
    },
  },
  created() {
    try {
      // Set up debounced validation methods - note the capital H in Helpers
      if (window.Helpers?.debounce) {
        this.validateEmailDebounced = window.Helpers.debounce(
          this._validateEmail.bind(this),
          300
        );
        this.validatePasswordDebounced = window.Helpers.debounce(
          this._validatePassword.bind(this),
          300
        );
      }

      // Track component creation
      this.trackEvent("component_created", {
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error in created hook:", error);
      this.handleComponentError(error, "created");
    }
  },
};

// Make the component globally available
window.LoginPage = LoginPage;
