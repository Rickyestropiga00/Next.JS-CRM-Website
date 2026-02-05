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
import { Product, ProductStatus, ProductType } from "../data";

interface EditProductPopoverProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onClose: () => void;
  open: boolean;
}

interface ValidationErrors {
  name?: string;
  code?: string;
  price?: string;
  stock?: string;
}

export function EditProductPopover({
  product,
  onSave,
  onClose,
  open,
}: EditProductPopoverProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when product changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(product);
      setErrors({});
    }
  }, [product, open]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Product name is required";
    if (name.trim().length < 2)
      return "Product name must be at least 2 characters";
    return undefined;
  };

  const validateCode = (code: string): string | undefined => {
    if (!code.trim()) return "Product code is required";
    if (code.trim().length < 3)
      return "Product code must be at least 3 characters";
    return undefined;
  };

  const validatePrice = (price: number): string | undefined => {
    if (price <= 0) return "Price must be greater than 0";
    if (price > 999999.99) return "Price cannot exceed $999,999.99";
    return undefined;
  };

  const validateStock = (
    stock: number,
    type: ProductType,
  ): string | undefined => {
    if (type === "Physical" && stock < 0) return "Stock cannot be negative";
    if (type === "Physical" && stock > 999999)
      return "Stock cannot exceed 999,999";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const codeError = validateCode(formData.code);
    if (codeError) newErrors.code = codeError;

    const priceError = validatePrice(formData.price);
    if (priceError) newErrors.price = priceError;

    const stockError = validateStock(formData.stock, formData.type);
    if (stockError) newErrors.stock = stockError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    return (
      !validateName(formData.name) &&
      !validateCode(formData.code) &&
      !validatePrice(formData.price) &&
      !validateStock(formData.stock, formData.type)
    );
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setFormData(product); // Reset form data
    setErrors({});
    onClose();
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    if (errors.name) {
      const nameError = validateName(value);
      setErrors((prev) => ({ ...prev, name: nameError }));
    }
  };

  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value });
    if (errors.code) {
      const codeError = validateCode(value);
      setErrors((prev) => ({ ...prev, code: codeError }));
    }
  };

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({ ...formData, price: numValue });
    if (errors.price) {
      const priceError = validatePrice(numValue);
      setErrors((prev) => ({ ...prev, price: priceError }));
    }
  };

  const handleStockChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, stock: numValue });
    if (errors.stock) {
      const stockError = validateStock(numValue, formData.type);
      setErrors((prev) => ({ ...prev, stock: stockError }));
    }
  };

  const handleTypeChange = (value: ProductType) => {
    setFormData({ ...formData, type: value });
    // Reset stock to 0 for non-physical products
    if (value !== "Physical") {
      setFormData((prev) => ({ ...prev, stock: 0 }));
    }
    // Clear stock error if type changes
    if (errors.stock) {
      setErrors((prev) => ({ ...prev, stock: undefined }));
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
            <h4 className="font-medium text-sm sm:text-base">Edit Product</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update product information. Changes are temporary and will reset
              on page reload.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Row 1: Name and Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs">
                  Product Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.code ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., LP-PRO-001"
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code}</p>
                )}
              </div>
            </div>

            {/* Row 2: Type and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs">
                  Product Type
                </Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
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
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProductStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.price ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-xs">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleStockChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.stock ? "border-red-500" : ""
                  }`}
                  placeholder="0"
                  disabled={formData.type !== "Physical"}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500">{errors.stock}</p>
                )}
                {formData.type !== "Physical" && (
                  <p className="text-xs text-muted-foreground">
                    Not applicable for {formData.type.toLowerCase()} products
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">
                Release Date
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
