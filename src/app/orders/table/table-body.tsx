import React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Pencil } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
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
import { toast } from 'sonner';
import { Order } from '@/types/interface';
import { getId } from '@/utils/helper';
import { TableSkeleton } from '@/components/shared/table-skeleton';

interface TableBodyProps {
  paginated: any[];
  selected: string[];
  onSelectRow: (order: Order, checked: boolean) => void;
  onDelete: (id: string) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  setEditOrderId: (id: string | null) => void;
  onOrderClick: (id: string) => void;
  ordersLoading?: boolean;
}

export function OrdersTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditOrderId,
  onOrderClick,
  ordersLoading,
}: TableBodyProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatAddress = (address: string) => {
    const parts = address.split(', ');
    if (parts.length >= 3) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return address;
  };

  const handleDelete = async (order: Order) => {
    if (order._id) {
      try {
        const res = await fetch(`/api/order/${order._id}`, {
          method: 'DELETE',
        });

        const data = await res.json();
        switch (res.status) {
          case 200:
            onDelete(order._id);
            setDeleteDialogId(null);
            toast.success(data.message);
            break;
          default:
            toast.error(data.error);
            break;
        }
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong');
      }
    } else {
      onDelete(order.id);
      toast.success('Order deleted successfully');
      setDeleteDialogId(null);
    }
  };
  if (ordersLoading) {
    return <TableSkeleton rows={10} columns={11} />;
  }

  return (
    <TableBody className="pl-5">
      {paginated.map((order) => (
        <TableRow
          key={getId(order)}
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
            onOrderClick(getId(order));
          }}
        >
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(getId(order))}
              onCheckedChange={(checked) => onSelectRow(order, !!checked)}
              aria-label={`Select row for ${order.id}`}
            />
          </TableCell>
          <TableCell className="pl-4 w-[120px] font-mono text-sm">
            {order.id || order.orderId}
          </TableCell>
          <TableCell className="w-[120px]">
            {order.date && !isNaN(new Date(order.date).getTime())
              ? new Date(order.date).toLocaleDateString()
              : new Date(order.createdAt?.split('T')[0]).toLocaleDateString()}
          </TableCell>
          <TableCell className="w-[150px] font-medium">
            {order.customer?.name ?? order.customer}
          </TableCell>
          <TableCell className="w-[200px] text-sm text-muted-foreground">
            {formatAddress(order.address)}
          </TableCell>
          <TableCell className="w-[180px]">
            <div className="flex flex-col">
              <span>{order.product?.name ?? order.product}</span>
              <span className="text-xs text-muted-foreground">
                {order.product?.productType ?? order.productType}
              </span>
            </div>
          </TableCell>
          <TableCell className="w-[100px] font-medium">
            {order.quantity}
          </TableCell>
          <TableCell className="w-[100px] font-semibold">
            {formatPrice(order.total)}
          </TableCell>
          <TableCell className="w-[100px]">
            <StatusBadge status={order.payment} type="payment" />
          </TableCell>
          <TableCell className="w-[120px]">
            <StatusBadge status={order.status} type="order" />
          </TableCell>
          <TableCell className="w-[70px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOrderId(getId(order))}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog
                  open={deleteDialogId === getId(order)}
                  onOpenChange={(open) =>
                    setDeleteDialogId(open ? getId(order) : null)
                  }
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogId(getId(order));
                      }}
                      className="text-primary focus:text-primary font-semibold"
                    >
                      <Trash className="h-4 w-4 text-primary" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Are you sure you want to
                        delete order {order.name}?
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
                          handleDelete(order);
                        }}
                        className="cursor-pointer"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
