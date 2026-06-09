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
import { Agent } from '@/types/interface';
import { toast } from 'sonner';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useTranslations } from 'next-intl';

interface EditAgentPopoverProps {
  agent: Agent;
  onSave: (updatedAgent: Agent) => void;
  onClose: () => void;
  open: boolean;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
}

export function EditAgentPopover({
  agent,
  onSave,
  onClose,
  open,
}: EditAgentPopoverProps) {
  const t = useTranslations();
  const validationRules = {
    name: (v: string) => validateRequired(v, t('Forms.fields.name'), t, 1),
    email: (v: string) => validateEmail(v, t),
    phone: (v: string) => validatePhone(v, t),
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
  } = useFormHandler<Agent>(agent, open, validationRules, () => onClose());
  const { handleSubmit, loading } = useFormSubmit<Agent>();
  const toastId = 'agent-update';

  const onSubmit = (e: React.FormEvent) => {
    toast.loading(t('Messages.saving'), { id: toastId });
    if (agent._id) {
      handleSubmit(e, formData, validateForm, {
        url: `/api/agents/${formData._id}`,
        method: 'PUT',

        buildBody: (data) => ({
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          role: data.role,
          status: data.status,
          assignedCustomers: [],
          notes: data.notes?.trim() ? data.notes.trim() : undefined,
        }),

        onSuccess: (result) => {
          toast.success(result.message, { id: toastId });

          onSave(result.data);
        },

        onError: (err) => {
          console.error(err);
          toast.error('Failed to update agent', { id: toastId });
          setErrors((prev) => ({
            ...prev,
            general:
              err instanceof Error ? err.message : 'Failed to save customer',
          }));
        },

        setErrors,
        onClose,
      });
    } else {
      if (validateForm()) {
        onSave(formData);
        toast.success(t('Messages.updateLocal', { item: 'Agents' }), {
          id: toastId,
        });
        onClose();
      }
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            {t('Agents.modal.editTitle')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('Agents.modal.editDescription')}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                {t('Agents.fields.name')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-8 sm:h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">
                {t('Agents.fields.phone')}
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

          {/* Row 2: Email and Role/Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">
                {t('Agents.fields.email')}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="role" className="text-xs">
                  {t('Agents.fields.role')}
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'Admin' | 'Agent' | 'Manager') =>
                    handleChange('role', value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">{t('Roles.admin')}</SelectItem>
                    <SelectItem value="Agent">{t('Roles.agent')}</SelectItem>
                    <SelectItem value="Manager">
                      {t('Roles.manager')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="status" className="text-xs">
                  {t('Agents.fields.status')}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Inactive' | 'On Leave') =>
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
                    <SelectItem value="Inactive">
                      {t('Statuses.inactive')}
                    </SelectItem>
                    <SelectItem value="On Leave">
                      {t('Statuses.onLeave')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 3: Notes (full width) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">
              {t('Agents.fields.notes')}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('notes', e.target.value)
              }
              placeholder={t('Forms.placeholders.notes')}
              className="h-16 sm:h-20 text-xs resize-none"
            />
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
    </ModalWrapper>
  );
}
