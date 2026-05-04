import { Role } from '@/types/interface';
export type Resource = 'order' | 'product';
export type Action = 'create' | 'read' | 'update' | 'delete';

export const permissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    order: ['create', 'read', 'update', 'delete'],
    product: ['create', 'read', 'update', 'delete'],
  },
  manager: {
    order: ['create', 'read', 'update'],
    product: ['read'],
  },
  agent: {
    order: ['create', 'read'],
    product: ['read'],
  },
};

export function can(role: Role, resource: Resource, action: Action) {
  return permissions[role][resource].includes(action);
}
