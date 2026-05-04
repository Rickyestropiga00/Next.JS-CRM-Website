import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Globe, Key, Palette } from 'lucide-react';
import React from 'react';

const QuickActionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Notification Settings
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Appearance
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          Language & Region
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
