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
import { Textarea } from '@/components/ui/textarea';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import {
  validateRequired,
  validateEmail,
  validatePhone,
} from '@/lib/validations';
import { Customer, CustomerStatus } from '@/types/interface';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';

interface AddCustomerPopoverProps {
  onAddCustomer: (customer: Customer) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
}

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: Customer['status'];
  notes: string;
};

export function AddCustomerPopover({
  onAddCustomer,
  isOpen = false,
  onClose,
}: AddCustomerPopoverProps) {
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const initialData = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'Lead' as CustomerStatus,
      notes: '',
    }),
    []
  );
  const validationRules = {
    name: (v: string) => validateRequired(v, 'Name'),
    email: (v: string) => validateEmail(v),
    phone: (v: string) => validatePhone(v),
  };

  const {
    formData,
    errors,
    setErrors,
    handleChange,
    handleCancel,
    isFormValid,
    validateForm,
  } = useFormHandler<CustomerForm>(
    initialData,
    isModalOpen,
    validationRules,
    onClose
  );

  const { handleSubmit, loading } = useFormSubmit<CustomerForm>();
  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/customer',
      buildBody: (data) => ({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company.trim(),
        status: data.status,
        notes: data.notes.trim(),
      }),
      onSuccess: (result: Customer) => {
        onAddCustomer(result);
      },
      onClose,
      setErrors,
      onError: (err) => {
        setErrors((prev) => ({
          ...prev,
          general:
            err instanceof Error ? err.message : 'Failed to save customer',
        }));
      },
    });

  return (
    <ModalWrapper open={isModalOpen} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">Add New Customer</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create a new customer. This data is temporary and will reset on page
            reload.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          {/* Row 1: Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
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

          {/* Row 2: Email and Company */}
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
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs">
                Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="h-8 sm:h-9 text-xs"
                placeholder="Enter company name (optional)"
              />
            </div>
          </div>

          {/* Row 3: Status */}
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
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('notes', e.target.value)
              }
              placeholder="Add notes..."
              className="h-16 sm:h-20 text-xs resize-none"
            />
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
              {loading ? 'Adding Customer...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
