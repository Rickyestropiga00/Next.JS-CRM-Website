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
  setEditCustomerId: (id: string | null) => void;
  onCustomerClick: (id: string) => void;
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
}: TableBodyProps) {
  return (
    <TableBody className="pl-5">
      {paginated.map((c) => (
        <TableRow
          key={c.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={(e) => {
            // Don't trigger row click if clicking on checkbox, dropdown, or other interactive elements
            const target = e.target as HTMLElement;
            if (
              target.closest('input[type="checkbox"]') ||
              target.closest('[role="menuitem"]') ||
              target.closest("button")
            ) {
              return;
            }
            onCustomerClick(c.id);
          }}
        >
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(c.id)}
              onCheckedChange={(checked) => onSelectRow(c.id, !!checked)}
              aria-label={`Select row for ${c.name}`}
              onClick={(e) => e.stopPropagation()}
            />
          </TableCell>
          <TableCell className="pl-4 w-[60px] font-mono">{c.id}</TableCell>
          <TableCell className="w-[150px]">{c.name}</TableCell>
          <TableCell className="w-[200px]">{c.email}</TableCell>
          <TableCell className="w-[120px]">{c.phone}</TableCell>
          <TableCell className="w-[120px]">{c.company || "-"}</TableCell>
          <TableCell className="w-[100px]">
            <StatusBadge status={c.status} />
          </TableCell>
          <TableCell className="w-[120px]">{c.lastContacted}</TableCell>
          <TableCell className="w-[120px]">{c.createdAt}</TableCell>
          <TableCell className="w-[180px] max-w-[180px]">
            <div className="truncate" title={c.notes || ""}>
              {c.notes || "-"}
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
                <DropdownMenuItem onClick={() => setEditCustomerId(c.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog
                  open={deleteDialogId === c.id}
                  onOpenChange={(open) => setDeleteDialogId(open ? c.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogId(c.id);
                      }}
                      className="text-primary focus:text-primary font-semibold"
                    >
                      <Trash className="h-4 w-4 text-primary" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
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
                          onDelete(c.id);
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
