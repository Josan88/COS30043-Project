// Registration Page Component
const RegisterPage = {
  template: `
    <div class="register-page" id="content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="card">
              <div class="card-header">
                <h1>Create an Account</h1>
              </div>
              <div class="card-body">
                <form @submit.prevent="register" novalidate aria-labelledby="register-heading">
                  <h2 id="register-heading" class="sr-only">Registration Form</h2>
                  
                  <div class="form-group">
                    <label for="name" class="form-label">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      v-model="name" 
                      class="form-control"
                      :class="{ 'is-invalid': submitted && nameError }"
                      required
                      aria-required="true"
                      autocomplete="name"
                    >
                    <div v-if="submitted && nameError" class="invalid-feedback" role="alert">
                      {{ nameError }}
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      v-model="email" 
                      class="form-control"
                      :class="{ 'is-invalid': submitted && emailError }"
                      required
                      aria-required="true"
                      autocomplete="email"
                    >
                    <div v-if="submitted && emailError" class="invalid-feedback" role="alert">
                      {{ emailError }}
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      v-model="password" 
                      class="form-control"
                      :class="{ 'is-invalid': submitted && passwordError }"
                      required
                      aria-required="true"
                      autocomplete="new-password"
                      aria-describedby="password-help"
                    >
                    <small id="password-help" class="form-text text-muted">
                      Password must be at least 6 characters long.
                    </small>
                    <div v-if="submitted && passwordError" class="invalid-feedback" role="alert">
                      {{ passwordError }}
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="confirm-password" class="form-label">Confirm Password</label>
                    <input 
                      type="password" 
                      id="confirm-password" 
                      v-model="confirmPassword" 
                      class="form-control"
                      :class="{ 'is-invalid': submitted && confirmPasswordError }"
                      required
                      aria-required="true"
                      autocomplete="new-password"
                    >
                    <div v-if="submitted && confirmPasswordError" class="invalid-feedback" role="alert">
                      {{ confirmPasswordError }}
                    </div>
                  </div>
                  
                  <div class="form-group form-check">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      v-model="termsAccepted" 
                      class="form-check-input"
                      :class="{ 'is-invalid': submitted && !termsAccepted }"
                      required
                      aria-required="true"
                    >
                    <label for="terms" class="form-check-label">
                      I accept the <a href="#" @click.prevent="showTerms">Terms and Conditions</a>
                    </label>
                    <div v-if="submitted && !termsAccepted" class="invalid-feedback" role="alert">
                      You must accept the Terms and Conditions
                    </div>
                  </div>
                  
                  <div v-if="errorMessage" class="alert alert-danger" role="alert">
                    {{ errorMessage }}
                  </div>
                  
                  <div class="form-actions">
                    <button 
                      type="submit" 
                      class="btn btn-primary" 
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading">
                        <i class="fas fa-spinner fa-spin"></i> Creating Account...
                      </span>
                      <span v-else>Create Account</span>
                    </button>
                  </div>
                </form>
                
                <div class="alternative-actions">
                  <p>Already have an account? <router-link to="/login">Login here</router-link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Terms and Conditions Modal -->
      <div v-if="showingTerms" class="modal-overlay" @click.self="closeTerms" role="dialog" aria-labelledby="terms-title">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="terms-title">Terms and Conditions</h2>
            <button @click="closeTerms" class="close-modal" aria-label="Close terms and conditions">×</button>
          </div>
          <div class="modal-body">
            <h3>1. Introduction</h3>
            <p>Welcome to ShopEase. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>
            
            <h3>2. User Accounts</h3>
            <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account.</p>
            
            <h3>3. Privacy</h3>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>
            
            <h3>4. Purchases</h3>
            <p>All purchases are subject to availability. We reserve the right to refuse service to anyone for any reason at any time.</p>
            
            <h3>5. Disclaimer</h3>
            <p>This is a demo application for educational purposes. No real purchases or transactions will be processed.</p>
          </div>
          <div class="modal-footer">
            <button @click="acceptTerms" class="btn btn-primary">Accept</button>
            <button @click="closeTerms" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      submitted: false,
      isLoading: false,
      errorMessage: '',
      showingTerms: false
    };
  },
  
  computed: {
    nameError() {
      if (!this.name) {
        return 'Name is required';
      }
      if (this.name.length < 2) {
        return 'Name must be at least 2 characters';
      }
      return '';
    },
    
    emailError() {
      if (!this.email) {
        return 'Email is required';
      }
      // Simple email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.email)) {
        return 'Please enter a valid email address';
      }
      return '';
    },
    
    passwordError() {
      if (!this.password) {
        return 'Password is required';
      }
      if (this.password.length < 6) {
        return 'Password must be at least 6 characters';
      }
      return '';
    },
    
    confirmPasswordError() {
      if (!this.confirmPassword) {
        return 'Please confirm your password';
      }
      if (this.confirmPassword !== this.password) {
        return 'Passwords do not match';
      }
      return '';
    }
  },
  
  methods: {
    register() {
      this.submitted = true;
      this.errorMessage = '';
      
      // Validate all form fields
      if (this.nameError || this.emailError || 
          this.passwordError || this.confirmPasswordError ||
          !this.termsAccepted) {
        return;
      }
      
      this.isLoading = true;
      
      // Attempt to register
      this.$root.register(this.name, this.email, this.password)
        .then(() => {
          // Navigate to account page after successful registration
          this.$router.push('/account');
        })
        .catch(error => {
          this.errorMessage = error || 'Registration failed. Please try again.';
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    
    showTerms() {
      this.showingTerms = true;
      
      // Make the modal accessible
      this.$nextTick(() => {
        // Focus on the first focusable element in the modal
        const focusableElements = this.$el.querySelectorAll('button, [href], input, select, textarea');
        if (focusableElements.length) {
          focusableElements[0].focus();
        }
        
        // Trap focus within modal
        document.addEventListener('keydown', this.handleTabKey);
      });
    },
    
    closeTerms() {
      this.showingTerms = false;
      document.removeEventListener('keydown', this.handleTabKey);
    },
    
    acceptTerms() {
      this.termsAccepted = true;
      this.closeTerms();
    },
    
    handleTabKey(e) {
      if (e.key === 'Tab' && this.showingTerms) {
        const focusableElements = this.$el.querySelectorAll('button, [href], input, select, textarea');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // If shift + tab and on first element, move to last element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // If tab and on last element, move to first element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      
      // Close modal on escape key
      if (e.key === 'Escape') {
        this.closeTerms();
      }
    }
  },
  
  mounted() {
    // Focus on name input when component is mounted
    this.$nextTick(() => {
      document.getElementById('name').focus();
    });
  },
  
  beforeDestroy() {
    // Cleanup event listener
    document.removeEventListener('keydown', this.handleTabKey);
  }
};