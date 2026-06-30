import { useMemo, memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Customer, UserType } from '@/types/interface';
import { Agent } from '@/types/interface';
import { useFetch } from '@/hooks/use-fetch';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/use-user';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';

// Dynamically import Recharts components
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), {
  ssr: false,
});

const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  ssr: false,
});

const chartConfig = {
  customers: {
    label: 'Customers',
    color: 'var(--chart-1)',
  },
  agents: {
    label: 'Agents',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

interface CustomersAgentsChartProps {
  user: UserType | null;
}

export const CustomersAgentsChart = memo(function CustomersAgentsChart({
  user,
}: CustomersAgentsChartProps) {
  const { data: customers } = useFetch<Customer>('customers');
  const { data: agents } = useFetch<Agent>('agents');
  const customersAgentsChartT = useTranslations(
    'Dashboard.customersAgentsChart'
  );

  const filteredCustomers = useFilteredCustomers(customers, agents, user);
  const customerCount = filteredCustomers?.length ?? 0;
  const agentCount = agents?.length ?? 0;
  const isAgent = user?.role.toLowerCase() === 'agent';

  const innerRadius = useMemo(() => {
    const total = customerCount + agentCount;

    if (total > 100) return 70;
    if (total > 50) return 60;

    return 50;
  }, [customerCount, agentCount]);

  // Memoize chart data calculation
  const chartData = useMemo(() => {
    if (isAgent) {
      return [
        {
          category: 'customers',
          count: customerCount,
          fill: 'var(--chart-1)',
        },
      ];
    }

    return [
      {
        category: 'customers',
        count: customerCount,
        fill: 'var(--chart-1)',
      },
      {
        category: 'agents',
        count: agentCount,
        fill: 'var(--chart-5)',
      },
    ];
  }, [customerCount, agentCount, isAgent]);

  const totalCount = useMemo(() => {
    return isAgent ? customerCount : customerCount + agentCount;
  }, [isAgent, customerCount, agentCount]);

  const isEmpty = totalCount === 0;
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          {' '}
          {!isAgent
            ? customersAgentsChartT('title')
            : customersAgentsChartT('agentsTitle')}{' '}
        </CardTitle>
        <CardDescription>
          {customersAgentsChartT('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-60" />
            <p className="text-sm font-medium">No data available</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] lg:max-h-[200px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="category"
                innerRadius={innerRadius}
                outerRadius={90}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-2 leading-none font-medium text-center">
          {customersAgentsChartT('total', { count: totalCount })}{' '}
          <TrendingUp className="h-4 w-4" />
        </div>

        {!isAgent && (
          <div className="text-muted-foreground leading-none text-center">
            {customersAgentsChartT('breakdown', {
              customers: customerCount,
              agents: agentCount,
            })}
          </div>
        )}
      </CardFooter>
    </Card>
  );
});
