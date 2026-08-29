export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'OPTOMETRIST';
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_luxury?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand_id: string;
  category_id: string;
  gender: string;
  material: string;
  frame_type: string;
  colour: string;
  frame_shape: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  lens_width: number;
  bridge_width: number;
  temple_length: number;
  dimensions_str: string;
  description?: string;
  primary_image: string;
  secondary_image?: string;
  video_url?: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
}

export interface Inquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  product_id?: string;
  inquiry_type: string;
  branch_preference: string;
  message?: string;
  prescription_url?: string;
  status: 'NEW' | 'CONTACTED' | 'TRIAL_BOOKED' | 'CONVERTED' | 'CLOSED';
  notes?: string;
  created_at: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  lens_type?: string;
  lens_price?: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_type: string;
  store_pickup_branch?: string;
  shipping_address?: string;
  city: string;
  pincode?: string;
  state: string;
  lens_selection_type: string;
  prescription_data?: string;
  prescription_file_url?: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: 'PENDING' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  branch: string;
  appointment_date: string;
  time_slot: string;
  test_type: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
}

export interface CRMStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  total_leads: number;
  new_leads: number;
  converted_leads: number;
  total_appointments: number;
  pending_appointments: number;
  total_products: number;
  out_of_stock_products: number;
  recent_inquiries: Inquiry[];
  recent_orders: Order[];
  recent_appointments: Appointment[];
}
