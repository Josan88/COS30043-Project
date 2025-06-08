/**
 * ValidationService
 * Centralized validation service for form inputs and data validation
 * Provides reusable validation methods with consistent error messaging
 */
class ValidationService {
  constructor() {
    this.config = {
      // Validation rules from constants
      MIN_PASSWORD_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MIN_PASSWORD_LENGTH || 8,
      MAX_PASSWORD_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MAX_PASSWORD_LENGTH || 128,
      MIN_NAME_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MIN_NAME_LENGTH || 2,
      MAX_NAME_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MAX_NAME_LENGTH || 50,
      MIN_PHONE_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MIN_PHONE_LENGTH || 10,
      MAX_PHONE_LENGTH: window.APP_CONSTANTS?.VALIDATION?.MAX_PHONE_LENGTH || 15
    };

    // Error messages from constants
    this.messages = window.APP_CONSTANTS?.VALIDATION?.MESSAGES || {
      REQUIRED: 'This field is required',
      INVALID_EMAIL: 'Please enter a valid email address',
      INVALID_PHONE: 'Please enter a valid phone number',
      PASSWORD_TOO_SHORT: `Password must be at least ${this.config.MIN_PASSWORD_LENGTH} characters`,
      PASSWORD_TOO_LONG: `Password must not exceed ${this.config.MAX_PASSWORD_LENGTH} characters`,
      PASSWORDS_DONT_MATCH: 'Passwords do not match',
      INVALID_CREDIT_CARD: 'Please enter a valid credit card number',
      INVALID_CVV: 'Please enter a valid CVV',
      INVALID_EXPIRY: 'Please enter a valid expiry date',
      NAME_TOO_SHORT: `Name must be at least ${this.config.MIN_NAME_LENGTH} characters`,
      NAME_TOO_LONG: `Name must not exceed ${this.config.MAX_NAME_LENGTH} characters`,
      INVALID_CHARACTERS: 'Contains invalid characters'
    };

    // Common regex patterns
    this.patterns = {
      EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE: /^[\+]?[1-9][\d]{0,15}$/,
      CREDIT_CARD: /^[0-9]{13,19}$/,
      CVV: /^[0-9]{3,4}$/,
      NAME: /^[a-zA-Z\s\-'\.]+$/,
      PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
      NUMERIC: /^\d+$/
    };
  }

  /**
   * Validate a single field with multiple rules
   * @param {*} value - The value to validate
   * @param {Array} rules - Array of validation rules
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Object} - Validation result with isValid and errors
   */
  validateField(value, rules, fieldName = 'Field') {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Convert value to string for most validations
    const stringValue = value ? String(value).trim() : '';

    for (const rule of rules) {
      const validation = this.applyRule(stringValue, rule, fieldName, value);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(...validation.errors);
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        result.warnings.push(...validation.warnings);
      }
    }

    return result;
  }

  /**
   * Apply a single validation rule
   * @param {string} stringValue - String value to validate
   * @param {Object|string} rule - Validation rule
   * @param {string} fieldName - Field name for error messages
   * @param {*} originalValue - Original value (for type checking)
   * @returns {Object} - Validation result
   */
  applyRule(stringValue, rule, fieldName, originalValue) {
    // Handle string rules (shorthand)
    if (typeof rule === 'string') {
      rule = { type: rule };
    }

    const { type, ...options } = rule;

    switch (type) {
      case 'required':
        return this.validateRequired(stringValue, fieldName);
      
      case 'email':
        return this.validateEmail(stringValue, fieldName);
      
      case 'phone':
        return this.validatePhone(stringValue, fieldName);
      
      case 'password':
        return this.validatePassword(stringValue, fieldName, options);
      
      case 'confirmPassword':
        return this.validateConfirmPassword(stringValue, options.original, fieldName);
      
      case 'name':
        return this.validateName(stringValue, fieldName, options);
      
      case 'creditCard':
        return this.validateCreditCard(stringValue, fieldName);
      
      case 'cvv':
        return this.validateCVV(stringValue, fieldName);
      
      case 'expiry':
        return this.validateExpiry(stringValue, fieldName);
      
      case 'minLength':
        return this.validateMinLength(stringValue, options.length, fieldName);
      
      case 'maxLength':
        return this.validateMaxLength(stringValue, options.length, fieldName);
      
      case 'range':
        return this.validateRange(originalValue, options.min, options.max, fieldName);
      
      case 'pattern':
        return this.validatePattern(stringValue, options.pattern, fieldName, options.message);
      
      case 'numeric':
        return this.validateNumeric(stringValue, fieldName);
      
      case 'alphanumeric':
        return this.validateAlphanumeric(stringValue, fieldName);
      
      case 'custom':
        return this.validateCustom(originalValue, options.validator, fieldName, options.message);
      
      default:
        console.warn(`Unknown validation rule: ${type}`);
        return { isValid: true, errors: [] };
    }
  }

