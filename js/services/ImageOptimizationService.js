/**
 * Image Optimization Service
 * Handles image optimization for mobile portrait and responsive design
 * Provides lazy loading, format detection, and performance optimizations
 */
class ImageOptimizationService {
  constructor() {
    this.observers = new Map();
    this.loadedImages = new Set();
    this.failedImages = new Set();
    this.webpSupported = this.detectWebpSupport();
    this.isLowBandwidth = this.detectLowBandwidth();

    // Mobile portrait detection
    this.isMobilePortrait = () => {
      return (
        window.innerWidth <= 575 &&
        (window.orientation === 0 ||
          window.orientation === 180 ||
          window.matchMedia("(orientation: portrait)").matches)
      );
    };

    this.init();
  }
  /**
   * Initialize the service
   */
  init() {
    // Set up intersection observer for lazy loading
    this.setupLazyLoading();

    // Listen for orientation and resize changes
    window.addEventListener("resize", this.handleViewportChange.bind(this));
    window.addEventListener(
      "orientationchange",
      this.handleOrientationChange.bind(this)
    );

    // Preload critical images
    this.preloadCriticalImages();

    // Apply consistent image containers
    this.applyImageContainers();

    console.log("ImageOptimizationService initialized", {
      webpSupported: this.webpSupported,
      isLowBandwidth: this.isLowBandwidth,
      isMobilePortrait: this.isMobilePortrait(),
    });
  }

