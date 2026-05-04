import { useEffect, useMemo, useState } from 'react';

type FilterConfig<T> = {
  searchKeys?: (keyof T)[];
  filterKeys?: {
    key: keyof T;
    defaultValue: string;
  }[];
  customFilter?: (item: T, state: Record<string, any>) => boolean;
  skipFilter?: boolean;
};

export function useTableActions<T>({
  data,
  setData,
  getId,
  filtersConfig,
}: {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  getId: (item: T) => string;
  filtersConfig?: FilterConfig<T>;
}) {
  // DYNAMIC FILTER STATE

  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = { search: '' };

    filtersConfig?.filterKeys?.forEach(({ key, defaultValue }) => {
      initial[key as string] = defaultValue;
    });

    return initial;
  });

  // OTHER STATES

  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // FILTERING
  const filtered = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    if (filtersConfig?.skipFilter) {
      return safeData;
    }

    return safeData.filter((item: any) => {
      const search = filters.search || '';

      if (filtersConfig?.customFilter) {
        return filtersConfig.customFilter(item, filters);
      }

      const searchKeys = filtersConfig?.searchKeys ?? [];

      const matchesSearch =
        searchKeys.length === 0
          ? true
          : searchKeys.some((key) => {
              const value = item[key];

              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some((v) =>
                  String(v ?? '')
                    .toLowerCase()
                    .includes(search.toLowerCase())
                );
              }

              return String(value ?? '')
                .toLowerCase()
                .includes(search.toLowerCase());
            });

      const matchesFilters =
        filtersConfig?.filterKeys?.every(({ key }) => {
          const stateValue = filters[key as string];
          if (!stateValue || stateValue === 'all') return true;

          return item[key] === stateValue;
        }) ?? true;

      return matchesSearch && matchesFilters;
    });
  }, [data, filters, filtersConfig]);

  // SORTING

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    return [...filtered].sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortBy, sortDir]);

  // PAGINATION

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, currentPage, rowsPerPage]);

  // ACTIONS

  function handleDelete(id: string) {
    setData((prev) =>
      prev.filter((item: any) => item.id !== id && item._id !== id)
    );
  }

  function handleAdd(newItem: T) {
    setData((prev) => [newItem, ...prev]);
    setCurrentPage(1);
  }

  function handleEdit(updatedItem: T) {
    const id = getId(updatedItem);

    setData((prev) => {
      const updated = prev.map((item) => {
        const itemId = getId(item);

        if (itemId !== id) return item;

        return {
          ...item,
          ...updatedItem,
        };
      });

      return updated;
    });
  }

  function handleSort(col: keyof T) {
    if (sortBy === col) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected((prev) => [
        ...prev.filter((id) => !paginated.some((c) => getId(c) === id)),
        ...paginated.map((c) => getId(c)),
      ]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !paginated.some((c) => getId(c) === id))
      );
    }
  }

  function handleSelectRow(item: T, checked: boolean) {
    const id = getId(item);
    if (!id) return;

    setSelected((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((s) => s !== id)
    );
  }

  return {
    filters,
    setFilters,

    filtered,
    sorted,
    paginated,
    totalPages,

    selected,
    setSelected,
    sortBy,
    sortDir,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,

    handleDelete,
    handleAdd,
    handleEdit,
    handleSort,
    handleSelectAll,
    handleSelectRow,
  };
}
