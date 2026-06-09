import { useState } from 'react';

type SubmitOptions<T> = {
  url: string;
  method?: 'POST' | 'PUT';
  buildBody: (formData: T) => any;
  formData?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
  setErrors?: (cb: (prev: any) => any) => void;
};
export const useFormSubmit = <T>() => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    formData: T,
    validateForm: () => boolean,
    options: SubmitOptions<T>
  ) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);
    options.setErrors?.(() => ({}));
    try {
      const body = options.buildBody(formData);
      const isFormData = body instanceof FormData;

      const response = await fetch(options.url, {
        method: options.method || 'POST',
        headers: isFormData
          ? undefined
          : { 'Content-Type': 'application/json' },
        body: isFormData ? body : JSON.stringify(body),
      });
      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error('INVALID_RESPONSE');
      }

      switch (response.status) {
        case 200:
        case 201:
          options.onSuccess?.(data);
          options.onClose?.();
          break;
        case 400:
          if (data.errors && options.setErrors) {
            options.setErrors(() => data.errors);
            return;
          }

          const err = new Error(data.error || 'VALIDATION_ERROR');
          (err as any).field = data.field ?? null;
          throw err;
        default:
          throw new Error('REQUEST_FAILED');
      }
    } catch (error) {
      console.error('Submit error', error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  };
  return { handleSubmit, loading };
};
