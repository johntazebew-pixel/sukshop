export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  language: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface Product {
  id: number;
  name: string;
  nameAm: string;
  slug: string;
  description: string;
  descriptionAm: string;
  price: string;
  oldPrice?: string;
  stock: number;
  sku: string;
  storage?: string;
  color?: string;
  ram?: string;
  screenSize?: string;
  battery?: string;
  camera?: string;
  subcategoryId: number;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
  subcategory?: Subcategory;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  nameAm: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  nameAm: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId: number;
  category?: Category;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  product?: Product;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  admin?: { id: number; name: string };
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  total: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  notes?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  cancelReason?: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  user?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}