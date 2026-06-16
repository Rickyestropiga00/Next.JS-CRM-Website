import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { Agent, Customer, Order, Product } from '@/types/interface';
import { useMemo } from 'react';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';

const calculateCustomerStatus = (customers: Customer[]) => {
  const statusCount = customers.reduce((acc, customer) => {
    const status = customer.status || 'Unknown';

    acc[status] = (acc[status] || 0) + 1;

    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
  }));
};
const STATUS_COLORS: Record<string, string> = {
  Lead: 'var(--badge-lead)',
  Active: 'var(--badge-active)',
  Inactive: 'var(--badge-inactive)',
  Prospect: 'var(--badge-prospect)',
  Unknown: '#94a3b8',
};

export function CustomerStatusPieChart() {
  const t = useTranslations();
  const { data: customerData } = useFetch<Customer>('customers');
  const { data: agentsData } = useFetch<Agent>('agents', false, false);
  const { user } = useUser();
  const filteredCustomer = useFilteredCustomers(customerData, agentsData, user);
  const chartData = useMemo(() => {
    return calculateCustomerStatus(filteredCustomer);
  }, [filteredCustomer]);

  const activeCustomers =
    chartData.find((item) => item.status === 'Active')?.count || 0;

  const totalCustomers = chartData.reduce((sum, item) => sum + item.count, 0);

  const activeRate =
    totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('Analytics.customerPieChart.title')}</CardTitle>
        <CardDescription>
          {t('Analytics.customerPieChart.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={{}} className="h-[300px]">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={80}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                />
              ))}
            </Pie>

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="font-medium">
          {t('Analytics.customerPieChart.footer.rate', {
            rate: activeRate.toFixed(1),
          })}
        </div>

        <div className="text-muted-foreground">
          {t('Analytics.customerPieChart.footer.active', {
            activeCustomers: activeCustomers,
            totalCustomers: totalCustomers,
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
