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

export function AddOrderPopover({
  onAddOrder,
  isOpen = false,
  onClose,
}: AddOrderPopoverProps) {
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  // Generate a unique temporary ID (ORD-031, ORD-032, ORD-033, etc.)
  const generateTempId = (): string => {
    const random = Math.floor(Math.random() * 70) + 31; // Generate 31 to 99
    return `ORD-${random.toString().padStart(3, "0")}`;
  };

  const [formData, setFormData] = useState({
    customer: "",
    address: "",
    product: "",
    productType: "Physical" as
      | "Physical"
      | "Digital"
      | "Service"
      | "Subscription",
    item: "",
    quantity: "",
    total: "",
    payment: "Unpaid" as PaymentStatus,
    status: "Pending" as OrderStatus,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when popover opens
  React.useEffect(() => {
    if (isModalOpen) {
      setFormData({
        customer: "",
        address: "",
        product: "",
        productType: "Physical",
        item: "",
        quantity: "",
        total: "",
        payment: "Unpaid",
        status: "Pending",
      });
      setErrors({});
    }
  }, [isModalOpen]);

  // Validation functions
  const validateCustomer = (customer: string): string | undefined => {
    if (!customer.trim()) return "Customer name is required";
    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) return "Address is required";
    return undefined;
  };

  const validateProduct = (product: string): string | undefined => {
    if (!product.trim()) return "Product name is required";
    return undefined;
  };

  const validateItem = (item: string): string | undefined => {
    if (!item.trim()) return "Item code is required";
    return undefined;
  };

  const validateQuantity = (quantity: string): string | undefined => {
    if (!quantity.trim()) return "Quantity is required";
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0)
      return "Quantity must be a positive number";
    return undefined;
  };

  const validateTotal = (total: string): string | undefined => {
    if (!total.trim()) return "Total is required";
    const numTotal = parseFloat(total);
    if (isNaN(numTotal) || numTotal <= 0)
      return "Total must be a positive number";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const customerError = validateCustomer(formData.customer);
    if (customerError) newErrors.customer = customerError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const productError = validateProduct(formData.product);
    if (productError) newErrors.product = productError;

    const itemError = validateItem(formData.item);
    if (itemError) newErrors.item = itemError;

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
      !validateAddress(formData.address) &&
      !validateProduct(formData.product) &&
      !validateItem(formData.item) &&
      !validateQuantity(formData.quantity) &&
      !validateTotal(formData.total)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newOrder: Order = {
      id: generateTempId(), // Generate unique temporary ID
      date: new Date().toISOString().split("T")[0],
      customer: formData.customer.trim(),
      address: formData.address.trim(),
      product: formData.product.trim(),
      productType: formData.productType,
      item: formData.item.trim(),
      quantity: parseInt(formData.quantity),
      total: parseFloat(formData.total),
      payment: formData.payment,
      status: formData.status,
    };

    onAddOrder(newOrder);
    // Let parent component handle closing
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleCustomerChange = (value: string) => {
    setFormData({ ...formData, customer: value });
    // Always validate and update errors when customer changes
    const customerError = validateCustomer(value);
    setErrors((prev) => ({ ...prev, customer: customerError }));
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, address: value });
    // Always validate and update errors when address changes
    const addressError = validateAddress(value);
    setErrors((prev) => ({ ...prev, address: addressError }));
  };

  const handleProductChange = (value: string) => {
    setFormData({ ...formData, product: value });
    // Always validate and update errors when product changes
    const productError = validateProduct(value);
    setErrors((prev) => ({ ...prev, product: productError }));
  };

  const handleItemChange = (value: string) => {
    setFormData({ ...formData, item: value });
    // Always validate and update errors when item changes
    const itemError = validateItem(value);
    setErrors((prev) => ({ ...prev, item: itemError }));
  };

  const handleQuantityChange = (value: string) => {
    setFormData({ ...formData, quantity: value });
    // Always validate and update errors when quantity changes
    const quantityError = validateQuantity(value);
    setErrors((prev) => ({ ...prev, quantity: quantityError }));
  };

  const handleTotalChange = (value: string) => {
    setFormData({ ...formData, total: value });
    // Always validate and update errors when total changes
    const totalError = validateTotal(value);
    setErrors((prev) => ({ ...prev, total: totalError }));
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Customer and Product */}
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
                  placeholder="Enter customer name"
                />
                {errors.customer && (
                  <p className="text-xs text-red-500">{errors.customer}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product" className="text-xs">
                  Product Name
                </Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.product ? "border-red-500" : ""
                  }`}
                  placeholder="Enter product name"
                />
                {errors.product && (
                  <p className="text-xs text-red-500">{errors.product}</p>
                )}
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
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.address ? "border-red-500" : ""
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
                  onChange={(e) => handleItemChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.item ? "border-red-500" : ""
                  }`}
                  placeholder="Enter item code"
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
                  value={formData.productType}
                  onValueChange={(
                    value: "Physical" | "Digital" | "Service" | "Subscription",
                  ) => setFormData({ ...formData, productType: value })}
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

            {/* Row 4: Quantity and Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="total" className="text-xs">
                  Total
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
            </div>

            {/* Row 5: Payment Status */}
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
                onClick={handleSubmit}
                className="h-8 sm:h-7 text-xs order-1 sm:order-2"
                disabled={!isFormValid()}
              >
                Add Order
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
