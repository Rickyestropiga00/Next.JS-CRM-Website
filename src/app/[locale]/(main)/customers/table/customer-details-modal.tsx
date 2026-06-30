'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/interface';
import {
  Mail,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { timeAgo } from '@/utils/formatters';

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (customerId: string, comment: string) => void;
  onDeleteComment?: (customerId: string, commentId: string) => void;
}

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onAddComment,
  onDeleteComment,
}: CustomerDetailsModalProps) {
  const t = useTranslations();
  const timeAgoT = useTranslations('TimeAgo');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  if (!customer) return null;
  const customerIdentifier = customer._id || customer.id;

  const comments = customer.comments ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  function getInitials(name: string) {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Lead':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Prospect':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;
    if (!customerIdentifier) {
      console.error('Failed to add comment: customer has no id');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(customer._id!, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment || !customerIdentifier) return;
    console.log({
      customerIdentifier,
      commentId,
    });

    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(customerIdentifier, commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            {t('Customers.modal.detailsTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {customer.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getStatusColor(
                    customer.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {t(`Statuses.${customer.status.toLowerCase()}`)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {t('Customers.details.labels.id')}:{' '}
                  {customer.id || customer.customerId}
                </span>
              </div>
            </div>
          </div>
          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Contact Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Customers.details.labels.contact')}
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Customers.details.labels.email')}
                  </p>
                  <p className="text-xs">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Customers.details.labels.phone')}
                  </p>
                  <p className="text-xs">{customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {' '}
                  {t('Customers.details.labels.company')}
                </h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {t('Customers.details.labels.organization')}
                </p>
                <p className="text-xs">
                  {customer.company || 'No company specified'}
                </p>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {' '}
                  {t('Customers.details.labels.timeline')}
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Customers.details.labels.created')}
                  </p>
                  <p className="text-xs">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Customers.details.labels.lastContacted')}
                  </p>
                  <p className="text-xs">
                    {formatDate(customer.lastContacted ?? '')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {' '}
                  {t('Customers.details.labels.status')}
                </h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {t('Customers.details.labels.status')}
                </p>
                <Badge
                  className={`${getStatusColor(
                    customer.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {t(`Statuses.${customer.status.toLowerCase()}`)}
                </Badge>
              </div>
            </div>
          </div>
          {/* Notes Section */}
          {customer.notes && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Customers.details.labels.notes')}
                </h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-foreground whitespace-pre-wrap">
                  {customer.notes}
                </p>
              </div>
            </div>
          )}
          {/* Comments Section */}

          {onAddComment && (
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="text-sm font-semibold">
                  {t('Customers.details.labels.comments')}
                </h3>

                {comments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {comments.length}
                  </Badge>
                )}
              </div>

              {comments.length > 0 && (
                <div className="space-y-0">
                  {comments.map((comment, idx) => {
                    const isLast = idx === comments.length - 1;
                    const isDeleting = deletingCommentId === comment._id;

                    return (
                      <div
                        key={comment._id}
                        className="group relative flex gap-3 pb-4 last:pb-0"
                      >
                        {!isLast && (
                          <span
                            aria-hidden
                            className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white bg-primary`}
                        >
                          {getInitials(comment.author)}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-baseline gap-2">
                              <span className="truncate text-xs font-semibold text-foreground">
                                {comment.author}
                              </span>
                              <span
                                className="shrink-0 text-[11px] text-muted-foreground"
                                title={new Date(
                                  comment.createdAt
                                ).toLocaleString()}
                              >
                                {/* {formatRelativeTime(comment.createdAt)} */}
                                {timeAgo(comment.createdAt, timeAgoT)}
                              </span>
                            </div>

                            {onDeleteComment && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    aria-label="Delete comment"
                                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-primary/10 hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t('ConfirmDelete.singleTitle', {
                                        item: 'Comment',
                                      })}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(
                                        'Customers.details.comments.alertDescription'
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">
                                      {t('Buttons.cancel')}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteComment(comment._id)
                                      }
                                      className="cursor-pointer"
                                    >
                                      {t('Buttons.delete')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>

                          <div className="mt-1 rounded-lg rounded-tl-sm bg-muted/60 px-3 py-2">
                            <p className="whitespace-pre-wrap break-all text-sm text-foreground leading-5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('Customers.details.comments.empty')}
                </p>
              )}

              {/* Add Comment Form */}
              <div className="space-y-2 pt-2 border-t">
                <Textarea
                  placeholder={t('Customers.placeholders.comment')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[80px] text-xs resize-none"
                  disabled={isSubmitting}
                />

                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {t('Forms.hints.ctrlEnterSubmit')}
                  </p>

                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="h-7 px-3 text-xs cursor-pointer"
                  >
                    {isSubmitting
                      ? t('Buttons.adding')
                      : t('Buttons.addComment')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 text-sm cursor-pointer"
          >
            {t('Buttons.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
