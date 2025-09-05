import React from "react";
import Image from "next/image";
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
  setEditProductId: (id: string | null) => void;
}

export function ProductsTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditProductId,
}: TableBodyProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStock = (stock: number, type: string) => {
    if (type === "Digital" || type === "Subscription" || type === "Service") {
      return "∞";
    }
    return stock.toString();
  };

  return (
    <TableBody className="pl-5">
      {paginated.map((p) => (
        <TableRow key={p.id}>
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(p.id)}
              onCheckedChange={(checked) => onSelectRow(p.id, !!checked)}
              aria-label={`Select row for ${p.name}`}
            />
          </TableCell>
          <TableCell className="pl-4 w-[60px] font-mono">{p.id}</TableCell>
          <TableCell className="w-[200px]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-muted">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <span className="font-medium">{p.name}</span>
            </div>
          </TableCell>
          <TableCell className="w-[120px] font-mono text-sm">
            {p.code}
          </TableCell>
          <TableCell className="w-[100px]">{p.type}</TableCell>
          <TableCell className="w-[120px]">
            {new Date(p.date).toLocaleDateString()}
          </TableCell>
          <TableCell className="w-[80px]">
            {formatStock(p.stock, p.type)}
          </TableCell>
          <TableCell className="w-[100px] font-semibold">
            {formatPrice(p.price)}
          </TableCell>
          <TableCell className="w-[120px]">
            <StatusBadge status={p.status} />
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
                <DropdownMenuItem onClick={() => setEditProductId(p.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog
                  open={deleteDialogId === p.id}
                  onOpenChange={(open) => setDeleteDialogId(open ? p.id : null)}
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
                      <AlertDialogTitle>Delete this product?</AlertDialogTitle>
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
                          onDelete(p.id);
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
