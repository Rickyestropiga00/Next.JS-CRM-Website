'use client';

import dynamic from 'next/dynamic';

import { SectionCards } from './components/section-cards';
import { useEffect, useState } from 'react';
import { Can } from '@/components/auth/can';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';

// Dynamically import heavy chart components
const ChartRadarLegend = dynamic(
  () =>
    import('./components/chart-radar-legend').then((mod) => ({
      default: mod.ChartRadarLegend,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const ChartBarMultiple = dynamic(
  () =>
    import('./components/chart-bar-multiple').then((mod) => ({
      default: mod.ChartBarMultiple,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const ChartAreaGradient = dynamic(
  () =>
    import('./components/chart-area-gradient').then((mod) => ({
      default: mod.ChartAreaGradient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const KpiOverviewCards = dynamic(
  () =>
    import('./components/kpi-overview-cards').then((mod) => ({
      default: mod.KpiOverviewCards,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const RevenueAreaChart = dynamic(
  () =>
    import('./components/revenue-area-chart').then((mod) => ({
      default: mod.RevenueAreaChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const RevenueBarChart = dynamic(
  () =>
    import('./components/revenue-bar-chart').then((mod) => ({
      default: mod.RevenueBarChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);
const CustomerStatusPieChart = dynamic(
  () =>
    import('./components/customer-status-pie-chart').then((mod) => ({
      default: mod.CustomerStatusPieChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const AgentTotalOrder = dynamic(
  () =>
    import('./components/agent-total-order').then((mod) => ({
      default: mod.AgentTotalOrder,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const AgentTotalRevenue = dynamic(
  () =>
    import('./components/agent-total-revenue').then((mod) => ({
      default: mod.AgentTotalRevenue,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

const AgentTotalCustomer = dynamic(
  () =>
    import('./components/agent-total-customer').then((mod) => ({
      default: mod.AgentTotalCustomer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

export type MonthlyRevenueData = {
  currentRevenue: number;
  previousRevenue: number;
  growth: number;
};

export default function AnalyticsPage() {
  const t = useTranslations();
  const { user } = useUser();

  return (
    <>
      {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
        <SectionCards />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:basis-1/4 w-full">
            <ChartRadarLegend />
          </div>
          <div className="lg:basis-2/4 w-full">
            <ChartBarMultiple />
          </div>
          <div className="lg:basis-1/4 w-full">
            <ChartAreaGradient />
          </div>
        </div>
      </div> */}

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
        <KpiOverviewCards />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:basis-1/4 w-full">
            <RevenueAreaChart />
          </div>
          <div className="lg:basis-2/4 w-full">
            <RevenueBarChart />
          </div>

          <div className="lg:basis-1/4 w-full">
            <CustomerStatusPieChart />
          </div>
        </div>
      </div>

      <Can role={user?.role} action="read" resource="analytics">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
          <span className="text-xl font-bold">
            {t('Analytics.agentLeaderboard.sectionTitle')}
          </span>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:basis-1/2 w-full">
              <AgentTotalOrder />
            </div>
            <div className="lg:basis-1/2 w-full">
              <AgentTotalRevenue />
            </div>
            <div className="lg:basis-1/2 w-full">
              <AgentTotalCustomer />
            </div>
          </div>
        </div>
      </Can>
    </>
  );
}
