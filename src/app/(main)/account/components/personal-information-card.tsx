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
import { Trash2, User } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UserType } from '@/types/interface';

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
  const [imageVersion, setImageVersion] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAvatar = !!user.avatar || !!preview;

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
        setUser((prev) =>
          prev
            ? {
                ...prev,
                avatar: preview,
              }
            : prev
        );
        setInitialUser(user);
        setSelectedFile(null);
        setPreview(null);
        setImageVersion(Date.now());
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

  const handleDeleteAvatar = async () => {
    const res = await fetch(`/api/user/avatar/${user._id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setSelectedFile(null);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatar: undefined,
            }
          : prev
      );
      setPreview(null);
      setImageVersion(Date.now());
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
            <Avatar className="h-20 w-20 ">
              <div className="relative group">
                <AvatarImage
                  className="bg-muted flex h-20 w-20  items-center justify-center rounded-full text-lg object-cover group-hover:brightness-50"
                  src={
                    preview || `/api/user/avatar/${user._id}?v=${imageVersion}`
                  }
                  alt={user.name}
                />

                <Button
                  onClick={handleDeleteAvatar}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs px-2 py-1 rounded transition cursor-pointer
                      ${
                        !hasAvatar
                          ? 'hidden'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                >
                  {' '}
                  <Trash2 />{' '}
                </Button>
              </div>

              <AvatarFallback className="bg-muted flex size-full items-center justify-center rounded-full text-lg">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
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
