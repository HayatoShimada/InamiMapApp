import { Timestamp, GeoPoint } from 'firebase/firestore';

// Firestore用の型定義（Dateの代わりにTimestampを使用）
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'admin' | 'shop_owner';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
}

export interface FirestoreShop {
  id: string;
  ownerUserId: string;
  shopName: string;
  description: string;
  maniacPoint: string;
  location: GeoPoint;
  address: string;
  shopCategory: string;
  images: string[]; // 最大5枚
  approvalStatus?: 'pending' | 'approved' | 'rejected'; // 既存データ互換性のためオプショナル
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  // オンライン情報
  googleMapUrl?: string;
  website?: string;
  onlineStore?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    line?: string;
    youtube?: string;
  };
  // 連絡先・営業情報
  phone?: string;
  email?: string;
  closedDays?: string;
  businessHours?: WeeklyBusinessHours;
  // 提供サービス
  services?: string[];
  // 臨時営業変更
  temporaryStatus?: {
    isTemporaryClosed: boolean;
    isReducedHours: boolean;
    startDate?: Timestamp;
    endDate?: Timestamp;
    message?: string;
    temporaryHours?: WeeklyBusinessHours;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreEvent {
  id: string;
  ownerUserId: string;
  shopId?: string;
  eventName: string;
  description: string;
  eventCategory: string; // イベントカテゴリ
  eventTimeStart: Timestamp;
  eventTimeEnd: Timestamp;
  location: string;
  coordinates?: GeoPoint;
  googleMapUrl?: string;
  participatingShops: string[];
  images: string[]; // 最大5枚
  detailUrl?: string; // イベント詳細URL
  approvalStatus: 'pending' | 'approved' | 'rejected';
  eventProgress: 'scheduled' | 'cancelled' | 'ongoing' | 'finished';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMapLocation {
  id: string;
  name: string;
  description: string;
  location: GeoPoint;
  address: string;
  category: string;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreCategory {
  id: string;
  name: string;
  type: 'shop' | 'event' | 'map';
  createdAt: Timestamp;
}

// フォーム用の型定義
export interface EventFormData {
  eventName: string;
  description: string;
  eventCategory: string;
  eventTimeStart: Date;
  eventTimeEnd: Date;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  googleMapUrl?: string;
  shopId?: string;
  participatingShops: string[];
  images: File[];
  detailUrl?: string;
}

// 営業時間関連
export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
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

export interface ShopFormData {
  shopName: string;
  description: string;
  maniacPoint: string;
  address: string;
  shopCategory: string;
  location: GeoPoint;
  images: File[];
  // オンライン情報
  googleMapUrl?: string;
  website?: string;
  onlineStore?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    line?: string;
    youtube?: string;
  };
  // 連絡先・営業情報
  phone?: string;
  email?: string;
  closedDays?: string;
  businessHours?: WeeklyBusinessHours;
  // 提供サービス
  services?: string[];
  temporaryStatus?: {
    isTemporaryClosed: boolean;
    isReducedHours: boolean;
    startDate?: Date;
    endDate?: Date;
    message?: string;
    temporaryHours?: WeeklyBusinessHours;
  };
}

// イベント進行状況の日本語ラベル
export const EVENT_PROGRESS_LABELS = {
  scheduled: '予定',
  cancelled: '中止',
  ongoing: '開催中',
  finished: '終了',
} as const;

// 承認ステータスの日本語ラベル
export const APPROVAL_STATUS_LABELS = {
  pending: '承認待ち',
  approved: '承認済み',
  rejected: '却下',
} as const;

// イベントカテゴリ
export const EVENT_CATEGORIES = [
  '祭り・イベント',
  'ワークショップ',
  '展示・ギャラリー',
  'マーケット・市場',
  '公演・パフォーマンス',
  'グルメ・料理',
  '伝統工芸',
  '自然・アウトドア',
  '教育・学習',
  'その他',
] as const;

// 公共施設タイプ
export const PUBLIC_FACILITY_TYPES = [
  '行政施設',
  '文化施設',
  'スポーツ施設',
  '教育施設',
  '医療施設',
  '福祉施設',
  '交通施設',
  '公園・緑地',
  '観光施設',
  '寺社仏閣',
  'その他',
] as const;

// 店舗提供サービス
export const SHOP_SERVICES = [
  'トイレ利用可能',
  'モバイル充電可能',
  'ペット同伴可',
  '喫煙所あり',
  'おむつ交換台',
  'Wi-Fi利用可能',
  'クレジットカード対応',
  '電子マネー対応',
  'バリアフリー対応',
  '駐車場あり',
  '自転車置き場',
  'テイクアウト可能',
  '配達・デリバリー',
  '予約可能',
  'オンライン注文',
  '多言語対応',
  'その他',
] as const;

export interface FirestorePublicFacility {
  id: string;
  name: string;
  description: string;
  facilityType: string;
  location: GeoPoint;
  address: string;
  images: string[];
  website?: string;
  phone?: string;
  openingHours?: string;
  accessInfo?: string;
  adminId: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PublicFacilityFormData {
  name: string;
  description: string;
  facilityType: string;
  location: GeoPoint;
  address: string;
  images: File[];
  website?: string;
  phone?: string;
  openingHours?: string;
  accessInfo?: string;
}

// サービスアイコンマッピング
export const SERVICE_ICONS: Record<string, string> = {
  'トイレ利用可能': '🚻',
  'モバイル充電可能': '🔌',
  'ペット同伴可': '🐕',
  '喫煙所あり': '🚬',
  'おむつ交換台': '👶',
  'Wi-Fi利用可能': '📶',
  'クレジットカード対応': '💳',
  '電子マネー対応': '📱',
  'バリアフリー対応': '♿',
  '駐車場あり': '🅿️',
  '自転車置き場': '🚲',
  'テイクアウト可能': '🥡',
  '配達・デリバリー': '🚚',
  '予約可能': '📅',
  'オンライン注文': '🛒',
  '多言語対応': '🌐',
  'その他': '⭐',
} as const;