  /**
   * Detect WebP support
   */
  detectWebpSupport() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    try {
      const webpData = canvas.toDataURL("image/webp");
      return webpData.indexOf("image/webp") === 5;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detect low bandwidth connection
   */
  detectLowBandwidth() {
    if ("connection" in navigator) {
      const connection = navigator.connection;
      const slowConnections = ["slow-2g", "2g", "3g"];
      return (
        slowConnections.includes(connection.effectiveType) ||
        connection.downlink < 1.5
      );
    }
    return false;
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupLazyLoading() {
    if (!("IntersectionObserver" in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
      return;
    }

    const options = {
      root: null,
      rootMargin: this.isMobilePortrait() ? "50px" : "100px",
      threshold: 0.1,
    };

    this.lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.lazyLoadObserver.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * Optimize image URL for current device and connection
   */
  optimizeImageUrl(originalUrl, options = {}) {
    if (!originalUrl) return null;

    const {
      width = null,
      height = null,
      quality = "auto",
      format = "auto",
    } = options;

    let optimizedUrl = originalUrl;

    // Mobile portrait optimizations
    if (this.isMobilePortrait()) {
      // Use mobile-specific dimensions
      const mobileWidth = Math.min(width || 400, 400);
      const mobileHeight = height ? Math.min(height, 300) : null;

      // Apply mobile-specific transformations
      optimizedUrl = this.applyMobileTransformations(optimizedUrl, {
        width: mobileWidth,
        height: mobileHeight,
        quality: this.isLowBandwidth ? "low" : "medium",
      });
    }

    // WebP format conversion if supported
    if (this.webpSupported && format === "auto") {
      optimizedUrl = this.convertToWebp(optimizedUrl);
    }

    // Low bandwidth optimizations
    if (this.isLowBandwidth) {
      optimizedUrl = this.applyLowBandwidthOptimizations(optimizedUrl);
    }

    return optimizedUrl;
  }

  /**
   * Apply mobile-specific image transformations
   */
  applyMobileTransformations(url, options) {
    // This would integrate with image CDN services like Cloudinary, ImageKit, etc.
    // For demo purposes, we'll simulate URL transformations

    if (url.includes("placeholder")) {
      return url; // Don't transform placeholder images
    }

    // Simulate CDN transformations
    let transformedUrl = url;

    // Add mobile suffix to filename if available
    transformedUrl = url.replace(/\.(jpg|jpeg|png)$/i, (match, ext) => {
      return `_mobile_${options.width}x${options.height || "auto"}.${ext}`;
    });

    // If transformed URL doesn't exist, fall back to original
    return transformedUrl !== url ? transformedUrl : url;
  }

  /**
   * Convert image to WebP format if supported
   */
  convertToWebp(url) {
    if (!this.webpSupported || url.includes(".webp")) {
      return url;
    }

    // Simulate WebP conversion
    return url.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  }

  /**
   * Apply low bandwidth optimizations
   */
  applyLowBandwidthOptimizations(url) {
    // Reduce quality for low bandwidth connections
    if (url.includes("quality=")) {
      return url.replace(/quality=\d+/, "quality=60");
    }

    // Add quality parameter if URL supports it
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}quality=60&compress=true`;
  }

  /**
   * Load image with optimization
   */
  async loadImage(imgElement) {
    if (!imgElement || this.loadedImages.has(imgElement.src)) {
      return;
    }

    const originalSrc = imgElement.dataset.src || imgElement.src;

    try {
      // Show loading state
      imgElement.classList.add("image-loading");

      // Optimize image URL
      const optimizedSrc = this.optimizeImageUrl(originalSrc, {
        width: imgElement.dataset.width || 400,
        height: imgElement.dataset.height || 300,
      });

      // Preload the image
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully
        imgElement.src = optimizedSrc;
        imgElement.classList.remove("image-loading");
        imgElement.classList.add("image-loaded");
        this.loadedImages.add(optimizedSrc);
      };

      img.onerror = () => {
        // Image failed to load, try fallback
        this.handleImageError(imgElement, originalSrc);
      };

      img.src = optimizedSrc;
    } catch (error) {
      console.error("Error loading image:", error);
      this.handleImageError(imgElement, originalSrc);
    }
  }

  /**
   * Handle image loading errors
   */
  handleImageError(imgElement, originalSrc) {
    this.failedImages.add(originalSrc);
    imgElement.classList.remove("image-loading");
    imgElement.classList.add("image-error");

    // Try fallback image
    const fallbackSrc = this.getFallbackImage(originalSrc);
    if (fallbackSrc !== originalSrc) {
      imgElement.src = fallbackSrc;
    } else {
      // Show placeholder
      this.showImagePlaceholder(imgElement);
    }
  }

  /**
   * Get fallback image based on context
   */
  getFallbackImage(originalSrc) {
    // Determine image category from URL or context
    if (originalSrc.includes("food") || originalSrc.includes("product")) {
      return "/assets/images/placeholder-food.jpg";
    } else if (originalSrc.includes("user") || originalSrc.includes("avatar")) {
      return "/assets/images/placeholder-user.jpg";
    } else if (originalSrc.includes("category")) {
      return "/assets/images/placeholder-category.jpg";
    }

    return "/assets/images/placeholder-default.jpg";
  }
  /**
   * Show image placeholder
   */
  showImagePlaceholder(imgElement) {
    const container = imgElement.closest(
      ".card-image-container, .image-aspect-container, .hero-image-container, .category-image-container"
    );

    if (container) {
      // Create placeholder content for container-based layout
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.innerHTML = `
        <i class="fas fa-image"></i>
        <span>Image unavailable</span>
      `;

      // Hide the image and add placeholder
      imgElement.style.opacity = "0";
      container.appendChild(placeholder);
    } else {
      // Fallback for non-container images
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.style.width = imgElement.offsetWidth + "px";
      placeholder.style.height = imgElement.offsetHeight + "px";
      placeholder.innerHTML = `
        <i class="fas fa-image"></i>
        <span>Image unavailable</span>
      `;

      imgElement.style.display = "none";
      imgElement.parentNode.insertBefore(placeholder, imgElement);
    }
  }

  /**
   * Enable lazy loading for an image
   */
  enableLazyLoading(imgElement) {
    if (!imgElement || !this.lazyLoadObserver) return;

    // Store original src in data attribute
    if (imgElement.src && !imgElement.dataset.src) {
      imgElement.dataset.src = imgElement.src;
      imgElement.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
    }

    // Start observing
    this.lazyLoadObserver.observe(imgElement);
  }

  /**
   * Preload critical images for mobile portrait
   */
  preloadCriticalImages() {
    if (!this.isMobilePortrait()) return;

    // Preload hero images, logos, and above-the-fold images
    const criticalSelectors = [
      ".hero-image",
      ".navbar-brand img",
      ".featured-image",
    ];

    criticalSelectors.forEach((selector) => {
      const images = document.querySelectorAll(selector);
      images.forEach((img) => {
        if (img.src) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = this.optimizeImageUrl(img.src);
          document.head.appendChild(link);
        }
      });
    });
  }

  /**
   * Handle viewport changes
   */
  handleViewportChange() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateImageOptimizations();
    }, 250);
  }

  /**
   * Handle orientation changes
   */
  handleOrientationChange() {
    setTimeout(() => {
      this.updateImageOptimizations();
    }, 500); // Wait for orientation change to complete
  }

  /**
   * Update image optimizations based on current viewport
   */
  updateImageOptimizations() {
    const currentIsMobile = this.isMobilePortrait();

    // Re-optimize images if mobile state changed
    const images = document.querySelectorAll("img[data-optimized]");
    images.forEach((img) => {
      if (img.dataset.mobileOptimized !== currentIsMobile.toString()) {
        this.reoptimizeImage(img);
      }
    });
  }

  /**
   * Re-optimize image for current viewport
   */
  reoptimizeImage(imgElement) {
    const originalSrc = imgElement.dataset.originalSrc || imgElement.src;
    const optimizedSrc = this.optimizeImageUrl(originalSrc);

    if (optimizedSrc !== imgElement.src) {
      imgElement.src = optimizedSrc;
      imgElement.dataset.mobileOptimized = this.isMobilePortrait().toString();
    }
  }

  /**
   * Load all images (fallback for no IntersectionObserver)
   */
  loadAllImages() {
    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img) => this.loadImage(img));
  }
  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      loadedImages: this.loadedImages.size,
      failedImages: this.failedImages.size,
      webpSupported: this.webpSupported,
      isLowBandwidth: this.isLowBandwidth,
      isMobilePortrait: this.isMobilePortrait(),
    };
  }
  /**
   * Apply consistent image containers to improve positioning
   */
  applyImageContainers() {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      const parent = img.parentElement;

      // Skip if already in a proper container
      if (
        parent.classList.contains("card-image-container") ||
        parent.classList.contains("image-aspect-container") ||
        parent.classList.contains("hero-image-container") ||
        parent.classList.contains("category-image-container") ||
        parent.classList.contains("product-thumbnail-container") ||
        parent.classList.contains("avatar-image-container")
      ) {
        return;
      }

      // Skip customer/user images and other special images that should not be affected
      if (
        img.classList.contains("avatar-image") ||
        img.classList.contains("user-avatar") ||
        img.classList.contains("profile-image") ||
        img.classList.contains("customer-image") ||
        img.classList.contains("user-image") ||
        img.classList.contains("navbar-brand") ||
        img.classList.contains("logo") ||
        img.classList.contains("icon") ||
        parent.classList.contains("avatar-circle") ||
        parent.classList.contains("user-avatar") ||
        parent.classList.contains("profile-section") ||
        parent.classList.contains("navbar-brand") ||
        img.closest(".avatar-circle") ||
        img.closest(".user-avatar") ||
        img.closest(".profile-section") ||
        img.closest(".navbar-brand")
      ) {
        return;
      }

      // Only apply containers to food/product related images
      let containerClass = null;

      if (img.classList.contains("hero-image")) {
        containerClass = "hero-image-container";
      } else if (img.classList.contains("category-image")) {
        containerClass = "category-image-container";
      } else if (
        img.classList.contains("food-image") ||
        img.classList.contains("card-img-top") ||
        img.classList.contains("product-image") ||
        img.classList.contains("responsive-image")
      ) {
        containerClass = "card-image-container";
      } else if (img.classList.contains("product-thumbnail")) {
        containerClass = "product-thumbnail-container";
      }

      // Only create container if we determined a specific container type
      if (containerClass) {
        // Create container wrapper
        const container = document.createElement("div");
        container.className = containerClass;

        // Wrap the image
        parent.insertBefore(container, img);
        container.appendChild(img);

        // Ensure image has proper positioning classes
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";
      }
    });
  }
}

// Initialize service
window.ImageOptimizationService = new ImageOptimizationService();
