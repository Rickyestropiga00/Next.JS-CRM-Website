import { Order } from '@/types/interface';

export function calculateMonthlyRevenue(orders: Order[], date = new Date()) {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let currentRevenue = 0;
  let previousRevenue = 0;

  orders.forEach((order) => {
    if (order.payment !== 'Paid' || order.status !== 'Completed') {
      return;
    }

    const orderDate = new Date(order.createdAt);

    if (orderDate.getFullYear() !== currentYear) {
      return;
    }

    if (orderDate.getMonth() === currentMonth) {
      currentRevenue += Number(order.total || 0);
    }

    if (orderDate.getMonth() === currentMonth - 1) {
      previousRevenue += Number(order.total || 0);
    }
  });

  const growth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  return {
    currentRevenue,
    previousRevenue,
    growth,
  };
}
