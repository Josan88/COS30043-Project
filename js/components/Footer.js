// Footer Component
const Footer = {
  template: `
    <footer class="site-footer">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <h3>About ShopEase</h3>
            <p>ShopEase is your one-stop shop for all your electronic needs. We offer quality products at competitive prices with excellent customer service.</p>
          </div>
          <div class="col-md-4">
            <h3>Quick Links</h3>
            <ul class="footer-links">
              <li><router-link to="/">Home</router-link></li>
              <li><router-link to="/products">Products</router-link></li>
              <li><a href="#" @click.prevent>About Us</a></li>
              <li><a href="#" @click.prevent>Contact</a></li>
              <li><a href="#" @click.prevent>Privacy Policy</a></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h3>Connect With Us</h3>
            <ul class="social-links">
              <li><a href="#" @click.prevent aria-label="Facebook"><i class="fab fa-facebook-f"></i></a></li>
              <li><a href="#" @click.prevent aria-label="Twitter"><i class="fab fa-twitter"></i></a></li>
              <li><a href="#" @click.prevent aria-label="Instagram"><i class="fab fa-instagram"></i></a></li>
              <li><a href="#" @click.prevent aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a></li>
            </ul>
            <div class="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <form @submit.prevent="subscribeNewsletter">
                <div class="input-group">
                  <input 
                    type="email" 
                    class="form-control" 
                    placeholder="Your email address" 
                    v-model="email" 
                    required
                    aria-label="Your email address">
                  <button class="btn btn-primary" type="submit">Subscribe</button>
                </div>
                <div v-if="subscriptionMessage" class="subscription-message mt-2">
                  {{ subscriptionMessage }}
                </div>
              </form>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-md-8 col-sm-6">
            <p class="copyright">
              Copyright &copy; {{ currentYear }} ShopEase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
  
  data() {
    return {
      email: '',
      subscriptionMessage: ''
    };
  },
  
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  
  methods: {
    subscribeNewsletter() {
      // Here we would typically make an API call to subscribe the user
      // For demo purposes, we'll just show a success message
      this.subscriptionMessage = 'Thank you for subscribing to our newsletter!';
      this.$root.showNotification('Successfully subscribed to newsletter', 'success');
      this.email = '';
      
      // Clear the subscription message after a few seconds
      setTimeout(() => {
        this.subscriptionMessage = '';
      }, 3000);
    }
  }
};