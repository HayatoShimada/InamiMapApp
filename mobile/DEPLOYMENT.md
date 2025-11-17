# 井波マップアプリ - Flutter モバイルアプリデプロイメント

## アプリ概要

井波町の店舗やイベント情報を探索できるFlutterモバイルアプリです。

### 主な機能

✅ **Googleログイン認証**
- Firebase Authenticationによる安全なログイン
- ユーザー情報の自動保存

✅ **お気に入り機能**
- 店舗・イベントをお気に入りに追加/削除
- リアルタイム同期
- お気に入り統計表示

✅ **店舗・イベント閲覧**
- カテゴリー別フィルタリング
- 詳細情報表示
- 画像ギャラリー

✅ **地図表示**
- OpenStreetMapベースの地図
- 店舗・イベントマーカー表示
- フィルター機能

✅ **ユーザープロフィール**
- プロフィール情報表示
- アカウント管理

## 技術構成

### フレームワーク・言語
- **Flutter 3.0+** - クロスプラットフォームUIフレームワーク
- **Dart** - プログラミング言語

### Firebase Services
- **Firebase Auth** - Google認証
- **Cloud Firestore** - データベース
- **Firebase Storage** - 画像ストレージ

### 主要パッケージ
- `firebase_core` - Firebase初期化
- `firebase_auth` - 認証機能
- `google_sign_in` - Google Sign-In
- `cloud_firestore` - Firestoreデータベース
- `provider` - 状態管理
- `flutter_map` - 地図表示
- `cached_network_image` - 画像キャッシュ

## セットアップ手順

### 1. 前提条件

```bash
# Flutter SDKのインストール確認
flutter doctor

# 必要な依存関係をインストール
cd mobile
flutter pub get
```

### 2. Firebase設定

#### Android設定
1. Firebase Consoleでプロジェクトを選択
2. Android アプリを追加
3. パッケージ名: `com.inamimapapp.inami_map_app`
4. `google-services.json`をダウンロード
5. `mobile/android/app/google-services.json`に配置

#### iOS設定
1. Firebase ConsoleでiOS アプリを追加
2. Bundle ID: `com.inamimapapp.inamiMapApp`
3. `GoogleService-Info.plist`をダウンロード
4. `mobile/ios/Runner/GoogleService-Info.plist`に配置

### 3. Google Sign-In設定

#### Android
`mobile/android/app/build.gradle`に以下を追加済み:
```gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.6.0')
    implementation 'com.google.firebase:firebase-auth'
}
```

#### iOS
`mobile/ios/Runner/Info.plist`に認証設定済み

### 4. アプリの実行

```bash
# Android実行
flutter run --flavor development -t lib/main.dart

# iOS実行
flutter run --flavor development -t lib/main.dart

# リリースビルド
flutter build apk --release
flutter build ios --release
```

## ディレクトリ構造

```
mobile/
├── lib/
│   ├── main.dart                 # アプリエントリーポイント
│   ├── firebase_options.dart     # Firebase設定
│   ├── models/                   # データモデル
│   │   ├── user_model.dart
│   │   ├── shop_model.dart
│   │   ├── event_model.dart
│   │   └── favorite_model.dart
│   ├── providers/                # 状態管理
│   │   ├── auth_provider.dart
│   │   └── favorite_provider.dart
│   ├── services/                 # サービス層
│   │   ├── auth_service.dart
│   │   └── favorite_service.dart
│   ├── screens/                  # 画面
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── shop_list_screen.dart
│   │   ├── event_list_screen.dart
│   │   ├── favorite_screen.dart
│   │   ├── map_screen.dart
│   │   └── profile_screen.dart
│   └── widgets/                  # 再利用可能ウィジェット
│       └── favorite_button.dart
├── android/                      # Android設定
├── ios/                          # iOS設定
├── assets/                       # 静的リソース
└── pubspec.yaml                  # 依存関係定義
```

## 機能詳細

### 認証フロー
1. Googleアカウントでのログイン
2. Firebase Authenticationでの認証
3. ユーザー情報をFirestoreに保存
4. 認証状態の永続化

### お気に入り機能
1. 店舗・イベントごとのお気に入りボタン
2. リアルタイムでの同期
3. お気に入り一覧画面
4. 統計情報の表示

### 地図機能
1. OpenStreetMapを使用した地図表示
2. 店舗・イベントマーカーの表示
3. フィルター機能による表示切り替え
4. マーカータップで詳細表示

## デプロイメント

### Android
```bash
# APKビルド
flutter build apk --release

# App Bundleビルド (Play Store用)
flutter build appbundle --release
```

### iOS
```bash
# iOSビルド
flutter build ios --release
```

### 配布準備
1. **Android**: `build/app/outputs/flutter-apk/app-release.apk`
2. **iOS**: XcodeでアーカイブしてApp Store Connectにアップロード

## 今後の拡張予定

- [ ] プッシュ通知機能
- [ ] オフライン対応
- [ ] GPS連携でのナビゲーション機能
- [ ] ユーザーレビュー・評価機能
- [ ] ソーシャル共有機能

## トラブルシューティング

### よくある問題

1. **Firebase接続エラー**
   - `google-services.json`と`GoogleService-Info.plist`が正しく配置されているか確認
   - パッケージ名/Bundle IDが一致しているか確認

2. **Google Sign-Inエラー**
   - SHA-1フィンガープリントがFirebase Consoleに登録されているか確認
   - Google Sign-In設定が有効になっているか確認

3. **ビルドエラー**
   - `flutter clean && flutter pub get`を実行
   - Android Studio/Xcodeの最新版を使用

## サポート

問題や質問がある場合は、開発チームまでお気軽にお問い合わせください。