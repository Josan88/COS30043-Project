/**
 * Custom Directives
 * A collection of Vue directives to enhance functionality and accessibility
 */

// Directive for click-outside detection
window.app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutsideHandler = function(event) {
      // Check if the click was outside the element
      if (!(el === event.target || el.contains(event.target))) {
        // Call the method provided in the directive binding
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutsideHandler);
  },
  unmounted(el) {
    // Clean up event listener when component is unmounted
    document.removeEventListener('click', el._clickOutsideHandler);
    delete el._clickOutsideHandler;
  }
});

// Directive to format input as currency
window.app.directive('currency', {
  mounted(el, binding) {
    el._currencyHandler = function() {
      // Get value from input
      let value = el.value.replace(/[^\d.]/g, '');
      
      // Format as currency
      if (value !== '') {
        const formatter = new Intl.NumberFormat('en-MY', {
          style: 'currency',
          currency: 'MYR',
          minimumFractionDigits: 2
        });
        
        // Format the number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          el.value = formatter.format(numValue);
        }
      }
    };
    
    // Add event listener
    el.addEventListener('blur', el._currencyHandler);
  },
  unmounted(el) {
    // Clean up event listener
    el.removeEventListener('blur', el._currencyHandler);
    delete el._currencyHandler;
  }
});

// Directive for lazy loading images
window.app.directive('lazy', {
  mounted(el, binding) {
    function loadImage() {
      el.src = binding.value;
    }
    
    function handleIntersect(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(el);
        }
      });
    }
    
    // Use Intersection Observer API for lazy loading
    const observer = new IntersectionObserver(handleIntersect);
    observer.observe(el);
  }
});

// Directive for responsive elements based on viewport size
window.app.directive('responsive', {
  mounted(el, binding) {
    el._responsiveHandler = function() {
      const width = window.innerWidth;
      const sizes = binding.value || {};
      
      // Remove all classes first
      Object.values(sizes).forEach(className => {
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
    window.addEventListener('resize', el._responsiveHandler);
  },
  unmounted(el) {
    // Clean up event listener
    window.removeEventListener('resize', el._responsiveHandler);
    delete el._responsiveHandler;
  }
});