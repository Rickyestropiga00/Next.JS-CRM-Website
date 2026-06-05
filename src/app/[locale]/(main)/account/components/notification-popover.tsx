'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Bell,
  UserPlus,
  ShoppingCart,
  Truck,
  CheckSquare,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { Switch } from '@/components/ui/switch';
import { UserType } from '@/types/interface';

interface NotificationPopoverProps {
  user: UserType | null;
  isOpen?: boolean;
  onClose?: () => void;
}

type Role = 'admin' | 'agent';

interface NotifItem {
  id: string;
  icon: React.ReactNode;
  colorClass: string;
  label: string;
  sub: string;
  defaultOn: boolean;
  badge?: string;
}

interface NotifSection {
  section: string;
  items: NotifItem[];
}

const iconSize = 'h-3.5 w-3.5';

const configs: Record<Role, NotifSection[]> = {
  admin: [
    {
      section: 'Products',
      items: [
        {
          id: 'product_low_stock',
          icon: <AlertTriangle className={iconSize} />,
          colorClass: 'bg-red-50 text-red-700',
          label: 'Low stock alert',
          sub: 'When product inventory is running low',
          defaultOn: true,
        },
      ],
    },
    {
      section: 'Customers',
      items: [
        {
          id: 'customer_new',
          icon: <UserPlus className={iconSize} />,
          colorClass: 'bg-blue-50 text-blue-700',
          label: 'New customer added',
          sub: 'When a customer or lead is created',
          defaultOn: true,
        },
        {
          id: 'customer_assigned',
          icon: <UserCheck className={iconSize} />,
          colorClass: 'bg-indigo-50 text-indigo-700',
          label: 'Customer assigned to me',
          sub: 'When a customer or lead is assigned',
          defaultOn: true,
        },
      ],
    },
    {
      section: 'Orders',
      items: [
        {
          id: 'order_new',
          icon: <ShoppingCart className={iconSize} />,
          colorClass: 'bg-amber-50 text-amber-700',
          label: 'New order placed',
          sub: 'Order created for any customer',
          defaultOn: true,
        },
        {
          id: 'shipment_update',
          icon: <Truck className={iconSize} />,
          colorClass: 'bg-orange-50 text-orange-700',
          label: 'Shipment update',
          sub: 'In transit or delivered',
          defaultOn: true,
        },
      ],
    },
    {
      section: 'Tasks',
      items: [
        {
          id: 'task_assigned',
          icon: <CheckSquare className={iconSize} />,
          colorClass: 'bg-teal-50 text-teal-700',
          label: 'Task assigned to me',
          sub: "When you're set as assignee",
          defaultOn: true,
        },
      ],
    },
  ],

  agent: [
    {
      section: 'Customers',
      items: [
        {
          id: 'customer_assigned',
          icon: <UserCheck className={iconSize} />,
          colorClass: 'bg-indigo-50 text-indigo-700',
          label: 'Customer assigned to me',
          sub: 'When a customer or lead is assigned',
          defaultOn: true,
        },
      ],
    },
    {
      section: 'Orders',
      items: [
        {
          id: 'order_new',
          icon: <ShoppingCart className={iconSize} />,
          colorClass: 'bg-amber-50 text-amber-700',
          label: 'New order placed',
          sub: 'Order created for any customer',
          defaultOn: true,
        },
        {
          id: 'shipment_update',
          icon: <Truck className={iconSize} />,
          colorClass: 'bg-orange-50 text-orange-700',
          label: 'Shipment update',
          sub: 'In transit or delivered',
          defaultOn: true,
        },
      ],
    },
    {
      section: 'Tasks',
      items: [
        {
          id: 'task_assigned_to_agent',
          icon: <CheckSquare className={iconSize} />,
          colorClass: 'bg-teal-50 text-teal-700',
          label: 'Task assigned to me',
          sub: "When you're set as assignee",
          defaultOn: true,
        },
      ],
    },
  ],
};

const getDefaultStates = (role: Role): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  (configs[role] ?? configs['agent']).forEach((section) => {
    section.items.forEach((item) => {
      result[item.id] = item.defaultOn;
    });
  });
  return result;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <>
      <Switch checked={checked} onCheckedChange={onChange} />
    </>
  );
}

export const NotificationPopover = ({
  user,
  isOpen = false,
  onClose,
}: NotificationPopoverProps) => {
  const role = (user?.role ?? 'agent') as Role;
  const sections = configs[role] ?? configs['agent'];
  const [states, setStates] = useState<Record<string, boolean>>(() =>
    getDefaultStates(role)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStates(getDefaultStates(role));
  }, [role]);

  const handleToggle = useCallback((id: string, value: boolean) => {
    setStates((prev) => ({ ...prev, [id]: value }));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const fetchNotificationPreferences = async () => {
      const fetchRes = await fetch('/api/notifications/preferences');
      const data = await fetchRes.json();
      setStates({ ...getDefaultStates(role), ...data });
    };

    fetchNotificationPreferences();
  }, [isOpen, role]);

  const handleSave = async () => {
    setSaving(true);
    const visibleIds = sections.flatMap((s) => s.items.map((i) => i.id));
    const filtered = Object.fromEntries(
      Object.entries(states).filter(([k]) => visibleIds.includes(k))
    );
    await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(filtered),
    });
    setSaving(false);
    onClose?.();
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper open={isOpen} onClose={handleCancel}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              Notification settings
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage how you receive alerts
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 py-1">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <p className="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {section}
            </p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${item.colorClass}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm leading-none">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={states[item.id]}
                  onChange={(v) => handleToggle(item.id, v)}
                  label={item.label}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-4 border-t gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </ModalWrapper>
  );
};
