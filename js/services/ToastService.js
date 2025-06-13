/**
 * ToastService
 * Centralized service for showing user notifications and feedback messages
 * Provides consistent styling and behavior across the application
 */
class ToastService {
  constructor() {
    this.config = {
      // Default durations from constants
      DEFAULT_DURATION: window.APP_CONSTANTS?.UI?.TOAST_DURATION || 3000,
      SUCCESS_DURATION:
        window.APP_CONSTANTS?.UI?.SUCCESS_TOAST_DURATION || 2000,
      ERROR_DURATION: window.APP_CONSTANTS?.UI?.ERROR_TOAST_DURATION || 5000,
      WARNING_DURATION:
        window.APP_CONSTANTS?.UI?.WARNING_TOAST_DURATION || 4000,
      INFO_DURATION: window.APP_CONSTANTS?.UI?.INFO_TOAST_DURATION || 3000,

      // Maximum number of toasts to show at once
      MAX_TOASTS: window.APP_CONSTANTS?.UI?.MAX_TOASTS || 5,

      // Animation settings
      ANIMATION_DURATION: 300,

      // Position settings
      DEFAULT_POSITION: "top-right",
    };

    // Toast types configuration
    this.types = {
      success: {
        icon: "fas fa-check-circle",
        bgClass: "bg-success",
        textClass: "text-white",
        duration: this.config.SUCCESS_DURATION,
        ariaRole: "status",
      },
      error: {
        icon: "fas fa-exclamation-circle",
        bgClass: "bg-danger",
        textClass: "text-white",
        duration: this.config.ERROR_DURATION,
        ariaRole: "alert",
      },
      warning: {
        icon: "fas fa-exclamation-triangle",
        bgClass: "bg-warning",
        textClass: "text-dark",
        duration: this.config.WARNING_DURATION,
        ariaRole: "alert",
      },
      info: {
        icon: "fas fa-info-circle",
        bgClass: "bg-info",
        textClass: "text-white",
        duration: this.config.INFO_DURATION,
        ariaRole: "status",
      },
    };

    // Active toasts tracking
    this.activeToasts = new Map();
    this.toastCounter = 0;

    // Initialize container
    this.initializeContainer();
  }

  /**
   * Initialize the toast container in DOM
   */
  initializeContainer() {
    // Check if container already exists
    let container = document.getElementById("toast-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "9999";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");

      document.body.appendChild(container);
    }

    this.container = container;
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {Object} options - Additional options
   * @returns {string} - Toast ID for managing the toast
   */
  show(message, type = "info", options = {}) {
    try {
      // Validate parameters
      if (!message || typeof message !== "string") {
        console.error("ToastService: Invalid message provided");
        return null;
      }

      if (!this.types[type]) {
        console.warn(
          `ToastService: Unknown toast type '${type}', using 'info' instead`
        );
        message = type;
        type = "info";
      }

      // Generate unique ID
      const toastId = `toast-${++this.toastCounter}-${Date.now()}`;

      // Merge options with defaults
      const toastConfig = {
        ...this.types[type],
        ...options,
        id: toastId,
        message,
        type,
        timestamp: Date.now(),
      };

      // Limit number of active toasts
      this.enforceToastLimit();

      // Create and show toast
      const toastElement = this.createToastElement(toastConfig);
      this.container.appendChild(toastElement);

      // Store toast reference
      this.activeToasts.set(toastId, {
        element: toastElement,
        config: toastConfig,
        timeoutId: null,
      });

      // Animate in
      this.animateIn(toastElement);

      // Set auto-dismiss timer
      if (toastConfig.duration > 0) {
        this.setAutoDismiss(toastId, toastConfig.duration);
      }

      return toastId;
    } catch (error) {
      console.error("Error showing toast:", error);
      window.ErrorHandler?.logError(error, {
        service: "ToastService",
        method: "show",
        message,
        type,
      });
      return null;
    }
  }

  /**
   * Enforce the maximum number of active toasts
   * Removes oldest toasts if the limit is exceeded
   */
  enforceToastLimit() {
    const activeToasts = this.container.querySelectorAll(".toast.show");
    const maxToasts = window.APP_CONSTANTS?.UI?.MAX_TOASTS || 5;

    if (activeToasts.length >= maxToasts) {
      // Remove oldest toasts (first in DOM)
      const toastsToRemove = Array.from(activeToasts).slice(
        0,
        activeToasts.length - maxToasts + 1
      );
      toastsToRemove.forEach((toast) => {
        this.removeToast(toast.id);
      });
    }
  }

  /**
   * Create the toast DOM element
   * @param {Object} config - Toast configuration
   * @returns {HTMLElement} - Toast element
   */
  createToastElement(config) {
    const toast = document.createElement("div");
    toast.id = config.id;
    toast.className = `toast show ${config.bgClass} ${config.textClass} border-0`;
    toast.setAttribute("role", config.ariaRole);
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.style.minWidth = "300px";
    toast.style.maxWidth = "400px";

    // Create toast content
    toast.innerHTML = `
      <div class="d-flex align-items-center p-3">
        <div class="toast-icon me-3">
          <i class="${config.icon}" style="font-size: 1.2em;"></i>
        </div>
        <div class="toast-body flex-grow-1">
          <div class="fw-bold">${this.escapeHtml(config.message)}</div>
          ${
            config.subtitle
              ? `<div class="small opacity-75">${this.escapeHtml(
                  config.subtitle
                )}</div>`
              : ""
          }
        </div>
        <button 
          type="button" 
          class="btn-close ${
            config.textClass === "text-dark" ? "" : "btn-close-white"
          } ms-2" 
          aria-label="Close notification"
          data-toast-id="${config.id}"
        ></button>
      </div>
    `;

    // Add close event listener
    const closeButton = toast.querySelector(".btn-close");
    closeButton.addEventListener("click", () => {
      this.dismiss(config.id);
    });

    // Add click-to-dismiss functionality
    if (config.clickToDismiss !== false) {
      toast.style.cursor = "pointer";
      toast.addEventListener("click", (e) => {
        if (e.target !== closeButton) {
          this.dismiss(config.id);
        }
      });
    }

    return toast;
  }

