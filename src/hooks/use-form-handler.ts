import { useEffect, useMemo, useState } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string | undefined;
};
type FormErrors<T extends string> = Partial<Record<T | 'general', string>>;
type StringKeys<T> = Extract<keyof T, string>;

export const useFormHandler = <T>(
  initialData: T,
  open: boolean,
  validationRules: ValidationRules<T>,
  onCancel?: () => void
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors<StringKeys<T>>>({});
  // Input Value For Order Module
  const [customerInputValue, setCustomerInputValue] = useState('');
  const [productInputValue, setProductInputValue] = useState('');

  useEffect(() => {
    if (open) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData, open]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleCancel = () => {
    setFormData(initialData);
    setErrors({});
    // Remove value in ComboBox when modal closed
    setCustomerInputValue('');
    setProductInputValue('');
    onCancel?.();
  };

  const validateField = (field: keyof T, value: any) => {
    const rule = validationRules[field];
    return rule ? rule(value) : undefined;
  };

  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error, general: undefined }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    Object.keys(validationRules).forEach((key) => {
      const field = key as keyof T;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return Object.keys(validationRules).every((key) => {
      const field = key as keyof T;
      return !validateField(field, formData[field]);
    });
  };

  return {
    formData,
    setFormData,
    errors,
    handleChange,
    validateForm,
    isFormValid,
    setErrors,
    handleCancel,
    hasChanges,
    // For Order Module
    customerInputValue,
    setCustomerInputValue,
    productInputValue,
    setProductInputValue,
  };
};
