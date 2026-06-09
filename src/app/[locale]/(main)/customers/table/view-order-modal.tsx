'use client';
import React, { useEffect, useState } from 'react';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { Customer } from '@/types/interface';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/interface';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronsUpDown,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatPrice } from '@/utils/formatters';
import { useTranslations } from 'next-intl';

interface ViewOrderModalProps {
  customer: Customer;
  open: boolean;
  onClose?: () => void;
}

export const ViewOrderModal = ({
  customer,
  open,
  onClose,
}: ViewOrderModalProps) => {
  const t = useTranslations();
  const [customerOrder, setCustomerOrder] = useState<Order[]>([]);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const res = await fetch(`/api/orders?customerId=${customer._id}`);
        const data = await res.json();
        if (data.success) {
          console.log('Orders from API:', data.data);
          setCustomerOrder(data.data);
        } else {
          setCustomerOrder([]);
          console.error(data.error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getOrder();
  }, [customer._id]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <ModalWrapper open={open} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            {t('Customers.modal.viewOrderTitle')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.rich('Customers.modal.viewOrderDescription', {
              name: () => (
                <span className="font-bold capitalize">{customer.name}</span>
              ),
            })}
          </p>
        </div>

        <div className="space-y-4">
          {customerOrder.length === 0 ? (
            <div className="flex justify-self-center mt-10 font-bold">
              <p>{t('Customers.viewOrder.emptyState')}</p>
            </div>
          ) : (
            customerOrder.map((custOrder) => {
              return (
                <Collapsible key={custOrder.orderId}>
                  <div className="flex items-center justify-between gap-4 px-4">
                    <h4 className="text-sm font-semibold">
                      {custOrder.orderId}
                    </h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <ChevronsUpDown />
                        <span className="sr-only">Toggle details</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
                    <span className="font-medium">
                      {t('Customers.viewOrder.order.status')}
                    </span>

                    <StatusBadge status={custOrder.status} type="order" />
                  </div>

                  <CollapsibleContent className="flex flex-col gap-2 rounded-md p-4 space-y-3 mt-1 bg-card">
                    <div className=" border-b px-4 py-2 text-md flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="font-medium">
                          {t('Customers.viewOrder.order.address')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">{custOrder.address}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(custOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className=" border-b px-4 py-2 text-md flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="font-medium">
                          {t('Customers.viewOrder.order.product')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {typeof custOrder.product === 'object'
                            ? custOrder.product?.name
                            : custOrder.product}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t(
                            `ProductTypes.${custOrder.productType.toLowerCase()}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div className=" border-b px-4 py-2 text-md flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="font-medium">
                          {t('Customers.viewOrder.order.total')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(custOrder.total)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          x{custOrder.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2 text-md flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-medium">
                          {t('Customers.viewOrder.order.payment')}
                        </p>
                      </div>

                      <p className="font-medium">
                        {t(`Payment.${custOrder.payment.toLowerCase()}`)}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="px-4 py-2 text-sm cursor-pointer"
          >
            {t('Buttons.close')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
