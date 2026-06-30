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
import { Agent } from '@/types/interface';
import {
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getInitials, timeAgo } from '@/utils/formatters';
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

interface AgentDetailsModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (agentId: string, comment: string) => void;
  onDeleteComment?: (agentId: string, commentId: string) => void;
}

export function AgentDetailsModal({
  agent,
  isOpen,
  onClose,
  onAddComment,
  onDeleteComment,
}: AgentDetailsModalProps) {
  const t = useTranslations();
  const timeAgoT = useTranslations('TimeAgo');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  if (!agent) return null;
  const agentIdentifier = agent._id || agent.id;

  const comments = agent.comments ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Agent':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;
    if (!agentIdentifier) {
      console.error('Failed to add comment: agent has no id');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(agent._id!, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment || !agentIdentifier) return;
    console.log({
      agentIdentifier,
      commentId,
    });

    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(agentIdentifier, commentId);
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

  const parseNotesAndComments = (notes: string) => {
    if (!notes) return { regularNotes: [], comments: [] };

    const sections = notes.split('---').filter((section) => section.trim());
    const regularNotes: string[] = [];
    const comments: Array<{
      author: string;
      date: string;
      content: string;
    }> = [];

    sections.forEach((section) => {
      const lines = section.trim().split('\n');
      const commentLine = lines.find((line) => line.includes('📝 Comment by'));
      const dateLine = lines.find((line) => line.includes('📅'));

      if (commentLine && dateLine) {
        // This is a comment
        const content = lines.slice(3).join('\n').trim(); // Skip header lines
        comments.push({
          author: commentLine.replace('📝 Comment by ', ''),
          date: dateLine.replace('📅 ', ''),
          content: content,
        });
      } else {
        // This is regular notes
        regularNotes.push(section.trim());
      }
    });

    return { regularNotes, comments };
  };

  const renderRegularNotes = (notes: string[]) => {
    if (notes.length === 0) return null;

    return (
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-foreground whitespace-pre-wrap">
              {note}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            {t('Agents.modal.detailsTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {agent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {agent.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getStatusColor(
                    agent.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {t(`Statuses.${agent.status.toLowerCase()}`)}
                </Badge>
                <Badge
                  className={`${getRoleColor(agent.role)} px-2 py-0.5 text-xs`}
                >
                  {t(`Roles.${agent.role.toLowerCase()}`)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {agent.id || agent.agentId}
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
                  {t('Agents.details.sections.contact')}
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Agents.details.fields.email')}
                  </p>
                  <p className="text-xs">{agent.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Agents.details.fields.phone')}
                  </p>
                  <p className="text-xs">{agent.phone}</p>
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Agents.details.sections.role')}
                </h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {t('Agents.details.fields.position')}
                </p>
                <Badge
                  className={`${getRoleColor(agent.role)} px-2 py-0.5 text-xs`}
                >
                  {agent.role}
                </Badge>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Agents.details.sections.timeline')}
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Agents.details.fields.created')}
                  </p>
                  <p className="text-xs">{formatDate(agent.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t('Agents.details.fields.lastLogin')}
                  </p>
                  <p className="text-xs">{formatDateTime(agent.lastLogin)}</p>
                </div>
              </div>
            </div>

            {/* Assigned Customers */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Agents.details.sections.assigned')}
                </h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {t('Agents.details.fields.customers')}
                </p>
                <p className="text-xs">
                  {agent.assignedCustomers.length > 0
                    ? agent.assignedCustomers.length !== 1
                      ? t('Agents.details.assigned.multiple', {
                          count: agent.assignedCustomers.length,
                        })
                      : t('Agents.details.assigned.single', {
                          count: agent.assignedCustomers.length,
                        })
                    : t('Agents.details.assigned.none')}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {agent.notes && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t('Agents.details.sections.notes')}
                </h3>
              </div>
              {(() => {
                const { regularNotes } = parseNotesAndComments(
                  agent.notes || ''
                );
                return regularNotes.length > 0 ? (
                  renderRegularNotes(regularNotes)
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-foreground whitespace-pre-wrap">
                      {agent.notes}
                    </p>
                  </div>
                );
              })()}
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
                  {t('Agents.details.sections.comments')}
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
                                        'Agents.details.comments.alertDescription'
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
                  {t('Agents.details.comments.empty')}
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
