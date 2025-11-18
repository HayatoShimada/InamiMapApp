# 🔥 Firebase Console Setup for Mobile Apps

Webアプリと同一の `inami-map-app-prod` プロジェクトでモバイルアプリを設定します。

## 📱 設定手順

### 1. Firebase Console にアクセス
```
https://console.firebase.google.com/project/inami-map-app-prod
```

### 2. Android アプリを追加

#### 2-1. プロジェクト設定 → アプリを追加 → Android
- **Android パッケージ名**: `com.inamimapapp.inami_map_app`
- **アプリのニックネーム**: `InamiMapApp Android`
- **デバッグ用 SHA-1 証明書フィンガープリント**: 後で設定（任意）

#### 2-2. google-services.json をダウンロード
```bash
# ダウンロード後、以下に配置:
mobile/android/app/google-services.json
```

#### 2-3. App ID をメモ
```
形式: 1:504190906046:android:XXXXXXXX
```

### 3. iOS アプリを追加

#### 3-1. プロジェクト設定 → アプリを追加 → iOS
- **iOS バンドル ID**: `com.inamimapapp.inami-map-app`
- **アプリのニックネーム**: `InamiMapApp iOS` 
- **App Store ID**: 空欄（後で設定）

#### 3-2. GoogleService-Info.plist をダウンロード
```bash
# ダウンロード後、以下に配置:
mobile/ios/Runner/GoogleService-Info.plist
```

#### 3-3. App ID と iOS Client ID をメモ
```
App ID: 1:504190906046:ios:XXXXXXXX
iOS Client ID: 504190906046-XXXXXXXX.apps.googleusercontent.com
```

### 4. Authentication 設定

#### 4-1. Authentication → Sign-in method
- **Google** プロバイダーを有効化
- **プロジェクト公開名**: `井波マップアプリ`
- **サポートメール**: あなたのメールアドレス

#### 4-2. 承認済みドメイン
既存の設定を確認:
- `localhost`
- `inami-map-app-prod.web.app`
- `inami-map-app-prod.firebaseapp.com`

### 5. Firestore Database 確認
既存の設定で十分：
- **モード**: 本番
- **セキュリティルール**: 承認済み店舗のみ読み取り可能

### 6. Storage 確認  
既存の設定で十分：
- **公開読み取り**: 承認済み画像
- **アップロード**: 管理者のみ

## 📋 設定完了後の作業

### 1. App ID を firebase_options.dart に反映
```dart
// Android App ID
appId: '1:504190906046:android:YOUR_ANDROID_APP_ID_HERE',

// iOS App ID  
appId: '1:504190906046:ios:YOUR_IOS_APP_ID_HERE',

// iOS Client ID
iosClientId: '504190906046-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
```

### 2. 設定ファイルを配置
```bash
# Android
cp ~/Downloads/google-services.json mobile/android/app/

# iOS  
# XcodeでGoogleService-Info.plistをプロジェクトに追加
```

### 3. 接続テスト実行
```bash
cd mobile
flutter run
```

## 🔧 トラブルシューティング

### SHA-1 証明書取得（Android）
```bash
# デバッグ証明書
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# リリース証明書（後で設定）
keytool -list -v -keystore /path/to/release.keystore -alias release
```

### Google Sign-In エラー
1. Bundle ID / Package Name が正確か確認
2. App ID が正しく設定されているか確認
3. GoogleService ファイルが正しく配置されているか確認

### Firestore 接続エラー
1. プロジェクト ID が `inami-map-app-prod` か確認
2. セキュリティルールでモバイルアプリからの読み取りが許可されているか確認

## ✅ 設定完了チェック

- [ ] Android アプリ追加完了
- [ ] iOS アプリ追加完了  
- [ ] google-services.json 配置完了
- [ ] GoogleService-Info.plist 配置完了
- [ ] firebase_options.dart 更新完了
- [ ] Google認証プロバイダー有効化完了

設定完了後、Claude に App ID を伝えてください！