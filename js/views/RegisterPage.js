/**
 * RegistrationPage Component
 * Handles user registration with validation and database storage
 */
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
                <div v-if="registrationSuccess" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i> Registration successful! Redirecting to login...
                </div>
                
                <!-- Registration Form -->
                <form v-else @submit.prevent="register" class="registration-form" novalidate aria-labelledby="form-title">
                  <!-- Form Instructions -->
                  <p class="text-muted mb-4" id="form-title">Please fill in the information below to create your account.</p>
                  
                  <!-- Basic Information Section -->
                  <h5 class="mb-3">Personal Information</h5>
                  
                  <!-- Email Field -->
                  <div class="mb-3">
                    <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model.trim="formData.email"
                      @input="validateEmail"
                      @blur="validateEmail(true)"
                      :class="{ 'is-invalid': validationErrors.email, 'is-valid': formData.email && !validationErrors.email }"
                      required
                      autocomplete="email"
                      ref="emailInput"
                      aria-describedby="emailFeedback emailHelp"
                    >
                    <div v-if="validationErrors.email" class="invalid-feedback" id="emailFeedback">
                      {{ validationErrors.email }}
                    </div>
                    <div v-else-if="formData.email" class="valid-feedback">
                      Looks good!
                    </div>
                    <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                  </div>
                  
                  <!-- Name Fields (Side by Side) -->
                  <div class="row mb-3">
                    <div class="col-sm-6">
                      <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="firstName" 
                        v-model.trim="formData.firstName"
                        @input="validateFirstName"
                        @blur="validateFirstName(true)"
                        :class="{ 'is-invalid': validationErrors.firstName, 'is-valid': formData.firstName && !validationErrors.firstName }"
                        required
                        autocomplete="given-name"
                        aria-describedby="firstNameFeedback"
                      >
                      <div v-if="validationErrors.firstName" class="invalid-feedback" id="firstNameFeedback">
                        {{ validationErrors.firstName }}
                      </div>
                      <div v-else-if="formData.firstName" class="valid-feedback">
                        Looks good!
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <label for="lastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="lastName" 
                        v-model.trim="formData.lastName"
                        @input="validateLastName"
                        @blur="validateLastName(true)"
                        :class="{ 'is-invalid': validationErrors.lastName, 'is-valid': formData.lastName && !validationErrors.lastName }"
                        required
                        autocomplete="family-name"
                        aria-describedby="lastNameFeedback"
                      >
                      <div v-if="validationErrors.lastName" class="invalid-feedback" id="lastNameFeedback">
                        {{ validationErrors.lastName }}
                      </div>
                      <div v-else-if="formData.lastName" class="valid-feedback">
                        Looks good!
                      </div>
                    </div>
                  </div>
                  
                  <!-- Phone Number -->
                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="phone" 
                      v-model.trim="formData.phone"
                      @input="validatePhone"
                      @blur="validatePhone(true)"
                      :class="{ 'is-invalid': validationErrors.phone, 'is-valid': formData.phone && !validationErrors.phone }"
                      autocomplete="tel"
                      aria-describedby="phoneFeedback"
                    >
                    <div v-if="validationErrors.phone" class="invalid-feedback" id="phoneFeedback">
                      {{ validationErrors.phone }}
                    </div>
                    <div v-else-if="formData.phone" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Address -->
                  <div class="mb-4">
                    <label for="address" class="form-label">Shipping Address</label>
                    <textarea 
                      class="form-control" 
                      id="address" 
                      v-model.trim="formData.address"
                      @input="validateAddress"
                      @blur="validateAddress(true)"
                      rows="3"
                      :class="{ 'is-invalid': validationErrors.address, 'is-valid': formData.address && !validationErrors.address }"
                      autocomplete="street-address"
                      aria-describedby="addressFeedback"
                    ></textarea>
                    <div v-if="validationErrors.address" class="invalid-feedback" id="addressFeedback">
                      {{ validationErrors.address }}
                    </div>
                    <div v-else-if="formData.address" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Password Section -->
                  <h5 class="mb-3">Security Information</h5>
                  
                  <!-- Password Field -->
                  <div class="mb-3">
                    <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="password" 
                        v-model="formData.password"
                        @input="validatePassword"
                        @blur="validatePassword(true)"
                        :class="{ 'is-invalid': validationErrors.password, 'is-valid': formData.password && !validationErrors.password }"
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
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div v-if="validationErrors.password" class="invalid-feedback" id="passwordFeedback">
                        {{ validationErrors.password }}
                      </div>
                      <div v-else-if="formData.password" class="valid-feedback">
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
                    <div class="input-group">
                      <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="confirmPassword" 
                        v-model="formData.confirmPassword"
                        @input="validateConfirmPassword"
                        @blur="validateConfirmPassword(true)"
                        :class="{ 'is-invalid': validationErrors.confirmPassword, 'is-valid': formData.confirmPassword && !validationErrors.confirmPassword }"
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
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div v-if="validationErrors.confirmPassword" class="invalid-feedback" id="confirmPasswordFeedback">
                        {{ validationErrors.confirmPassword }}
                      </div>
                      <div v-else-if="formData.confirmPassword && formData.password === formData.confirmPassword" class="valid-feedback">
                        Passwords match!
                      </div>
                    </div>
                  </div>
                  
                  <!-- Terms and Conditions Checkbox -->
                  <div class="mb-4">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="agreeTerms"
                        v-model="formData.agreeTerms"
                        @change="validateTerms"
                        :class="{ 'is-invalid': validationErrors.agreeTerms }"
                        aria-describedby="termsError"
                      >
                      <label class="form-check-label" for="agreeTerms">
                        I agree to the <a href="#" @click.prevent="showTermsModal = true">Terms and Conditions</a> and <a href="#" @click.prevent="showPrivacyModal = true">Privacy Policy</a>
                      </label>
                      <div v-if="validationErrors.agreeTerms" class="invalid-feedback" id="termsError">
                        {{ validationErrors.agreeTerms }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Error Alert -->
                  <div v-if="error" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ error }}
                  </div>
                  
                  <!-- Form Buttons -->
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
                      <span v-if="isSubmitting">
                        <i class="fas fa-spinner fa-spin me-2"></i> Creating Account...
                      </span>
                      <span v-else>Create Account</span>
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
      <div v-if="showTermsModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Terms and Conditions</h5>
              <button type="button" class="btn-close" @click="showTermsModal = false"></button>
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
              <button type="button" class="btn btn-secondary" @click="showTermsModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Privacy Modal -->
      <div v-if="showPrivacyModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Privacy Policy</h5>
              <button type="button" class="btn-close" @click="showPrivacyModal = false"></button>
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
              <button type="button" class="btn btn-secondary" @click="showPrivacyModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Backdrop -->
      <div v-if="showTermsModal || showPrivacyModal" class="modal-backdrop fade show"></div>
    </div>
  `,
  data() {
    return {
      formData: {
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      submitted: false,
      isSubmitting: false,
      validationErrors: {},
      error: null,
      registrationSuccess: false,
      showPassword: false,
      showConfirmPassword: false,
      showTermsModal: false,
      showPrivacyModal: false,
      touched: {
        email: false,
        firstName: false,
        lastName: false,
        phone: false,
        address: false,
        password: false,
        confirmPassword: false,
        agreeTerms: false
      }
    };
  },
  computed: {
    isFormValid() {
      // Check that all required fields are filled and valid
      return !!this.formData.email && 
             !!this.formData.firstName && 
             !!this.formData.lastName && 
             !!this.formData.password && 
             !!this.formData.confirmPassword && 
             this.formData.agreeTerms &&
             Object.keys(this.validationErrors).length === 0;
    },
    
    // Password strength calculation
    passwordStrength() {
      const password = this.formData.password || '';
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
    
    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength < 30) return 'Very Weak';
      if (strength < 50) return 'Weak';
      if (strength < 75) return 'Medium';
      if (strength < 90) return 'Strong';
      return 'Very Strong';
    },
    
    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 30) return 'bg-danger';
      if (strength < 50) return 'bg-warning';
      if (strength < 75) return 'bg-info';
      return 'bg-success';
    },
    
    passwordStrengthTextClass() {
      const strength = this.passwordStrength;
      if (strength < 30) return 'text-danger';
      if (strength < 50) return 'text-warning';
      if (strength < 75) return 'text-info';
      return 'text-success';
    }
  },
  mounted() {
    // Initialize the database when component mounts
    this.initDatabase();
    
    // Focus on email input when component is mounted
    this.$nextTick(() => {
      if (this.$refs.emailInput) {
        this.$refs.emailInput.focus();
      }
    });
  },
  methods: {
    // Initialize database
    async initDatabase() {
      try {
        // Initialize the auth service and database
        await AuthService.init();
      } catch (error) {
        console.error('Error initializing database:', error);
        this.error = 'Unable to initialize the application. Please try again later.';
      }
    },
    
    // Email validation
    validateEmail(markTouched = false) {
      if (markTouched) {
        this.touched.email = true;
      }
      
      delete this.validationErrors.email;
      
      if (!this.formData.email && (this.touched.email || this.submitted)) {
        this.validationErrors.email = 'Email is required';
      } else if (this.formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        this.validationErrors.email = 'Invalid email format';
      }
    },
    
    // First name validation
    validateFirstName(markTouched = false) {
      if (markTouched) {
        this.touched.firstName = true;
      }
      
      delete this.validationErrors.firstName;
      
      if (!this.formData.firstName && (this.touched.firstName || this.submitted)) {
        this.validationErrors.firstName = 'First name is required';
      } else if (this.formData.firstName && this.formData.firstName.length < 2) {
        this.validationErrors.firstName = 'First name must be at least 2 characters';
      }
    },
    
    // Last name validation
    validateLastName(markTouched = false) {
      if (markTouched) {
        this.touched.lastName = true;
      }
      
      delete this.validationErrors.lastName;
      
      if (!this.formData.lastName && (this.touched.lastName || this.submitted)) {
        this.validationErrors.lastName = 'Last name is required';
      } else if (this.formData.lastName && this.formData.lastName.length < 2) {
        this.validationErrors.lastName = 'Last name must be at least 2 characters';
      }
    },
    
    // Phone validation
    validatePhone(markTouched = false) {
      if (markTouched) {
        this.touched.phone = true;
      }
      
      delete this.validationErrors.phone;
      
      if (this.formData.phone && !/^[0-9+\-\s()]{8,20}$/.test(this.formData.phone)) {
        this.validationErrors.phone = 'Please enter a valid phone number';
      }
    },
    
    // Address validation
    validateAddress(markTouched = false) {
      if (markTouched) {
        this.touched.address = true;
      }
      
      delete this.validationErrors.address;
      
      // Add address validation if needed
    },
    
    // Password validation
    validatePassword(markTouched = false) {
      if (markTouched) {
        this.touched.password = true;
      }
      
      delete this.validationErrors.password;
      
      if (!this.formData.password && (this.touched.password || this.submitted)) {
        this.validationErrors.password = 'Password is required';
      } else if (this.formData.password && this.formData.password.length < 8) {
        this.validationErrors.password = 'Password must be at least 8 characters';
      } else if (this.formData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.formData.password)) {
        this.validationErrors.password = 'Password must include uppercase, lowercase, and numbers';
      }
      
      // Update confirm password validation when password changes
      if (this.formData.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    
    // Confirm password validation
    validateConfirmPassword(markTouched = false) {
      if (markTouched) {
        this.touched.confirmPassword = true;
      }
      
      delete this.validationErrors.confirmPassword;
      
      if (!this.formData.confirmPassword && (this.touched.confirmPassword || this.submitted)) {
        this.validationErrors.confirmPassword = 'Please confirm your password';
      } else if (this.formData.password !== this.formData.confirmPassword) {
        this.validationErrors.confirmPassword = 'Passwords do not match';
      }
    },
    
    // Terms agreement validation
    validateTerms() {
      this.touched.agreeTerms = true;
      
      delete this.validationErrors.agreeTerms;
      
      if (!this.formData.agreeTerms) {
        this.validationErrors.agreeTerms = 'You must agree to the terms and privacy policy';
      }
    },
    
    // Validate entire form
    validateForm() {
      this.submitted = true;
      
      // Validate all fields
      this.validateEmail();
      this.validateFirstName();
      this.validateLastName();
      this.validatePhone();
      this.validateAddress();
      this.validatePassword();
      this.validateConfirmPassword();
      this.validateTerms();
      
      return Object.keys(this.validationErrors).length === 0;
    },
    
    // Toggle password visibility
    togglePasswordVisibility(field) {
      if (field === 'password') {
        this.showPassword = !this.showPassword;
      } else {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    
    // Register user
    async register() {
      // Validate form data
      if (!this.validateForm()) {
        // Scroll to the first error
        this.$nextTick(() => {
          const firstError = document.querySelector('.is-invalid');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          }
        });
        return;
      }
      
      // Reset error and set submitting state
      this.error = null;
      this.isSubmitting = true;
      
      try {
        // Prepare user data
        const userData = {
          email: this.formData.email,
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          password: this.formData.password,
          phone: this.formData.phone || '',
          address: this.formData.address || '',
          createdAt: new Date().toISOString()
        };
        
        // Register user using AuthService (now with database storage)
        const response = await AuthService.register(userData);
        
        // Handle response
        if (response.success) {
          this.registrationSuccess = true;
          
          // Dispatch auth-updated event to notify components in the same window
          window.dispatchEvent(new Event('auth-updated'));
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.error = response.message || 'An error occurred during registration';
          
          // If error is about email already in use, focus on email input
          if (response.code === 'email-exists') {
            this.$nextTick(() => {
              if (this.$refs.emailInput) {
                this.$refs.emailInput.focus();
              }
            });
          }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred. Please try again.';
        console.error('Registration error:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};

// Make the component globally available
window.RegisterPage = RegisterPage;