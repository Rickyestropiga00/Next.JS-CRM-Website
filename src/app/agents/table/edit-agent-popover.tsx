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
import { Agent } from "../data";

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
  const [formData, setFormData] = useState<Agent>(agent);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when agent changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(agent);
      setErrors({});
    }
  }, [agent, open]);

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
    setFormData(agent); // Reset form data
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
          <h4 className="font-medium text-sm sm:text-base">Edit Agent</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update agent information. Changes are temporary and will reset on
            page reload.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Name and Phone */}
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
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.email ? "border-red-500" : ""
                }`}
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
                  onValueChange={(value: "Admin" | "Agent" | "Manager") =>
                    setFormData({ ...formData, role: value })
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
                  onValueChange={(value: "Active" | "Inactive" | "On Leave") =>
                    setFormData({ ...formData, status: value })
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
