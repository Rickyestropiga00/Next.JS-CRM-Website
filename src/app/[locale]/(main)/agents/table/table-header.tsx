import React, { useMemo } from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { Agent } from '@/types/interface';
import { getId } from '@/utils/helper';
import { useTranslations } from 'next-intl';

interface TableHeaderProps {
  selected: string[];
  paginated: { id: string }[];
  onSelectAll: (checked: boolean) => void;
  sortBy: keyof Agent;
  sortDir: 'asc' | 'desc';
  onSort: (col: keyof Agent) => void;
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

export function AgentsTableHeader({
  selected,
  paginated,
  onSelectAll,
  sortBy,
  sortDir,
  onSort,
}: TableHeaderProps) {
  const t = useTranslations();
  const sortableCols: {
    key: keyof Agent;
    label: string;
    className?: string;
    sortable?: boolean;
  }[] = useMemo(
    () => [
      {
        key: 'id',
        label: t('Agents.table.columns.id'),
        className: 'pl-4 w-[70px]',
        sortable: true,
      },
      {
        key: 'name',
        label: t('Agents.table.columns.name'),
        className: 'w-[150px]',
        sortable: true,
      },
      {
        key: 'email',
        label: t('Agents.table.columns.email'),
        className: 'w-[220px]',
        sortable: true,
      },
      {
        key: 'phone',
        label: t('Agents.table.columns.phone'),
        className: 'w-[120px]',
        sortable: false,
      },
      {
        key: 'role',
        label: t('Agents.table.columns.role'),
        className: 'w-[100px]',
        sortable: false,
      },
      {
        key: 'status',
        label: t('Agents.table.columns.status'),
        className: 'w-[100px]',
        sortable: false,
      },
      {
        key: 'assignedCustomers',
        label: t('Agents.table.columns.assignedCustomers'),
        className: 'w-[180px]',
        sortable: false,
      },
      {
        key: 'createdAt',
        label: t('Agents.table.columns.createdAt'),
        className: 'w-[120px]',
        sortable: true,
      },
      {
        key: 'lastLogin',
        label: t('Agents.table.columns.lastLogin'),
        className: 'w-[120px]',
        sortable: true,
      },
      {
        key: 'notes',
        label: t('Agents.table.columns.notes'),
        className: 'w-[180px]',
        sortable: true,
      },
      {
        key: 'comment',
        label: t('Agents.table.columns.comment'),
        className: 'w-[80px] text-center',
        sortable: false,
      },
    ],
    [t]
  );
  return (
    <TableHeader>
      <TableRow className="bg-sidebar text-secondary-foreground border-b-2 border-border rounded-t-xl [&_th]:bg-sidebar [&_th]:text-secondary-foreground [&_th]:font-semibold [&_th]:border-none">
        <TableHead className="w-8">
          <Checkbox
            className="ml-2"
            checked={
              paginated.every((a) => selected.includes(getId(a))) &&
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
        <TableHead className="w-[80px]">
          {t('Agents.table.columns.actions')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
