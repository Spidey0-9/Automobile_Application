export type Condition = 'Excellent' | 'Good' | 'Fair' | 'Needs repair';

export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'under_repair' | 'inactive';

export type VehicleCategory = 'motorcycle' | 'scooter' | 'car' | 'other';

export interface BikeBrand {
  id: string;
  name: string;
}

export interface BikeModel {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  engine_cc: number;
  variant?: string;
  category?: VehicleCategory;
}

export interface InventoryBike {
  id: string;
  business_id?: string;
  model_id?: string;
  brand: string;
  model: string;
  cc: number;
  variant?: string;
  category?: VehicleCategory;
  is_second_hand: boolean;
  manufacture_year?: number;
  odometer_km?: number;
  condition: Condition;
  condition_notes?: string;
  registration_number?: string;
  purchase_price?: number;
  selling_price: number;
  quantity: number;
  status: VehicleStatus;
  photo_urls: string[];
  created_at: string;
  updated_at?: string;
}

export interface ShopProfile {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  currency: string;
  is_onboarded: boolean;
}

export type NavigationDestination =
  | 'inventory'
  | 'catalogue'
  | 'customers'
  | 'sales'
  | 'service'
  | 'reports'
  | 'settings';
