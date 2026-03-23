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
  _id?: string;
  id?: string;
  orderId?: string;
  customer: null | Customer | string;
  address: string;
  product: string;
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
export type ProductType = 'Physical' | 'Digital' | 'Service' | 'Subscription';

export interface Product {
  _id?: string; // For MongoDB documents
  id: string;
  productId?: string;
  name: string;
  code: string;
  type: ProductType;
  date: string; // ISO date string
  stock: number;
  price: number;
  status: ProductStatus;
  image: string;
  comment?: string;
  createdAt?: string; // For MongoDB documents
}
