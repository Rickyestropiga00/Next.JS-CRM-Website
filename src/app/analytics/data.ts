// Chart data for analytics page
export const radarChartData = [
  { month: "January", Desktop: 186, Mobile: 80 },
  { month: "February", Desktop: 305, Mobile: 200 },
  { month: "March", Desktop: 237, Mobile: 120 },
  { month: "April", Desktop: 73, Mobile: 190 },
  { month: "May", Desktop: 209, Mobile: 130 },
  { month: "June", Desktop: 214, Mobile: 140 },
];

export const barChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
  { month: "July", desktop: 250, mobile: 160 },
  { month: "August", desktop: 230, mobile: 180 },
  { month: "September", desktop: 280, mobile: 220 },
  { month: "October", desktop: 310, mobile: 240 },
  { month: "November", desktop: 350, mobile: 260 },
  { month: "December", desktop: 400, mobile: 290 },
];

export const areaChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

// Chart config for analytics page
export const radarChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-5)",
  },
};

export const barChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-5)",
  },
};

export const areaChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
}; 