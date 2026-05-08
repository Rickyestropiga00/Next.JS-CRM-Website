'use client';
import React, { useEffect, useMemo, useState } from 'react';
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

import Image from 'next/image';
import { Product, ProductStatus, ProductTypes } from '@/types/interface';
import {
  validateNumber,
  validatePrice,
  validateRequired,
} from '@/lib/validations';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';

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
type ProductForm = {
  name: string;
  code: string;
  productType: string;
  stock: string;
  price: string;
  status: string;
  image: string;
};

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

  const initialData = useMemo(
    () => ({
      name: '',
      code: '',
      productType: 'Physical' as ProductTypes,
      stock: '',
      price: '',
      status: 'Active' as ProductStatus,
      image: '',
    }),
    []
  );
  const validationRules = {
    name: (v: string) => validateRequired(v, 'Name', 1),
    code: (v: string) => validateRequired(v, 'Code'),
    stock: (v: string) => validateNumber(Number(v), 'Stock'),
    price: (v: string) => validatePrice(Number(v)),
  };
  const {
    formData,
    errors,
    setErrors,
    handleChange,
    handleCancel,
    validateForm,
    isFormValid,
  } = useFormHandler<ProductForm>(
    initialData,
    isModalOpen,
    validationRules,
    onClose
  );
  const { handleSubmit, loading } = useFormSubmit<ProductForm>();

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/product',
      formData: true,

      buildBody: () => {
        const fd = new FormData();

        fd.append('name', formData.name.trim());
        fd.append('code', formData.code.trim());
        fd.append('productType', formData.productType);
        fd.append('stock', String(formData.stock));
        fd.append('price', String(formData.price));
        fd.append('status', formData.status);

        if (imageFile) {
          fd.append('image', imageFile);
        }

        return fd;
      },

      onSuccess: (result: Product) => {
        onAddProduct(result);
        setImagePreview(null);
        setImageFile(null);
      },

      onClose: () => {
        setImagePreview(null);
        setImageFile(null);
      },
      setErrors,
      onError: (err) => {
        setErrors((prev) => ({
          ...prev,
          general:
            err instanceof Error ? err.message : 'Failed to save product',
        }));
      },
    });

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
            onSubmit={onSubmit}
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
                  onChange={(e) => handleChange('name', e.target.value)}
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
                  onChange={(e) => handleChange('code', e.target.value)}
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
                    handleChange('productType', value)
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
                    handleChange('status', value)
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
                  onChange={(e) => handleChange('price', e.target.value)}
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
                  onChange={(e) => handleChange('stock', e.target.value)}
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

            {errors.general && (
              <p className="text-xs text-red-500 font-bold text-center">
                {errors.general}
              </p>
            )}

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
                {loading ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
