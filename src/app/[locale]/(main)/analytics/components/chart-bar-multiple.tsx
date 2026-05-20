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
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { barChartData, barChartConfig } from '@/app/data/analytics.ts';
import { useTranslations } from 'next-intl';

export function ChartBarMultiple() {
  const chartBarT = useTranslations('Analytics.barChart');
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{chartBarT('title')}</CardTitle>
        <CardDescription>{chartBarT('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={barChartConfig} className="h-[300px]">
          <BarChart accessibilityLayer data={barChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="desktop"
              fill={barChartConfig.desktop.color}
              radius={4}
            />
            <Bar
              dataKey="mobile"
              fill={barChartConfig.mobile.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {chartBarT('trend')} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {chartBarT('footer')}
        </div>
      </CardFooter>
    </Card>
  );
}
