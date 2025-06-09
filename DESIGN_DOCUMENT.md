# FoodNow - Design Document
## COS30043 Interface Design and Development Project

---

## 1. Project Overview

**Project Name:** FoodNow - Digital Restaurant Menu and Ordering System  
**Student:** [Your Name]  
**Student ID:** [Your ID]  
**Course:** COS30043 Interface Design and Development  
**Submission Date:** June 2025

### 1.1 Application Purpose
FoodNow is a comprehensive Vue.js-based food ordering web application designed for in-restaurant use. The application allows customers to browse menus, customize orders, manage their cart, and track purchases through an intuitive digital interface.

### 1.2 Target Audience
- Restaurant customers using tablets/mobile devices at their tables
- Food service establishments looking for digital menu solutions
- Users requiring accessible web interfaces

---

## 2. Technical Requirements Compliance

### 2.1 Seven Required Pages ✅

| Page | Component | Purpose | Key Features |
|------|-----------|---------|--------------|
| 1. Main Page | `HomePage.js` | Landing page with featured items | Hero section, category navigation, featured products |
| 2. Product Page | `ProductPage.js` | Menu listing and filtering | Advanced filtering, pagination, product details |
| 3. Shopping Cart | `ShoppingCart.js` | Cart management | Item customization, quantity control, checkout |
| 4. Registration | `RegisterPage.js` | User account creation | Form validation, accessibility features |
| 5. Login | `LoginPage.js` | User authentication | Security features, session management |
| 6. My Account | `AccountPage.js` | Profile management | User settings, personal information |
| 7. My Purchases | `PurchasesPage.js` | Order history | Purchase tracking, order details |

### 2.2 Context View Grouping - Grid System Implementation ✅

#### Responsive Grid Structure
```css
/* Mobile Portrait (320px-575px) */
.context-cards { grid-template-columns: 1fr; }

/* Mobile Landscape (576px-767px) */
.context-cards { grid-template-columns: repeat(2, 1fr); }

/* Desktop (992px+) */
.context-cards { grid-template-columns: repeat(4, 1fr); }
```

#### Context Grouping Examples
- **Product Categories**: Items grouped by food type (Appetizers, Mains, Desserts)
- **Order Status**: Purchases grouped by completion status
- **User Data**: Profile information organized in logical sections

### 2.3 Modules and Controllers ✅

#### Service Layer Architecture
- **ProductService.js**: Menu data management, filtering, search
- **AuthService.js**: User authentication, session management
- **CartService.js**: Shopping cart operations, persistence
- **DatabaseService.js**: Data storage, API simulation
- **ValidationService.js**: Form validation, input sanitization

#### Configuration Modules
- **router.js**: Vue Router with navigation guards
- **app.js**: Application initialization, global settings
- **constants/loader.js**: Application constants

### 2.4 Custom Directives (9 Implemented) ✅

1. **v-focus-trap**: Accessibility focus management
2. **v-validate**: Enhanced form validation
3. **v-accessible-table**: Table accessibility
4. **v-scroll-reveal**: Intersection Observer animations
5. **v-click-outside**: Click detection for dropdowns
6. **v-currency**: Currency input formatting
7. **v-lazy**: Image lazy loading
8. **v-responsive**: Responsive class switching
9. **v-accessible-image**: Image loading with fallbacks

### 2.5 Custom Filters (12 Implemented) ✅

1. **formatCurrency**: Malaysian Ringgit formatting
2. **formatDate**: Internationalized date formatting
3. **truncate**: Text truncation with ellipsis
4. **sortArray**: Advanced array sorting
5. **groupBy**: Array grouping by property
6. **calculateStats**: Statistical calculations
7. **formatStars**: Rating display
8. **formatPercentage**: Percentage formatting
9. **pluralize**: Smart pluralization
10. **highlightText**: Search term highlighting
11. **formatNumber**: Number formatting with commas
12. **capitalize**: Text capitalization

---

## 3. Wireframe Designs

### 3.1 Mobile Portrait (320px - 575px)

```
┌─────────────────────────────────┐
│ FoodNow                    [☰]  │
├─────────────────────────────────┤
│                                 │
│        HERO IMAGE               │
│    Welcome to FoodNow           │
│                                 │
├─────────────────────────────────┤
│ Featured Items                  │
│ ┌─────────────────────────────┐ │
│ │     Product Card 1          │ │
│ │  [Image] Name Price         │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │     Product Card 2          │ │
│ │  [Image] Name Price         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Categories                      │
│ ┌──────┐ ┌──────┐              │
│ │ [🍔] │ │ [🍕] │              │
│ │Burger│ │Pizza │              │
│ └──────┘ └──────┘              │
│ ┌──────┐ ┌──────┐              │
│ │ [🥗] │ │ [🍰] │              │
│ │Salad │ │Dessrt│              │
│ └──────┘ └──────┘              │
└─────────────────────────────────┘
```

### 3.2 Mobile Landscape (576px - 767px)

