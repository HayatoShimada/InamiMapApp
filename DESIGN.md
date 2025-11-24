# 井波マップアプリ 設計書 (V4.1)

## 1. 概要

富山県南砺市井波の「個人店舗」「イベント」「公共施設」を発見し、**外から来た人が井波を堪能するための街歩き支援アプリ**。

ユーザーはWebアプリとFlutterモバイルアプリで情報を閲覧し、店主はWeb管理画面から店舗やイベントの情報を発信。85-Store（管理者）が情報の承認管理を行うことで、信頼性の高い情報を提供する。

**お問い合わせ**: 85-Store（オープンソース開発） | **プラットフォーム**: X (旧Twitter)

## 2. アーキテクチャ

- **バックエンド**: Firebase (BaaS)
- **Webフロントエンド**: React 18 + TypeScript + Material-UI + Vite
- **モバイルアプリ**: Flutter + Firebase SDK
- **地図**: Google Maps JavaScript API / Google Maps SDK
- **認証**: Firebase Authentication (Google認証)
- **デプロイ**: Firebase Hosting + Cloud Functions

## 3. 実装済み機能

### 3.1. Webアプリ（一般ユーザー向け）

#### **マップ機能**
- Google Maps統合で店舗・イベント・公共施設を表示
- カテゴリ別アイコンでの視覚的分類
- 現在地表示・検索機能
- 詳細情報表示（住所、営業時間、SNSリンク、画像）

#### **情報表示**
- **店舗詳細**: 説明、こだわりポイント、SNSリンク、営業時間、臨時営業変更、**提供サービス**
- **イベント詳細**: 日時、概要、カテゴリ、詳細URL、主催者、参加店舗
- **公共施設詳細**: 施設情報、アクセス情報、営業時間

#### **ユーザーフレンドリー機能**
- レスポンシブデザイン（モバイル対応）
- GoogleマップURLからの座標自動抽出（短縮URL対応）
- カレンダー形式の日付入力（Material-UI DatePicker）

### 3.2. モバイルアプリ（Flutter）

#### **認証機能**
- Google認証によるログイン
- ユーザープロファイル管理

#### **お気に入り機能**
- 店舗・イベントのお気に入り登録
- お気に入り一覧表示・管理
- リアルタイム同期

#### **地図表示**
- Google Maps SDK統合
- 承認済み店舗・イベントの表示
- 詳細情報表示

### 3.3. 店主向けWeb管理画面

#### **店舗管理**
- **基本情報**: 店舗名、説明、こだわりポイント、カテゴリ、住所
- **位置情報**: GoogleマップURL貼り付けで座標自動取得（短縮URL対応）
- **オンライン情報**: 公式サイト、オンラインストア、SNSアカウント
- **提供サービス・設備**:
  - 17種類のサービス選択式（トイレ、モバイル充電、ペット可等）
  - アイコン付きチェックボックスインターフェース
  - 選択済みサービスのChip表示とプレビュー
  - レスポンシブグリッドレイアウト
- **営業情報**: 
  - 構造化営業時間設定（曜日別開店・閉店時間）
  - 臨時営業変更（臨時休業・時短営業）
  - 期間指定・顧客向けメッセージ
  - リアルタイムプレビュー
- **画像**: 最大5枚のアップロード（自動リサイズ）
- **承認ステータス**: pending（承認待ち）→ approved（承認済み）

#### **イベント管理**
- **基本情報**: イベント名、説明、カテゴリ、開催期間
- **詳細情報**: 詳細URL、場所、参加店舗
- **承認フロー**: 申請 → 管理者承認 → 公開

#### **ダッシュボード**
- **店舗一覧**: 承認ステータス表示、編集・表示ボタン
- **時短営業設定**: ダッシュボードから簡単設定（モーダル）
  - 臨時休業・時短営業の選択
  - 開始日・終了日をカレンダーで選択
  - 顧客向けメッセージ入力
  - リアルタイムプレビュー
- **イベント一覧**: 進行状況・承認ステータス表示

### 3.4. 管理者機能

#### **ユーザー管理**
- 承認待ち・承認済み・却下ユーザーの管理
- ユーザー承認・却下（理由付き）
- 権限管理（一般ユーザー・管理者）

#### **店舗承認管理**
- **承認待ちタブ**: 新規店舗申請の一覧表示
- **店舗情報確認**: 店舗名、カテゴリ、住所、説明、こだわりポイント
- **承認・却下処理**: 
  - ワンクリック承認
  - 理由付き却下（モーダルダイアログ）
  - 処理後の自動更新

