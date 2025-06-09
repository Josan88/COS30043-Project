/**
 * Custom Directives
 * A collection of Vue directives to enhance functionality and accessibility
 */

// Directive for click-outside detection
window.app.directive("click-outside", {
  mounted(el, binding) {
    el._clickOutsideHandler = function (event) {
      // Check if the click was outside the element
      if (!(el === event.target || el.contains(event.target))) {
        // Call the method provided in the directive binding
        binding.value(event);
      }
    };
    document.addEventListener("click", el._clickOutsideHandler);
  },
  unmounted(el) {
    // Clean up event listener when component is unmounted
    document.removeEventListener("click", el._clickOutsideHandler);
    delete el._clickOutsideHandler;
  },
});

// Directive to format input as currency
window.app.directive("currency", {
  mounted(el, binding) {
    el._currencyHandler = function () {
      // Get value from input
      let value = el.value.replace(/[^\d.]/g, "");

      // Format as currency
      if (value !== "") {
        const formatter = new Intl.NumberFormat("en-MY", {
          style: "currency",
          currency: "MYR",
          minimumFractionDigits: 2,
        });

        // Format the number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          el.value = formatter.format(numValue);
        }
      }
    };

    // Add event listener
    el.addEventListener("blur", el._currencyHandler);
  },
  unmounted(el) {
    // Clean up event listener
    el.removeEventListener("blur", el._currencyHandler);
    delete el._currencyHandler;
  },
});

// Directive for lazy loading images
window.app.directive("lazy", {
  mounted(el, binding) {
    function loadImage() {
      el.src = binding.value;
    }

    function handleIntersect(entries, observer) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(el);
        }
      });
    }

    // Use Intersection Observer API for lazy loading
    const observer = new IntersectionObserver(handleIntersect);
    observer.observe(el);
  },
});

// Directive for responsive elements based on viewport size
window.app.directive("responsive", {
  mounted(el, binding) {
    el._responsiveHandler = function () {
      const width = window.innerWidth;
      const sizes = binding.value || {};

      // Remove all classes first
      Object.values(sizes).forEach((className) => {
        if (className) el.classList.remove(className);
      });

      // Apply appropriate class based on viewport width
      if (width < 576 && sizes.xs) {
        el.classList.add(sizes.xs);
      } else if (width < 768 && sizes.sm) {
        el.classList.add(sizes.sm);
      } else if (width < 992 && sizes.md) {
        el.classList.add(sizes.md);
      } else if (width < 1200 && sizes.lg) {
        el.classList.add(sizes.lg);
      } else if (sizes.xl) {
        el.classList.add(sizes.xl);
      }
    };

    // Call the handler initially
    el._responsiveHandler();

    // Add resize event listener
    window.addEventListener("resize", el._responsiveHandler);
  },
  unmounted(el) {
    // Clean up event listener
    window.removeEventListener("resize", el._responsiveHandler);
    delete el._responsiveHandler;
  },
});

// Directive for focus management and accessibility
window.app.directive("focus-trap", {
  mounted(el, binding) {
    // Get all focusable elements
    const focusableElements = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    el._focusTrapHandler = function (e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          // If Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          // If Tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }

      // Close on Escape key
      if (
        e.key === "Escape" &&
        binding.value &&
        typeof binding.value === "function"
      ) {
        binding.value();
      }
    };

    el.addEventListener("keydown", el._focusTrapHandler);

    // Auto-focus first element if specified
    if (binding.arg === "auto") {
      setTimeout(() => firstFocusableElement.focus(), 100);
    }
  },
  unmounted(el) {
    if (el._focusTrapHandler) {
      el.removeEventListener("keydown", el._focusTrapHandler);
      delete el._focusTrapHandler;
    }
  },
});

// Directive for enhanced form validation with ARIA
window.app.directive("validate", {
  mounted(el, binding) {
    const config = binding.value || {};

    el._validateHandler = function () {
      const value = el.value.trim();
      let isValid = true;
      let errorMessage = "";

      // Required validation
      if (config.required && !value) {
        isValid = false;
        errorMessage =
          config.requiredMessage ||
          `${config.label || "This field"} is required`;
      }

      // Pattern validation
      if (
        isValid &&
        config.pattern &&
        !new RegExp(config.pattern).test(value)
      ) {
        isValid = false;
        errorMessage = config.patternMessage || "Invalid format";
      }

      // Custom validation function
      if (
        isValid &&
        config.validator &&
        typeof config.validator === "function"
      ) {
        const result = config.validator(value);
        if (result !== true) {
          isValid = false;
          errorMessage = result || "Invalid value";
        }
      }

      // Update ARIA attributes
      el.setAttribute("aria-invalid", !isValid);

      // Update visual feedback
      el.classList.toggle("is-valid", isValid && value);
      el.classList.toggle("is-invalid", !isValid);

      // Update error message element
      if (config.errorElement) {
        const errorEl = document.querySelector(config.errorElement);
        if (errorEl) {
          errorEl.textContent = errorMessage;
          errorEl.style.display = errorMessage ? "block" : "none";
        }
      }

      // Call callback if provided
      if (config.callback && typeof config.callback === "function") {
        config.callback(isValid, errorMessage, value);
      }
    };

    // Add event listeners based on configuration
    const events = config.events || ["blur", "input"];
    events.forEach((event) => {
      el.addEventListener(event, el._validateHandler);
    });

    // Set initial ARIA attributes
    if (config.label) {
      el.setAttribute("aria-label", config.label);
    }
    if (config.describedBy) {
      el.setAttribute("aria-describedby", config.describedBy);
    }
  },
  unmounted(el) {
    if (el._validateHandler) {
      ["blur", "input", "change"].forEach((event) => {
        el.removeEventListener(event, el._validateHandler);
      });
      delete el._validateHandler;
    }
  },
});