```
┌───────────────────────────────────────────────────────┐
│ FoodNow                                          [☰]  │
├───────────────────────────────────────────────────────┤
│                HERO SECTION                           │
│  Welcome to FoodNow - Order Your Favorites           │
├───────────────────────────────────────────────────────┤
│ Featured Items                                        │
│ ┌─────────────────────┐ ┌─────────────────────────┐   │
│ │   Product Card 1    │ │   Product Card 2        │   │
│ │ [Image] Name Price  │ │ [Image] Name Price      │   │
│ └─────────────────────┘ └─────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ Categories                                            │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│ │[🍔] │ │[🍕] │ │[🥗] │ │[🍰] │ │[☕] │ │[🍜] │     │
│ │Brgr │ │Pzza │ │Sald │ │Dsrt │ │Drnk │ │Soup │     │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
└───────────────────────────────────────────────────────┘
```

### 3.3 Desktop (992px+)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FoodNow    [Home] [Menu] [Cart] [Account]                    [Search...] [Login]    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│                          HERO SECTION                                              │
│              Welcome to FoodNow - Digital Restaurant Experience                    │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Featured Today's Specials                                      [View All Menu →]   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│ │Product 1    │ │Product 2    │ │Product 3    │ │Product 4    │                   │
│ │[Image]      │ │[Image]      │ │[Image]      │ │[Image]      │                   │
│ │Name         │ │Name         │ │Name         │ │Name         │                   │
│ │★★★★☆       │ │★★★★★       │ │★★★★☆       │ │★★★☆☆       │                   │
│ │$12.99       │ │$15.99       │ │$8.99        │ │$22.99       │                   │
│ │[Add to Cart]│ │[Add to Cart]│ │[Add to Cart]│ │[Add to Cart]│                   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Browse by Category                                                                  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│ │[🍔] │ │[🍕] │ │[🥗] │ │[🍰] │ │[☕] │ │[🍜] │ │[🍤] │ │[🥤] │                 │
│ │Brgr │ │Pzza │ │Sald │ │Dsrt │ │Drnk │ │Soup │ │Sefd │ │Bevg │                 │
│ │12   │ │8    │ │15   │ │6    │ │20   │ │5    │ │10   │ │25   │                 │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Product Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FoodNow - Menu                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ [Filters] [Search.....................] [Sort: Popular ▼] [Items per page: 12 ▼]  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Filters:                                                                            │
│ ☐ Vegetarian ☐ Vegan ☐ Gluten-Free ☐ Spicy                                       │
│ Price: [••○────────] $5 - $50                                                      │
│ Category: [All ▼]                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│ │Product Grid │ │Product Grid │ │Product Grid │ │Product Grid │                   │
│ │Item 1       │ │Item 2       │ │Item 3       │ │Item 4       │                   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│ │Product Grid │ │Product Grid │ │Product Grid │ │Product Grid │                   │
│ │Item 5       │ │Item 6       │ │Item 7       │ │Item 8       │                   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│           [← Previous] [1] [2] [3] [4] [5] [Next →]                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Shopping Cart Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Your Order                                                              [× Close]   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Image] Classic Cheeseburger                                    $12.99        │ │
│ │         • Extra cheese (+$2.00)                                              │ │
│ │         • No pickles                                                         │ │
│ │         Qty: [−] 2 [+]                                      [Edit] [Remove]  │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Image] Margherita Pizza                                        $15.99        │ │
│ │         • Large size                                                         │ │
│ │         • Extra basil (+$1.50)                                              │ │
│ │         Qty: [−] 1 [+]                                      [Edit] [Remove]  │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Order Summary:                                                                      │
│ Subtotal:                                                               $41.97     │
│ Tax (10%):                                                              $4.20      │
│ Total:                                                                  $46.17     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                            [Continue Shopping] [Proceed to Checkout]               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. User Experience Flow

### 4.1 Customer Journey Map

1. **Landing** → Customer arrives at main page
2. **Browse** → Explores featured items and categories
3. **Search** → Uses filters to find specific items
4. **Select** → Chooses products and customizes options
5. **Cart** → Reviews order and makes adjustments
6. **Account** → Creates account or logs in
7. **Checkout** → Completes order process
8. **Track** → Views order history and status

### 4.2 Navigation Structure

```
Home Page
├── Product Page
│   ├── Product Details Modal
│   └── Customization Modal
├── Shopping Cart
│   └── Checkout Process
├── User Authentication
│   ├── Registration Page
│   └── Login Page
└── User Account Area
    ├── My Account Page
    └── My Purchases Page
```

---

## 5. Accessibility Features

### 5.1 Form Accessibility Implementation

```html
<!-- Example: Accessible Form Field -->
<label for="email" class="form-label">
  Email Address <span class="required">*</span>
</label>
<input
  type="email"
  id="email"
  v-model="email"
  aria-describedby="email-help email-error"
  aria-invalid="false"
  required
/>
<div id="email-help" class="form-text">We'll never share your email</div>
<div id="email-error" class="invalid-feedback" aria-live="polite"></div>
```

