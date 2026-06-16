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
interface TotalOrderTypes {
  agent: string;
  orders: number;
}

const getTopAgents = (
  agents: TotalOrderTypes[],
  limit = 3
): TotalOrderTypes[] => {
  return [...agents].sort((a, b) => b.orders - a.orders).slice(0, limit);
};

export const AgentTotalOrder = () => {
  const t = useTranslations();
  const [totalOrders, setTotalOrders] = useState<TotalOrderTypes[]>([]);

  useEffect(() => {
    const getAgentTotalOrder = async () => {
      try {
        const res = await fetch(
          '/api/analytics/agent-leaderboard/agent-total-order'
        );
        const data = await res.json();
        setTotalOrders(data);
      } catch (error) {
        console.error(error);
      }
    };

    getAgentTotalOrder();
  }, []);

  const totalAgents = totalOrders.length;

  const totalOrdersAll = totalOrders.reduce(
    (sum, item) => sum + item.orders,
    0
  );
  const topAgents = getTopAgents(totalOrders);
  const topAgent = topAgents[0];

  const avgOrders = totalAgents ? Math.round(totalOrdersAll / totalAgents) : 0;

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
          {t('Analytics.customTooltip.orders')}: {''}
          {payloadItem.orders}
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
          {t('Analytics.agentLeaderboard.orderTitle')}
        </CardTitle>

        <CardDescription>
          {t('Analytics.agentLeaderboard.orderDescription', {
            total: totalAgents,
            totalItem: totalOrdersAll,
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

            <Bar dataKey="orders" radius={[0, 6, 6, 0]}>
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
            {topAgent?.orders !== topAgents[1]?.orders
              ? topAgent?.agent || 'N/A'
              : `${topAgent?.agent} & ${topAgents[1]?.agent}`}
          </span>{' '}
          (
          {t('Analytics.agentLeaderboard.footer.totalOrder', {
            total: topAgent?.orders || 0,
          })}
          )
        </div>

        <div className="text-muted-foreground">
          {t('Analytics.agentLeaderboard.footer.avg')}{' '}
          <span className="font-medium text-foreground">{avgOrders}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
