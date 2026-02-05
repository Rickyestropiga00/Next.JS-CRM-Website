import { useMemo, memo } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { customers } from "@/app/customers/data";
import { agents } from "@/app/agents/data";

// Dynamically import Recharts components
const Pie = dynamic(
  () => import("recharts").then((mod) => mod.Pie),
  { ssr: false }
);

const PieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
);

const chartConfig = {
  customers: {
    label: "Customers",
    color: "var(--chart-1)",
  },
  agents: {
    label: "Agents",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export const CustomersAgentsChart = memo(function CustomersAgentsChart() {
  // Memoize chart data calculation
  const chartData = useMemo(() => [
    {
      category: "customers",
      count: customers.length,
      fill: "var(--chart-1)",
    },
    {
      category: "agents",
      count: agents.length,
      fill: "var(--chart-5)",
    },
  ], []);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Customers vs Agents</CardTitle>
        <CardDescription>Current distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] lg:max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-2 leading-none font-medium text-center">
          Total: {customers.length + agents.length} records{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-center">
          {customers.length} customers and {agents.length} agents
        </div>
      </CardFooter>
    </Card>
  );
});
