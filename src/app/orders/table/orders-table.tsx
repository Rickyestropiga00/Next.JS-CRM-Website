import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  orders as initialOrders,
  OrderStatus,
  PaymentStatus,
  Order,
} from "../data";
import { OrdersTableHeader } from "./table-header";
import { OrdersTableBody } from "./table-body";
import { OrdersPaginationBar } from "./pagination-bar";
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

// Dynamically import modals to reduce initial bundle size
const EditOrderPopover = dynamic(
  () => import("./edit-order-popover").then((mod) => ({ default: mod.EditOrderPopover })),
  { ssr: false }
);

const AddOrderPopover = dynamic(
  () => import("./add-order-popover").then((mod) => ({ default: mod.AddOrderPopover })),
  { ssr: false }
);

const OrderDetailsModal = dynamic(
  () => import("./order-details-modal").then((mod) => ({ default: mod.OrderDetailsModal })),
  { ssr: false }
);
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

export function OrdersTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [payment, setPayment] = useState<string>("all");
  const [productType, setProductType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof Order>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState(initialOrders);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const statusOptions: OrderStatus[] = [
    "Pending",
    "In Transit",
    "Completed",
    "Canceled",
  ];
  const paymentOptions: PaymentStatus[] = ["Paid", "Unpaid"];
  const productTypeOptions = ["Physical", "Digital", "Service", "Subscription"];

  // Filtering
  const filtered = useMemo(() => {
    return data.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.product.toLowerCase().includes(search.toLowerCase()) ||
        order.quantity.toString().includes(search.toLowerCase());
      const matchesStatus = status === "all" ? true : order.status === status;
      const matchesPayment =
        payment === "all" ? true : order.payment === payment;
      const matchesProductType =
        productType === "all" ? true : order.productType === productType;
      return (
        matchesSearch && matchesStatus && matchesPayment && matchesProductType
      );
    });
  }, [data, search, status, payment, productType]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";

      if (sortBy === "id") {
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      if (sortBy === "total" || sortBy === "quantity") {
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (aNum < bNum) return sortDir === "asc" ? -1 : 1;
        if (aNum > bNum) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      if (sortBy === "date") {
        const aDate = new Date(aVal as string);
        const bDate = new Date(bVal as string);
        if (aDate < bDate) return sortDir === "asc" ? -1 : 1;
        if (aDate > bDate) return sortDir === "asc" ? 1 : -1;
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
    setData((prev) => prev.filter((order) => order.id !== id));
  }

  function handleAddOrder(newOrder: Order) {
    setData((prev) => [newOrder, ...prev]);
    // Reset to first page when adding new order
    setCurrentPage(1);
  }

  function handleEdit(updatedOrder: Order) {
    setData((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  }

  function handleSort(col: keyof Order) {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected(paginated.map((order) => order.id));
    } else {
      setSelected([]);
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    if (checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((s) => s !== id));
    }
  }

  function handleDeleteSelected() {
    setData((prev) => prev.filter((order) => !selected.includes(order.id)));
    setSelected([]);
    setShowConfirm(false);
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Types</SelectItem>
                {productTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
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
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Payment</SelectItem>
                {paymentOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
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
                <AlertDialogTitle>Delete selected orders?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  the selected orders?
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
          onClick={() => setShowAddOrder(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Order
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="bg-transparent">
            <OrdersTableHeader
              selected={selected}
              paginated={paginated}
              onSelectAll={handleSelectAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <OrdersTableBody
              paginated={paginated}
              selected={selected}
              onSelectRow={handleSelectRow}
              onDelete={handleDelete}
              deleteDialogId={deleteDialogId}
              setDeleteDialogId={setDeleteDialogId}
              setEditOrderId={setEditOrderId}
              onOrderClick={setSelectedOrderId}
            />
          </Table>
        </div>
      </div>

      <OrdersPaginationBar
        selectedCount={selected.length}
        totalRows={totalRows}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Edit Order Modal - Rendered outside table structure */}
      {editOrderId && (
        <EditOrderPopover
          order={data.find((o) => o.id === editOrderId)!}
          onSave={(updatedOrder) => {
            handleEdit(updatedOrder);
            setEditOrderId(null);
          }}
          onClose={() => setEditOrderId(null)}
          open={true}
        />
      )}

      {/* Add Order Modal - Rendered outside table structure */}
      <AddOrderPopover
        isOpen={showAddOrder}
        onAddOrder={(newOrder) => {
          handleAddOrder(newOrder);
          setShowAddOrder(false);
        }}
        onClose={() => setShowAddOrder(false)}
      />

      <OrderDetailsModal
        order={
          selectedOrderId
            ? data.find((o) => o.id === selectedOrderId) || null
            : null
        }
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
}
