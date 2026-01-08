import React, { useMemo, useState } from "react";
import {
  customers as initialCustomers,
  CustomerStatus,
  Customer,
} from "../data";
import { CustomersTableHeader } from "./table-header";
import { CustomersTableBody } from "./table-body";
import { CustomersPaginationBar } from "./pagination-bar";
import { EditCustomerPopover } from "./edit-customer-popover";
import { AddCustomerPopover } from "./add-customer-popover";
import { CustomerDetailsModal } from "./customer-details-modal";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Trash, Plus } from "lucide-react";

export function CustomersTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof Customer>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState(initialCustomers);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const statusOptions: CustomerStatus[] = [
    "Lead",
    "Active",
    "Inactive",
    "Prospect",
  ];

  // Filtering
  const filtered = useMemo(() => {
    return data.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" ? true : c.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, status]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";
      if (sortBy === "id") {
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (aNum < bNum) return sortDir === "asc" ? -1 : 1;
        if (aNum > bNum) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const totalRows = sorted.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, currentPage, rowsPerPage]);
  // Reset to page 1 if rowsPerPage changes and currentPage is out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [rowsPerPage, totalPages]);

  function handleDelete(id: string) {
    setData((prev) => prev.filter((c) => c.id !== id));
  }

  function handleAddCustomer(newCustomer: Customer) {
    setData((prev) => [newCustomer, ...prev]);
    // Reset to first page when adding new customer
    setCurrentPage(1);
  }

  function handleEdit(updatedCustomer: Customer) {
    setData((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  }

  function handleAddComment(customerId: string, comment: string) {
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const commentWithTimestamp = `---\n📝 Comment by Anonymous\n📅 ${formattedDate} at ${formattedTime}\n\n${comment}\n`;

    setData((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              comment: customer.comment
                ? `${customer.comment}\n\n${commentWithTimestamp}`
                : commentWithTimestamp,
            }
          : customer
      )
    );
  }

  function handleSort(col: keyof Customer) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected((prev) => [
        ...prev.filter((id) => !paginated.some((c) => c.id === id)),
        ...paginated.map((c) => c.id),
      ]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !paginated.some((c) => c.id === id))
      );
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }

  function handleDeleteSelected() {
    setData((prev) => prev.filter((c) => !selected.includes(c.id)));
    setSelected([]);
    setShowConfirm(false);
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Select value={status || "all"} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                className="ml-2 cursor-pointer"
                disabled={selected.length === 0}
                title="Delete selected"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected customers?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  the selected customers?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="cursor-pointer"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button
          className="flex items-center gap-2 cursor-pointer"
          type="button"
          onClick={() => setShowAddCustomer(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="bg-transparent">
            <CustomersTableHeader
              selected={selected}
              paginated={paginated}
              onSelectAll={handleSelectAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <CustomersTableBody
              paginated={paginated}
              selected={selected}
              onSelectRow={handleSelectRow}
              onDelete={handleDelete}
              deleteDialogId={deleteDialogId}
              setDeleteDialogId={setDeleteDialogId}
              setEditCustomerId={setEditCustomerId}
              onCustomerClick={setSelectedCustomerId}
            />
          </Table>
        </div>
      </div>
      <CustomersPaginationBar
        selectedCount={selected.length}
        totalRows={totalRows}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
        // Remove onDeleteSelected and disableDelete props
      />

      {/* Edit Customer Modal - Rendered outside table structure */}
      {editCustomerId && (
        <EditCustomerPopover
          customer={data.find((c) => c.id === editCustomerId)!}
          onSave={(updatedCustomer) => {
            handleEdit(updatedCustomer);
            setEditCustomerId(null);
          }}
          onClose={() => setEditCustomerId(null)}
          open={true}
        />
      )}

      {/* Add Customer Modal - Rendered outside table structure */}
      <AddCustomerPopover
        isOpen={showAddCustomer}
        onAddCustomer={(newCustomer) => {
          handleAddCustomer(newCustomer);
          setShowAddCustomer(false);
        }}
        onClose={() => setShowAddCustomer(false)}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={
          selectedCustomerId
            ? data.find((c) => c.id === selectedCustomerId) || null
            : null
        }
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onAddComment={handleAddComment}
      />
    </>
  );
}
