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
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Loader, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { UserType } from '../page';

interface Props {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  initialUser: UserType | null;
  setInitialUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

const PersonalInformationCard = ({
  user,
  setUser,
  initialUser,
  setInitialUser,
}: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpdateAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    const toastId = 'account-update';

    toast.loading('Saving changes...', { id: toastId });

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('phone', user.phone || '');
    formData.append('company', user.company || '');
    formData.append('location', user.location || '');

    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    const res = await fetch('/api/user/update-account-information', {
      method: 'PUT',
      body: formData,
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
        setInitialUser(user);
        setSelectedFile(null);
        setPreview(null);
        break;
      case 400:
        toast.error(data.error, { id: toastId });
        break;
      case 500:
        toast.error(data.error, { id: toastId });
        break;
    }
    setIsUpdating(false);
  };

  const hasChanges =
    user && initialUser
      ? JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          company: user.company || '',
          location: user.location || '',
        }) !==
          JSON.stringify({
            name: initialUser.name,
            email: initialUser.email,
            phone: initialUser.phone || '',
            company: initialUser.company || '',
            location: initialUser.location || '',
          }) || selectedFile !== null
      : false;

  if (!user) return <Loader className="mx-auto mt-20 animate-spin" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUpdateAccountInfo} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="bg-muted flex size-full items-center justify-center rounded-full text-lg object-contain"
                src={preview || `/api/user/avatar/${user._id}`}
                alt={user.name}
              />
              <AvatarFallback className="bg-muted flex size-full items-center justify-center rounded-full text-lg">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                hidden
                id="avatar"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 2 * 1024 * 1024) {
                    toast.error('Image must be less than 2MB');
                    return;
                  }

                  if (preview) URL.revokeObjectURL(preview);
                  setSelectedFile(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar')?.click()}
              >
                Change Photo
              </Button>

              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user?.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={user?.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={user?.company || ''}
                onChange={(e) => setUser({ ...user, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={user?.location || ''}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={isUpdating || !hasChanges}
              type="submit"
              className={!hasChanges ? 'opacity-50 cursor-pointer!' : ''}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInformationCard;
