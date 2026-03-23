import { useMemo, memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orders } from '@/app/orders/data';
import { Order } from '@/types/interface';
import { fetchData } from '@/lib/api/fetch-data';

// Utility function to calculate order statistics
const calculateOrderStats = (orders: Order[]) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending'
  ).length;
  const inTransitOrders = orders.filter(
    (order) => order.status === 'In Transit'
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === 'Completed'
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === 'Canceled'
  ).length;

  return {
    total: totalOrders,
    pending: pendingOrders,
    inTransit: inTransitOrders,
    completed: completedOrders,
    cancelled: cancelledOrders,
  };
};

export const OrderStatsCards = memo(function OrderStatsCards() {
  const [dbOrders, setDbOrders] = useState<Order[]>([]);

  useEffect(() => {
    const getOrder = async () => {
      const res = await fetchData('order');

      setDbOrders(res.data);
    };

    getOrder();
  }, []);

  const orderStats = useMemo(() => calculateOrderStats(orders), []);
  const dbStats = useMemo(() => calculateOrderStats(dbOrders), [dbOrders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            Total Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">
            {orderStats.total + dbStats.total}
          </div>
          <p className="text-xs text-muted-foreground">
            All orders in the system
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">
            {orderStats.pending + dbStats.pending}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting processing</p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            In Transit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">
            {orderStats.inTransit + dbStats.inTransit}
          </div>
          <p className="text-xs text-muted-foreground">Currently shipping</p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">
            {orderStats.completed + dbStats.completed}
          </div>
          <p className="text-xs text-muted-foreground">
            Successfully delivered
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">
            {orderStats.cancelled + dbStats.cancelled}
          </div>
          <p className="text-xs text-muted-foreground">Order cancelled</p>
        </CardContent>
      </Card>
    </div>
  );
});
