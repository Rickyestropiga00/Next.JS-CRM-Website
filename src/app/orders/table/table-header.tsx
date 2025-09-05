import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Order } from "../data";

interface TableHeaderProps {
  selected: string[];
  paginated: { id: string }[];
  onSelectAll: (checked: boolean) => void;
  sortBy: keyof Order;
  sortDir: "asc" | "desc";
  onSort: (col: keyof Order) => void;
}

const sortableCols: {
  key: keyof Order;
  label: string;
  className?: string;
  sortable?: boolean;
}[] = [
  { key: "id", label: "Order ID", className: "pl-4 w-[120px]", sortable: true },
  { key: "date", label: "Date", className: "w-[120px]", sortable: true },
  {
    key: "customer",
    label: "Customer",
    className: "w-[150px]",
    sortable: true,
  },
  { key: "address", label: "Address", className: "w-[200px]", sortable: false },
  { key: "product", label: "Product", className: "w-[180px]", sortable: true },
  {
    key: "quantity",
    label: "Quantity",
    className: "w-[100px]",
    sortable: true,
  },
  { key: "total", label: "Total", className: "w-[100px]", sortable: true },
  { key: "payment", label: "Payment", className: "w-[100px]", sortable: false },
  { key: "status", label: "Status", className: "w-[120px]", sortable: false },
];

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
              ? "opacity-100 text-primary"
              : "opacity-0 group-hover:opacity-100 text-muted-foreground"
          }`}
          style={{
            transform:
              isActive && sortDir === "desc" ? "rotate(180deg)" : undefined,
            transition: "transform 0.15s",
          }}
        />
      </span>
    </TableHead>
  );
}

export function OrdersTableHeader({
  selected,
  paginated,
  onSelectAll,
  sortBy,
  sortDir,
  onSort,
}: TableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-sidebar text-secondary-foreground border-b-2 border-border rounded-t-xl [&_th]:bg-sidebar [&_th]:text-secondary-foreground [&_th]:font-semibold [&_th]:border-none">
        <TableHead className="w-8">
          <Checkbox
            className="ml-2"
            checked={
              paginated.every((c) => selected.includes(c.id)) &&
              paginated.length > 0
            }
            onCheckedChange={(checked: boolean | "indeterminate") =>
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
        <TableHead className="w-[70px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