### 5.2 Table Accessibility Implementation

```html
<!-- Example: Accessible Table -->
<table v-accessible-table="{ caption: 'Menu items with pricing', sortable: true }">
  <caption>Menu items with pricing and availability</caption>
  <thead>
    <tr>
      <th scope="col" id="name-header" class="sortable-header">Name</th>
      <th scope="col" id="price-header" class="sortable-header">Price</th>
      <th scope="col" id="status-header">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in menuItems" :key="item.id">
      <td headers="name-header">{{ item.name }}</td>
      <td headers="price-header">{{ item.price | formatCurrency }}</td>
      <td headers="status-header">{{ item.status }}</td>
    </tr>
  </tbody>
</table>
```

### 5.3 WCAG 2.1 AA Compliance Features

- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text
- **Focus Management**: Visible focus indicators and proper tab order
- **Alternative Text**: Descriptive alt text for all images
- **Live Regions**: Dynamic content updates announced to screen readers

---

## 6. Technical Architecture

### 6.1 Component Hierarchy

```
App (Main Vue Instance)
├── NavBar
│   ├── Navigation Links
│   └── User Menu
├── Router View (Dynamic Component)
│   ├── HomePage
│   │   ├── ProductCard (v-for)
│   │   └── CategoryCard (v-for)
│   ├── ProductPage
│   │   ├── FilterPanel
│   │   ├── ProductCard (v-for)
│   │   └── PaginationComponent
│   ├── ShoppingCart
│   │   └── CartItem (v-for)
│   ├── RegisterPage
│   ├── LoginPage
│   ├── AccountPage
│   └── PurchasesPage
├── CustomizationModal
└── AppFooter
```

### 6.2 Data Flow Architecture

```
User Action
    ↓
Vue Component
    ↓
Service Layer (ProductService, AuthService, etc.)
    ↓
DatabaseService (LocalStorage)
    ↓
State Update
    ↓
Component Re-render
```

### 6.3 Responsive Design Strategy

#### Mobile-First CSS Approach
```css
/* Base styles for mobile */
.product-grid {
  grid-template-columns: 1fr;
}

/* Tablet enhancement */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop enhancement */
@media (min-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 7. Performance Optimizations

### 7.1 Loading Strategies

- **Lazy Loading**: Images loaded as they enter viewport
- **Virtual Scrolling**: Large datasets rendered efficiently
- **Debounced Search**: API calls optimized with delays
- **Component Caching**: Expensive computations memoized

### 7.2 Code Quality Metrics

- **Modular Architecture**: Separated concerns with service layer
- **Component Reusability**: DRY principles followed throughout
- **Documentation Coverage**: All components and methods documented
- **Error Handling**: Comprehensive error management system

---

## 8. Browser and Device Testing

### 8.1 Supported Browsers
- ✅ Chrome 119+
- ✅ Firefox 115+
- ✅ Safari 16+
- ✅ Edge 119+

### 8.2 Device Testing Matrix
- ✅ iPhone (Portrait/Landscape)
- ✅ Android Phones (Portrait/Landscape)
- ✅ iPad and Android Tablets
- ✅ Desktop (1920x1080, 1366x768, 1440x900)

### 8.3 Performance Benchmarks
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

---

## 9. Code Quality and Standards

### 9.1 HTML5 Compliance
- Semantic HTML5 elements used throughout
- Proper document structure with DOCTYPE
- Valid markup confirmed through W3C validator
- Accessible markup following WCAG guidelines

### 9.2 JavaScript Best Practices
- ES6+ features used appropriately
- Consistent naming conventions
- Comprehensive error handling
- Code comments and documentation
- Modular architecture with separation of concerns

### 9.3 CSS Organization
- Mobile-first responsive design
- Consistent naming conventions (BEM methodology)
- Proper cascade and specificity management
- Cross-browser compatibility ensured

---

## 10. Future Enhancements

### 10.1 Potential Improvements
- Real-time order tracking with WebSocket
- PWA capabilities for offline functionality
- Integration with payment gateways
- Multi-language support (i18n)
- Advanced analytics and reporting

### 10.2 Scalability Considerations
- Backend API integration ready
- Database schema designed for growth
- Component architecture supports feature expansion
- Performance optimizations in place

---

## Conclusion

The FoodNow application successfully demonstrates all COS30043 project requirements while providing a professional, accessible, and user-friendly food ordering experience. The implementation showcases modern web development practices, comprehensive accessibility support, and responsive design principles that ensure optimal user experience across all devices and user needs.

The project exceeds basic requirements by including advanced features such as sophisticated filtering, real-time search, accessibility enhancements, and a comprehensive testing strategy. The modular architecture ensures maintainability and scalability for future development.

---

**Project Status**: ✅ Complete - All Requirements Met  
**Accessibility Compliance**: ✅ WCAG 2.1 AA  
**Browser Support**: ✅ Modern Browsers  
**Mobile Responsiveness**: ✅ Three Breakpoints Implemented  
**Code Quality**: ✅ Professional Standards Met
