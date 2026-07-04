/**
 * Comprehensive validation utilities for forms
 * Handles email, password, payment, shipping, and custom validations
 */

export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return { valid: false, error: 'Email is required' };
    if (!emailRegex.test(value)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
  },

  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
  password: (value) => {
    if (!value) return { valid: false, error: 'Password is required' };
    if (value.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(value)) return { valid: false, error: 'Password must contain uppercase letter' };
    if (!/\d/.test(value)) return { valid: false, error: 'Password must contain number' };
    if (!/[!@#$%^&*]/.test(value)) return { valid: false, error: 'Password must contain special character (!@#$%^&*)' };
    return { valid: true };
  },

  // Password confirmation
  passwordMatch: (password, confirmPassword) => {
    if (!confirmPassword) return { valid: false, error: 'Please confirm password' };
    if (password !== confirmPassword) return { valid: false, error: 'Passwords do not match' };
    return { valid: true };
  },

  // Credit card validation (Luhn algorithm)
  creditCard: (value) => {
    const cardRegex = /^\d{13,19}$/;
    if (!value) return { valid: false, error: 'Card number is required' };
    if (!cardRegex.test(value.replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid card number format' };
    }
    // Luhn algorithm check
    const digits = value.replace(/\D/g, '');
    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    if (sum % 10 !== 0) return { valid: false, error: 'Invalid card number' };
    return { valid: true };
  },

  // CVV validation
  cvv: (value) => {
    if (!value) return { valid: false, error: 'CVV is required' };
    if (!/^\d{3,4}$/.test(value)) return { valid: false, error: 'CVV must be 3-4 digits' };
    return { valid: true };
  },

  // Expiry date validation (MM/YY format)
  expiryDate: (value) => {
    if (!value) return { valid: false, error: 'Expiry date is required' };
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(value)) return { valid: false, error: 'Invalid format (MM/YY)' };
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }
    return { valid: true };
  },

  // Name validation
  name: (value) => {
    if (!value) return { valid: false, error: 'Name is required' };
    if (value.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return { valid: false, error: 'Name contains invalid characters' };
    return { valid: true };
  },

  // Phone number validation
  phone: (value) => {
    if (!value) return { valid: false, error: 'Phone number is required' };
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid phone number format' };
    }
    return { valid: true };
  },

  // Address validation
  address: (value) => {
    if (!value) return { valid: false, error: 'Address is required' };
    if (value.length < 5) return { valid: false, error: 'Address must be at least 5 characters' };
    return { valid: true };
  },

  // City validation
  city: (value) => {
    if (!value) return { valid: false, error: 'City is required' };
    if (value.length < 2) return { valid: false, error: 'City must be at least 2 characters' };
    return { valid: true };
  },

  // Postal code validation (US ZIP format)
  postalCode: (value) => {
    if (!value) return { valid: false, error: 'Postal code is required' };
    if (!/^\d{5}(-\d{4})?$/.test(value)) return { valid: false, error: 'Invalid postal code (use 12345 or 12345-6789)' };
    return { valid: true };
  },

  // Textarea/comment validation
  comment: (value, minLength = 10, maxLength = 1000) => {
    if (!value) return { valid: false, error: 'Comment is required' };
    if (value.length < minLength) return { valid: false, error: `Comment must be at least ${minLength} characters` };
    if (value.length > maxLength) return { valid: false, error: `Comment must not exceed ${maxLength} characters` };
    return { valid: true };
  },

  // Rating validation
  rating: (value) => {
    const rating = parseInt(value);
    if (isNaN(rating)) return { valid: false, error: 'Please select a rating' };
    if (rating < 1 || rating > 5) return { valid: false, error: 'Rating must be between 1 and 5' };
    return { valid: true };
  },

  // URL validation
  url: (value) => {
    if (!value) return { valid: false, error: 'URL is required' };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  },

  // Budget validation
  budget: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: 'Budget must be a number' };
    if (num <= 0) return { valid: false, error: 'Budget must be greater than 0' };
    if (num > 10000000) return { valid: false, error: 'Budget cannot exceed $10,000,000' };
    return { valid: true };
  }
};

/**
 * Form validation wrapper
 * Validates all fields and returns errors map
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const validationRules = schema[field];
    const value = formData[field];
    
    if (Array.isArray(validationRules)) {
      for (const rule of validationRules) {
        const result = rule(value);
        if (!result.valid) {
          errors[field] = result.error;
          break;
        }
      }
    } else {
      const result = validationRules(value);
      if (!result.valid) {
        errors[field] = result.error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Real-time field validation
 * Returns error message or empty string
 */
export const validateField = (fieldName, value, validationFn) => {
  const result = validationFn(value);
  return result.valid ? '' : result.error;
};
