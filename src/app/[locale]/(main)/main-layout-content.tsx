import { navGroups } from '@/components/app-navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Badge } from '@/components/ui/badge';
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
import { useNotifications } from '@/context/notification-context';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
const extra_pages = [
  { title: 'Nav.header.notifications', url: '/notifications' },
];

export function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();

  const cleanPath = pathname.replace(/^\/(en|fil|ja)/, '') || '/';

  const allPages = [...navGroups.flatMap((g) => g.items), ...extra_pages];

  const active = allPages.find(
    (item) => cleanPath === item.url || cleanPath.startsWith(item.url + '/')
  );

  const { unreadCount } = useNotifications();

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
                      {active.title === 'Nav.header.notifications' ? (
                        <div className="flex items-center gap-3">
                          <div>
                            {t(active.title)}

                            <p className="text-xs text-muted-foreground">
                              {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'All caught up'}
                            </p>
                          </div>

                          {unreadCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5"
                            >
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        t(active.title)
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="pr-4 flex gap-2">
            <NotificationBell />
            <DarkModeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
