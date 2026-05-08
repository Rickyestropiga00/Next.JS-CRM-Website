'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// Define and export navGroups here for use in both sidebar and breadcrumbs
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  SquareUser,
  ListTodo,
  ChartColumn,
} from 'lucide-react';

export const navGroups: AppNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        roles: ['Admin', 'Agent'],
      },
      {
        title: 'Orders',
        url: '/orders',
        icon: ShoppingCart,
        roles: ['Admin', 'Agent'],
      },
      {
        title: 'Products',
        url: '/products',
        icon: ShoppingBag,
        roles: ['Admin', 'Agent'],
      },
      {
        title: 'Tasks',
        url: '/tasks',
        icon: ListTodo,
        roles: ['Admin', 'Agent'],
      },
      {
        title: 'Analytics',
        url: '/analytics',
        icon: ChartColumn,
        roles: ['Admin', 'Agent'],
      },
    ],
  },
  {
    label: 'Client Management',
    items: [
      {
        title: 'Customers',
        url: '/customers',
        icon: Users,
        roles: ['Admin', 'Agent'],
      },
      {
        title: 'Agents',
        url: '/agents',
        icon: SquareUser,
        roles: ['Admin'],
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
    roles: string[];
  }[];
};

export function AppNavigation({
  groups,
  role,
}: {
  groups: AppNavGroup[];
  role: string;
}) {
  const pathname = usePathname();
  useSidebar(); // Ensures context is available if needed

  const normalizedRole = role?.toLowerCase();

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item: any) =>
        item.roles
          ? item.roles
              .map((r: string) => r.toLowerCase())
              .includes(normalizedRole)
          : true
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {filteredGroups.map((group) => (
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
