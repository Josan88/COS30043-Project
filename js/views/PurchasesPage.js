/**
 * PurchasesPage Component
 * Displays user order history
 */
const PurchasesPage = {
  template: `
    <div class="purchases-page">
      <div class="container">
        <h1 class="mb-4">Your Order History</h1>
        
        <!-- Empty State -->
        <div v-if="orders.length === 0" class="text-center py-5">
          <i class="fas fa-utensils fa-4x mb-3 text-muted"></i>
          <h3>No orders yet</h3>
          <p>You haven't placed any food orders yet.</p>
          <router-link to="/product" class="btn btn-primary mt-3">
            <i class="fas fa-book-open"></i> Browse Menu
          </router-link>
        </div>
        
        <div v-else>
          <!-- Action Buttons -->
          <div class="d-flex justify-content-between mb-4">
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary" @click="toggleFilterMenu">
                <i class="fas fa-filter"></i> Filter Orders
              </button>
              <button v-if="anyFiltersActive" class="btn btn-outline-secondary" @click="clearFilters">
                Clear Filters
              </button>
            </div>
            <div class="d-flex gap-2">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search orders..." 
                  v-model="searchQuery"
                  @input="filterOrders"
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="searchQuery = ''; filterOrders()"
                  v-if="searchQuery"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <select class="form-select" v-model="statusFilter" @change="filterOrders">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <!-- Filter Card (collapsible) -->
          <div class="card mb-4" v-show="showFilterMenu">
            <div class="card-body">
              <h5 class="card-title">Filter Options</h5>
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Date Range</label>
                    <div class="row g-2">
                      <div class="col-6">
                        <input type="date" class="form-control" v-model="dateFilter.start" @change="filterOrders">
                        <div class="form-text">From</div>
                      </div>
                      <div class="col-6">
                        <input type="date" class="form-control" v-model="dateFilter.end" @change="filterOrders">
                        <div class="form-text">To</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Order Type</label>
                    <select class="form-select" v-model="deliveryTypeFilter" @change="filterOrders">
                      <option value="">All Types</option>
                      <option value="delivery">Delivery</option>
                      <option value="express">Express Delivery</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Price Range</label>
                    <div class="row g-2">
                      <div class="col-6">
                        <input type="number" class="form-control" v-model.number="priceFilter.min" @change="filterOrders" placeholder="Min">
                      </div>
                      <div class="col-6">
                        <input type="number" class="form-control" v-model.number="priceFilter.max" @change="filterOrders" placeholder="Max">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          <!-- Orders List -->
          <div class="card mb-4" v-for="order in filteredOrders" :key="order.id">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">Order #{{ order.id.toString().slice(-8) }}</h5>
                <p class="text-muted mb-0 small">
                  {{ new Date(order.orderTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                  <span class="mx-1">•</span>
                  {{ new Date(order.orderTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <span class="badge" :class="getStatusBadgeClass(order.status)">
                  {{ getStatusDisplayText(order.status) }}
                </span>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Actions
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item" @click="reorderItems(order)"><i class="fas fa-sync me-2"></i>Reorder</button></li>
                    <li><button class="dropdown-item" @click="toggleOrderDetails(order.id)">
                      <i class="fas" :class="expandedOrders.includes(order.id) ? 'fa-chevron-up' : 'fa-chevron-down'" me-2></i>
                      {{ expandedOrders.includes(order.id) ? 'Hide Details' : 'View Details' }}
                    </button></li>
                    <li v-if="order.status !== 'delivered' && order.status !== 'cancelled'">
                      <button class="dropdown-item text-danger" @click="cancelOrder(order.id)">
                        <i class="fas fa-ban me-2"></i>Cancel Order
                      </button>
                    </li>
                    <li v-if="order.status === 'delivered'"><hr class="dropdown-divider"></li>
                    <li v-if="order.status === 'delivered'">
                      <button class="dropdown-item" @click="rateOrder(order)">
                        <i class="fas fa-star me-2"></i>Leave Review
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Order Details (expandable) -->
            <div class="card-body" v-if="expandedOrders.includes(order.id)">
              <!-- Order Items -->
              <h6 class="mb-3">Food Items</h6>
              <div class="table-responsive d-none d-md-block">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" width="80">Image</th>
                      <th scope="col">Item</th>
                      <th scope="col" width="100">Price</th>
                      <th scope="col" width="80">Quantity</th>
                      <th scope="col" width="100">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.id">
                      <td>
                        <img :src="item.image" :alt="item.name" class="thumbnail-image">
                      </td>
                      <td>
                        {{ item.name }}
                        <div v-if="item.specialInstructions" class="small text-muted">
                          <i class="fas fa-info-circle"></i> {{ item.specialInstructions }}
                        </div>
                      </td>
                      <td>{{ $filters.currency(item.price) }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td>{{ $filters.currency(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
                      <td>{{ $filters.currency(order.totals.subtotal) }}</td>
                    </tr>
                    <tr v-if="order.bulkDiscount">
                      <td colspan="4" class="text-end text-success"><strong>Bulk Order Discount:</strong></td>
                      <td class="text-success">-{{ $filters.currency(order.bulkDiscount.amount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>{{ getDeliveryLabel(order) }}:</strong></td>
                      <td>
                        <span v-if="order.totals.deliveryFee > 0">{{ $filters.currency(order.totals.deliveryFee) }}</span>
                        <span v-else class="text-success">FREE</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Tax:</strong></td>
                      <td>{{ $filters.currency(order.totals.tax) }}</td>
                    </tr>
                    <tr v-if="order.promoCode">
                      <td colspan="4" class="text-end text-success"><strong>Promo ({{ order.promoCode.code }}):</strong></td>
                      <td class="text-success">
                        <span v-if="order.promoCode.type === 'percentage'">-{{ order.promoCode.value }}%</span>
                        <span v-else-if="order.promoCode.type === 'fixed'">-{{ $filters.currency(order.promoCode.value) }}</span>
                        <span v-else>Free Delivery</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total:</strong></td>
                      <td><strong>{{ $filters.currency(order.totals.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Mobile view for items -->
              <div class="d-md-none">
                <div v-for="item in order.items" :key="item.id" class="card mb-2">
                  <div class="card-body p-3">
                    <div class="d-flex">
                      <img :src="item.image" :alt="item.name" class="img-thumbnail me-3" style="max-height: 70px; max-width: 70px;">
                      <div class="flex-grow-1">
                        <h6 class="mb-1">{{ item.name }}</h6>
                        <div v-if="item.specialInstructions" class="small text-muted mb-2">
                          <i class="fas fa-info-circle"></i> {{ item.specialInstructions }}
                        </div>
                        <div class="d-flex justify-content-between">
                          <div class="text-muted">{{ item.quantity }} × {{ $filters.currency(item.price) }}</div>
                          <div class="fw-bold">{{ $filters.currency(item.price * item.quantity) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-body p-3">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{{ $filters.currency(order.totals.subtotal) }}</span>
                    </div>
                    <div v-if="order.bulkDiscount" class="d-flex justify-content-between mb-2 text-success">
                      <span>Bulk Order Discount:</span>
                      <span>-{{ $filters.currency(order.bulkDiscount.amount) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>{{ getDeliveryLabel(order) }}:</span>
                      <span v-if="order.totals.deliveryFee > 0">{{ $filters.currency(order.totals.deliveryFee) }}</span>
                      <span v-else class="text-success">FREE</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>{{ $filters.currency(order.totals.tax) }}</span>
                    </div>
                    <div v-if="order.promoCode" class="d-flex justify-content-between mb-2 text-success">
                      <span>Promo ({{ order.promoCode.code }}):</span>
                      <span>-{{ $filters.currency(order.promoDiscount) }}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>{{ $filters.currency(order.totals.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Delivery/Pickup Information -->
              <div class="row mt-4">
                <div class="col-md-6">
                  <h6 class="mb-3">{{ order.delivery.method === 'pickup' ? 'Pickup' : 'Delivery' }} Information</h6>
                  <div class="card">
                    <div class="card-body">
                      <p class="mb-2">
                        <strong>Method:</strong> 
                        {{ order.delivery.method === 'express' ? 'Express Delivery' : 
                           order.delivery.method === 'delivery' ? 'Standard Delivery' : 'Self Pickup' }}
                      </p>
                      
                      <div v-if="order.delivery.method === 'pickup'">
                        <p class="mb-1"><strong>Pickup Time:</strong> {{ order.delivery.details.pickupTime }}</p>
                        <p class="mb-1"><strong>Restaurant Address:</strong></p>
                        <p class="mb-0">
                          123 Food Street, Foodville<br>
                          Kuala Lumpur, 50000<br>
                          Malaysia
                        </p>
                      </div>
                      
                      <div v-else>
                        <p class="mb-1"><strong>Delivery Address:</strong></p>
                        <p class="mb-2">
                          {{ order.delivery.details.line1 }}<br>
                          <span v-if="order.delivery.details.line2">{{ order.delivery.details.line2 }}<br></span>
                          {{ order.delivery.details.city }}, {{ order.delivery.details.state }} {{ order.delivery.details.postcode }}
                        </p>
                        <p class="mb-0" v-if="order.delivery.details.notes">
                          <strong>Delivery Notes:</strong><br>
                          {{ order.delivery.details.notes }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <h6 class="mb-3">Order Timeline</h6>
                  <div class="card">
                    <div class="card-body">
                      <div class="order-timeline">
                        <div class="timeline-item" :class="{'completed': true}">
                          <div class="timeline-icon">
                            <i class="fas fa-check-circle"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>Order Placed</strong></p>
                            <p class="text-muted mb-0 small">{{ formatDateTime(order.orderTime) }}</p>
                          </div>
                        </div>
                        
                        <div class="timeline-item" :class="{'completed': isStatusReached(order.status, 'preparing')}">
                          <div class="timeline-icon">
                            <i class="fas" :class="isStatusReached(order.status, 'preparing') ? 'fa-check-circle' : 'fa-circle'"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>Preparing</strong></p>
                            <p class="text-muted mb-0 small" v-if="order.statusUpdates && order.statusUpdates.preparing">
                              {{ formatDateTime(order.statusUpdates.preparing) }}
                            </p>
                          </div>
                        </div>
                        
                        <div v-if="order.delivery.method !== 'pickup'" class="timeline-item" :class="{'completed': isStatusReached(order.status, 'out-for-delivery')}">
                          <div class="timeline-icon">
                            <i class="fas" :class="isStatusReached(order.status, 'out-for-delivery') ? 'fa-check-circle' : 'fa-circle'"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>Out for Delivery</strong></p>
                            <p class="text-muted mb-0 small" v-if="order.statusUpdates && order.statusUpdates['out-for-delivery']">
                              {{ formatDateTime(order.statusUpdates['out-for-delivery']) }}
                            </p>
                          </div>
                        </div>
                        
                        <div v-else class="timeline-item" :class="{'completed': isStatusReached(order.status, 'ready')}">
                          <div class="timeline-icon">
                            <i class="fas" :class="isStatusReached(order.status, 'ready') ? 'fa-check-circle' : 'fa-circle'"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>Ready for Pickup</strong></p>
                            <p class="text-muted mb-0 small" v-if="order.statusUpdates && order.statusUpdates.ready">
                              {{ formatDateTime(order.statusUpdates.ready) }}
                            </p>
                          </div>
                        </div>
                        
                        <div class="timeline-item" :class="{'completed': isStatusReached(order.status, 'delivered')}">
                          <div class="timeline-icon">
                            <i class="fas" :class="isStatusReached(order.status, 'delivered') ? 'fa-check-circle' : 'fa-circle'"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>{{ order.delivery.method === 'pickup' ? 'Picked Up' : 'Delivered' }}</strong></p>
                            <p class="text-muted mb-0 small" v-if="order.statusUpdates && order.statusUpdates.delivered">
                              {{ formatDateTime(order.statusUpdates.delivered) }}
                            </p>
                          </div>
                        </div>
                        
                        <div class="timeline-item cancelled" v-if="order.status === 'cancelled'">
                          <div class="timeline-icon">
                            <i class="fas fa-times-circle"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="mb-0"><strong>Cancelled</strong></p>
                            <p class="text-muted mb-0 small" v-if="order.statusUpdates && order.statusUpdates.cancelled">
                              {{ formatDateTime(order.statusUpdates.cancelled) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Payment Information -->
              <div class="mt-4">
                <h6 class="mb-3">Payment Information</h6>
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <p class="mb-1">
                          <strong>Payment Method:</strong> 
                          {{ order.payment.method === 'card' ? 'Credit/Debit Card' :
                             order.payment.method === 'online' ? 'Online Payment' : 'Cash on Delivery' }}
                        </p>
                        <p v-if="order.payment.method === 'card'" class="mb-0">
                          <i class="fab" :class="getCardIcon(order.payment.cardBrand || 'visa')"></i>
                          **** **** **** {{ order.payment.lastFour || '1234' }}
                        </p>
                        <p v-else-if="order.payment.method === 'online'" class="mb-0">
                          <i class="fab fa-paypal me-1"></i> PayPal
                        </p>
                      </div>
                      <div class="col-md-6 text-md-end">
                        <p class="mb-1"><strong>Order Total:</strong> {{ $filters.currency(order.totals.total) }}</p>
                        <p class="mb-0 text-success" v-if="order.status !== 'cancelled'">
                          <i class="fas fa-check-circle"></i> 
                          {{ order.payment.method === 'cash' ? 'To be paid on delivery' : 'Payment successful' }}
                        </p>
                        <p class="mb-0 text-danger" v-else>
                          <i class="fas fa-times-circle"></i> Order cancelled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Order Actions -->
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button v-if="order.status !== 'cancelled' && order.status !== 'delivered'" 
                        class="btn btn-danger" @click="cancelOrder(order.id)">
                  <i class="fas fa-ban me-1"></i> Cancel Order
                </button>
                <button v-if="order.status === 'delivered'" 
                        class="btn btn-outline" @click="rateOrder(order)">
                  <i class="fas fa-star me-1"></i> Leave Review
                </button>
                <button class="btn btn-primary" @click="reorderItems(order)">
                  <i class="fas fa-sync me-1"></i> Order Again
                </button>
              </div>
            </div>
            
            <div class="card-footer bg-white d-flex justify-content-between" v-if="!expandedOrders.includes(order.id)">
              <div>
                <span class="text-muted">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }} | Total: </span>
                <span class="fw-bold">{{ $filters.currency(order.totals.total) }}</span>
                <span class="badge ms-2" :class="getDeliveryBadgeClass(order.delivery.method)">
                  {{ getDeliveryMethodText(order.delivery.method) }}
                </span>
              </div>
              <button class="btn btn-sm btn-outline" @click="toggleOrderDetails(order.id)">
                View Details <i class="fas fa-chevron-down ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Rate Order Modal -->
      <div class="modal fade" id="rateOrderModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Rate Your Order</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="ratedOrder">
              <form @submit.prevent="submitRating">
                <!-- Overall Rating -->
                <div class="mb-4">
                  <label class="form-label">Overall Rating</label>
                  <div class="rating-stars">
                    <template v-for="n in 5" :key="n">
                      <input type="radio" :id="'star' + n" name="rating" :value="n" v-model="rating.overall">
                      <label :for="'star' + n" :title="n + ' stars'">
                        <i class="fas fa-star"></i>
                      </label>
                    </template>
                  </div>
                </div>
                
                <!-- Food Quality Rating -->
                <div class="mb-4">
                  <label class="form-label">Food Quality</label>
                  <div class="d-flex align-items-center">
                    <div class="rating-small me-2">
                      <template v-for="n in 5" :key="n">
                        <input type="radio" :id="'quality' + n" name="quality" :value="n" v-model="rating.foodQuality">
                        <label :for="'quality' + n" :title="n + ' stars'">
                          <i class="fas fa-star"></i>
                        </label>
                      </template>
                    </div>
                  </div>
                </div>
                
                <!-- Delivery Rating (if applicable) -->
                <div class="mb-4" v-if="ratedOrder.delivery.method !== 'pickup'">
                  <label class="form-label">Delivery Speed</label>
                  <div class="d-flex align-items-center">
                    <div class="rating-small me-2">
                      <template v-for="n in 5" :key="n">
                        <input type="radio" :id="'delivery' + n" name="delivery" :value="n" v-model="rating.deliverySpeed">
                        <label :for="'delivery' + n" :title="n + ' stars'">
                          <i class="fas fa-star"></i>
                        </label>
                      </template>
                    </div>
                  </div>
                </div>
                
                <!-- Review Comment -->
                <div class="mb-3">
                  <label for="reviewComment" class="form-label">Your Review</label>
                  <textarea 
                    class="form-control" 
                    id="reviewComment" 
                    v-model="rating.comment"
                    rows="3"
                    placeholder="Share your experience with this order..."
                  ></textarea>
                </div>
                
                <!-- Individual Food Items Rating -->
                <div class="mb-3">
                  <label class="form-label">Rate Individual Items</label>
                  <div v-for="(item, index) in ratedOrder.items" :key="index" class="card mb-2">
                    <div class="card-body p-3">
                      <div class="d-flex align-items-center">
                        <img :src="item.image" :alt="item.name" class="img-thumbnail me-3" style="max-height: 50px; max-width: 50px;">
                        <div class="flex-grow-1">
                          <h6 class="mb-0">{{ item.name }}</h6>
                        </div>
                        <div class="rating-small">
                          <template v-for="n in 5" :key="n">
                            <input 
                              type="radio" 
                              :id="'item' + index + 'star' + n" 
                              :name="'item' + index" 
                              :value="n" 
                              v-model="rating.items[index].rating"
                            >
                            <label :for="'item' + index + 'star' + n" :title="n + ' stars'">
                              <i class="fas fa-star"></i>
                            </label>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                </div>
              </form>
            </div>
            <div class="modal-body" v-else>
              <p>Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cancel Order Confirmation Modal -->
      <div class="modal fade" id="cancelOrderModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cancel Order</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div class="alert alert-warning" v-if="orderToCancel && !canCancelOrder(orderToCancel)">
                <i class="fas fa-exclamation-triangle me-2"></i>
                This order is already being prepared. A cancellation fee may apply.
              </div>
              <div class="mb-3">
                <label for="cancelReason" class="form-label">Reason for cancellation (optional)</label>
                <select class="form-select" id="cancelReason" v-model="cancelReason">
                  <option value="">Select a reason...</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="ordered_wrong_items">Ordered wrong items</option>
                  <option value="delivery_too_long">Estimated delivery time too long</option>
                  <option value="duplicate_order">Duplicate order</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
              <div class="mb-3" v-if="cancelReason === 'other'">
                <label for="otherCancelReason" class="form-label">Please specify</label>
                <textarea class="form-control" id="otherCancelReason" v-model="otherCancelReason" rows="2"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-bs-dismiss="modal">Keep Order</button>
              <button type="button" class="btn btn-danger" @click="confirmCancelOrder">
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      orders: [],
      expandedOrders: [],
      ratedOrder: null,
      orderToCancel: null,
      searchQuery: '',
      statusFilter: '',
      deliveryTypeFilter: '',
      showFilterMenu: false,
      dateFilter: {
        start: '',
        end: ''
      },
      priceFilter: {
        min: null,
        max: null
      },
      filteredOrders: [],
      rating: {
        overall: 5,
        foodQuality: 5,
        deliverySpeed: 5,
        comment: '',
        items: []
      },
      cancelReason: '',
      otherCancelReason: ''
    };
  },
  computed: {
    anyFiltersActive() {
      return this.statusFilter || 
             this.deliveryTypeFilter || 
             this.dateFilter.start || 
             this.dateFilter.end ||
             this.priceFilter.min !== null ||
             this.priceFilter.max !== null;
    }
  },
  created() {
    this.loadOrders();
  },
  mounted() {
    // Apply custom styles for timeline and rating
    const style = document.createElement('style');
    style.textContent = `
      .order-timeline {
        position: relative;
        padding-left: 30px;
      }
      .timeline-item {
        position: relative;
        padding-bottom: 20px;
        opacity: 0.6;
      }
      .timeline-item.completed {
        opacity: 1;
      }
      .timeline-item:not(:last-child):before {
        content: '';
        position: absolute;
        left: -21px;
        top: 10px;
        height: calc(100% - 5px);
        width: 2px;
        background-color: #dee2e6;
      }
      .timeline-item.completed:not(:last-child):before {
        background-color: #28a745;
      }
      .timeline-icon {
        position: absolute;
        left: -30px;
        top: 0;
        width: 20px;
        height: 20px;
        text-align: center;
        background-color: white;
      }
      .timeline-item.completed .timeline-icon i {
        color: #28a745;
      }
      .timeline-item.cancelled .timeline-icon i {
        color: #dc3545;
      }
      .timeline-content {
        margin-bottom: 5px;
      }
      
      /* Rating stars */
      .rating-stars {
        display: inline-flex;
        flex-direction: row-reverse;
        font-size: 1.5rem;
      }
      .rating-small {
        display: inline-flex;
        flex-direction: row-reverse;
        font-size: 1rem;
      }
      .rating-stars input, .rating-small input {
        display: none;
      }
      .rating-stars label, .rating-small label {
        color: #ddd;
        cursor: pointer;
        padding: 0 0.1em;
      }
      .rating-stars label:hover, .rating-stars label:hover ~ label,
      .rating-stars input:checked ~ label {
        color: #f8ce0b;
      }
      .rating-small label:hover, .rating-small label:hover ~ label,
      .rating-small input:checked ~ label {
        color: #f8ce0b;
      }
    `;
    document.head.appendChild(style);
  },
  methods: {
    loadOrders() {
      // Get orders from CartService
      const currentUser = window.AuthService.getCurrentUser();
      if (currentUser && currentUser.id) {
        let orders = window.CartService.getUserOrders(currentUser.id);
        
        // Normalize order data to ensure all required fields exist
        this.orders = orders.map(order => this.normalizeOrder(order));
      } else {
        this.orders = [];
        console.warn('User not logged in or missing user ID');
      }
      this.filterOrders();
    },
    
    // New method to ensure all orders have the required structure
    normalizeOrder(order) {
      // Create a copy to avoid modifying the original
      const normalizedOrder = { ...order };
      
      // Ensure order has the required properties
      normalizedOrder.totals = normalizedOrder.totals || { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };
      normalizedOrder.items = normalizedOrder.items || [];
      normalizedOrder.status = normalizedOrder.status || 'pending';
      normalizedOrder.orderTime = normalizedOrder.orderTime || order.orderDate || new Date().toISOString();
      
      // Ensure order has delivery info
      normalizedOrder.delivery = normalizedOrder.delivery || {
        method: order.serviceMethod || 'delivery',
        details: {}
      };
      
      // Convert older format orders to new format
      if (!normalizedOrder.delivery.method && normalizedOrder.serviceMethod) {
        normalizedOrder.delivery = {
          method: normalizedOrder.serviceMethod,
          details: {
            line1: normalizedOrder.deliveryAddress || '',
            notes: normalizedOrder.specialRequests || ''
          }
        };
      }
      
      return normalizedOrder;
    },
    
    filterOrders() {
      let filtered = [...this.orders];
      
      // Apply status filter if selected
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      // Apply delivery type filter if selected
      if (this.deliveryTypeFilter) {
        filtered = filtered.filter(order => order.delivery.method === this.deliveryTypeFilter);
      }
      
      // Apply date range filter
      if (this.dateFilter.start) {
        const startDate = new Date(this.dateFilter.start);
        filtered = filtered.filter(order => new Date(order.orderTime) >= startDate);
      }
      
      if (this.dateFilter.end) {
        const endDate = new Date(this.dateFilter.end);
        // Set time to end of day
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(order => new Date(order.orderTime) <= endDate);
      }
      
      // Apply price filter
      if (this.priceFilter.min !== null) {
        filtered = filtered.filter(order => order.totals.total >= this.priceFilter.min);
      }
      
      if (this.priceFilter.max !== null) {
        filtered = filtered.filter(order => order.totals.total <= this.priceFilter.max);
      }
      
      // Apply search query if entered
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order => {
          // Search by order ID
          if (order.id.toString().includes(query)) return true;
          
          // Search by food item names
          if (order.items.some(item => item.name.toLowerCase().includes(query))) return true;
          
          // Search by delivery address if it exists
          if (order.delivery.method !== 'pickup' && 
              order.delivery.details.line1 && 
              order.delivery.details.line1.toLowerCase().includes(query)) return true;
          
          return false;
        });
      }
      
      // Sort by order date (newest first)
      filtered.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
      
      this.filteredOrders = filtered;
    },
    
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
    },
    
    clearFilters() {
      this.statusFilter = '';
      this.deliveryTypeFilter = '';
      this.dateFilter.start = '';
      this.dateFilter.end = '';
      this.priceFilter.min = null;
      this.priceFilter.max = null;
      this.searchQuery = '';
      this.filterOrders();
    },
    
    toggleOrderDetails(orderId) {
      if (this.expandedOrders.includes(orderId)) {
        this.expandedOrders = this.expandedOrders.filter(id => id !== orderId);
      } else {
        this.expandedOrders.push(orderId);
      }
    },
    
    rateOrder(order) {
      this.ratedOrder = JSON.parse(JSON.stringify(order)); // Deep copy
      
      // Initialize rating for each item
      this.rating = {
        overall: 5,
        foodQuality: 5,
        deliverySpeed: order.delivery.method !== 'pickup' ? 5 : 0,
        comment: '',
        items: order.items.map(() => ({ rating: 5, comment: '' }))
      };
      
      // Open modal
      new bootstrap.Modal(document.getElementById('rateOrderModal')).show();
    },
    
    submitRating() {
      // Prepare review data
      const reviewData = {
        orderId: this.ratedOrder.id,
        userId: this.ratedOrder.userId,
        ratings: {
          overall: this.rating.overall,
          foodQuality: this.rating.foodQuality,
          deliverySpeed: this.rating.deliverySpeed
        },
        comment: this.rating.comment,
        itemRatings: this.ratedOrder.items.map((item, index) => ({
          foodItemId: item.id,
          name: item.name,
          rating: this.rating.items[index].rating,
          comment: this.rating.items[index].comment || ''
        })),
        reviewDate: new Date().toISOString()
      };
      
      // Save the review
      try {
        // Call DatabaseService to save the review
        window.DatabaseService.addReview(reviewData)
          .then(() => {
            // Close modal
            const modalElement = document.getElementById('rateOrderModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            
            // Show success message
            alert('Thank you for your review!');
          })
          .catch(error => {
            console.error('Error saving review:', error);
            alert('There was an error saving your review. Please try again.');
          });
      } catch (error) {
        console.error('Error in review submission:', error);
        
        // Fallback to localStorage if the database service fails
        const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        existingReviews.push(reviewData);
        localStorage.setItem('reviews', JSON.stringify(existingReviews));
        
        // Close modal
        const modalElement = document.getElementById('rateOrderModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Show success message
        alert('Thank you for your review!');
      }
    },
    
    cancelOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) return;
      
      this.orderToCancel = order;
      this.cancelReason = '';
      this.otherCancelReason = '';
      
      // Open modal
      new bootstrap.Modal(document.getElementById('cancelOrderModal')).show();
    },
    
    confirmCancelOrder() {
      if (!this.orderToCancel) return;
      
      // Get cancel reason
      const reason = this.cancelReason === 'other' ? this.otherCancelReason : this.cancelReason;
      
      // Update order status
      try {
        // First try using DatabaseService
        window.DatabaseService.updateOrderStatus(this.orderToCancel.id, 'cancelled')
          .then(() => {
            // Update the order in local copy
            const orderIndex = this.orders.findIndex(o => o.id === this.orderToCancel.id);
            if (orderIndex >= 0) {
              this.orders[orderIndex].status = 'cancelled';
              this.orders[orderIndex].statusUpdates = {
                ...(this.orders[orderIndex].statusUpdates || {}),
                cancelled: new Date().toISOString()
              };
              this.orders[orderIndex].cancellationReason = reason;
              
              // Update orders in localStorage
              window.CartService.updateUserOrder(this.orders[orderIndex]);
            }
            
            // Close modal
            const modalElement = document.getElementById('cancelOrderModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            
            // Show success message
            alert('Your order has been cancelled.');
            
            // Reset
            this.orderToCancel = null;
            this.cancelReason = '';
            this.otherCancelReason = '';
            
            // Refresh filtered orders
            this.filterOrders();
          })
          .catch(error => {
            console.error('Error cancelling order with DatabaseService:', error);
            this.fallbackCancelOrder(reason);
          });
      } catch (error) {
        console.error('Error cancelling order:', error);
        this.fallbackCancelOrder(reason);
      }
    },
    
    fallbackCancelOrder(reason) {
      // Fallback to localStorage if the database service fails
      const orderIndex = this.orders.findIndex(o => o.id === this.orderToCancel.id);
      if (orderIndex >= 0) {
        this.orders[orderIndex].status = 'cancelled';
        this.orders[orderIndex].statusUpdates = {
          ...(this.orders[orderIndex].statusUpdates || {}),
          cancelled: new Date().toISOString()
        };
        this.orders[orderIndex].cancellationReason = reason;
        
        // Update orders in localStorage
        localStorage.setItem('orders', JSON.stringify(this.orders));
        
        // Close modal
        const modalElement = document.getElementById('cancelOrderModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Show success message
        alert('Your order has been cancelled.');
        
        // Reset
        this.orderToCancel = null;
        this.cancelReason = '';
        this.otherCancelReason = '';
        
        // Refresh filtered orders
        this.filterOrders();
      }
    },
    
    reorderItems(order) {
      // First clear the cart
      window.CartService.clearCart();
      
      // Add all items from the order to the cart
      order.items.forEach(item => {
        window.CartService.addToCart({
          id: item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || ''
        });
      });
      
      // Redirect to cart page
      this.$router.push('/cart');
      
      // Show success message
      alert('Items have been added to your cart!');
    },
    
    getStatusBadgeClass(status) {
      switch (status) {
        case 'pending': return 'bg-secondary';
        case 'preparing': return 'bg-warning text-dark';
        case 'ready': return 'bg-info';
        case 'out-for-delivery': return 'bg-primary';
        case 'delivered': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
      }
    },
    
    getDeliveryBadgeClass(method) {
      switch (method) {
        case 'delivery': return 'bg-info text-dark';
        case 'express': return 'bg-primary';
        case 'pickup': return 'bg-success';
        default: return 'bg-secondary';
      }
    },
    
    getStatusDisplayText(status) {
      switch (status) {
        case 'pending': return 'Pending';
        case 'preparing': return 'Preparing';
        case 'ready': return 'Ready for Pickup';
        case 'out-for-delivery': return 'Out for Delivery';
        case 'delivered': return 'Delivered';
        case 'cancelled': return 'Cancelled';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
      }
    },
    
    getDeliveryMethodText(method) {
      switch (method) {
        case 'delivery': return 'Standard Delivery';
        case 'express': return 'Express Delivery';
        case 'pickup': return 'Self Pickup';
        default: return method;
      }
    },
    
    getDeliveryLabel(order) {
      const method = order.delivery?.method || order.serviceMethod;
      return method === 'pickup' ? 'Pickup Fee' : 'Delivery Fee';
    },
    
    isStatusReached(currentStatus, checkStatus) {
      const statusOrder = ['pending', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
      
      if (currentStatus === 'cancelled') {
        return false;
      }
      
      const currentIndex = statusOrder.indexOf(currentStatus);
      const checkIndex = statusOrder.indexOf(checkStatus);
      
      return currentIndex >= checkIndex;
    },
    
    canCancelOrder(order) {
      // Can only cancel if status is pending or just moved to preparing
      return ['pending', 'preparing'].includes(order.status);
    },
    
    formatDateTime(dateTimeString) {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getCardIcon(brand) {
      switch (brand.toLowerCase()) {
        case 'visa': return 'fa-cc-visa';
        case 'mastercard': return 'fa-cc-mastercard';
        case 'amex': return 'fa-cc-amex';
        case 'discover': return 'fa-cc-discover';
        default: return 'fa-credit-card';
      }
    }
  }
};

// Make the component globally available
window.PurchasesPage = PurchasesPage;