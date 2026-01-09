import React, { useMemo, useState } from "react";
import {
  products as initialProducts,
  ProductStatus,
  ProductType,
  Product,
} from "../data";
import { ProductsTableHeader } from "./table-header";
import { ProductsTableBody } from "./table-body";
import { ProductsPaginationBar } from "./pagination-bar";
import { EditProductPopover } from "./edit-product-popover";
import { AddProductPopover } from "./add-product-popover";
import { ProductDetailsModal } from "./product-details-modal";
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

export function ProductsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof Product>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState(initialProducts);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions: ProductStatus[] = ["Active", "Disabled"];

  const typeOptions: ProductType[] = [
    "Physical",
    "Digital",
    "Service",
    "Subscription",
  ];

  // Filtering
  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" ? true : p.status === status;
      const matchesType = type === "all" ? true : p.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data, search, status, type]);

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

      if (sortBy === "price" || sortBy === "stock") {
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
    setData((prev) => prev.filter((p) => p.id !== id));
  }

  function handleAddProduct(newProduct: Product) {
    setData((prev) => [newProduct, ...prev]);
    // Reset to first page when adding new product
    setCurrentPage(1);
  }

  function handleAddComment(agentId: string, comment: string) {
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
      prev.map((product) =>
        product.id === product.id
          ? {
              ...product,
              comment: product.comment
                ? `${product.comment}\n\n${commentWithTimestamp}`
                : commentWithTimestamp,
            }
          : product
      )
    );
  }

  function handleEdit(updatedProduct: Product) {
    setData((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  }

  function handleSort(col: keyof Product) {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected(paginated.map((p) => p.id));
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
    setData((prev) => prev.filter((p) => !selected.includes(p.id)));
    setSelected([]);
    setShowConfirm(false);
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
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
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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
                <AlertDialogTitle>Delete selected products?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  the selected products?
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
          onClick={() => setShowAddProduct(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="bg-transparent">
            <ProductsTableHeader
              selected={selected}
              paginated={paginated}
              onSelectAll={handleSelectAll}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <ProductsTableBody
              paginated={paginated}
              selected={selected}
              onSelectRow={handleSelectRow}
              onDelete={handleDelete}
              deleteDialogId={deleteDialogId}
              setDeleteDialogId={setDeleteDialogId}
              setEditProductId={setEditProductId}
              onProductClick={setSelectedProductId}
            />
          </Table>
        </div>
      </div>

      <ProductsPaginationBar
        selectedCount={selected.length}
        totalRows={totalRows}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Edit Product Modal - Rendered outside table structure */}
      {editProductId && (
        <EditProductPopover
          product={data.find((p) => p.id === editProductId)!}
          onSave={(updatedProduct) => {
            handleEdit(updatedProduct);
            setEditProductId(null);
          }}
          onClose={() => setEditProductId(null)}
          open={true}
        />
      )}

      {/* Add Product Modal - Rendered outside table structure */}
      <AddProductPopover
        isOpen={showAddProduct}
        onAddProduct={(newProduct) => {
          handleAddProduct(newProduct);
          setShowAddProduct(false);
        }}
        onClose={() => setShowAddProduct(false)}
      />
      <ProductDetailsModal
        product={
          selectedProductId
            ? data.find((p) => p.id === selectedProductId) || null
            : null
        }
        isOpen={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onAddComment={handleAddComment}
      />
    </>
  );
}
