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
  User,
  TrendingDownIcon,
  CircleUser,
  ChartNoAxesCombined,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/interface';
import { useMemo } from 'react';
import { formatPrice } from '@/utils/formatters';
import { useFetch } from '@/hooks/use-fetch';
import { useFilteredOrderByAgent } from '@/hooks/use-filter-orders';
import { useTranslations } from 'next-intl';

export function SectionCards() {
  const { data: orders, loading: ordersLoading } = useFetch<Order>(
    'orders',
    false,
    false
  );
  const { filteredOrder } = useFilteredOrderByAgent(orders);
  const sectionCardsT = useTranslations('Analytics.sectionCards');

  const calculateTotalRevenue = useMemo(() => {
    return filteredOrder
      .filter((order) => order.status !== 'Canceled')
      .reduce((acc, order) => acc + (order.total || 0), 0);
  }, [filteredOrder]);

  const total = 1250 + calculateTotalRevenue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {sectionCardsT('totalRevenue.label')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {!ordersLoading ? (
                formatPrice(total)
              ) : (
                <div className="text-center @[100px]/card:text-xl text-muted-foreground">
                  {sectionCardsT('totalRevenue.loading')}
                </div>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <HandCoins className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sectionCardsT('totalRevenue.trend')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {sectionCardsT('totalRevenue.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {sectionCardsT('totalRevenue.badge')}
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {sectionCardsT('newCustomers.label')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              1,234
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <User className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sectionCardsT('newCustomers.trend')}
            <TrendingDownIcon className="size-4 text-red-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {sectionCardsT('newCustomers.description')}
            </div>
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              {sectionCardsT('newCustomers.badge')}
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {sectionCardsT('activeAccounts.label')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              45,678
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <CircleUser className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sectionCardsT('activeAccounts.trend')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {sectionCardsT('activeAccounts.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {sectionCardsT('activeAccounts.badge')}
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>
              {sectionCardsT('growthRate.label')}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              4.5%
            </CardTitle>
          </div>
          <div className="flex items-center justify-center rounded-full border border-secondary bg-background w-12 h-12">
            <ChartNoAxesCombined className="size-7" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sectionCardsT('growthRate.trend')}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              {sectionCardsT('growthRate.description')}
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              {sectionCardsT('growthRate.badge')}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
