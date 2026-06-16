import { areaChartConfig1 } from '@/app/data/analytics.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useMemo, useTransition } from 'react';
import { getMonthlyRevenueChart } from '@/utils/getMonthlyRevenueChart';
import { useFetch } from '@/hooks/use-fetch';
import { Order } from '@/types/interface';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { calculateMonthlyRevenue } from '@/utils/montlyRevenue';
import { useTranslations } from 'next-intl';

// interface RevenueAreaChartProps {}
export function RevenueAreaChart() {
  const t = useTranslations();
  const { data: order } = useFetch<Order>('orders', false, false);
  const { filteredOrder } = useFilteredOrderByAgent(order);
  const monthRevenueChart = useMemo(() => {
    return getMonthlyRevenueChart(filteredOrder);
  }, [filteredOrder]);
  const monthlyRevenueData = useMemo(() => {
    return calculateMonthlyRevenue(filteredOrder);
  }, [filteredOrder]);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('Analytics.revenueAreaChart.title')}</CardTitle>
        <CardDescription>
          {' '}
          {t('Analytics.revenueAreaChart.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 ">
        <ChartContainer config={areaChartConfig1} className="h-[300px]">
          <AreaChart
            accessibilityLayer
            data={monthRevenueChart}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator />}
            />
            <defs>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={areaChartConfig1.desktop.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={areaChartConfig1.desktop.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke={areaChartConfig1.mobile.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {(monthlyRevenueData?.growth ?? 0) > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}

          {t('Analytics.revenueAreaChart.footer.growth', {
            growth: monthlyRevenueData?.growth?.toFixed(2),
          })}
        </div>

        <div className="text-muted-foreground leading-none">
          {t('Analytics.revenueAreaChart.footer.previous')}: $
          {monthlyRevenueData?.previousRevenue?.toLocaleString()} →{' '}
          {t('Analytics.revenueAreaChart.footer.current')}: $
          {monthlyRevenueData?.currentRevenue?.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}
