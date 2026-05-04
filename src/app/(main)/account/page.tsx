'use client';

import { useEffect, useState } from 'react';

import PersonalInformationCard from './components/personal-information-card';
import AccountSecurityCard from './components/account-security-card';
import AccountSummaryCard from './components/account-summary-card';
import QuickActionsCard from './components/quick-actions-card';
import {
  AccountSummarySkeleton,
  PersonalInformationSkeleton,
} from './components/account-skeleton';
import { UserType } from '@/types/interface';

export default function AccountPage() {
  const [initialUser, setInitialUser] = useState<UserType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

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

  return (
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
          {!user ? (
            <PersonalInformationSkeleton />
          ) : (
            <PersonalInformationCard
              user={user}
              setUser={setUser}
              initialUser={initialUser}
              setInitialUser={setInitialUser}
            />
          )}

          {/* Account Security */}
          <AccountSecurityCard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          {!user ? (
            <AccountSummarySkeleton />
          ) : (
            <AccountSummaryCard user={user} />
          )}
          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
