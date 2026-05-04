import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/utils/formatters';
import { Building, Mail, MapPin, User } from 'lucide-react';
import React from 'react';
import { UserType } from '@/types/interface';

interface Props {
  user: UserType;
}

const AccountSummaryCard = ({ user }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Role:</span>
          </div>
          <Badge className="capitalize" variant="secondary">
            {user?.role}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user?.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Member since:</span>
          <span className="text-sm font-medium">
            {new Date(user?.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last login:</span>
          <span className="text-sm font-medium">
            {timeAgo(user?.lastLogin)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummaryCard;
