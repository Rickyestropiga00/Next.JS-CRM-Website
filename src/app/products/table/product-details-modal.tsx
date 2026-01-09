"use client";

import React, { useState } from "react";
import  Image  from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "../data";
import {
  Calendar,
  User,
  MessageSquare,
  ScanQrCode,
  Scan,
  ShoppingBag,
} from "lucide-react";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (productId: string, comment: string) => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddComment,
}: ProductDetailsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Physical":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Digital":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Service":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(product.id, newComment.trim());
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
          <DialogTitle className="text-xl font-bold">Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Header */}
          <div className="text-center space-y-2">
            <div className=" relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                {product.image 
                    ?   <Image src={product.image} alt={product.name} fill className="rounded-full object-cover" sizes="64px" />
                    :   <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                                {product.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                        </div>
                }
            </div>

            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getStatusColor(
                    product.status
                  )} px-2 py-0.5 text-xs`}
                >
                  {product.status}
                </Badge>
                <Badge
                  className={`${getTypeColor(product.type)} px-2 py-0.5 text-xs`}
                >
                  {product.type}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {product.id}
                </span>
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Product Code */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <ScanQrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Code</h3>
                    </div>
                    <div>
                        
                        <Badge
                        className={`${getTypeColor(product.code)} px-2 py-0.5 text-xs`}
                        >
                        {product.code}
                        </Badge>    
                    </div>
                </div>

            

                {/* Product Type */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Scan className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Type</h3>
                    </div>
                    <div>
                        
                        <Badge
                        className={`${getTypeColor(product.type)} px-2 py-0.5 text-xs`}
                        >
                        {product.type}
                        </Badge>
                    </div>
                </div>
                
                {/* Product Timeline */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Timeline</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Date Created
                        </p>
                        <Badge
                        className={`${getTypeColor(product.date)} px-2 py-0.5 text-xs`}
                        >
                        {product.date }
                        </Badge>
                    </div>
                </div>

                {/* Inventory Details */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                         <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Inventory</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Stock
                        </p>
                        <Badge
                        className={`${product.stock < 10 ? "bg-red-500" : "bg-green-500"} px-2 py-0.5 text-xs`}
                        >
                        {product.stock }
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Price
                        </p>
                        <Badge
                        className={`${product.price} px-2 py-0.5 text-xs`}
                        >
                        ${product.price }
                        </Badge>
                    </div>
                </div>
            </div>


          {/* Comments Section */}
          {onAddComment &&
            (() => {
              const { comments } = parseNotesAndComments(product.comment || "");
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
