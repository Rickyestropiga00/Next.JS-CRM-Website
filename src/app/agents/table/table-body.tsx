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
  onAgentClick: (id: string) => void;
}

export function AgentsTableBody({
  paginated,
  selected,
  onSelectRow,
  onDelete,
  deleteDialogId,
  setDeleteDialogId,
  setEditAgentId,
  onAgentClick,
}: TableBodyProps) {
  // Helper function to count comments
  const countComments = (comment: string | undefined): number => {
    if (!comment) return 0;
    // Count occurrences of the comment separator pattern
    const matches = comment.match(/---\n📝 Comment by/g);
    return matches ? matches.length : 0;
  };

  return (
    <TableBody>
      {paginated.map((a) => {
        const commentCount = countComments(a.comment);
        return (
          <TableRow
            key={a.id}
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
              onAgentClick(a.id);
            }}
          >
            <TableCell className="w-8">
              <Checkbox
                className="ml-2"
                checked={selected.includes(a.id)}
                onCheckedChange={(checked) => onSelectRow(a.id, !!checked)}
                aria-label={`Select row for ${a.name}`}
                onClick={(e) => e.stopPropagation()}
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
            <TableCell className="w-[180px] max-w-[180px]">
              <div className="truncate" title={a.notes || ""}>
                {a.notes || "-"}
              </div>
            </TableCell>
            <TableCell className="w-[180px] max-w-[180px]">
              <div className="text-center">
                {commentCount > 0 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    {commentCount}
                  </span>
                ) : (
                  "-"
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
                  <DropdownMenuItem onClick={() => setEditAgentId(a.id)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog
                    open={deleteDialogId === a.id}
                    onOpenChange={(open) =>
                      setDeleteDialogId(open ? a.id : null)
                    }
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
        );
      })}
    </TableBody>
  );
}
