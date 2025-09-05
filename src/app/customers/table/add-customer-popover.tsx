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
import { Customer, CustomerStatus } from "../data";

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

export function AddCustomerPopover({
  onAddCustomer,
  isOpen = false,
  onClose,
}: AddCustomerPopoverProps) {
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  // Generate a unique temporary ID (31, 32, 33, etc.)
  const generateTempId = (): string => {
    const random = Math.floor(Math.random() * 70) + 31; // Generate 31 to 99
    return random.toString();
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Lead" as CustomerStatus,
    notes: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when popover opens
  React.useEffect(() => {
    if (isModalOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "Lead",
        notes: "",
      });
      setErrors({});
    }
  }, [isModalOpen]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return "Phone is required";
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      return "Please enter a valid phone number";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    return (
      !validateName(formData.name) &&
      !validateEmail(formData.email) &&
      !validatePhone(formData.phone)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newCustomer: Customer = {
      id: generateTempId(), // Generate unique temporary ID
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim() || undefined,
      status: formData.status,
      lastContacted: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      notes: formData.notes.trim() || undefined,
    };

    onAddCustomer(newCustomer);
    // Let parent component handle closing
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    // Always validate and update errors when name changes
    const nameError = validateName(value);
    setErrors((prev) => ({ ...prev, name: nameError }));
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
              Add New Customer
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create a new customer. This data is temporary and will reset on
              page reload.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Name and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.name ? "border-red-500" : ""
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`h-8 sm:h-9 text-xs ${
                    errors.email ? "border-red-500" : ""
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
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
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
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add notes..."
                className="h-16 sm:h-20 text-xs resize-none"
              />
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
                Add Customer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
