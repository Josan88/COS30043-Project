/**
 * Custom Filters
 * A collection of Vue filters to format and transform data
 */

// Format a value as currency
function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }
  const formatter = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    currencyDisplay: "symbol",
  });
  return formatter.format(value);
}

// Format a date string to a more readable format
function formatDate(value) {
  if (!value) return "";

  // Try to parse the date
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  // Format the date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Truncate text to a specific length
function truncate(text, length = 100, suffix = "...") {
  if (!text || typeof text !== "string") return "";

  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length) + suffix;
}

// Format a number with commas
function formatNumber(value) {
  if (typeof value !== "number") {
    return value;
  }
  return value.toLocaleString("en-US");
}

// Convert text to uppercase
function uppercase(value) {
  if (!value || typeof value !== "string") return "";
  return value.toUpperCase();
}

// Convert text to lowercase
function lowercase(value) {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase();
}

// Capitalize first letter of each word
function capitalize(value) {
  if (!value || typeof value !== "string") return "";

  return value.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}

// Format a phone number
function formatPhone(value) {
  if (!value || typeof value !== "string") return "";

  // Remove all non-numeric characters
  const cleaned = ("" + value).replace(/\D/g, "");

  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }

  return value;
}

// Filter an array based on a search term
function filterArray(array, searchTerm, fields) {
  if (!array || !Array.isArray(array) || !searchTerm) {
    return array;
  }

  searchTerm = searchTerm.toLowerCase();

  return array.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm);
      }
      return false;
    });
  });
}

// Advanced array sorting filter
function sortArray(array, field, direction = "asc") {
  if (!array || !Array.isArray(array)) return array;

  return [...array].sort((a, b) => {
    let aVal = field ? a[field] : a;
    let bVal = field ? b[field] : b;

    // Handle nested properties (e.g., 'user.name')
    if (field && field.includes(".")) {
      const fields = field.split(".");
      aVal = fields.reduce((obj, prop) => obj && obj[prop], a);
      bVal = fields.reduce((obj, prop) => obj && obj[prop], b);
    }

    // Handle different data types
    if (typeof aVal === "string" && typeof bVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

// Group array by property
function groupBy(array, property) {
  if (!array || !Array.isArray(array)) return {};

  return array.reduce((groups, item) => {
    let key = property;

    // Handle function grouping
    if (typeof property === "function") {
      key = property(item);
    } else if (typeof property === "string") {
      key = property.includes(".")
        ? property.split(".").reduce((obj, prop) => obj && obj[prop], item)
        : item[property];
    }

    key = key || "undefined";

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);

    return groups;
  }, {});
}

// Calculate statistics for numeric arrays
function calculateStats(array, property) {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return { count: 0, sum: 0, average: 0, min: 0, max: 0 };
  }

  const values = array
    .map((item) => {
      const val = property ? item[property] : item;
      return typeof val === "number" ? val : parseFloat(val) || 0;
    })
    .filter((val) => !isNaN(val));

  if (values.length === 0) {
    return { count: 0, sum: 0, average: 0, min: 0, max: 0 };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    count: values.length,
    sum: Math.round(sum * 100) / 100,
    average: Math.round(average * 100) / 100,
    min,
    max,
  };
}

// Format relative time
function formatRelativeTime(date) {
  if (!date) return "";

  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor((now - inputDate) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Highlight search terms in text
function highlightText(text, searchTerm, className = "highlight") {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

// Format rating stars
function formatStars(rating, maxStars = 5) {
  if (typeof rating !== "number") return "";

  rating = Math.max(0, Math.min(maxStars, rating));
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  let html = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star text-warning"></i>';
  }

  // Half star
  if (hasHalfStar) {
    html += '<i class="fas fa-star-half-alt text-warning"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star text-muted"></i>';
  }

  return html;
}

// Format percentage
function formatPercentage(value, decimals = 1) {
  if (typeof value !== "number") return "0%";
  return (value * 100).toFixed(decimals) + "%";
}

// Pluralize text based on count
function pluralize(count, singular, plural) {
  if (typeof count !== "number") return singular;
  return count === 1 ? singular : plural || singular + "s";
}

// Format address
function formatAddress(address) {
  if (!address || typeof address !== "object") return "";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter((part) => part && part.trim());

  return parts.join(", ");
}

// Export filters for global use
window.Filters = {
  currency: formatCurrency, // Add currency alias
  formatCurrency,
  date: formatDate, // Add date alias
  formatDate,
  truncate,
  number: formatNumber, // Add number alias
  formatNumber,
  uppercase,
  lowercase,
  capitalize,
  phone: formatPhone,
  filterArray,
  sortArray,
  groupBy,
  calculateStats,
  relativeTime: formatRelativeTime,
  highlight: highlightText,
  stars: formatStars,
  percentage: formatPercentage,
  pluralize,
  address: formatAddress,
};

// Immediately register filters if app instance exists
if (window.app && window.app.config && window.app.config.globalProperties) {
  console.log("Registering filters immediately...");
  window.app.config.globalProperties.$filters = window.Filters;

  // Make individual filters available directly
  Object.keys(window.Filters).forEach((filterName) => {
    window.app.config.globalProperties[`$${filterName}`] =
      window.Filters[filterName];
  });

  console.log("Filters registered immediately:", Object.keys(window.Filters));
}
