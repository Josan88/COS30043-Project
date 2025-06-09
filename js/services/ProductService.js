/**
 * ProductService
 * Handles all food item data operations and menu management
 * Enhanced with better error handling and constants
 */
class ProductService {
  constructor() {
    this.menuItems = [];
    this.categories = [];
    this.initialized = false;
    this.initializing = false;

    // Configuration constants
    this.config = {
      PRODUCTS_ENDPOINT: "js/data/products.json",
      CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000, // 1 second
    };

    this.cache = {
      products: null,
      timestamp: null,
    };
  }
  /**
   * Initialize the service and load menu data with retry logic
   */
  async init() {
    if (this.initialized) return;
    if (this.initializing) {
      // Wait for current initialization to complete
      await this.waitForInitialization();
      return;
    }

    this.initializing = true;

    try {
      // Check cache first
      if (this.isCacheValid()) {
        this.menuItems = this.cache.products;
        this.categories = this.extractCategoriesFromProducts();
        this.initialized = true;
        this.initializing = false;
        this.dispatchProductsLoaded();
        return;
      }

      // Load products with retry logic
      await this.loadProductsWithRetry();
      this.categories = this.extractCategoriesFromProducts();
      this.initialized = true;
      this.dispatchProductsLoaded();
      console.log("ProductService initialized successfully.");
    } catch (error) {
      console.error("Error initializing ProductService:", error);
      window.ErrorHandler?.logError(error, {
        service: "ProductService",
        method: "init",
      });

      // Attempt to load fallback data if initialization fails
      this.loadFallbackData();
      this.initialized = true;
      this.dispatchProductsLoaded();
      console.log("ProductService initialized with fallback data.");
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Load products with retry logic
   */
  async loadProductsWithRetry() {
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.MAX_RETRIES; attempt++) {
      try {
        await this.loadProducts();
        // Cache successful result
        this.cache.products = [...this.menuItems];
        this.cache.timestamp = Date.now();
        return;
      } catch (error) {
        lastError = error;
        console.warn(`ProductService load attempt ${attempt} failed:`, error);

        if (attempt < this.config.MAX_RETRIES) {
          await this.delay(this.config.RETRY_DELAY * attempt); // Exponential backoff
        }
      }
    }

    throw new Error(
      `Failed to load products after ${this.config.MAX_RETRIES} attempts: ${lastError.message}`
    );
  }

  /**
   * Wait for current initialization to complete
   */
  async waitForInitialization() {
    const maxWait = 10000; // 10 seconds
    const checkInterval = 100; // 100ms
    let waited = 0;

    while (this.initializing && waited < maxWait) {
      await this.delay(checkInterval);
      waited += checkInterval;
    }

    if (this.initializing) {
      throw new Error("Initialization timeout");
    }
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid() {
    return (
      this.cache.products &&
      this.cache.timestamp &&
      Date.now() - this.cache.timestamp < this.config.CACHE_DURATION
    );
  }

  /**
   * Dispatch products loaded event
   */
  dispatchProductsLoaded() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("productsLoaded", {
          detail: {
            products: this.menuItems,
            categories: this.categories,
            timestamp: Date.now(),
          },
        })
      );
    }
  }

  /**
   * Load menu items from JSON file
   */
  async loadProducts() {
    try {
      const response = await fetch("js/data/products.json");
      if (response.ok) {
        const parsedData = await response.json(); // Parse into temporary variable
        console.log("Parsed data from products.json:", parsedData); // Log the raw parsed data

        // *** Check if parsedData has a 'products' property and if it's an array ***
        if (parsedData && Array.isArray(parsedData.products)) {
          this.menuItems = parsedData.products; // Assign the nested array
          console.log(
            "Products array loaded successfully from parsedData.products"
          );
          return; // Success
        } else {
          console.error(
            "Parsed data does not contain a 'products' array:",
            parsedData
          );
          this.menuItems = []; // Set to empty array before throwing
          throw new Error("Parsed product data structure is invalid.");
        }
        // *** End Check ***
      } else {
        throw new Error(
          `Failed to fetch products.json: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.menuItems = []; // Ensure menuItems is reset on any error
      throw error; // Re-throw to trigger fallback in init()
    }
  }

  /**
   * Load food categories - Now primarily relies on extraction
   */
  async loadCategories() {
    try {
      // Ensure categories are extracted if products loaded but extraction hasn't happened
      if (this.menuItems.length > 0 && this.categories.length === 0) {
        this.categories = this.extractCategoriesFromProducts();
        console.log("Categories extracted from products.");
      }
    } catch (error) {
      console.error("Error processing categories:", error);
    }
  }

  /**
   * Extract category information from products
   */
  extractCategoriesFromProducts() {
    if (
      !this.menuItems ||
      !Array.isArray(this.menuItems) ||
      this.menuItems.length === 0
    ) {
      // Add check for array type
      console.warn(
        "Cannot extract categories, menuItems array is empty or not an array."
      );
      return []; // Return empty array if no items to extract from
    }

    const categoryMap = {};

    this.menuItems.forEach((item) => {
      if (!item || !item.category) return; // Add check for item existence

      const categoryId = item.category.toLowerCase().replace(/\s+/g, "-");

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId, // Use the generated ID
          name: item.category,
          count: 1,
        };
      } else {
        categoryMap[categoryId].count++;
      }
    });

    // Add icons after counting is done
    const categoryList = Object.values(categoryMap);
    categoryList.forEach((cat) => {
      cat.icon = this.getCategoryIcon(cat.name);
    });

    console.log("Extracted categories:", categoryList);
    return categoryList;
  }

  /**
   * Get appropriate icon for food category
   */
  getCategoryIcon(category) {
    const categoryLower = category.toLowerCase();

    if (
      categoryLower.includes("appetizer") ||
      categoryLower.includes("starter")
    ) {
      return "fas fa-cheese";
    } else if (
      categoryLower.includes("main") ||
      categoryLower.includes("entree")
    ) {
      return "fas fa-utensils";
    } else if (categoryLower.includes("dessert")) {
      return "fas fa-ice-cream";
    } else if (
      categoryLower.includes("drink") ||
      categoryLower.includes("beverage")
    ) {
      return "fas fa-glass-martini-alt";
    } else if (categoryLower.includes("pizza")) {
      return "fas fa-pizza-slice";
    } else if (categoryLower.includes("burger")) {
      return "fas fa-hamburger";
    } else if (categoryLower.includes("breakfast")) {
      return "fas fa-coffee";
    } else if (categoryLower.includes("salad")) {
      return "fas fa-seedling";
    } else if (categoryLower.includes("special")) {
      return "fas fa-star";
    } else {
      return "fas fa-utensils";
    }
  }

  /**
   * Load fallback data when API fails
   */
  loadFallbackData() {
    // Default menu items if everything else fails
    this.menuItems = [
      {
        id: 1,
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and special sauce",
        price: 9.99,
        image: "https://via.placeholder.com/300x200?text=Classic+Burger",
        category: "Burgers",
        rating: 4.5,
        reviewCount: 120,
        attributes: ["Popular", "Bestseller"],
        tags: ["beef", "classic"],
        nutritionalInfo: {
          calories: 650,
          protein: 35,
          carbs: 42,
          fat: 38,
        },
        allergens: ["gluten", "dairy"],
      },
      {
        id: 2,
        name: "Margherita Pizza",
        description:
          "Classic Italian pizza with tomato sauce, fresh mozzarella, and basil",
        price: 12.99,
        image: "https://via.placeholder.com/300x200?text=Margherita+Pizza",
        category: "Pizza",
        rating: 4.7,
        reviewCount: 98,
        attributes: ["Vegetarian"],
        tags: ["pizza", "italian", "vegetarian"],
        nutritionalInfo: {
          calories: 850,
          protein: 28,
          carbs: 92,
          fat: 32,
        },
        allergens: ["gluten", "dairy"],
      },
      {
        id: 3,
        name: "Caesar Salad",
        description:
          "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
        price: 7.99,
        image: "https://via.placeholder.com/300x200?text=Caesar+Salad",
        category: "Salads",
        rating: 4.3,
        reviewCount: 45,
        attributes: ["Healthy"],
        tags: ["salad", "healthy", "light"],
        nutritionalInfo: {
          calories: 320,
          protein: 12,
          carbs: 15,
          fat: 22,
        },
        allergens: ["gluten", "dairy", "eggs"],
      },
    ];
    console.log("Loaded fallback product data.");
    // Extract categories from fallback menu items
    this.categories = this.extractCategoriesFromProducts();
  }

  /**
   * Get all menu items
   */
  async getAllProducts() {
    await this.ensureInitialized();
    return this.menuItems;
  }

  /**
   * Get all food categories
   */
  async getAllCategories() {
    await this.ensureInitialized();
    // Ensure categories are extracted if somehow missed during init
    if (this.categories.length === 0 && this.menuItems.length > 0) {
      this.categories = this.extractCategoriesFromProducts();
    }
    return this.categories;
  }

  /**
   * Get menu items by category
   */
  async getProductsByCategory(categoryId) {
    await this.ensureInitialized();
    return this.menuItems.filter(
      (item) =>
        item.category &&
        item.category.toLowerCase().replace(/\s+/g, "-") === categoryId
    );
  }

  /**
   * Get popular food items
   */
  async getPopularProducts(limit = 6) {
    await this.ensureInitialized();
    // Add check for empty or non-array menuItems before sorting
    if (
      !this.menuItems ||
      !Array.isArray(this.menuItems) ||
      this.menuItems.length === 0
    ) {
      console.warn(
        "getPopularProducts called but menuItems is empty or not an array."
      );
      return [];
    }
    // Sort by rating and review count to determine popularity
    return [...this.menuItems]
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * (a.reviewCount || 0);
        const scoreB = (b.rating || 0) * (b.reviewCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Get special deals and promotions
   */
  async getSpecialDeals(limit = 3) {
    await this.ensureInitialized();
    if (
      !this.menuItems ||
      !Array.isArray(this.menuItems) ||
      this.menuItems.length === 0
    ) {
      console.warn(
        "getSpecialDeals called but menuItems is empty or not an array."
      );
      return [];
    }
    return this.menuItems
      .filter(
        (item) => item && (item.onSale || item.attributes?.includes("Special"))
      ) // Add item check
      .slice(0, limit);
  }

  /**
   * Get menu item by ID
   */
  async getProductById(id) {
    await this.ensureInitialized();

    // Parse id to number if it's a string
    const productId = typeof id === "string" ? parseInt(id, 10) : id;

    // Find the product
    const product = this.menuItems.find((item) => item.id === productId);

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Search menu items by keyword
   */
  async searchProducts(query, filters = {}) {
    await this.ensureInitialized();

    if (!query && Object.keys(filters).length === 0) {
      return this.menuItems;
    }

    // Convert query to lowercase for case-insensitive search
    const queryLower = query ? query.toLowerCase() : "";

    return this.menuItems.filter((item) => {
      // If there's a search query, check if the item matches
      if (queryLower && !this.itemMatchesQuery(item, queryLower)) {
        return false;
      }

      // Apply additional filters
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.priceMin && item.price < filters.priceMin) {
        return false;
      }

      if (filters.priceMax && item.price > filters.priceMax) {
        return false;
      }

      if (filters.dietary) {
        const itemTags = (item.tags || []).map((tag) => tag.toLowerCase());
        if (
          !filters.dietary.every((diet) =>
            itemTags.includes(diet.toLowerCase())
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Check if a food item matches the search query
   */
  itemMatchesQuery(item, query) {
    // Search in name
    if (item.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search in description
    if (item.description && item.description.toLowerCase().includes(query)) {
      return true;
    }

    // Search in category
    if (item.category && item.category.toLowerCase().includes(query)) {
      return true;
    }

    // Search in tags
    if (
      item.tags &&
      item.tags.some((tag) => tag.toLowerCase().includes(query))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get related menu items to a specific item
   */
  async getRelatedProducts(productId, limit = 4) {
    await this.ensureInitialized();

    // Get the product
    let product;
    try {
      product = await this.getProductById(productId);
    } catch (error) {
      return [];
    }

    // Find products in the same category
    const sameCategoryProducts = this.menuItems
      .filter(
        (item) => item.id !== product.id && item.category === product.category
      )
      .slice(0, limit);

    // If we have enough related products, return them
    if (sameCategoryProducts.length >= limit) {
      return sameCategoryProducts;
    }

    // Otherwise, add some popular products to fill up to the limit
    const remainingCount = limit - sameCategoryProducts.length;
    const popularProducts = await this.getPopularProducts(
      remainingCount + sameCategoryProducts.length
    );

    // Combine and remove duplicates
    const combinedProducts = [...sameCategoryProducts];

    for (const item of popularProducts) {
      if (
        item.id !== product.id &&
        !combinedProducts.some((p) => p.id === item.id)
      ) {
        combinedProducts.push(item);
        if (combinedProducts.length >= limit) {
          break;
        }
      }
    }

    return combinedProducts;
  }

  /**
   * Get recommended products based on categories
   * @param {Array} categories - List of categories to find recommendations from
   * @param {Number} limit - Maximum number of products to return
   * @param {Array} excludeIds - IDs of products to exclude from recommendations
   */
  async getRecommendedProducts(categories = [], limit = 4, excludeIds = []) {
    await this.ensureInitialized();

    // If no categories provided, return popular products
    if (!categories || categories.length === 0) {
      return this.getPopularProducts(limit);
    }

    // Filter out products that match any of the categories
    const categoryMatches = this.menuItems.filter((item) => {
      // Skip products already in cart
      if (excludeIds.includes(item.id)) {
        return false;
      }

      // Include product if its category is in the list of categories
      return categories.includes(item.category);
    });

    // If we have enough products from the same categories, return them
    if (categoryMatches.length >= limit) {
      // Sort by rating for better recommendations
      return categoryMatches
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }

    // Otherwise, fill with popular products
    const remainingCount = limit - categoryMatches.length;
    const popularProducts = await this.getPopularProducts(
      limit + excludeIds.length
    );

    // Filter out excluded IDs and items already in categoryMatches
    const categoryIds = categoryMatches.map((item) => item.id);
    const remainingRecommendations = popularProducts
      .filter(
        (item) =>
          !excludeIds.includes(item.id) && !categoryIds.includes(item.id)
      )
      .slice(0, remainingCount);

    return [...categoryMatches, ...remainingRecommendations];
  }

  /**
   * Get menu item reviews
   */
  async getProductReviews(productId) {
    try {
      // Try to load from DatabaseService
      return await DatabaseService.getProductReviews(productId);
    } catch (error) {
      console.error("Error loading product reviews:", error);
      // Return mock reviews
      return this.getMockReviews(productId);
    }
  }

  /**
   * Get mock reviews for a product when API fails
   */
  getMockReviews(productId) {
    // Generate some mock reviews
    return [
      {
        id: 1,
        productId: productId,
        userId: "user123",
        userName: "FoodLover",
        rating: 5,
        title: "Absolutely delicious!",
        comment: "One of the best meals I've had. The flavors were perfect.",
        date: "2025-03-15T14:22:00Z",
        helpful: 12,
      },
      {
        id: 2,
        productId: productId,
        userId: "user456",
        userName: "RegularCustomer",
        rating: 4,
        title: "Great taste, portion could be larger",
        comment:
          "The food was delicious but I wish the portion was a bit bigger.",
        date: "2025-03-10T09:15:00Z",
        helpful: 5,
      },
      {
        id: 3,
        productId: productId,
        userId: "user789",
        userName: "CriticalEater",
        rating: 3,
        title: "Good but not exceptional",
        comment: "It was fine but nothing special. Delivery was quick though.",
        date: "2025-03-05T18:30:00Z",
        helpful: 2,
      },
    ];
  }

  /**
   * Submit a new review for a menu item
   */
  async submitProductReview(review) {
    try {
      // Try to save to DatabaseService
      return await DatabaseService.addProductReview(review);
    } catch (error) {
      console.error("Error submitting product review:", error);
      // Save to localStorage as fallback
      const reviews = JSON.parse(
        localStorage.getItem("productReviews") || "[]"
      );
      review.id = reviews.length + 1;
      review.date = new Date().toISOString();
      reviews.push(review);
      localStorage.setItem("productReviews", JSON.stringify(reviews));
      return review;
    }
  }

  /**
   * Get dietary restrictions and allergen information
   */
  async getDietaryOptions() {
    return [
      { id: "vegetarian", name: "Vegetarian", icon: "fas fa-leaf" },
      { id: "vegan", name: "Vegan", icon: "fas fa-seedling" },
      { id: "gluten-free", name: "Gluten Free", icon: "fas fa-ban" },
      { id: "dairy-free", name: "Dairy Free", icon: "fas fa-cheese" },
      { id: "nut-free", name: "Nut Free", icon: "fas fa-cookie" },
      { id: "halal", name: "Halal", icon: "fas fa-moon" },
      { id: "kosher", name: "Kosher", icon: "fas fa-star-of-david" },
      { id: "low-carb", name: "Low Carb", icon: "fas fa-bread-slice" },
    ];
  }

  /**
   * Get common allergens to display warnings
   */
  async getAllergenList() {
    return [
      { id: "gluten", name: "Gluten", icon: "fas fa-wheat" },
      { id: "dairy", name: "Dairy", icon: "fas fa-cheese" },
      { id: "nuts", name: "Nuts", icon: "fas fa-seedling" },
      { id: "eggs", name: "Eggs", icon: "fas fa-egg" },
      { id: "soy", name: "Soy", icon: "fas fa-leaf" },
      { id: "fish", name: "Fish", icon: "fas fa-fish" },
      { id: "shellfish", name: "Shellfish", icon: "fas fa-water" },
      { id: "sesame", name: "Sesame", icon: "fas fa-circle" },
    ];
  }

  /**
   * Get nutritional facts for a menu item
   */
  async getNutritionalInfo(productId) {
    try {
      // First try to get from the product itself
      const product = await this.getProductById(productId);

      if (product.nutritionalInfo) {
        return product.nutritionalInfo;
      }

      // Try to load from DatabaseService
      return await DatabaseService.getNutritionalInfo(productId);
    } catch (error) {
      console.error("Error loading nutritional info:", error);
      // Return default nutritional info
      return {
        calories: "Unknown",
        protein: "Unknown",
        carbs: "Unknown",
        fat: "Unknown",
      };
    }
  }

  /**
   * Ensure service is initialized before use
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  /**
   * Utility method for creating delays
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Advanced array manipulation and filtering methods
   */

  // Enhanced filtering with multiple criteria
  filterProductsAdvanced(criteria = {}) {
    let filtered = [...this.menuItems];

    // Text search across multiple fields
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          ...(product.ingredients?.map((ing) => ing.name) || []),
          ...(product.dietaryOptions || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Category filter
    if (criteria.category && criteria.category !== "") {
      filtered = filtered.filter(
        (product) => product.category === criteria.category
      );
    }

    // Price range filter
    if (criteria.priceRange) {
      filtered = filtered.filter((product) => {
        const price = this.getEffectivePrice(product);
        return (
          price >= criteria.priceRange.min && price <= criteria.priceRange.max
        );
      });
    }

    // Rating filter
    if (criteria.minRating && criteria.minRating > 0) {
      filtered = filtered.filter(
        (product) => product.rating >= criteria.minRating
      );
    }

    // Dietary options filter
    if (criteria.dietaryOptions && criteria.dietaryOptions.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.dietaryOptions) return false;
        return criteria.dietaryOptions.every((option) =>
          product.dietaryOptions.includes(option)
        );
      });
    }

    // Preparation time filter
    if (criteria.maxPrepTime) {
      filtered = filtered.filter(
        (product) => product.preparationTime <= criteria.maxPrepTime
      );
    }

    // Availability filter
    if (criteria.availableOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    // Discount filter
    if (criteria.discountOnly) {
      filtered = filtered.filter((product) => product.discount > 0);
    }

    return filtered;
  }

  // Advanced sorting with multiple criteria
  sortProducts(products, sortBy = "name-asc") {
    const sorted = [...products];

    return sorted.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return this.getEffectivePrice(a) - this.getEffectivePrice(b);
        case "price-desc":
          return this.getEffectivePrice(b) - this.getEffectivePrice(a);
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "newest":
          return (b.id || 0) - (a.id || 0);
        case "prep-time":
          return a.preparationTime - b.preparationTime;
        case "discount":
          return b.discount - a.discount;
        default:
          return 0;
      }
    });
  }

  // Group products by various criteria
  groupProductsBy(products, groupBy = "category") {
    const grouped = {};

    products.forEach((product) => {
      let key;

      switch (groupBy) {
        case "category":
          key = product.category || "uncategorized";
          break;
        case "price-range":
          const price = this.getEffectivePrice(product);
          if (price < 10) key = "Under $10";
          else if (price < 20) key = "$10 - $20";
          else if (price < 30) key = "$20 - $30";
          else key = "Over $30";
          break;
        case "rating":
          const rating = Math.floor(product.rating);
          key = `${rating}+ Stars`;
          break;
        case "prep-time":
          if (product.preparationTime <= 15) key = "Quick (≤15 min)";
          else if (product.preparationTime <= 30) key = "Medium (16-30 min)";
          else key = "Slow (>30 min)";
          break;
        case "dietary":
          if (!product.dietaryOptions || product.dietaryOptions.length === 0) {
            key = "Standard";
          } else {
            key = product.dietaryOptions.join(", ");
          }
          break;
        default:
          key = "All Items";
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(product);
    });

    return grouped;
  }

  // Calculate comprehensive statistics
  getProductStatistics(products = this.menuItems) {
    if (!products || products.length === 0) {
      return {
        count: 0,
        priceStats: { min: 0, max: 0, average: 0 },
        ratingStats: { min: 0, max: 0, average: 0 },
        categoryBreakdown: {},
        popularItems: [],
        recentlyAdded: [],
      };
    }

    // Price statistics
    const prices = products.map((p) => this.getEffectivePrice(p));
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };

    // Rating statistics
    const ratings = products.map((p) => p.rating).filter((r) => r != null);
    const ratingStats = {
      min: Math.min(...ratings),
      max: Math.max(...ratings),
      average:
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0,
    };

    // Category breakdown
    const categoryBreakdown = {};
    products.forEach((product) => {
      const category = product.category || "uncategorized";
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Popular items (top 5 by review count)
    const popularItems = [...products]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 5);

    // Recently added items (assuming higher IDs are newer)
    const recentlyAdded = [...products]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);

    return {
      count: products.length,
      priceStats: {
        ...priceStats,
        average: Math.round(priceStats.average * 100) / 100,
      },
      ratingStats: {
        ...ratingStats,
        average: Math.round(ratingStats.average * 100) / 100,
      },
      categoryBreakdown,
      popularItems,
      recentlyAdded,
    };
  }

  // Search with advanced features
  searchProducts(query, options = {}) {
    if (!query || query.trim() === "") {
      return this.menuItems;
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results = [];

    this.menuItems.forEach((product) => {
      let score = 0;
      const searchableContent = {
        name: product.name?.toLowerCase() || "",
        description: product.description?.toLowerCase() || "",
        category: product.category?.toLowerCase() || "",
        ingredients: (product.ingredients || [])
          .map((ing) => ing.name.toLowerCase())
          .join(" "),
        dietary: (product.dietaryOptions || []).join(" ").toLowerCase(),
      };

      // Calculate relevance score
      searchTerms.forEach((term) => {
        // Exact name match gets highest score
        if (searchableContent.name.includes(term)) {
          score += searchableContent.name === term ? 100 : 50;
        }

        // Category match
        if (searchableContent.category.includes(term)) {
          score += 30;
        }

        // Description match
        if (searchableContent.description.includes(term)) {
          score += 20;
        }

        // Ingredients match
        if (searchableContent.ingredients.includes(term)) {
          score += 15;
        }

        // Dietary options match
        if (searchableContent.dietary.includes(term)) {
          score += 10;
        }
      });

      if (score > 0) {
        results.push({ ...product, searchScore: score });
      }
    });

    // Sort by relevance score
    return results
      .sort((a, b) => b.searchScore - a.searchScore)
      .map(({ searchScore, ...product }) => product);
  }

  // Get filtered and paginated products
  getProductPage(criteria = {}) {
    const {
      page = 1,
      pageSize = 12,
      sortBy = "name-asc",
      ...filterCriteria
    } = criteria;

    // Apply filters
    let filtered = this.filterProductsAdvanced(filterCriteria);

    // Apply sorting
    filtered = this.sortProducts(filtered, sortBy);

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: filtered.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, totalItems),
      },
      filters: filterCriteria,
      sorting: sortBy,
    };
  }

  // Array manipulation utilities
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  uniqueByProperty(array, property) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[property];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  intersectArrays(arr1, arr2, compareProperty = null) {
    if (compareProperty) {
      const arr2Values = new Set(arr2.map((item) => item[compareProperty]));
      return arr1.filter((item) => arr2Values.has(item[compareProperty]));
    }
    return arr1.filter((item) => arr2.includes(item));
  }

  differenceArrays(arr1, arr2, compareProperty = null) {
    if (compareProperty) {
      const arr2Values = new Set(arr2.map((item) => item[compareProperty]));
      return arr1.filter((item) => !arr2Values.has(item[compareProperty]));
    }
    return arr1.filter((item) => !arr2.includes(item));
  }

  // Helper method to get effective price (considering discounts)
  getEffectivePrice(product) {
    if (!product || typeof product.price !== "number") return 0;

    if (product.discount && product.discount > 0) {
      return product.price - (product.price * product.discount) / 100;
    }
    return product.price;
  }

  // ...existing code...
}

// Create and expose singleton instance as global variable
window.ProductService = new ProductService();
