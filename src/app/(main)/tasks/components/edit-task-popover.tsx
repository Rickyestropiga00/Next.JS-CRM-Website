'use client';

import React from 'react';
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
import { Task } from '@/types/interface';
import { useFormHandler } from '@/hooks/use-form-handler';
import { validateRequired } from '@/lib/validations';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { toast } from 'sonner';

interface EditTaskPopoverProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
  open: boolean;
}
const statusColors: Record<string, string> = {
  DESIGN: 'var(--badge-design)',
  DEVELOPMENT: 'var(--badge-development)',
  TESTING: 'var(--badge-testing)',
  CONTENT: 'var(--badge-content)',
  MARKETING: 'var(--badge-marketing)',
  MEETING: 'var(--badge-meeting)',
  'FOLLOW-UP': 'var(--badge-followup)',
};

export function EditTaskPopover({
  task,
  onSave,
  onClose,
  open,
}: EditTaskPopoverProps) {
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
  } = useFormHandler<Task>(
    task,
    open,
    {
      title: (v) => validateRequired(v, 'title'),
      description: (v) => validateRequired(v, 'description'),
    },
    () => onClose()
  );
  const { handleSubmit, loading } = useFormSubmit<Task>();
  const toastId = 'task-update';
  const onSubmit = (e: React.FormEvent) => {
    toast.loading('Saving changes...', { id: toastId });
    if (task._id) {
      handleSubmit(e, formData, validateForm, {
        url: `/api/task/${formData._id}`,
        method: 'PUT',
        buildBody: (data) => ({
          title: data.title.trim(),
          description: data.description.trim(),
          status: data.status,
          priority: data.priority,
          column: data.column,
        }),
        onSuccess: (result) => {
          onSave(result.data);
          toast.success(result.message, { id: toastId });
        },
        onError: (err) => {
          console.error(err);
          toast.error('Failed to update task', { id: toastId });
        },

        setErrors,
        onClose,
      });
    } else {
      if (validateForm()) {
        const updatedTask = {
          ...formData,
          statusColor: statusColors[formData.status] || formData.statusColor,
        };
        onSave(updatedTask);
        toast.success('Task updated locally', { id: toastId });
      }
    }
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
                onChange={(e) => handleChange('title', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.title ? 'border-red-500' : ''
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
                  handleChange('description', e.target.value)
                }
                placeholder="Enter task description..."
                className={`h-16 sm:h-20 text-xs resize-none ${
                  errors.description ? 'border-red-500' : ''
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
                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') =>
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
                  value: 'todo' | 'inprogress' | 'inreview' | 'done'
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
              onClick={onSubmit}
              className="h-8 sm:h-7 text-xs order-1 sm:order-2"
              disabled={!isFormValid() || !hasChanges || loading}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
