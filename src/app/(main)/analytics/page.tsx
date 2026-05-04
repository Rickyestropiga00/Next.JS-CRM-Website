'use client';

import dynamic from 'next/dynamic';

import { SectionCards } from './components/section-cards';

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

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
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
    </div>
  );
}
