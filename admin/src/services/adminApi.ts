import axios from 'axios';
import type { CRMStats, Product, Inquiry, Order, Appointment } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('bapat_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens / 401 gracefully
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('bapat_admin_token');
      localStorage.removeItem('bapat_admin_user');
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = async (email: string, password: string) => {
  const response = await adminApi.post('/auth/login', { email, password });
  return response.data;
};

export const getCRMStats = async (): Promise<CRMStats> => {
  const response = await adminApi.get<CRMStats>('/crm/stats');
  return response.data;
};

export const fetchAdminProducts = async (search?: string, category?: string) => {
  const response = await adminApi.get('/products', {
    params: { search, categories: category, page_size: 100 }
  });
  return response.data;
};

export const createAdminProduct = async (productData: any) => {
  const response = await adminApi.post<Product>('/products', productData);
  return response.data;
};

export const updateAdminProduct = async (id: string, productData: any) => {
  const response = await adminApi.put<Product>(`/products/${id}`, productData);
  return response.data;
};

export const updateProductStock = async (id: string, stockQuantity: number) => {
  const response = await adminApi.patch<Product>(`/products/${id}/stock`, null, {
    params: { stock_quantity: stockQuantity }
  });
  return response.data;
};

export const deleteAdminProduct = async (id: string) => {
  await adminApi.delete(`/products/${id}`);
};

export const fetchMasterFilters = async () => {
  const response = await adminApi.get('/filters');
  return response.data;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const response = await adminApi.post<{ url: string }>('/uploads/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url.startsWith('http') ? response.data.url : `${adminApi.defaults.baseURL?.replace(/\/api\/v1$/, '')}${response.data.url}`;
};

export const uploadProductVideo = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const response = await adminApi.post<{ url: string }>('/uploads/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url.startsWith('http') ? response.data.url : `${adminApi.defaults.baseURL?.replace(/\/api\/v1$/, '')}${response.data.url}`;
};

export const fetchAdminInquiries = async (statusFilter?: string): Promise<Inquiry[]> => {
  const response = await adminApi.get<Inquiry[]>('/inquiries', {
    params: { status_filter: statusFilter }
  });
  return response.data;
};

export const updateInquiryStatus = async (id: string, status: string, notes?: string) => {
  const response = await adminApi.put(`/inquiries/${id}/status`, { status, notes });
  return response.data;
};

export const fetchAdminOrders = async (statusFilter?: string): Promise<Order[]> => {
  const response = await adminApi.get<Order[]>('/orders', {
    params: { status_filter: statusFilter }
  });
  return response.data;
};

export const updateOrderStatus = async (id: string, newStatus: string) => {
  const response = await adminApi.put(`/orders/${id}/status`, null, {
    params: { new_status: newStatus }
  });
  return response.data;
};

export const fetchAdminAppointments = async (branch?: string, statusFilter?: string): Promise<Appointment[]> => {
  const response = await adminApi.get<Appointment[]>('/appointments', {
    params: { branch, status_filter: statusFilter }
  });
  return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string, notes?: string) => {
  const response = await adminApi.put(`/appointments/${id}/status`, { status, notes });
  return response.data;
};

export const fetchCRMCustomers = async (): Promise<any[]> => {
  const response = await adminApi.get<any[]>('/crm/customers');
  return response.data;
};

export const downloadOrderInvoicePdf = async (orderId: string, orderNumber: string) => {
  const response = await adminApi.get(`/orders/invoice/${orderId}`, {
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

