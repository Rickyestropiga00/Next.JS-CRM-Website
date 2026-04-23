import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CustomersTableHeader } from './table-header';
import { CustomersTableBody } from './table-body';
import { CustomersPaginationBar } from './pagination-bar';
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
import { Customer, CustomerStatus, DeleteResponse } from '@/types/interface';
import { useTableActions } from '@/hooks/use-table-actions';

// Dynamically import modals to reduce initial bundle size
const EditCustomerPopover = dynamic(
  () =>
    import('./edit-customer-popover').then((mod) => ({
      default: mod.EditCustomerPopover,
    })),
  { ssr: false }
);

const AddCustomerPopover = dynamic(
  () =>
    import('./add-customer-popover').then((mod) => ({
      default: mod.AddCustomerPopover,
    })),
  { ssr: false }
);

const CustomerDetailsModal = dynamic(
  () =>
    import('./customer-details-modal').then((mod) => ({
      default: mod.CustomerDetailsModal,
    })),
  { ssr: false }
);
const ViewOrderModal = dynamic(
  () =>
    import('./view-order-modal').then((mod) => ({
      default: mod.ViewOrderModal,
    })),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getId } from '@/utils/helper';
import { useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export function CustomersTable() {
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  const [viewOrderCustomerId, setViewOrderCustomerId] = useState<string | null>(
    null
  );
  const {
    data: customersData,
    setData: setCustomersData,
    loading: customersLoading,
  } = useFetch<Customer>('customer');
  const statusOptions: CustomerStatus[] = [
    'Lead',
    'Active',
    'Inactive',
    'Prospect',
  ];

  const {
    filters,
    setFilters,
    filtered,
    paginated,
    totalPages,
    selected,
    setSelected,
    sortBy,
    sortDir,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    handleDelete,
    handleAdd,
    handleEdit,
    handleSort,
    handleSelectAll,
    handleSelectRow,
  } = useTableActions<Customer>({
    data: customersData,
    setData: setCustomersData,
    getId: (c) => c.id || c._id || '',

    filtersConfig: {
      searchKeys: ['name', 'email'],
      filterKeys: [{ key: 'status', defaultValue: 'all' }],
    },
  });

  function handleAddComment(customerId: string, comment: string) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const commentWithTimestamp = `---\n📝 Comment by Anonymous\n📅 ${formattedDate} at ${formattedTime}\n\n${comment}\n`;

    setCustomersData((prev) =>
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

  const { handleDeleteSelected } = useBulkDelete<DeleteResponse>({
    endpoint: '/api/bulk-delete',
    type: 'customer',

    onSuccess: (ids, data) => {
      setCustomersData((prev) =>
        prev.filter(
          (c) =>
            !(c._id && ids.includes(c._id)) && !(c.id && ids.includes(c.id))
        )
      );

      setSelected([]);
      setShowConfirm(false);
      toast.success(data.message);
    },

    onError: () => {
      toast.error('Something went wrong');
    },
  });

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search name or email..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full md:w-64"
          />
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value,
              }))
            }
          >
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
                  onClick={() => handleDeleteSelected(selected)}
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
              sortBy={sortBy ?? 'createdAt'}
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
              setViewOrderCustomerId={setViewOrderCustomerId}
              customersLoading={customersLoading}
            />
          </Table>
        </div>
      </div>
      <CustomersPaginationBar
        selectedCount={selected.length}
        totalRows={filtered.length}
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
          customer={customersData.find((c) => getId(c) === editCustomerId)!}
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
          handleAdd(newCustomer);
          setShowAddCustomer(false);
        }}
        onClose={() => setShowAddCustomer(false)}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={
          selectedCustomerId
            ? customersData.find((c) => getId(c) === selectedCustomerId) || null
            : null
        }
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onAddComment={handleAddComment}
      />
      {viewOrderCustomerId && (
        <ViewOrderModal
          customer={
            customersData.find((c) => getId(c) === viewOrderCustomerId)!
          }
          onClose={() => setViewOrderCustomerId(null)}
          open={true}
        />
      )}
    </>
  );
}
