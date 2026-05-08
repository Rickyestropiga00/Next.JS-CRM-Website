import { Role } from '@/types/interface';
export type Resource = 'order' | 'product' | 'task' | 'agent' | 'customer';
export type Action = 'create' | 'read' | 'update' | 'delete';

export const permissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    order: ['create', 'read', 'update', 'delete'],
    product: ['create', 'read', 'update', 'delete'],
    task: ['create', 'read', 'update', 'delete'],
    agent: ['create', 'read', 'update', 'delete'],
    customer: ['create', 'read', 'update', 'delete'],
  },
  manager: {
    order: ['create', 'read', 'update'],
    product: ['read'],
    task: ['create', 'read', 'update'],
    agent: ['create', 'read', 'update'],
    customer: ['create', 'read', 'update'],
  },
  agent: {
    order: ['create', 'read'],
    product: ['read'],
    task: ['create', 'read', 'update'],
    agent: [],
    customer: ['create', 'read', 'update'],
  },
};

export function can(role: Role, resource: Resource, action: Action) {
  return permissions[role][resource].includes(action);
}
