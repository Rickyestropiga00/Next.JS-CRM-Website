import React from 'react'
import { Blocks, ChartCandlestick, ScanQrCode, SquareDashedTopSolid } from 'lucide-react';
import Image  from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { TopSellingProduct } from '../data';
import { formatPrice, formatStock } from '@/utils/formatters';

interface TopSellingProductModalProps {
  topProduct: TopSellingProduct | null;
  isOpen: boolean;
  onClose: () => void;
 
}

export function TopSellingProductModal({
  topProduct,
  isOpen,
  onClose,

}: TopSellingProductModalProps) {


  if (!topProduct) return null;

 

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

  const getOrderStatusColor = (orderStatus : string) => {
    switch (orderStatus) {
      case "Completed" :
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Pending" :
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "In Transit" :
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Top Selling Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
            <div className="text-center space-y-2">
                <div className=" relative w-30 h-30 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                    {topProduct.image 
                        ?   <Link href={topProduct.image} target="_blank">
                                <Image src={topProduct.image} alt={topProduct.name} fill className="rounded-full object-cover" sizes="120px" />
                            </Link>
                        :   <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600  rounded-full mx-auto flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                    {topProduct.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                            </div>
                    }
                </div>

                
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{topProduct.name}</h2>
                    <div className="flex items-center justify-center gap-2">
                    
                        <span className="text-xs text-muted-foreground font-mono">
                            ID: {topProduct.code}
                        </span>
                    </div>
                </div>
            </div>
            {/* Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ScanQrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Product Information</h3>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Price
                        </p>
                        
                        <span className='px-2 py-0.5 text-xs'>
                          {formatPrice(topProduct.price)}
                        </span>    
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Type
                        </p>

                        <Badge className={`${getTypeColor(topProduct.productType)} px-2 py-0.5 text-xs`}>
                          {topProduct.productType}
                        </Badge>    
                    </div>
                </div>
                {/* Sales Overview */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <ChartCandlestick className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Sales Overview</h3>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Total Quantity Sold
                      </p>
                        
                        <span
                        className="px-2 py-0.5 text-xs"
                        >
                        {topProduct.totalQuantity} units sold
                        </span>    
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Total Revenue
                      </p>
                        
                        <span
                        className="px-2 py-0.5 text-xs"
                        >
                          {formatPrice(topProduct.totalRevenue)}
                        </span>    
                    </div>
                </div>
                {/* Product Availability */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Blocks className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Product Availability</h3>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Stock
                      </p>
                        
                        <span
                        className="px-2 py-0.5 text-xs"
                        >
                        {formatStock(topProduct.stock, topProduct.productType)}
                        </span>    
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Status
                      </p>
                        
                        <span
                        className={` ${getStatusColor(topProduct.status)} px-2 py-0.5 text-xs`}
                        >
                          {topProduct.status}
                        </span>    
                    </div>
                </div>
                {/* Order Status Overview */}
                <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <SquareDashedTopSolid className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Order Status Overview</h3>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-0.5 flex items-center gap-2 text-green-500">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Completed Orders
                      </p>
                        
                        <Badge
                        className={` ${getOrderStatusColor("Completed")} px-2 py-0.5 text-xs`}
                        >
                        {topProduct.completedOrders} Units
                        </Badge>    
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-0.5 flex items-center gap-2 text-yellow-500">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Pending Orders
                      </p>
                        
                        <Badge
                        className={` ${getOrderStatusColor("Pending")} px-2 py-0.5 text-xs`}
                        >
                        {topProduct.pendingOrders} Units
                        </Badge>   
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-0.5 flex items-center gap-2 text-blue-500">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          In Transit Orders
                      </p>

                        <Badge
                        className={` ${getOrderStatusColor("In Transit")} px-2 py-0.5 text-xs`}
                        >
                        {topProduct.inTransitOrders} Units
                        </Badge>     
                    </div>
                </div>

              {/* End of Grid */}
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
