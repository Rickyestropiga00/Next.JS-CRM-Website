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
import { Task } from "../data";

interface EditTaskPopoverProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
  open: boolean;
}

interface ValidationErrors {
  title?: string;
  description?: string;
}

export function EditTaskPopover({
  task,
  onSave,
  onClose,
  open,
}: EditTaskPopoverProps) {
  const [formData, setFormData] = useState<Task>(task);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form data when task changes or popover opens
  React.useEffect(() => {
    if (open) {
      setFormData(task);
      setErrors({});
    }
  }, [task, open]);

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return "Title is required";
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (!description.trim()) return "Description is required";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    return (
      !validateTitle(formData.title) &&
      !validateDescription(formData.description)
    );
  };

  const handleSave = () => {
    if (validateForm()) {
      // Update statusColor based on the selected status
      const statusColors: Record<string, string> = {
        DESIGN: "var(--badge-design)",
        DEVELOPMENT: "var(--badge-development)",
        TESTING: "var(--badge-testing)",
        CONTENT: "var(--badge-content)",
        MARKETING: "var(--badge-marketing)",
        MEETING: "var(--badge-meeting)",
        "FOLLOW-UP": "var(--badge-followup)",
      };

      const updatedTask = {
        ...formData,
        statusColor: statusColors[formData.status] || formData.statusColor,
      };

      onSave(updatedTask);
    }
  };

  const handleCancel = () => {
    setFormData(task); // Reset form data
    setErrors({});
    onClose();
  };

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value });
    // Always validate and update errors when title changes
    const titleError = validateTitle(value);
    setErrors((prev) => ({ ...prev, title: titleError }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    // Always validate and update errors when description changes
    const descriptionError = validateDescription(value);
    setErrors((prev) => ({ ...prev, description: descriptionError }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[35rem] bg-background border rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-medium text-sm sm:text-base">Edit Task</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update task information. Changes are temporary and will reset on
              page reload.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Row 1: Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleDescriptionChange(e.target.value)
                }
                placeholder="Enter task description..."
                className={`h-16 sm:h-20 text-xs resize-none ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Row 3: Status and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESIGN">Design</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="TESTING">Testing</SelectItem>
                    <SelectItem value="CONTENT">Content</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="FOLLOW-UP">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Column */}
            <div className="space-y-2">
              <Label htmlFor="column" className="text-xs">
                Column
              </Label>
              <Select
                value={formData.column}
                onValueChange={(
                  value: "todo" | "inprogress" | "inreview" | "done"
                ) => setFormData({ ...formData, column: value })}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="inreview">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
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
      </div>
    </div>
  );
}
