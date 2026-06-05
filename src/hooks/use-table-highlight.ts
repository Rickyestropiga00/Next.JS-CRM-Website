import { useEffect, useMemo, useRef } from 'react';

interface UseTableHighlightProps<T> {
  data: T[];
  highlightId: string | null;
  rowsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isReady: boolean;
  getHighlightValue: (item: T) => string | undefined;
  paginatedData: T[];
}

export function useTableHighlight<T>({
  data,
  highlightId,
  rowsPerPage,
  currentPage,
  setCurrentPage,
  isReady,
  getHighlightValue,
  paginatedData,
}: UseTableHighlightProps<T>) {
  const jumpedForId = useRef<string | null>(null);

  const index = useMemo(() => {
    if (!highlightId) return -1;
    return data.findIndex((item) => getHighlightValue(item) === highlightId);
  }, [data, highlightId, getHighlightValue]);

  const targetPage = useMemo(() => {
    if (index === -1) return currentPage;
    return Math.floor(index / rowsPerPage) + 1;
  }, [index, rowsPerPage, currentPage]);

  useEffect(() => {
    if (!isReady || index === -1) return;
    if (jumpedForId.current === highlightId) return;

    jumpedForId.current = highlightId;
    setCurrentPage(targetPage);
  }, [isReady, index, targetPage, highlightId, setCurrentPage]);

  useEffect(() => {
    if (!highlightId || !isReady) return;

    const timer = setTimeout(() => {
      const el = document.querySelector('[data-highlight="true"]');

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [paginatedData, highlightId, isReady]);

  return {
    isHighlighted: (value: string | undefined) =>
      !!value && value === highlightId,
  };
}