  // Individual validation methods
  validateRequired(value, fieldName) {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [this.messages.REQUIRED.replace('This field', fieldName)]
    };
  }

  validateEmail(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const isValid = this.patterns.EMAIL.test(value);
    return {
      isValid,
      errors: isValid ? [] : [this.messages.INVALID_EMAIL]
    };
  }

  validatePhone(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    // Remove common phone formatting
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    const isValid = this.patterns.PHONE.test(cleanPhone) && 
                   cleanPhone.length >= this.config.MIN_PHONE_LENGTH && 
                   cleanPhone.length <= this.config.MAX_PHONE_LENGTH;
    
    return {
      isValid,
      errors: isValid ? [] : [this.messages.INVALID_PHONE]
    };
  }

  validatePassword(value, fieldName, options = {}) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const errors = [];
    const warnings = [];
    
    // Length validation
    if (value.length < this.config.MIN_PASSWORD_LENGTH) {
      errors.push(this.messages.PASSWORD_TOO_SHORT);
    }
    
    if (value.length > this.config.MAX_PASSWORD_LENGTH) {
      errors.push(this.messages.PASSWORD_TOO_LONG);
    }
    
    // Strength validation (optional)
    if (options.requireStrong && !this.patterns.PASSWORD_STRONG.test(value)) {
      warnings.push('Password should contain uppercase, lowercase, numbers, and special characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateConfirmPassword(value, originalPassword, fieldName) {
    const isValid = value === originalPassword;
    return {
      isValid,
      errors: isValid ? [] : [this.messages.PASSWORDS_DONT_MATCH]
    };
  }

  validateName(value, fieldName, options = {}) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const errors = [];
    
    // Length validation
    if (value.length < this.config.MIN_NAME_LENGTH) {
      errors.push(this.messages.NAME_TOO_SHORT);
    }
    
    if (value.length > this.config.MAX_NAME_LENGTH) {
      errors.push(this.messages.NAME_TOO_LONG);
    }
    
    // Character validation
    if (!this.patterns.NAME.test(value)) {
      errors.push(this.messages.INVALID_CHARACTERS);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCreditCard(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    // Remove spaces and dashes
    const cleanValue = value.replace(/[\s\-]/g, '');
    const isValid = this.patterns.CREDIT_CARD.test(cleanValue) && this.luhnCheck(cleanValue);
    
    return {
      isValid,
      errors: isValid ? [] : [this.messages.INVALID_CREDIT_CARD]
    };
  }

  validateCVV(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const isValid = this.patterns.CVV.test(value);
    return {
      isValid,
      errors: isValid ? [] : [this.messages.INVALID_CVV]
    };
  }

  validateExpiry(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    // Parse MM/YY or MM/YYYY format
    const parts = value.split('/');
    if (parts.length !== 2) {
      return { isValid: false, errors: [this.messages.INVALID_EXPIRY] };
    }
    
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    
    // Validate month
    if (month < 1 || month > 12) {
      return { isValid: false, errors: [this.messages.INVALID_EXPIRY] };
    }
    
    // Convert 2-digit year to 4-digit
    const fullYear = year < 100 ? 2000 + year : year;
    const currentDate = new Date();
    const expiryDate = new Date(fullYear, month - 1);
    
    const isValid = expiryDate > currentDate;
    return {
      isValid,
      errors: isValid ? [] : ['Card has expired']
    };
  }

  validateMinLength(value, minLength, fieldName) {
    const isValid = !value || value.length >= minLength;
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must be at least ${minLength} characters`]
    };
  }

  validateMaxLength(value, maxLength, fieldName) {
    const isValid = !value || value.length <= maxLength;
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must not exceed ${maxLength} characters`]
    };
  }

  validateRange(value, min, max, fieldName) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return { isValid: false, errors: [`${fieldName} must be a number`] };
    }
    
    const isValid = numValue >= min && numValue <= max;
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must be between ${min} and ${max}`]
    };
  }

  validatePattern(value, pattern, fieldName, customMessage) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const isValid = regex.test(value);
    
    return {
      isValid,
      errors: isValid ? [] : [customMessage || `${fieldName} format is invalid`]
    };
  }

  validateNumeric(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const isValid = this.patterns.NUMERIC.test(value);
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must contain only numbers`]
    };
  }

  validateAlphanumeric(value, fieldName) {
    if (!value) return { isValid: true, errors: [] }; // Optional field
    
    const isValid = this.patterns.ALPHANUMERIC.test(value);
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must contain only letters and numbers`]
    };
  }

  validateCustom(value, validator, fieldName, customMessage) {
    try {
      const isValid = validator(value);
      return {
        isValid,
        errors: isValid ? [] : [customMessage || `${fieldName} is invalid`]
      };
    } catch (error) {
      console.error('Custom validator error:', error);
      return {
        isValid: false,
        errors: [`${fieldName} validation failed`]
      };
    }
  }

  /**
   * Validate an entire form object
   * @param {Object} formData - Form data to validate
   * @param {Object} validationRules - Validation rules for each field
   * @returns {Object} - Complete validation result
   */
  validateForm(formData, validationRules) {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      fieldResults: {}
    };

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = formData[fieldName];
      const fieldResult = this.validateField(fieldValue, rules, fieldName);
      
      result.fieldResults[fieldName] = fieldResult;
      
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors[fieldName] = fieldResult.errors;
      }
      
      if (fieldResult.warnings && fieldResult.warnings.length > 0) {
        result.warnings[fieldName] = fieldResult.warnings;
      }
    }

    return result;
  }

  /**
   * Luhn algorithm for credit card validation
   * @param {string} cardNumber - Credit card number
   * @returns {boolean} - Whether the card number is valid
   */
  luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    
    // Process digits from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Sanitize input value
   * @param {string} value - Input value to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized value
   */
  sanitize(value, options = {}) {
    if (!value || typeof value !== 'string') return value;
    
    let sanitized = value;
    
    // Trim whitespace
    if (options.trim !== false) {
      sanitized = sanitized.trim();
    }
    
    // Remove HTML tags
    if (options.stripHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Remove special characters
    if (options.alphanumericOnly) {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    // Convert to lowercase
    if (options.toLowerCase) {
      sanitized = sanitized.toLowerCase();
    }
    
    return sanitized;
  }

  /**
   * Format error messages for display
   * @param {Object} errors - Errors object from validation
   * @returns {Array} - Formatted error messages
   */
  formatErrors(errors) {
    const messages = [];
    
    for (const [field, fieldErrors] of Object.entries(errors)) {
      for (const error of fieldErrors) {
        messages.push(`${field}: ${error}`);
      }
    }
    
    return messages;
  }

  /**
   * Set field validation state and UI feedback
   * @param {string} fieldName - Name of the field
   * @param {Object} validationResult - Result from validation
   */
  setFieldValidation(fieldName, validationResult) {
    try {
      // Find the field element
      const fieldElement = document.querySelector(`[name="${fieldName}"], #${fieldName}, .${fieldName}`);
      
      if (!fieldElement) {
        console.warn(`ValidationService: Field element not found for ${fieldName}`);
        return;
      }

      // Remove existing validation classes
      fieldElement.classList.remove('is-valid', 'is-invalid', 'validation-error', 'validation-success');
      
      // Clear existing error messages
      const existingError = fieldElement.parentNode.querySelector('.validation-message, .error-message');
      if (existingError) {
        existingError.remove();
      }

      if (validationResult.isValid) {
        // Field is valid
        fieldElement.classList.add('is-valid', 'validation-success');
      } else {
        // Field has errors
        fieldElement.classList.add('is-invalid', 'validation-error');
        
        // Display error message
        if (validationResult.errors && validationResult.errors.length > 0) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-message error-message text-danger small mt-1';
          errorDiv.textContent = validationResult.errors[0]; // Show first error
          
          // Insert error message after the field
          fieldElement.parentNode.insertBefore(errorDiv, fieldElement.nextSibling);
        }
      }

      // Handle warnings if present
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'validation-message warning-message text-warning small mt-1';
        warningDiv.textContent = validationResult.warnings[0];
        
        fieldElement.parentNode.insertBefore(warningDiv, fieldElement.nextSibling);
      }
    } catch (error) {
      console.error('ValidationService.setFieldValidation error:', error);
    }
  }
}

// Create and expose singleton instance
window.ValidationService = new ValidationService();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationService;
}
