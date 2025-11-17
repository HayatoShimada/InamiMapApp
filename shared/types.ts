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
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
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
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
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
    monday?: { open: string; close: string; closed: boolean };
    tuesday?: { open: string; close: string; closed: boolean };
    wednesday?: { open: string; close: string; closed: boolean };
    thursday?: { open: string; close: string; closed: boolean };
    friday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
  phone?: string;
  email?: string;
  closedDays?: string; // 定休日の説明
  // 臨時営業変更
  temporaryStatus?: {
    isTemporaryClosed: boolean; // 臨時休業中
    isReducedHours: boolean; // 時短営業中
    startDate?: Date; // 開始日
    endDate?: Date; // 終了日
    message?: string; // 顧客向けメッセージ
    temporaryHours?: WeeklyBusinessHours; // 時短営業時の営業時間
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  ownerUserId: string;
  shopId?: string; // 店舗に紐づかないイベントもある
  eventName: string;
  description: string;
  eventCategory: string; // イベントカテゴリ
  eventTimeStart: Date;
  eventTimeEnd: Date;
  location: string;
  participatingShops: string[]; // 複数ショップでのイベント対応
  images: string[]; // 最大5枚
  detailUrl?: string; // イベント詳細URL
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

export interface PublicFacility {
  id: string;
  name: string;
  description: string;
  facilityType: string; // 公共施設のタイプ
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  images: string[];
  website?: string;
  phone?: string;
  openingHours?: string;
  accessInfo?: string; // アクセス情報
  adminId: string; // 管理者ID
  isActive: boolean; // 表示/非表示
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

export const EVENT_CATEGORIES = {
  FESTIVAL: '祭り・イベント',
  WORKSHOP: 'ワークショップ',
  EXHIBITION: '展示・ギャラリー', 
  MARKET: 'マーケット・市場',
  PERFORMANCE: '公演・パフォーマンス',
  FOOD: 'グルメ・料理',
  CRAFT: '伝統工芸',
  NATURE: '自然・アウトドア',
  EDUCATION: '教育・学習',
  OTHER: 'その他',
} as const;

export const PUBLIC_FACILITY_TYPES = {
  GOVERNMENT: '行政施設',
  CULTURAL: '文化施設',
  SPORTS: 'スポーツ施設',
  EDUCATION: '教育施設',
  MEDICAL: '医療施設',
  WELFARE: '福祉施設',
  TRANSPORTATION: '交通施設',
  PARK: '公園・緑地',
  TOURIST: '観光施設',
  TEMPLE: '寺社仏閣',
  OTHER: 'その他',
} as const;

export type MapCategory = typeof MAP_CATEGORIES[keyof typeof MAP_CATEGORIES];
export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];
export type PublicFacilityType = typeof PUBLIC_FACILITY_TYPES[keyof typeof PUBLIC_FACILITY_TYPES];

// 営業時間関連
export interface BusinessHours {
  open: string; // "09:00" 形式
  close: string; // "17:00" 形式
  closed: boolean; // その日は休業日
}

export interface WeeklyBusinessHours {
  monday?: BusinessHours;
  tuesday?: BusinessHours;
  wednesday?: BusinessHours;
  thursday?: BusinessHours;
  friday?: BusinessHours;
  saturday?: BusinessHours;
  sunday?: BusinessHours;
}

export const WEEKDAYS = {
  monday: '月曜日',
  tuesday: '火曜日', 
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
} as const;

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}