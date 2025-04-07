// Custom Vue Directives
// These directives add custom behaviors to DOM elements

// Global function to register all directives
function registerDirectives(app) {
  // Click Outside directive
  app.directive('click-outside', {
    mounted(el, binding) {
      el.clickOutsideEvent = function(event) {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event);
        }
      };
      document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
      document.removeEventListener('click', el.clickOutsideEvent);
    }
  });

  // Lazy Load directive
  app.directive('lazy-load', {
    mounted(el, binding) {
      function handleIntersect(entries, observer) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = binding.value;
            observer.unobserve(el);
          }
        });
      }
      
      function createObserver() {
        const options = {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        };
        const observer = new IntersectionObserver(handleIntersect, options);
        observer.observe(el);
      }
      
      // Check if IntersectionObserver is available
      if ('IntersectionObserver' in window) {
        createObserver();
      } else {
        el.src = binding.value; // Fallback for browsers without IntersectionObserver
      }
    }
  });

  // Focus directive
  app.directive('focus', {
    mounted(el) {
      el.focus();
    }
  });

  // Tooltip directive
  app.directive('tooltip', {
    mounted(el, binding) {
      el.setAttribute('title', binding.value);
      el.style.position = 'relative';
    }
  });

  // Format Input directive
  app.directive('format-input', {
    mounted(el, binding) {
      el._formatFunction = function(e) {
        const format = binding.value || 'any';
        let value = e.target.value;
        let formattedValue = value;
        
        switch(format) {
          case 'number':
            formattedValue = value.replace(/[^0-9]/g, '');
            break;
          case 'decimal':
            formattedValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = formattedValue.split('.');
            if (parts.length > 2) {
              formattedValue = parts[0] + '.' + parts.slice(1).join('');
            }
            break;
          case 'alpha':
            formattedValue = value.replace(/[^a-zA-Z ]/g, '');
            break;
          case 'alphanumeric':
            formattedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
            break;
          case 'email':
            // Very basic email format
            formattedValue = value.replace(/[^a-zA-Z0-9@._-]/g, '');
            break;
          case 'phone':
            // Format for US phone number
            formattedValue = value.replace(/[^0-9]/g, '');
            if (formattedValue.length > 10) {
              formattedValue = formattedValue.substring(0, 10);
            }
            if (formattedValue.length >= 6) {
              formattedValue = formattedValue.substring(0, 3) + '-' + 
                              formattedValue.substring(3, 6) + '-' +
                              formattedValue.substring(6);
            } else if (formattedValue.length >= 3) {
              formattedValue = formattedValue.substring(0, 3) + '-' + 
                              formattedValue.substring(3);
            }
            break;
        }
        
        if (value !== formattedValue) {
          e.target.value = formattedValue;
          // Trigger an input event to ensure v-model is updated
          e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      
      el.addEventListener('input', el._formatFunction);
    },
    unmounted(el) {
      el.removeEventListener('input', el._formatFunction);
    }
  });

  // Scroll To directive
  app.directive('scroll-to', {
    mounted(el, binding) {
      el.addEventListener('click', function() {
        const targetEl = document.querySelector(binding.value);
        if (targetEl) {
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
  });

  // Animate Number directive
  app.directive('animate-number', {
    mounted(el, binding) {
      const finalValue = parseFloat(binding.value);
      const duration = binding.arg || 1000;
      const start = 0;
      const increment = finalValue / (duration / 16);
      let current = 0;
      
      function animate() {
        current += increment;
        if (current >= finalValue) {
          el.textContent = finalValue;
        } else {
          el.textContent = Math.floor(current);
          requestAnimationFrame(animate);
        }
      }
      
      animate();
    }
  });

  // Sticky directive
  app.directive('sticky', {
    mounted(el, binding) {
      const offset = binding.value || 0;
      const originalTop = el.getBoundingClientRect().top + window.pageYOffset - offset;
      
      el._stickyScrollHandler = function() {
        if (window.pageYOffset > originalTop) {
          el.classList.add('sticky');
          el.style.position = 'fixed';
          el.style.top = offset + 'px';
          el.style.zIndex = 1000;
          // Add a placeholder to prevent layout shift
          if (!el._placeholder) {
            el._placeholder = document.createElement('div');
            el._placeholder.style.height = el.offsetHeight + 'px';
            el._placeholder.style.width = el.offsetWidth + 'px';
            el._placeholder.style.display = 'none';
            el.parentNode.insertBefore(el._placeholder, el);
          }
          el._placeholder.style.display = 'block';
        } else {
          el.classList.remove('sticky');
          el.style.position = '';
          el.style.top = '';
          el.style.zIndex = '';
          if (el._placeholder) {
            el._placeholder.style.display = 'none';
          }
        }
      };
      
      window.addEventListener('scroll', el._stickyScrollHandler);
      // Initialize
      el._stickyScrollHandler();
    },
    unmounted(el) {
      window.removeEventListener('scroll', el._stickyScrollHandler);
      if (el._placeholder && el._placeholder.parentNode) {
        el._placeholder.parentNode.removeChild(el._placeholder);
      }
    }
  });

  // Mask directive
  app.directive('mask', {
    mounted(el, binding) {
      const maskPattern = binding.value;
      
      el._maskHandler = function(e) {
        const value = e.target.value;
        let result = '';
        let valueIndex = 0;
        
        for (let i = 0; i < maskPattern.length && valueIndex < value.length; i++) {
          const maskChar = maskPattern[i];
          
          if (maskChar === '#') {
            if (/\d/.test(value[valueIndex])) {
              result += value[valueIndex++];
            } else {
              valueIndex++;
              i--;
            }
          } else if (maskChar === 'A') {
            if (/[a-zA-Z]/.test(value[valueIndex])) {
              result += value[valueIndex++];
            } else {
              valueIndex++;
              i--;
            }
          } else if (maskChar === 'N') {
            if (/[a-zA-Z0-9]/.test(value[valueIndex])) {
              result += value[valueIndex++];
            } else {
              valueIndex++;
              i--;
            }
          } else {
            result += maskChar;
            if (value[valueIndex] === maskChar) {
              valueIndex++;
            }
          }
        }
        
        e.target.value = result;
      };
      
      el.addEventListener('input', el._maskHandler);
    },
    unmounted(el) {
      el.removeEventListener('input', el._maskHandler);
    }
  });
}