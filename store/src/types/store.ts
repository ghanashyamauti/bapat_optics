export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_luxury?: boolean;
  is_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
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
  branch_stock?: Record<string, number>;
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

export interface FilterOption {
  label: string;
  value: string;
  count: number;
  hex_color?: string;
  icon?: string;
}

export interface MasterFilters {
  categories: FilterOption[];
  genders: FilterOption[];
  materials: FilterOption[];
  frame_types: FilterOption[];
  colours: FilterOption[];
  brands: FilterOption[];
  frame_shapes: FilterOption[];
  min_price: number;
  max_price: number;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  product: Product;
  quantity: number;
  lensType: string;
  lensPrice: number;
  prescriptionDetails?: string;
}

export interface LensPackage {
  id: string;
  name: string;
  brand: string;
  price: number;
  badge?: string;
  description: string;
  features: string[];
}
