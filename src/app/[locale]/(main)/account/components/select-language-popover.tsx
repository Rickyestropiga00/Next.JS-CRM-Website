'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
interface SelectLanguagePopoverProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SelectLanguagePopover({
  isOpen = false,
  onClose,
}: SelectLanguagePopoverProps) {
  const languageModalT = useTranslations('QuickActions.language.modal');
  const buttonsT = useTranslations('Buttons');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [language, setLanguage] = useState(currentLocale);
  useEffect(() => {
    setLanguage(currentLocale);
  }, [currentLocale, isOpen]);

  const handleSave = () => {
    router.replace(pathname, { locale: language });
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setLanguage(currentLocale);
    if (onClose) {
      onClose();
    }
  };
  return (
    <ModalWrapper open={isOpen} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            {languageModalT('title')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {languageModalT('description')}
          </p>
        </div>

        <RadioGroup
          value={language}
          onValueChange={setLanguage}
          className="space-y-2 sm:space-y-6"
        >
          <div className="flex items-center space-x-3 rounded-lg border p-3 mb-0">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en" className="cursor-pointer">
              English
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 mb-0">
            <RadioGroupItem value="fil" id="fil" />
            <Label htmlFor="fil" className="cursor-pointer">
              Filipino
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3 m-0">
            <RadioGroupItem value="ja" id="ja" />
            <Label htmlFor="ja" className="cursor-pointer">
              Japanese
            </Label>
          </div>
        </RadioGroup>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {buttonsT('cancel')}
          </Button>
          <Button onClick={handleSave}> {buttonsT('save')} </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
