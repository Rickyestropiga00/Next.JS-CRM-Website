export type CustomerStatus = 'Lead' | 'Active' | 'Inactive' | 'Prospect';

export interface Customer {
  _id?: string;
  id?: string;
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
  id?: string;
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

export type roleType = 'Admin' | 'Agent' | 'Manager';
export type agentStatus = 'Active' | 'Inactive' | 'On Leave';

export type Agent = {
  _id?: string; // For MongoDB documents
  id: string;
  agentId?: string;
  name: string;
  email: string;
  phone: string;
  role: roleType;
  status: agentStatus;
  assignedCustomers: string[];
  createdAt: string;
  lastLogin: string;
  notes?: string;
  comment?: string;
};
