import axios from 'axios';
import type { MasterFilters, Product } from '../types/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bapat_customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept 401s: token expired → clear session and prompt re-login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bapat_customer_token');
      localStorage.removeItem('bapat_customer_user');
      // Dispatch a custom event so StoreContext can react
      window.dispatchEvent(new CustomEvent('bapat:session-expired'));
    }
    return Promise.reject(error);
  }
);

export const registerCustomer = async (data: { full_name: string; email: string; phone?: string; password: string }) => (await api.post('/auth/register', data)).data;
export const loginCustomer = async (email: string, password: string) => (await api.post('/auth/login', { email, password })).data;
export const fetchCurrentUserProfile = async () => (await api.get('/auth/me')).data;

export interface ProductQueryParams {
  categories?: string;
  brands?: string;
  genders?: string;
  materials?: string;
  frame_types?: string;
  colours?: string;
  frame_shapes?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const fetchFilters = async (): Promise<MasterFilters> => {
  const response = await api.get<MasterFilters>('/filters');
  return response.data;
};

export const fetchProducts = async (params: ProductQueryParams): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>('/products', { params });
  return response.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const submitInquiry = async (data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  product_id?: string;
  inquiry_type?: string;
  branch_preference?: string;
  message?: string;
}) => {
  const response = await api.post('/inquiries', data);
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const verifyPayment = async (verifyData: {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post('/orders/verify-payment', verifyData);
  return response.data;
};

export const bookAppointment = async (appointmentData: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  branch: string;
  appointment_date: string;
  time_slot: string;
  test_type?: string;
  notes?: string;
}) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const fetchMyOrders = async () => {
  const response = await api.get('/auth/me/orders');
  return response.data;
};

export const fetchMyAppointments = async () => {
  const response = await api.get('/auth/me/appointments');
  return response.data;
};

export const updateUserProfile = async (data: { full_name?: string; phone?: string }) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePassword = async (data: { old_password: string; new_password: string }) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

export const downloadInvoicePdf = async (orderId: string, orderNumber: string) => {
  const response = await api.get(`/orders/invoice/${orderId}`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Invoice_${orderNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

