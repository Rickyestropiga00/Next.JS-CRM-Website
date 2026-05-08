import { can } from '@/lib/permissions';
import { Role } from '@/types/interface';
import { Resource, Action } from '@/lib/permissions';

export function requirePermission(
  role: Role,
  resource: Resource,
  action: Action
) {
  if (!can(role, resource, action)) {
    throw new Error('Forbidden');
  }
}
