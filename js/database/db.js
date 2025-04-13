// db.js - Database connection and utilities
// This file provides database functionality for the ShopEase application

// Initialize IndexedDB for client-side storage
const DB_NAME = 'shopease_db';
const DB_VERSION = 2; // Increased version to force schema update

// Database object that will be exported
const Database = {
  db: null,
  
  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }
      
      console.log('Initializing database...');
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      // Create or upgrade database schema
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Database upgrade needed, creating schema...');
        
        // Create users table if it doesn't exist
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'email' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('name', 'name', { unique: false });
          console.log('Users table created');
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database initialized successfully');
        
        // Check if we need to create a default test user
        this.createDefaultUserIfNeeded().then(() => {
          console.log('Default user check completed');
          resolve(this.db);
        }).catch(error => {
          console.error('Error creating default user:', error);
          resolve(this.db); // Still resolve to not block app initialization
        });
      };
      
      request.onerror = (event) => {
        console.error('Database initialization error:', event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  // Create a default test user if no users exist
  async createDefaultUserIfNeeded() {
    try {
      console.log('Checking if we need to create a default user...');
      // Check if users table is empty
      const transaction = this.db.transaction(['users'], 'readwrite'); // Changed to readwrite to allow adding user
      const store = transaction.objectStore('users');
      const countRequest = store.count();
      
      return new Promise((resolve, reject) => {
        countRequest.onsuccess = () => {
          console.log('Current user count:', countRequest.result);
          if (countRequest.result === 0) {
            console.log('No users found, creating default test user');
            
            // Create a default test user
            const defaultUser = {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              avatar: 'https://via.placeholder.com/64x64'
            };
            
            // Add the user directly to avoid circular dependency
            const hashedPassword = this.users.hashPassword(defaultUser.password);
            const secureUser = {
              ...defaultUser,
              password: hashedPassword,
              createdAt: new Date().toISOString()
            };
            
            const addRequest = store.add(secureUser);
            
            addRequest.onsuccess = () => {
              console.log('Default test user created successfully with email:', defaultUser.email);
              const { password, ...userWithoutPassword } = secureUser;
              resolve(userWithoutPassword);
            };
            
            addRequest.onerror = (event) => {
              console.error('Failed to create default user:', event.target.error);
              reject(event.target.error);
            };
          } else {
            console.log('Users already exist, skipping default user creation');
            resolve();
          }
        };
        
        countRequest.onerror = (event) => {
          console.error('Error checking user count:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in createDefaultUserIfNeeded:', error);
      throw error;
    }
  },
  
  // Close the database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  },
  
  // User operations
  users: {
    // Add a new user
    async add(userData) {
      await Database.init();
      
      return new Promise((resolve, reject) => {
        const transaction = Database.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        // Hash the password before storing
        // In a real app, use a proper password hashing library
        const secureUser = { 
          ...userData,
          password: this.hashPassword(userData.password),
          createdAt: new Date().toISOString()
        };
        
        const request = store.add(secureUser);
        
        request.onsuccess = () => {
          console.log('User added successfully:', userData.email);
          // Return user data without the password
          const { password, ...userWithoutPassword } = secureUser;
          resolve(userWithoutPassword);
        };
        
        request.onerror = (event) => {
          console.error('Error adding user:', event.target.error);
          if (event.target.error.name === 'ConstraintError') {
            reject('An account with this email already exists');
          } else {
            reject('Failed to create account: ' + event.target.error);
          }
        };
      });
    },
    
    // Get user by email
    async getByEmail(email) {
      await Database.init();
      
      return new Promise((resolve, reject) => {
        const transaction = Database.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(email);
        
        request.onsuccess = () => {
          if (request.result) {
            console.log('User found:', email);
            // Return user without password
            const { password, ...userWithoutPassword } = request.result;
            resolve(userWithoutPassword);
          } else {
            console.log('User not found:', email);
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error getting user:', event.target.error);
          reject(event.target.error);
        };
      });
    },
    
    // Authenticate user
    async authenticate(email, password) {
      await Database.init();
      
      return new Promise((resolve, reject) => {
        console.log('Attempting to authenticate user:', email);
        const transaction = Database.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(email);
        
        request.onsuccess = () => {
          const user = request.result;
          console.log('Authentication result:', user ? 'User found' : 'User not found');
          
          if (user) {
            const isPasswordValid = this.verifyPassword(password, user.password);
            console.log('Password verification:', isPasswordValid ? 'Success' : 'Failed');
            
            if (isPasswordValid) {
              // Return user without password
              const { password, ...userWithoutPassword } = user;
              resolve(userWithoutPassword);
            } else {
              reject('Invalid email or password');
            }
          } else {
            reject('Invalid email or password');
          }
        };
        
        request.onerror = (event) => {
          console.error('Authentication error:', event.target.error);
          reject(event.target.error);
        };
      });
    },
    
    // Very simple password hashing (for demo purposes only)
    // In a real app, use a proper hashing library like bcrypt
    hashPassword(password) {
      // This is a simple hash for demonstration purposes only 
      // DO NOT use this in production!
      return btoa(password + 'shopease_salt');
    },
    
    // Verify password
    verifyPassword(inputPassword, hashedPassword) {
      return this.hashPassword(inputPassword) === hashedPassword;
    }
  }
};

// Add a global reference
window.ShopEaseDB = Database;

// Initialize the database immediately when this file loads
Database.init().then(() => {
  console.log('Database initialized on page load');
}).catch(err => {
  console.error('Failed to initialize database on page load:', err);
});