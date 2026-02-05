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
import { Textarea } from "@/components/ui/textarea";
import { ModalWrapper } from "@/components/shared/modal-wrapper";
import { validateEmail, validatePhone } from "@/lib/validations";
import { Customer, CustomerStatus } from "../data";

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
  const [formData, setFormData] = useState<Customer>(customer);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when customer changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(customer);
      setErrors({});
    }
  }, [customer, open]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    return !validateEmail(formData.email) && !validatePhone(formData.phone);
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setFormData(customer); // Reset form data
    setErrors({});
    onClose();
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    // Always validate and update errors when email changes
    const emailError = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: emailError }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    // Always validate and update errors when phone changes
    const phoneError = validatePhone(value);
    setErrors((prev) => ({ ...prev, phone: phoneError }));
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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-8 sm:h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs">
                Company
              </Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
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
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.email ? "border-red-500" : ""
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
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.phone ? "border-red-500" : ""
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
                setFormData({ ...formData, status: value })
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
              value={formData.notes || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
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
            onClick={handleSave}
            className="h-8 sm:h-7 text-xs order-1 sm:order-2"
            disabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
