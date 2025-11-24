# 井波マップアプリ Mobile (V4.1)

Flutter cross-platform mobile application for the InamiMapApp project - 富山県南砺市井波の街歩き支援アプリ

## 概要

井波マップアプリは、富山県南砺市井波の「個人店舗」「イベント」「公共施設」を発見し、**外から来た人が井波を堪能するための街歩き支援アプリ**です。

## V4.1 新機能

### 🆕 店舗提供サービス表示
- 17種類のサービス・設備情報をアイコン付きで表示
- トイレ、Wi-Fi、ペット可、駐車場など、利用者が知りたい情報を事前確認可能
- モバイルアプリでサービスChipとして表示

### 🆕 臨時営業ステータス表示
- 当日の短縮営業・臨時休業状況をリアルタイム表示
- 期間指定での営業変更に対応
- 店主からの顧客向けメッセージ表示

### 🆕 拡張された店舗情報
- こだわりポイントの表示
- 連絡先情報（電話、メール）
- 詳細営業時間・定休日情報
- 承認済み店舗のみ表示（品質管理）

## 主要機能

### 認証機能
- Google認証によるログイン
- ユーザープロファイル管理
- 承認済みユーザーのみアクセス可能

### お気に入り機能
- 店舗・イベントのお気に入り登録
- お気に入り一覧表示・管理
- リアルタイム同期

### 地図表示
- Google Maps SDK統合
- 承認済み店舗・イベントの表示
- 詳細情報表示

### 店舗・イベント閲覧
- カテゴリ別フィルタリング
- 検索機能
- 詳細情報モーダル表示

## 技術スタック

### Core Framework
- **Flutter**: 3.0.0以上
- **Firebase**: BaaS（認証、データベース、ストレージ）
- **Google Maps Flutter**: 地図機能
- **Provider**: 状態管理

### UI/UX
- **Material Design**: Googleデザインガイドライン準拠
- **Cached Network Image**: 画像キャッシュ最適化
- **Cupertino Icons**: iOS風アイコン

### Firebase Services
- **Firebase Auth**: Google認証
- **Cloud Firestore**: リアルタイムデータベース
- **Firebase Storage**: 画像ストレージ
- **Google Sign-In**: 認証プロバイダー

## セットアップ

### 前提条件
- Flutter SDK 3.0.0以上
- Android Studio / Xcode
- Android端末/エミュレータ または iOS端末/シミュレータ
- Firebase プロジェクト設定

### インストール手順

1. **依存関係の取得:**
   ```bash
   flutter pub get
   ```

2. **Firebase設定:**
   - `firebase_options.dart` をプロジェクトルートに配置
   - Android: `google-services.json`
   - iOS: `GoogleService-Info.plist`

3. **実行:**
   ```bash
   flutter run
   ```

## 利用可能コマンド

```bash
# 開発
flutter pub get          # 依存関係取得
flutter run              # デバッグ実行
flutter run --release    # リリースビルドで実行

# ビルド
flutter build apk         # Android APK
flutter build appbundle   # Android App Bundle
flutter build ios         # iOS アプリ

# 品質管理
flutter test              # テスト実行
flutter analyze           # 静的解析
flutter format .          # コードフォーマット
```

## プロジェクト構造

```
lib/
├── models/               # データモデル
│   ├── shop_model.dart   # 店舗モデル（V4.1更新）
│   ├── event_model.dart  # イベントモデル
│   ├── user_model.dart   # ユーザーモデル
│   └── favorite_model.dart # お気に入りモデル
├── screens/              # 画面
│   ├── home_screen.dart
│   ├── shop_list_screen.dart # 店舗一覧（V4.1更新）
│   ├── event_list_screen.dart
│   ├── favorite_screen.dart
│   ├── login_screen.dart
│   ├── map_screen.dart
│   └── profile_screen.dart
├── widgets/              # 再利用可能ウィジェット
│   ├── favorite_button.dart
│   ├── shop_services_widget.dart      # NEW: サービス表示
│   └── temporary_status_widget.dart   # NEW: 臨時営業ステータス
├── providers/            # 状態管理
│   ├── auth_provider.dart
│   ├── favorite_provider.dart
│   ├── location_provider.dart
│   └── map_data_provider.dart
├── services/             # 外部サービス
│   ├── api_service.dart
│   ├── auth_service.dart
│   └── favorite_service.dart
├── utils/                # ユーティリティ
│   └── service_icons.dart # NEW: サービスアイコン定義
├── firebase_options.dart # Firebase設定
└── main.dart             # アプリエントリーポイント
```