#### **イベント承認管理**
- 承認待ち・承認済み・却下イベントの管理
- イベント詳細確認・承認・却下

#### **公共施設管理**
- 公共施設の登録・編集・削除
- 表示・非表示の切り替え
- 施設タイプ別管理

### 3.5. システム機能

#### **認証・認可**
- Google認証統合
- 役割ベースアクセス制御（RBAC）
- ユーザー承認ワークフロー

#### **画像処理**
- Cloud Functions自動画像リサイズ
- 複数サイズ生成（サムネイル対応）
- Storage最適化

#### **通知システム**
- 新規登録・申請時の管理者通知
- 承認・却下時のユーザー通知
- メール通知（Nodemailer）

#### **URL処理**
- GoogleマップURL座標抽出
- 短縮URL（goo.gl）対応（Cloud Functions）
- 複数URLパターン対応

## 4. データベース設計 (Cloud Firestore)

### 4.1. ユーザー管理
```
/users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL?: string
  - role: 'admin' | 'shop_owner'
  - approvalStatus: 'pending' | 'approved' | 'rejected'  // ユーザー承認状態
  - approvedAt?: Timestamp      // 承認日時
  - rejectedAt?: Timestamp      // 却下日時
  - rejectionReason?: string    // 却下理由
  - createdAt: Timestamp
  - updatedAt?: Timestamp
```

### 4.2. 店舗管理
```
/shops/{shopId}
  - id: string
  - ownerUserId: string           // 店舗オーナーのUID
  - shopName: string
  - description: string
  - maniacPoint: string           // こだわりポイント
  - location: { latitude: number, longitude: number }
  - address: string
  - shopCategory: string
  - images: string[]              // 最大5枚のURL
  
  // 承認管理
  - approvalStatus: 'pending' | 'approved' | 'rejected'  // 店舗承認状態
  - approvedAt?: Timestamp        // 承認日時
  - rejectedAt?: Timestamp        // 却下日時
  - rejectionReason?: string      // 却下理由
  
  // オンライン情報
  - googleMapUrl?: string         // GoogleマップURL
  - website?: string              // 公式ウェブサイト
  - onlineStore?: string          // オンラインストア
  - socialMedia?: {
      instagram?: string
      twitter?: string            // X (旧Twitter)
      facebook?: string
      line?: string
      youtube?: string
    }
  
  // 営業情報
  - phone?: string
  - email?: string
  - closedDays?: string           // 定休日説明
  - businessHours?: WeeklyBusinessHours  // 構造化営業時間
  
  // 提供サービス
  - services?: string[]           // 利用者向けサービスリスト
  
  // 臨時営業変更
  - temporaryStatus?: {
      isTemporaryClosed: boolean  // 臨時休業フラグ
      isReducedHours: boolean     // 時短営業フラグ
      startDate?: Timestamp       // 開始日
      endDate?: Timestamp         // 終了日
      message?: string            // 顧客向けメッセージ
      temporaryHours?: WeeklyBusinessHours  // 時短時の営業時間
    }
  
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 4.3. イベント管理
```
/events/{eventId}
  - id: string
  - ownerUserId: string           // 申請者のUID
  - shopId?: string               // 関連店舗ID（任意）
  - eventName: string
  - description: string
  - eventCategory: string         // イベントカテゴリ
  - eventTimeStart: Timestamp     // 開始日時
  - eventTimeEnd: Timestamp       // 終了日時
  - location: string              // 開催場所
  - participatingShops: string[]  // 参加店舗IDリスト
  - images: string[]              // 最大5枚のURL
  - detailUrl?: string            // イベント詳細URL
  
  // 承認管理
  - approvalStatus: 'pending' | 'approved' | 'rejected'  // イベント承認状態
  - approvedAt?: Timestamp        // 承認日時
  - rejectedAt?: Timestamp        // 却下日時
  - rejectionReason?: string      // 却下理由
  
  // 進行管理
  - eventProgress: 'scheduled' | 'cancelled' | 'ongoing' | 'finished'
  
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 4.4. 公共施設管理
```
/publicFacilities/{facilityId}
  - id: string
  - name: string
  - description: string
  - facilityType: string          // 施設タイプ（行政施設、文化施設など）
  - location: { latitude: number, longitude: number }
  - address: string
  - images: string[]              // 施設画像URL
  - website?: string              // 公式ウェブサイト
  - phone?: string                // 連絡先電話番号
  - openingHours?: string         // 営業時間
  - accessInfo?: string           // アクセス情報
  - adminId: string               // 作成した管理者のUID
  - isActive: boolean             // 表示/非表示フラグ
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 4.5. お気に入り管理（Mobile）
```
/users/{userId}/favorites/{favoriteId}
  - id: string
  - shopId?: string               // お気に入り店舗ID
  - eventId?: string              // お気に入りイベントID
  - type: 'shop' | 'event'        // お気に入りタイプ
  - createdAt: Timestamp
