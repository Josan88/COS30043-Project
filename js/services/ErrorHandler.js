/**
 * ErrorHandler Service
 * Centralized error handling and logging for better maintainability
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.listeners = [];

    // Error types
    this.ERROR_TYPES = {
      NETWORK: "network",
      VALIDATION: "validation",
      STORAGE: "storage",
      AUTHENTICATION: "authentication",
      BUSINESS_LOGIC: "business_logic",
      UNKNOWN: "unknown",
    };

    // Severity levels
    this.SEVERITY = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      CRITICAL: "critical",
    };

    this.init();
  }
  /**
   * Initialize error handler
   */
  init() {
    // Set up global error handlers
    window.addEventListener("error", this.handleGlobalError.bind(this));
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection.bind(this)
    );

    // Set up Vue error handler if Vue is available
    if (window.app && window.app.config) {
      window.app.config.errorHandler = this.handleVueError.bind(this);
    }

    // Also set up global error handler reference for components
    if (!window.ErrorHandler) {
      window.ErrorHandler = this;
    }
  }

  /**
   * Log an error with context
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   * @param {string} type - Error type
   * @param {string} severity - Error severity
   */
  logError(
    error,
    context = {},
    type = this.ERROR_TYPES.UNKNOWN,
    severity = this.SEVERITY.MEDIUM
  ) {
    const errorEntry = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || error,
      stack: error.stack || null,
      type,
      severity,
      context: this.sanitizeContext(context),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.addToLog(errorEntry);
    this.notifyListeners(errorEntry);

    // Console logging based on severity
    this.consoleLog(errorEntry);

    // Send to external service in production
    if (this.isProduction()) {
      this.sendToExternalService(errorEntry);
    }
  }

  /**
   * Handle global JavaScript errors
   * @param {ErrorEvent} event - Error event
   */
  handleGlobalError(event) {
    this.logError(
      new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      this.ERROR_TYPES.UNKNOWN,
      this.SEVERITY.HIGH
    );
  }

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - Rejection event
   */
  handleUnhandledRejection(event) {
    this.logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { reason: event.reason },
      this.ERROR_TYPES.UNKNOWN,
      this.SEVERITY.HIGH
    );
  }

  /**
   * Handle Vue.js errors
   * @param {Error} error - Vue error
   * @param {Object} instance - Vue instance
   * @param {string} info - Error info
   */
  handleVueError(error, instance, info) {
    this.logError(
      error,
      {
        componentName: instance?.$options?.name || "Unknown",
        errorInfo: info,
      },
      this.ERROR_TYPES.UNKNOWN,
      this.SEVERITY.MEDIUM
    );
  }

  /**
   * Handle network errors
   * @param {Error} error - Network error
   * @param {Object} requestInfo - Request information
   */
  handleNetworkError(error, requestInfo = {}) {
    this.logError(
      error,
      {
        url: requestInfo.url,
        method: requestInfo.method,
        status: requestInfo.status,
        statusText: requestInfo.statusText,
      },
      this.ERROR_TYPES.NETWORK,
      this.SEVERITY.MEDIUM
    );
  }

  /**
   * Handle validation errors
   * @param {string} message - Validation message
   * @param {Object} fieldInfo - Field information
   */
  handleValidationError(message, fieldInfo = {}) {
    this.logError(
      new Error(message),
      fieldInfo,
      this.ERROR_TYPES.VALIDATION,
      this.SEVERITY.LOW
    );
  }

  /**
   * Handle storage errors
   * @param {Error} error - Storage error
   * @param {Object} storageInfo - Storage information
   */
  handleStorageError(error, storageInfo = {}) {
    this.logError(
      error,
      storageInfo,
      this.ERROR_TYPES.STORAGE,
      this.SEVERITY.MEDIUM
    );
  }

  /**
   * Generate unique error ID
   * @returns {string} Error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize context to remove sensitive data
   * @param {Object} context - Context object
   * @returns {Object} Sanitized context
   */
  sanitizeContext(context) {
    const sensitiveKeys = ["password", "token", "apiKey", "secret", "auth"];
    const sanitized = { ...context };

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Add error to log with size management
   * @param {Object} errorEntry - Error entry
   */
  addToLog(errorEntry) {
    this.errorLog.unshift(errorEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * Console logging based on severity
   * @param {Object} errorEntry - Error entry
   */
  consoleLog(errorEntry) {
    const logMessage = `[${errorEntry.severity.toUpperCase()}] ${
      errorEntry.type
    }: ${errorEntry.message}`;

    switch (errorEntry.severity) {
      case this.SEVERITY.CRITICAL:
      case this.SEVERITY.HIGH:
        console.error(logMessage, errorEntry);
        break;
      case this.SEVERITY.MEDIUM:
        console.warn(logMessage, errorEntry);
        break;
      case this.SEVERITY.LOW:
        console.log(logMessage, errorEntry);
        break;
      default:
        console.log(logMessage, errorEntry);
    }
  }

  /**
   * Check if running in production
   * @returns {boolean} Is production
   */
  isProduction() {
    return (
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      !window.location.hostname.includes("test")
    );
  }

  /**
   * Send error to external service (placeholder)
   * @param {Object} errorEntry - Error entry
   */
  sendToExternalService(errorEntry) {
    // Placeholder for external error reporting service
    // e.g., Sentry, LogRocket, etc.
    console.log("Would send to external service:", errorEntry);
  }

  /**
   * Add error listener
   * @param {Function} listener - Error listener function
   */
  addListener(listener) {
    if (typeof listener === "function") {
      this.listeners.push(listener);
    }
  }

  /**
   * Remove error listener
   * @param {Function} listener - Error listener function
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of new error
   * @param {Object} errorEntry - Error entry
   */
  notifyListeners(errorEntry) {
    this.listeners.forEach((listener) => {
      try {
        listener(errorEntry);
      } catch (listenerError) {
        console.error("Error in error listener:", listenerError);
      }
    });
  }

  /**
   * Get error log
   * @param {string} type - Filter by error type
   * @param {string} severity - Filter by severity
   * @returns {Array} Filtered error log
   */
  getErrorLog(type = null, severity = null) {
    let filtered = [...this.errorLog];

    if (type) {
      filtered = filtered.filter((entry) => entry.type === type);
    }

    if (severity) {
      filtered = filtered.filter((entry) => entry.severity === severity);
    }

    return filtered;
  }

  /**
   * Clear error log
   */
  clearLog() {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStatistics() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
    };

    this.errorLog.forEach((entry) => {
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;

      // Count by severity
      stats.bySeverity[entry.severity] =
        (stats.bySeverity[entry.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Create user-friendly error message
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @returns {string} User-friendly message
   */
  createUserMessage(error, context = "") {
    const defaultMessages = {
      [this.ERROR_TYPES.NETWORK]:
        "Connection problem. Please check your internet connection and try again.",
      [this.ERROR_TYPES.VALIDATION]: "Please check your input and try again.",
      [this.ERROR_TYPES.STORAGE]: "Unable to save data. Please try again.",
      [this.ERROR_TYPES.AUTHENTICATION]:
        "Authentication error. Please log in again.",
      [this.ERROR_TYPES.BUSINESS_LOGIC]:
        "Unable to complete the operation. Please try again.",
      [this.ERROR_TYPES.UNKNOWN]: "Something went wrong. Please try again.",
    };

    // Try to determine error type from error message
    let errorType = this.ERROR_TYPES.UNKNOWN;
    const errorMessage = error.message || error || "";

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorType = this.ERROR_TYPES.NETWORK;
    } else if (
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      errorType = this.ERROR_TYPES.VALIDATION;
    } else if (
      errorMessage.includes("storage") ||
      errorMessage.includes("localStorage")
    ) {
      errorType = this.ERROR_TYPES.STORAGE;
    } else if (
      errorMessage.includes("auth") ||
      errorMessage.includes("unauthorized")
    ) {
      errorType = this.ERROR_TYPES.AUTHENTICATION;
    }

    return defaultMessages[errorType];
  }

  /**
   * Generic error handler method for backward compatibility
   * @param {Error|string} error - Error to handle
   * @param {Object} context - Additional context
   * @returns {string} Error ID
   */
  handleError(error, context = {}) {
    const severity = context.severity || this.SEVERITY.MEDIUM;
    const type = context.type || this.ERROR_TYPES.UNKNOWN;

    return this.logError(error, context, type, severity);
  }
}

// Create and expose singleton instance
window.ErrorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ErrorHandler;
}
