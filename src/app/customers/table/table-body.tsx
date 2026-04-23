import React, { useEffect } from 'react';
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
// import { Customer } from "../data";
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
}: TableBodyProps) {
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
        const res = await fetch(`/api/customer/${customer._id}`, {
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
      toast.success('Customer deleted successfully');
      setDeleteDialogId(null);
    }
  };
  if (customersLoading) {
    return <TableSkeleton rows={10} columns={12} />;
  }

  return (
    <TableBody className="pl-5">
      {paginated.map((c) => {
        const commentCount = countComments(c.comment);
        return (
          <TableRow
            key={getId(c)}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
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
            <TableCell className="w-8">
              <Checkbox
                className="ml-2"
                checked={selected.includes(getId(c))}
                onCheckedChange={(checked) => onSelectRow(c, !!checked)}
                aria-label={`Select row for ${c.name}`}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
            <TableCell className="pl-4 w-[60px] font-mono">
              {c.id || c.customerId}
            </TableCell>
            <TableCell className="w-[150px]">{c.name}</TableCell>
            <TableCell className="w-[200px]">{c.email}</TableCell>
            <TableCell className="w-[120px]">{formatPhone(c.phone)}</TableCell>
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
                {commentCount > 0 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    {commentCount}
                  </span>
                ) : (
                  '-'
                )}
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
                  <DropdownMenuItem onClick={() => setEditCustomerId(getId(c))}>
                    <Pencil className="h-4 w-4" />
                    Edit
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
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this customer?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to
                          delete {c.name}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteDialogId(null)}
                          className="cursor-pointer"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDelete(c);
                            setDeleteDialogId(null);
                          }}
                          className="cursor-pointer"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenuItem
                    onClick={() => setViewOrderCustomerId(getId(c))}
                  >
                    <Eye />
                    View Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
