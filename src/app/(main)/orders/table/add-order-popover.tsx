'use client';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatus, PaymentStatus } from '../data';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Agent, Customer, Order, Product } from '@/types/interface';
import { formatPrice } from '@/utils/formatters';
import { useFetch } from '@/hooks/use-fetch';
import { validateNumber, validateRequired } from '@/lib/validations';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useUser } from '@/hooks/use-user';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { getId } from '@/utils/helper';

interface AddOrderPopoverProps {
  onAddOrder: (order: Order) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ValidationErrors {
  customer?: string;
  address?: string;
  product?: string;
  item?: string;
  quantity?: string;
  total?: string;
}
type OrderForm = {
  customer: Customer | null;
  address: string;
  product: Product | null;
  productType: string;
  item: string;
  quantity: number;
  total: number;
  payment: Order['payment'];
  status: Order['status'];
};

export function AddOrderPopover({
  onAddOrder,
  isOpen = false,
  onClose,
}: AddOrderPopoverProps) {
  const [internalIsOpen] = useState(false);

  const { data: customersData } = useFetch<Customer>('customer', false, false);
  const { data: productsData } = useFetch<Product>('product', false, false);
  const filteredCustomers = useFilteredCustomers(customersData);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const initialData = useMemo(
    () => ({
      customer: null as Customer | null,
      address: '',
      product: null as Product | null,
      productType: 'Physical' as
        | 'Physical'
        | 'Digital'
        | 'Service'
        | 'Subscription',
      item: '',
      quantity: 0,
      total: 0,
      payment: 'Unpaid' as PaymentStatus,
      status: 'Pending' as OrderStatus,
    }),
    []
  );

  const validationRules = {
    address: (v: string) => validateRequired(v, 'Address'),
    quantity: (v: number) => validateNumber(v, 'Quantity'),
  };

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleCancel,
    validateForm,
    isFormValid,
    customerInputValue,
    setCustomerInputValue,
    productInputValue,
    setProductInputValue,
  } = useFormHandler<OrderForm>(
    initialData,
    isModalOpen,
    validationRules,
    onClose
  );

  const { handleSubmit, loading } = useFormSubmit<OrderForm>();
  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/order',
      buildBody: (data) => ({
        customer: data.customer?._id,
        address: data.address.trim(),
        product: data.product?._id,
        productType: data.productType,
        item: data.item.trim(),
        quantity: data.quantity,
        total: data.total,
        payment: data.payment,
        status: data.status,
      }),
      onSuccess: (result: Order) => {
        const orderWithRelations: Order = {
          ...result,
          customer: formData.customer,
          product: formData.product,
        };

        onAddOrder(orderWithRelations);
        setCustomerInputValue('');
        setProductInputValue('');
      },
      onClose,
      setErrors,
      onError: (err) => {
        setErrors((prev) => ({
          ...prev,
          general: err instanceof Error ? err.message : 'Failed to save order',
        }));
      },
    });

  const validateQuantity = (quantity: number): string | undefined => {
    return validateNumber(quantity, 'Quantity', 0, 999);
  };
  const handleQuantityChange = (value: number) => {
    const qty = value || 0;

    setFormData((prev) => ({
      ...prev,
      quantity: qty,
      total: prev.product ? qty * (prev.product.price || 0) : 0,
    }));

    const quantityError = validateQuantity(value);
    setErrors((prev) => ({ ...prev, quantity: quantityError }));
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[35rem] bg-background border rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-medium text-sm sm:text-base">Add New Order</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create a new order. This data is temporary and will reset on page
              reload.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Customer and Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="customer" className="text-xs">
                  Customer
                </Label>

                <Combobox
                  items={filteredCustomers.map((c) => ({
                    label: c.name,
                    value: c._id,
                  }))}
                  value={formData.customer?._id || ''}
                  onValueChange={(value) => {
                    const selected =
                      filteredCustomers.find((c) => c._id === value) || null;
                    handleChange('customer', selected);
                    setCustomerInputValue(selected?.name || '');
                  }}
                >
                  <ComboboxInput
                    placeholder="Select a customer"
                    value={customerInputValue}
                    onChange={(e) => setCustomerInputValue(e.target.value)}
                    onBlur={() => {
                      const matched = filteredCustomers.find(
                        (c) => c.name === customerInputValue
                      );
                      if (!matched) {
                        setCustomerInputValue('');
                        handleChange('customer', null);
                      }
                    }}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No customer found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.value} value={item.value}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="product" className="text-xs">
                  Product Name
                </Label>

                <Combobox
                  items={productsData.map((p) => ({
                    label: p.name,
                    value: p._id,
                  }))}
                  value={formData.product?._id || ''}
                  onValueChange={(value) => {
                    const selected =
                      productsData.find((p) => p._id === value) || null;
                    setFormData((prev) => ({
                      ...prev,
                      product: selected,
                      item: selected?.code || '',
                      productType: selected?.productType ?? 'Physical',
                      total: selected
                        ? prev.quantity * (selected.price || 0)
                        : 0,
                    }));
                    setProductInputValue(selected?.name || '');
                  }}
                >
                  <ComboboxInput
                    placeholder="Select a Product"
                    value={productInputValue}
                    onChange={(e) => setProductInputValue(e.target.value)}
                    onBlur={() => {
                      const matched = productsData.find(
                        (c) => c.name === productInputValue
                      );
                      if (!matched) {
                        setProductInputValue('');
                        setFormData({ ...formData, product: null });
                      }
                    }}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No product found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.value} value={item.value}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {/* Row 2: Address and Item Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter delivery address"
                />
                {errors.address && (
                  <p className="text-xs text-red-500">{errors.address}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="item" className="text-xs">
                  Item Code
                </Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => handleChange('item', e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.item ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter item code"
                  disabled
                />
                {errors.item && (
                  <p className="text-xs text-red-500">{errors.item}</p>
                )}
              </div>
            </div>

            {/* Row 3: Product Type and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType" className="text-xs">
                  Product Type
                </Label>
                <Select
                  value={formData.productType ?? 'Physical'}
                  onValueChange={(
                    value: 'Physical' | 'Digital' | 'Service' | 'Subscription'
                  ) => handleChange('productType', value)}
                  disabled
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">
                  Order Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: OrderStatus) =>
                    handleChange('status', value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Quantity and Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="quantity"
                  className="text-xs flex justify-between"
                >
                  Quantity
                  <span className="text-muted-foreground">
                    x {formatPrice(formData.product?.price || 0)}
                  </span>
                </Label>

                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.quantity ? 'border-red-500' : ''
                  }`}
                  placeholder="1"
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="total" className="text-xs">
                  Total
                </Label>
                <Input
                  id="total"
                  type="text"
                  step="0.01"
                  min="0"
                  value={formatPrice(formData.total)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.total ? 'border-red-500' : ''
                  }`}
                  placeholder="0.00"
                  disabled
                />
                {errors.total && (
                  <p className="text-xs text-red-500">{errors.total}</p>
                )}
              </div>
            </div>

            {/* Row 5: Payment Status */}
            <div className="space-y-2">
              <Label htmlFor="payment" className="text-xs">
                Payment Status
              </Label>
              <Select
                value={formData.payment}
                onValueChange={(value: PaymentStatus) =>
                  handleChange('payment', value)
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 sm:h-7 text-xs order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="h-8 sm:h-7 text-xs order-1 sm:order-2"
                disabled={!isFormValid() || loading}
              >
                {loading ? 'Adding Order...' : 'Add Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
