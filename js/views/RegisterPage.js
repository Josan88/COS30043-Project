const RegisterPage = {
  template: `
    <div class="registration-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow my-5">
              <div class="card-header bg-white text-center py-3">
                <h1 class="h3 mb-0">Create an Account</h1>
              </div>
                <div class="card-body p-4">
                <!-- Registration Success Message -->
                <div v-if="uiState.registrationSuccess" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i> Registration successful! Redirecting to login...
                </div>
                  <!-- Enhanced Registration Form with Custom Directives -->
                <form 
                  v-else 
                  @submit.prevent="handleFormSubmit" 
                  class="registration-form" 
                  novalidate 
                  aria-labelledby="form-title"
                  v-focus-trap="{ isActive: true, initialFocus: 'email' }"
                >
                  <!-- Form Instructions -->
                  <p class="text-muted mb-4" id="form-title">Please fill in the information below to create your account.</p>
                  
                  <!-- Basic Information Section -->
                  <h5 class="mb-3">Personal Information</h5>
                  
                  <!-- Enhanced Email Field with Custom Validation -->
                  <div class="mb-3">
                    <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model.trim="formData.email"
                      v-validate="{ 
                        rules: { 
                          required: true, 
                          email: true, 
                          minLength: 5, 
                          maxLength: 100 
                        }, 
                        message: 'Please enter a valid email address',
                        showSuccess: true
                      }"
                      required
                      autocomplete="email"
                      ref="emailInput"
                      aria-describedby="emailFeedback emailHelp"
                    >
                    <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                  </div>
                    <!-- Enhanced Name Fields with Custom Validation -->
                  <div class="row mb-3">
                    <div class="col-sm-6">
                      <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="firstName" 
                        v-model.trim="formData.firstName"
                        v-validate="{ 
                          rules: { 
                            required: true, 
                            minLength: 2, 
                            maxLength: 50,
                            pattern: '^[a-zA-Z\\s]+$'
                          }, 
                          message: 'First name must be 2-50 characters and contain only letters',
                          showSuccess: true
                        }"
                        required
                        autocomplete="given-name"
                        aria-describedby="firstNameFeedback"
                      >
                    </div>
                    <div class="col-sm-6">
                      <label for="lastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="lastName" 
                        v-model.trim="formData.lastName"
                        v-validate="{ 
                          rules: { 
                            required: true, 
                            minLength: 2, 
                            maxLength: 50,
                            pattern: '^[a-zA-Z\\s]+$'
                          }, 
                          message: 'Last name must be 2-50 characters and contain only letters',
                          showSuccess: true
                        }"
                        required
                        autocomplete="family-name"
                        aria-describedby="lastNameFeedback"
                      >
                    </div>
                  </div>
                  
                  <!-- Phone Number -->
                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number</label>                    <input 
                      type="tel" 
                      class="form-control" 
                      id="phone" 
                      v-model.trim="formData.phone"
                      @input="() => debouncedValidateField('phone')"
                      @blur="() => validateField('phone', true)"
                      :class="{ 
                        'is-invalid': phoneValidationState.isInvalid, 
                        'is-valid': phoneValidationState.isValid 
                      }"
                      autocomplete="tel"
                      aria-describedby="phoneFeedback"
                    >
                    <div v-if="phoneValidationState.error" class="invalid-feedback" id="phoneFeedback">
                      {{ phoneValidationState.error }}
                    </div>
                    <div v-else-if="phoneValidationState.isValid" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Address -->
                  <div class="mb-4">
                    <label for="address" class="form-label">Shipping Address</label>                    <textarea 
                      class="form-control" 
                      id="address" 
                      v-model.trim="formData.address"
                      @input="() => debouncedValidateField('address')"
                      @blur="() => validateField('address', true)"
                      rows="3"
                      :class="{ 
                        'is-invalid': addressValidationState.isInvalid, 
                        'is-valid': addressValidationState.isValid 
                      }"
                      autocomplete="street-address"
                      aria-describedby="addressFeedback"
                    ></textarea>
                    <div v-if="addressValidationState.error" class="invalid-feedback" id="addressFeedback">
                      {{ addressValidationState.error }}
                    </div>
                    <div v-else-if="addressValidationState.isValid" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Password Section -->
                  <h5 class="mb-3">Security Information</h5>
                  
                  <!-- Password Field -->
                  <div class="mb-3">
                    <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                    <div class="input-group">                      <input 
                        :type="uiState.showPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="password" 
                        v-model="formData.password"
                        @input="() => debouncedValidateField('password')"
                        @blur="() => validateField('password', true)"
                        :class="{ 
                          'is-invalid': passwordValidationState.isInvalid, 
                          'is-valid': passwordValidationState.isValid 
                        }"
                        required
                        autocomplete="new-password"
                        aria-describedby="passwordFeedback passwordHelp passwordStrength"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline" 
                        @click="togglePasswordVisibility('password')"
                        aria-label="Toggle password visibility"
                      >
                        <i :class="uiState.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div v-if="passwordValidationState.error" class="invalid-feedback" id="passwordFeedback">
                        {{ passwordValidationState.error }}
                      </div>
                      <div v-else-if="passwordValidationState.isValid" class="valid-feedback">
                        Looks good!
                      </div>
                    </div>
                    <small id="passwordHelp" class="form-text text-muted">
                      Password must be at least 8 characters and include a mix of letters, numbers, and special characters.
                    </small>
                    <!-- Password Strength Indicator -->
                    <div v-if="formData.password" class="mt-2" id="passwordStrength">
                      <div class="progress" style="height: 5px;">
                        <div class="progress-bar" :class="passwordStrengthClass" role="progressbar" :style="{width: passwordStrength + '%'}" 
                          aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                      <small class="form-text" :class="passwordStrengthTextClass">
                        {{ passwordStrengthText }}
                      </small>
                    </div>
                  </div>
                  
                  <!-- Confirm Password Field -->
                  <div class="mb-4">
                    <label for="confirmPassword" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                    <div class="input-group">                      <input 
                        :type="uiState.showConfirmPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="confirmPassword" 
                        v-model="formData.confirmPassword"
                        @input="() => debouncedValidateField('confirmPassword')"
                        @blur="() => validateField('confirmPassword', true)"
                        :class="{ 
                          'is-invalid': confirmPasswordValidationState.isInvalid, 
                          'is-valid': confirmPasswordValidationState.isValid 
                        }"
                        required
                        autocomplete="new-password"
                        aria-describedby="confirmPasswordFeedback"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline" 
                        @click="togglePasswordVisibility('confirm')"
                        aria-label="Toggle password visibility"
                      >
                        <i :class="uiState.showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div v-if="confirmPasswordValidationState.error" class="invalid-feedback" id="confirmPasswordFeedback">
                        {{ confirmPasswordValidationState.error }}
                      </div>
                      <div v-else-if="confirmPasswordValidationState.isValid" class="valid-feedback">
                        Passwords match!
                      </div>
                    </div>
                  </div>
                  
                  <!-- Terms and Conditions Checkbox -->
                  <div class="mb-4">
                    <div class="form-check">                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="agreeTerms"
                        v-model="formData.agreeTerms"
                        @change="() => validateField('agreeTerms', true)"
                        :class="{ 'is-invalid': termsValidationState.isInvalid }"
                        aria-describedby="termsError"
                      >
                      <label class="form-check-label" for="agreeTerms">
                        I agree to the <a href="#" @click.prevent="openModal('terms')">Terms and Conditions</a> and <a href="#" @click.prevent="openModal('privacy')">Privacy Policy</a>
                      </label>
                      <div v-if="termsValidationState.error" class="invalid-feedback" id="termsError">
                        {{ termsValidationState.error }}
                      </div>
                    </div>
                  </div>
                    <!-- Error Alert -->
                  <div v-if="hasError" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ errorState.message }}
                    <button v-if="shouldShowRetry" @click="retryRegistration" class="btn btn-sm btn-outline-danger ms-2">
                      <i class="fas fa-redo me-1"></i> Retry
                    </button>
                  </div>
                  
                  <!-- Form Buttons -->
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
                      <span v-if="uiState.isSubmitting">
                        <i class="fas fa-spinner fa-spin me-2"></i> {{ submitButtonText }}
                      </span>
                      <span v-else>
                        <i :class="submitButtonIcon + ' me-2'"></i> {{ submitButtonText }}
                      </span>
                    </button>
                    <router-link to="/login" class="btn btn-outline">
                      Already have an account? Sign in
                    </router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
        <!-- Terms Modal -->
      <div v-if="uiState.showTermsModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Terms and Conditions</h5>
              <button type="button" class="btn-close" @click="closeModal('terms')" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>By accessing and using our platform, you agree to these terms and conditions.</p>
              <p>These terms constitute a legal agreement between you and TechWorld regarding your use of our platform.</p>
              <h6>1. Account Registration</h6>
              <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
              <h6>2. User Conduct</h6>
              <p>You agree not to use the platform for any illegal purposes or in violation of any applicable laws.</p>
              <h6>3. Privacy</h6>
              <p>Your use of our service is also governed by our Privacy Policy.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal('terms')">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Privacy Modal -->
      <div v-if="uiState.showPrivacyModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Privacy Policy</h5>
              <button type="button" class="btn-close" @click="closeModal('privacy')" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>At TechWorld, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
              <h6>Information Collection</h6>
              <p>We collect information you provide during registration and checkout, including name, email, address, and payment details.</p>
              <h6>Information Usage</h6>
              <p>We use your information to process orders, manage your account, and improve our services.</p>
              <h6>Data Protection</h6>
              <p>We employ industry-standard security measures to protect your personal information from unauthorized access.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal('privacy')">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Backdrop -->
      <div v-if="uiState.showTermsModal || uiState.showPrivacyModal" class="modal-backdrop fade show" @click="closeModal(uiState.showTermsModal ? 'terms' : 'privacy')"></div>
    </div>
  `,
  data() {
    return {
      // Configuration
      config: {
        enableDebugMode: window.APP_CONSTANTS?.DEBUG?.ENABLED ?? false,
        validationDebounceMs:
          window.APP_CONSTANTS?.VALIDATION?.DEBOUNCE_MS ?? 300,
        redirectDelayMs:
          window.APP_CONSTANTS?.NAVIGATION?.REDIRECT_DELAY_MS ?? 2000,
        maxRetryAttempts: window.APP_CONSTANTS?.API?.MAX_RETRY_ATTEMPTS ?? 3,
        passwordMinLength:
          window.APP_CONSTANTS?.VALIDATION?.PASSWORD_MIN_LENGTH ?? 8,
        nameMinLength: window.APP_CONSTANTS?.VALIDATION?.NAME_MIN_LENGTH ?? 2,
        nameMaxLength: window.APP_CONSTANTS?.VALIDATION?.NAME_MAX_LENGTH ?? 50,
        emailMaxLength:
          window.APP_CONSTANTS?.VALIDATION?.EMAIL_MAX_LENGTH ?? 100,
        phonePattern:
          window.APP_CONSTANTS?.VALIDATION?.PHONE_PATTERN ??
          "^[0-9+\\-\\s()]{8,20}$",
        namePattern:
          window.APP_CONSTANTS?.VALIDATION?.NAME_PATTERN ??
          "^[a-zA-Z\\s'\\-\\.]+$",
      },

      // Form Data
      formData: {
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      },

      // UI State
      uiState: {
        isSubmitting: false,
        registrationSuccess: false,
        showPassword: false,
        showConfirmPassword: false,
        showTermsModal: false,
        showPrivacyModal: false,
        isInitialized: false,
        isFormDirty: false,
      },

      // Validation State
      validation: {
        errors: {},
        touched: {},
        isValid: false,
        submitted: false,
        debounceTimeouts: {},
      },

      // Error State
      errorState: {
        message: null,
        code: null,
        retryCount: 0,
        lastError: null,
      },

      // Component State
      componentState: {
        isMounted: false,
        watchers: [],
        intervals: [],
        timeouts: [],
      },
    };
  },
  computed: {
    // Form validation state
    isFormValid() {
      return (
        this.hasRequiredFields &&
        this.hasValidFields &&
        this.validation.isValid &&
        Object.keys(this.validation.errors).length === 0
      );
    },

    hasRequiredFields() {
      return !!(
        this.formData.email?.trim() &&
        this.formData.firstName?.trim() &&
        this.formData.lastName?.trim() &&
        this.formData.password &&
        this.formData.confirmPassword &&
        this.formData.agreeTerms
      );
    },

    hasValidFields() {
      const requiredFields = [
        "email",
        "firstName",
        "lastName",
        "password",
        "confirmPassword",
      ];
      return requiredFields.every((field) => !this.validation.errors[field]);
    },

    // Individual field validation states
    emailValidationState() {
      return this.getFieldValidationState("email");
    },

    firstNameValidationState() {
      return this.getFieldValidationState("firstName");
    },

    lastNameValidationState() {
      return this.getFieldValidationState("lastName");
    },

    phoneValidationState() {
      return this.getFieldValidationState("phone");
    },

    addressValidationState() {
      return this.getFieldValidationState("address");
    },

    passwordValidationState() {
      return this.getFieldValidationState("password");
    },

    confirmPasswordValidationState() {
      return this.getFieldValidationState("confirmPassword");
    },

    termsValidationState() {
      return this.getFieldValidationState("agreeTerms");
    },

    // Password strength indicators
    passwordStrength() {
      return this.calculatePasswordStrength(this.formData.password || "");
    },

    passwordStrengthText() {
      const strength = this.passwordStrength;
      const strengthLevels = window.APP_CONSTANTS?.PASSWORD_STRENGTH
        ?.LEVELS || {
        VERY_WEAK: { threshold: 30, text: "Very Weak" },
        WEAK: { threshold: 50, text: "Weak" },
        MEDIUM: { threshold: 75, text: "Medium" },
        STRONG: { threshold: 90, text: "Strong" },
        VERY_STRONG: { threshold: 100, text: "Very Strong" },
      };

      if (strength < strengthLevels.VERY_WEAK.threshold)
        return strengthLevels.VERY_WEAK.text;
      if (strength < strengthLevels.WEAK.threshold)
        return strengthLevels.WEAK.text;
      if (strength < strengthLevels.MEDIUM.threshold)
        return strengthLevels.MEDIUM.text;
      if (strength < strengthLevels.STRONG.threshold)
        return strengthLevels.STRONG.text;
      return strengthLevels.VERY_STRONG.text;
    },

    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 30) return "bg-danger";
      if (strength < 50) return "bg-warning";
      if (strength < 75) return "bg-info";
      return "bg-success";
    },

    passwordStrengthTextClass() {
      const strength = this.passwordStrength;
      if (strength < 30) return "text-danger";
      if (strength < 50) return "text-warning";
      if (strength < 75) return "text-info";
      return "text-success";
    },

    // UI state computed properties
    canSubmit() {
      return (
        this.isFormValid &&
        !this.uiState.isSubmitting &&
        this.uiState.isInitialized
      );
    },

    submitButtonText() {
      if (this.uiState.isSubmitting) {
        return (
          window.APP_CONSTANTS?.MESSAGES?.CREATING_ACCOUNT ||
          "Creating Account..."
        );
      }
      return window.APP_CONSTANTS?.MESSAGES?.CREATE_ACCOUNT || "Create Account";
    },

    submitButtonIcon() {
      return this.uiState.isSubmitting
        ? "fas fa-spinner fa-spin"
        : "fas fa-user-plus";
    },

    // Error and success states
    hasError() {
      return !!this.errorState.message;
    },

    shouldShowRetry() {
      return (
        this.hasError &&
        this.errorState.retryCount < this.config.maxRetryAttempts
      );
    },
  },
  watch: {
    // Form data watchers with debounced validation
    "formData.email": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("email");
        }
      },
      immediate: false,
    },

    "formData.firstName": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("firstName");
        }
      },
      immediate: false,
    },

    "formData.lastName": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("lastName");
        }
      },
      immediate: false,
    },

    "formData.phone": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("phone");
        }
      },
      immediate: false,
    },

    "formData.address": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("address");
        }
      },
      immediate: false,
    },

    "formData.password": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("password");
          // Also validate confirm password when password changes
          if (this.formData.confirmPassword) {
            this.debouncedValidateField("confirmPassword");
          }
        }
      },
      immediate: false,
    },

    "formData.confirmPassword": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.debouncedValidateField("confirmPassword");
        }
      },
      immediate: false,
    },

    "formData.agreeTerms": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.uiState.isFormDirty = true;
          this.validateField("agreeTerms"); // Immediate validation for checkbox
        }
      },
      immediate: false,
    }, // Watch for form validation state changes
    "validation.errors": {
      handler(newErrors) {
        this.validation.isValid = Object.keys(newErrors).length === 0;
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    try {
      // Set up component state
      this.componentState.isMounted = false;

      if (this.config.enableDebugMode) {
        console.log("RegisterPage: Component created", {
          config: this.config,
        });
      }
    } catch (error) {
      this.handleError(error, "COMPONENT_CREATION_ERROR");
    }
  },

  async mounted() {
    try {
      this.componentState.isMounted = true;

      // Initialize the application
      await this.initializeComponent(); // Set up focus management
      this.setupFocusManagement();

      if (this.config.enableDebugMode) {
        console.log("RegisterPage: Component mounted successfully");
      }
    } catch (error) {
      this.handleError(error, "COMPONENT_MOUNT_ERROR");
    }
  },

  beforeUnmount() {
    try {
      // Clean up debounce timeouts
      Object.values(this.validation.debounceTimeouts).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      }); // Clean up intervals and timeouts
      this.componentState.intervals.forEach((interval) =>
        clearInterval(interval)
      );
      this.componentState.timeouts.forEach((timeout) => clearTimeout(timeout));

      if (this.config.enableDebugMode) {
        console.log("RegisterPage: Component cleanup completed");
      }
    } catch (error) {
      console.error("Error during component cleanup:", error);
    }
  },
  methods: {
    // ================================
    // INITIALIZATION METHODS
    // ================================

    async initializeComponent() {
      try {
        // Initialize the database and auth service
        await this.initializeDatabase();

        // Mark as initialized
        this.uiState.isInitialized = true;

        if (this.config.enableDebugMode) {
          console.log("RegisterPage: Component initialized successfully");
        }
      } catch (error) {
        this.handleError(error, "INITIALIZATION_ERROR");
        throw error;
      }
    },

    async initializeDatabase() {
      try {
        if (
          window.AuthService &&
          typeof window.AuthService.init === "function"
        ) {
          await window.AuthService.init();
        } else {
          console.warn("AuthService not available, using fallback");
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        this.setError(
          window.APP_CONSTANTS?.MESSAGES?.INITIALIZATION_ERROR ||
            "Unable to initialize the application. Please try again later.",
          "DATABASE_INIT_ERROR"
        );
        throw error;
      }
    },
    setupFocusManagement() {
      this.$nextTick(() => {
        try {
          const emailInput = this.$refs.emailInput;
          if (emailInput) {
            emailInput.focus();
          }
        } catch (error) {
          console.error("Error setting up focus management:", error);
        }
      });
    },

    // ================================
    // VALIDATION METHODS
    // ================================

    getFieldValidationState(fieldName) {
      const hasError = !!this.validation.errors[fieldName];
      const isTouched = this.validation.touched[fieldName];
      const hasValue =
        this.formData[fieldName] && this.formData[fieldName].toString().trim();

      return {
        isValid: !hasError && isTouched && hasValue,
        isInvalid: hasError && (isTouched || this.validation.submitted),
        error: this.validation.errors[fieldName],
        isTouched,
        hasValue: !!hasValue,
      };
    },

    debouncedValidateField(fieldName) {
      // Clear existing timeout for this field
      if (this.validation.debounceTimeouts[fieldName]) {
        clearTimeout(this.validation.debounceTimeouts[fieldName]);
      }

      // Set new timeout
      this.validation.debounceTimeouts[fieldName] = setTimeout(() => {
        this.validateField(fieldName);
        delete this.validation.debounceTimeouts[fieldName];
      }, this.config.validationDebounceMs);
    },

    validateField(fieldName, markTouched = false) {
      try {
        if (markTouched) {
          this.validation.touched[fieldName] = true;
        } // Clear existing error
        this.$delete(this.validation.errors, fieldName);

        const value = this.formData[fieldName];
        const shouldValidate =
          this.validation.touched[fieldName] || this.validation.submitted;

        if (!shouldValidate) return;

        let errorMessage = null;

        // Use ValidationService if available, otherwise use built-in validation
        if (window.ValidationService) {
          const result = this.validateWithService(fieldName, value);
          if (!result.isValid) {
            errorMessage = result.message;
          }
        } else {
          errorMessage = this.validateWithBuiltIn(fieldName, value);
        }

        if (errorMessage) {
          this.$set(this.validation.errors, fieldName, errorMessage);
        }

        if (this.config.enableDebugMode) {
          console.log(`Validation for ${fieldName}:`, {
            value,
            isValid: !errorMessage,
            error: errorMessage,
          });
        }
      } catch (error) {
        console.error(`Error validating field ${fieldName}:`, error);
        this.$set(
          this.validation.errors,
          fieldName,
          "Validation error occurred"
        );
      }
    },

    validateWithService(fieldName, value) {
      try {
        const validationRules = this.getValidationRules(fieldName);
        return window.ValidationService.validateField(
          fieldName,
          value,
          validationRules
        );
      } catch (error) {
        console.error("ValidationService error:", error);
        return { isValid: false, message: "Validation service error" };
      }
    },

    validateWithBuiltIn(fieldName, value) {
      const rules = this.getValidationRules(fieldName);

      // Required field validation
      if (rules.required && (!value || !value.toString().trim())) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.[fieldName]?.REQUIRED ||
          `${this.getFieldDisplayName(fieldName)} is required`
        );
      }

      // Skip other validations if field is empty and not required
      if (!value || !value.toString().trim()) {
        return null;
      }

      const trimmedValue = value.toString().trim();

      // Field-specific validation
      switch (fieldName) {
        case "email":
          return this.validateEmail(trimmedValue);
        case "firstName":
        case "lastName":
          return this.validateName(trimmedValue, fieldName);
        case "phone":
          return this.validatePhone(trimmedValue);
        case "password":
          return this.validatePassword(trimmedValue);
        case "confirmPassword":
          return this.validateConfirmPassword(trimmedValue);
        case "agreeTerms":
          return this.validateTerms(value);
        default:
          return null;
      }
    },

    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.email?.INVALID ||
          "Please enter a valid email address"
        );
      }

      if (email.length > this.config.emailMaxLength) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.email?.TOO_LONG ||
          `Email must not exceed ${this.config.emailMaxLength} characters`
        );
      }

      return null;
    },

    validateName(name, fieldName) {
      if (name.length < this.config.nameMinLength) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.[fieldName]?.TOO_SHORT ||
          `${this.getFieldDisplayName(fieldName)} must be at least ${
            this.config.nameMinLength
          } characters`
        );
      }

      if (name.length > this.config.nameMaxLength) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.[fieldName]?.TOO_LONG ||
          `${this.getFieldDisplayName(fieldName)} must not exceed ${
            this.config.nameMaxLength
          } characters`
        );
      }

      const nameRegex = new RegExp(this.config.namePattern);
      if (!nameRegex.test(name)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.[fieldName]
            ?.INVALID_FORMAT ||
          `${this.getFieldDisplayName(
            fieldName
          )} can only contain letters, spaces, hyphens, and apostrophes`
        );
      }

      return null;
    },

    validatePhone(phone) {
      if (!phone) return null; // Optional field

      const phoneRegex = new RegExp(this.config.phonePattern);
      if (!phoneRegex.test(phone)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.phone?.INVALID ||
          "Please enter a valid phone number"
        );
      }

      return null;
    },

    validatePassword(password) {
      if (password.length < this.config.passwordMinLength) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.password?.TOO_SHORT ||
          `Password must be at least ${this.config.passwordMinLength} characters`
        );
      }

      const requirements = window.APP_CONSTANTS?.PASSWORD_REQUIREMENTS || {
        UPPERCASE: true,
        LOWERCASE: true,
        NUMBERS: true,
        SPECIAL_CHARS: false,
      };

      if (requirements.UPPERCASE && !/[A-Z]/.test(password)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.password
            ?.MISSING_UPPERCASE ||
          "Password must include at least one uppercase letter"
        );
      }

      if (requirements.LOWERCASE && !/[a-z]/.test(password)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.password
            ?.MISSING_LOWERCASE ||
          "Password must include at least one lowercase letter"
        );
      }

      if (requirements.NUMBERS && !/\d/.test(password)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.password
            ?.MISSING_NUMBERS || "Password must include at least one number"
        );
      }

      if (requirements.SPECIAL_CHARS && !/[^A-Za-z0-9]/.test(password)) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.password
            ?.MISSING_SPECIAL ||
          "Password must include at least one special character"
        );
      }

      return null;
    },

    validateConfirmPassword(confirmPassword) {
      if (this.formData.password !== confirmPassword) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.confirmPassword
            ?.MISMATCH || "Passwords do not match"
        );
      }

      return null;
    },

    validateTerms(agreed) {
      if (!agreed) {
        return (
          window.APP_CONSTANTS?.VALIDATION_MESSAGES?.agreeTerms?.REQUIRED ||
          "You must agree to the terms and privacy policy"
        );
      }

      return null;
    },

    validateAllFields() {
      this.validation.submitted = true;

      const fields = [
        "email",
        "firstName",
        "lastName",
        "phone",
        "address",
        "password",
        "confirmPassword",
        "agreeTerms",
      ];

      fields.forEach((field) => {
        this.validateField(field, true);
      });
      const isValid = Object.keys(this.validation.errors).length === 0;

      return isValid;
    },

    getValidationRules(fieldName) {
      const commonRules = window.APP_CONSTANTS?.VALIDATION_RULES || {};
      const fieldRules = commonRules[fieldName] || {};

      return {
        required: [
          "email",
          "firstName",
          "lastName",
          "password",
          "confirmPassword",
          "agreeTerms",
        ].includes(fieldName),
        ...fieldRules,
      };
    },

    getFieldDisplayName(fieldName) {
      const displayNames = {
        email: "Email",
        firstName: "First Name",
        lastName: "Last Name",
        phone: "Phone",
        address: "Address",
        password: "Password",
        confirmPassword: "Confirm Password",
        agreeTerms: "Terms Agreement",
      };

      return displayNames[fieldName] || fieldName;
    },

    // ================================
    // PASSWORD STRENGTH METHODS
    // ================================

    calculatePasswordStrength(password) {
      if (!password) return 0;

      let strength = 0;

      // Length contribution (up to 40%)
      const lengthContribution = Math.min(password.length * 5, 40);
      strength += lengthContribution;

      // Character variety contribution
      if (/[A-Z]/.test(password)) strength += 15; // uppercase
      if (/[a-z]/.test(password)) strength += 15; // lowercase
      if (/[0-9]/.test(password)) strength += 15; // numbers
      if (/[^A-Za-z0-9]/.test(password)) strength += 15; // special chars

      return Math.min(strength, 100);
    },

    // ================================
    // UI INTERACTION METHODS
    // ================================

    togglePasswordVisibility(field) {
      try {
        if (field === "password") {
          this.uiState.showPassword = !this.uiState.showPassword;
        } else if (field === "confirm") {
          this.uiState.showConfirmPassword = !this.uiState.showConfirmPassword;
        }
      } catch (error) {
        console.error("Error toggling password visibility:", error);
      }
    },

    openModal(modalType) {
      try {
        if (modalType === "terms") {
          this.uiState.showTermsModal = true;
        } else if (modalType === "privacy") {
          this.uiState.showPrivacyModal = true;
        }

        // Focus management for accessibility
        this.$nextTick(() => {
          const modal = document.querySelector(".modal.show");
          if (modal) {
            const closeButton = modal.querySelector(".btn-close");
            if (closeButton) closeButton.focus();
          }
        });
      } catch (error) {
        console.error("Error opening modal:", error);
      }
    },

    closeModal(modalType) {
      try {
        if (modalType === "terms") {
          this.uiState.showTermsModal = false;
        } else if (modalType === "privacy") {
          this.uiState.showPrivacyModal = false;
        }
      } catch (error) {
        console.error("Error closing modal:", error);
      }
    },

    // ================================
    // FORM SUBMISSION METHODS
    // ================================

    async handleFormSubmit() {
      try {
        // Validate form
        if (!this.validateAllFields()) {
          await this.scrollToFirstError();
          return;
        }

        // Clear previous errors and set submitting state
        this.clearError();
        this.uiState.isSubmitting = true;

        // Prepare user data
        const userData = this.prepareUserData();

        // Attempt registration
        const result = await this.registerUser(userData);

        if (result.success) {
          await this.handleRegistrationSuccess(result);
        } else {
          this.handleRegistrationError(result);
        }
      } catch (error) {
        this.handleError(error, "REGISTRATION_ERROR");
      } finally {
        this.uiState.isSubmitting = false;
      }
    },

    prepareUserData() {
      return {
        email: this.formData.email.trim(),
        firstName: this.formData.firstName.trim(),
        lastName: this.formData.lastName.trim(),
        password: this.formData.password,
        phone: this.formData.phone?.trim() || "",
        address: this.formData.address?.trim() || "",
        createdAt: new Date().toISOString(),
        source: "web_registration",
      };
    },

    async registerUser(userData) {
      try {
        if (
          window.AuthService &&
          typeof window.AuthService.register === "function"
        ) {
          return await window.AuthService.register(userData);
        } else {
          // Fallback registration logic
          console.warn(
            "AuthService not available, using fallback registration"
          );
          return await this.fallbackRegister(userData);
        }
      } catch (error) {
        console.error("Registration service error:", error);
        return {
          success: false,
          message: "Registration service unavailable",
          error: error.message,
        };
      }
    },

    async fallbackRegister(userData) {
      // Simulate registration delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Basic validation
      if (!userData.email || !userData.password) {
        return {
          success: false,
          message: "Invalid user data",
          code: "INVALID_DATA",
        };
      }

      // Simulate successful registration
      return {
        success: true,
        message: "Registration successful",
        user: {
          id: Date.now(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      };
    },

    async handleRegistrationSuccess(result) {
      try {
        this.uiState.registrationSuccess = true;

        // Show success toast if available
        if (window.toast) {
          window.toast.success(
            window.APP_CONSTANTS?.MESSAGES?.REGISTRATION_SUCCESS ||
              "Account created successfully! Redirecting to login..."
          );
        }

        // Dispatch auth-updated event
        window.dispatchEvent(
          new CustomEvent("auth-updated", {
            detail: { type: "registration", user: result.user },
          })
        );

        // Redirect after delay
        const redirectTimeout = setTimeout(() => {
          if (this.$router) {
            this.$router.push("/login");
          } else {
            window.location.href = "/login";
          }
        }, this.config.redirectDelayMs);

        this.componentState.timeouts.push(redirectTimeout);
      } catch (error) {
        console.error("Error handling registration success:", error);
      }
    },

    handleRegistrationError(result) {
      try {
        const errorMessage =
          result.message ||
          window.APP_CONSTANTS?.MESSAGES?.REGISTRATION_ERROR ||
          "An error occurred during registration";

        this.setError(errorMessage, result.code);

        // Handle specific error codes
        if (result.code === "email-exists" || result.code === "EMAIL_EXISTS") {
          // Focus on email input for email-related errors
          this.$nextTick(() => {
            const emailInput = this.$refs.emailInput;
            if (emailInput) {
              emailInput.focus();
              emailInput.select();
            }
          });
        }

        // Show error toast if available
        if (window.toast) {
          window.toast.error(errorMessage);
        }
      } catch (error) {
        console.error("Error handling registration error:", error);
      }
    },

    async retryRegistration() {
      try {
        if (this.errorState.retryCount >= this.config.maxRetryAttempts) {
          return;
        }
        this.errorState.retryCount++;

        await this.handleFormSubmit();
      } catch (error) {
        this.handleError(error, "RETRY_ERROR");
      }
    },

    async scrollToFirstError() {
      try {
        await this.$nextTick();

        const firstErrorElement = document.querySelector(".is-invalid");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          firstErrorElement.focus();
        }
      } catch (error) {
        console.error("Error scrolling to first error:", error);
      }
    },

    // ================================
    // ERROR HANDLING METHODS
    // ================================

    setError(message, code = null) {
      this.errorState.message = message;
      this.errorState.code = code;
      this.errorState.lastError = new Date().toISOString();

      if (this.config.enableDebugMode) {
        console.error("RegisterPage Error:", { message, code });
      }
    },

    clearError() {
      this.errorState.message = null;
      this.errorState.code = null;
      this.errorState.lastError = null;
    },

    handleError(error, context = "UNKNOWN") {
      try {
        const errorMessage =
          error?.message || error || "An unexpected error occurred";

        // Use ErrorHandler service if available
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, context);
        }

        // Set local error state
        this.setError(errorMessage, context); // Log for debugging
        console.error(`RegisterPage Error [${context}]:`, error);

        // Show error toast if available
        if (window.toast) {
          window.toast.error(errorMessage);
        }
      } catch (handlingError) {
        console.error("Error in error handler:", handlingError);
      }
    },
  },
};

// ================================
// GLOBAL COMPONENT REGISTRATION
// ================================

// Make the enhanced component globally available for cross-component communication
// and potential use in other parts of the application
if (typeof window !== "undefined") {
  window.RegisterPage = RegisterPage;

  // Also register with a more descriptive name for debugging
  window.EnhancedRegisterPage = RegisterPage;

  // Register component info for debugging and introspection
  if (window.APP_CONSTANTS?.DEBUG?.ENABLED) {
    window.componentRegistry = window.componentRegistry || {};
    window.componentRegistry.RegisterPage = {
      name: "RegisterPage",
      version: "2.0.0",
      features: [
        "Enhanced Validation",
        "Error Handling",
        "Accessibility Features",
        "Performance Optimization",
        "Constants Integration",
        "Debounced Validation",
        "Password Strength Indicator",
        "Toast Notifications",
        "Retry Mechanism",
      ],
      lastModified: "2024-12-19",
      dependencies: [
        "AuthService",
        "ValidationService",
        "APP_CONSTANTS",
        "ErrorHandler",
      ],
    };

    console.log(
      "RegisterPage: Enhanced component registered globally",
      window.componentRegistry.RegisterPage
    );
  }
}

// Export the component for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = RegisterPage;
}