  /**
   * Dismiss a specific toast
   * @param {string} toastId - Toast ID to dismiss
   */
  dismiss(toastId) {
    const toastData = this.activeToasts.get(toastId);
    if (!toastData) return;

    try {
      // Clear auto-dismiss timer
      if (toastData.timeoutId) {
        clearTimeout(toastData.timeoutId);
      }

      // Animate out and remove
      this.animateOut(toastData.element, () => {
        if (toastData.element.parentNode) {
          toastData.element.parentNode.removeChild(toastData.element);
        }
        this.activeToasts.delete(toastId);
      });
    } catch (error) {
      console.error("Error dismissing toast:", error);
    }
  }

  /**
   * Dismiss all active toasts
   */
  dismissAll() {
    const toastIds = Array.from(this.activeToasts.keys());
    toastIds.forEach((id) => this.dismiss(id));
  }

  /**
   * Set auto-dismiss timer for a toast
   * @param {string} toastId - Toast ID
   * @param {number} duration - Duration in milliseconds
   */
  setAutoDismiss(toastId, duration) {
    const toastData = this.activeToasts.get(toastId);
    if (!toastData) return;

    toastData.timeoutId = setTimeout(() => {
      this.dismiss(toastId);
    }, duration);
  }

  /**
   * Animate toast in
   * @param {HTMLElement} element - Toast element
   */
  animateIn(element) {
    element.style.opacity = "0";
    element.style.transform = "translateX(100%)";
    element.style.transition = `all ${this.config.ANIMATION_DURATION}ms ease-out`;

    // Force reflow
    element.offsetHeight;

    // Animate in
    element.style.opacity = "1";
    element.style.transform = "translateX(0)";
  }

  /**
   * Animate toast out
   * @param {HTMLElement} element - Toast element
   * @param {Function} callback - Callback after animation
   */
  animateOut(element, callback) {
    element.style.transition = `all ${this.config.ANIMATION_DURATION}ms ease-in`;
    element.style.opacity = "0";
    element.style.transform = "translateX(100%)";

    setTimeout(() => {
      if (callback) callback();
    }, this.config.ANIMATION_DURATION);
  }

  /**
   * Enforce maximum number of toasts
   */
  enforceToastMaximum() {
    if (this.activeToasts.size >= this.config.MAX_TOASTS) {
      // Get oldest toast
      const oldestId = this.activeToasts.keys().next().value;
      this.dismiss(oldestId);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods for different toast types

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  success(message, options = {}) {
    return this.show(message, "success", options);
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  error(message, options = {}) {
    return this.show(message, "error", options);
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  warning(message, options = {}) {
    return this.show(message, "warning", options);
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  info(message, options = {}) {
    return this.show(message, "info", options);
  }

  /**
   * Show loading toast (doesn't auto-dismiss)
   * @param {string} message - Loading message
   * @param {Object} options - Additional options
   */
  loading(message, options = {}) {
    return this.show(message, "info", {
      duration: 0, // Don't auto-dismiss
      icon: "fas fa-spinner fa-spin",
      clickToDismiss: false,
      ...options,
    });
  }

  /**
   * Update an existing toast message
   * @param {string} toastId - Toast ID to update
   * @param {string} newMessage - New message
   * @param {Object} options - Additional options
   */
  update(toastId, newMessage, options = {}) {
    const toastData = this.activeToasts.get(toastId);
    if (!toastData) return false;

    try {
      const messageElement = toastData.element.querySelector(
        ".toast-body .fw-bold"
      );
      if (messageElement) {
        messageElement.textContent = newMessage;

        // Update subtitle if provided
        if (options.subtitle !== undefined) {
          const subtitleElement =
            toastData.element.querySelector(".toast-body .small");
          if (options.subtitle) {
            if (subtitleElement) {
              subtitleElement.textContent = options.subtitle;
            } else {
              // Create subtitle element
              const subtitle = document.createElement("div");
              subtitle.className = "small opacity-75";
              subtitle.textContent = options.subtitle;
              messageElement.parentNode.appendChild(subtitle);
            }
          } else if (subtitleElement) {
            // Remove subtitle
            subtitleElement.remove();
          }
        }

        return true;
      }
    } catch (error) {
      console.error("Error updating toast:", error);
    }

    return false;
  }

  /**
   * Get information about active toasts
   * @returns {Object} - Toast statistics
   */
  getStats() {
    return {
      activeCount: this.activeToasts.size,
      totalCreated: this.toastCounter,
      types: Array.from(this.activeToasts.values()).reduce((acc, toast) => {
        acc[toast.config.type] = (acc[toast.config.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  /**
   * Clean up service
   */
  destroy() {
    this.dismissAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.activeToasts.clear();
  }
}

// Create and expose singleton instance
window.ToastService = new ToastService();
