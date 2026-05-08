export type CustomerStatus = 'Lead' | 'Active' | 'Inactive' | 'Prospect';

export interface Customer {
  _id?: string;
  id: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: CustomerStatus;
  lastContacted?: string;
  expiresAt?: Date;
  notes?: string;
  comment?: string;
  createdAt: Date | string;
  updatedAt?: Date;
}

export type OrderStatus = 'Pending' | 'In Transit' | 'Completed' | 'Canceled';
export type PaymentStatus = 'Paid' | 'Unpaid';

export interface Order {
  _id?: string;
  id: string;
  orderId?: string;
  customer: null | Customer | string;
  address: string;
  product: null | Product | string;
  productType: string;
  item: string;
  quantity: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
  createdAt: Date | string;
  expiresAt?: Date | string;
  updatedAt?: Date | string;
}

export type ProductStatus = 'Active' | 'Disabled';
export type ProductTypes = 'Physical' | 'Digital' | 'Service' | 'Subscription';

export interface Product {
  _id?: string; // For MongoDB documents
  id: string;
  productId?: string;
  name: string;
  code: string;
  productType: ProductTypes;
  date: string; // ISO date string
  stock: number;
  price: number;
  status: ProductStatus;
  image: string;
  imageType?: string;
  comment?: string;
  createdAt?: string; // For MongoDB documents
  updatedAt?: string;
}

export type RoleType = 'Admin' | 'Agent' | 'Manager';
export type AgentStatus = 'Active' | 'Inactive' | 'On Leave';

export type Agent = {
  _id?: string; // For MongoDB documents
  id: string;
  agentId?: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  status: AgentStatus;
  assignedCustomers: string[];
  createdAt: string;
  lastLogin: string;
  notes?: string;
  comment?: string;
};

export type ColumnKey = 'todo' | 'inprogress' | 'inreview' | 'done';
export type PriorityKey = 'LOW' | 'MEDIUM' | 'HIGH';

export type Task = {
  _id?: string;
  id: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  priority: PriorityKey;
  column: ColumnKey;
  lastAdded: string;
  createdAt?: string;
  avatars: Array<{
    src: string;
    alt: string;
    fallback: string;
  }>;
};

export type DeleteResponse = {
  message: string;
};
export type Role = 'admin' | 'manager' | 'agent';

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  company?: string;
  location?: string;
  avatar?: string | null;
  avatarType?: string | null;
  createdAt: string;
  lastLogin: string;
};
