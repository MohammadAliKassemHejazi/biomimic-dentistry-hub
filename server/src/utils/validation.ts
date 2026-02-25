/**
 * Simple validation utility for checking input data integrity and security.
 */

/**
 * Validates if a string is a valid email format.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength.
 * Requirements: Minimum 8 characters.
 */
export const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 8;
};

/**
 * Validates if a value is a non-empty string.
 */
export const isNonEmptyString = (value: any): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates if a value is a string (can be empty).
 */
export const isString = (value: any): boolean => {
  return typeof value === 'string';
};
