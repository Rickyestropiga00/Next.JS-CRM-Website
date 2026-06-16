import { Order } from '@/types/interface';

export function getMonthlyRevenueChart(
  orders: Order[],
  year = new Date().getFullYear()
) {
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

  const currentMonth = new Date().getMonth();

  const revenueMap = Array(12).fill(0);

  orders.forEach((order) => {
    if (order.payment === 'Paid' && order.status === 'Completed') {
      const date = new Date(order.createdAt);

      if (date.getFullYear() === year) {
        revenueMap[date.getMonth()] += Number(order.total || 0);
      }
    }
  });

  return months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    value: revenueMap[index],
    year,
  }));
}
