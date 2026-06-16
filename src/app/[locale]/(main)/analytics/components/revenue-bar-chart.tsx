import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { barChartConfig } from '@/app/data/analytics.ts';
import { useFetch } from '@/hooks/use-fetch';
import { Order, Product } from '@/types/interface';

import { useMemo } from 'react';
import { getTopProductRevenueComparison } from '@/utils/getProductRevenue';
import { formatPrice } from '@/utils/formatters';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useTranslations } from 'next-intl';

export const BAR_COLORS = [
  'var(--chart-5)',
  'var(--chart-4)',
  'var(--chart-3)',
  'var(--chart-2)',
  'var(--chart-1)',
];

const MAX_PRODUCTS = 5;

const calculateTopSellingProducts = (orders: Order[], products: Product[]) => {
  // Group orders by product and sum quantities (excluding canceled orders)
  const productSales = orders
    .filter((order) => order.status !== 'Canceled')
    .reduce(
      (acc, order) => {
        const productCode = order.item;
        const productName = order.product;
        const productType = order.productType;

        if (!acc[productCode]) {
          acc[productCode] = {
            code: productCode,
            name:
              typeof productName === 'string'
                ? productName
                : productName?.name || 'Unknown',
            totalQuantity: 0,
            totalRevenue: 0,
            productType: productType,
          };
        }

        acc[productCode].totalQuantity += order.quantity;
        acc[productCode].totalRevenue += order.total;

        return acc;
      },
      {} as Record<
        string,
        {
          code: string;
          name: string;
          totalQuantity: number;
          totalRevenue: number;
          productType: string;
        }
      >
    );

  const sortedProducts = Object.values(productSales)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, MAX_PRODUCTS);

  return sortedProducts.map((sale) => {
    const product = products.find((p) => p.code === sale.code);

    return {
      ...sale,
      price: product?.price || 0,
      status: product?.status || 'Inactive',
      stock: product?.stock || 0,
    };
  });
};

export function RevenueBarChart() {
  const t = useTranslations();
  const { data: productsData } = useFetch<Product>('products');
  const { data: ordersData } = useFetch<Order>('orders');
  const { filteredOrder } = useFilteredOrderByAgent(ordersData);
  const topSellingProducts = useMemo(() => {
    return calculateTopSellingProducts(filteredOrder, productsData);
  }, [filteredOrder, productsData]);
  const topProduct = useMemo(() => {
    return topSellingProducts[0];
  }, [topSellingProducts]);

  const revenueComparison = useMemo(() => {
    if (!topProduct) return null;

    return getTopProductRevenueComparison(filteredOrder, topProduct.code);
  }, [filteredOrder, topProduct]);

  const CustomTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const product = payload[0].payload;

    return (
      <div className="bg-background border border-muted rounded px-3 py-2 text-xs shadow-lg min-w-[120px]">
        <div className="flex gap-2 items-center mb-2">
          <span
            style={{ backgroundColor: product.color }}
            className="inline-block w-2 h-2 rounded-full"
          />
          <p className="font-semibold">{product.name}</p>
        </div>
        <p>
          {`${t('Analytics.customTooltip.revenue')}: ${formatPrice(
            product.totalRevenue ?? 0
          )}`}
        </p>
        <p>{`${t('Analytics.customTooltip.quantitySold')} ${
          product.totalQuantity
        }`}</p>
      </div>
    );
  };

  const chartData = topSellingProducts.map((product, index) => ({
    ...product,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }));

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('Analytics.revenueBarChart.title')}</CardTitle>
        <CardDescription>
          {t('Analytics.revenueBarChart.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={barChartConfig} className=" h-[300px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={28}
            barCategoryGap="30%"
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
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={150}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={<CustomTooltipContent />}
            />

            <Bar dataKey="totalRevenue" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-2 text-sm">
        <div className="flex flex-col items-start gap-2 font-medium">
          <div className="flex items-center gap-2 font-medium">
            {t('Analytics.revenueBarChart.footer.bestSeller')}:{' '}
            {topProduct?.name}{' '}
          </div>
          <div className="text-muted-foreground ">
            {`${t('Analytics.revenueBarChart.footer.previous')}: `}{' '}
            {formatPrice(revenueComparison?.previousRevenue ?? 0)} →{' '}
            {`${t('Analytics.revenueBarChart.footer.current')}: `}{' '}
            {formatPrice(revenueComparison?.currentRevenue ?? 0)}
          </div>
        </div>
        <div className="flex gap-2 leading-none font-medium">
          {(revenueComparison?.growth ?? 0) > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}

          {t('Analytics.revenueBarChart.footer.growth', {
            growth: revenueComparison?.growth ?? 0,
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
