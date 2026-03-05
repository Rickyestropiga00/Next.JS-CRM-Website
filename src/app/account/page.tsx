'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { navGroups, getAllNavItems } from '@/components/app-navigation';
import { Loader } from 'lucide-react';
import PersonalInformationCard from './components/personal-information-card';
import AccountSecurityCard from './components/account-security-card';
import AccountSummaryCard from './components/account-summary-card';
import QuickActionsCard from './components/quick-actions-card';

export default function AccountPage() {
  const pathname = usePathname();
  const navItems = getAllNavItems(navGroups);
  const active = navItems.find((item) => pathname.startsWith(item.url));
  const [initialUser, setInitialUser] = useState<typeof user>(null);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    phone?: string;
    company?: string;
    location?: string;
    createdAt: string;
    lastLogin: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setInitialUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  if (!user) return <Loader className="mx-auto mt-20 animate-spin" />;

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
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <PersonalInformationCard
                user={user}
                setUser={setUser}
                initialUser={initialUser}
                setInitialUser={setInitialUser}
              />

              {/* Account Security */}
              <AccountSecurityCard />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Summary */}
              <AccountSummaryCard user={user} />

              {/* Quick Actions */}
              <QuickActionsCard />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
