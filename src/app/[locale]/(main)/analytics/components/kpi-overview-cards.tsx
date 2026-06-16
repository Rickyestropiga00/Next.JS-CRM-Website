import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HandCoins,
  TrendingUpIcon,
  TrendingDownIcon,
  CircleUser,
  BookMinus,
  BookA,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Customer, Order, Agent } from '@/types/interface';
import { useMemo } from 'react';
import { formatPrice } from '@/utils/formatters';
import { useFetch } from '@/hooks/use-fetch';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useTranslations } from 'next-intl';
import { useFilteredCustomers } from '@/hooks/use-filtered-customers';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export function KpiOverviewCards() {
  const { user } = useUser();
  const { data: orders, loading: ordersLoading } = useFetch<Order>(
    'orders',
    false,
    false
  );

  const { data: customers } = useFetch<Customer>('customers', false, false);
  const { data: agents } = useFetch<Agent>('agents', false, false);

  const { filteredOrder } = useFilteredOrderByAgent(orders);
  const filteredCustomer = useFilteredCustomers(customers, agents, user);
  const t = useTranslations();

  const kpi = useMemo(() => {
    const completedOrders = filteredOrder.filter(
      (o) => o.status === 'Completed'
    );

    const cancelledOrders = filteredOrder.filter(
      (o) => o.status === 'Canceled'
    );

    const totalRevenue = completedOrders.reduce(
      (acc, o) => acc + (o.total || 0),
      0
    );

    const totalOrders = filteredOrder.length;

    const totalCustomers = filteredCustomer.length;

    const activeCustomers = filteredCustomer.filter(
      (c) => c.status.toLowerCase() === 'active'
    ).length;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrder: totalRevenue / totalOrders,
      completionRate: completedOrders.length / totalOrders,
      activeCustomerRate: activeCustomers / totalCustomers,
      cancelledOrders: cancelledOrders.length,
      cancellationRate: (cancelledOrders.length / totalOrders) * 100,
    };
  }, [filteredCustomer, filteredOrder]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="@container/card relative">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {t('Analytics.kpiCards.revenue.description')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {!ordersLoading && kpi.totalRevenue > 0 ? (
                formatPrice(kpi.totalRevenue)
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('Analytics.kpiCards.revenue.loading')}</span>
                </div>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12 2xl:absolute 2xl:right-6 2xl:top-2">
            <HandCoins className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t('Analytics.kpiCards.revenue.footer.title')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {t('Analytics.kpiCards.revenue.footer.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />

              {formatPrice(kpi.averageOrder)}
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {' '}
              {t('Analytics.kpiCards.totalOrder.description')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {kpi.totalOrders}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <BookA className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t('Analytics.kpiCards.totalOrder.footer.title')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {t('Analytics.kpiCards.totalOrder.footer.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {kpi.completionRate.toFixed(1)} %
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {t('Analytics.kpiCards.totalCustomer.description')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {kpi.totalCustomers}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <CircleUser className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t('Analytics.kpiCards.totalCustomer.footer.title')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {t('Analytics.kpiCards.totalCustomer.footer.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {kpi.activeCustomerRate.toFixed(1)} %
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {t('Analytics.kpiCards.cancelledOrder.description')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {kpi.cancelledOrders}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <BookMinus className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t('Analytics.kpiCards.cancelledOrder.footer.title')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {t('Analytics.kpiCards.cancelledOrder.footer.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {kpi.cancellationRate.toFixed(1)} %
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
