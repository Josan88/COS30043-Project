/**
 * DatabaseService
 * Provides database functionality using IndexedDB for client-side storage
 */
const DatabaseService = {
  DB_NAME: 'techWorldDB',
  DB_VERSION: 1,
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
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          
          // Create indexes for faster queries
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('fullName', ['firstName', 'lastName'], { unique: false });
          
          console.log('Users object store created');
        }
      };
      
      // Handle success
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };
      
      // Handle errors
      request.onerror = (event) => {
        console.error('Database initialization error:', event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  /**
   * Add a new user to the database
   * @param {Object} userData - The user data to add
   * @returns {Promise} - Resolves with the new user ID
   */
  addUser(userData) {
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          // Start a transaction
          const transaction = db.transaction(['users'], 'readwrite');
          const store = transaction.objectStore('users');
          
          // Check if email already exists
          const indexRequest = store.index('email').get(userData.email);
          
          indexRequest.onsuccess = (event) => {
            if (event.target.result) {
              // Email already exists
              reject(new Error('Email already in use'));
              return;
            }
            
            // Add user
            const request = store.add(userData);
            
            request.onsuccess = (event) => {
              const userId = event.target.result;
              resolve(userId);
            };
            
            request.onerror = (event) => {
              console.error('Error adding user:', event.target.error);
              reject(event.target.error);
            };
          };
          
          indexRequest.onerror = (event) => {
            console.error('Error checking email:', event.target.error);
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
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['users'], 'readonly');
          const store = transaction.objectStore('users');
          const request = store.index('email').get(email);
          
          request.onsuccess = (event) => {
            resolve(event.target.result || null);
          };
          
          request.onerror = (event) => {
            console.error('Error getting user by email:', event.target.error);
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
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['users'], 'readonly');
          const store = transaction.objectStore('users');
          const request = store.get(id);
          
          request.onsuccess = (event) => {
            resolve(event.target.result || null);
          };
          
          request.onerror = (event) => {
            console.error('Error getting user by ID:', event.target.error);
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
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['users'], 'readwrite');
          const store = transaction.objectStore('users');
          
          // Get current user first to verify it exists
          const getRequest = store.get(userData.id);
          
          getRequest.onsuccess = (event) => {
            const existingUser = event.target.result;
            if (!existingUser) {
              reject(new Error('User not found'));
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
              console.error('Error updating user:', event.target.error);
              reject(event.target.error);
            };
          };
          
          getRequest.onerror = (event) => {
            console.error('Error getting user for update:', event.target.error);
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
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['users'], 'readwrite');
          const store = transaction.objectStore('users');
          const request = store.delete(id);
          
          request.onsuccess = () => {
            resolve(true);
          };
          
          request.onerror = (event) => {
            console.error('Error deleting user:', event.target.error);
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
    return this.init()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['users'], 'readonly');
          const store = transaction.objectStore('users');
          const request = store.getAll();
          
          request.onsuccess = (event) => {
            resolve(event.target.result);
          };
          
          request.onerror = (event) => {
            console.error('Error getting all users:', event.target.error);
            reject(event.target.error);
          };
        });
      });
  }
};