## V4.1 新機能詳細

### 提供サービス表示 (`ShopServicesWidget`)

```dart
// 使用例
ShopServicesWidget(
  services: shop.services,
  maxVisible: 4,  // 最大表示数
)
```

**対応サービス一覧:**
🚻 トイレ | 🔌 充電 | 🐕 ペット可 | 🚬 喫煙所 | 👶 おむつ台 | 📶 Wi-Fi | 💳 カード | 📱 電子マネー | ♿ バリアフリー | 🅿️ 駐車場 | 🚲 自転車 | 🥡 テイクアウト | 🚚 配達 | 📅 予約可 | 🛒 オンライン注文 | 🌐 多言語 | ⭐ その他

### 臨時営業ステータス (`TemporaryStatusWidget`)

```dart
// 使用例
TemporaryStatusWidget(
  temporaryStatus: shop.temporaryStatus,
)
```

- **当日判定**: 自動的に今日が対象期間かチェック
- **ステータス表示**: 臨時休業・時短営業の明確な表示
- **期間表示**: 開始日〜終了日の表示
- **メッセージ**: 店主からの顧客向けメッセージ

### データモデル更新

**ShopModel (V4.1):**
```dart
class ShopModel {
  // 基本情報
  final String shopName;
  final String description;
  final String maniacPoint;        // NEW: こだわりポイント
  
  // 営業情報
  final String? phone;             // NEW: 電話番号
  final String? email;             // NEW: メールアドレス
  final String? closedDays;        // NEW: 定休日情報
  final WeeklyBusinessHours? businessHours;  // NEW: 詳細営業時間
  
  // サービス情報
  final List<String>? services;    // NEW: 提供サービス
  final TemporaryStatus? temporaryStatus;  // NEW: 臨時営業変更
  
  // 承認管理
  final String approvalStatus;     // 承認状態管理
}
```

## Firebase セキュリティルール

承認済み店舗のみモバイルアプリで表示:

```javascript
// Firestore Rules (shops collection)
match /shops/{shopId} {
  allow read: if resource.data.approvalStatus == 'approved';
}
```

## デプロイメント

### Android

```bash
# リリースビルド
flutter build appbundle --release

# Play Storeアップロード準備
# build/app/outputs/bundle/release/app-release.aab
```

### iOS

```bash
# リリースビルド  
flutter build ios --release

# App Store Connect アップロード
# ios/Runner.xcworkspace をXcodeで開きArchive
```

## 設定ファイル

### Android (`android/app/build.gradle`)
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 2
        versionName "4.1.0"
    }
}
```

### iOS (`ios/Runner/Info.plist`)
```xml
<key>CFBundleVersion</key>
<string>2</string>
<key>CFBundleShortVersionString</key>
<string>4.1.0</string>
```

## 状態管理

Provider パターンを使用:
- `AuthProvider`: 認証状態管理
- `FavoriteProvider`: お気に入り管理
- `LocationProvider`: GPS位置情報
- `MapDataProvider`: マップデータ管理

## API 統合

- **エンドポイント**: Firebase Cloud Firestore
- **認証**: Firebase Authentication
- **画像**: Firebase Storage
- **リアルタイム同期**: Firestore Snapshot Listeners
- **エラーハンドリング**: 接続失敗時の適切な表示

## 品質管理

- **静的解析**: `flutter analyze`
- **コードフォーマット**: `flutter format`
- **テスト**: `flutter test` (将来追加予定)
- **承認フロー**: 管理者承認済みコンテンツのみ表示

## リリース履歴

- **V4.1.0** (2025/11/17): 提供サービス機能、臨時営業ステータス追加
- **V4.0.0**: 基本機能実装（店舗・イベント表示、お気に入り機能）

---

**開発者**: Claude Code + 85-Store  
**お問い合わせ**: X (旧Twitter) @85store  
**ライセンス**: MIT License (予定)