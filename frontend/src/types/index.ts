export interface User {
  id: number; first_name: string; last_name: string;
  email: string; phone_number?: string; role: 'customer'|'admin'; created_at: string;
}
export interface ProductVariant {
  id: number; product_id: number; sku: string;
  size: 'S'|'M'|'L'|'XL'|'XXL'|'Custom'; color: string; stock_quantity: number;
}
export interface Product {
  id: number; name: string; slug: string; description: string;
  base_price: number; is_preorder: boolean;
  category: 'refined'|'raw'|'ankara';
  image_url?: string; created_at: string; variants: ProductVariant[];
}
export interface CartItem { product: Product; variant: ProductVariant; quantity: number; }
export interface ShippingAddress {
  full_name: string; phone: string; address: string; city: string; state: string;
}
export interface OrderItem {
  id: number; variant_id: number; quantity: number; price_at_purchase: number;
  variant_sku?: string; product_name?: string; size?: string; color?: string;
}
export interface Order {
  id: number; user_id: number; total_amount: number;
  order_status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled';
  payment_status: 'unpaid'|'paid'|'failed';
  payment_reference?: string; shipping_address: string;
  created_at: string; items?: OrderItem[];
}
export interface ApiResponse<T> { success: boolean; data?: T; message?: string; error?: string; }
export interface AuthResponse { token: string; user: User; }
