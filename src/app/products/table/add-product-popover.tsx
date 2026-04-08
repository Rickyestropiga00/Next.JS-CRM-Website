'use client';
import React, { useEffect, useState } from 'react';
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
import { ProductStatus, ProductTypes } from '../data';
import Image from 'next/image';
import { Product } from '@/types/interface';

interface AddProductPopoverProps {
  onAddProduct: (product: Product) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ValidationErrors {
  name?: string;
  code?: string;
  price?: string;
  stock?: string;
}

export function AddProductPopover({
  onAddProduct,
  isOpen = false,
  onClose,
}: AddProductPopoverProps) {
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    productType: 'Physical' as ProductTypes,
    stock: '',
    price: '',
    status: 'Active' as ProductStatus,
    image: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when popover opens
  React.useEffect(() => {
    if (isModalOpen) {
      setFormData({
        name: '',
        code: '',
        productType: 'Physical',
        stock: '',
        price: '',
        status: 'Active',
        image: '',
      });
      setErrors({});
    }
  }, [isModalOpen]);
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    return undefined;
  };

  const validateCode = (code: string): string | undefined => {
    if (!code.trim()) return 'Product code is required';
    return undefined;
  };

  const validatePrice = (price: string): string | undefined => {
    if (!price.trim()) return 'Price is required';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0)
      return 'Price must be a positive number';
    return undefined;
  };

  const validateStock = (stock: string): string | undefined => {
    if (!stock.trim()) return 'Stock is required';
    const numStock = parseInt(stock);
    if (isNaN(numStock) || numStock < 0)
      return 'Stock must be a non-negative number';
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

    const stockError = validateStock(formData.stock);
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
      !validateStock(formData.stock)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('code', formData.code.trim());
      formDataToSend.append('productType', formData.productType);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('status', formData.status);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch('/api/product', {
        method: 'POST',
        body: formDataToSend,
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      switch (response.status) {
        case 201:
          onAddProduct(data);
          setImagePreview(null);
          setImageFile(null);
          break;
        case 400:
          throw new Error(data.error || 'Validation error');
        default:
          throw new Error('Failed to save product');
      }

      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save product.';

      setErrors((prev) => ({
        ...prev,
        code: message,
      }));
    }
  };

  const handleCancel = () => {
    if (onClose) {
      setImagePreview(null);
      onClose();
    }
  };
  const handleImageChange = (file: File | null) => {
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  const getImageSrc = () => {
    if (imagePreview) return imagePreview;
    if (formData.image?.trim()) return formData.image;
    return '/products/product-1.webp';
  };
  const imageSrc = getImageSrc();

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    // Always validate and update errors when name changes
    const nameError = validateName(value);
    setErrors((prev) => ({ ...prev, name: nameError }));
  };

  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value });
    // Always validate and update errors when code changes
    const codeError = validateCode(value);
    setErrors((prev) => ({ ...prev, code: codeError }));
  };

  const handlePriceChange = (value: string) => {
    setFormData({ ...formData, price: value });
    // Always validate and update errors when price changes
    const priceError = validatePrice(value);
    setErrors((prev) => ({ ...prev, price: priceError }));
  };

  const handleStockChange = (value: string) => {
    setFormData({ ...formData, stock: value });
    // Always validate and update errors when stock changes
    const stockError = validateStock(value);
    setErrors((prev) => ({ ...prev, stock: stockError }));
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
            <h4 className="font-medium text-sm sm:text-base">
              Add New Product
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create a new product. This data is temporary and will reset on
              page reload.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
            encType="multipart/form-data"
          >
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2 flex flex-col items-center">
                <Label htmlFor="productImage" className="text-xs">
                  Product Image
                </Label>

                <Label
                  htmlFor="productImage"
                  className="relative cursor-pointer block w-24 h-24 border rounded-md overflow-hidden "
                >
                  {imageSrc ? (
                    imageSrc.startsWith('blob:') ? (
                      <Image
                        src={imageSrc}
                        alt="Preview"
                        className="max-w-full max-h-full object-cover"
                        fill
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt="Preview"
                        className="object-cover w-full h-full"
                        fill
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                      Upload
                    </div>
                  )}

                  <Input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                </Label>
              </div>
            </div>
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
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter product name"
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
                    errors.code ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter product code"
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
                <Select
                  value={formData.productType}
                  onValueChange={(value: ProductTypes) =>
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
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.price ? 'border-red-500' : ''
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
                    errors.stock ? 'border-red-500' : ''
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-xs text-red-500">{errors.stock}</p>
                )}
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
                onClick={handleSubmit}
                className="h-8 sm:h-7 text-xs order-1 sm:order-2"
                disabled={!isFormValid()}
              >
                Add Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
