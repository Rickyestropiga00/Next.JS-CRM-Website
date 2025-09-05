"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { navGroups, getAllNavItems } from "@/components/app-navigation";
import { SectionCards } from "./components/section-cards";
import { ChartRadarLegend } from "./components/chart-radar-legend";
import { ChartBarMultiple } from "./components/chart-bar-multiple";
import { ChartAreaGradient } from "./components/chart-area-gradient";

export default function AnalyticsPage() {
  const pathname = usePathname();
  const navItems = getAllNavItems(navGroups);
  const active = navItems.find((item) => pathname.startsWith(item.url));
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {active && (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xl font-bold">
                      {active.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="pr-4">
            <DarkModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
          <SectionCards />
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
