import axios from 'axios';
import type { ApiResponse, AuthResponse, Product, Order, User } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const client = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ant_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err.response?.data?.message ?? 'Network error')
);

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (d: { first_name:string; last_name:string; email:string; password:string; phone_number?:string }) =>
    client.post<AuthResponse>('/auth/register', d).then(r => r.data),
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
  me: () => client.get<{ user: User }>('/auth/me').then(r => r.data),
};

// ── Products ──────────────────────────────────────────────────────
export const productApi = {
  list: (category?: string) =>
    client.get<ApiResponse<Product[]>>('/products', { params: category ? { category } : {} }).then(r => r.data.data ?? []),
  getBySlug: (slug: string) =>
    client.get<ApiResponse<Product>>(`/products/${slug}`).then(r => r.data.data!),
};

// ── Orders ────────────────────────────────────────────────────────
export const orderApi = {
  initiate: (d: { shipping_address: string; items: { variant_id: number; quantity: number }[] }) =>
    client.post<{ success:boolean; data: { order_id:number; reference:string; total_amount:number; authorization_url:string }}>('/orders/initiate', d).then(r => r.data.data!),
  myOrders: () =>
    client.get<ApiResponse<Order[]>>('/orders').then(r => r.data.data ?? []),
  verify: (reference: string) =>
    client.get<ApiResponse<Order>>(`/orders/verify/${reference}`).then(r => r.data.data!),
};
