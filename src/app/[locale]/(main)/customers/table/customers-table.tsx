import React, { useEffect, useState } from 'react';
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
import {
  Agent,
  Customer,
  CustomerStatus,
  DeleteResponse,
} from '@/types/interface';
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
import { Trash, Plus, UserRoundPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getId } from '@/utils/helper';
import { invalidateCache, useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';
import { getApiSuccessMessage } from '@/lib/api-messages';
import { useSearchParams } from 'next/navigation';
import { useTableHighlight } from '@/hooks/use-table-highlight';

export function CustomersTable() {
  const t = useTranslations();
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
    data: agents,
    setData: setAgents,
    loading: agentsLoading,
  } = useFetch<Agent>('agents');
  const { user } = useUser();

  const {
    data: customersData,
    setData: setCustomersData,
    loading: customersLoading,
  } = useFetch<Customer>('customers');
  const filteredCustomers = useFilteredCustomers(customersData, agents, user);

  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const isReady =
    !customersLoading && (user?.role !== 'agent' || !agentsLoading);

  const statusOptions: { value: CustomerStatus; label: string }[] = [
    {
      value: 'Lead',
      label: t('Statuses.lead'),
    },
    {
      value: 'Active',
      label: t('Statuses.active'),
    },
    {
      value: 'Inactive',
      label: t('Statuses.inactive'),
    },
    {
      value: 'Prospect',
      label: t('Statuses.prospect'),
    },
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
    data: filteredCustomers,
    setData: setCustomersData,
    getId: (c) => c.id || c._id || '',

    filtersConfig: {
      searchKeys: ['name', 'email'],
      filterKeys: [{ key: 'status', defaultValue: 'all' }],
    },
  });

  const { isHighlighted } = useTableHighlight({
    data: filteredCustomers,
    highlightId,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    isReady,
    paginatedData: paginated,
    getHighlightValue: (customer) => customer.customerId,
  });

  async function handleAddComment(customerId: string, comment: string) {
    const res = await fetch(`/api/customers/${customerId}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: comment,
        author: 'Anonymous',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to add comment');
    }

    const savedComment = await res.json();

    setCustomersData((prev) =>
      prev.map((customer) =>
        customer._id === customerId
          ? {
              ...customer,
              comments: [savedComment, ...(customer.comments ?? [])],
            }
          : customer
      )
    );

    return savedComment;
  }

  async function handleDeleteComment(customerId: string, commentId: string) {
    const res = await fetch(
      `/api/customers/${customerId}/comments/${commentId}`,
      { method: 'DELETE' }
    );

    if (!res.ok) {
      throw new Error('Failed to delete comment');
    }

    setCustomersData((prev) =>
      prev.map((customer) =>
        customer._id === customerId
          ? {
              ...customer,
              comments: (customer.comments ?? []).filter(
                (c) => c._id !== commentId
              ),
            }
          : customer
      )
    );
  }

  useEffect(() => {
    if (!selectedCustomerId) return;

    const fetchComments = async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}/comments`);
      const data = await res.json();

      setCustomersData((prev) =>
        prev.map((c) =>
          c._id === selectedCustomerId ? { ...c, comments: data } : c
        )
      );
    };

    fetchComments();
  }, [selectedCustomerId, setCustomersData]);

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
      invalidateCache('customers');

      setSelected([]);
      setShowConfirm(false);
      const message = getApiSuccessMessage(data.message, t, 'Customer');
      toast.success(message);
    },

    onError: () => {
      toast.error('Something went wrong');
    },
  });

  async function handleDeleteCustomer(customerId: string) {
    handleDelete(customerId);

    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        assignedCustomers: (agent.assignedCustomers || []).filter(
          (id) => id !== customerId
        ),
      }))
    );

    const affectedAgents = agents.filter((agent) =>
      (agent.assignedCustomers || []).includes(customerId)
    );

    await Promise.all(
      affectedAgents.map((agent) =>
        fetch(`/api/agents/${agent._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedCustomers: (agent.assignedCustomers || []).filter(
              (id) => id !== customerId
            ),
          }),
        })
      )
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder={t('Customers.table.searchPlaceholder')}
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
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('Table.filters.allStatus')}
                </SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
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
                <AlertDialogTitle>
                  {t('ConfirmDelete.bulkTitle', { items: 'customers' })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('ConfirmDelete.bulkDescription', { items: 'customers' })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  {t('Buttons.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSelected(selected)}
                  className="cursor-pointer"
                >
                  {t('Buttons.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Mobile Add */}
          <Button
            className="flex lg:hidden items-center gap-2 cursor-pointer"
            type="button"
            onClick={() => setShowAddCustomer(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Add */}
        <Button
          className="hidden lg:flex  items-center gap-2 cursor-pointer"
          type="button"
          onClick={() => setShowAddCustomer(true)}
        >
          <Plus className="h-4 w-4" />
          {t('Buttons.addCustomer')}
        </Button>
      </div>

      {filteredCustomers.length > 0 ? (
        <>
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
                  onDelete={handleDeleteCustomer}
                  deleteDialogId={deleteDialogId}
                  setDeleteDialogId={setDeleteDialogId}
                  setEditCustomerId={setEditCustomerId}
                  onCustomerClick={setSelectedCustomerId}
                  setViewOrderCustomerId={setViewOrderCustomerId}
                  customersLoading={customersLoading}
                  isHighlighted={isHighlighted}
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
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 ">
          <div className="mb-4 rounded-full bg-muted p-4 ">
            <UserRoundPlus className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="font-semibold">{t('EmptyState.customer.title')}</h3>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t('EmptyState.customer.description')}
          </p>

          <Button className="mt-4" onClick={() => setShowAddCustomer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('EmptyState.customer.addNewCustomer')}
          </Button>
        </div>
      )}

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
          console.log('FROM MODAL:', newCustomer);
          handleAdd(newCustomer);
          setShowAddCustomer(false);
        }}
        onClose={() => setShowAddCustomer(false)}
        setAgents={setAgents}
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
        onDeleteComment={handleDeleteComment}
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
