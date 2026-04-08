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

export function SectionCards() {
  const { data: orders, loading: ordersLoading } = useFetch<Order>(
    'order',
    false,
    false
  );

  const calculateTotalRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status !== 'Canceled')
      .reduce((acc, order) => acc + (order.total || 0), 0);
  }, [orders]);

  const total = 1250 + calculateTotalRevenue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {!ordersLoading ? (
                formatPrice(total)
              ) : (
                <div className="text-center @[100px]/card:text-xl text-muted-foreground">
                  Loading revenue...
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
            Trending up this month{' '}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>New Customers</CardDescription>
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
            Down this period{' '}
            <TrendingDownIcon className="size-4 text-red-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              Acquisition needs attention
            </div>
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              -20%
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>Active Accounts</CardDescription>
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
            Strong user retention{' '}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              Engagement exceed targets
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative flex flex-wrap-reverse justify-between gap-3">
          <div>
            <CardDescription>Growth Rate</CardDescription>
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
            Steady performance{' '}
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="flex flex-wrap w-full justify-between gap-3">
            <div className="text-muted-foreground">
              Meets growth projections
            </div>
            <Badge
              variant="outline"
              color="success"
              className="flex gap-1 rounded-lg text-xs"
            >
              <TrendingUpIcon className="size-3" />
              +4.5%
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
