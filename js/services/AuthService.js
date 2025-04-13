/**
 * AuthService
 * Service for handling user authentication, registration, and profile management
 * Uses DatabaseService for persistent storage
 */
const AuthService = {
  // Initialize default user if needed
  async init() {
    try {
      // Check if any users exist
      const users = await DatabaseService.getAllUsers();
      
      // If no users, add a default test user
      if (!users || users.length === 0) {
        const defaultUser = {
          email: 'test@example.com',
          password: 'Password123', // In a real app, this would be hashed
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St, City, Country',
          phone: '555-123-4567',
          createdAt: new Date().toISOString()
        };
        
        await DatabaseService.addUser(defaultUser);
        console.log('Default test user created');
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  },
  
  // Login user
  async login(email, password) {
    try {
      // Find user by email
      const user = await DatabaseService.getUserByEmail(email);
      
      if (user && user.password === password) {
        // Clone user object and remove sensitive data
        const userInfo = { ...user };
        delete userInfo.password;
        
        // In a real app, would generate and return a JWT token
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('isLoggedIn', 'true');
        
        return { success: true, user: userInfo };
      }
      
      return { success: false, message: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  },
  
  // Register new user
  async register(userData) {
    try {
      // Prepare user data with creation timestamp
      const newUserData = {
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      // Add user to database
      const userId = await DatabaseService.addUser(newUserData);
      
      // Get the complete user record
      const newUser = await DatabaseService.getUserById(userId);
      
      // Return success with user info (excluding password)
      const userInfo = { ...newUser };
      delete userInfo.password;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('isLoggedIn', 'true');
      
      return { success: true, user: userInfo };
    } catch (error) {
      // Handle specific errors
      if (error.message === 'Email already in use') {
        return { success: false, message: 'Email already in use' };
      }
      
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    return { success: true };
  },
  
  // Get current user
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  },
  
  // Update user profile
  async updateProfile(userData) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return { success: false, message: 'Not logged in' };
      
      // Update user data (except sensitive fields)
      const updatedUserData = {
        id: currentUser.id,
        firstName: userData.firstName || currentUser.firstName,
        lastName: userData.lastName || currentUser.lastName,
        address: userData.address || currentUser.address,
        phone: userData.phone || currentUser.phone
      };
      
      // Update in database
      const updatedUser = await DatabaseService.updateUser(updatedUserData);
      
      // Update localStorage
      const userInfo = { ...updatedUser };
      delete userInfo.password;
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  },
  
  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return { success: false, message: 'Not logged in' };
      
      // Get full user data including password
      const user = await DatabaseService.getUserById(currentUser.id);
      if (!user) return { success: false, message: 'User not found' };
      
      // Verify current password
      if (user.password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Update password
      const updatedUser = await DatabaseService.updateUser({
        id: user.id,
        password: newPassword
      });
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'An error occurred while updating password' };
    }
  }
};