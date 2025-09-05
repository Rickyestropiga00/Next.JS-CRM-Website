import React from "react";
import type { ReactNode, ReactElement } from "react";
import { Legend, Tooltip, ResponsiveContainer } from "recharts";

// ChartConfig type for legend/color mapping
export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

// ChartContainer: wraps chart in a responsive container
export function ChartContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  config?: ChartConfig;
}) {
  // Ensure only a single valid ReactElement is passed to ResponsiveContainer
  const child = React.Children.only(children) as ReactElement | null;
  if (!child) return null;
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        {child}
      </ResponsiveContainer>
    </div>
  );
}

// ChartLegend: wrapper for recharts Legend
export function ChartLegend({
  className,
  content,
  wrapperStyle,
}: {
  className?: string;
  content?: ReactNode;
  wrapperStyle?: React.CSSProperties;
}) {
  return (
    <Legend
      className={className}
      content={content as any}
      wrapperStyle={wrapperStyle}
    />
  );
}

// ChartLegendContent: Shadcn-style horizontal legend with colored dots and labels
export function ChartLegendContent(props: any) {
  if (!props || !props.payload) return null;
  return (
    <div className="flex gap-6 justify-center items-center mt-4">
      {props.payload.map((entry: any) => (
        <span
          key={entry.value}
          className="flex items-center gap-2 text-xs font-medium"
        >
          <span
            style={{ background: entry.color }}
            className="inline-block w-3 h-3 rounded-full border border-muted"
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </span>
      ))}
    </div>
  );
}

// ChartTooltip: wrapper for recharts Tooltip
export function ChartTooltip(props: any) {
  return <Tooltip {...props} content={<ChartTooltipContent />} />;
}

// ChartTooltipContent: Shadcn-style tooltip with value display
export function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-background border border-muted rounded px-3 py-2 text-xs shadow-lg min-w-[120px]">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((item: any) => (
        <div
          key={item.dataKey}
          className="flex items-center gap-2 mb-1 last:mb-0"
        >
          <span
            style={{ background: item.color }}
            className="inline-block w-2 h-2 rounded-full"
          />
          <span className="capitalize">{item.name}:</span>
          <span className="font-mono tabular-nums">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
