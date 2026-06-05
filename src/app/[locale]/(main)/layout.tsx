'use client';

import { NotificationProvider } from '@/context/notification-context';
import { UserProvider } from '@/context/user-context';
import { MainLayoutContent } from './main-layout-content';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <NotificationProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </NotificationProvider>
    </UserProvider>
  );
}
