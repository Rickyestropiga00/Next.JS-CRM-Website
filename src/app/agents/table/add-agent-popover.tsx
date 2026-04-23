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
import { Agent } from '@/types/interface';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';

interface AddAgentPopoverProps {
  onAddAgent: (agent: Agent) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  general?: string;
}
type AgentForm = {
  name: string;
  email: string;
  phone: string;
  role: Agent['role'];
  status: Agent['status'];
  notes: string;
};

export function AddAgentPopover({
  onAddAgent,
  isOpen = false,
  onClose,
}: AddAgentPopoverProps) {
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  const initialData = useMemo(
    () => ({
      name: '',
      email: '',
      phone: '',
      role: 'Agent' as Agent['role'],
      status: 'Active' as Agent['status'],
      notes: '',
    }),
    []
  );

  const validationRules = {
    name: (v: string) => validateRequired(v, 'Name', 1),
    email: (v: string) => validateEmail(v),
    phone: (v: string) => validatePhone(v),
  };

  const {
    formData,
    errors,
    setErrors,
    validateForm,
    isFormValid,
    handleCancel,
    handleChange,
  } = useFormHandler(initialData, isModalOpen, validationRules, onClose);

  const { handleSubmit, loading } = useFormSubmit<AgentForm>();

  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/agent',
      buildBody: (data) => ({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        role: data.role,
        status: data.status,
        assignedCustomers: [],
        notes: data.notes?.trim() || '',
      }),
      onSuccess: (result: Agent) => {
        onAddAgent(result);
      },
      onClose,
      setErrors,
      onError: (err) => {
        setErrors((prev) => ({
          ...prev,
          general: err instanceof Error ? err.message : 'Failed to save agent',
        }));
      },
    });

  return (
    <ModalWrapper open={isModalOpen} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">Add New Agent</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create a new agent. This data is temporary and will reset on page
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
                placeholder="Enter agent name"
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

          {/* Row 2: Email and Role/Status */}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="role" className="text-xs">
                  Role
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
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="status" className="text-xs">
                  Status
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 3: Notes (full width) */}
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
              type="submit"
              size="sm"
              className="h-8 sm:h-7 text-xs order-1 sm:order-2"
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Adding Agent...' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
