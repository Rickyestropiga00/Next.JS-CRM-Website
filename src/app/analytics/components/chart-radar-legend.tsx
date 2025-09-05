import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { TrendingUp } from "lucide-react";
import { radarChartData, radarChartConfig } from "../data";

export function ChartRadarLegend() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Radar Chart - Legend</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={radarChartConfig} className="mx-auto h-[300px]">
          <RadarChart
            data={radarChartData}
            margin={{
              top: -40,
              bottom: -10,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <PolarGrid />
            <Radar
              dataKey="Desktop"
              fill={radarChartConfig.desktop.color}
              stroke={radarChartConfig.desktop.color}
              fillOpacity={0.5}
            />
            <Radar
              dataKey="Mobile"
              fill={radarChartConfig.mobile.color}
              stroke={radarChartConfig.mobile.color}
              fillOpacity={0.5}
            />
            <ChartLegend
              wrapperStyle={{
                paddingTop: 40,
              }}
              content={<ChartLegendContent />}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
