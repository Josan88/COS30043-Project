// =====================================================
// NewsReviewsSection Component
// =====================================================

const NewsReviewsSection = {
  props: {
    latestNews: { type: Array, default: () => [] },
    currentReview: { type: Object, default: () => ({}) },
  },

  emits: ["prev-review", "next-review"],

  template: `
    <div class="container my-5">
      <div class="row g-4">
        <!-- Latest Updates -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <div class="d-flex justify-content-between align-items-center">
                <h2 class="h4 mb-0">
                  <i class="far fa-newspaper text-primary me-2"></i> Latest Updates
                </h2>
                <a href="#" class="btn btn-sm btn-outline text-primary">View All</a>
              </div>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush news-feed">
                <li 
                  v-for="(news, index) in latestNews" 
                  :key="index" 
                  class="list-group-item border-start-0 border-end-0 px-4 py-3"
                >
                  <div class="d-flex">
                    <div class="news-date me-3 text-center">
                      <span class="d-block fw-bold text-primary">{{ news.date.split(' ')[1] }}</span>
                      <small>{{ news.date.split(' ')[0] }}</small>
                    </div>
                    <div>
                      <h6 class="mb-1">{{ news.title }}</h6>
                      <small class="text-muted">
                        {{ news.excerpt || 'Click to read more about this update...' }}
                      </small>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Customer Reviews Carousel -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <div class="d-flex justify-content-between align-items-center">
                <h2 class="h4 mb-0">
                  <i class="far fa-comments text-primary me-2"></i> Customer Feedback
                </h2>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-light" @click="$emit('prev-review')">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="btn btn-sm btn-light" @click="$emit('next-review')">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <div class="testimonial-cards">
                <div class="testimonial-card active" v-if="currentReview.name">
                  <div class="d-flex mb-3">
                    <div class="text-warning">
                      <i v-for="n in Math.floor(currentReview.rating)" :key="'full-' + n" class="fas fa-star"></i>
                      <i v-if="currentReview.rating % 1 >= 0.5" class="fas fa-star-half-alt"></i>
                      <i v-for="n in (5 - Math.floor(currentReview.rating) - (currentReview.rating % 1 >= 0.5 ? 1 : 0))" 
                         :key="'empty-' + n" class="far fa-star"></i>
                    </div>
                    <div class="ms-auto">
                      <small class="text-muted">{{ currentReview.date }}</small>
                    </div>
                  </div>
                  <p class="testimonial-text">{{ currentReview.text }}</p>
                  <div class="d-flex align-items-center mt-4">
                    <img 
                      :src="currentReview.image" 
                      class="rounded-circle me-3" 
                      width="50" 
                      height="50" 
                      :alt="currentReview.name"
                    >
                    <div>
                      <h6 class="mb-0">{{ currentReview.name }}</h6>
                      <small class="badge bg-primary-subtle text-primary">{{ currentReview.type }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

// Register component globally
window.NewsReviewsSection = NewsReviewsSection;
