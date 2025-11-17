import { Timestamp } from 'firebase/firestore';

// Firestore用の型定義（Dateの代わりにTimestampを使用）
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'admin' | 'shop_owner';
  createdAt: Timestamp;
}

export interface FirestoreShop {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreEvent {
  id: string;
  ownerUserId: string;
  shopId?: string;
  eventName: string;
  description: string;
  eventTimeStart: Timestamp;
  eventTimeEnd: Timestamp;
  location: string;
  participatingShops: string[];
  images: string[]; // 最大5枚
  approvalStatus: 'pending' | 'approved' | 'rejected';
  eventProgress: 'scheduled' | 'cancelled' | 'ongoing' | 'finished';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMapLocation {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
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
  eventTimeStart: Date;
  eventTimeEnd: Date;
  location: string;
  shopId?: string;
  participatingShops: string[];
  images: File[];
}

export interface ShopFormData {
  shopName: string;
  description: string;
  maniacPoint: string;
  address: string;
  shopCategory: string;
  location: {
    latitude: number;
    longitude: number;
  };
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