type TFunction = (
  key: string,
  values?: Record<string, string | number>
) => string;

export const getApiSuccessMessage = (
  messageCode: string,
  t: TFunction,
  type?: string
): string => {
  try {
    return t(`ApiSuccess.${messageCode}`, { type: type ?? '' });
  } catch {
    return messageCode;
  }
};

export const getApiErrorMessage = (error: unknown, t: TFunction): string => {
  try {
    if (error instanceof Error) {
      return t(`ApiErrors.${error.message}`);
    }
    return t('ApiErrors.UNKNOWN');
  } catch {
    return 'Something went wrong.';
  }
};

export const getApiErrorField = (error: unknown): string | null => {
  return (error as any)?.field ?? null;
};
