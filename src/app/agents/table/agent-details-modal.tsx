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
import { Textarea } from "@/components/ui/textarea";
import { Agent } from "../data";
import {
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

interface AgentDetailsModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (agentId: string, comment: string) => void;
}

export function AgentDetailsModal({
  agent,
  isOpen,
  onClose,
  onAddComment,
}: AgentDetailsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!agent) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Agent":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(agent.id, newComment.trim());
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
          <DialogTitle className="text-xl font-bold">Agent Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {agent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{agent.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getStatusColor(
                    agent.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {agent.status}
                </Badge>
                <Badge
                  className={`${getRoleColor(agent.role)} px-2 py-0.5 text-xs`}
                >
                  {agent.role}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {agent.id}
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
                  <p className="text-xs">{agent.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Phone
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
                <h3 className="text-sm font-semibold">Role</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Position
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
                <h3 className="text-sm font-semibold">Timeline</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Created
                  </p>
                  <p className="text-xs">{formatDate(agent.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Last Login
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
                <h3 className="text-sm font-semibold">Assigned</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Customers
                </p>
                <p className="text-xs">
                  {agent.assignedCustomers.length > 0
                    ? `${agent.assignedCustomers.length} customer${
                        agent.assignedCustomers.length !== 1 ? "s" : ""
                      } assigned`
                    : "No customers assigned"}
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
                <h3 className="text-sm font-semibold">Notes</h3>
              </div>
              {(() => {
                const { regularNotes } = parseNotesAndComments(agent.notes || "");
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
          {onAddComment &&
            (() => {
              const { comments } = parseNotesAndComments(agent.comment || "");
              return (
                <div className="bg-card border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold">Comments</h3>
                    {comments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {comments.length}
                      </Badge>
                    )}
                  </div>

                  {/* Existing Comments */}
                  {comments.length > 0 && (
                    <div className="space-y-3">{renderComments(comments)}</div>
                  )}

                  {/* Add Comment Form */}
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      placeholder="Add a comment about this agent..."
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
                        className="h-7 px-3 text-xs cursor-pointer"
                      >
                        {isSubmitting ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
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
