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
import {
  validateRequired,
  validateNumber,
  validatePrice,
} from '@/lib/validations';
import { OrderStatus, PaymentStatus } from '../data';
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

interface EditOrderPopoverProps {
  order: Order;
  onSave: (updatedOrder: Order) => void;
  onClose: () => void;
  open: boolean;
}

interface ValidationErrors {
  customer?: string;
  quantity?: string;
  total?: string;
}

export function EditOrderPopover({
  order,
  onSave,
  onClose,
  open,
}: EditOrderPopoverProps) {
  const [formData, setFormData] = useState<Order>(order);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: customersData } = useFetch<Customer>('customer', false, false); // false, false to get database data only
  const { data: productsData } = useFetch<Product>('product', false, false);
  const [inputValue, setInputValue] = useState('');
  const [productInputValue, setProductInputValue] = useState('');

  // Reset form data when order changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(order);
      setErrors({});
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

  // Validation functions using shared utilities
  const validateCustomer = (customer: string): string | undefined => {
    return validateRequired(customer, 'Customer name');
  };

  const validateQuantity = (quantity: number): string | undefined => {
    return validateNumber(quantity, 'Quantity', 0, 999);
  };

  const validateTotal = (total: number): string | undefined => {
    return validatePrice(total, 'Total');
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const customerError = validateCustomer(String(formData.customer));
    if (customerError) newErrors.customer = customerError;

    const quantityError = validateQuantity(formData.quantity);
    if (quantityError) newErrors.quantity = quantityError;

    const totalError = validateTotal(formData.total);
    if (totalError) newErrors.total = totalError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    return (
      !validateCustomer(String(formData.customer)) &&
      !validateQuantity(formData.quantity) &&
      !validateTotal(formData.total)
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isUpdating) return;
    setIsUpdating(true);
    const toastId = 'order-update';

    toast.loading('Saving changes...', { id: toastId });

    if (formData._id) {
      try {
        const res = await fetch(`/api/order/${formData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        let result: any = {};

        try {
          result = await res.json();
        } catch {
          result = { error: 'Server did not return a valid JSON' };
        }

        switch (res.status) {
          case 200:
            const savedOrder: Order = {
              ...result.data,
              customer:
                customersData.find((c) => c._id === result.data.customer) ||
                null,
              product:
                productsData.find((p) => p._id === result.data.product) || null,
            };
            onSave(savedOrder);
            onClose();
            toast.success(result.message, { id: toastId });
            console.log(result.message);
            return;
          case 500:
            throw new Error(result.error);
        }
      } catch (error) {
        console.error(error);
        toast.dismiss(toastId);
      } finally {
        setIsUpdating(false);
      }
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

  const handleCancel = () => {
    setFormData(order); // Reset form data
    setErrors({});
    onClose();
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
          <h4 className="font-medium text-sm sm:text-base">Edit Order</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update order information. Changes are temporary and will reset on
            page reload.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Order ID and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-xs">
                Order ID
              </Label>
              <Input
                id="id"
                value={formData.orderId}
                disabled
                className="h-8 sm:h-9 text-xs bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Order ID cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">
                Order Date
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
                Customer Name
              </Label>

              <Combobox
                items={customersData.map((c) => ({
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
                    customersData.find((c) => c._id === value) || null;
                  setFormData({ ...formData, customer: selected });
                  setInputValue(selected?.name || '');
                }}
              >
                <ComboboxInput
                  placeholder="Select a customer"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => {
                    const matched = customersData.find(
                      (c) => c.name === inputValue
                    );
                    if (!matched) {
                      setInputValue('');
                      setFormData({ ...formData, customer: null });
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
              {errors.customer && (
                <p className="text-xs text-red-500">{errors.customer}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs">
                Shipping Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="h-8 sm:h-9 text-xs"
                placeholder="Enter shipping address"
              />
            </div>
          </div>

          {/* Row 3: Product and Product Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-xs">
                Product Name
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
                  placeholder="Select a product"
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
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-xs">
                Product Type
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
                  <SelectItem value="Physical">Physical</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Item Code and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="item" className="text-xs">
                Item Code
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
                Quantity
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
                Total ($)
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
                Payment Status
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
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
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
                  setFormData({ ...formData, status: value })
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
            onClick={handleSave}
            className="h-8 sm:h-7 text-xs order-1 sm:order-2"
            disabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
