/**
 * Service Options Section Component
 *
 * Handles service method selection and related form fields.
 */

const ServiceOptionsSection = {
  props: {
    serviceMethod: {
      type: String,
      required: true,
    },
    tableNumber: {
      type: String,
      default: "",
    },
    deliveryAddress: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    specialRequests: {
      type: String,
      default: "",
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
  },

  template: `
    <section class="service-options-section">
      <div class="card mb-3 mb-lg-4">
        <div class="card-header bg-white">
          <h3 class="section-title">
            <i class="fas fa-concierge-bell me-2"></i>
            Service Method
          </h3>
        </div>
        <div class="card-body">
          <div class="service-method-grid">
            <div class="row g-3">
              
              <!-- Service Method Selection -->
              <div class="col-12">
                <label for="service-method" class="form-label fw-bold">Choose Service</label>
                <select 
                  class="form-select form-select-lg" 
                  id="service-method" 
                  :value="serviceMethod" 
                  @change="$emit('update-service-method', $event.target.value)"
                >
                  <option value="dine-in">🍽️ Dine-in</option>
                  <option value="pickup">🚶 Pick-up</option>
                  <option value="delivery">🚚 Delivery</option>
                </select>
              </div>

              <!-- Table Number - Dine-in Only -->
              <div v-if="serviceMethod === 'dine-in'" class="col-12 col-md-6">
                <label for="table-number" class="form-label">Table Number</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text">
                    <i class="fas fa-hashtag"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': validationErrors.tableNumber }"
                    id="table-number" 
                    :value="tableNumber"
                    @input="$emit('update-table-number', $event.target.value)"
                    placeholder="Enter table number"
                  >
                </div>
                <div v-if="validationErrors.tableNumber" class="invalid-feedback">
                  {{ validationErrors.tableNumber }}
                </div>
                <small class="form-text text-muted">
                  Find your table number displayed on your table
                </small>
              </div>

              <!-- Delivery Address - Delivery Only -->
              <div v-if="serviceMethod === 'delivery'" class="col-12">
                <label for="delivery-address" class="form-label">Delivery Address</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                  <textarea 
                    class="form-control" 
                    :class="{ 'is-invalid': validationErrors.deliveryAddress }"
                    id="delivery-address" 
                    :value="deliveryAddress"
                    @input="$emit('update-delivery-address', $event.target.value)"
                    rows="3" 
                    placeholder="Enter your complete delivery address"
                  ></textarea>
                </div>
                <div v-if="validationErrors.deliveryAddress" class="invalid-feedback">
                  {{ validationErrors.deliveryAddress }}
                </div>
              </div>

              <!-- Phone Number - Pickup/Delivery -->
              <div v-if="serviceMethod === 'pickup' || serviceMethod === 'delivery'" class="col-12 col-md-6">
                <label for="phone-number" class="form-label">Phone Number</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text">
                    <i class="fas fa-phone"></i>
                  </span>
                  <input 
                    type="tel" 
                    class="form-control" 
                    :class="{ 'is-invalid': validationErrors.phoneNumber }"
                    id="phone-number" 
                    :value="phoneNumber"
                    @input="$emit('update-phone-number', $event.target.value)"
                    placeholder="Enter phone number"
                  >
                </div>
                <div v-if="validationErrors.phoneNumber" class="invalid-feedback">
                  {{ validationErrors.phoneNumber }}
                </div>
                <small class="form-text text-muted">
                  For order updates and coordination
                </small>
              </div>

              <!-- Special Requests -->
              <div class="col-12">
                <label for="special-requests" class="form-label">Special Requests</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-comment-alt"></i>
                  </span>
                  <textarea 
                    class="form-control" 
                    id="special-requests" 
                    :value="specialRequests"
                    @input="$emit('update-special-requests', $event.target.value)"
                    rows="2"
                    placeholder="Any special requests for your order? (Optional)"
                  ></textarea>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
};

// Register component
if (typeof window !== "undefined") {
  window.ServiceOptionsSection = ServiceOptionsSection;

  // Auto-register with app instance when available
  if (window.app && window.app.component) {
    window.app.component("service-options-section", ServiceOptionsSection);
  }
}
