import { Role } from '@/types/interface';
export type Resource =
  | 'order'
  | 'product'
  | 'task'
  | 'agent'
  | 'customer'
  | 'analytics';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'assign';

export const permissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    order: ['create', 'read', 'update', 'delete'],
    product: ['create', 'read', 'update', 'delete'],
    task: ['create', 'read', 'update', 'delete', 'assign'],
    agent: ['create', 'read', 'update', 'delete'],
    customer: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
  },
  manager: {
    order: ['create', 'read', 'update'],
    product: ['read'],
    task: ['create', 'read', 'update'],
    agent: ['create', 'read', 'update'],
    customer: ['create', 'read', 'update'],
    analytics: ['read'],
  },
  agent: {
    order: ['create', 'read', 'update'],
    product: ['read'],
    task: ['create', 'read', 'update'],
    agent: [],
    customer: ['create', 'read', 'update'],
    analytics: [],
  },
};

export function can(role: Role, resource: Resource, action: Action) {
  return permissions[role][resource].includes(action);
}
