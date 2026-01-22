"use client";

import React, { useState } from "react";
import  Image  from 'next/image';
import Link from "next/link";
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
          <DialogTitle className="text-xl font-bold">Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product  Header */}
          <div className="text-center space-y-2">
            <div className=" relative w-30 h-30 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                {product.image 
                    ?   
                    <Link href={product.image} target="_blank">
                        <Image src={product.image} alt={product.name} fill className="rounded-full object-cover" sizes="120px" />
                    </Link>
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
