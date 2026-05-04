import { Role } from '@/types/interface';
import { can, Resource, Action } from '@/lib/permissions';

type Props = {
  role?: Role;
  action: Action;
  resource: Resource;
  children: React.ReactNode;
};

export function Can({ role, action, resource, children }: Props) {
  if (!role) return null;
  if (!can(role, resource, action)) return null;
  return <>{children}</>;
}
