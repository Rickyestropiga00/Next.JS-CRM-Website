'use client';

import React, { useState } from 'react';
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
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { validateRequired, validateNumber } from '@/lib/validations';
import { OrderStatus, PaymentStatus } from '@/app/data/orders.ts';
import { toast } from 'sonner';
import { Customer, Order, Product } from '@/types/interface';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { formatPrice } from '@/utils/formatters';
import { useFetch } from '@/hooks/use-fetch';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { useTranslations } from 'next-intl';

interface EditOrderPopoverProps {
  order: Order;
  onSave: (updatedOrder: Order) => void;
  onClose: () => void;
  open: boolean;
  customer: Customer[];
}

export function EditOrderPopover({
  order,
  onSave,
  onClose,
  open,
  customer,
}: EditOrderPopoverProps) {
  const t = useTranslations();
  const validationRules = {
    address: (v: string) =>
      validateRequired(v, t('Forms.fields.address'), t, 1),
    quantity: (v: number) => {
      if (v === null || v === undefined) {
        return 'Quantity is required';
      }

      return validateNumber(Number(v), t('Orders.fields.quantity'), t);
    },
  };

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    isFormValid,
    setFormData,
    setErrors,
    handleCancel,
    hasChanges,
  } = useFormHandler<Order>(order, open, validationRules, () => onClose());
  const { data: customersData } = useFetch<Customer>('customers', false, false); // false, false to get database data only
  const { data: productsData } = useFetch<Product>('products', false, false);
  const [inputValue, setInputValue] = useState('');
  const [productInputValue, setProductInputValue] = useState('');
  const ordersT = useTranslations('Orders');
  const productTypeT = useTranslations('ProductTypes');
  const buttonsT = useTranslations('Buttons');
  const statusesT = useTranslations('Statuses');
  const paymentT = useTranslations('Payment');

  // Reset form data when order changes or popover opens
  React.useEffect(() => {
    if (open) {
      setInputValue(
        typeof order.customer === 'string'
          ? order.customer
          : order.customer?.name || ''
      );
      setProductInputValue(
        typeof order.product === 'string'
          ? order.product
          : order.product?.name || ''
      );
    }
  }, [order, open]);
  const { handleSubmit, loading } = useFormSubmit<Order>();
  const toastId = 'order-update';

  const onSubmit = (e: React.FormEvent) => {
    toast.loading('Saving changes...', { id: toastId });

    if (order._id) {
      handleSubmit(e, formData, validateForm, {
        url: `/api/orders/${order._id}`,
        method: 'PUT',
        buildBody: (data) => ({
          ...data,
          address: data.address.trim(),
          productType: data.productType,
          item: data.item.trim(),
          quantity: data.quantity,
          total: data.total,
          payment: data.payment,
          status: data.status,
        }),
        onSuccess: (result) => {
          const savedOrder: Order = {
            ...result.data,
            customer:
              customersData.find((c) => c._id === result.data.customer) || null,
            product:
              productsData.find((p) => p._id === result.data.product) || null,
          };
          onSave(savedOrder);
          toast.success(result.message, { id: toastId });
        },
        onError: (err) => {
          console.error(err);
          toast.error('Failed to update order', { id: toastId });
        },

        setErrors,
        onClose,
      });
    } else {
      if (validateForm()) {
        const selectedProduct =
          typeof formData.product === 'string'
            ? productsData.find((p) => p._id === formData.product)
            : formData.product;

        const selectedCustomer =
          typeof formData.customer === 'string'
            ? customersData.find((c) => c._id === formData.customer)
            : formData.customer;

        const savedOrder: Order = {
          ...formData,
          customer: selectedCustomer || formData.customer,
          product: selectedProduct || formData.product,
        };
        onSave(savedOrder);
        toast.success('Order updated locally', { id: toastId });
        onClose();
      }
    }
  };

  const validateQuantity = (quantity: number): string | undefined => {
    return validateNumber(quantity, t('Orders.fields.quantity'), t, 0, 999);
  };

  const handleQuantityChange = (value: number) => {
    const qty = value || 0;

    setFormData((prev) => ({
      ...prev,
      quantity: qty,
      total:
        prev.product && typeof prev.product !== 'string'
          ? qty * (prev.product.price || 0)
          : 0,
    }));
    const quantityError = validateQuantity(value);
    setErrors((prev) => ({ ...prev, quantity: quantityError }));
  };

  const productPrice =
    formData.product && typeof formData.product !== 'string'
      ? formData.product.price
      : 0;

  return (
    <ModalWrapper open={open} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            {' '}
            {ordersT('modal.editTitle')}{' '}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {ordersT('modal.editDescription')}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Order ID and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-xs">
                {ordersT('fields.orderId')}
              </Label>
              <Input
                id="id"
                value={formData.orderId ?? formData.id}
                disabled
                className="h-8 sm:h-9 text-xs bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {ordersT('fields.orderIdNote')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">
                {ordersT('fields.orderDate')}
              </Label>
              <Input
                id="date"
                type="date"
                value={
                  order.createdAt
                    ? new Date(order.createdAt).toISOString().slice(0, 10)
                    : ''
                }
                onChange={(e) =>
                  setFormData({ ...formData, createdAt: e.target.value })
                }
                className="h-8 sm:h-9 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Customer and Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-xs">
                {ordersT('fields.customer')}
              </Label>

              <Combobox
                items={customer.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
                value={
                  typeof formData.customer === 'string'
                    ? ''
                    : formData.customer?._id || ''
                }
                onValueChange={(value) => {
                  const selected =
                    customer.find((c) => c._id === value) || null;
                  setFormData({ ...formData, customer: selected });
                  setInputValue(selected?.name || '');
                }}
              >
                <ComboboxInput
                  placeholder={ordersT('placeholders.selectCustomer')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => {
                    const matched = customer.find((c) => c.name === inputValue);
                    if (!matched) {
                      setInputValue('');
                      setFormData({ ...formData, customer: null });
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {ordersT('fallback.noCustomer')}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.customer && (
                <p className="text-xs text-red-500">{errors.customer}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs">
                {ordersT('fields.address')}
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="h-8 sm:h-9 text-xs"
                placeholder={ordersT('placeholders.deliveryAddress')}
              />
            </div>
          </div>

          {/* Row 3: Product and Product Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-xs">
                {ordersT('fields.productName')}
              </Label>
              <Combobox
                items={productsData.map((p) => ({
                  label: p.name,
                  value: p._id,
                }))}
                value={
                  typeof formData.product === 'string'
                    ? ''
                    : formData.product?._id || ''
                }
                onValueChange={(value) => {
                  const selected =
                    productsData.find((c) => c._id === value) || null;
                  setFormData((prev) => ({
                    ...prev,
                    product: selected,
                    item: selected?.code || '',
                    productType: selected?.productType ?? 'Physical',
                    total: selected ? prev.quantity * (selected.price || 0) : 0,
                  }));
                  setProductInputValue(selected?.name || '');
                }}
              >
                <ComboboxInput
                  placeholder={ordersT('placeholders.selectProduct')}
                  value={productInputValue}
                  onChange={(e) => setProductInputValue(e.target.value)}
                  onBlur={() => {
                    const matched = productsData.find(
                      (p) => p.name === productInputValue
                    );
                    if (!matched) {
                      setProductInputValue('');
                      setFormData({ ...formData, product: null });
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxEmpty>{ordersT('fallback.noProduct')}</ComboboxEmpty>
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
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-xs">
                {ordersT('fields.productType')}
              </Label>
              <Select
                value={formData.productType}
                onValueChange={(value) =>
                  setFormData({ ...formData, productType: value })
                }
                disabled
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physical">
                    {productTypeT('physical')}
                  </SelectItem>
                  <SelectItem value="Digital">
                    {productTypeT('digital')}
                  </SelectItem>
                  <SelectItem value="Service">
                    {productTypeT('service')}
                  </SelectItem>
                  <SelectItem value="Subscription">
                    {productTypeT('subscription')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Item Code and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="item" className="text-xs">
                {ordersT('fields.itemCode')}
              </Label>
              <Input
                id="item"
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
                className="h-8 sm:h-9 text-xs"
                placeholder="e.g., LP-PRO-001"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="quantity"
                className="text-xs flex justify-between"
              >
                {ordersT('fields.quantity')}
                <span className="text-muted-foreground">
                  x {formatPrice(productPrice)}
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
          </div>

          {/* Row 5: Total, Payment Status, and Order Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="total" className="text-xs">
                {ordersT('fields.total')} ($)
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
            <div className="space-y-2">
              <Label htmlFor="payment" className="text-xs">
                {ordersT('fields.paymentStatus')}
              </Label>
              <Select
                value={formData.payment}
                onValueChange={(value: PaymentStatus) =>
                  setFormData({ ...formData, payment: value })
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">{paymentT('paid')}</SelectItem>
                  <SelectItem value="Unpaid">{paymentT('unpaid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs">
                {ordersT('fields.orderStatus')}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: OrderStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">
                    {statusesT('pending')}
                  </SelectItem>
                  <SelectItem value="In Transit">
                    {statusesT('inTransit')}
                  </SelectItem>
                  <SelectItem value="Completed">
                    {statusesT('completed')}
                  </SelectItem>
                  <SelectItem value="Canceled">
                    {statusesT('canceled')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-8 sm:h-7 text-xs order-2 sm:order-1"
          >
            {t('Buttons.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            className="h-8 sm:h-7 text-xs order-1 sm:order-2"
            disabled={!isFormValid() || !hasChanges || loading}
          >
            {loading ? t('Orders.buttons.updating') : buttonsT('save')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