```

### 4.6. 営業時間データ型

```typescript
// 営業時間の基本型
interface BusinessHours {
  open: string;                   // "09:00" 形式
  close: string;                  // "17:00" 形式
  closed: boolean;                // 休業日フラグ
}

// 週次営業時間
interface WeeklyBusinessHours {
  monday?: BusinessHours;         // 月曜日
  tuesday?: BusinessHours;        // 火曜日
  wednesday?: BusinessHours;      // 水曜日
  thursday?: BusinessHours;       // 木曜日
  friday?: BusinessHours;         // 金曜日
  saturday?: BusinessHours;       // 土曜日
  sunday?: BusinessHours;         // 日曜日
}

// 定数
const WEEKDAYS = {
  monday: '月曜日',
  tuesday: '火曜日', 
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
} as const;

// 提供サービス定義
const SHOP_SERVICES = [
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

// サービスアイコンマッピング
const SERVICE_ICONS: Record<string, string> = {
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
```

## 5. 承認ワークフロー

### 5.1. ユーザー承認フロー
```
新規ユーザー登録
    ↓
approvalStatus: 'pending'
    ↓
管理者による審査
    ↓
承認: 'approved' / 却下: 'rejected'
    ↓ 
アプリ機能利用可能 / ログイン不可
```

### 5.2. 店舗承認フロー
```
店舗情報登録・編集
    ↓
approvalStatus: 'pending'
    ↓
管理者による審査（店舗承認待ちタブ）
    ↓
承認: 'approved' / 却下: 'rejected'
    ↓
Webアプリ・モバイルアプリに表示 / 非表示
```

### 5.3. イベント承認フロー
```
イベント申請
    ↓
approvalStatus: 'pending'
    ↓
管理者による審査（イベント承認待ちタブ）
    ↓
承認: 'approved' / 却下: 'rejected'
    ↓
アプリに表示 / 非表示
```

## 6. 提供サービス機能詳細 (V4.1新機能)

### 6.1. 概要
利用者が店舗来店前に必要なサービスや設備を事前に確認できる機能。店主が簡単に設定でき、利用者の満足度向上とミスマッチの防止に貢献します。

### 6.2. 実装機能

#### **ServicesInputコンポーネント**
- 17種類のサービスをチェックボックスで選択
- アイコン付きサービス表示（絵文字使用）
- 選択済みサービスのChip表示とリアルタイムプレビュー
- レスポンシブグリッドレイアウト（xs=12, sm=6, md=4）
- ホバーエフェクトとフィードバック付き

#### **店舗フォーム統合**
- 「提供サービス・設備」セクションとして独立表示
- 新規登録時のサービス選択
- 編集時の既存サービス情報の正しい復元
- フォームバリデーションとエラーハンドリング

#### **表示機能**
- **ShopPreview**: アイコン付きChipでサービス表示
- **AdminPanel**: 承認画面でサービス情報の確認可能
- コンパクト表示とフル表示の切り替え
- 表示数制限と「+N」カウンター表示

### 6.3. サービス一覧

| サービス名 | アイコン | 説明 |
|:---|:---:|:---|
| トイレ利用可能 | 🚻 | 客用トイレあり |
| モバイル充電可能 | 🔌 | スマートフォン等の充電可能 |
| ペット同伴可 | 🐕 | ペットと一緒に入店可能 |
| 喫煙所あり | 🚬 | 専用喫煙スペースあり |
| おむつ交換台 | 👶 | 乳幼児用設備あり |
| Wi-Fi利用可能 | 📶 | 無料Wi-Fiサービス |
| クレジットカード対応 | 💳 | カード決済可能 |
| 電子マネー対応 | 📱 | QRコード決済等対応 |
| バリアフリー対応 | ♿ | 車椅子等でのアクセス可能 |
| 駐車場あり | 🅿️ | 車での来店可能 |
| 自転車置き場 | 🚲 | 自転車駐輪スペースあり |
| テイクアウト可能 | 🥡 | 持ち帰りサービス |
| 配達・デリバリー | 🚚 | 宅配サービス |
| 予約可能 | 📅 | 事前予約可能 |
| オンライン注文 | 🛒 | ウェブ経由注文可能 |
| 多言語対応 | 🌐 | 外国語対応スタッフ |
| その他 | ⭐ | 上記以外の独自サービス |

### 6.4. データ構造
```typescript
// サービスフィールド
services?: string[]  // オプショナルフィールド

// 例: データベースに保存される値
services: [
  'トイレ利用可能',
  'Wi-Fi利用可能',
  'クレジットカード対応',
  '駐車場あり'
]
```

### 6.5. ファイル構成
- `/web/src/types/firebase.ts`: サービス定義とアイコンマッピング
- `/web/src/components/ServicesInput.tsx`: サービス選択コンポーネント
- `/web/src/pages/ShopForm.tsx`: フォーム統合
- `/web/src/components/ShopPreview.tsx`: 表示機能
- `/web/src/pages/AdminPanel.tsx`: 管理者承認機能

## 7. 技術的な特徴

### 6.1. パフォーマンス最適化
- **バンドル分割**: Dynamic imports使用
- **画像最適化**: Cloud Functions自動リサイズ
- **キャッシュ戦略**: Firestore オフラインキャッシュ
- **レスポンシブ**: Material-UI Breakpoints

### 6.2. ユーザビリティ
- **日本語対応**: dayjs日本語ロケール
- **カレンダー入力**: Material-UI DatePicker
- **リアルタイムプレビュー**: 設定内容の即座確認
- **直感的UI**: Material Design準拠

### 6.3. 開発体験
- **TypeScript**: 型安全性確保
- **ESLint/Prettier**: コード品質管理
- **Hot Reload**: 開発時の高速フィードバック
- **Firebase Emulators**: ローカル開発環境

### 6.4. セキュリティ
- **Firebase Security Rules**: 役割ベースアクセス制御
- **データバリデーション**: クライアント・サーバー両側
- **認証**: Firebase Authentication統合
- **HTTPS**: 全通信の暗号化

## 7. デプロイメント

### 7.1. 本番環境
- **Webアプリ**: Firebase Hosting
- **API**: Cloud Functions for Firebase
- **データベース**: Cloud Firestore（本番モード）
- **ストレージ**: Cloud Storage for Firebase
- **モバイル**: Google Play Store / Apple App Store

### 7.2. CI/CD
- **ビルド**: npm run build（Vite）
- **デプロイ**: firebase deploy
- **バージョン管理**: Git + GitHub
- **イシュー管理**: GitHub Issues

## 8. 今後の拡張予定

### 8.1. 機能追加
- **多言語対応**: 英語・中国語・韓国語
- **プッシュ通知**: イベント開催通知
- **AR機能**: カメラ越しの店舗情報表示
- **レビュー機能**: ユーザー評価・コメント

### 8.2. 技術改善
- **パフォーマンス**: さらなる最適化
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **PWA**: オフライン対応強化
- **Analytics**: ユーザー行動分析

## 9. 開発・運営体制

### 9.1. 開発
- **オープンソース**: 85-Store主導
- **コミュニティ**: X（旧Twitter）での情報発信
- **ライセンス**: MIT License（予定）

### 9.2. 運営
- **管理者**: 85-Store
- **お問い合わせ**: X（@85store）
- **バグ報告**: GitHub Issues
- **フィードバック**: X または GitHub Discussions

---

## 実装完了済みIssue一覧

✅ Issue #1: イベント詳細URL機能  
✅ Issue #2: イベントカテゴリ機能  
✅ Issue #3: 連絡先を85-Storeに変更  
✅ Issue #4: オープンソース開発情報追加  
✅ Issue #5: 開発ドキュメント整理  
✅ Issue #6: ダッシュボード表示ボタン修正  
✅ Issue #7: GoogleマップURLチュートリアル  
✅ Issue #8: ユーザー承認システム  
✅ Issue #9: 店舗承認システム  
✅ Issue #10: TwitterからXへの変更  
✅ Issue #11: 公共施設登録システム  
✅ Issue #12: 営業時間正規化システム  
✅ Issue #13: 臨時休業・時短営業システム  

## 追加実装済み機能

✅ **短縮URL対応**: Googleマップgoo.glリンクの自動展開  
✅ **カレンダー入力**: 日付選択の改善（Material-UI DatePicker）  
✅ **管理者店舗承認**: 管理者画面での店舗承認・却下機能  
✅ **Webmap機能削除**: トップバーのマッププレビュー機能を完全削除  
✅ **店舗提供サービス**: 利用者向けサービス・設備情報管理機能  

---

**最終更新**: 2025年11月17日  
**バージョン**: V4.1  
**開発者**: Claude Code + 85-Store