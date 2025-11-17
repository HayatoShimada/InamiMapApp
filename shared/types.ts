// Shared type definitions for InamiMapApp
// Used across backend, web frontend, and can be referenced by mobile

export interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category?: string;
  imageUrl?: string;
}

// Firebase用のデータ型定義
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'admin' | 'shop_owner';
  createdAt: Date;
}

export interface Shop {
  id: string;
  ownerUserId: string;
  shopName: string;
  description: string;
  maniacPoint: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  shopCategory: string;
  images: string[]; // 最大5枚
  // オンライン情報
  googleMapUrl?: string; // Googleマップリンク
  website?: string; // 公式ウェブサイト
  onlineStore?: string; // オンラインストア
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    line?: string;
    youtube?: string;
  };
  // 営業情報
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  phone?: string;
  email?: string;
  closedDays?: string; // 定休日の説明
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  ownerUserId: string;
  shopId?: string; // 店舗に紐づかないイベントもある
  eventName: string;
  description: string;
  eventTimeStart: Date;
  eventTimeEnd: Date;
  location: string;
  participatingShops: string[]; // 複数ショップでのイベント対応
  images: string[]; // 最大5枚
  approvalStatus: 'pending' | 'approved' | 'rejected';
  eventProgress: 'scheduled' | 'cancelled' | 'ongoing' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  category: string; // 'historical' | 'public_facility' | 'toilet' | 'parking' etc.
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'shop' | 'event' | 'map';
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SearchRequest {
  query: string;
  bounds?: MapBounds;
  category?: string;
  limit?: number;
}

export interface SearchResult {
  mapPoints: MapPoint[];
  total: number;
  hasMore: boolean;
}

// API endpoint types
export interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  environment: string;
  version?: string;
}

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Constants
export const MAP_CATEGORIES = {
  CULTURE: 'Culture',
  TEMPLE: 'Temple', 
  PARK: 'Park',
  FOOD_DRINK: 'Food & Drink',
  SHOPPING: 'Shopping',
  ACCOMMODATION: 'Accommodation',
  TRANSPORTATION: 'Transportation',
} as const;

export type MapCategory = typeof MAP_CATEGORIES[keyof typeof MAP_CATEGORIES];

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}