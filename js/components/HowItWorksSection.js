// =====================================================
// HowItWorksSection Component
// =====================================================

const HowItWorksSection = {
  template: `
    <div class="container my-5 py-5">
      <div class="row text-center mb-5">
        <div class="col-lg-8 mx-auto">
          <h6 class="text-primary fw-bold text-uppercase">
            <i class="fas fa-question-circle me-2"></i> Simple Process
          </h6>
          <h2 class="display-5 fw-bold mb-3">How FoodNow Works</h2>
          <p class="text-muted">We've made ordering your favorite meals quicker and easier than ever</p>
        </div>
      </div>
      
      <div class="row g-5">
        <div class="col-md-4">
          <div class="process-card border-0 h-100 position-relative text-center">
            <div class="process-icon-container">
              <div class="process-icon-outer">
                <div class="process-icon-inner">
                  <i class="fas fa-utensils fa-2x text-primary"></i>
                </div>
              </div>
              <div class="process-step">1</div>
            </div>
            <h3 class="h4 my-4">Choose Your Meal</h3>
            <p class="text-muted mb-0">
              Browse our extensive menu featuring dishes from top local restaurants and select your favorites.
            </p>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="process-card border-0 h-100 position-relative text-center">
            <div class="process-icon-container">
              <div class="process-icon-outer">
                <div class="process-icon-inner">
                  <i class="fas fa-shopping-cart fa-2x text-primary"></i>
                </div>
              </div>
              <div class="process-step">2</div>
            </div>
            <h3 class="h4 my-4">Complete Your Order</h3>
            <p class="text-muted mb-0">
              Customize your meal, add it to your cart, and check out with our secure payment options.
            </p>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="process-card border-0 h-100 position-relative text-center">
            <div class="process-icon-container">
              <div class="process-icon-outer">
                <div class="process-icon-inner">
                  <i class="fas fa-hand-holding-heart fa-2x text-primary"></i>
                </div>
              </div>
              <div class="process-step">3</div>
            </div>
            <h3 class="h4 my-4">Enjoy Your Food</h3>
            <p class="text-muted mb-0">
              Receive your food delivered to your doorstep, pick it up, or enjoy it at our restaurant.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
};

// Register component globally
window.HowItWorksSection = HowItWorksSection;
