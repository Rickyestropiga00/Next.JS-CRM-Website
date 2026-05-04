import React from 'react';
import Image from 'next/image';
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
import { Product, UserType } from '@/types/interface';
import { getId } from '@/utils/helper';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Can } from '@/components/auth/can';
import { useUser } from '@/hooks/use-user';

interface TableBodyProps {
  paginated: any[];
  selected: string[];
  onSelectRow: (product: Product, checked: boolean) => void;
  onDelete: (id: string) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  setEditProductId: (id: string | null) => void;
  onProductClick: (id: string) => void;
  productsLoading?: boolean;
}

export function ProductsTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  onProductClick,
  setEditProductId,
  productsLoading,
}: TableBodyProps) {
  const { user } = useUser();
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStock = (stock: number, type: string) => {
    if (type === 'Digital' || type === 'Subscription' || type === 'Service') {
      return '∞';
    }
    return stock.toString();
  };

  const handleDelete = async (product: Product) => {
    if (product._id) {
      try {
        const res = await fetch(`/api/product/${product._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (res.status === 200) {
          onDelete(product._id);
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
      onDelete(product.id);
      toast.success('Product deleted successfully');
      setDeleteDialogId(null);
    }
  };

  if (productsLoading) {
    return user?.role === 'admin' ? (
      <TableSkeleton rows={10} columns={10} withAvatar />
    ) : (
      <TableSkeleton rows={10} columns={9} withAvatar />
    );
  }

  return (
    <TableBody className="pl-5">
      {paginated.map((p) => (
        <TableRow
          key={getId(p)}
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
            onProductClick(getId(p));
          }}
        >
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(getId(p))}
              onCheckedChange={(checked) => onSelectRow(p, !!checked)}
              aria-label={`Select row for ${p.name}`}
            />
          </TableCell>
          <TableCell className="pl-4 w-[60px] font-mono">
            {p.id || p.productId}
          </TableCell>
          <TableCell className="w-[200px]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-sm overflow-hidden bg-muted shrink-0">
                <Image
                  src={
                    p._id && p._id.length === 24
                      ? `/api/product/image/${getId(p)}?t=${new Date(
                          p.updatedAt || Date.now()
                        ).getTime()}`
                      : p.image || '/product/product-1.webp'
                  }
                  alt={p.name}
                  className="object-cover "
                  fill
                />
              </div>
              <span className="font-medium truncate">{p.name}</span>
            </div>
          </TableCell>
          <TableCell className="w-[120px] font-mono text-sm">
            {p.code}
          </TableCell>
          <TableCell className="w-[100px]">{p.productType}</TableCell>
          <TableCell className="w-[120px]">
            {new Date(p.createdAt ?? p.date).toLocaleDateString()}
          </TableCell>
          <TableCell className="w-[80px]">
            {formatStock(p.stock, p.productType)}
          </TableCell>
          <TableCell className="w-[100px] font-semibold">
            {formatPrice(p.price)}
          </TableCell>
          <TableCell className="w-[120px]">
            <StatusBadge status={p.status} type="product" />
          </TableCell>
          <Can role={user?.role} action="update" resource="product">
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
                  <DropdownMenuItem onClick={() => setEditProductId(getId(p))}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog
                    open={deleteDialogId === p.id}
                    onOpenChange={(open) =>
                      setDeleteDialogId(open ? p.id : null)
                    }
                  >
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setDeleteDialogId(p.id);
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
                          Delete this product?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to
                          delete {p.name}?
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
                            handleDelete(p);
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
          </Can>
        </TableRow>
      ))}
    </TableBody>
  );
}
