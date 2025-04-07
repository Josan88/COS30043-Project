// Login Page Component
const LoginPage = {
  template: `
    <div class="login-page" id="content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="card">
              <div class="card-header">
                <h1>Login to Your Account</h1>
              </div>
              <div class="card-body">
                <form @submit.prevent="login" novalidate aria-labelledby="login-heading">
                  <h2 id="login-heading" class="sr-only">Login Form</h2>
                  
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
                      autocomplete="current-password"
                    >
                    <div v-if="submitted && passwordError" class="invalid-feedback" role="alert">
                      {{ passwordError }}
                    </div>
                  </div>
                  
                  <div class="form-group form-check">
                    <input 
                      type="checkbox" 
                      id="remember-me" 
                      v-model="rememberMe" 
                      class="form-check-input"
                    >
                    <label for="remember-me" class="form-check-label">Remember Me</label>
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
                        <i class="fas fa-spinner fa-spin"></i> Logging in...
                      </span>
                      <span v-else>Login</span>
                    </button>
                  </div>
                </form>
                
                <div class="alternative-actions">
                  <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
                  <p><a href="#" @click.prevent="forgotPassword">Forgot Password?</a></p>
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
      email: '',
      password: '',
      rememberMe: false,
      submitted: false,
      isLoading: false,
      errorMessage: ''
    };
  },
  
  computed: {
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
    }
  },
  
  methods: {
    login() {
      this.submitted = true;
      this.errorMessage = '';
      
      // Validate form
      if (this.emailError || this.passwordError) {
        return;
      }
      
      this.isLoading = true;
      
      // Attempt to login
      this.$root.login(this.email, this.password)
        .then(() => {
          // Check if there's a redirect query parameter
          const redirectPath = this.$route.query.redirect || '/account';
          this.$router.push(redirectPath);
        })
        .catch(error => {
          this.errorMessage = error || 'Login failed. Please check your credentials.';
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    
    forgotPassword() {
      // In a real application, this would navigate to password reset flow
      alert('Password reset functionality would be implemented here in a real application.');
    }
  },
  
  mounted() {
    // Focus on email input when component is mounted
    this.$nextTick(() => {
      document.getElementById('email').focus();
    });
  }
};