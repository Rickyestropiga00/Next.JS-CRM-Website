/**
 * Shared validation utilities for form inputs
 */
type TFunction = (
  key: string,
  values?: Record<string, string | number>
) => string;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns Validation error message or undefined if valid
 */
export const validateEmail = (
  email: string,
  t: TFunction
): string | undefined => {
  if (!email)
    return t('Validations.required', { field: t('Forms.fields.email') });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return t('Validations.invalidEmail');
  return undefined;
};

/**
 * Validates a phone number
 * @param phone - The phone number to validate
 * @returns Validation error message or undefined if valid
 */
export const validatePhone = (
  phone: string,
  t: TFunction
): string | undefined => {
  if (!phone)
    return t('Validations.required', { field: t('Forms.fields.phone') });
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return t('Validations.invalidPhone');
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
  t: TFunction,
  minLength = 2
): string | undefined => {
  if (!value.trim()) return t('Validations.required', { field: fieldName });
  if (value.trim().length < minLength) {
    return t('Validations.minLength', { field: fieldName, min: minLength });
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
  t: TFunction,
  min = 0,
  max?: number
): string | undefined => {
  if (value <= min)
    return t('Validations.minLength', { field: fieldName, min: min });
  if (max !== undefined && value > max) {
    return t('Validations.maxValue', {
      field: fieldName,
      max: max.toLocaleString(),
    });
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
  t: TFunction,
  fieldName = t('Forms.fields.price'),
  min = 0,
  max = 999999.99
): string | undefined => {
  if (value <= min)
    return t('Validations.greaterThan', { field: fieldName, min: min });
  if (value > max)
    return t('Validations.maxPrice', {
      field: fieldName,
      max: max.toLocaleString(),
    });
  return undefined;
};

/**
 * Helper to check if all validations pass
 * @param errors - Object containing validation errors
 * @returns True if no errors exist
 */
export const isFormValid = (
  errors: Record<string, string | undefined>
): boolean => {
  return Object.values(errors).every((error) => !error);
};
