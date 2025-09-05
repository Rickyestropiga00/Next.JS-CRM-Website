"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { navGroups, getAllNavItems } from "@/components/app-navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

const TasksContent = dynamic(
  () => import("./components/tasks-content").then((mod) => mod.TasksContent),
  { ssr: false }
);

export default function TasksPage() {
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
        <TasksContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
