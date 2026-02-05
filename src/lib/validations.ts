/**
 * Shared validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns Validation error message or undefined if valid
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
};

/**
 * Validates a phone number
 * @param phone - The phone number to validate
 * @returns Validation error message or undefined if valid
 */
export const validatePhone = (phone: string): string | undefined => {
  if (!phone) return "Phone is required";
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
    return "Please enter a valid phone number";
  }
  return undefined;
};

/**
 * Validates a required text field
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @param minLength - Minimum length requirement (default: 2)
 * @returns Validation error message or undefined if valid
 */
export const validateRequired = (
  value: string,
  fieldName: string,
  minLength = 2,
): string | undefined => {
  if (!value.trim()) return `${fieldName} is required`;
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return undefined;
};

/**
 * Validates a numeric field
 * @param value - The number to validate
 * @param fieldName - The name of the field for error messages
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (optional)
 * @returns Validation error message or undefined if valid
 */
export const validateNumber = (
  value: number,
  fieldName: string,
  min = 0,
  max?: number,
): string | undefined => {
  if (value <= min) return `${fieldName} must be greater than ${min}`;
  if (max !== undefined && value > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  return undefined;
};

/**
 * Validates a price/currency field
 * @param value - The price to validate
 * @param fieldName - The name of the field for error messages
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 999999.99)
 * @returns Validation error message or undefined if valid
 */
export const validatePrice = (
  value: number,
  fieldName = "Price",
  min = 0,
  max = 999999.99,
): string | undefined => {
  if (value <= min) return `${fieldName} must be greater than ${min}`;
  if (value > max) return `${fieldName} cannot exceed $${max.toLocaleString()}`;
  return undefined;
};

/**
 * Helper to check if all validations pass
 * @param errors - Object containing validation errors
 * @returns True if no errors exist
 */
export const isFormValid = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).every((error) => !error);
};
