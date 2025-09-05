export type ProductStatus = 'Active' | 'Disabled';
export type ProductType = 'Physical' | 'Digital' | 'Service' | 'Subscription';

export interface Product {
  id: string;
  name: string;
  code: string;
  type: ProductType;
  date: string; // ISO date string
  stock: number;
  price: number;
  status: ProductStatus;
  image: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Professional Laptop',
    code: 'LP-PRO-001',
    type: 'Physical',
    date: '2024-01-15',
    stock: 25,
    price: 1299.99,
    status: 'Active',
    image: '/products/product-1.webp',
  },
  {
    id: '2',
    name: 'Cloud Storage Pro',
    code: 'CS-PRO-002',
    type: 'Subscription',
    date: '2024-02-10',
    stock: 0, // Not applicable for subscriptions
    price: 29.99,
    status: 'Active',
    image: '/products/product-1.webp',
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    code: 'WH-BLU-003',
    type: 'Physical',
    date: '2024-03-05',
    stock: 5,
    price: 199.99,
    status: 'Active',
    image: '/products/product-1.webp',
  },
  {
    id: '4',
    name: 'Design Software License',
    code: 'DS-LIC-004',
    type: 'Digital',
    date: '2024-01-20',
    stock: 0, // Not applicable for digital products
    price: 599.99,
    status: 'Active',
    image: '/products/product-1.webp',
  },
  {
    id: '5',
    name: 'Ergonomic Office Chair',
    code: 'EOC-GRY-005',
    type: 'Physical',
    date: '2024-04-12',
    stock: 0,
    price: 449.99,
    status: 'Disabled',
    image: '/products/product-1.webp',
  },
];

export const productStatuses: ProductStatus[] = ['Active', 'Disabled'];
export const productTypes: ProductType[] = ['Physical', 'Digital', 'Service', 'Subscription'];