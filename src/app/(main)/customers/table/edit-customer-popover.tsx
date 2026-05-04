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
import { Textarea } from '@/components/ui/textarea';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import {
  validateEmail,
  validatePhone,
  validateRequired,
} from '@/lib/validations';
import { Customer, CustomerStatus } from '@/types/interface';
import { toast } from 'sonner';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';

interface EditCustomerPopoverProps {
  customer: Customer;
  onSave: (updatedCustomer: Customer) => void;
  onClose: () => void;
  open: boolean;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
}

export function EditCustomerPopover({
  customer,
  onSave,
  onClose,
  open,
}: EditCustomerPopoverProps) {
  const validationRules = {
    name: (v: string) => validateRequired(v, 'Name'),
    email: (v: string) => validateEmail(v),
    phone: (v: string) => validatePhone(v),
  };

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    isFormValid,
    setErrors,
    handleCancel,
    hasChanges,
  } = useFormHandler<Customer>(customer, open, validationRules, () =>
    onClose()
  );

  const { handleSubmit, loading } = useFormSubmit<Customer>();
  const toastId = 'customer-update';

  const onSubmit = (e: React.FormEvent) => {
    toast.loading('Saving Changes...', { id: toastId });
    if (customer._id) {
      handleSubmit(e, formData, validateForm, {
        url: `/api/customer/${customer._id}`,
        method: 'PUT',
        buildBody: (data) => ({
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          company: data.company?.trim() ? data.company.trim() : undefined,
          status: data.status,
          notes: data.notes?.trim() ? data.notes.trim() : undefined,
        }),
        onSuccess: (result) => {
          onSave(result.data);
          toast.success(result.message, { id: toastId });
        },
        onError: (err) => {
          console.error(err);
          toast.error('Failed to update customer', { id: toastId });
        },

        setErrors,
        onClose,
      });
    } else {
      if (validateForm()) {
        onSave(formData);
        toast.success('Customer updated locally', { id: toastId });
        onClose();
      }
    }
  };

  return (
    <ModalWrapper open={open} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">Edit Customer</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update customer information. Changes are temporary and will reset on
            page reload.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Name and Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                Name
              </Label>
              <Input
                id="name"
                value={formData?.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-8 sm:h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs">
                Company
              </Label>
              <Input
                id="company"
                value={formData?.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                className="h-8 sm:h-9 text-xs"
                placeholder="Company name (optional)"
              />
            </div>
          </div>

          {/* Row 2: Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Row 3: Status (full width) */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: CustomerStatus) =>
                handleChange('status', value)
              }
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Notes (full width) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('notes', e.target.value)
              }
              placeholder="Add notes..."
              className="h-16 sm:h-20 text-xs resize-none"
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
            onClick={onSubmit}
            className="h-8 sm:h-7 text-xs order-1 sm:order-2"
            disabled={!isFormValid() || !hasChanges || loading}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
