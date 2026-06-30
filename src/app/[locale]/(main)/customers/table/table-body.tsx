import React, { useEffect, useRef } from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Pencil, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Customer } from '@/types/interface';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatPhone } from '@/utils/formatters';
import { toast } from 'sonner';
import { getId } from '@/utils/helper';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface TableBodyProps {
  paginated: any[];
  selected: string[];
  onSelectRow: (customer: Customer, checked: boolean) => void;
  onDelete: (id: string) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  setEditCustomerId: (id: string | null) => void;
  onCustomerClick: (id: string) => void;
  setViewOrderCustomerId: (id: string | null) => void;
  customersLoading?: boolean;
  isHighlighted: (value: string) => boolean;
}

export function CustomersTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditCustomerId,
  onCustomerClick,
  setViewOrderCustomerId,
  customersLoading,
  isHighlighted,
}: TableBodyProps) {
  const t = useTranslations();
  const { user } = useUser();

  // Helper function to count comments
  const countComments = (comment: string | undefined): number => {
    if (!comment) return 0;
    // Count occurrences of the comment separator pattern
    const matches = comment.match(/---\n📝 Comment by/g);
    return matches ? matches.length : 0;
  };

  const handleDelete = async (customer: Customer) => {
    if (customer._id) {
      try {
        const res = await fetch(`/api/customers/${customer._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (res.status === 200) {
          onDelete(customer._id);
          setDeleteDialogId(null);
          toast.success(data.message);
        } else {
          toast.error(data.error);
        }
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong');
      }
    } else {
      onDelete(customer.id);
      toast.success(t('Messages.deleteSuccess', { item: 'Customer' }));
      setDeleteDialogId(null);
    }
  };
  if (customersLoading || !user) {
    return <TableSkeleton rows={10} columns={12} />;
  }

  return (
    <TableBody className="pl-5 ">
      {paginated.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={12}
            className="text-center py-6 text-muted-foreground"
          >
            {t('Table.noDataFound', { item: 'Customer' })}
          </TableCell>
        </TableRow>
      ) : (
        paginated.map((c) => {
          const params = new URLSearchParams(window.location.search);
          const highlightedIds = params.get('highlight')?.split(',') ?? [];
          const isHighlighted = highlightedIds.includes(c.customerId);
          return (
            <TableRow
              key={getId(c)}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                isHighlighted ? 'relative bg-primary/10 dark:bg-primary/10' : ''
              } `}
              onClick={(e) => {
                // Don't trigger row click if clicking on checkbox, dropdown, or other interactive elements
                const target = e.target as HTMLElement;
                if (
                  target.closest('input[type="checkbox"]') ||
                  target.closest('[role="menuitem"]') ||
                  target.closest('button')
                ) {
                  return;
                }
                onCustomerClick(getId(c));
              }}
            >
              <TableCell
                className={`w-8 ${
                  isHighlighted &&
                  'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary'
                }`}
              >
                <Checkbox
                  className="ml-2"
                  checked={selected.includes(getId(c))}
                  onCheckedChange={(checked) => onSelectRow(c, !!checked)}
                  aria-label={`Select row for ${c.name}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell className="pl-4 w-[60px] font-mono">
                {c.customerId || c.id}
              </TableCell>
              <TableCell className="w-[150px]">{c.name}</TableCell>
              <TableCell className="w-[200px]">{c.email}</TableCell>
              <TableCell className="w-[120px]">
                {formatPhone(c.phone)}
              </TableCell>
              <TableCell className="w-[120px]">{c.company || '-'}</TableCell>
              <TableCell className="w-[100px]">
                <StatusBadge status={c.status} type="customer" />
              </TableCell>
              <TableCell className="w-[120px]">
                {c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell className="w-[120px]">
                {c.createdAt?.split('T')[0]}
              </TableCell>
              <TableCell className="w-[180px] max-w-[180px]">
                <div className="truncate" title={c.notes || ''}>
                  {c.notes || '-'}
                </div>
              </TableCell>
              <TableCell className="w-[180px] max-w-[180px]">
                <div className="text-center">
                  {(() => {
                    const count = c.comments
                      ? c.comments.length
                      : c.commentsCount ?? 0;
                    return count > 0 ? (
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold"
                      >
                        {count}
                      </Badge>
                    ) : (
                      '-'
                    );
                  })()}
                </div>
              </TableCell>
              <TableCell className="w-[70px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-8 w-8 p-0 flex items-center justify-center"
                      aria-label="Actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditCustomerId(getId(c))}
                    >
                      <Pencil className="h-4 w-4" />
                      {t('Buttons.edit')}
                    </DropdownMenuItem>
                    <AlertDialog
                      open={deleteDialogId === getId(c)}
                      onOpenChange={(open) =>
                        setDeleteDialogId(open ? getId(c) : null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setDeleteDialogId(getId(c));
                          }}
                          className="text-primary focus:text-primary font-semibold"
                        >
                          <Trash className="h-4 w-4 text-primary" />
                          {t('Buttons.delete')}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('ConfirmDelete.singleTitle', {
                              item: 'Customer',
                            })}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('ConfirmDelete.singleDescription', {
                              name: c.name,
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDeleteDialogId(null)}
                            className="cursor-pointer"
                          >
                            {t('Buttons.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              handleDelete(c);
                              setDeleteDialogId(null);
                            }}
                            className="cursor-pointer"
                          >
                            {t('Buttons.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <DropdownMenuItem
                      onClick={() => setViewOrderCustomerId(getId(c))}
                    >
                      <Eye />
                      {t('Buttons.viewOrder')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
}
