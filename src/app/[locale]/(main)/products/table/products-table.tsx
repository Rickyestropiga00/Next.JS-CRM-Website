import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ProductsTableHeader } from './table-header';
import { ProductsTableBody } from './table-body';
import { ProductsPaginationBar } from './pagination-bar';
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
  Product,
  ProductTypes,
  ProductStatus,
  DeleteResponse,
} from '@/types/interface';
import { useTableActions } from '@/hooks/use-table-actions';

// Dynamically import modals to reduce initial bundle size
const EditProductPopover = dynamic(
  () =>
    import('./edit-product-popover').then((mod) => ({
      default: mod.EditProductPopover,
    })),
  { ssr: false }
);

const AddProductPopover = dynamic(
  () =>
    import('./add-product-popover').then((mod) => ({
      default: mod.AddProductPopover,
    })),
  { ssr: false }
);

const ProductDetailsModal = dynamic(
  () =>
    import('./product-details-modal').then((mod) => ({
      default: mod.ProductDetailsModal,
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
import { Trash, Plus, Package } from 'lucide-react';
import { toast } from 'sonner';
import { getId } from '@/utils/helper';
import { useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { Can } from '@/components/auth/can';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';
import { getApiSuccessMessage } from '@/lib/api-messages';
import { useSearchParams } from 'next/navigation';
import { useTableHighlight } from '@/hooks/use-table-highlight';

export function ProductsTable() {
  const t = useTranslations();
  const {
    data: productsData,
    setData: setProductsData,
    loading: productsLoading,
  } = useFetch<Product>('products');
  const { user, loading: userLoading } = useUser();
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const isReady = !productsLoading;

  const statusOptions: { value: ProductStatus; label: string }[] = [
    {
      value: 'Active',
      label: t('Statuses.active'),
    },
    {
      value: 'Disabled',
      label: t('Statuses.disabled'),
    },
  ];

  const typeOptions: { value: ProductTypes; label: string }[] = [
    {
      value: 'Physical',
      label: t('ProductTypes.physical'),
    },
    {
      value: 'Digital',
      label: t('ProductTypes.digital'),
    },
    {
      value: 'Service',
      label: t('ProductTypes.service'),
    },
    {
      value: 'Subscription',
      label: t('ProductTypes.subscription'),
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
  } = useTableActions<Product>({
    data: productsData,
    setData: setProductsData,
    getId: (p) => p.id || p._id || '',

    filtersConfig: {
      searchKeys: ['name', 'code'],
      filterKeys: [
        { key: 'status', defaultValue: 'all' },
        { key: 'productType', defaultValue: 'all' },
      ],
    },
  });

  const { isHighlighted } = useTableHighlight({
    data: productsData,
    highlightId,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    isReady,
    paginatedData: paginated,
    getHighlightValue: (product) => product.productId,
  });

  const { handleDeleteSelected } = useBulkDelete<DeleteResponse>({
    endpoint: '/api/bulk-delete',
    type: 'product',

    onSuccess: (ids, data) => {
      setProductsData((prev) =>
        prev.filter(
          (p) =>
            !(p._id && ids.includes(p._id)) && !(p.id && ids.includes(p.id))
        )
      );

      setSelected([]);
      setShowConfirm(false);
      const message = getApiSuccessMessage(data.message, t, 'Product');
      toast.success(message);
    },

    onError: () => {
      toast.error('Something went wrong');
    },
  });

  if (!user) return null;

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder={t('Products.table.searchPlaceholder')}
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
          <Select
            value={filters.productType}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                productType: value,
              }))
            }
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('Table.filters.allTypes')}
                </SelectItem>
                {typeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
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
                  {t('ConfirmDelete.bulkTitle', { items: 'products' })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('ConfirmDelete.bulkDescription', { items: 'products' })}
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
        </div>

        <Can role={user?.role} action="create" resource="product">
          <Button
            className="flex items-center gap-2 cursor-pointer"
            type="button"
            onClick={() => setShowAddProduct(true)}
          >
            <Plus className="h-4 w-4" />
            {t('Buttons.addProduct')}
          </Button>
        </Can>
      </div>
      {productsData.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="bg-transparent">
                <ProductsTableHeader
                  selected={selected}
                  paginated={paginated}
                  onSelectAll={handleSelectAll}
                  sortBy={sortBy ?? 'productId'}
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
                  productsLoading={productsLoading}
                  isHighlighted={isHighlighted}
                />
              </Table>
            </div>
          </div>

          <ProductsPaginationBar
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
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="font-semibold">No products found</h3>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You don&apos;t have any products yet. Start by adding your first
            product.
          </p>

          <Button className="mt-4" onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      )}

      {/* Edit Product Modal - Rendered outside table structure */}
      {editProductId && (
        <EditProductPopover
          product={productsData.find((p) => getId(p) === editProductId)!}
          onSave={(updatedProduct) => {
            handleEdit(updatedProduct);
            setEditProductId(null);
          }}
          onClose={() => setEditProductId(null)}
          open={true}
        />
      )}

      {/* Add Product Modal - Rendered outside table structure */}
      <Can role={user?.role} action="create" resource="product">
        <AddProductPopover
          isOpen={showAddProduct}
          onAddProduct={(newProduct) => {
            handleAdd(newProduct);
            setShowAddProduct(false);
          }}
          onClose={() => setShowAddProduct(false)}
        />
      </Can>
      <ProductDetailsModal
        product={
          selectedProductId
            ? productsData.find((p) => getId(p) === selectedProductId) || null
            : null
        }
        isOpen={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </>
  );
}
