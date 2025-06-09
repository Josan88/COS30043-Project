/**
 * DatabaseService
 * Provides database functionality using IndexedDB for client-side storage
 * for food ordering application
 */
const DatabaseService = {
  DB_NAME: "foodDeliveryDB",
  DB_VERSION: 2,
  db: null,

  /**
   * Initialize the database
   * @returns {Promise} - Resolves when DB is ready
   */
  init() {
    return new Promise((resolve, reject) => {
      // If already initialized, return immediately
      if (this.db) {
        resolve(this.db);
        return;
      }

      // Open database connection
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      // Handle database creation/upgrade
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create users table if it doesn't exist
        if (!db.objectStoreNames.contains("users")) {
          const usersStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for faster queries
          usersStore.createIndex("email", "email", { unique: true });
          usersStore.createIndex("fullName", ["firstName", "lastName"], {
            unique: false,
          });

          console.log("Users object store created");
        }

        // Create orders table if it doesn't exist
        if (!db.objectStoreNames.contains("orders")) {
          const ordersStore = db.createObjectStore("orders", {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for faster queries
          ordersStore.createIndex("userId", "userId", { unique: false });
          ordersStore.createIndex("orderDate", "orderDate", { unique: false });
          ordersStore.createIndex("status", "status", { unique: false });

          console.log("Orders object store created");
        }

        // Create user addresses store for delivery locations
        if (!db.objectStoreNames.contains("addresses")) {
          const addressesStore = db.createObjectStore("addresses", {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for faster queries
          addressesStore.createIndex("userId", "userId", { unique: false });
          addressesStore.createIndex("isDefault", "isDefault", {
            unique: false,
          });

          console.log("Addresses object store created");
        }

        // Create reviews store
        if (!db.objectStoreNames.contains("reviews")) {
          const reviewsStore = db.createObjectStore("reviews", {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for faster queries
          reviewsStore.createIndex("userId", "userId", { unique: false });
          reviewsStore.createIndex("foodItemId", "foodItemId", {
            unique: false,
          });
          reviewsStore.createIndex("orderId", "orderId", { unique: false });

          console.log("Reviews object store created");
        }
      };

      // Handle success
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("Database initialized successfully");
        resolve(this.db);
      };

      // Handle errors
      request.onerror = (event) => {
        console.error("Database initialization error:", event.target.error);
        reject(event.target.error);
      };
    });
  },

  // User-related methods

  /**
   * Add a new user to the database
   * @param {Object} userData - The user data to add
   * @returns {Promise} - Resolves with the new user ID
   */
  addUser(userData) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        // Start a transaction
        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        // Check if email already exists
        const indexRequest = store.index("email").get(userData.email);

        indexRequest.onsuccess = (event) => {
          if (event.target.result) {
            // Email already exists
            reject(new Error("Email already in use"));
            return;
          }

          // Add user
          const request = store.add(userData);

          request.onsuccess = (event) => {
            const userId = event.target.result;
            resolve(userId);
          };

          request.onerror = (event) => {
            console.error("Error adding user:", event.target.error);
            reject(event.target.error);
          };
        };

        indexRequest.onerror = (event) => {
          console.error("Error checking email:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get a user by email
   * @param {string} email - The email to search for
   * @returns {Promise} - Resolves with the user object or null
   */
  getUserByEmail(email) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const request = store.index("email").get(email);

        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };

        request.onerror = (event) => {
          console.error("Error getting user by email:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get a user by ID
   * @param {number} id - The user ID
   * @returns {Promise} - Resolves with the user object or null
   */
  getUserById(id) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const request = store.get(id);

        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };

        request.onerror = (event) => {
          console.error("Error getting user by ID:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Update a user
   * @param {Object} userData - The updated user data
   * @returns {Promise} - Resolves when update is complete
   */
  updateUser(userData) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        // Get current user first to verify it exists
        const getRequest = store.get(userData.id);

        getRequest.onsuccess = (event) => {
          const existingUser = event.target.result;
          if (!existingUser) {
            reject(new Error("User not found"));
            return;
          }

          // Merge existing data with updates
          const updatedUser = { ...existingUser, ...userData };

          // Put the updated user
          const updateRequest = store.put(updatedUser);

          updateRequest.onsuccess = () => {
            resolve(updatedUser);
          };

          updateRequest.onerror = (event) => {
            console.error("Error updating user:", event.target.error);
            reject(event.target.error);
          };
        };

        getRequest.onerror = (event) => {
          console.error("Error getting user for update:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Delete a user by ID
   * @param {number} id - The user ID to delete
   * @returns {Promise} - Resolves when delete is complete
   */
  deleteUser(id) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error("Error deleting user:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get all users
   * @returns {Promise} - Resolves with an array of all users
   */
  getAllUsers() {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const request = store.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error("Error getting all users:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  // Order-related methods

  /**
   * Add a new order to the database
   * @param {Object} orderData - The order data to add
   * @returns {Promise} - Resolves with the new order ID
   */
  addOrder(orderData) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        // Start a transaction
        const transaction = db.transaction(["orders"], "readwrite");
        const store = transaction.objectStore("orders");

        // Add order date if not provided
        if (!orderData.orderDate) {
          orderData.orderDate = new Date().toISOString();
        }

        // Set initial status if not provided
        if (!orderData.status) {
          orderData.status = "pending";
        }

        // Add the order
        const request = store.add(orderData);

        request.onsuccess = (event) => {
          const orderId = event.target.result;
          resolve(orderId);
        };

        request.onerror = (event) => {
          console.error("Error adding order:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get an order by ID
   * @param {number} id - The order ID
   * @returns {Promise} - Resolves with the order object or null
   */
  getOrderById(id) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["orders"], "readonly");
        const store = transaction.objectStore("orders");
        const request = store.get(id);

        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };

        request.onerror = (event) => {
          console.error("Error getting order by ID:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get all orders for a user
   * @param {number} userId - The user ID
   * @returns {Promise} - Resolves with an array of the user's orders
   */
  getUserOrders(userId) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["orders"], "readonly");
        const store = transaction.objectStore("orders");
        const index = store.index("userId");
        const request = index.getAll(userId);

        request.onsuccess = (event) => {
          const orders = event.target.result || [];
          // Sort orders by date (newest first)
          orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          resolve(orders);
        };

        request.onerror = (event) => {
          console.error("Error getting user orders:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Update an order's status
   * @param {number} orderId - The order ID to update
   * @param {string} status - The new status ('pending', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled')
   * @returns {Promise} - Resolves when update is complete
   */
  updateOrderStatus(orderId, status) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["orders"], "readwrite");
        const store = transaction.objectStore("orders");

        // Get current order first
        const getRequest = store.get(orderId);

        getRequest.onsuccess = (event) => {
          const order = event.target.result;
          if (!order) {
            reject(new Error("Order not found"));
            return;
          }

          // Update status
          order.status = status;
          order.statusUpdateTime = new Date().toISOString();

          // Put the updated order
          const updateRequest = store.put(order);

          updateRequest.onsuccess = () => {
            resolve(order);
          };

          updateRequest.onerror = (event) => {
            console.error("Error updating order status:", event.target.error);
            reject(event.target.error);
          };
        };

        getRequest.onerror = (event) => {
          console.error("Error getting order for update:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  // Address-related methods

  /**
   * Add a new address for a user
   * @param {Object} addressData - The address data to add
   * @returns {Promise} - Resolves with the new address ID
   */
  addAddress(addressData) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["addresses"], "readwrite");
        const store = transaction.objectStore("addresses");

        // If this is set as default, unset any existing default
        if (addressData.isDefault) {
          const index = store.index("userId");
          const request = index.getAll(addressData.userId);

          request.onsuccess = (event) => {
            const addresses = event.target.result || [];
            const defaultAddresses = addresses.filter((addr) => addr.isDefault);

            if (defaultAddresses.length > 0) {
              // Create a new transaction for updating the existing addresses
              const updateTx = db.transaction(["addresses"], "readwrite");
              const updateStore = updateTx.objectStore("addresses");

              defaultAddresses.forEach((addr) => {
                addr.isDefault = false;
                updateStore.put(addr);
              });
            }

            // Now add the new address
            const addRequest = store.add(addressData);

            addRequest.onsuccess = (event) => {
              const addressId = event.target.result;
              resolve(addressId);
            };

            addRequest.onerror = (event) => {
              console.error("Error adding address:", event.target.error);
              reject(event.target.error);
            };
          };

          request.onerror = (event) => {
            console.error("Error getting user addresses:", event.target.error);
            reject(event.target.error);
          };
        } else {
          // If not default, just add it
          const addRequest = store.add(addressData);

          addRequest.onsuccess = (event) => {
            const addressId = event.target.result;
            resolve(addressId);
          };

          addRequest.onerror = (event) => {
            console.error("Error adding address:", event.target.error);
            reject(event.target.error);
          };
        }
      });
    });
  },

  /**
   * Get all addresses for a user
   * @param {number} userId - The user ID
   * @returns {Promise} - Resolves with an array of the user's addresses
   */
  getUserAddresses(userId) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["addresses"], "readonly");
        const store = transaction.objectStore("addresses");
        const index = store.index("userId");
        const request = index.getAll(userId);

        request.onsuccess = (event) => {
          const addresses = event.target.result || [];
          resolve(addresses);
        };

        request.onerror = (event) => {
          console.error("Error getting user addresses:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  // Review-related methods

  /**
   * Add a new review for a food item
   * @param {Object} reviewData - The review data to add
   * @returns {Promise} - Resolves with the new review ID
   */
  addReview(reviewData) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        // Start a transaction
        const transaction = db.transaction(["reviews"], "readwrite");
        const store = transaction.objectStore("reviews");

        // Add review date if not provided
        if (!reviewData.reviewDate) {
          reviewData.reviewDate = new Date().toISOString();
        }

        // Add the review
        const request = store.add(reviewData);

        request.onsuccess = (event) => {
          const reviewId = event.target.result;
          resolve(reviewId);
        };

        request.onerror = (event) => {
          console.error("Error adding review:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get all reviews for a food item
   * @param {number} foodItemId - The food item ID
   * @returns {Promise} - Resolves with an array of reviews
   */
  getFoodItemReviews(foodItemId) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["reviews"], "readonly");
        const store = transaction.objectStore("reviews");
        const index = store.index("foodItemId");
        const request = index.getAll(foodItemId);

        request.onsuccess = (event) => {
          const reviews = event.target.result || [];
          // Sort reviews by date (newest first)
          reviews.sort(
            (a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)
          );
          resolve(reviews);
        };

        request.onerror = (event) => {
          console.error("Error getting food item reviews:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },

  /**
   * Get all reviews by a user
   * @param {number} userId - The user ID
   * @returns {Promise} - Resolves with an array of the user's reviews
   */
  getUserReviews(userId) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["reviews"], "readonly");
        const store = transaction.objectStore("reviews");
        const index = store.index("userId");
        const request = index.getAll(userId);

        request.onsuccess = (event) => {
          const reviews = event.target.result || [];
          // Sort reviews by date (newest first)
          reviews.sort(
            (a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)
          );
          resolve(reviews);
        };

        request.onerror = (event) => {
          console.error("Error getting user reviews:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  },
};

// Register DatabaseService as a global variable
window.DatabaseService = DatabaseService;
