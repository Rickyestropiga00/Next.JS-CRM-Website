"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "../data";
import {
  Calendar,
  Tag,
  Package,
  DollarSign,
  FileText,
  Boxes,
} from "lucide-react";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
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

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStock = (stock: number, type: string) => {
    if (type === "Digital") return "Unlimited";
    if (type === "Service") return "N/A";
    return `${stock} units`;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            Product Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Header */}
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-lg font-bold text-white">
                  {product.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {product.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getStatusColor(product.status)} px-2 py-0.5 text-xs`}
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

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Product Information */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold">Product Info</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Code
                  </p>
                  <p className="text-xs font-mono">{product.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Name
                  </p>
                  <p className="text-xs">{product.name}</p>
                </div>
              </div>
            </div>

            {/* Category & Type */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold">Category</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Type
                </p>
                <Badge
                  className={`${getTypeColor(product.type)} px-2 py-0.5 text-xs`}
                >
                  {product.type}
                </Badge>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-semibold">Pricing</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Price
                </p>
                <p className="text-xs font-semibold">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Boxes className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold">Inventory</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Stock Level
                </p>
                <p className="text-xs">{formatStock(product.stock, product.type)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold">Status</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Current Status
                </p>
                <Badge
                  className={`${getStatusColor(product.status)} px-2 py-0.5 text-xs`}
                >
                  {product.status}
                </Badge>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold">Timeline</h3>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Created Date
                </p>
                <p className="text-xs">{product.date}</p>
              </div>
            </div>
          </div>
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
