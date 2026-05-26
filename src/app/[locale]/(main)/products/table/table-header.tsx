import React, { useMemo } from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { Product, UserType } from '@/types/interface';
import { getId } from '@/utils/helper';
import { userAgent } from 'next/server';
import { Can } from '@/components/auth/can';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';

interface TableHeaderProps {
  selected: string[];
  paginated: { id: string }[];
  onSelectAll: (checked: boolean) => void;
  sortBy: keyof Product;
  sortDir: 'asc' | 'desc';
  onSort: (col: keyof Product) => void;
}

function RenderSortableHead({
  col,
  label,
  className,
  sortBy,
  sortDir,
  onSort,
  sortable,
}: any) {
  if (!sortable) {
    return <TableHead className={className}>{label}</TableHead>;
  }
  const isActive = sortBy === col;
  return (
    <TableHead className={className}>
      <span
        className="inline-flex items-center gap-1 group select-none cursor-pointer"
        onClick={() => onSort(col)}
      >
        {label}
        <ArrowUpDown
          className={`h-4 w-4 transition-opacity duration-150 ${
            isActive
              ? 'opacity-100 text-primary'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
          }`}
          style={{
            transform:
              isActive && sortDir === 'desc' ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.15s',
          }}
        />
      </span>
    </TableHead>
  );
}

export function ProductsTableHeader({
  selected,
  paginated,
  onSelectAll,
  sortBy,
  sortDir,
  onSort,
}: TableHeaderProps) {
  const t = useTranslations();
  const sortableCols: {
    key: keyof Product;
    label: string;
    className?: string;
    sortable?: boolean;
  }[] = useMemo(
    () => [
      {
        key: 'id',
        label: t('Products.columns.id'),
        className: 'pl-4 w-[60px]',
        sortable: true,
      },
      {
        key: 'name',
        label: t('Products.columns.name'),
        className: 'w-[200px]',
        sortable: true,
      },
      {
        key: 'code',
        label: t('Products.columns.code'),
        className: 'w-[120px]',
        sortable: true,
      },
      {
        key: 'productType',
        label: t('Products.columns.type'),
        className: 'w-[100px]',
        sortable: false,
      },
      {
        key: 'date',
        label: t('Products.columns.date'),
        className: 'w-[120px]',
        sortable: true,
      },
      {
        key: 'stock',
        label: t('Products.columns.stock'),
        className: 'w-[80px]',
        sortable: true,
      },
      {
        key: 'price',
        label: t('Products.columns.price'),
        className: 'w-[100px]',
        sortable: true,
      },
      {
        key: 'status',
        label: t('Products.columns.status'),
        className: 'w-[120px]',
        sortable: false,
      },
    ],
    [t]
  );
  const { user } = useUser();
  return (
    <TableHeader>
      <TableRow className="bg-sidebar text-secondary-foreground border-b-2 border-border rounded-t-xl [&_th]:bg-sidebar [&_th]:text-secondary-foreground [&_th]:font-semibold [&_th]:border-none">
        <TableHead className="w-8">
          <Checkbox
            className="ml-2"
            checked={
              paginated.every((c) => selected.includes(getId(c))) &&
              paginated.length > 0
            }
            onCheckedChange={(checked: boolean | 'indeterminate') =>
              onSelectAll(!!checked)
            }
            aria-label="Select all"
          />
        </TableHead>
        {sortableCols.map((col) => (
          <RenderSortableHead
            key={col.key}
            col={col.key}
            label={col.label}
            className={col.className}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={onSort}
            sortable={col.sortable}
          />
        ))}
        <Can role={user?.role} action="update" resource="product">
          <TableHead className="w-[70px]">
            {t('Products.columns.actions')}
          </TableHead>
        </Can>
      </TableRow>
    </TableHeader>
  );
}
