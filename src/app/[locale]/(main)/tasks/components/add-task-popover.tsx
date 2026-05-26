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
import { Task, ColumnKey } from '@/types/interface';
import { validateRequired } from '@/lib/validations';
import { useFormHandler } from '@/hooks/use-form-handler';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { useTranslations } from 'next-intl';

interface AddTaskPopoverProps {
  onAddTask: (task: Task) => void;
  isOpen?: boolean;
  onClose?: () => void;
  defaultColumn: ColumnKey;
}

interface ValidationErrors {
  title?: string;
  description?: string;
}

type TaskForm = {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  column: Task['column'];
  avatars: {
    src: string;
    alt: string;
    fallback: string;
  }[];
};

export function AddTaskPopover({
  onAddTask,
  isOpen = false,
  onClose,
  defaultColumn,
}: AddTaskPopoverProps) {
  const t = useTranslations();
  const [internalIsOpen] = useState(false);

  // Use external isOpen prop if provided, otherwise use internal state
  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  // Get column label for display
  const getColumnLabel = (column: ColumnKey): string => {
    const columnLabels: Record<ColumnKey, string> = {
      todo: 'To Do',
      inprogress: 'In Progress',
      inreview: 'In Review',
      done: 'Done',
    };
    return columnLabels[column] || column;
  };
  const initialData = useMemo(
    () => ({
      title: '',
      description: '',
      status: 'DESIGN' as Task['status'],
      priority: 'MEDIUM' as Task['priority'],
      column: defaultColumn,
      avatars: [],
    }),
    [defaultColumn]
  );

  const validationRules = {
    title: (v: string) =>
      validateRequired(
        v,
        t('Validations.required', { field: t('Forms.fields.title') }),
        t
      ),
    description: (v: string) =>
      validateRequired(
        v,
        t('Validations.required', {
          field: t('Forms.fields.description'),
        }),
        t
      ),
  };

  const {
    formData,
    errors,
    setErrors,
    handleCancel,
    handleChange,
    isFormValid,
    validateForm,
  } = useFormHandler<TaskForm>(
    initialData,
    isModalOpen,
    validationRules,
    onClose
  );
  const { handleSubmit, loading } = useFormSubmit<TaskForm>();

  const statusColors: Record<string, string> = {
    DESIGN: 'var(--badge-design)',
    DEVELOPMENT: 'var(--badge-development)',
    TESTING: 'var(--badge-testing)',
    CONTENT: 'var(--badge-content)',
    MARKETING: 'var(--badge-marketing)',
    MEETING: 'var(--badge-meeting)',
    'FOLLOW-UP': 'var(--badge-followup)',
  };

  // Generate default avatar for new task
  const defaultAvatar = {
    src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png',
    alt: '@user',
    fallback: 'U',
  };
  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, formData, validateForm, {
      url: '/api/task',
      buildBody: (data) => ({
        title: data.title.trim(),
        description: data.description.trim(),
        status: data.status,
        priority: data.priority,
        column: data.column,
        avatars: [defaultAvatar],
      }),
      onSuccess: (result: Task) => {
        onAddTask(result);
      },
      onClose,
      setErrors,
      onError: (err) => {
        setErrors((prev) => ({
          ...prev,
          general: err instanceof Error ? err.message : 'Failed to save task',
        }));
      },
    });

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
              {t('Tasks.modal.addTitle', {
                column: t(`TaskColumns.${defaultColumn}`),
              })}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('Tasks.modal.addDescription')}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">
                {t('Tasks.fields.title')}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`h-8 sm:h-9 text-xs ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder={t('Tasks.placeholders.title')}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">
                {t('Tasks.fields.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange('description', e.target.value)
                }
                placeholder={t('Tasks.placeholders.description')}
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
                  {t('Tasks.fields.status')}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    handleChange('status', value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESIGN">
                      {t('TaskStatus.design')}
                    </SelectItem>
                    <SelectItem value="DEVELOPMENT">
                      {t('TaskStatus.development')}
                    </SelectItem>
                    <SelectItem value="TESTING">
                      {t('TaskStatus.testing')}
                    </SelectItem>
                    <SelectItem value="CONTENT">
                      {t('TaskStatus.content')}
                    </SelectItem>
                    <SelectItem value="MARKETING">
                      {t('TaskStatus.marketing')}
                    </SelectItem>
                    <SelectItem value="MEETING">
                      {t('TaskStatus.meeting')}
                    </SelectItem>
                    <SelectItem value="FOLLOW-UP">
                      {t('TaskStatus.followUp')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs">
                  {t('Tasks.fields.priority')}
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') =>
                    handleChange('priority', value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('Priority.low')}</SelectItem>
                    <SelectItem value="MEDIUM">
                      {t('Priority.medium')}
                    </SelectItem>
                    <SelectItem value="HIGH">{t('Priority.high')}</SelectItem>
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
                {t('Buttons.cancel')}
              </Button>
              <Button
                size="sm"
                type="submit"
                className="h-8 sm:h-7 text-xs order-1 sm:order-2"
                disabled={!isFormValid() || loading}
              >
                {loading ? t('Tasks.buttons.adding') : t('Buttons.addTask')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
