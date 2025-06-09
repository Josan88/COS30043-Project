# FoodNow - Screenshot Collection Guide
## COS30043 Documentation Requirements

---

## 📁 Directory Structure

Create the following directory structure for organizing screenshots:

```
screenshots/
├── mobile-portrait-wireframe.png
├── mobile-portrait-screenshot.png
├── mobile-landscape-wireframe.png
├── mobile-landscape-screenshot.png
├── desktop-wireframe.png
├── desktop-screenshot.png
├── product-page-wireframe.png
├── product-page-screenshot.png
├── cart-wireframe.png
├── cart-screenshot.png
├── auth-wireframe.png
├── login-screenshot.png
├── register-screenshot.png
├── account-screenshot.png
├── purchases-screenshot.png
└── features/
    ├── accessibility-demo.png
    ├── grid-system-demo.png
    ├── responsive-breakpoints.png
    └── validation-demo.png
```

---

## 📸 Screenshot Collection Checklist

### 1. Mobile Portrait Screenshots (320px - 575px)

**Device**: iPhone SE or similar mobile device
**Viewport**: 375px x 667px

- [ ] **Homepage Mobile**: 
  - Navigation: Hamburger menu collapsed
  - Featured products: Single column layout
  - Categories: 2x2 grid arrangement
  - Hero section: Mobile-optimized

- [ ] **Product Page Mobile**:
  - Filter panel: Collapsed/accordion style
  - Product grid: Single column
  - Pagination: Mobile-friendly controls
  - Search: Full-width search bar

- [ ] **Cart Mobile**:
  - Cart items: Stacked vertically
  - Order summary: Mobile-optimized layout
  - Buttons: Touch-friendly sizing

### 2. Mobile Landscape Screenshots (576px - 767px)

**Device**: iPhone/Android in landscape mode
**Viewport**: 667px x 375px

- [ ] **Homepage Landscape**:
  - Product grid: 2-column layout
  - Navigation: Expanded horizontal menu
  - Categories: 3-column grid

- [ ] **Product Page Landscape**:
  - Product grid: 2-column layout
  - Filters: Side panel or expanded
  - Navigation: Horizontal layout

### 3. Desktop Screenshots (992px+)

**Viewport**: 1920px x 1080px (or 1366px x 768px)

- [ ] **Homepage Desktop**:
  - Navigation: Full horizontal menu
  - Featured products: 4-column grid
  - Categories: 6-column grid
  - Hero section: Full-width banner

- [ ] **Product Page Desktop**:
  - Product grid: 4+ column layout
  - Filter panel: Left sidebar
  - Advanced features: Hover effects visible
  - Pagination: Full controls

- [ ] **Cart Desktop**:
  - Table layout: Accessible table structure
  - Order summary: Right sidebar
  - Advanced features: Visible

### 4. Authentication Pages

- [ ] **Login Page**:
  - Form validation: Show error states
  - Accessibility: Focus indicators visible
  - Responsive: Mobile and desktop views

- [ ] **Register Page**:
  - Form fields: All input types demonstrated
  - Validation: Real-time validation shown
  - Accessibility: ARIA labels visible in inspector

### 5. User Account Pages

- [ ] **My Account**:
  - Profile management: Form fields and validation
  - Settings panel: User preferences
  - Navigation: Account menu items

- [ ] **My Purchases**:
  - Order history: Table with accessible structure
  - Order details: Expandable sections
  - Status indicators: Visual order status

### 6. Feature Demonstrations

- [ ] **Accessibility Features**:
  - Focus indicators: Visible keyboard navigation
  - Screen reader: Inspector showing ARIA labels
  - High contrast: Contrast mode demonstration

- [ ] **Grid System**:
  - Responsive breakpoints: Split-screen comparison
  - Context grouping: Visual hierarchy
  - CSS Grid: Developer tools showing grid lines

- [ ] **Form Validation**:
  - Error states: Red borders and error messages
  - Success states: Green borders and checkmarks
  - Live validation: Real-time feedback

---

## 🛠️ Tools and Setup

### Browser Setup
1. **Chrome DevTools**: 
   - Enable device simulation
   - Use responsive design mode
   - Show CSS Grid overlays when needed

2. **Accessibility Inspector**:
   - Enable accessibility tree view
   - Show ARIA labels and roles
   - Demonstrate keyboard navigation

### Screenshot Standards
- **Resolution**: High-DPI screenshots (2x scale minimum)
- **Format**: PNG for crisp UI elements
- **Naming**: Descriptive filenames matching the guide
- **Framing**: Include browser chrome for context when relevant

### Testing Procedure
1. **Start Local Server**: 
   ```powershell
   cd "c:\Users\jason.LAPTOP-KG0TQEQ7\OneDrive - Swinburne Sarawak\Y3S1\COS30043 INTERFACE DESIGN AND DEVELOPMENT\COS30043-Project"
   python -m http.server 3000
   ```

2. **Open Browser**: Navigate to `http://localhost:3000`

3. **Test Each Breakpoint**:
   - Set viewport size using DevTools
   - Navigate through all pages
   - Capture key interactions and states

4. **Document Features**:
   - Show loading states
   - Demonstrate form validation
   - Capture hover effects (desktop)
   - Show accessibility features

---

## 📋 Screenshot Descriptions

### Required for Each Screenshot:

1. **Context Description**: What page/feature is being shown
2. **Breakpoint Information**: Device size and viewport
3. **Key Features Highlighted**: Specific COS30043 requirements demonstrated
4. **Technical Notes**: Grid system, accessibility features, responsive behavior

### Example Caption Format:
```
Mobile Portrait - Homepage (375px viewport)
Features: Single-column context grouping, touch-optimized navigation, 
responsive grid system implementation, accessible form controls
```

---

## ✅ Quality Checklist

Before finalizing screenshots:

- [ ] All 7 required pages captured
- [ ] Three responsive breakpoints shown
- [ ] Grid system clearly visible
- [ ] Accessibility features demonstrated
- [ ] Form validation states shown
- [ ] Table accessibility visible
- [ ] Context grouping evident
- [ ] Professional UI quality
- [ ] No console errors visible
- [ ] Clean, production-ready appearance

---

## 📤 Final Organization

Create a ZIP file containing:
1. All screenshots organized in folders
2. README.md with updated screenshot references
3. DESIGN_DOCUMENT.md with wireframe descriptions
4. Complete project source code

**File Naming Convention**: `COS30043_FoodNow_[StudentName]_[StudentID].zip`

---

## 🎯 Submission Integration

Once screenshots are captured:

1. **Update README.md**: Replace placeholder text with actual screenshot references
2. **Verify Links**: Ensure all image paths are correct
3. **Test Documentation**: Review complete documentation package
4. **Final Review**: Check all requirements are visually demonstrated

This comprehensive screenshot collection will provide clear evidence of all COS30043 requirements implementation and demonstrate the professional quality of your FoodNow application.
