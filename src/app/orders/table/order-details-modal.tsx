"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "../data";
import { StatusBadge } from "./status-badge";

import {
  
  ShoppingBag,
  ChartNoAxesGantt,
  Logs,
  Truck,
} from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
 
}
const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
};

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  
}: OrderDetailsModalProps) {
  

  if (!order) return null;

  


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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Unpaid":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Header */}
           <div className="text-center space-y-2">
            <div className=" relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                 
                    
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                        {order.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                </div>
                
            </div>

            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">{order.customer}</h2>
              <div className="flex items-center justify-center gap-2">
                
                <StatusBadge status={order.status} />
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {order.id}
                </span>
                
                <Badge
                className={`${getPaymentStatusColor(order.payment)} px-2 py-0.5 text-xs`}
                >
                {order.payment}
                </Badge>
                
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Product Details */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ChartNoAxesGantt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Product Details</h3>
                    </div>
                    <div>
                         <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Product Name
                        </p>

                        <Badge
                        className={`${getTypeColor(order.product)} px-2 py-0.5 text-xs`}
                        >
                        {order.product}
                        </Badge>
                        
                    </div>
                    <div>
                         <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Product Type
                        </p>
                        
                        <Badge
                        className={`${getTypeColor(order.productType)} px-2 py-0.5 text-xs`}
                        >
                        {order.productType}
                        </Badge>    
                    </div>

                </div>

            

                {/* Order Information */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Logs className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Order Information</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Order Status
                        </p>
                        
                        <StatusBadge status={order.status} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Payment Status
                        </p>
                        
                        <Badge
                        className={`${getPaymentStatusColor(order.payment)} px-2 py-0.5 text-xs`}
                        >
                        {order.payment}
                        </Badge>
                    </div>
                </div>
                
                {/* Delivery Information */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Delivery Information</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Order Date
                        </p>
                        <p className="text-xs">{order.date}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Address
                        </p>
                        <p className="text-xs">{order.address}</p>
                    </div>
                </div>

                {/* Purchase Summary */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                         <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Purchase Summary</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Order Quantity
                        </p>
                        <p className="text-xs">{order.quantity}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Total Price
                        </p>
                        <p className="text-xs">{formatPrice(order.total)}</p>
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