// Directive for table accessibility enhancements
window.app.directive("accessible-table", {
  mounted(el, binding) {
    // Add ARIA role if not present
    if (!el.getAttribute("role")) {
      el.setAttribute("role", "table");
    }

    // Add table caption if provided
    if (binding.value && binding.value.caption) {
      let caption = el.querySelector("caption");
      if (!caption) {
        caption = document.createElement("caption");
        el.insertBefore(caption, el.firstChild);
      }
      caption.textContent = binding.value.caption;
      caption.className = "visually-hidden";
    }

    // Enhance header cells
    const headers = el.querySelectorAll("th");
    headers.forEach((th, index) => {
      if (!th.getAttribute("scope")) {
        th.setAttribute("scope", "col");
      }
      if (!th.id) {
        th.id = `header-${Date.now()}-${index}`;
      }
    });

    // Enhance data cells
    const rows = el.querySelectorAll("tbody tr");
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, cellIndex) => {
        const correspondingHeader = headers[cellIndex];
        if (correspondingHeader && correspondingHeader.id) {
          cell.setAttribute("headers", correspondingHeader.id);
        }
      });
    });

    // Add keyboard navigation for sortable tables
    if (binding.value && binding.value.sortable) {
      headers.forEach((th) => {
        th.setAttribute("tabindex", "0");
        th.setAttribute("role", "columnheader button");
        th.style.cursor = "pointer";

        th._sortHandler = function (e) {
          if (
            e.type === "click" ||
            (e.type === "keydown" && (e.key === "Enter" || e.key === " "))
          ) {
            e.preventDefault();
            if (
              binding.value.onSort &&
              typeof binding.value.onSort === "function"
            ) {
              const columnIndex = Array.from(th.parentNode.children).indexOf(
                th
              );
              binding.value.onSort(columnIndex, th);
            }
          }
        };

        th.addEventListener("click", th._sortHandler);
        th.addEventListener("keydown", th._sortHandler);
      });
    }
  },
  unmounted(el) {
    const headers = el.querySelectorAll("th");
    headers.forEach((th) => {
      if (th._sortHandler) {
        th.removeEventListener("click", th._sortHandler);
        th.removeEventListener("keydown", th._sortHandler);
        delete th._sortHandler;
      }
    });
  },
});

// Directive for image loading with accessibility
window.app.directive("accessible-image", {
  mounted(el, binding) {
    const config = binding.value || {};

    // Set proper alt text
    if (config.alt) {
      el.setAttribute("alt", config.alt);
    } else if (!el.getAttribute("alt")) {
      el.setAttribute("alt", ""); // Decorative image
    }

    // Add loading states
    el.style.transition = "opacity 0.3s ease";
    el.style.opacity = "0";

    el._loadHandler = function () {
      el.style.opacity = "1";
      if (config.onLoad && typeof config.onLoad === "function") {
        config.onLoad();
      }
    };

    el._errorHandler = function () {
      // Show fallback image or placeholder
      if (config.fallback) {
        el.src = config.fallback;
      } else {
        el.style.display = "none";

        // Create text alternative
        const textAlt = document.createElement("div");
        textAlt.className =
          "image-placeholder text-center p-3 bg-light border rounded";
        textAlt.textContent = config.altText || "Image unavailable";
        el.parentNode.insertBefore(textAlt, el.nextSibling);
      }

      if (config.onError && typeof config.onError === "function") {
        config.onError();
      }
    };

    el.addEventListener("load", el._loadHandler);
    el.addEventListener("error", el._errorHandler);

    // If image is already loaded
    if (el.complete) {
      el._loadHandler();
    }
  },
  unmounted(el) {
    if (el._loadHandler) {
      el.removeEventListener("load", el._loadHandler);
      delete el._loadHandler;
    }
    if (el._errorHandler) {
      el.removeEventListener("error", el._errorHandler);
      delete el._errorHandler;
    }
  },
});

// Directive for scroll-based animations
window.app.directive("scroll-reveal", {
  mounted(el, binding) {
    const config = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      ...binding.value,
    };

    el.style.opacity = "0";
    el.style.transform = config.transform || "translateY(20px)";
    el.style.transition = `opacity ${
      config.duration || "0.6s"
    } ease, transform ${config.duration || "0.6s"} ease`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";

            if (config.callback && typeof config.callback === "function") {
              config.callback(el);
            }

            if (!config.repeat) {
              observer.unobserve(el);
            }
          } else if (config.repeat) {
            el.style.opacity = "0";
            el.style.transform = config.transform || "translateY(20px)";
          }
        });
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin,
      }
    );

    observer.observe(el);
    el._scrollObserver = observer;
  },
  unmounted(el) {
    if (el._scrollObserver) {
      el._scrollObserver.disconnect();
      delete el._scrollObserver;
    }
  },
});
