/**
 * Location Service
 * Manages restaurant and user location data across the application
 */

class LocationService {
  constructor() {
    this.restaurantLocation = null;
    this.userLocation = null;
    this.listeners = [];
  }

  /**
   * Set restaurant location (assuming user is at the restaurant)
   * @param {Object} location - Location object with latitude, longitude, and address
   */
  setRestaurantLocation(location) {
    this.restaurantLocation = location;
    this.notifyListeners("restaurantLocationUpdated", location);
  }

  /**
   * Get current restaurant location
   * @returns {Object|null} Restaurant location object
   */
  getRestaurantLocation() {
    return this.restaurantLocation;
  }

  /**
   * Get restaurant address from current location
   * @returns {Object|null} Restaurant address object
   */
  getRestaurantAddress() {
    if (this.restaurantLocation && this.restaurantLocation.address) {
      return this.restaurantLocation.address;
    }

    // Fallback to default restaurant address
    return {
      line1: "123 Food Street, Foodville",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50000",
      country: "Malaysia",
    };
  }

  /**
   * Set user location
   * @param {Object} location - Location object with latitude and longitude
   */
  setUserLocation(location) {
    this.userLocation = location;
    this.notifyListeners("userLocationUpdated", location);
  }

  /**
   * Get current user location
   * @returns {Object|null} User location object
   */
  getUserLocation() {
    return this.userLocation;
  }

  /**
   * Detect current location and set both user and restaurant location
   * (assuming user is at the restaurant)
   */
  async detectLocation() {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      this.setDefaultRestaurantLocation();
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Set user location
      this.setUserLocation(locationData);

      // Since user is at restaurant, set restaurant location to same coordinates
      const restaurantLocation = {
        ...locationData,
        address: await this.getAddressFromCoordinates(
          position.coords.latitude,
          position.coords.longitude
        ),
      };

      this.setRestaurantLocation(restaurantLocation);

      console.log("Location detected (user at restaurant):", locationData);
      console.log("Restaurant location set to:", restaurantLocation);

      return restaurantLocation;
    } catch (error) {
      console.warn("Location detection failed:", error);
      this.setDefaultRestaurantLocation();
      throw error;
    }
  }

  /**
   * Get current position using geolocation API
   * @returns {Promise} Position object
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000, // 10 minutes
      });
    });
  }

  /**
   * Set default restaurant location when geolocation fails
   */
  setDefaultRestaurantLocation() {
    const defaultLocation = {
      latitude: 3.139, // Kuala Lumpur coordinates
      longitude: 101.6869,
      address: {
        line1: "123 Food Street, Foodville",
        city: "Kuala Lumpur",
        state: "Kuala Lumpur",
        postcode: "50000",
        country: "Malaysia",
      },
    };

    this.setRestaurantLocation(defaultLocation);
    console.log("Using default restaurant location:", defaultLocation);
  }
  /**
   * Update restaurant address based on coordinates
   * Uses intelligent location mapping for Malaysian coordinates
   */
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      // Determine location based on coordinates (Malaysia-focused)
      const locationInfo = this.getLocationInfoFromCoordinates(
        latitude,
        longitude
      );

      return {
        line1: `FoodNow Restaurant, ${locationInfo.area}`,
        city: locationInfo.city,
        state: locationInfo.state,
        postcode: locationInfo.postcode,
        country: "Malaysia",
      };
    } catch (error) {
      console.warn("Failed to get address from coordinates:", error);
      // Return default address on error
      return {
        line1: "123 Food Street, Foodville",
        city: "Kuala Lumpur",
        state: "Kuala Lumpur",
        postcode: "50000",
        country: "Malaysia",
      };
    }
  }

  /**
   * Get location information based on Malaysian coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} Location information
   */
  getLocationInfoFromCoordinates(latitude, longitude) {
    // Kuching, Sarawak area (where your coordinates 1.5273, 110.3703 are located)
    if (
      latitude >= 1.4 &&
      latitude <= 1.7 &&
      longitude >= 110.2 &&
      longitude <= 110.5
    ) {
      return {
        area: "Jalan Padungan",
        city: "Kuching",
        state: "Sarawak",
        postcode: "93100",
      };
    }

    // Kuala Lumpur area
    if (
      latitude >= 3.0 &&
      latitude <= 3.3 &&
      longitude >= 101.5 &&
      longitude <= 101.8
    ) {
      return {
        area: "Bukit Bintang",
        city: "Kuala Lumpur",
        state: "Kuala Lumpur",
        postcode: "50200",
      };
    }

    // Petaling Jaya area
    if (
      latitude >= 3.0 &&
      latitude <= 3.2 &&
      longitude >= 101.5 &&
      longitude <= 101.7
    ) {
      return {
        area: "SS2",
        city: "Petaling Jaya",
        state: "Selangor",
        postcode: "47300",
      };
    }

    // Johor Bahru area
    if (
      latitude >= 1.4 &&
      latitude <= 1.6 &&
      longitude >= 103.6 &&
      longitude <= 103.9
    ) {
      return {
        area: "City Square",
        city: "Johor Bahru",
        state: "Johor",
        postcode: "80000",
      };
    }

    // Penang area
    if (
      latitude >= 5.3 &&
      latitude <= 5.5 &&
      longitude >= 100.2 &&
      longitude <= 100.4
    ) {
      return {
        area: "Georgetown",
        city: "George Town",
        state: "Penang",
        postcode: "10200",
      };
    }

    // Default fallback for other areas
    return {
      area: "Food Court Area",
      city: "Current Location",
      state: "Malaysia",
      postcode: "00000",
    };
  }

  /**
   * Add listener for location updates
   * @param {Function} callback - Callback function to call on updates
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   * @param {Function} callback - Callback function to remove
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  /**
   * Notify all listeners of location updates
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        console.warn("Error calling location listener:", error);
      }
    });
  }

  /**
   * Clear all location data
   */
  clearLocation() {
    this.restaurantLocation = null;
    this.userLocation = null;
    this.notifyListeners("locationCleared", null);
  }
}

// Create singleton instance
window.LocationService = new LocationService();

console.log("LocationService initialized");
