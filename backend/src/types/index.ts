// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode?: number;
    stack?: string;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospect';
  source: string;
  value: number;
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inStock: number;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  _id: string;
  customer: string;
  products: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Agent types
export interface Agent {
  _id: string;
  user: string;
  department: string;
  performance: {
    salesTarget: number;
    salesAchieved: number;
    customersAssigned: number;
    tasksCompleted: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
