"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Define and export navGroups here for use in both sidebar and breadcrumbs
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  SquareUser,
  ListTodo,
  ChartColumn,
} from "lucide-react";

export const navGroups: AppNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Products",
        url: "/products",
        icon: ShoppingBag,
      },
      {
        title: "Tasks",
        url: "/tasks",
        icon: ListTodo,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: ChartColumn,
      },
    ],
  },
  {
    label: "Client Management",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
      },
      {
        title: "Agents",
        url: "/agents",
        icon: SquareUser,
      },
    ],
  },
];

export type AppNavGroup = {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
};

export function AppNavigation({ groups }: { groups: AppNavGroup[] }) {
  const pathname = usePathname();
  useSidebar(); // Ensures context is available if needed

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup
          key={group.label}
          className="group-data-[collapsible=icon]:hidden"
        >
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

export function getAllNavItems(groups: AppNavGroup[]) {
  return groups.flatMap((group) =>
    group.items.map(({ title, url }) => ({ title, url }))
  );
}
