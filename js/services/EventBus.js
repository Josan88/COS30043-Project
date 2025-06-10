/**
 * EventBus Service for Vue 3
 * Replaces the removed global event bus functionality ($on, $off, $emit on root)
 * Provides a simple publish-subscribe pattern for component communication
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.events[event]) return;

    if (callback) {
      // Remove specific callback
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    } else {
      // Remove all callbacks for this event
      delete this.events[event];
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event callback for '${event}':`, error);
      }
    });
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Remove all event listeners
   */
  clear() {
    this.events = {};
  }

  /**
   * Get list of events with listener counts (for debugging)
   */
  getEventStats() {
    const stats = {};
    Object.keys(this.events).forEach((event) => {
      stats[event] = this.events[event].length;
    });
    return stats;
  }
}

// Create global instance
window.EventBus = new EventBus();

// For debugging in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.addEventListener("beforeunload", () => {
    const stats = window.EventBus.getEventStats();
    if (Object.keys(stats).length > 0) {
      console.log("EventBus stats before unload:", stats);
    }
  });
}
