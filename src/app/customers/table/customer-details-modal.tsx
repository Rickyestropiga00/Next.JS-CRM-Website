"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "../data";
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (customerId: string, comment: string) => void;
}

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onAddComment,
}: CustomerDetailsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Lead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Prospect":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(customer.id, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const parseNotesAndComments = (notes: string) => {
    if (!notes) return { regularNotes: [], comments: [] };

    const sections = notes.split("---").filter((section) => section.trim());
    const regularNotes: string[] = [];
    const comments: Array<{
      author: string;
      date: string;
      content: string;
    }> = [];

    sections.forEach((section) => {
      const lines = section.trim().split("\n");
      const commentLine = lines.find((line) => line.includes("📝 Comment by"));
      const dateLine = lines.find((line) => line.includes("📅"));

      if (commentLine && dateLine) {
        // This is a comment
        const content = lines.slice(3).join("\n").trim(); // Skip header lines
        comments.push({
          author: commentLine.replace("📝 Comment by ", ""),
          date: dateLine.replace("📅 ", ""),
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

  const renderComments = (
    comments: Array<{
      author: string;
      date: string;
      content: string;
    }>
  ) => {
    if (comments.length === 0) return null;

    return (
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  {comment.author}
                </span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                {comment.date}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900/50 rounded-md p-3 border-l-4 border-blue-300 dark:border-blue-600">
              <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
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
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
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
                  {customer.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {customer.id}
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
                <h3 className="text-sm font-semibold">Contact</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Email
                  </p>
                  <p className="text-xs">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Phone
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
                <h3 className="text-sm font-semibold">Company</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Organization
                </p>
                <p className="text-xs">
                  {customer.company || "No company specified"}
                </p>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold">Timeline</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Created
                  </p>
                  <p className="text-xs">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Last Contacted
                  </p>
                  <p className="text-xs">
                    {formatDate(customer.lastContacted)}
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
                <h3 className="text-sm font-semibold">Status</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Current Status
                </p>
                <Badge
                  className={`${getStatusColor(
                    customer.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {customer.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {(() => {
            const { regularNotes, comments } = parseNotesAndComments(
              customer.notes || ""
            );
            return (
              <>
                {/* Regular Notes */}
                {regularNotes.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold">Notes</h3>
                    </div>
                    {renderRegularNotes(regularNotes)}
                  </div>
                )}

                {/* Comments Section */}
                {comments.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold">Comments</h3>
                      <Badge variant="secondary" className="text-xs">
                        {comments.length}
                      </Badge>
                    </div>
                    {renderComments(comments)}
                  </div>
                )}
              </>
            );
          })()}

          {/* Add Comment Section */}
          {onAddComment && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold">Add Comment</h3>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment about this customer..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[80px] text-xs resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to submit
                  </p>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {isSubmitting ? "Adding..." : "Add Comment"}
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
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
