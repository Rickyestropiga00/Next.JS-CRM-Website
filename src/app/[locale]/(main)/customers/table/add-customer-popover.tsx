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
import { Agent, Customer, CustomerStatus } from '@/types/interface';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';
import { getApiErrorField, getApiErrorMessage } from '@/lib/api-messages';
interface AddCustomerPopoverProps {
  onAddCustomer: (customer: Customer) => void;
  isOpen?: boolean;
  onClose?: () => void;
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
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
  setAgents,
}: AddCustomerPopoverProps) {
  const t = useTranslations();
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
    name: (v: string) => validateRequired(v, t('Forms.fields.name'), t, 1),
    email: (v: string) => validateEmail(v, t),
    phone: (v: string) => validatePhone(v, t),
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

  const { user } = useUser();

  const { handleSubmit, loading } = useFormSubmit<CustomerForm>();
  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/customers',
      buildBody: (data) => ({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company.trim(),
        status: data.status,
        notes: data.notes.trim(),
      }),
      onSuccess: (result) => {
        console.log(result);
        onAddCustomer(result);
        if (!user) return;
        setAgents((prev) =>
          prev.map((agent) =>
            agent.userId === user._id
              ? {
                  ...agent,
                  assignedCustomers: [
                    ...(agent.assignedCustomers || []),
                    result._id,
                  ],
                }
              : agent
          )
        );
      },
      onClose,
      setErrors,
      onError: (err) => {
        const message = getApiErrorMessage(err, t);
        const field = getApiErrorField(err);

        if (field) {
          setErrors((prev) => ({ ...prev, [field]: message }));
        } else {
          setErrors((prev) => ({ ...prev, general: message }));
        }
      },
    });

  return (
    <ModalWrapper open={isModalOpen} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            {t('Customers.modal.addTitle')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('Customers.modal.addDescription')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          {/* Row 1: Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                {t('Customers.fields.name')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder={t('Customers.placeholders.name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">
                {t('Customers.fields.phone')}
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
                {t('Customers.fields.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder={t('Forms.placeholders.email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs">
                {t('Customers.fields.company')}
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="h-8 sm:h-9 text-xs"
                placeholder={t('Customers.placeholders.company')}
              />
            </div>
          </div>

          {/* Row 3: Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs">
              {t('Customers.fields.status')}
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
                <SelectItem value="Lead">{t('Statuses.lead')}</SelectItem>
                <SelectItem value="Active">{t('Statuses.active')}</SelectItem>
                <SelectItem value="Inactive">
                  {t('Statuses.inactive')}
                </SelectItem>
                <SelectItem value="Prospect">
                  {t('Statuses.prospect')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Notes (full width) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">
              {t('Customers.fields.notes')}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('notes', e.target.value)
              }
              placeholder={t('Forms.placeholders.notes')}
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
              {t('Buttons.cancel')}
            </Button>
            <Button
              size="sm"
              type="submit"
              className="h-8 sm:h-7 text-xs order-1 sm:order-2"
              disabled={!isFormValid() || loading}
            >
              {loading
                ? t('Customers.buttons.adding')
                : t('Buttons.addCustomer')}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
