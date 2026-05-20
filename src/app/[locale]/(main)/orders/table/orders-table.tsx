'use client';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Agent,
  Customer,
  DeleteResponse,
  Order,
  OrderStatus,
  PaymentStatus,
  ProductTypes,
} from '@/types/interface';
import { OrdersTableHeader } from './table-header';
import { OrdersTableBody } from './table-body';
import { OrdersPaginationBar } from './pagination-bar';
import { useTableActions } from '@/hooks/use-table-actions';

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

// Dynamically import modals to reduce initial bundle size
const EditOrderPopover = dynamic(
  () =>
    import('./edit-order-popover').then((mod) => ({
      default: mod.EditOrderPopover,
    })),
  { ssr: false }
);

const AddOrderPopover = dynamic(
  () =>
    import('./add-order-popover').then((mod) => ({
      default: mod.AddOrderPopover,
    })),
  { ssr: false }
);

const OrderDetailsModal = dynamic(
  () =>
    import('./order-details-modal').then((mod) => ({
      default: mod.OrderDetailsModal,
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
import { getId } from '@/utils/helper';
import { toast } from 'sonner';
import { useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useUser } from '@/hooks/use-user';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { useTranslations } from 'next-intl';

export function OrdersTable() {
  const {
    data: ordersData,
    setData: setOrdersData,
    loading: ordersLoading,
  } = useFetch<Order>('order');

  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { user } = useUser();
  const { data: customersData } = useFetch<Customer>('customer', false, false);
  const { data: agents } = useFetch<Agent>('agent', false, false);
  const filteredCustomers = useFilteredCustomers(customersData, agents, user);
  const { filteredOrder, agentsLoading } = useFilteredOrderByAgent(ordersData);

  const isReady = !ordersLoading && (user?.role !== 'agent' || !agentsLoading);
  const ordersT = useTranslations('Orders');
  const tableT = useTranslations('Table');
  const statusesT = useTranslations('Statuses');
  const buttonsT = useTranslations('Buttons');
  const confirmDeleteT = useTranslations('ConfirmDelete');
  const paymentT = useTranslations('Payment');
  const productTypesT = useTranslations('ProductTypes');

  const statusOptions: {
    value: OrderStatus;
    label: string;
  }[] = [
    {
      value: 'Pending',
      label: statusesT('pending'),
    },
    {
      value: 'In Transit',
      label: statusesT('inTransit'),
    },
    {
      value: 'Completed',
      label: statusesT('completed'),
    },
    {
      value: 'Canceled',
      label: statusesT('canceled'),
    },
  ];
  const paymentOptions: { value: PaymentStatus; label: string }[] = [
    {
      value: 'Paid',
      label: paymentT('paid'),
    },
    {
      value: 'Unpaid',
      label: paymentT('unpaid'),
    },
  ];
  const productTypeOptions: { value: ProductTypes; label: string }[] = [
    {
      value: 'Physical',
      label: productTypesT('physical'),
    },
    {
      value: 'Digital',
      label: productTypesT('digital'),
    },
    {
      value: 'Service',
      label: productTypesT('service'),
    },
    {
      value: 'Subscription',
      label: productTypesT('subscription'),
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
  } = useTableActions<Order>({
    data: filteredOrder,
    setData: setOrdersData,
    getId: (o) => o.id || o._id || '',

    filtersConfig: {
      searchKeys: ['customer'],
      filterKeys: [
        { key: 'status', defaultValue: 'all' },
        { key: 'productType', defaultValue: 'all' },
        { key: 'payment', defaultValue: 'all' },
      ],
    },
  });

  const { handleDeleteSelected } = useBulkDelete<DeleteResponse>({
    endpoint: '/api/bulk-delete',
    type: 'order',

    onSuccess: (ids, data) => {
      setOrdersData((prev) =>
        prev.filter(
          (o) =>
            !(o._id && ids.includes(o._id)) && !(o.id && ids.includes(o.id))
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

  const paginatedForHeader = useMemo(() => {
    return paginated.map((order, index) => ({
      id: getId(order) ?? index.toString(),
    }));
  }, [paginated]);

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder={ordersT('page.searchPlaceholder')}
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
            value={filters.productType || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                productType: value,
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tableT('filters.allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {tableT('filters.allTypes')}
                </SelectItem>
                {productTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
              <SelectValue placeholder={tableT('filters.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {tableT('filters.allStatus')}
                </SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filters.payment}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                payment: value,
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tableT('filters.allPayment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {tableT('filters.allPayment')}
                </SelectItem>
                {paymentOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
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
                  {confirmDeleteT('bulkTitle', { items: 'orders' })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmDeleteT('bulkDescription', { items: 'orders' })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  {buttonsT('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSelected(selected)}
                  className="cursor-pointer"
                >
                  {buttonsT('delete')}
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
          {buttonsT('addOrder')}
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="bg-transparent">
            <OrdersTableHeader
              selected={selected}
              paginated={paginatedForHeader}
              onSelectAll={handleSelectAll}
              sortBy={sortBy ?? 'orderId'}
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
              ordersLoading={!isReady}
            />
          </Table>
        </div>
      </div>

      <OrdersPaginationBar
        selectedCount={selected.length}
        totalRows={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Edit Order Modal - Rendered outside table structure */}
      {editOrderId && (
        <EditOrderPopover
          order={ordersData.find((o) => getId(o) === editOrderId)!}
          onSave={(updatedOrder) => {
            handleEdit(updatedOrder);
            setEditOrderId(null);
          }}
          onClose={() => setEditOrderId(null)}
          open={true}
          customer={filteredCustomers}
        />
      )}

      {/* Add Order Modal - Rendered outside table structure */}
      <AddOrderPopover
        isOpen={showAddOrder}
        onAddOrder={(newOrder) => {
          handleAdd(newOrder);
          setShowAddOrder(false);
        }}
        onClose={() => setShowAddOrder(false)}
      />

      <OrderDetailsModal
        order={
          selectedOrderId
            ? ordersData.find((o) => getId(o) === selectedOrderId) || null
            : null
        }
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
}
