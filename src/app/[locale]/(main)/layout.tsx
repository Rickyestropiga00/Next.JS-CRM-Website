'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { navGroups, getAllNavItems } from '@/components/app-navigation';
import { UserProvider } from '@/context/user-context';
import { useTranslations } from 'next-intl';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const cleanPath = pathname.replace(/^\/(en|fil|ja)/, '') || '/';

  const active = navGroups
    .flatMap((g) => g.items)
    .find(
      (item) => cleanPath === item.url || cleanPath.startsWith(item.url + '/')
    );
  return (
    <UserProvider>
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
                      {active && (
                        <BreadcrumbPage className="text-xl font-bold">
                          {t(active.title)}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="pr-4">
              <DarkModeToggle />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
