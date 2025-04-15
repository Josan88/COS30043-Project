/**
 * ProductService
 * Service for managing product data
 */
const ProductService = {
  // Product data storage
  products: [],
  
  // Category mapping
  categoryMap: {
    'pc': 'PCs',
    'phones': 'Phones',
    'tablets': 'Tablets',
    'watches': 'Watches',
    'audio': 'Audio',
    'accessories': 'Accessories'
  },
  
  // Initialize product data
  init() {
    // Try to load products from the JSON file
    fetch('/js/data/products.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.products = data.products;
        console.log('Products loaded successfully:', this.products.length);
        
        // Dispatch an event to notify that products are loaded
        window.dispatchEvent(new Event('products-loaded'));
      })
      .catch(error => {
        console.error('Error loading products:', error);
        // If loading fails, use backup products (empty array for now)
        this.products = [];
      });
  },
  
  // Get all products
  getAllProducts() {
    return this.products;
  },
  
  // Get products by category
  getProductsByCategory(category) {
    if (!category) return this.products;
    return this.products.filter(product => product.category === category);
  },
  
  // Get a single product by ID
  getProduct(id) {
    return this.products.find(product => product.id === parseInt(id)) || null;
  },
  
  // Search products
  searchProducts(query) {
    if (!query) return this.products;
    
    query = query.toLowerCase();
    return this.products.filter(product => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  },
  
  // Get featured products (just getting some based on rating in this example)
  getFeaturedProducts(count = 4) {
    return [...this.products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count);
  },
  
  // Get products on sale
  getProductsOnSale() {
    return this.products.filter(product => product.discount > 0);
  },
  
  // Get recommended products based on categories, excluding specific product IDs
  getRecommendedProducts(categories = [], count = 4, excludeIds = []) {
    // If categories is not an array, convert it to one
    if (!Array.isArray(categories)) {
      categories = [categories].filter(Boolean);
    }
    
    // Filter products by matching categories and not in exclude list
    const relevantProducts = this.products.filter(product => {
      return (
        (categories.length === 0 || categories.includes(product.category)) && 
        !excludeIds.includes(product.id)
      );
    });
    
    // If we have more than requested, select random subset
    if (relevantProducts.length > count) {
      // Shuffle and pick first 'count' items
      for (let i = relevantProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [relevantProducts[i], relevantProducts[j]] = [relevantProducts[j], relevantProducts[i]];
      }
      return relevantProducts.slice(0, count);
    }
    
    return relevantProducts;
  },

  // Get available categories with product counts
  getCategories() {
    const categoryCounts = {};
    
    // Initialize all categories with zero count
    Object.keys(this.categoryMap).forEach(category => {
      categoryCounts[category] = {
        id: category,
        name: this.categoryMap[category],
        count: 0
      };
    });
    
    // Count products in each category
    this.products.forEach(product => {
      if (product.category && categoryCounts[product.category]) {
        categoryCounts[product.category].count++;
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.values(categoryCounts).sort((a, b) => b.count - a.count);
  },
  
  // Get category name from category ID
  getCategoryName(categoryId) {
    return this.categoryMap[categoryId] || categoryId;
  }
};

// Initialize product data when script loads
document.addEventListener('DOMContentLoaded', () => {
  ProductService.init();
});