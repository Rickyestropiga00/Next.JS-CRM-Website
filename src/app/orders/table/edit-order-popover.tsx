"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus, PaymentStatus } from "../data";

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

  // Reset form data when order changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(order);
      setErrors({});
    }
  }, [order, open]);

  // Validation functions
  const validateCustomer = (customer: string): string | undefined => {
    if (!customer.trim()) return "Customer name is required";
    if (customer.trim().length < 2)
      return "Customer name must be at least 2 characters";
    return undefined;
  };

  const validateQuantity = (quantity: number): string | undefined => {
    if (quantity <= 0) return "Quantity must be greater than 0";
    if (quantity > 999) return "Quantity cannot exceed 999";
    return undefined;
  };

  const validateTotal = (total: number): string | undefined => {
    if (total <= 0) return "Total must be greater than 0";
    if (total > 999999.99) return "Total cannot exceed $999,999.99";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const customerError = validateCustomer(formData.customer);
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
      !validateCustomer(formData.customer) &&
      !validateQuantity(formData.quantity) &&
      !validateTotal(formData.total)
    );
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setFormData(order); // Reset form data
    setErrors({});
    onClose();
  };

  const handleCustomerChange = (value: string) => {
    setFormData({ ...formData, customer: value });
    if (errors.customer) {
      const customerError = validateCustomer(value);
      setErrors((prev) => ({ ...prev, customer: customerError }));
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, quantity: numValue });
    if (errors.quantity) {
      const quantityError = validateQuantity(numValue);
      setErrors((prev) => ({ ...prev, quantity: quantityError }));
    }
  };

  const handleTotalChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({ ...formData, total: numValue });
    if (errors.total) {
      const totalError = validateTotal(numValue);
      setErrors((prev) => ({ ...prev, total: totalError }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[35rem] bg-background border rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
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
                  value={formData.id}
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
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
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
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.customer ? "border-red-500" : ""
                  }`}
                />
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
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) =>
                    setFormData({ ...formData, product: e.target.value })
                  }
                  className="h-8 sm:h-9 text-xs"
                  placeholder="Enter product name"
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-xs">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.quantity ? "border-red-500" : ""
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
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.total ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
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
      </div>
    </div>
  );
}
