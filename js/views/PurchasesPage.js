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
              <div>                <h5 class="mb-0">Order #{{ order.id.toString().slice(-8) }}</h5>
                <p class="text-muted mb-0 small">
                  {{ formatRelativeTime(new Date(order.orderTime)) }}
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
            <div class="card-body" v-if="expandedOrders.includes(order.id)">              <!-- Enhanced Order Items Table with Accessibility -->
              <h6 class="mb-3">Food Items</h6>
              <div class="table-responsive d-none d-md-block">
                <table 
                  class="table table-bordered"
                  v-accessible-table="{ 
                    caption: 'Order items for Order #' + order.id.toString().slice(-8),
                    sortable: true,
                    filterable: false,
                    rowHeaders: true
                  }"
                >
                  <caption class="sr-only">
                    Order items for Order #{{ order.id.toString().slice(-8) }} - {{ pluralize(order.items.length, 'item') }}
                  </caption>
                  <thead class="table-light">
                    <tr>
                      <th scope="col" width="80">Image</th>
                      <th scope="col">Item</th>
                      <th scope="col" width="100">Price</th>
                      <th scope="col" width="80">Quantity</th>
                      <th scope="col" width="100">Total</th>
                    </tr>
                  </thead>
                  <tbody>                    <tr v-for="item in order.items" :key="item.id">
                      <td>
                        <div class="product-thumbnail-container">
                          <img 
                            :src="item.image" 
                            :alt="item.name + ' - Order item'"
                            class="product-thumbnail"
                            v-accessible-image="{ 
                              src: item.image, 
                              alt: item.name + ' - Order item',
                              fallback: '/images/placeholder-food.jpg'
                            }"
                          >
                        </div>
                      </td>
                      <td>
                        <strong>{{ item.name }}</strong>
                        <div v-if="item.specialInstructions" class="small text-muted">
                          <i class="fas fa-info-circle"></i> {{ item.specialInstructions }}
                        </div>
                      </td>                      <td>{{ formatCurrency(item.price) }}</td>
                      <td class="text-center">{{ formatNumber(item.quantity) }}</td>
                      <td>{{ formatCurrency(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
                      <td>{{ formatCurrency(order.totals.subtotal) }}</td>
                    </tr>
                    <tr v-if="order.bulkDiscount">
                      <td colspan="4" class="text-end text-success"><strong>Bulk Order Discount:</strong></td>
                      <td class="text-success">-{{ formatCurrency(order.bulkDiscount.amount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>{{ getDeliveryLabel(order) }}:</strong></td>
                      <td>
                        <span v-if="order.totals.deliveryFee > 0">{{ formatCurrency(order.totals.deliveryFee) }}</span>
                        <span v-else class="text-success">FREE</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Tax:</strong></td>
                      <td>{{ formatCurrency(order.totals.tax) }}</td>
                    </tr>
                    <tr v-if="order.promoCode">
                      <td colspan="4" class="text-end text-success"><strong>Promo ({{ order.promoCode.code }}):</strong></td>
                      <td class="text-success">
                        <span v-if="order.promoCode.type === 'percentage'">-{{ order.promoCode.value }}%</span>
                        <span v-else-if="order.promoCode.type === 'fixed'">-{{ $currency(order.promoCode.value) }}</span>
                        <span v-else>Free Delivery</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total:</strong></td>
                      <td><strong>{{ $currency(order.totals.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Mobile view for items -->
              <div class="d-md-none">                <div v-for="item in order.items" :key="item.id" class="card mb-2">
                  <div class="card-body p-3">
                    <div class="d-flex">
                      <div class="product-thumbnail-container me-3">
                        <img :src="item.image" :alt="item.name" class="product-thumbnail">
                      </div>
                      <div class="flex-grow-1">
                        <h6 class="mb-1">{{ item.name }}</h6>
                        <div v-if="item.specialInstructions" class="small text-muted mb-2">
                          <i class="fas fa-info-circle"></i> {{ item.specialInstructions }}
                        </div>
                        <div class="d-flex justify-content-between">                          <div class="text-muted">{{ item.quantity }} × {{ $currency(item.price) }}</div>
                          <div class="fw-bold">{{ $currency(item.price * item.quantity) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-body p-3">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{{ $currency(order.totals.subtotal) }}</span>
                    </div>
                    <div v-if="order.bulkDiscount" class="d-flex justify-content-between mb-2 text-success">
                      <span>Bulk Order Discount:</span>
                      <span>-{{ $currency(order.bulkDiscount.amount) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>{{ getDeliveryLabel(order) }}:</span>
                      <span v-if="order.totals.deliveryFee > 0">{{ $currency(order.totals.deliveryFee) }}</span>
                      <span v-else class="text-success">FREE</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>{{ $currency(order.totals.tax) }}</span>
                    </div>
                    <div v-if="order.promoCode" class="d-flex justify-content-between mb-2 text-success">
                      <span>Promo ({{ order.promoCode.code }}):</span>
                      <span>-{{ $currency(order.promoDiscount) }}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>{{ $currency(order.totals.total) }}</span>
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
                        <p class="mb-1"><strong>Order Total:</strong> {{ $currency(order.totals.total) }}</p>
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
                <span class="fw-bold">{{ $currency(order.totals.total) }}</span>
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
      </div>      <!-- Cancel Order Confirmation Modal -->
      <div class="modal fade" id="cancelOrderModal" tabindex="-1" aria-labelledby="cancelOrderModalLabel">
        <div class="modal-dialog">
          <div class="modal-content">            <div class="modal-header">
              <h5 class="modal-title" id="cancelOrderModalLabel">Cancel Order</h5>
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
      // === APP CONSTANTS INTEGRATION ===
      config: {
        // Get configuration from global constants with fallbacks
        pagination: window.APP_CONSTANTS?.PAGINATION || {
          ordersPerPage: 10,
          maxVisiblePages: 5,
        },
        orders: window.APP_CONSTANTS?.ORDERS || {
          maxCancelTime: 300000, // 5 minutes
          ratingDeadline: 604800000, // 7 days
        },
        validation: window.APP_CONSTANTS?.VALIDATION || {
          searchMinLength: 2,
          maxCommentLength: 500,
          debounceDelay: 300,
        },
        ui: window.APP_CONSTANTS?.UI || {
          animationDuration: 300,
          toastDuration: 3000,
          loadingTimeout: 10000,
        },
      },

      // === COMPONENT STATE MANAGEMENT ===
      componentState: {
        isInitialized: false,
        isLoading: false,
        hasError: false,
        errorMessage: "",
        performanceMetrics: {
          loadStartTime: null,
          loadEndTime: null,
          renderTime: null,
          filterTime: null,
        },
        debugMode: window.APP_CONSTANTS?.DEBUG_MODE || false,
        retryCount: 0,
        maxRetries: 3,
      },

      // === ORDER DATA AND MANAGEMENT ===
      orders: [],
      filteredOrders: [],
      expandedOrders: [],
      orderCache: new Map(), // Cache for order details
      totalOrdersCount: 0,

      // === CURRENT OPERATIONS ===
      ratedOrder: null,
      orderToCancel: null,
      selectedOrderForDetails: null,

      // === FILTERING AND SEARCH ===
      searchQuery: "",
      searchHistory: [],
      statusFilter: "",
      deliveryTypeFilter: "",
      showFilterMenu: false,
      dateFilter: {
        start: "",
        end: "",
      },
      priceFilter: {
        min: null,
        max: null,
      },
      advancedFilters: {
        paymentMethod: "",
        hasPromoCode: false,
        ratingRange: { min: 1, max: 5 },
        itemCount: { min: null, max: null },
      },
      sortOptions: {
        field: "orderTime",
        direction: "desc",
        available: [
          { value: "orderTime", label: "Order Date" },
          { value: "total", label: "Total Amount" },
          { value: "status", label: "Status" },
          { value: "itemCount", label: "Item Count" },
        ],
      },

      // === PAGINATION ===
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
        showingFrom: 0,
        showingTo: 0,
      },

      // === RATING AND FEEDBACK ===
      rating: {
        overall: 5,
        foodQuality: 5,
        deliverySpeed: 5,
        comment: "",
        items: [],
        isSubmitting: false,
        hasSubmitted: false,
      },
      ratingValidation: {
        errors: {},
        isValid: true,
        touchedFields: new Set(),
      },

      // === ORDER CANCELLATION ===
      cancelReason: "",
      otherCancelReason: "",
      cancellationPolicy: {
        freeWindow: 300000, // 5 minutes
        partialRefundWindow: 1800000, // 30 minutes
        noRefundAfter: 3600000, // 1 hour
      },

      // === UI STATE MANAGEMENT ===
      ui: {
        isLoading: false,
        loadingStates: {
          orders: false,
          filtering: false,
          rating: false,
          cancellation: false,
        },
        modals: {
          rating: null,
          cancellation: null,
          orderDetails: null,
        },
        notifications: [],
        errorStates: new Set(),
        isMobile: false,
        screenSize: "desktop",
        orientation: "landscape",
      },

      // === PERFORMANCE TRACKING ===
      performance: {
        componentMountTime: null,
        initialLoadTime: null,
        filterPerformance: [],
        searchPerformance: [],
        renderTimes: [],
        memoryUsage: null,
        cacheHitRate: 0,
        apiResponseTimes: [],
      },

      // === VALIDATION STATES ===
      validation: {
        searchQuery: { isValid: true, errors: [] },
        dateRange: { isValid: true, errors: [] },
        priceRange: { isValid: true, errors: [] },
        rating: { isValid: true, errors: [] },
        cancelReason: { isValid: true, errors: [] },
      }, // === DEBOUNCED METHODS (will be initialized in created) ===
      debouncedSearch: null,
      debouncedFilter: null,
      debouncedValidation: null,
    };
  },
  computed: {
    // === ENHANCED FILTER DETECTION ===
    anyFiltersActive() {
      return (
        this.statusFilter ||
        this.deliveryTypeFilter ||
        this.dateFilter.start ||
        this.dateFilter.end ||
        this.priceFilter.min !== null ||
        this.priceFilter.max !== null ||
        this.advancedFilters.paymentMethod ||
        this.advancedFilters.hasPromoCode ||
        this.searchQuery.trim().length > 0
      );
    },

    // === COMPREHENSIVE ORDER STATISTICS ===
    orderStatistics() {
      try {
        const stats = {
          total: this.orders.length,
          delivered: this.orders.filter((o) => o.status === "delivered").length,
          pending: this.orders.filter((o) =>
            ["pending", "preparing", "ready", "out-for-delivery"].includes(
              o.status
            )
          ).length,
          cancelled: this.orders.filter((o) => o.status === "cancelled").length,
          totalSpent: this.orders.reduce(
            (sum, order) => sum + (order.totals?.total || 0),
            0
          ),
          averageOrderValue: 0,
          favoriteItems: this.calculateFavoriteItems(),
          orderFrequency: this.calculateOrderFrequency(),
          satisfactionRating: this.calculateAverageSatisfaction(),
        };

        stats.averageOrderValue =
          stats.total > 0 ? stats.totalSpent / stats.total : 0;

        return stats;
      } catch (error) {
        this.handleError("Error calculating order statistics", error);
        return {
          total: 0,
          delivered: 0,
          pending: 0,
          cancelled: 0,
          totalSpent: 0,
          averageOrderValue: 0,
        };
      }
    },

    // === ENHANCED PAGINATION METADATA ===
    paginationInfo() {
      const totalItems = this.filteredOrders.length;
      const totalPages = Math.ceil(totalItems / this.pagination.itemsPerPage);
      const currentPage = Math.min(
        this.pagination.currentPage,
        totalPages || 1
      );
      const startIndex = (currentPage - 1) * this.pagination.itemsPerPage;
      const endIndex = Math.min(
        startIndex + this.pagination.itemsPerPage,
        totalItems
      );

      return {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: this.pagination.itemsPerPage,
        startIndex,
        endIndex,
        showingFrom: totalItems > 0 ? startIndex + 1 : 0,
        showingTo: endIndex,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        pageNumbers: this.generatePageNumbers(currentPage, totalPages),
        isEmpty: totalItems === 0,
      };
    },

    // === PAGINATED ORDERS ===
    paginatedOrders() {
      const { startIndex, endIndex } = this.paginationInfo;
      return this.filteredOrders.slice(startIndex, endIndex);
    },

    // === ADVANCED FILTER SUMMARY ===
    activeFilterSummary() {
      const filters = [];

      if (this.statusFilter)
        filters.push(`Status: ${this.getStatusDisplayText(this.statusFilter)}`);
      if (this.deliveryTypeFilter)
        filters.push(
          `Type: ${this.getDeliveryMethodText(this.deliveryTypeFilter)}`
        );
      if (this.dateFilter.start)
        filters.push(`From: ${this.formatDate(this.dateFilter.start)}`);
      if (this.dateFilter.end)
        filters.push(`To: ${this.formatDate(this.dateFilter.end)}`);
      if (this.priceFilter.min !== null)
        filters.push(`Min: ${this.formatCurrency(this.priceFilter.min)}`);
      if (this.priceFilter.max !== null)
        filters.push(`Max: ${this.formatCurrency(this.priceFilter.max)}`);
      if (this.searchQuery.trim())
        filters.push(`Search: "${this.searchQuery.trim()}"`);

      return filters;
    },

    // === VALIDATION STATES ===
    formValidationStates() {
      return {
        searchValid: this.validation.searchQuery.isValid,
        dateRangeValid: this.validation.dateRange.isValid,
        priceRangeValid: this.validation.priceRange.isValid,
        ratingValid: this.validation.rating.isValid,
        cancelReasonValid: this.validation.cancelReason.isValid,
        allValid: Object.values(this.validation).every((v) => v.isValid),
      };
    },

    // === COMPONENT READINESS ===
    isComponentReady() {
      return (
        this.componentState.isInitialized &&
        !this.componentState.isLoading &&
        !this.componentState.hasError
      );
    },

    // === UI HELPERS ===
    shouldShowLoadingState() {
      return this.ui.isLoading || this.componentState.isLoading;
    },

    shouldShowEmptyState() {
      return this.isComponentReady && this.orders.length === 0;
    },

    shouldShowNoResultsState() {
      return (
        this.isComponentReady &&
        this.orders.length > 0 &&
        this.filteredOrders.length === 0
      );
    },

    // === MOBILE DETECTION ===
    isMobileView() {
      return this.ui.isMobile || this.ui.screenSize === "mobile";
    },

    // === ORDER ACTIONS AVAILABILITY ===
    orderActions() {
      return {
        canReorder: (order) => order.status === "delivered",
        canCancel: (order) => this.canCancelOrder(order),
        canRate: (order) => order.status === "delivered" && !order.hasRated,
        canTrack: (order) =>
          ["preparing", "ready", "out-for-delivery"].includes(order.status),
      };
    },
  },
  watch: {
    // === ENHANCED SEARCH QUERY WATCHER ===
    searchQuery: {
      handler(newQuery, oldQuery) {
        // Validate search query
        this.validateSearchQuery(newQuery);

        // Debounced filtering
        if (this.debouncedSearch) {
          this.debouncedSearch();
        }
      },
      immediate: false,
    }, // === FILTER WATCHERS ===
    statusFilter: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.filterOrders();
        }
      },
    },

    deliveryTypeFilter: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.filterOrders();
        }
      },
    },

    "dateFilter.start": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.validateDateRange();
          this.filterOrders();
        }
      },
    },

    "dateFilter.end": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.validateDateRange();
          this.filterOrders();
        }
      },
    },

    "priceFilter.min": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.validatePriceRange();
          this.filterOrders();
        }
      },
    },

    "priceFilter.max": {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.validatePriceRange();
          this.filterOrders();
        }
      },
    }, // === PAGINATION WATCHER ===
    "pagination.currentPage": {
      handler(newPage, oldPage) {
        if (newPage !== oldPage) {
          this.scrollToTop();
        }
      },
    },

    // === COMPONENT STATE MONITORING ===
    "componentState.hasError": {
      handler(hasError) {
        if (hasError) {
          this.showErrorNotification(this.componentState.errorMessage);
        }
      },
    },

    // === ORDER DATA WATCHER ===
    orders: {
      handler(newOrders, oldOrders) {
        if (newOrders.length !== oldOrders.length) {
          this.filterOrders();

          // Cache management
          this.updateOrderCache(newOrders);
        }
      },
      deep: true,
    },

    // === FILTERED ORDERS WATCHER ===
    filteredOrders: {
      handler(newFiltered) {
        // Update pagination
        this.updatePaginationMetadata(newFiltered.length);
      },
    },

    // === UI STATE WATCHERS ===
    "ui.isMobile": {
      handler(isMobile) {
        this.adjustUIForDevice(isMobile);
      },
    },

    // === RATING VALIDATION WATCHER ===
    "rating.comment": {
      handler(newComment) {
        this.validateRatingComment(newComment);
      },
    },
    "rating.overall": {
      handler(newRating) {
        this.validateRatingValue(newRating, "overall");
      },
    },
  },

  // === ENHANCED LIFECYCLE HOOKS ===
  created() {
    // Performance tracking
    this.componentState.performanceMetrics.loadStartTime = Date.now();

    // Initialize debounced methods
    this.initializeDebouncedMethods(); // Initialize component
    this.initializeComponent();

    // Load orders
    this.loadOrders();
  },
  mounted() {
    // Performance tracking
    this.componentState.performanceMetrics.renderTime =
      Date.now() - this.componentState.performanceMetrics.loadStartTime;
    this.performance.componentMountTime = Date.now();

    // Apply custom styles for timeline and rating
    this.applyCustomStyles(); // Setup event listeners
    this.setupEventListeners();

    // Initialize UI state
    this.initializeUIState();

    // Mark component as initialized
    this.componentState.isInitialized = true;
    this.componentState.performanceMetrics.loadEndTime = Date.now();

    // Debug logging
    if (this.componentState.debugMode) {
      console.log("PurchasesPage mounted", {
        renderTime: this.componentState.performanceMetrics.renderTime,
        ordersCount: this.orders.length,
        performance: this.performance,
      });
    }
  },

  beforeUnmount() {
    // Cleanup event listeners    this.cleanupEventListeners();

    // Debug logging
    if (this.componentState.debugMode) {
      console.log("PurchasesPage unmounted");
    }
  },

  methods: {
    // === INITIALIZATION METHODS ===
    initializeDebouncedMethods() {
      // Create debounced methods using lodash debounce or custom implementation
      this.debouncedSearch = this.debounce(() => {
        this.filterOrders();
      }, this.config.validation.debounceDelay);

      this.debouncedFilter = this.debounce(() => {
        this.filterOrders();
      }, this.config.validation.debounceDelay);

      this.debouncedValidation = this.debounce((field, value) => {
        this.validateField(field, value);
      }, this.config.validation.debounceDelay);
    },

    initializeComponent() {
      // Initialize performance tracking
      this.performance.initialLoadTime = Date.now();

      // Set initial UI state
      this.ui.isLoading = true;
      this.componentState.isLoading = true; // Initialize pagination
      this.pagination.itemsPerPage = this.config.pagination.ordersPerPage;
    },

    applyCustomStyles() {
      const style = document.createElement("style");
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
      }    `;
      document.head.appendChild(style);
    },

    setupEventListeners() {
      // Window resize handler
      this.resizeHandler = this.debounce(() => {
        this.handleWindowResize();
      }, 250);
      window.addEventListener("resize", this.resizeHandler);

      // Scroll handler for infinite scroll (if needed)
      this.scrollHandler = this.debounce(() => {
        this.handleScroll();
      }, 100);
      window.addEventListener("scroll", this.scrollHandler);

      // Visibility change handler
      this.visibilityHandler = () => {
        this.handleVisibilityChange();
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);

      // Keyboard navigation
      this.keydownHandler = (event) => {
        this.handleKeyboardNavigation(event);
      };
      document.addEventListener("keydown", this.keydownHandler);
    },

    initializeUIState() {
      this.detectMobileDevice();
      this.updateScreenSize();
      this.ui.isLoading = false;
      this.componentState.isLoading = false;
    },

    // === CLEANUP METHODS ===
    cleanupEventListeners() {
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
      }
      if (this.scrollHandler) {
        window.removeEventListener("scroll", this.scrollHandler);
      }
      if (this.visibilityHandler) {
        document.removeEventListener(
          "visibilitychange",
          this.visibilityHandler
        );
      }
      if (this.keydownHandler) {
        document.removeEventListener("keydown", this.keydownHandler);
      }
    },

    // === VALIDATION METHODS ===
    validateSearchQuery(query) {
      const errors = [];
      const minLength = this.config.validation.searchMinLength;

      if (query && query.length > 0 && query.length < minLength) {
        errors.push(`Search query must be at least ${minLength} characters`);
      }

      this.validation.searchQuery = {
        isValid: errors.length === 0,
        errors,
      };

      return this.validation.searchQuery.isValid;
    },

    validateDateRange() {
      const errors = [];
      const start = this.dateFilter.start;
      const end = this.dateFilter.end;

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate > endDate) {
          errors.push("Start date must be before end date");
        }

        if (startDate > new Date()) {
          errors.push("Start date cannot be in the future");
        }
      }

      this.validation.dateRange = {
        isValid: errors.length === 0,
        errors,
      };

      return this.validation.dateRange.isValid;
    },

    validatePriceRange() {
      const errors = [];
      const min = this.priceFilter.min;
      const max = this.priceFilter.max;

      if (min !== null && min < 0) {
        errors.push("Minimum price cannot be negative");
      }

      if (max !== null && max < 0) {
        errors.push("Maximum price cannot be negative");
      }

      if (min !== null && max !== null && min > max) {
        errors.push("Minimum price must be less than maximum price");
      }

      this.validation.priceRange = {
        isValid: errors.length === 0,
        errors,
      };

      return this.validation.priceRange.isValid;
    },

    validateRatingComment(comment) {
      const errors = [];
      const maxLength = this.config.validation.maxCommentLength;

      if (comment && comment.length > maxLength) {
        errors.push(`Comment must be less than ${maxLength} characters`);
      }

      this.validation.rating = {
        isValid: errors.length === 0,
        errors,
      };

      return this.validation.rating.isValid;
    },

    validateRatingValue(rating, field) {
      if (rating < 1 || rating > 5) {
        this.showErrorNotification(
          `${field} rating must be between 1 and 5 stars`
        );
        return false;
      }
      return true;
    },
    handleNearBottomScroll() {
      // Handle infinite scroll or pagination when near bottom
      if (this.pagination.hasNextPage && !this.componentState.loading) {
        // Load more orders if pagination allows
        this.loadMoreOrders();
      }
    },

    loadMoreOrders() {
      // Implementation for loading more orders in pagination
      try {
        if (this.pagination.hasNextPage && !this.componentState.loading) {
          this.pagination.currentPage++;
          // The watcher on currentPage will trigger data refresh
        }
      } catch (error) {
        console.error("Error loading more orders:", error);
        this.handleError(error, "Failed to load more orders");
      }
    },

    // === EVENT HANDLING METHODS ===
    handleWindowResize() {
      this.updateScreenSize();
      this.detectMobileDevice();
      this.adjustUIForDevice(this.ui.isMobile);
    },

    handleScroll() {
      // Implement infinite scroll if needed
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Near bottom of page
      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.handleNearBottomScroll();
      }
    },
    handleVisibilityChange() {
      if (!document.hidden) {
        // Auto-refresh has been removed - orders will only refresh manually
      }
    },

    handleKeyboardNavigation(event) {
      // Implement keyboard shortcuts for accessibility
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "f":
          case "F":
            event.preventDefault();
            this.focusSearchInput();
            break;
          case "r":
          case "R":
            event.preventDefault();
            this.refreshData();
            break;
        }
      }
    },

    // === UI MANAGEMENT METHODS ===
    updateScreenSize() {
      const width = window.innerWidth;
      if (width < 768) {
        this.ui.screenSize = "mobile";
      } else if (width < 992) {
        this.ui.screenSize = "tablet";
      } else {
        this.ui.screenSize = "desktop";
      }
    },

    detectMobileDevice() {
      this.ui.isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
    },

    adjustUIForDevice(isMobile) {
      if (isMobile) {
        this.pagination.itemsPerPage = Math.max(
          5,
          this.config.pagination.ordersPerPage / 2
        );
      } else {
        this.pagination.itemsPerPage = this.config.pagination.ordersPerPage;
      }
      this.updatePaginationMetadata(this.filteredOrders.length);
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    focusSearchInput() {
      const searchInput = document.querySelector(
        'input[placeholder="Search orders..."]'
      );
      if (searchInput) {
        searchInput.focus();
      }
    },

    // === HELPER METHODS ===
    debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },

    getCurrentUserId() {
      const user = window.AuthService?.getCurrentUser();
      return user?.id || "anonymous";
    },

    generatePageNumbers(currentPage, totalPages) {
      const maxVisible = this.config.pagination.maxVisiblePages;
      const pages = [];

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    },

    updatePaginationMetadata(totalItems) {
      this.pagination.totalItems = totalItems;
      this.pagination.totalPages = Math.ceil(
        totalItems / this.pagination.itemsPerPage
      );
      this.pagination.currentPage = Math.min(
        this.pagination.currentPage,
        this.pagination.totalPages || 1
      );
    },

    calculateFavoriteItems() {
      const itemCounts = {};
      this.orders.forEach((order) => {
        order.items.forEach((item) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      return Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    },

    calculateOrderFrequency() {
      if (this.orders.length === 0) return 0;

      const firstOrder = new Date(
        Math.min(...this.orders.map((o) => new Date(o.orderTime)))
      );
      const lastOrder = new Date(
        Math.max(...this.orders.map((o) => new Date(o.orderTime)))
      );
      const daysDiff = Math.max(
        1,
        (lastOrder - firstOrder) / (1000 * 60 * 60 * 24)
      );

      return this.orders.length / daysDiff;
    },

    calculateAverageSatisfaction() {
      const ratedOrders = this.orders.filter((o) => o.rating);
      if (ratedOrders.length === 0) return 0;

      const totalRating = ratedOrders.reduce(
        (sum, order) => sum + order.rating.overall,
        0
      );
      return totalRating / ratedOrders.length;
    }, // === ERROR HANDLING METHODS ===
    handleError(message, error = null) {
      console.error("PurchasesPage Error:", message, error);

      this.componentState.hasError = true;
      this.componentState.errorMessage = message;

      if (window.ErrorHandler) {
        window.ErrorHandler.handle(error || new Error(message), {
          component: "PurchasesPage",
          action: "handleError",
          timestamp: Date.now(),
        });
      }
    },

    showErrorNotification(message) {
      if (window.ToastService) {
        window.ToastService.error(message);
      } else {
        alert(message);
      }
    },

    showSuccessNotification(message) {
      if (window.ToastService) {
        window.ToastService.success(message);
      } else {
        alert(message);
      }
    },

    showInfoNotification(message) {
      if (window.ToastService) {
        window.ToastService.info(message);
      } else {
        alert(message);
      }
    }, // === ENHANCED EXISTING METHODS ===
    async loadOrders() {
      try {
        // Start performance tracking
        const startTime = Date.now();
        this.ui.loadingStates.orders = true;

        const currentUser = window.AuthService.getCurrentUser();
        if (currentUser && currentUser.id) {
          let orders = [];

          try {
            // Primary: Get orders from DatabaseService
            if (window.DatabaseService) {
              orders = await window.DatabaseService.getUserOrders(
                currentUser.id
              );
              console.log("Orders loaded from database:", orders.length);
            }

            // Fallback: If no orders from database or service unavailable, try CartService
            if (orders.length === 0 && window.CartService) {
              console.log("Falling back to CartService for orders");
              orders = window.CartService.getUserOrders(currentUser.id) || [];
              // If we found orders in CartService but not in database, sync them
              if (orders.length > 0 && window.DatabaseService) {
                console.log("Syncing orders from CartService to database");
                for (const order of orders) {
                  try {
                    // Use addOrder to save to database
                    await window.DatabaseService.addOrder(order);
                  } catch (syncError) {
                    console.warn(
                      "Failed to sync order to database:",
                      syncError
                    );
                  }
                }
              }
            }
          } catch (dbError) {
            console.warn(
              "Database service error, falling back to CartService:",
              dbError
            );
            // Final fallback to CartService
            if (window.CartService) {
              orders = window.CartService.getUserOrders(currentUser.id) || [];
            }
          }

          // Normalize order data to ensure all required fields exist
          this.orders = orders.map((order) => this.normalizeOrder(order));

          // Cache orders
          this.updateOrderCache(this.orders);

          // Track performance
          this.performance.apiResponseTimes.push({
            operation: "loadOrders",
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        } else {
          this.orders = [];
          console.warn("User not logged in or missing user ID");
          this.handleError("User authentication required");
        }

        // Filter orders and update UI
        this.filterOrders();
        this.ui.loadingStates.orders = false;

        // Show success notification if orders loaded
        if (this.orders.length > 0) {
          this.showInfoNotification(`Loaded ${this.orders.length} orders`);
        }
      } catch (error) {
        this.ui.loadingStates.orders = false;
        this.handleError("Failed to load orders", error);
        this.showErrorNotification(
          "Failed to load your order history. Please try refreshing the page."
        );

        // Retry mechanism
        if (this.componentState.retryCount < this.componentState.maxRetries) {
          this.componentState.retryCount++;
          setTimeout(() => {
            this.loadOrders();
          }, 2000 * this.componentState.retryCount);
        }
      }
    },
    normalizeOrder(order) {
      // Ensure all required fields exist with defaults
      const normalized = {
        id: order.id || Date.now(),
        userId: order.userId || this.getCurrentUserId(),
        orderTime: order.orderTime || new Date().toISOString(),
        status: order.status || "pending",
        items: order.items || [],
        delivery: {
          method: order.delivery?.method || order.serviceMethod || "delivery",
          details: order.delivery?.details || {},
          ...order.delivery,
        },
        payment: {
          method: order.payment?.method || "card",
          details: order.payment?.details || {},
          amount: order.payment?.amount || order.totals?.total || 0,
          ...order.payment,
        },
        promoCode: order.promoCode || null,
        bulkDiscount: order.bulkDiscount || null,
        specialInstructions: order.specialInstructions || "",
        statusUpdates: order.statusUpdates || {},
        hasRated: order.hasRated || false,
        rating: order.rating || null,
        cancellationReason: order.cancellationReason || null,
        estimatedDeliveryTime: order.estimatedDeliveryTime || null,
      };

      // Handle totals with proper fallback calculation
      if (
        order.totals &&
        typeof order.totals.total === "number" &&
        order.totals.total > 0
      ) {
        // Use existing totals if they look valid
        normalized.totals = {
          subtotal: order.totals.subtotal || 0,
          serviceCharge: order.totals.serviceCharge || 0,
          tax: order.totals.tax || 0,
          deliveryFee: order.totals.deliveryFee || 0,
          total: order.totals.total,
          ...order.totals,
        };
        console.log(
          `Order ${order.id}: Using existing totals - Total: ${order.totals.total}`
        );
      } else {
        // Calculate totals from items if totals are missing or invalid
        console.log(
          `Order ${order.id}: Calculating totals from items`,
          order.items
        );
        const itemsSubtotal = (order.items || []).reduce((sum, item) => {
          const itemPrice = item.finalPrice || item.price || 0;
          const itemQuantity = item.quantity || 1;
          console.log(
            `  Item: ${
              item.name
            } - Price: ${itemPrice} x Qty: ${itemQuantity} = ${
              itemPrice * itemQuantity
            }`
          );
          return sum + itemPrice * itemQuantity;
        }, 0);
        // Apply basic calculations (using the same rates as ShoppingCart)
        const serviceChargeRate = 0.05; // 5% - matches PRICING_CONFIG.SERVICE_CHARGE_RATE
        const taxRate = 0.06; // 6% - matches PRICING_CONFIG.TAX_RATE
        const serviceCharge = itemsSubtotal * serviceChargeRate;
        const tax = (itemsSubtotal + serviceCharge) * taxRate;
        const deliveryFee = order.totals?.deliveryFee || 0;
        const total = itemsSubtotal + serviceCharge + tax + deliveryFee;

        normalized.totals = {
          subtotal: Math.round(itemsSubtotal * 100) / 100,
          serviceCharge: Math.round(serviceCharge * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          deliveryFee: deliveryFee,
          total: Math.round(total * 100) / 100,
        };

        console.log(
          `Order ${order.id}: Calculated totals - Subtotal: ${normalized.totals.subtotal}, Total: ${normalized.totals.total}`
        );
      }
      return normalized;
    },

    updateOrderCache(orders) {
      orders.forEach((order) => {
        this.orderCache.set(order.id, order);
      });

      // Calculate cache hit rate
      const totalRequests = this.performance.apiResponseTimes.length;
      const cacheHits = this.orderCache.size;
      this.performance.cacheHitRate =
        totalRequests > 0 ? cacheHits / totalRequests : 0;
    },
    refreshData() {
      this.showInfoNotification("Refreshing order data...");
      this.loadOrders();
    },

    filterOrders() {
      try {
        // Start performance tracking
        const startTime = Date.now();
        this.ui.loadingStates.filtering = true;

        let filtered = [...this.orders];

        // Apply status filter if selected
        if (this.statusFilter) {
          filtered = filtered.filter(
            (order) => order.status === this.statusFilter
          );
        }

        // Apply delivery type filter if selected
        if (this.deliveryTypeFilter) {
          filtered = filtered.filter(
            (order) => order.delivery.method === this.deliveryTypeFilter
          );
        }

        // Apply date range filter
        if (this.dateFilter.start) {
          const startDate = new Date(this.dateFilter.start);
          filtered = filtered.filter(
            (order) => new Date(order.orderTime) >= startDate
          );
        }

        if (this.dateFilter.end) {
          const endDate = new Date(this.dateFilter.end);
          // Set time to end of day
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(
            (order) => new Date(order.orderTime) <= endDate
          );
        }

        // Apply price filter
        if (this.priceFilter.min !== null) {
          filtered = filtered.filter(
            (order) => order.totals.total >= this.priceFilter.min
          );
        }

        if (this.priceFilter.max !== null) {
          filtered = filtered.filter(
            (order) => order.totals.total <= this.priceFilter.max
          );
        }

        // Apply advanced filters
        if (this.advancedFilters.paymentMethod) {
          filtered = filtered.filter(
            (order) =>
              order.payment.method === this.advancedFilters.paymentMethod
          );
        }

        if (this.advancedFilters.hasPromoCode) {
          filtered = filtered.filter((order) => !!order.promoCode);
        }

        if (this.advancedFilters.itemCount.min !== null) {
          filtered = filtered.filter(
            (order) => order.items.length >= this.advancedFilters.itemCount.min
          );
        }

        if (this.advancedFilters.itemCount.max !== null) {
          filtered = filtered.filter(
            (order) => order.items.length <= this.advancedFilters.itemCount.max
          );
        }

        // Apply search query if entered
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase();
          filtered = filtered.filter((order) => {
            // Search by order ID
            if (order.id.toString().includes(query)) return true;

            // Search by food item names
            if (
              order.items.some((item) =>
                item.name.toLowerCase().includes(query)
              )
            )
              return true;

            // Search by delivery address if it exists
            if (
              order.delivery.method !== "pickup" &&
              order.delivery.details.line1 &&
              order.delivery.details.line1.toLowerCase().includes(query)
            )
              return true;

            // Search by status
            if (order.status.toLowerCase().includes(query)) return true;

            // Search by payment method
            if (order.payment.method.toLowerCase().includes(query)) return true;

            return false;
          });
        }

        // Apply sorting
        this.applySorting(filtered);

        // Update filtered results
        this.filteredOrders = filtered;

        // Track performance
        const filterTime = Date.now() - startTime;
        this.performance.filterPerformance.push({
          timestamp: Date.now(),
          duration: filterTime,
          resultsCount: filtered.length,
          filtersApplied: this.getActiveFiltersCount(),
        });

        // Update pagination
        this.updatePaginationMetadata(filtered.length);
        this.resetToFirstPage();

        this.ui.loadingStates.filtering = false;
      } catch (error) {
        this.ui.loadingStates.filtering = false;
        this.handleError("Failed to filter orders", error);
      }
    },

    applySorting(orders) {
      const { field, direction } = this.sortOptions;

      orders.sort((a, b) => {
        let aValue, bValue;

        switch (field) {
          case "orderTime":
            aValue = new Date(a.orderTime);
            bValue = new Date(b.orderTime);
            break;
          case "total":
            aValue = a.totals.total;
            bValue = b.totals.total;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "itemCount":
            aValue = a.items.length;
            bValue = b.items.length;
            break;
          default:
            aValue = a.orderTime;
            bValue = b.orderTime;
        }

        if (direction === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },

    getActiveFiltersCount() {
      let count = 0;
      if (this.statusFilter) count++;
      if (this.deliveryTypeFilter) count++;
      if (this.dateFilter.start) count++;
      if (this.dateFilter.end) count++;
      if (this.priceFilter.min !== null) count++;
      if (this.priceFilter.max !== null) count++;
      if (this.searchQuery.trim()) count++;
      if (this.advancedFilters.paymentMethod) count++;
      if (this.advancedFilters.hasPromoCode) count++;
      return count;
    },

    resetToFirstPage() {
      this.pagination.currentPage = 1;
    },

    trackFilterPerformance(resultsCount) {
      if (window.Analytics) {
        window.Analytics.track("purchases_filter_performance", {
          resultsCount,
          filtersCount: this.getActiveFiltersCount(),
          hasSearch: !!this.searchQuery.trim(),
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
        });
      }
    },
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
    },
    clearFilters() {
      // Clear all filters
      this.statusFilter = "";
      this.deliveryTypeFilter = "";
      this.dateFilter.start = "";
      this.dateFilter.end = "";
      this.priceFilter.min = null;
      this.priceFilter.max = null;
      this.searchQuery = "";
      this.advancedFilters = {
        paymentMethod: "",
        hasPromoCode: false,
        ratingRange: { min: 1, max: 5 },
        itemCount: { min: null, max: null },
      };

      // Reset sorting to default
      this.sortOptions.field = "orderTime";
      this.sortOptions.direction = "desc"; // Apply filtering
      this.filterOrders();

      // Show notification
      this.showInfoNotification("All filters cleared");
    },
    toggleOrderDetails(orderId) {
      if (this.expandedOrders.includes(orderId)) {
        this.expandedOrders = this.expandedOrders.filter(
          (id) => id !== orderId
        );
      } else {
        this.expandedOrders.push(orderId);
      }
    },

    rateOrder(order) {
      try {
        this.ratedOrder = JSON.parse(JSON.stringify(order)); // Deep copy

        // Initialize rating for each item
        this.rating = {
          overall: 5,
          foodQuality: 5,
          deliverySpeed: order.delivery.method !== "pickup" ? 5 : 0,
          comment: "",
          items: order.items.map(() => ({ rating: 5, comment: "" })),
          isSubmitting: false,
          hasSubmitted: false,
        }; // Reset validation
        this.ratingValidation = {
          errors: {},
          isValid: true,
          touchedFields: new Set(),
        };

        // Open modal
        new bootstrap.Modal(document.getElementById("rateOrderModal")).show();
      } catch (error) {
        this.handleError("Failed to open rating modal", error);
        this.showErrorNotification(
          "Failed to open rating form. Please try again."
        );
      }
    },
    submitRating() {
      try {
        // Validate rating before submission
        if (!this.validateRatingSubmission()) {
          return;
        }

        // Set submitting state
        this.rating.isSubmitting = true;
        this.ui.loadingStates.rating = true;

        // Prepare review data
        const reviewData = {
          orderId: this.ratedOrder.id,
          userId: this.ratedOrder.userId,
          ratings: {
            overall: this.rating.overall,
            foodQuality: this.rating.foodQuality,
            deliverySpeed: this.rating.deliverySpeed,
          },
          comment: this.rating.comment.trim(),
          itemRatings: this.ratedOrder.items.map((item, index) => ({
            foodItemId: item.id,
            name: item.name,
            rating: this.rating.items[index].rating,
            comment: this.rating.items[index].comment || "",
          })),
          reviewDate: new Date().toISOString(),
          metadata: {
            deviceType: this.ui.isMobile ? "mobile" : "desktop",
            sessionId: this.analytics.sessionStartTime,
            submissionAttempt: 1,
          },
        };

        // Track submission attempt
        this.analytics.actionsPerformed.push({
          action: "rating_submission_attempted",
          orderId: this.ratedOrder.id,
          timestamp: Date.now(),
        });

        // Save the review with retry mechanism
        this.saveReviewWithRetry(reviewData)
          .then(() => {
            this.handleRatingSuccess(reviewData);
          })
          .catch((error) => {
            this.handleRatingError(error, reviewData);
          });
      } catch (error) {
        this.rating.isSubmitting = false;
        this.ui.loadingStates.rating = false;
        this.handleError("Failed to submit rating", error);
        this.showErrorNotification(
          "Failed to submit your rating. Please try again."
        );
      }
    },

    validateRatingSubmission() {
      const errors = [];

      // Validate overall rating
      if (this.rating.overall < 1 || this.rating.overall > 5) {
        errors.push("Overall rating must be between 1 and 5 stars");
      }

      // Validate food quality rating
      if (this.rating.foodQuality < 1 || this.rating.foodQuality > 5) {
        errors.push("Food quality rating must be between 1 and 5 stars");
      }

      // Validate delivery speed rating (if applicable)
      if (
        this.ratedOrder.delivery.method !== "pickup" &&
        (this.rating.deliverySpeed < 1 || this.rating.deliverySpeed > 5)
      ) {
        errors.push("Delivery speed rating must be between 1 and 5 stars");
      }

      // Validate comment length
      if (
        this.rating.comment &&
        this.rating.comment.length > this.config.validation.maxCommentLength
      ) {
        errors.push(
          `Comment must be less than ${this.config.validation.maxCommentLength} characters`
        );
      }

      // Validate item ratings
      for (let i = 0; i < this.rating.items.length; i++) {
        if (
          this.rating.items[i].rating < 1 ||
          this.rating.items[i].rating > 5
        ) {
          errors.push(`Item ${i + 1} rating must be between 1 and 5 stars`);
        }
      }

      if (errors.length > 0) {
        this.ratingValidation.errors = { general: errors };
        this.ratingValidation.isValid = false;
        this.showErrorNotification(errors.join(", "));
        return false;
      }

      this.ratingValidation.isValid = true;
      return true;
    },

    async saveReviewWithRetry(reviewData, attempt = 1) {
      const maxAttempts = 3;

      try {
        if (window.DatabaseService) {
          await window.DatabaseService.addReview(reviewData);
        } else {
          throw new Error("DatabaseService not available");
        }
      } catch (error) {
        if (attempt < maxAttempts) {
          // Retry with exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.saveReviewWithRetry(reviewData, attempt + 1);
        } else {
          // Fallback to localStorage after all retries failed
          return this.saveReviewToLocalStorage(reviewData);
        }
      }
    },

    saveReviewToLocalStorage(reviewData) {
      try {
        const existingReviews = JSON.parse(
          localStorage.getItem("reviews") || "[]"
        );
        existingReviews.push(reviewData);
        localStorage.setItem("reviews", JSON.stringify(existingReviews));

        // Mark as local storage fallback
        reviewData.isLocalStorageFallback = true;

        return Promise.resolve();
      } catch (error) {
        return Promise.reject(new Error("Failed to save to local storage"));
      }
    },

    handleRatingSuccess(reviewData) {
      // Update order as rated
      const orderIndex = this.orders.findIndex(
        (o) => o.id === this.ratedOrder.id
      );
      if (orderIndex >= 0) {
        this.orders[orderIndex].hasRated = true;
        this.orders[orderIndex].rating = {
          overall: this.rating.overall,
          foodQuality: this.rating.foodQuality,
          deliverySpeed: this.rating.deliverySpeed,
          comment: this.rating.comment,
          date: reviewData.reviewDate,
        };
      }

      // Update analytics
      this.analytics.conversionTracking.ratingsSubmitted++;
      this.analytics.actionsPerformed.push({
        action: "rating_submitted_successfully",
        orderId: this.ratedOrder.id,
        rating: this.rating.overall,
        timestamp: Date.now(),
      });

      // Track success analytics
      if (window.Analytics) {
        window.Analytics.track("purchases_rating_submitted", {
          orderId: this.ratedOrder.id,
          overallRating: this.rating.overall,
          foodQualityRating: this.rating.foodQuality,
          deliverySpeedRating: this.rating.deliverySpeed,
          hasComment: !!this.rating.comment.trim(),
          commentLength: this.rating.comment.length,
          itemRatingsCount: this.rating.items.length,
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
        });
      }

      // Close modal
      const modalElement = document.getElementById("rateOrderModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Reset states
      this.rating.isSubmitting = false;
      this.rating.hasSubmitted = true;
      this.ui.loadingStates.rating = false;

      // Show success notification
      this.showSuccessNotification(
        "Thank you for your review! Your feedback helps us improve."
      );

      // Refresh filtered orders to reflect changes
      this.filterOrders();
    },
    handleRatingError(error, reviewData) {
      console.error("Error saving review:", error);

      // Reset states
      this.rating.isSubmitting = false;
      this.ui.loadingStates.rating = false;

      // Track error analytics
      if (window.Analytics) {
        window.Analytics.track("purchases_rating_error", {
          orderId: this.ratedOrder.id,
          error: error.message,
          isLocalStorageFallback: reviewData.isLocalStorageFallback,
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
        });
      }

      // Show appropriate error message
      if (reviewData.isLocalStorageFallback) {
        this.showErrorNotification(
          "Your review was saved locally but could not be synced. It will be uploaded when connection is restored."
        );
      } else {
        this.showErrorNotification(
          "Failed to save your review. Please try again or check your connection."
        );
      }
    },

    cancelOrder(orderId) {
      const order = this.orders.find((o) => o.id === orderId);
      if (!order) return;

      this.orderToCancel = order;
      this.cancelReason = "";
      this.otherCancelReason = "";

      // Open modal
      new bootstrap.Modal(document.getElementById("cancelOrderModal")).show();
    },

    confirmCancelOrder() {
      if (!this.orderToCancel) return;

      // Get cancel reason
      const reason =
        this.cancelReason === "other"
          ? this.otherCancelReason
          : this.cancelReason;

      // Update order status
      try {
        // First try using DatabaseService
        window.DatabaseService.updateOrderStatus(
          this.orderToCancel.id,
          "cancelled"
        )
          .then(() => {
            // Update the order in local copy
            const orderIndex = this.orders.findIndex(
              (o) => o.id === this.orderToCancel.id
            );
            if (orderIndex >= 0) {
              this.orders[orderIndex].status = "cancelled";
              this.orders[orderIndex].statusUpdates = {
                ...(this.orders[orderIndex].statusUpdates || {}),
                cancelled: new Date().toISOString(),
              };
              this.orders[orderIndex].cancellationReason = reason;

              // Update orders in localStorage
              window.CartService.updateUserOrder(this.orders[orderIndex]);
            }

            // Close modal
            const modalElement = document.getElementById("cancelOrderModal");
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            // Show success message
            alert("Your order has been cancelled.");

            // Reset
            this.orderToCancel = null;
            this.cancelReason = "";
            this.otherCancelReason = "";

            // Refresh filtered orders
            this.filterOrders();
          })
          .catch((error) => {
            console.error(
              "Error cancelling order with DatabaseService:",
              error
            );
            this.fallbackCancelOrder(reason);
          });
      } catch (error) {
        console.error("Error cancelling order:", error);
        this.fallbackCancelOrder(reason);
      }
    },

    fallbackCancelOrder(reason) {
      // Fallback to localStorage if the database service fails
      const orderIndex = this.orders.findIndex(
        (o) => o.id === this.orderToCancel.id
      );
      if (orderIndex >= 0) {
        this.orders[orderIndex].status = "cancelled";
        this.orders[orderIndex].statusUpdates = {
          ...(this.orders[orderIndex].statusUpdates || {}),
          cancelled: new Date().toISOString(),
        };
        this.orders[orderIndex].cancellationReason = reason;

        // Update orders in localStorage
        localStorage.setItem("orders", JSON.stringify(this.orders));

        // Close modal
        const modalElement = document.getElementById("cancelOrderModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        // Show success message
        alert("Your order has been cancelled.");

        // Reset
        this.orderToCancel = null;
        this.cancelReason = "";
        this.otherCancelReason = "";

        // Refresh filtered orders
        this.filterOrders();
      }
    },
    async reorderItems(order) {
      try {
        // Validate that order and items exist
        if (!order || !order.items || !Array.isArray(order.items)) {
          console.error("Invalid order data:", order);
          if (window.toast) {
            window.toast.error("Invalid order data. Cannot reorder items.");
          } else {
            alert("Invalid order data. Cannot reorder items.");
          }
          return;
        }

        // Validate that CartService is available
        if (
          !window.CartService ||
          typeof window.CartService.addToCart !== "function"
        ) {
          console.error("CartService not available");
          if (window.toast) {
            window.toast.error(
              "Cart service is not available. Please try again later."
            );
          } else {
            alert("Cart service is not available. Please try again later.");
          }
          return;
        } // Validate that ProductService is available
        if (
          !window.ProductService ||
          typeof window.ProductService.getProductById !== "function"
        ) {
          console.error("ProductService not available");
          if (window.toast) {
            window.toast.error(
              "Product service is not available. Please try again later."
            );
          } else {
            alert("Product service is not available. Please try again later.");
          }
          return;
        } // Ensure ProductService is initialized
        try {
          await window.ProductService.ensureInitialized();
          const totalProducts = window.ProductService.menuItems.length;
          console.log(
            `ProductService initialized successfully with ${totalProducts} products`
          );
        } catch (error) {
          console.error("Failed to initialize ProductService:", error);
          if (window.toast) {
            window.toast.error(
              "Failed to load product catalog. Please try again later."
            );
          } else {
            alert("Failed to load product catalog. Please try again later.");
          }
          return;
        } // First clear the cart
        window.CartService.clearCart();

        console.log("Reordering items:", order.items);

        // Add all items from the order to the cart
        let itemsAdded = 0;
        let itemsSkipped = 0;
        for (let index = 0; index < order.items.length; index++) {
          const item = order.items[index];
          try {
            // Validate item data
            if (!item || typeof item !== "object") {
              console.warn(`Invalid item at index ${index}:`, item);
              itemsSkipped++;
              continue;
            }

            // Try different possible ID fields
            const itemId = item.id || item.productId || item.itemId;

            if (!itemId) {
              console.warn(`Item at index ${index} missing ID:`, item);
              itemsSkipped++;
              continue;
            } // Get the full product details from ProductService (await the async call)
            console.log(`Looking for product with ID: ${itemId}`);
            try {
              const productDetails = await window.ProductService.getProductById(
                itemId
              );
              console.log(`Found product:`, productDetails);
              if (productDetails) {
                // Prepare options object with customizations and special instructions
                const options = {
                  specialInstructions: item.specialInstructions || "",
                  customizations: item.customizations || [],
                  ...item.options, // Merge any existing options
                };

                // Call addToCart with correct parameter structure
                window.CartService.addToCart(
                  productDetails, // Product details object
                  item.quantity || 1, // Quantity as separate parameter
                  options // Options as separate parameter
                );
                itemsAdded++;
              }
            } catch (productError) {
              console.warn(
                `Product with ID ${itemId} not found in catalog, skipping:`,
                productError.message
              );
              itemsSkipped++;
            }
          } catch (error) {
            console.error(
              `Error adding item at index ${index} to cart:`,
              error,
              item
            );
            itemsSkipped++;
          }
        }

        if (itemsAdded > 0) {
          // Redirect to cart page
          this.$router.push("/cart"); // Show success message with additional info if items were skipped
          const successMessage =
            itemsSkipped > 0
              ? `${itemsAdded} items have been added to your cart! ${itemsSkipped} items were skipped (no longer available).`
              : `${itemsAdded} items have been added to your cart!`;

          if (window.toast) {
            window.toast.success(successMessage);
          } else {
            alert(successMessage);
          }
        } else {
          // Show error message if no items could be added
          const errorMessage =
            itemsSkipped > 0
              ? "Could not add any items to cart. All products may no longer be available."
              : "Could not add items to cart. Some products may no longer be available.";

          if (window.toast) {
            window.toast.error(errorMessage);
          } else {
            alert(errorMessage);
          }
        }
      } catch (error) {
        console.error("Error during reorder:", error);
        if (window.toast) {
          window.toast.error("An error occurred while adding items to cart.");
        } else {
          alert("An error occurred while adding items to cart.");
        }
      }
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case "pending":
          return "bg-secondary";
        case "preparing":
          return "bg-warning text-dark";
        case "ready":
          return "bg-info";
        case "out-for-delivery":
          return "bg-primary";
        case "delivered":
          return "bg-success";
        case "cancelled":
          return "bg-danger";
        default:
          return "bg-secondary";
      }
    },

    getDeliveryBadgeClass(method) {
      switch (method) {
        case "delivery":
          return "bg-info text-dark";
        case "express":
          return "bg-primary";
        case "pickup":
          return "bg-success";
        default:
          return "bg-secondary";
      }
    },

    getStatusDisplayText(status) {
      switch (status) {
        case "pending":
          return "Pending";
        case "preparing":
          return "Preparing";
        case "ready":
          return "Ready for Pickup";
        case "out-for-delivery":
          return "Out for Delivery";
        case "delivered":
          return "Delivered";
        case "cancelled":
          return "Cancelled";
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    },

    getDeliveryMethodText(method) {
      switch (method) {
        case "delivery":
          return "Standard Delivery";
        case "express":
          return "Express Delivery";
        case "pickup":
          return "Self Pickup";
        default:
          return method;
      }
    },

    getDeliveryLabel(order) {
      const method = order.delivery?.method || order.serviceMethod;
      return method === "pickup" ? "Pickup Fee" : "Delivery Fee";
    },

    isStatusReached(currentStatus, checkStatus) {
      const statusOrder = [
        "pending",
        "preparing",
        "ready",
        "out-for-delivery",
        "delivered",
      ];

      if (currentStatus === "cancelled") {
        return false;
      }

      const currentIndex = statusOrder.indexOf(currentStatus);
      const checkIndex = statusOrder.indexOf(checkStatus);

      return currentIndex >= checkIndex;
    },

    canCancelOrder(order) {
      // Can only cancel if status is pending or just moved to preparing
      return ["pending", "preparing"].includes(order.status);
    },

    formatDateTime(dateTimeString) {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getCardIcon(brand) {
      switch (brand.toLowerCase()) {
        case "visa":
          return "fa-cc-visa";
        case "mastercard":
          return "fa-cc-mastercard";
        case "amex":
          return "fa-cc-amex";
        case "discover":
          return "fa-cc-discover";
        default:
          return "fa-credit-card";
      }
    },

    // Filter methods for accessing custom filters
    formatCurrency(value) {
      if (window.Filters && window.Filters.formatCurrency) {
        return window.Filters.formatCurrency(value);
      }
      return "RM " + (value || 0).toFixed(2);
    },

    formatNumber(value) {
      if (window.Filters && window.Filters.formatNumber) {
        return window.Filters.formatNumber(value);
      }
      return (value || 0).toLocaleString();
    },

    pluralize(count, singular, plural) {
      if (window.Filters && window.Filters.pluralize) {
        return window.Filters.pluralize(count, singular, plural);
      }
      return count === 1 ? singular : plural || singular + "s";
    },

    formatRelativeTime(date) {
      if (window.Filters && window.Filters.formatRelativeTime) {
        return window.Filters.formatRelativeTime(date);
      }
      const now = new Date();
      const inputDate = new Date(date);
      const diffInSeconds = Math.floor((now - inputDate) / 1000);

      if (diffInSeconds < 60) return "just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    },
  },
};

// Make the component globally available
window.PurchasesPage = PurchasesPage;
