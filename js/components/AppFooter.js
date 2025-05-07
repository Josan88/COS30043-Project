/**
 * AppFooter Component
 * Footer component for the food ordering application
 */
window.app.component('app-footer', {
  template: `
    <footer class="footer mt-auto">
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-4 mb-4 mb-md-0">
            <h5>FoodNow</h5>
            <p>Your delicious food destination. Order online for delivery or pickup from your favorite local restaurants.</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div class="col-6 col-md-2 mb-3">
            <h5>Menu</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><router-link to="/product?category=mains" class="nav-link p-0 text-white">Main Dishes</router-link></li>
              <li class="nav-item mb-2"><router-link to="/product?category=appetizers" class="nav-link p-0 text-white">Appetizers</router-link></li>
              <li class="nav-item mb-2"><router-link to="/product?category=sides" class="nav-link p-0 text-white">Side Dishes</router-link></li>
              <li class="nav-item mb-2"><router-link to="/product?category=desserts" class="nav-link p-0 text-white">Desserts</router-link></li>
              <li class="nav-item mb-2"><router-link to="/product?category=drinks" class="nav-link p-0 text-white">Beverages</router-link></li>
            </ul>
          </div>

          <div class="col-6 col-md-2 mb-3">
            <h5>Help</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-white">Contact Us</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-white">FAQ</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-white">Delivery Areas</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-white">Dietary Information</a></li>
              <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-white">Order Tracking</a></li>
            </ul>
          </div>

          <div class="col-12 col-md-4 mb-3">
            <h5>Get Exclusive Offers</h5>
            <p>Subscribe to our newsletter for special deals and promotions.</p>
            <form @submit.prevent="subscribeNewsletter">
              <div class="d-flex w-100 gap-2">
                <label for="newsletter-email" class="sr-only">Email address</label>
                <input 
                  id="newsletter-email" 
                  type="email" 
                  class="form-control" 
                  placeholder="Email address" 
                  v-model="email"
                  required
                  aria-label="Email address for newsletter subscription"
                >
                <button class="btn btn-primary" type="submit">Subscribe</button>
              </div>
            </form>
          </div>
        </div>

        <div class="d-flex justify-content-between pt-4 mt-4 border-top">
          <p>© {{ currentYear }} FoodNow, Inc. All rights reserved.</p>
          <ul class="list-unstyled d-flex">
            <li class="ms-3"><a href="#" class="link-light">Terms</a></li>
            <li class="ms-3"><a href="#" class="link-light">Privacy</a></li>
            <li class="ms-3"><a href="#" class="link-light">Cookies</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `,
  data() {
    return {
      email: '',
      currentYear: new Date().getFullYear()
    };
  },
  methods: {
    subscribeNewsletter() {
      // In a real app, would send this to an API
      alert(`Thank you for subscribing with ${this.email}! You'll receive our special food offers.`);
      this.email = '';
    }
  }
});