/**
 * Custom Filters
 * A collection of Vue filters to format and transform data
 */

// Format a value as currency
function formatCurrency(value) {
  if (typeof value !== 'number') {
    return value;
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR'
  });
  return formatter.format(value);
}

// Format a date string to a more readable format
function formatDate(value) {
  if (!value) return '';
  
  // Try to parse the date
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  
  // Format the date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Truncate text to a specific length
function truncate(text, length = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length) + suffix;
}

// Format a number with commas
function formatNumber(value) {
  if (typeof value !== 'number') {
    return value;
  }
  return value.toLocaleString('en-US');
}

// Convert text to uppercase
function uppercase(value) {
  if (!value || typeof value !== 'string') return '';
  return value.toUpperCase();
}

// Convert text to lowercase
function lowercase(value) {
  if (!value || typeof value !== 'string') return '';
  return value.toLowerCase();
}

// Capitalize first letter of each word
function capitalize(value) {
  if (!value || typeof value !== 'string') return '';
  
  return value.replace(/\b\w/g, function(l) {
    return l.toUpperCase();
  });
}

// Format a phone number
function formatPhone(value) {
  if (!value || typeof value !== 'string') return '';
  
  // Remove all non-numeric characters
  const cleaned = ('' + value).replace(/\D/g, '');
  
  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return value;
}

// Filter an array based on a search term
function filterArray(array, searchTerm, fields) {
  if (!array || !Array.isArray(array) || !searchTerm) {
    return array;
  }
  
  searchTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm);
      }
      return false;
    });
  });
}

// Register global filters
window.app.config.globalProperties.$filters = {
  currency: formatCurrency,
  date: formatDate,
  truncate: truncate,
  number: formatNumber,
  uppercase: uppercase,
  lowercase: lowercase,
  capitalize: capitalize,
  phone: formatPhone,
  filterArray: filterArray
};