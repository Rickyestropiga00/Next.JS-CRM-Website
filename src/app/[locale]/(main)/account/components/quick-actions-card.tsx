'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Globe, Key, Palette } from 'lucide-react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { UserType } from '@/types/interface';

const SelectLanguagePopover = dynamic(
  () =>
    import('./select-language-popover').then((mod) => ({
      default: mod.SelectLanguagePopover,
    })),
  { ssr: false }
);
const ApperancePopover = dynamic(
  () =>
    import('./appearance-popover').then((mod) => ({
      default: mod.ApperancePopover,
    })),
  { ssr: false }
);

const NotificationPopover = dynamic(
  () =>
    import('./notification-popover').then((mod) => ({
      default: mod.NotificationPopover,
    })),
  { ssr: false }
);
interface QuickActionsCardProps {
  user: UserType | null;
}

const QuickActionsCard = ({ user }: QuickActionsCardProps) => {
  const quickActionsT = useTranslations('QuickActions');
  const [showSelectLanguage, setShowSelectLanguage] = useState<boolean>(false);
  const [showAppearancePopover, setShowAppearancePopover] =
    useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{quickActionsT('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            onClick={() => setShowNotification(true)}
          >
            <Bell className="h-4 w-4 mr-2" />
            {quickActionsT('notifications')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            onClick={() => setShowAppearancePopover(true)}
          >
            <Palette className="h-4 w-4 mr-2" />
            {quickActionsT('appearance')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            type="button"
            onClick={() => setShowSelectLanguage(true)}
          >
            <Globe className="h-4 w-4 mr-2" />
            {quickActionsT('language.title')}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Key className="h-4 w-4 mr-2" />
            {quickActionsT('api')}
          </Button>
        </CardContent>
      </Card>
      <SelectLanguagePopover
        isOpen={showSelectLanguage}
        onClose={() => setShowSelectLanguage(false)}
      />
      <ApperancePopover
        isOpen={showAppearancePopover}
        onClose={() => setShowAppearancePopover(false)}
      />

      <NotificationPopover
        user={user}
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default QuickActionsCard;
