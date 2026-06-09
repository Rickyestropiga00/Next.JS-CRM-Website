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
import { toast } from 'sonner';
import Image from 'next/image';
import { Product, ProductStatus, ProductTypes } from '@/types/interface';
import {
  validateNumber,
  validateRequired,
  validatePrice,
} from '@/lib/validations';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useTranslations } from 'next-intl';

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
  stock?: number;
}

export function EditProductPopover({
  product,
  onSave,
  onClose,
  open,
}: EditProductPopoverProps) {
  const t = useTranslations();
  const validationRules = {
    name: (v: string) => validateRequired(v, t('Forms.fields.name'), t, 1),
    code: (v: string) => validateRequired(v, t('Products.fields.stock'), t),
    price: (v: number) => validatePrice(Number(v), t),
    stock: (v: number) => {
      if (formData.productType !== 'Physical') return undefined;
      return validateNumber(Number(v), t('Products.fields.stock'), t);
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
  } = useFormHandler<Product>(product, open, validationRules, () => onClose());

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { handleSubmit, loading } = useFormSubmit<Product>();
  const toastId = 'product-image';
  const onSubmit = (e: React.FormEvent) => {
    toast.loading('Saving changes...', { id: toastId });
    if (product._id) {
      handleSubmit(e, formData, validateForm, {
        url: `/api/products/${formData._id}`,
        method: 'PUT',
        buildBody: (data) => ({
          name: data.name.trim(),
          code: data.code.trim(),
          price: Number(data.price),
          stock: data.productType === 'Physical' ? Number(data.stock) : 0,
          productType: data.productType,
          status: data.status,
          date: data.date,
        }),
        onSuccess: async (result) => {
          if (imageFile) {
            const formDataImg = new FormData();
            formDataImg.append('image', imageFile);

            await fetch(`/api/products/image/${formData._id}`, {
              method: 'PUT',
              body: formDataImg,
            });
          }

          onSave(result.data);
          toast.success(result.message, { id: toastId });
        },
        onError: (err) => {
          console.error(err);
          toast.error('Failed to update product', { id: toastId });
        },

        setErrors,
        onClose,
      });
    } else {
      if (validateForm()) {
        let updatedImage = formData.image;
        if (imageFile) {
          updatedImage = URL.createObjectURL(imageFile);
        }

        onSave({
          ...formData,
          image: updatedImage,
        });

        toast.success(t('Messages.updateSuccess', { item: 'Product' }), {
          id: toastId,
        });
        onClose();
      }
    }
  };

  const handleTypeChange = (value: ProductTypes) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        productType: value,
      };

      // only reset stock if not physical
      if (value !== 'Physical') {
        updated.stock = 0;
      }

      return updated;
    });

    if (errors.stock) {
      setErrors((prev) => ({ ...prev, stock: undefined }));
    }
  };

  if (!open) return null;

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFormData((prev) => ({
      ...prev,
      image: previewUrl,
    }));
  };
  const getImageSrc = () => {
    if (imagePreview) return imagePreview;

    if (typeof formData.image === 'string' && formData.image.trim()) {
      return formData.image;
    }

    if (formData._id) {
      return `/api/products/image/${formData._id}`;
    }

    return '/products/product-1.webp';
  };
  const imageSrc = getImageSrc();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[35rem] bg-background border rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-medium text-sm sm:text-base">
              {t('Products.modal.editTitle')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('Products.modal.editDescription')}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2 flex flex-col items-center">
                <Label htmlFor="productImage" className="text-xs">
                  {t('Products.image.label')}
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
                        className="max-w-full max-h-full object-contain"
                        fill
                        unoptimized
                        sizes="160px"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt="Preview"
                        className="object-contain w-full h-full"
                        fill
                        unoptimized
                        sizes="160px"
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                      {t('Buttons.upload')}
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
                  {t('Products.fields.productName')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs">
                  {t('Products.fields.productCode')}
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.code ? 'border-red-500' : ''
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
                  {t('Products.fields.productType')}
                </Label>
                <Select
                  value={formData.productType}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">
                      {t('ProductTypes.physical')}
                    </SelectItem>
                    <SelectItem value="Digital">
                      {t('ProductTypes.digital')}
                    </SelectItem>
                    <SelectItem value="Service">
                      {t('ProductTypes.service')}
                    </SelectItem>
                    <SelectItem value="Subscription">
                      {t('ProductTypes.subscription')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">
                  {t('Products.fields.status')}
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
                    <SelectItem value="Active">
                      {t('Statuses.active')}
                    </SelectItem>
                    <SelectItem value="Disabled">
                      {t('Statuses.disabled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs">
                  {t('Products.fields.price')} ($)
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
                  {t('Products.fields.stock')}
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
                  disabled={formData.productType !== 'Physical'}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500">{errors.stock}</p>
                )}
                {formData.productType !== 'Physical' && (
                  <p className="text-xs text-muted-foreground">
                    {t('Products.messages.notApplicableStock', {
                      type: formData.productType.toLowerCase(),
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">
                {t('Products.fields.releaseDate')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
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
              {t('Buttons.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={onSubmit}
              className="h-8 sm:h-7 text-xs order-1 sm:order-2"
              disabled={!isFormValid() || !hasChanges || loading}
            >
              {loading ? t('Buttons.saving') : t('Buttons.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
