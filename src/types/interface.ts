export type CustomerStatus = 'Lead' | 'Active' | 'Inactive' | 'Prospect';

export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: CustomerStatus;
  lastContacted?: string;
  expiresAt: Date;
  notes?: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'Pending' | 'In Transit' | 'Completed' | 'Canceled';
export type PaymentStatus = 'Paid' | 'Unpaid';

export interface Order {
  orderId: string;
  customer: string;
  address: string;
  product: string;
  productType: string;
  item: string;
  quantity: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
