import React from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";
import { StatusBadge } from "./status-badge";
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
} from "@/components/ui/alert-dialog";

interface TableBodyProps {
  paginated: any[];
  selected: string[];
  onSelectRow: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  setEditOrderId: (id: string | null) => void;
}

export function OrdersTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditOrderId,
}: TableBodyProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatAddress = (address: string) => {
    const parts = address.split(", ");
    if (parts.length >= 3) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return address;
  };

  return (
    <TableBody className="pl-5">
      {paginated.map((order) => (
        <TableRow key={order.id}>
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(order.id)}
              onCheckedChange={(checked) => onSelectRow(order.id, !!checked)}
              aria-label={`Select row for ${order.id}`}
            />
          </TableCell>
          <TableCell className="pl-4 w-[120px] font-mono text-sm">
            {order.id}
          </TableCell>
          <TableCell className="w-[120px]">
            {new Date(order.date).toLocaleDateString()}
          </TableCell>
          <TableCell className="w-[150px] font-medium">
            {order.customer}
          </TableCell>
          <TableCell className="w-[200px] text-sm text-muted-foreground">
            {formatAddress(order.address)}
          </TableCell>
          <TableCell className="w-[180px]">
            <div className="flex flex-col">
              <span>{order.product}</span>
              <span className="text-xs text-muted-foreground">
                {order.productType}
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
            <StatusBadge status={order.payment} />
          </TableCell>
          <TableCell className="w-[120px]">
            <StatusBadge status={order.status} />
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
                <DropdownMenuItem onClick={() => setEditOrderId(order.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog
                  open={deleteDialogId === order.id}
                  onOpenChange={(open) =>
                    setDeleteDialogId(open ? order.id : null)
                  }
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogId(order.id);
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
                        delete order {order.id}?
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
                          onDelete(order.id);
                          setDeleteDialogId(null);
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
