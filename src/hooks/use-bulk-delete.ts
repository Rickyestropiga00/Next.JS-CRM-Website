import { useState } from 'react';

type BulkDeleteParams<T = any> = {
  endpoint: string;
  type: string;
  onSuccess?: (ids: string[], data: T) => void;
  onError?: (error: unknown) => void;
};

export function useBulkDelete<T>({
  endpoint,
  type,
  onSuccess,
  onError,
}: BulkDeleteParams<T>) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteSelected = async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch(type ? `${endpoint}?type=${type}` : endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      const data: T = await res.json();

      if (!res.ok) {
        throw new Error((data as any)?.message || 'Delete failed');
      }

      onSuccess?.(ids, data);
    } catch (error) {
      console.error(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteSelected,
    loading,
  };
}
