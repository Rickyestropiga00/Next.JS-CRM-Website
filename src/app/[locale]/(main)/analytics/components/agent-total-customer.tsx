'use client';

import { barChartConfig } from '@/app/data/analytics.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from 'recharts';
import { BAR_COLORS } from './revenue-bar-chart';
import { useTranslations } from 'next-intl';

interface TotalCustomerTypes {
  agent: string;
  customers: number;
}

const getTopAgents = (
  agents: TotalCustomerTypes[],
  limit = 3
): TotalCustomerTypes[] => {
  return [...agents].sort((a, b) => b.customers - a.customers).slice(0, limit);
};

export const AgentTotalCustomer = () => {
  const t = useTranslations();
  const [totalCustomer, setTotalCustomer] = useState<TotalCustomerTypes[]>([]);

  useEffect(() => {
    const getAgentTotalCustomer = async () => {
      try {
        const res = await fetch(
          '/api/analytics/agent-leaderboard/agent-total-customer'
        );
        const data = await res.json();

        setTotalCustomer(data);
      } catch (error) {
        console.error(error);
      }
    };

    getAgentTotalCustomer();
  }, []);
  const totalAgents = totalCustomer.length;

  const totalCustomers = totalCustomer.reduce(
    (sum, item) => sum + item.customers,
    0
  );

  const topAgents = getTopAgents(totalCustomer);
  const topAgent = topAgents[0];

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const payloadItem = payload[0].payload;

    return (
      <div className="bg-background border border-muted rounded px-3 py-2 text-xs shadow-lg min-w-[120px]">
        <div className="flex gap-2 items-center mb-2">
          <span
            style={{ backgroundColor: payloadItem.color }}
            className="inline-block w-2 h-2 rounded-full"
          />
          <p className="font-semibold">{label}</p>
        </div>

        <p className="font-mono tabular-nums">
          {t('Analytics.customTooltip.customers')}: {''}
          {payloadItem.customers}
        </p>
      </div>
    );
  };

  const chartData = topAgents.map((agent, index) => ({
    ...agent,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }));

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          {t('Analytics.agentLeaderboard.customerTitle')}
        </CardTitle>

        <CardDescription>
          {t('Analytics.agentLeaderboard.customerDescription', {
            total: totalAgents,
            totalItem: totalCustomers,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={barChartConfig} className="h-[300px]">
          <BarChart
            layout="vertical"
            data={chartData}
            accessibilityLayer
            barSize={28}
            margin={{ left: 0, right: 24 }}
          >
            <CartesianGrid
              horizontal={false}
              vertical={true}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              dataKey="agent"
              type="category"
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={<CustomTooltipContent />}
            />

            <Bar dataKey="customers" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-1 text-sm">
        <div className="text-muted-foreground">
          {t('Analytics.agentLeaderboard.footer.top')}{' '}
          <span className="font-medium text-foreground">
            {topAgent?.customers !== topAgents[1]?.customers
              ? topAgent?.agent || 'N/A'
              : `${topAgent?.agent} & ${topAgents[1]?.agent}`}
          </span>{' '}
          (
          {t('Analytics.agentLeaderboard.footer.totalCustomer', {
            total: topAgent?.customers || 0,
          })}
          )
        </div>

        <div className="text-muted-foreground">
          {t('Analytics.agentLeaderboard.footer.avg')}{' '}
          <span className="font-medium text-foreground">
            {totalAgents ? Math.round(totalCustomers / totalAgents) : 0}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
