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
import { Agent } from "../data";
import { StatusBadge } from "./status-badge";

interface TableBodyProps {
  paginated: Agent[];
  selected: string[];
  onSelectRow: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  setEditAgentId: (id: string | null) => void;
}

export function AgentsTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditAgentId,
}: TableBodyProps) {
  return (
    <TableBody>
      {paginated.map((a) => (
        <TableRow key={a.id}>
          <TableCell className="w-8">
            <Checkbox
              className="ml-2"
              checked={selected.includes(a.id)}
              onCheckedChange={(checked) => onSelectRow(a.id, !!checked)}
              aria-label={`Select row for ${a.name}`}
            />
          </TableCell>
          <TableCell className="pl-4 w-[70px] font-mono">{a.id}</TableCell>
          <TableCell className="w-[150px]">{a.name}</TableCell>
          <TableCell className="w-[220px]">{a.email}</TableCell>
          <TableCell className="w-[120px]">{a.phone}</TableCell>
          <TableCell className="w-[100px]">{a.role}</TableCell>
          <TableCell className="w-[100px]">
            <StatusBadge status={a.status} />
          </TableCell>
          <TableCell className="w-[150px]">
            {a.assignedCustomers.length > 0
              ? `${a.assignedCustomers.length} assigned`
              : "-"}
          </TableCell>
          <TableCell className="w-[120px]">{a.createdAt}</TableCell>
          <TableCell className="w-[120px]">
            {a.lastLogin.split("T")[0]}
          </TableCell>
          <TableCell className="w-[180px]">{a.notes || "-"}</TableCell>
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
                <DropdownMenuItem onClick={() => setEditAgentId(a.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog
                  open={deleteDialogId === a.id}
                  onOpenChange={(open) => setDeleteDialogId(open ? a.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogId(a.id);
                      }}
                      className="text-primary focus:text-primary font-semibold"
                    >
                      <Trash className="h-4 w-4 text-primary" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Are you sure you want to
                        delete {a.name}?
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
                          onDelete(a.id);
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
