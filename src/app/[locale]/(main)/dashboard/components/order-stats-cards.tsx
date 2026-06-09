import { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orders } from '@/app/data/orders.ts';
import { Order } from '@/types/interface';
import { useFetch } from '@/hooks/use-fetch';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';

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
  const { data: ordersData } = useFetch<Order>('orders', false, false); // false, false to get database data only
  const { filteredOrder } = useFilteredOrderByAgent(ordersData);
  const { user } = useUser();
  const role = user?.role.toLowerCase();
  const orderStatsT = useTranslations('Dashboard.orderStats');

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
            {orderStatsT('total.label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">{finalStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {orderStatsT('total.label')}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            {orderStatsT('pending.label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">{finalStats.pending}</div>
          <p className="text-xs text-muted-foreground">
            {orderStatsT('pending.description')}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            {orderStatsT('inTransit.label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">{finalStats.inTransit}</div>
          <p className="text-xs text-muted-foreground">
            {orderStatsT('inTransit.description')}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {orderStatsT('completed.label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">{finalStats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {orderStatsT('completed.description')}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {orderStatsT('cancelled.label')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold pb-1">{finalStats.cancelled}</div>
          <p className="text-xs text-muted-foreground">
            {orderStatsT('cancelled.description')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
