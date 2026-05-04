import { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orders } from '@/app/(main)/orders/data';
import { Order } from '@/types/interface';
import { useFetch } from '@/hooks/use-fetch';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useUser } from '@/hooks/use-user';

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
  const { data: ordersData } = useFetch<Order>('order', false, false); // false, false to get database data only
  const { filteredOrder } = useFilteredOrderByAgent(ordersData);
  const { user } = useUser();
  const role = user?.role.toLowerCase();

  const orderStats = useMemo(() => calculateOrderStats(orders), []);
  const dbStats = useMemo(
    () => calculateOrderStats(filteredOrder),
    [filteredOrder]
  );

  const finalStats = useMemo(() => {
    if (role === 'admin') {
      return {
        total: orderStats.total + dbStats.total,
        pending: orderStats.pending + dbStats.pending,
        inTransit: orderStats.inTransit + dbStats.inTransit,
        completed: orderStats.completed + dbStats.completed,
        cancelled: orderStats.cancelled + dbStats.cancelled,
      };
    }
    return dbStats;
  }, [role, dbStats, orderStats]);

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
          <div className="text-3xl font-bold pb-1">{finalStats.total}</div>
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
          <div className="text-3xl font-bold pb-1">{finalStats.pending}</div>
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
          <div className="text-3xl font-bold pb-1">{finalStats.inTransit}</div>
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
          <div className="text-3xl font-bold pb-1">{finalStats.completed}</div>
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
          <div className="text-3xl font-bold pb-1">{finalStats.cancelled}</div>
          <p className="text-xs text-muted-foreground">Order cancelled</p>
        </CardContent>
      </Card>
    </div>
  );
});
