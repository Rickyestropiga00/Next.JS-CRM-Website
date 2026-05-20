import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';

const AccountSecurityCard = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const accountSecurityT = useTranslations('Account.security');
  const formsFieldsT = useTranslations('Forms.fields');
  const buttonsT = useTranslations('Buttons');
  const validationsT = useTranslations('Validations');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const toastId = 'update-password';
    toast.loading('Saving...', { id: toastId });

    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      credentials: 'include',
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { error: 'Server did not return valid JSON' };
    }

    switch (res.status) {
      case 200:
        toast.success(data.message, { id: toastId });
        setIsUpdating(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        break;
      case 400:
        toast.error(data.error, { id: toastId });
        break;
      case 500:
        toast.error(data.error, { id: toastId });
        break;
    }
  };

  const isFormValid = (): boolean => {
    return (
      currentPassword !== '' && newPassword !== '' && confirmPassword !== ''
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {accountSecurityT('title')}
        </CardTitle>
        <CardDescription>{accountSecurityT('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">
              {formsFieldsT('currentPassword')}
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">
              {' '}
              {formsFieldsT('newPassword')}{' '}
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              {formsFieldsT('confirmNewPassword')}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button disabled={!isFormValid() || isUpdating} type="submit">
              {isUpdating ? buttonsT('saving') : buttonsT('updatePassword')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSecurityCard;
