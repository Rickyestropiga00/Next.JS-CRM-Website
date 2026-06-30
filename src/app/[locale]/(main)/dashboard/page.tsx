'use client';

import { OrderStatsCards } from './components/order-stats-cards';
import { TasksSection } from './components/tasks-section';
import { CustomersAgentsChart } from './components/customers-agents-chart';
import { TopSellingProducts } from './components/top-selling-products';
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const { user } = useUser();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Order Statistics Cards */}
      <OrderStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <TasksSection />
        {!user ? (
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        ) : (
          <CustomersAgentsChart user={user} />
        )}
        <TopSellingProducts />
      </div>
    </div>
  );
}
