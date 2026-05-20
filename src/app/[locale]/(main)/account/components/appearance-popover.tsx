'use client';

import React from 'react';

import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { useAccentTheme } from '@/hooks/use-accent-themes';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

interface ApperancePopoverProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const themes = [
  {
    name: 'blue',
    color: 'bg-blue-500',
  },
  {
    name: 'emerald',
    color: 'bg-emerald-500',
  },
  {
    name: 'violet',
    color: 'bg-violet-500',
  },
  {
    name: 'rose',
    color: 'bg-rose-500',
  },
];

export const ApperancePopover = ({
  isOpen = false,
  onClose,
}: ApperancePopoverProps) => {
  const { theme, changeTheme } = useAccentTheme();
  const { theme: mode, setTheme } = useTheme();
  const buttonsT = useTranslations('Buttons');
  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <ModalWrapper open={isOpen} onClose={handleCancel}>
      <div className="space-y-6 p-4">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>

          <p className="text-sm text-muted-foreground">
            Customize your CRM appearance.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Theme Mode</h3>

          <div className="flex gap-2">
            <Button
              variant={mode === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
            >
              Light
            </Button>

            <Button
              variant={mode === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>

            <Button
              variant={mode === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
            >
              System
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Accent Color</h3>

          <div className="flex gap-3">
            {themes.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => changeTheme(item.name)}
                className={`
                  h-10
                  w-10
                  rounded-full
                  border-2
                  transition-all
                  ${item.color}
                  ${
                    theme === item.name
                      ? 'dark:border-white border-black scale-110'
                      : 'border-transparent'
                  }
                `}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>{buttonsT('close')}</Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
