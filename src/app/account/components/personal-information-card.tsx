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

type UserType = {
  name: string;
  email: string;
  role: string;
  phone?: string;
  company?: string;
  location?: string;
  createdAt: string;
  lastLogin: string;
};

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
  const handleUpdateAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    const toastId = 'account-update';

    toast.loading('Saving changes...', { id: toastId });

    const res = await fetch('/api/user/update-account-information', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
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
        setInitialUser(user);
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
        })
      : false;

  if (!user) return <Loader className="mx-auto mt-20 animate-spin" />;

  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: '/api/placeholder/150/150',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    role: 'Administrator',
    location: 'New York, NY',
    joinDate: 'January 2024',
    lastLogin: '2 hours ago',
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
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="bg-muted flex size-full items-center justify-center rounded-full text-lg">
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
        <form onSubmit={handleUpdateAccountInfo} className="space-y-6">
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
