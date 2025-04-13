/**
 * LoginPage Component
 * Handles user login with form validation and authentication
 */
const LoginPage = {
  template: `
    <div class="login-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-5">
            <div class="card shadow my-5">
              <div class="card-header bg-white text-center py-3">
                <h1 class="h3 mb-0">Sign In</h1>
              </div>
              
              <div class="card-body p-4">
                <!-- Login Success Message -->
                <div v-if="loginSuccess" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i> Login successful! Redirecting...
                </div>
                
                <!-- Login Form -->
                <form v-else @submit.prevent="login" class="login-form" novalidate aria-labelledby="form-title">
                  <!-- Form Instructions -->
                  <p class="text-muted mb-4" id="form-title">Please enter your email and password to sign in.</p>
                  
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
                      aria-describedby="emailFeedback"
                    >
                    <div v-if="validationErrors.email" class="invalid-feedback" id="emailFeedback">
                      {{ validationErrors.email }}
                    </div>
                    <div v-else-if="formData.email" class="valid-feedback">
                      Looks good!
                    </div>
                  </div>
                  
                  <!-- Password Field -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between">
                      <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                      <a href="#" class="form-text text-decoration-none">Forgot password?</a>
                    </div>
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
                        autocomplete="current-password"
                        aria-describedby="passwordFeedback passwordStrength"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline" 
                        @click="togglePasswordVisibility()"
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
                  <div v-if="error" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ error }}
                  </div>
                  
                  <!-- Form Buttons -->
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
                      <span v-if="isSubmitting">
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
      formData: {
        email: '',
        password: '',
        rememberMe: false
      },
      submitted: false,
      isSubmitting: false,
      validationErrors: {},
      error: null,
      loginSuccess: false,
      showPassword: false,
      touched: {
        email: false,
        password: false
      }
    };
  },
  computed: {
    isFormValid() {
      return !!this.formData.email && 
             !!this.formData.password && 
             Object.keys(this.validationErrors).length === 0;
    }
  },
  mounted() {
    // Focus on email input when component is mounted
    this.$nextTick(() => {
      if (this.$refs.emailInput) {
        this.$refs.emailInput.focus();
      }
    });
    
    // If remember me was previously used, pre-fill email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.formData.email = rememberedEmail;
      this.formData.rememberMe = true;
      // Validate pre-filled email
      this.validateEmail();
    }
  },
  methods: {
    // Validate email field
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
    
    // Validate password field
    validatePassword(markTouched = false) {
      if (markTouched) {
        this.touched.password = true;
      }
      
      delete this.validationErrors.password;
      
      if (!this.formData.password && (this.touched.password || this.submitted)) {
        this.validationErrors.password = 'Password is required';
      } else if (this.formData.password && this.formData.password.length < 8) {
        this.validationErrors.password = 'Password must be at least 8 characters';
      }
    },
    
    // Validate entire form
    validateForm() {
      this.submitted = true;
      this.validateEmail();
      this.validatePassword();
      
      return Object.keys(this.validationErrors).length === 0;
    },
    
    // Toggle password visibility
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    // Login
    async login() {
      // Validate form data
      if (!this.validateForm()) {
        // Focus on the first invalid field
        this.$nextTick(() => {
          const firstError = document.querySelector('.is-invalid');
          if (firstError) {
            firstError.focus();
          }
        });
        return;
      }
      
      // Reset error and set submitting state
      this.error = null;
      this.isSubmitting = true;
      
      try {
        // Remember email for future visits if remember me is checked
        if (this.formData.rememberMe) {
          localStorage.setItem('rememberedEmail', this.formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Authenticate user
        const response = await AuthService.login(this.formData.email, this.formData.password);
        
        // Handle authentication response
        if (response.success) {
          this.loginSuccess = true;
          
          // Dispatch auth-updated event to notify components in the same window
          window.dispatchEvent(new Event('auth-updated'));
          
          // Redirect to home page or intended destination after successful login
          const redirectPath = this.$route.query.redirect || '/';
          setTimeout(() => {
            this.$router.push(redirectPath);
          }, 1500);
        } else {
          this.error = response.message || 'Invalid email or password';
          // When login fails, focus on the email input for better UX
          this.$nextTick(() => {
            if (this.$refs.emailInput) {
              this.$refs.emailInput.focus();
            }
          });
        }
      } catch (error) {
        this.error = 'An unexpected error occurred. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};

// Make the component globally available
window.LoginPage = LoginPage;