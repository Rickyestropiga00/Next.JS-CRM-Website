import { Order } from '@/types/interface';

export function getTopProductRevenueComparison(
  orders: Order[],
  topProductCode: string
) {
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentRevenue = 0;
  let previousRevenue = 0;

  orders
    .filter(
      (order) => order.item === topProductCode && order.status === 'Completed'
    )
    .forEach((order) => {
      const date = new Date(order.createdAt);

      const month = date.getMonth();
      const year = date.getFullYear();

      if (month === currentMonth && year === currentYear) {
        currentRevenue += order.total;
      }

      if (month === previousMonth && year === previousYear) {
        previousRevenue += order.total;
      }
    });

  const growth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const previousMonthInString = months[previousMonth];
  const currentMonthInString = months[currentMonth];

  return {
    previousMonthInString,
    currentMonthInString,
    currentRevenue,
    previousRevenue,
    growth,
  };
}
